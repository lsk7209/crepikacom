#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

const SITE_URL = "https://crepika.com";
const BLOG_FILE = "src/data/blog-content.ts";
const RECENT_META_FILE = "src/data/recent-blog-posts-meta.ts";
const PUBLISHER_ID = "pub-3050601904412736";
const ADSENSE_CLIENT = "ca-pub-3050601904412736";
const ADS_TXT_LINE = `google.com, ${PUBLISHER_ID}, DIRECT, f08c47fec0942fa0`;
const STATIC_PUBLIC_TOOL_IDS = new Set([
  "text-counter",
  "byte-counter",
  "lorem-generator",
  "webp-converter",
  "insta-spacer",
  "hashtag-mixer",
  "qr-generator",
]);

const failures = [];
const warnings = [];

function fail(message) {
  failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

function read(path) {
  return readFileSync(path, "utf8");
}

function requireFile(path) {
  if (!existsSync(path)) {
    fail(`Missing required file: ${path}`);
    return "";
  }
  return read(path);
}

function countMatches(value, pattern) {
  return (value.match(pattern) ?? []).length;
}

function extractXmlTags(source, tag) {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "g");
  return [...source.matchAll(re)].map((match) => match[1].trim());
}

function extractArrayLiteral(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) {
    fail(`Marker not found: ${marker}`);
    return "[]";
  }
  const assignmentIndex = source.indexOf("=", markerIndex);
  const start = source.indexOf("[", assignmentIndex);
  if (assignmentIndex === -1 || start === -1) {
    fail(`Array assignment not found for marker: ${marker}`);
    return "[]";
  }

  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === quote) quote = "";
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      continue;
    }
    if (ch === "[") depth++;
    if (ch === "]") depth--;
    if (depth === 0) return source.slice(start, i + 1);
  }

  fail(`Array end not found for marker: ${marker}`);
  return "[]";
}

function loadRenderablePosts() {
  const source = requireFile(BLOG_FILE);
  const arrayLiteral = extractArrayLiteral(source, "export const BLOG_POSTS");
  try {
    return vm
      .runInNewContext(`(${arrayLiteral})`, {})
      .filter((post) => post?.slug && post?.title && post?.content?.sections?.length)
      .sort((a, b) => String(a.publishDate).localeCompare(String(b.publishDate)));
  } catch (error) {
    fail(`Could not parse ${BLOG_FILE}: ${error instanceof Error ? error.message : error}`);
    return [];
  }
}

function listDirectories(path) {
  if (!existsSync(path)) return [];
  return readdirSync(path)
    .map((name) => join(path, name))
    .filter((entry) => statSync(entry).isDirectory())
    .map((entry) => entry.replace(/\\/g, "/").split("/").pop());
}

function listFilesByName(root, fileName) {
  if (!existsSync(root)) return [];
  const matches = [];
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    for (const name of readdirSync(current)) {
      const path = join(current, name);
      const stat = statSync(path);
      if (stat.isDirectory()) {
        stack.push(path);
      } else if (name === fileName) {
        matches.push(path);
      }
    }
  }
  return matches;
}

function hasMojibakeMarker(body) {
  return /[\uFFFD]|쨌|\?щ|\?대|\?댁|\?ъ|\?꾧/.test(body);
}

function validateTextEncoding(path) {
  const body = requireFile(path);
  if (hasMojibakeMarker(body)) {
    fail(`${path} contains mojibake markers; regenerate or fix UTF-8 source text.`);
  }
  return body;
}

function validatePublicFiles() {
  const ads = requireFile("public/ads.txt").trim();
  if (ads !== ADS_TXT_LINE) {
    fail(`ads.txt must contain exactly: ${ADS_TXT_LINE}`);
  }

  const robots = requireFile("public/robots.txt");
  if (!robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) {
    fail("robots.txt is missing the canonical sitemap URL.");
  }
  if (/User-agent:\s*\*\s*[\r\n]+Disallow:\s*\/\s*(?:[\r\n]|$)/i.test(robots)) {
    fail("robots.txt blocks all crawlers.");
  }
  for (const bot of ["Googlebot", "Bingbot", "Yeti", "NaverBot", "Daumoa", "GPTBot", "OAI-SearchBot"]) {
    if (!robots.includes(`User-agent: ${bot}`)) {
      warn(`robots.txt has no explicit section for ${bot}.`);
    }
  }

  const index = validateTextEncoding("index.html");
  if (!index.includes(`name="google-adsense-account" content="${ADSENSE_CLIENT}"`)) {
    fail("index.html is missing the google-adsense-account meta tag.");
  }
  const loaderCount = countMatches(index, new RegExp(`pagead2\\.googlesyndication\\.com/pagead/js/adsbygoogle\\.js\\?client=${ADSENSE_CLIENT}`, "g"));
  if (loaderCount !== 1) {
    fail(`index.html must load the AdSense Auto Ads script exactly once; found ${loaderCount}.`);
  }
  if (!index.includes(`<link rel="canonical" href="${SITE_URL}/"`)) {
    fail("index.html is missing the home canonical URL.");
  }
  if (!index.includes(`href="${SITE_URL}/rss.xml"`)) {
    fail("index.html is missing the RSS alternate link.");
  }
  if (!existsSync("public/feed.xml")) {
    fail("public/feed.xml is missing; keep a feed.xml alias for RSS client compatibility.");
  }
  const vercelConfig = requireFile("vercel.json");
  if (/\"source\"\s*:\s*\"\/feed\.xml\"/i.test(vercelConfig)) {
    fail("vercel.json must not redirect /feed.xml now that public/feed.xml is generated.");
  }
  if (!vercelConfig.includes("feed\\\\.xml")) {
    fail("vercel.json cache headers must include feed.xml.");
  }
  if (!vercelConfig.includes("/.well-known/security.txt")) {
    fail("vercel.json cache headers must include /.well-known/security.txt.");
  }

  const securityTxt = requireFile("public/.well-known/security.txt");
  for (const marker of [
    "Contact: mailto:support@crepika.com",
    "Preferred-Languages: ko, en",
    `Canonical: ${SITE_URL}/.well-known/security.txt`,
    `Policy: ${SITE_URL}/privacy`,
    "Expires: 2027-06-10T00:00:00Z",
  ]) {
    if (!securityTxt.includes(marker)) {
      fail(`security.txt is missing marker: ${marker}`);
    }
  }

  const manualAdSlotFiles = [];
  for (const root of ["src", "public"]) {
    const stack = [root];
    while (stack.length) {
      const current = stack.pop();
      for (const name of readdirSync(current)) {
        const path = join(current, name);
        const stat = statSync(path);
        if (stat.isDirectory()) {
          stack.push(path);
          continue;
        }
        if (!/\.(tsx?|html|mjs|js)$/.test(name)) continue;
        const body = read(path);
        if (/<ins[^>]+class=["'][^"']*adsbygoogle/i.test(body) || /adsbygoogle\.push\s*\(/.test(body)) {
          manualAdSlotFiles.push(path);
        }
      }
    }
  }
  if (manualAdSlotFiles.length) {
    fail(`Manual AdSense slots are present despite Auto Ads-only policy: ${manualAdSlotFiles.join(", ")}`);
  }
}

function validateCrawlerPage(path, canonicalUrl) {
  const body = validateTextEncoding(path);
  if (!body.includes(`<link rel="canonical" href="${canonicalUrl}">`)) {
    fail(`${path} is missing the expected canonical URL.`);
  }
  if (!/name="robots"\s+content="index,follow"/i.test(body)) {
    fail(`${path} is missing an index,follow robots meta tag.`);
  }
  for (const marker of [
    'name="description"',
    'property="og:title"',
    'property="og:description"',
    'property="og:url"',
    'name="google-adsense-account"',
    "pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
    'type="application/ld+json"',
  ]) {
    if (!body.includes(marker)) {
      fail(`${path} is missing crawler metadata marker: ${marker}`);
    }
  }
}

function validateStaticHtmlBasics() {
  for (const path of listFilesByName("public", "index.html")) {
    const body = validateTextEncoding(path);
    const hLevels = [...body.matchAll(/<h([1-6])\b/gi)].map((match) => Number(match[1]));
    const h1Count = hLevels.filter((level) => level === 1).length;

    if (!/<title>[^<]{10,}<\/title>/i.test(body)) {
      fail(`${path} is missing a meaningful title tag.`);
    }
    if (!/<meta\s+name="description"\s+content="[^"]{40,}"/i.test(body)) {
      fail(`${path} is missing a meaningful meta description.`);
    }
    if (!/<link\s+rel="canonical"\s+href="https:\/\/crepika\.com\//i.test(body)) {
      fail(`${path} is missing a canonical crepika.com URL.`);
    }
    if (h1Count !== 1) {
      fail(`${path} must have exactly one H1; found ${h1Count}.`);
    }
    if (hLevels[0] !== 1) {
      fail(`${path} heading hierarchy must start with H1.`);
    }

    for (let index = 1; index < hLevels.length; index++) {
      if (hLevels[index] > hLevels[index - 1] + 1) {
        fail(`${path} has a skipped heading level: H${hLevels[index - 1]} to H${hLevels[index]}.`);
        break;
      }
    }
  }
}

function validateSitemapAndRss(queue, posts) {
  const sitemap = requireFile("public/sitemap.xml");
  if (!sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) {
    fail("sitemap.xml is missing the expected XML declaration.");
  }
  if (!sitemap.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')) {
    fail("sitemap.xml is missing the sitemap namespace.");
  }
  const locs = extractXmlTags(sitemap, "loc");
  if (!locs.length) fail("sitemap.xml has no <loc> entries.");
  const duplicateLocs = locs.filter((loc, index) => locs.indexOf(loc) !== index);
  if (duplicateLocs.length) {
    fail(`sitemap.xml has duplicate URLs: ${[...new Set(duplicateLocs)].slice(0, 10).join(", ")}`);
  }
  for (const loc of locs) {
    if (!loc.startsWith(`${SITE_URL}/`)) {
      fail(`sitemap.xml contains a non-canonical host URL: ${loc}`);
    }
    if (/[?#]/.test(loc)) {
      fail(`sitemap.xml contains query or hash URL: ${loc}`);
    }
  }

  const readyOrDraft = queue.filter((item) => item.status !== "published");
  for (const item of readyOrDraft) {
    if (item.path && sitemap.includes(`${SITE_URL}${item.path}`)) {
      fail(`Non-published tool is exposed in sitemap.xml: ${item.id}`);
    }
    if (item.path && existsSync(join("public", ...item.path.split("/").filter(Boolean)))) {
      fail(`Non-published tool has a crawler-visible public directory: ${item.id}`);
    }
  }

  const published = queue.filter((item) => item.status === "published");
  for (const item of published) {
    if (item.path && !sitemap.includes(`${SITE_URL}${item.path}`)) {
      fail(`Published tool is missing from sitemap.xml: ${item.id}`);
    }
    if (item.path && !existsSync(join("public", ...item.path.split("/").filter(Boolean), "index.html"))) {
      fail(`Published tool is missing its crawler page: ${item.id}`);
    }
    if (item.path) {
      validateCrawlerPage(
        join("public", ...item.path.split("/").filter(Boolean), "index.html"),
        `${SITE_URL}${item.path}`,
      );
    }
  }

  const blogLocs = locs.filter((loc) => loc.startsWith(`${SITE_URL}/blog/`));
  if (blogLocs.length !== posts.length) {
    fail(`sitemap.xml blog URL count (${blogLocs.length}) does not match renderable posts (${posts.length}).`);
  }
  for (const post of posts) {
    const url = `${SITE_URL}/blog/${post.slug}`;
    if (!sitemap.includes(`<loc>${url}</loc>`)) {
      fail(`Renderable blog post is missing from sitemap.xml: ${post.slug}`);
    }
    validateCrawlerPage(join("public", "blog", post.slug, "index.html"), url);
  }

  const rss = requireFile("public/rss.xml");
  if (!rss.includes("<rss ") || !rss.includes("<channel>")) {
    fail("rss.xml is missing rss/channel tags.");
  }
  if (!rss.includes(`href="${SITE_URL}/rss.xml"`)) {
    fail("rss.xml is missing the atom self link.");
  }
  if (!rss.includes("<language>ko-KR</language>")) {
    fail("rss.xml must declare ko-KR language.");
  }
  const items = countMatches(rss, /<item>/g);
  if (items < 20) {
    fail(`rss.xml should expose a substantial recent feed; found ${items} items.`);
  }
  if (items > 100) {
    fail(`rss.xml should be capped at 100 items; found ${items}.`);
  }
  for (const post of posts.slice().reverse().slice(0, Math.min(20, posts.length))) {
    const url = `${SITE_URL}/blog/${post.slug}`;
    if (!rss.includes(`<link>${url}</link>`)) {
      fail(`Recent blog post is missing from rss.xml: ${post.slug}`);
    }
  }

  const feed = requireFile("public/feed.xml");
  if (!feed.includes("<rss ") || !feed.includes("<channel>")) {
    fail("feed.xml is missing rss/channel tags.");
  }
  if (!feed.includes(`href="${SITE_URL}/feed.xml"`)) {
    fail("feed.xml is missing the atom self link.");
  }
  if (!feed.includes("<language>ko-KR</language>")) {
    fail("feed.xml must declare ko-KR language.");
  }
  const feedItems = countMatches(feed, /<item>/g);
  if (feedItems !== items) {
    fail(`feed.xml item count (${feedItems}) must match rss.xml (${items}).`);
  }
  for (const post of posts.slice().reverse().slice(0, Math.min(20, posts.length))) {
    const url = `${SITE_URL}/blog/${post.slug}`;
    if (!feed.includes(`<link>${url}</link>`)) {
      fail(`Recent blog post is missing from feed.xml: ${post.slug}`);
    }
  }
}

function validateGeneratedIndexes(queue, posts) {
  const aiIndex = JSON.parse(validateTextEncoding("public/ai-index.json"));
  if (aiIndex?.site?.url !== SITE_URL) {
    fail("ai-index.json site.url does not match the canonical site URL.");
  }
  if (aiIndex?.site?.name_ko !== "크레피카") {
    fail("ai-index.json site.name_ko must be the readable Korean brand name.");
  }
  if (aiIndex?.blog?.rss !== `${SITE_URL}/rss.xml`) {
    fail("ai-index.json blog.rss does not match the canonical RSS URL.");
  }

  const llms = validateTextEncoding("public/llms.txt");
  const llmsFull = validateTextEncoding("public/llms-full.txt");
  for (const [path, body] of [["public/llms.txt", llms], ["public/llms-full.txt", llmsFull]]) {
    if (!body.includes(SITE_URL)) fail(`${path} is missing the canonical site URL.`);
    if (!body.includes(`${SITE_URL}/rss.xml`)) fail(`${path} is missing the RSS URL.`);
  }

  for (const path of ["public/rss.xml", "public/blog/index.html"]) {
    validateTextEncoding(path);
  }

  const shardDir = join("src", "data", "blog-posts");
  const shards = listDirectories(shardDir).length
    ? []
    : existsSync(shardDir)
      ? readdirSync(shardDir).filter((name) => name.endsWith(".json"))
      : [];
  if (!existsSync(shardDir)) {
    fail("src/data/blog-posts is missing generated per-post runtime shards.");
  } else if (shards.length !== posts.length) {
    fail(`Generated blog post shard count (${shards.length}) does not match renderable posts (${posts.length}).`);
  }
  for (const post of posts) {
    const shard = join(shardDir, `${post.slug}.json`);
    if (!existsSync(shard)) {
      fail(`Generated blog post shard is missing: ${post.slug}`);
      continue;
    }
    try {
      const body = JSON.parse(validateTextEncoding(shard));
      if (body.slug !== post.slug || body.title !== post.title || !body.content?.sections?.length) {
        fail(`Generated blog post shard does not match source post: ${post.slug}`);
      }
    } catch (error) {
      fail(`Generated blog post shard is not valid JSON: ${post.slug} (${error instanceof Error ? error.message : error})`);
    }
  }

  const recentMeta = validateTextEncoding(RECENT_META_FILE);
  for (const post of posts.slice().reverse().slice(0, Math.min(3, posts.length))) {
    if (!recentMeta.includes(`slug: ${JSON.stringify(post.slug)}`)) {
      fail(`${RECENT_META_FILE} is missing recent post: ${post.slug}`);
    }
  }

  const publicToolDirs = listDirectories("public/tools");
  const publishedIds = new Set(queue.filter((item) => item.status === "published").map((item) => item.id));
  const unexpectedDirs = publicToolDirs.filter((id) => !publishedIds.has(id) && !STATIC_PUBLIC_TOOL_IDS.has(id));
  if (unexpectedDirs.length) {
    fail(`public/tools contains non-published tool directories: ${unexpectedDirs.join(", ")}`);
  }
}

function validateIndexingAutomation() {
  const notifier = requireFile("scripts/notify-indexing.mjs");
  for (const marker of [
    "https://api.indexnow.org/indexnow",
    "https://searchadvisor.naver.com/indexnow",
    "https://www.bing.com/ping?sitemap=",
    "https://indexing.googleapis.com/v3/urlNotifications:publish",
    "https://www.googleapis.com/webmasters/v3/sites/",
  ]) {
    if (!notifier.includes(marker)) {
      fail(`notify-indexing.mjs is missing indexing endpoint: ${marker}`);
    }
  }

  for (const path of ["scripts/publish-once.mjs", "scripts/publish-tool-once.mjs"]) {
    const body = requireFile(path);
    if (!body.includes("scripts/notify-indexing.mjs")) {
      fail(`${path} must route scheduled indexing notifications through scripts/notify-indexing.mjs.`);
    }
    if (body.includes("searchadvisor.naver.com/site/submit")) {
      fail(`${path} still uses the stale Naver site submit URL instead of Naver IndexNow.`);
    }
  }
}

function validateToolPublicationAutomation() {
  const workflow = requireFile(".github/workflows/auto-publish-tools.yml");
  if (!workflow.includes('cron: "7 * * * *"')) {
    fail("auto-publish-tools.yml must run hourly so the five-hour gate can publish the next due tool.");
  }
  if (!workflow.includes('TOOL_PUBLISH_MIN_HOURS: "5"')) {
    fail("auto-publish-tools.yml must enforce TOOL_PUBLISH_MIN_HOURS=5.");
  }
  if (!workflow.includes("node scripts/publish-tool-once.mjs")) {
    fail("auto-publish-tools.yml must run scripts/publish-tool-once.mjs.");
  }
  for (const marker of ["npm ci", "cache: npm"]) {
    if (!workflow.includes(marker)) {
      fail(`auto-publish-tools.yml must include ${marker} so pre-push lint/build can run in GitHub Actions.`);
    }
  }

  const blogWorkflow = requireFile(".github/workflows/auto-publish.yml");
  for (const marker of ["npm ci", "cache: npm", "node scripts/publish-once.mjs"]) {
    if (!blogWorkflow.includes(marker)) {
      fail(`auto-publish.yml must include ${marker} so scheduled blog publication is dependency-backed.`);
    }
  }

  const blogPublisher = requireFile("scripts/publish-once.mjs");
  for (const marker of ["npm run lint", "npm run build"]) {
    if (!blogPublisher.includes(marker)) {
      fail(`scripts/publish-once.mjs must run ${marker} before committing scheduled publication changes.`);
    }
  }

  const toolPublisher = requireFile("scripts/publish-tool-once.mjs");
  for (const marker of ['runNpmScript("lint")', 'runNpmScript("build")']) {
    if (!toolPublisher.includes(marker)) {
      fail(`scripts/publish-tool-once.mjs must include ${marker} before committing scheduled tool changes.`);
    }
  }

  const bat = requireFile("scripts/start-scheduler.bat").replace(/\r\n/g, "\n");
  if (!bat.includes("cd /d D:\\web\\crepikacom")) {
    fail("start-scheduler.bat must point at the current D:\\web\\crepikacom workspace.");
  }
  if (!bat.includes("node scripts/publish-tool-once.mjs")) {
    fail("start-scheduler.bat must run the utility tool publisher, not the blog scheduler.");
  }

  const vbs = requireFile("scripts/start-scheduler.vbs");
  if (!vbs.includes("D:\\web\\crepikacom\\scripts\\start-scheduler.bat")) {
    fail("start-scheduler.vbs must launch the current workspace scheduler batch file.");
  }
}

function validateQualityAutomation() {
  const workflow = requireFile(".github/workflows/quality-gates.yml");
  for (const marker of [
    "push:",
    "pull_request:",
    "npm ci",
    "npm run lint",
    "npm run verify:seo",
    "npm run build",
  ]) {
    if (!workflow.includes(marker)) {
      fail(`quality-gates.yml must include ${marker}.`);
    }
  }

  for (const path of [
    ".github/workflows/quality-gates.yml",
    ".github/workflows/auto-publish.yml",
    ".github/workflows/auto-publish-tools.yml",
  ]) {
    const body = requireFile(path);
    for (const marker of ["actions/checkout@v6", "actions/setup-node@v6"]) {
      if (!body.includes(marker)) {
        fail(`${path} must use ${marker} so GitHub JavaScript actions target Node 24.`);
      }
    }
  }
}

function validateQueueCoverage(queue) {
  if (queue.length !== 100) {
    fail(`tool-queue.json should contain 100 planned tools; found ${queue.length}.`);
  }

  const ids = queue.map((item) => item.id);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length) {
    fail(`tool-queue.json has duplicate IDs: ${[...new Set(duplicateIds)].join(", ")}`);
  }

  const config = requireFile("src/data/tools-config.ts");
  const component = requireFile("src/tools/generated/SimpleGeneratedTool.tsx");
  const generatedContent = requireFile("src/data/generated-tool-content.ts");

  for (const item of queue) {
    if (!item.id || !item.path || !item.status) {
      fail(`Tool queue item has missing id/path/status: ${JSON.stringify(item)}`);
      continue;
    }
    if (!["published", "ready", "draft", "scheduled"].includes(item.status)) {
      fail(`Tool ${item.id} has an invalid status: ${item.status}`);
    }
    if (!config.includes(`id: '${item.id}'`) && !config.includes(`id: "${item.id}"`)) {
      fail(`Tool ${item.id} is missing from tools-config.ts.`);
    }
    if (!component.includes(`"${item.id}"`) && !component.includes(`'${item.id}'`)) {
      fail(`Tool ${item.id} is missing from SimpleGeneratedTool.tsx.`);
    }
    if (!generatedContent.includes(`"${item.id}"`) && !generatedContent.includes(`'${item.id}'`)) {
      fail(`Tool ${item.id} is missing generated detailed content.`);
    }
  }
}

function main() {
  const queue = JSON.parse(requireFile("scripts/tool-queue.json"));
  const posts = loadRenderablePosts();
  validatePublicFiles();
  validateStaticHtmlBasics();
  validateQueueCoverage(queue);
  validateSitemapAndRss(queue, posts);
  validateGeneratedIndexes(queue, posts);
  validateIndexingAutomation();
  validateToolPublicationAutomation();
  validateQualityAutomation();

  for (const message of warnings) {
    console.warn(`WARN ${message}`);
  }

  if (failures.length) {
    console.error("SEO gate verification failed:");
    for (const message of failures) {
      console.error(`- ${message}`);
    }
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        checks: {
          adsTxt: "ok",
          robots: "ok",
          sitemap: "ok",
          rss: "ok",
          feed: "ok",
          staticHtmlBasics: "ok",
          adsenseAutoAdsOnly: "ok",
          indexingAutomation: "ok",
          toolPublicationAutomation: "ok",
          qualityAutomation: "ok",
          toolQueue: queue.reduce((acc, item) => {
            acc[item.status] = (acc[item.status] || 0) + 1;
            return acc;
          }, {}),
        },
        warnings: warnings.length,
      },
      null,
      2,
    ),
  );
}

main();
