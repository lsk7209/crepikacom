import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ROADMAP_FILE = join(ROOT, "site-config", "tool-roadmap-100.json");
const QUEUE_FILE = join(ROOT, "scripts", "tool-queue.json");
const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;

function parseArgs() {
  const args = new Set(process.argv.slice(2));
  return {
    force: args.has("--force"),
    dryRun: args.has("--dry-run"),
  };
}

function parseStartDate() {
  const raw = process.env.TOOL_QUEUE_START_AT;
  if (!raw) return new Date();

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid TOOL_QUEUE_START_AT: ${raw}`);
  }
  return parsed;
}

function validateRoadmap(items) {
  if (!Array.isArray(items)) {
    throw new Error("Roadmap must be an array.");
  }
  if (items.length !== 100) {
    throw new Error(`Expected 100 roadmap items, got ${items.length}.`);
  }

  const ids = new Set();
  for (const item of items) {
    for (const key of ["order", "id", "category", "titleKo", "type", "intent", "priority"]) {
      if (item[key] === undefined || item[key] === "") {
        throw new Error(`Missing ${key} in roadmap item: ${JSON.stringify(item)}`);
      }
    }
    if (ids.has(item.id)) {
      throw new Error(`Duplicate tool id: ${item.id}`);
    }
    ids.add(item.id);
  }
}

function buildQueue(items, startAt) {
  return items.map((item, index) => ({
    ...item,
    status: "draft",
    scheduledAt: new Date(startAt.getTime() + index * FIVE_HOURS_MS).toISOString(),
    publishedAt: null,
    path: `/tools/${item.id}`,
  }));
}

function summarize(queue) {
  const byCategory = queue.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + 1;
    return acc;
  }, {});

  return {
    count: queue.length,
    first: {
      id: queue[0].id,
      scheduledAt: queue[0].scheduledAt,
    },
    last: {
      id: queue[queue.length - 1].id,
      scheduledAt: queue[queue.length - 1].scheduledAt,
    },
    byCategory,
  };
}

function main() {
  const { force, dryRun } = parseArgs();
  const roadmap = JSON.parse(readFileSync(ROADMAP_FILE, "utf-8"));
  validateRoadmap(roadmap);

  if (existsSync(QUEUE_FILE) && !force && !dryRun) {
    throw new Error("scripts/tool-queue.json already exists. Use --force to overwrite.");
  }

  const queue = buildQueue(roadmap, parseStartDate());
  const summary = summarize(queue);

  if (!dryRun) {
    writeFileSync(QUEUE_FILE, `${JSON.stringify(queue, null, 2)}\n`, "utf-8");
  }

  console.log(JSON.stringify(summary, null, 2));
}

main();
