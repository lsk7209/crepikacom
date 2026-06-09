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
const BRAND_NAME_KO = "\uD06C\uB808\uD53C\uCE74";
const READABLE_HOME_MARKERS = [BRAND_NAME_KO, "\uB85C\uADF8\uC778", "\uBB34\uB8CC"];
const FORBIDDEN_CRAWLER_SHELL_MARKERS = [
  "Table of contents",
  "Next step",
  "Site and review context",
  "Latest guides",
  "Useful links",
];
const STATIC_TRUST_PAGE_MARKERS = {
  "public/about/index.html": ["크레피카 소개", "무료 크리에이터 도구"],
  "public/contact/index.html": ["크레피카 문의", "정정 요청"],
  "public/privacy/index.html": ["개인정보처리방침", "Google AdSense"],
  "public/terms/index.html": ["이용약관", "광고 고지"],
  "public/blog/index.html": ["크레피카 블로그", "최신 가이드"],
};
const MOJIBAKE_MARKERS = [
  "\uFFFD",
  "\uCA0C",
  "?\u0449",
  "?\uB300",
  "?\uB301",
  "?\u044A",
  "?\uAFA7",
];
const STATIC_PUBLIC_TOOL_IDS = new Set([
  "text-counter",
  "byte-counter",
  "lorem-generator",
  "webp-converter",
  "insta-spacer",
  "hashtag-mixer",
  "qr-generator",
]);
const TOOL_ID_ALIASES = {
  "email-analytics": "ctr-calculator",
  "email-template": "text-counter",
  "hash-generator": "hashtag-mixer",
  "hashtag-generator": "hashtag-mixer",
  "instagram-spacer": "insta-spacer",
  "platform-compare": "utm-url-builder",
  "pricing-calculator": "adsense-rpm-calculator",
  "revenue-calculator": "adsense-rpm-calculator",
  "sns-analytics": "ctr-calculator",
  "sns-calendar": "utm-url-builder",
};
const REQUIRED_OG_IMAGE_PATHS = [
  "public/og-image.png",
  "public/images/og-guide.png",
  "public/images/og-tips.png",
  "public/images/og-insights.png",
  "public/images/og-case-study.png",
  "public/images/og-tool-plan.png",
  "public/images/og-tool-create.png",
  "public/images/og-tool-publish.png",
  "public/images/og-tool-analyze.png",
];

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

function extractJsonLdObjects(body, path) {
  const blocks = [
    ...body.matchAll(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ].map((match) => match[1].trim());

  if (!blocks.length) {
    fail(`${path} is missing JSON-LD structured data.`);
    return [];
  }

  const objects = [];
  for (const [index, block] of blocks.entries()) {
    try {
      const parsed = JSON.parse(block);
      objects.push(...(Array.isArray(parsed) ? parsed : [parsed]));
    } catch (error) {
      fail(`${path} has invalid JSON-LD block ${index + 1}: ${error instanceof Error ? error.message : error}`);
    }
  }
  return objects;
}

function hasJsonLdType(body, path, type) {
  return extractJsonLdObjects(body, path).some((entry) => entry?.["@type"] === type);
}

function extractXmlTags(source, tag) {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "g");
  return [...source.matchAll(re)].map((match) => match[1].trim());
}

function listDuplicateValues(values) {
  return values.filter((value, index) => values.indexOf(value) !== index);
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
  return MOJIBAKE_MARKERS.some((marker) => body.includes(marker));
}

function validateTextEncoding(path) {
  const body = requireFile(path);
  if (hasMojibakeMarker(body)) {
    fail(`${path} contains mojibake markers; regenerate or fix UTF-8 source text.`);
  }
  return body;
}

function readPngDimensions(path) {
  if (!existsSync(path)) {
    fail(`Missing required PNG image: ${path}`);
    return null;
  }
  const buffer = readFileSync(path);
  const pngSignature = "89504e470d0a1a0a";
  if (buffer.subarray(0, 8).toString("hex") !== pngSignature) {
    fail(`${path} must be a PNG image.`);
    return null;
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function validateImageAssets() {
  for (const path of REQUIRED_OG_IMAGE_PATHS) {
    const dimensions = readPngDimensions(path);
    if (!dimensions) continue;
    if (dimensions.width !== 1200 || dimensions.height !== 630) {
      fail(`${path} must be 1200x630 for social previews; got ${dimensions.width}x${dimensions.height}.`);
    }
  }
}

function validateSocialImageMeta(path, body) {
  const ogImage = body.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)?.[1] ?? "";
  const twitterImage = body.match(/<meta\s+name="twitter:image"\s+content="([^"]+)"/i)?.[1] ?? "";
  const ogAlt = body.match(/<meta\s+property="og:image:alt"\s+content="([^"]{6,})"/i)?.[1] ?? "";
  const twitterAlt = body.match(/<meta\s+name="twitter:image:alt"\s+content="([^"]{6,})"/i)?.[1] ?? "";

  if (!ogImage.startsWith(`${SITE_URL}/`) || !ogImage.endsWith(".png")) {
    fail(`${path} must use a canonical PNG og:image URL.`);
  }
  if (twitterImage !== ogImage) {
    fail(`${path} twitter:image must match og:image.`);
  }
  if (!body.includes('<meta property="og:image:type" content="image/png"')) {
    fail(`${path} must declare og:image:type image/png.`);
  }
  if (!body.includes('<meta property="og:image:width" content="1200"')) {
    fail(`${path} must declare og:image:width 1200.`);
  }
  if (!body.includes('<meta property="og:image:height" content="630"')) {
    fail(`${path} must declare og:image:height 630.`);
  }
  if (!ogAlt) {
    fail(`${path} must declare meaningful og:image:alt text.`);
  }
  if (!twitterAlt) {
    fail(`${path} must declare meaningful twitter:image:alt text.`);
  }
  if (ogAlt && twitterAlt && ogAlt !== twitterAlt) {
    fail(`${path} twitter:image:alt must match og:image:alt.`);
  }
}

function validatePublicFiles() {
  validateImageAssets();

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
  for (const marker of READABLE_HOME_MARKERS) {
    if (!index.includes(marker)) {
      fail(`index.html is missing readable Korean home marker: ${marker}.`);
    }
  }
  validateSocialImageMeta("index.html", index);
  if (!index.includes(`href="${SITE_URL}/rss.xml"`)) {
    fail("index.html is missing the RSS alternate link.");
  }
  if (!existsSync("public/feed.xml")) {
    fail("public/feed.xml is missing; keep a feed.xml alias for RSS client compatibility.");
  }
  const vercelConfig = requireFile("vercel.json");
  let parsedVercelConfig = null;
  try {
    parsedVercelConfig = JSON.parse(vercelConfig);
  } catch (error) {
    fail(`vercel.json is not valid JSON: ${error instanceof Error ? error.message : error}`);
  }
  const hasWwwPermanentRedirect = parsedVercelConfig?.redirects?.some(
    (redirect) =>
      redirect?.source === "/:path*" &&
      redirect?.destination === "https://crepika.com/:path*" &&
      redirect?.permanent === true &&
      redirect?.has?.some((condition) => condition?.type === "host" && condition?.value === "www.crepika.com"),
  );
  if (!hasWwwPermanentRedirect) {
    fail("vercel.json must permanently redirect www.crepika.com paths to the canonical apex host.");
  }
  for (const [legacyToolId, canonicalToolId] of Object.entries(TOOL_ID_ALIASES)) {
    const hasLegacyToolRedirect = parsedVercelConfig?.redirects?.some(
      (redirect) =>
        redirect?.source === `/tools/${legacyToolId}` &&
        redirect?.destination === `/tools/${canonicalToolId}` &&
        redirect?.permanent === true,
    );
    if (!hasLegacyToolRedirect) {
      fail(`vercel.json must permanently redirect /tools/${legacyToolId} to /tools/${canonicalToolId}.`);
    }
  }
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
  if (!/name="robots"\s+content="[^"]*index,follow/i.test(body)) {
    fail(`${path} is missing an index,follow robots meta tag.`);
  }
  if (!/name="robots"\s+content="[^"]*max-image-preview:large/i.test(body)) {
    fail(`${path} is missing max-image-preview:large for large image previews.`);
  }
  for (const marker of [
    'name="description"',
    'property="og:title"',
    'property="og:description"',
    'property="og:url"',
    'property="og:locale"',
    'property="og:image"',
    'property="og:image:type"',
    'property="og:image:width"',
    'property="og:image:height"',
    'property="og:image:alt"',
    'name="twitter:card"',
    'name="twitter:title"',
    'name="twitter:description"',
    'name="twitter:image"',
    'name="twitter:image:alt"',
    'name="google-adsense-account"',
    "pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
    'type="application/ld+json"',
  ]) {
    if (!body.includes(marker)) {
      fail(`${path} is missing crawler metadata marker: ${marker}`);
    }
  }
  if (!hasJsonLdType(body, path, "BreadcrumbList")) {
    fail(`${path} is missing BreadcrumbList structured data.`);
  }
  validateSocialImageMeta(path, body);
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
    if (!hasJsonLdType(body, path, "BreadcrumbList")) {
      fail(`${path} is missing BreadcrumbList structured data.`);
    }
    validateSocialImageMeta(path, body);
    if (h1Count !== 1) {
      fail(`${path} must have exactly one H1; found ${h1Count}.`);
    }
    if (hLevels[0] !== 1) {
      fail(`${path} heading hierarchy must start with H1.`);
    }
    for (const marker of FORBIDDEN_CRAWLER_SHELL_MARKERS) {
      if (body.includes(marker)) {
        fail(`${path} contains untranslated crawler shell marker: ${marker}`);
      }
    }

    for (const marker of STATIC_TRUST_PAGE_MARKERS[path] ?? []) {
      if (!body.includes(marker)) {
        fail(`${path} is missing required Korean trust-page marker: ${marker}`);
      }
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
  const duplicateLocs = listDuplicateValues(locs);
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
  const expectedRecentBlogUrls = posts
    .slice()
    .reverse()
    .slice(0, Math.min(100, posts.length))
    .map((post) => `${SITE_URL}/blog/${post.slug}`);
  const rssLinks = extractXmlTags(rss, "link").filter((link) => link.startsWith(`${SITE_URL}/blog/`));
  const rssGuids = extractXmlTags(rss, "guid").filter((guid) => guid.startsWith(`${SITE_URL}/blog/`));
  const duplicateRssLinks = listDuplicateValues(rssLinks);
  if (duplicateRssLinks.length) {
    fail(`rss.xml has duplicate item links: ${[...new Set(duplicateRssLinks)].slice(0, 10).join(", ")}`);
  }
  if (rssLinks.length !== expectedRecentBlogUrls.length) {
    fail(`rss.xml item link count (${rssLinks.length}) must match expected recent posts (${expectedRecentBlogUrls.length}).`);
  }
  for (const [index, url] of expectedRecentBlogUrls.entries()) {
    if (rssLinks[index] !== url) {
      fail(`rss.xml item ${index + 1} must be ${url}; got ${rssLinks[index] || "missing"}.`);
    }
    if (rssGuids[index] !== url) {
      fail(`rss.xml guid ${index + 1} must match its canonical link ${url}; got ${rssGuids[index] || "missing"}.`);
    }
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
  const feedLinks = extractXmlTags(feed, "link").filter((link) => link.startsWith(`${SITE_URL}/blog/`));
  const feedGuids = extractXmlTags(feed, "guid").filter((guid) => guid.startsWith(`${SITE_URL}/blog/`));
  const duplicateFeedLinks = listDuplicateValues(feedLinks);
  if (duplicateFeedLinks.length) {
    fail(`feed.xml has duplicate item links: ${[...new Set(duplicateFeedLinks)].slice(0, 10).join(", ")}`);
  }
  if (JSON.stringify(feedLinks) !== JSON.stringify(rssLinks)) {
    fail("feed.xml item links must exactly match rss.xml item links.");
  }
  if (JSON.stringify(feedGuids) !== JSON.stringify(rssGuids)) {
    fail("feed.xml item guids must exactly match rss.xml item guids.");
  }
  for (const url of rssLinks) {
    if (!locs.includes(url)) {
      fail(`RSS/feed item is missing from sitemap.xml: ${url}`);
    }
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
  if (aiIndex?.site?.name_ko !== BRAND_NAME_KO) {
    fail("ai-index.json site.name_ko must be the readable Korean brand name.");
  }
  if (aiIndex?.blog?.rss !== `${SITE_URL}/rss.xml`) {
    fail("ai-index.json blog.rss does not match the canonical RSS URL.");
  }
  if (aiIndex?.blog?.count !== posts.length) {
    fail(`ai-index.json blog.count (${aiIndex?.blog?.count}) does not match renderable posts (${posts.length}).`);
  }
  const expectedLatestUrls = posts
    .slice()
    .reverse()
    .slice(0, 12)
    .map((post) => `${SITE_URL}/blog/${post.slug}`);
  const aiLatestUrls = Array.isArray(aiIndex?.blog?.latest)
    ? aiIndex.blog.latest.map((post) => post?.url)
    : [];
  if (JSON.stringify(aiLatestUrls) !== JSON.stringify(expectedLatestUrls)) {
    fail("ai-index.json blog.latest URLs must match the 12 newest renderable posts.");
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

  const scheduleTimes = queue.map((item) => Date.parse(item.scheduledAt));
  for (const [index, time] of scheduleTimes.entries()) {
    if (!Number.isFinite(time)) {
      fail(`Tool ${queue[index]?.id ?? index} has an invalid scheduledAt value.`);
    }
  }
  for (let index = 1; index < scheduleTimes.length; index++) {
    const previous = scheduleTimes[index - 1];
    const current = scheduleTimes[index];
    if (!Number.isFinite(previous) || !Number.isFinite(current)) continue;
    const gapHours = (current - previous) / (60 * 60 * 1000);
    if (gapHours !== 5) {
      fail(
        `tool-queue.json must schedule tools exactly five hours apart; ${queue[index - 1].id} to ${queue[index].id} is ${gapHours}h.`,
      );
    }
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

function validateBlogRelatedTools(posts) {
  const config = requireFile("src/data/tools-config.ts");
  const configuredToolIds = new Set([...config.matchAll(/\bid:\s*["']([^"']+)["']/g)].map((match) => match[1]));
  const publishedToolIds = new Set([...STATIC_PUBLIC_TOOL_IDS, ...queuePublishedIds()]);

  for (const post of posts) {
    for (const rawToolId of post.relatedTools ?? []) {
      const resolvedToolId = TOOL_ID_ALIASES[rawToolId] ?? rawToolId;
      if (!configuredToolIds.has(resolvedToolId)) {
        fail(`Blog post ${post.slug} references unknown related tool: ${rawToolId}.`);
      }
      if (!publishedToolIds.has(resolvedToolId)) {
        fail(`Blog post ${post.slug} references an unpublished related tool: ${rawToolId}.`);
      }
    }
  }
}

function queuePublishedIds() {
  const queue = JSON.parse(requireFile("scripts/tool-queue.json"));
  return queue.filter((item) => item.status === "published").map((item) => item.id);
}

function main() {
  const queue = JSON.parse(requireFile("scripts/tool-queue.json"));
  const posts = loadRenderablePosts();
  validatePublicFiles();
  validateStaticHtmlBasics();
  validateQueueCoverage(queue);
  validateBlogRelatedTools(posts);
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
          blogRelatedTools: "ok",
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
