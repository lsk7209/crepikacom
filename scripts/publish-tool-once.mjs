#!/usr/bin/env node
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const QUEUE_FILE = join(ROOT, "scripts", "tool-queue.json");
const TOOLS_CONFIG_FILE = join(ROOT, "src", "data", "tools-config.ts");
const SYNC_SCRIPT = join(ROOT, "scripts", "sync-indexable-content.mjs");
const CRAWLER_SCRIPT = join(ROOT, "scripts", "generate-crawler-pages.mjs");
const MIN_HOURS = Number(process.env.TOOL_PUBLISH_MIN_HOURS || "5");
const FORCE = process.env.FORCE_TOOL_PUBLISH === "1";
const DRY_RUN = process.env.DRY_RUN === "1";

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf-8"));
}

function writeJson(file, data) {
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
}

function run(command) {
  return execSync(command, { cwd: ROOT, encoding: "utf-8", stdio: "pipe" }).trim();
}

function latestPublishedAt(queue) {
  const timestamps = queue
    .filter((item) => item.status === "published" && item.publishedAt)
    .map((item) => new Date(item.publishedAt).getTime())
    .filter((time) => !Number.isNaN(time));
  return timestamps.length ? Math.max(...timestamps) : 0;
}

function hoursSince(timestamp, now) {
  if (!timestamp) return Number.POSITIVE_INFINITY;
  return (now.getTime() - timestamp) / (60 * 60 * 1000);
}

function isImplemented(toolId) {
  const configSource = readFileSync(TOOLS_CONFIG_FILE, "utf-8");
  const componentSource = readFileSync(join(ROOT, "src", "tools", "generated", "SimpleGeneratedTool.tsx"), "utf-8");
  const contentSource = readFileSync(join(ROOT, "src", "data", "generated-tool-content.ts"), "utf-8");

  return {
    config: configSource.includes(`id: '${toolId}'`) || configSource.includes(`id: "${toolId}"`),
    component: componentSource.includes(`"${toolId}"`) || componentSource.includes(`'${toolId}'`),
    content: contentSource.includes(`"${toolId}"`) || contentSource.includes(`'${toolId}'`),
  };
}

function markToolConfigPublished(toolId) {
  const source = readFileSync(TOOLS_CONFIG_FILE, "utf-8");
  const marker = `id: '${toolId}'`;
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) throw new Error(`Tool config entry not found: ${toolId}`);

  const entryStart = source.lastIndexOf("\n  {", markerIndex);
  const nextEntry = source.indexOf("\n  {", markerIndex + marker.length);
  const entryEnd = nextEntry === -1 ? source.indexOf("\n];", markerIndex) : nextEntry;
  if (entryStart === -1 || entryEnd === -1) {
    throw new Error(`Could not isolate tool config entry: ${toolId}`);
  }

  const before = source.slice(0, entryStart);
  let entry = source.slice(entryStart, entryEnd);
  const after = source.slice(entryEnd);

  if (entry.includes("publicationStatus: 'published'")) return;
  if (entry.includes("publicationStatus: 'ready'")) {
    entry = entry.replace("publicationStatus: 'ready'", "publicationStatus: 'published'");
  } else if (entry.includes("publicationStatus: 'draft'")) {
    entry = entry.replace("publicationStatus: 'draft'", "publicationStatus: 'published'");
  } else {
    entry = entry.replace(/(path:\s*['\"][^'\"]+['\"],)/, "$1\n    publicationStatus: 'published',");
  }

  writeFileSync(TOOLS_CONFIG_FILE, `${before}${entry}${after}`, "utf-8");
}

function findNextPublishable(queue, now) {
  return queue.find((item) => {
    if (!["ready", "scheduled"].includes(item.status)) return false;
    if (FORCE) return true;
    if (!item.scheduledAt) return true;
    return new Date(item.scheduledAt).getTime() <= now.getTime();
  });
}

function gitHasStagedChanges() {
  try {
    execSync("git diff --cached --quiet", { cwd: ROOT, stdio: "ignore" });
    return false;
  } catch {
    return true;
  }
}

function commitAndPush(tool) {
  run('git config user.email "auto-publisher@crepika.com"');
  run('git config user.name "Crepika Auto Publisher"');
  run(
    [
      "git add",
      "scripts/tool-queue.json",
      "src/data/tools-config.ts",
      "public/sitemap.xml",
      "public/ai-index.json",
      "public/llms.txt",
      "public/llms-full.txt",
      `public/tools/${tool.id}`,
    ].join(" "),
  );

  if (!gitHasStagedChanges()) {
    console.log("No git changes after tool publication update.");
    return;
  }

  const messageArgs = [
    "-m",
    JSON.stringify(`Auto-publish utility tool ${tool.id}`),
    "-m",
    JSON.stringify("Expose one verified ready utility tool from the throttled five-hour publication queue."),
    "-m",
    JSON.stringify("Constraint: GitHub push is the deployment path; no direct Vercel deployment command is used."),
    "-m",
    JSON.stringify("Rejected: Publishing draft tools | Draft tools may be incomplete or low quality."),
    "-m",
    JSON.stringify("Confidence: high"),
    "-m",
    JSON.stringify("Scope-risk: narrow"),
    "-m",
    JSON.stringify("Directive: Only mark tools ready after implementation, sitemap, and crawler-page coverage exist."),
    "-m",
    JSON.stringify("Tested: publish-tool-once implementation guards passed; indexable content regenerated"),
    "-m",
    JSON.stringify("Not-tested: Live Vercel deployment is handled by GitHub integration after push"),
  ].join(" ");

  run(`git commit ${messageArgs}`);
  run("git push origin main");
}

function main() {
  if (!existsSync(QUEUE_FILE)) {
    throw new Error("Missing scripts/tool-queue.json");
  }

  const now = new Date();
  const queue = readJson(QUEUE_FILE);
  const lastPublished = latestPublishedAt(queue);
  const elapsedHours = hoursSince(lastPublished, now);

  if (!FORCE && elapsedHours < MIN_HOURS) {
    console.log(
      `Skip: only ${elapsedHours.toFixed(2)}h since last tool publication. Required: ${MIN_HOURS}h.`,
    );
    return;
  }

  const next = findNextPublishable(queue, now);
  if (!next) {
    console.log("Skip: no ready or scheduled tool is due for publication.");
    return;
  }

  const coverage = isImplemented(next.id);
  const missing = Object.entries(coverage)
    .filter(([, ok]) => !ok)
    .map(([key]) => key);
  if (missing.length) {
    throw new Error(`Tool ${next.id} is marked ${next.status} but missing coverage: ${missing.join(", ")}`);
  }

  if (DRY_RUN) {
    console.log(
      JSON.stringify(
        {
          wouldPublish: next.id,
          titleKo: next.titleKo,
          path: next.path,
          coverage,
          dryRun: true,
        },
        null,
        2,
      ),
    );
    return;
  }

  next.status = "published";
  next.publishedAt = now.toISOString();
  writeJson(QUEUE_FILE, queue);
  markToolConfigPublished(next.id);

  run("node scripts/sync-indexable-content.mjs");
  run("node scripts/generate-crawler-pages.mjs");

  console.log(
    JSON.stringify(
      {
        published: next.id,
        titleKo: next.titleKo,
        path: next.path,
        publishedAt: next.publishedAt,
        dryRun: false,
      },
      null,
      2,
    ),
  );

  commitAndPush(next);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
