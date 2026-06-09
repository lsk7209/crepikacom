#!/usr/bin/env node
import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import vm from "node:vm";

const SITE_URL = "https://crepika.com";
const BLOG_FILE = "src/data/blog-content.ts";
const META_FILE = "src/data/blog-posts-meta.ts";
const RECENT_META_FILE = "src/data/recent-blog-posts-meta.ts";
const RUNTIME_POSTS_DIR = "src/data/blog-posts";
const SITEMAP_FILE = "public/sitemap.xml";
const RSS_FILE = "public/rss.xml";
const FEED_FILE = "public/feed.xml";
const AI_INDEX_FILE = "public/ai-index.json";
const LLMS_FILE = "public/llms.txt";
const LLMS_FULL_FILE = "public/llms-full.txt";
const TOOL_QUEUE_FILE = "scripts/tool-queue.json";

const STATIC_CORE_URLS = [
  ["/", "weekly", "1.0"],
  ["/tools/text-counter", "monthly", "0.8"],
  ["/tools/byte-counter", "monthly", "0.8"],
  ["/tools/lorem-generator", "monthly", "0.7"],
  ["/tools/webp-converter", "monthly", "0.8"],
  ["/tools/insta-spacer", "monthly", "0.8"],
  ["/tools/hashtag-mixer", "monthly", "0.8"],
  ["/tools/qr-generator", "monthly", "0.8"],
  ["/tools/seo-title-length-checker", "monthly", "0.8"],
  ["/tools/meta-description-checker", "monthly", "0.8"],
  ["/tools/slug-generator", "monthly", "0.8"],
  ["/tools/utm-url-builder", "monthly", "0.8"],
  ["/tools/ctr-calculator", "monthly", "0.8"],
  ["/tools/adsense-rpm-calculator", "monthly", "0.8"],
  ["/about", "monthly", "0.6"],
  ["/contact", "monthly", "0.5"],
  ["/privacy", "yearly", "0.3"],
  ["/terms", "yearly", "0.3"],
  ["/editorial-policy", "yearly", "0.5"],
  ["/tool-data-policy", "yearly", "0.5"],
  ["/topics/seo", "weekly", "0.8"],
  ["/topics/instagram", "weekly", "0.8"],
  ["/topics/adsense", "weekly", "0.8"],
  ["/topics/creator-tools", "weekly", "0.8"],
  ["/blog", "daily", "0.9"],
];

function loadPublishedToolUrls() {
  try {
    const queue = JSON.parse(readFileSync(TOOL_QUEUE_FILE, "utf8"));
    return queue
      .filter((item) => item.status === "published" && item.path)
      .map((item) => [item.path, "monthly", "0.8"]);
  } catch {
    return [];
  }
}

const CORE_URLS = Array.from(
  new Map([...STATIC_CORE_URLS, ...loadPublishedToolUrls()].map((row) => [row[0], row])).values(),
);

function extractArrayLiteral(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) throw new Error(`Marker not found: ${marker}`);
  const assignmentIndex = source.indexOf("=", markerIndex);
  if (assignmentIndex === -1) throw new Error("Array assignment not found");
  const start = source.indexOf("[", assignmentIndex);
  if (start === -1) throw new Error("Array start not found");

  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === quote) {
        quote = "";
      }
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
  throw new Error("Array end not found");
}

function loadPosts() {
  const source = readFileSync(BLOG_FILE, "utf8");
  const arrayLiteral = extractArrayLiteral(source, "export const BLOG_POSTS");
  const posts = vm.runInNewContext(`(${arrayLiteral})`, {});
  return posts
    .filter((post) => post?.slug && post?.title && post?.content?.sections?.length)
    .sort((a, b) => String(a.publishDate).localeCompare(String(b.publishDate)));
}

function escXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function stripMarkdown(value) {
  return String(value ?? "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`>#-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function writeText(file, data) {
  mkdirSync(dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, data, "utf8");
  renameSync(tmp, file);
}

function resetGeneratedDirectory(path) {
  const target = resolve(path);
  const allowed = resolve("src/data/blog-posts");
  if (target !== allowed) {
    throw new Error(`Refusing to reset unexpected directory: ${path}`);
  }
  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });
}

function writeRuntimePostShards(posts) {
  resetGeneratedDirectory(RUNTIME_POSTS_DIR);
  for (const post of posts) {
    writeText(`${RUNTIME_POSTS_DIR}/${post.slug}.json`, `${JSON.stringify(post)}\n`);
  }
}

function writeMeta(posts) {
  const renderRows = (items) => items
    .slice()
    .reverse()
    .map((post) => {
      const keywords = `[${(post.keywords ?? []).map((keyword) => JSON.stringify(keyword)).join(", ")}]`;
      return [
        "  {",
        `    slug: ${JSON.stringify(post.slug)},`,
        `    title: ${JSON.stringify(post.title)},`,
        `    description: ${JSON.stringify(post.description ?? "")},`,
        `    category: ${JSON.stringify(post.category ?? "guide")},`,
        `    publishDate: ${JSON.stringify(post.publishDate ?? "")},`,
        `    readTime: ${JSON.stringify(post.readTime ?? "")},`,
        `    author: ${JSON.stringify(post.author ?? "")},`,
        `    keywords: ${keywords},`,
        "  },",
      ].join("\n");
    })
    .join("\n");
  const rows = renderRows(posts);

  writeText(
    META_FILE,
    `// AUTO-GENERATED by scripts/sync-indexable-content.mjs - do not edit manually

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishDate: string;
  readTime: string;
  author: string;
  keywords: string[];
}

export const blogPostsMeta: BlogPostMeta[] = [
${rows}
];

export function getAllBlogMeta(): BlogPostMeta[] {
  return [...blogPostsMeta];
}
`,
  );

  const recentRows = renderRows(posts.slice(-3));
  writeText(
    RECENT_META_FILE,
    `// AUTO-GENERATED by scripts/sync-indexable-content.mjs - do not edit manually
import type { BlogPostMeta } from "./blog-posts-meta";

export const recentBlogPostsMeta: BlogPostMeta[] = [
${recentRows}
];
`,
  );
}

function writeSitemap(posts) {
  const today = new Date().toISOString().slice(0, 10);
  const core = CORE_URLS.map(([path, changefreq, priority]) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join("\n");

  const blog = posts
    .slice()
    .reverse()
    .map((post) => `  <url>
    <loc>${SITE_URL}/blog/${escXml(post.slug)}</loc>
    <lastmod>${escXml(post.dateModified || post.publishDate || today)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`)
    .join("\n");

  writeText(
    SITEMAP_FILE,
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${core}
${blog}
</urlset>
`,
  );
}

function buildRss(posts, selfUrl) {
  const newestPost = posts[posts.length - 1];
  const lastBuildDate = new Date(newestPost?.publishDate || "2026-01-01").toUTCString();
  const items = posts
    .slice()
    .reverse()
    .slice(0, 100)
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`;
      const date = new Date(post.publishDate || Date.now()).toUTCString();
      return `  <item>
    <title>${escXml(post.title)}</title>
    <link>${url}</link>
    <guid>${url}</guid>
    <pubDate>${date}</pubDate>
    <dc:creator>${escXml(post.author || "Crepika")}</dc:creator>
    <category>${escXml(post.category || "guide")}</category>
    <description>${escXml(post.description || "")}</description>
  </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
  <title>Crepika Blog</title>
  <link>${SITE_URL}/blog</link>
  <description>SEO, SNS marketing, and creator workflow guides for Korean creators.</description>
  <language>ko-KR</language>
  <lastBuildDate>${lastBuildDate}</lastBuildDate>
  <atom:link href="${selfUrl}" rel="self" type="application/rss+xml" />
${items}
</channel>
</rss>
`;
}

function writeRss(posts) {
  writeText(RSS_FILE, buildRss(posts, `${SITE_URL}/rss.xml`));
  writeText(FEED_FILE, buildRss(posts, `${SITE_URL}/feed.xml`));
}

function writeAiFiles(posts) {
  const latest = posts.slice().reverse().slice(0, 12);
  const updated = new Date().toISOString().slice(0, 10);
  const aiIndex = {
    site: {
      name: "Crepika",
      name_ko: "크레피카",
      url: SITE_URL,
      description: "Free browser-based creator tools plus SEO and SNS content guides for Korean creators.",
      locale: "ko_KR",
      topics: ["creator tools", "SEO", "SNS marketing", "content creation"],
      updated,
    },
    tools: CORE_URLS.filter(([path]) => path.startsWith("/tools/")).map(([path]) => ({
      id: path.split("/").pop(),
      url: `${SITE_URL}${path}`,
    })),
    blog: {
      url: `${SITE_URL}/blog`,
      rss: `${SITE_URL}/rss.xml`,
      hubs: [
        `${SITE_URL}/topics/seo`,
        `${SITE_URL}/topics/instagram`,
        `${SITE_URL}/topics/adsense`,
        `${SITE_URL}/topics/creator-tools`,
      ],
      categories: ["guide", "tips", "insights", "case-study"],
      count: posts.length,
      latest: latest.map((post) => ({
        title: post.title,
        url: `${SITE_URL}/blog/${post.slug}`,
        description: post.description,
        date: post.publishDate,
      })),
    },
  };
  writeText(AI_INDEX_FILE, `${JSON.stringify(aiIndex, null, 2)}\n`);

  const latestLines = latest
    .map((post) => `- [${post.title}](${SITE_URL}/blog/${post.slug}): ${stripMarkdown(post.description).slice(0, 140)}`)
    .join("\n");
  const queuedToolLines = CORE_URLS.filter(
    ([path]) => path.startsWith("/tools/") && !STATIC_CORE_URLS.some(([staticPath]) => staticPath === path),
  )
    .map(([path]) => `- [${path.split("/").pop()}](${SITE_URL}${path})`)
    .join("\n");
  const queuedToolSection = queuedToolLines ? `\n${queuedToolLines}` : "";
  const llms = `# Crepika

> Free browser-based creator tools plus SEO and SNS content guides for Korean creators.

## Site Overview

Crepika provides text counting, Korean byte counting, WebP conversion, QR code generation, Instagram line-break formatting, and hashtag mixing tools. Core processing happens in the browser and can be used without login.

## Tools

- [Text Counter](${SITE_URL}/tools/text-counter)
- [Korean Byte Counter](${SITE_URL}/tools/byte-counter)
- [Lorem Generator](${SITE_URL}/tools/lorem-generator)
- [WebP Converter](${SITE_URL}/tools/webp-converter)
- [Instagram Spacer](${SITE_URL}/tools/insta-spacer)
- [Hashtag Mixer](${SITE_URL}/tools/hashtag-mixer)
- [QR Code Generator](${SITE_URL}/tools/qr-generator)
- [SEO Title Length Checker](${SITE_URL}/tools/seo-title-length-checker)
- [Meta Description Checker](${SITE_URL}/tools/meta-description-checker)
- [URL Slug Generator](${SITE_URL}/tools/slug-generator)
- [UTM URL Builder](${SITE_URL}/tools/utm-url-builder)
- [CTR Calculator](${SITE_URL}/tools/ctr-calculator)
- [AdSense RPM Calculator](${SITE_URL}/tools/adsense-rpm-calculator)${queuedToolSection}

## Blog

Renderable blog posts: ${posts.length}

Latest posts:
${latestLines}

## Index Resources

- Home: ${SITE_URL}
- Blog: ${SITE_URL}/blog
- SEO Hub: ${SITE_URL}/topics/seo
- Instagram Hub: ${SITE_URL}/topics/instagram
- AdSense Hub: ${SITE_URL}/topics/adsense
- Creator Tools Hub: ${SITE_URL}/topics/creator-tools
- RSS: ${SITE_URL}/rss.xml
- Sitemap: ${SITE_URL}/sitemap.xml
- Contact: ${SITE_URL}/contact

Updated: ${updated}
`;
  writeText(LLMS_FILE, llms);
  writeText(
    LLMS_FULL_FILE,
    `${llms}
## All Renderable Blog URLs

${posts.map((post) => `- ${SITE_URL}/blog/${post.slug} - ${post.title}`).join("\n")}
`,
  );
}

const posts = loadPosts();
writeMeta(posts);
writeRuntimePostShards(posts);
writeSitemap(posts);
writeRss(posts);
writeAiFiles(posts);
console.log(`Synced ${posts.length} renderable posts to meta, runtime shards, sitemap, RSS, and AI index files.`);
