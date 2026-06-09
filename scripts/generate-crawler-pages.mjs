import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { readFileSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const siteUrl = "https://www.crepika.com";

const staticPages = [
  {
    path: "about/index.html",
    title: "About Crepika | Free Creator Tools",
    description: "Crepika provides free browser-based tools and practical publishing guides for Korean creators, marketers, bloggers, and small teams.",
    canonical: `${siteUrl}/about`,
    heading: "About Crepika",
    body: [
      "Crepika is a utility site for creators who need quick production checks without a login step.",
      "The site focuses on text counting, Korean byte checks, WebP conversion, QR code generation, Instagram line-break formatting, hashtag mixing, and practical publishing guides.",
    ],
  },
  {
    path: "contact/index.html",
    title: "Contact Crepika",
    description: "Contact Crepika for service questions, correction requests, bug reports, and creator tool suggestions.",
    canonical: `${siteUrl}/contact`,
    heading: "Contact",
    body: [
      "For corrections, service questions, and tool suggestions, contact support@crepika.com.",
      "When reporting a bug, include the page URL, browser, device, and a short description of the expected result.",
    ],
  },
  {
    path: "privacy/index.html",
    title: "Privacy Policy | Crepika",
    description: "Crepika privacy policy covering browser-side tool processing, analytics, cookies, and Google AdSense.",
    canonical: `${siteUrl}/privacy`,
    heading: "Privacy Policy",
    body: [
      "Crepika is designed so core tool inputs are processed in the browser whenever possible.",
      "The site may use analytics and Google AdSense cookies to understand usage and support free access to the tools.",
      "Users should avoid entering sensitive personal information into online tools unless it is necessary and they understand the privacy implications.",
    ],
  },
  {
    path: "terms/index.html",
    title: "Terms of Use | Crepika",
    description: "Crepika terms of use for free online creator tools, acceptable use, limitations, and advertising disclosure.",
    canonical: `${siteUrl}/terms`,
    heading: "Terms of Use",
    body: [
      "Crepika tools are provided as free productivity aids. Users are responsible for reviewing outputs before publishing.",
      "Do not use the site to infringe rights, process unlawful material, attack the service, or bypass platform rules.",
    ],
  },
  {
    path: "blog/index.html",
    title: "Crepika Blog | SEO and Creator Workflow Guides",
    description: "Browse Crepika guides about SEO, SNS marketing, image optimization, content workflows, and free creator tools.",
    canonical: `${siteUrl}/blog`,
    heading: "Crepika Blog",
    body: [
      "The Crepika blog covers practical SEO, SNS marketing, creator workflow, image optimization, and publishing topics.",
      "Each article is linked from the sitemap and RSS feed so crawlers can discover the full content archive.",
    ],
  },
];

const toolPages = [
  ["tools/text-counter/index.html", "Text Counter | Crepika", "Count characters, words, lines, and spacing for titles, captions, blog drafts, and meta descriptions.", `${siteUrl}/tools/text-counter`, "Text Counter"],
  ["tools/byte-counter/index.html", "Korean Byte Counter | Crepika", "Check UTF-8 byte length for Korean and English text used in platform fields, SMS, and metadata.", `${siteUrl}/tools/byte-counter`, "Korean Byte Counter"],
  ["tools/lorem-generator/index.html", "Lorem Generator | Crepika", "Generate placeholder text for layout checks, mockups, cards, and page drafts.", `${siteUrl}/tools/lorem-generator`, "Lorem Generator"],
  ["tools/webp-converter/index.html", "WebP Converter | Crepika", "Convert image assets to WebP in the browser to support lighter pages and better publishing workflows.", `${siteUrl}/tools/webp-converter`, "WebP Converter"],
  ["tools/insta-spacer/index.html", "Instagram Spacer | Crepika", "Format Instagram captions with cleaner line breaks and readable paragraph spacing.", `${siteUrl}/tools/insta-spacer`, "Instagram Spacer"],
  ["tools/hashtag-mixer/index.html", "Hashtag Mixer | Crepika", "Mix hashtag groups, reduce repetition, and prepare SNS post tag sets faster.", `${siteUrl}/tools/hashtag-mixer`, "Hashtag Mixer"],
  ["tools/qr-generator/index.html", "QR Code Generator | Crepika", "Create QR codes for URLs and short text without a login step.", `${siteUrl}/tools/qr-generator`, "QR Code Generator"],
].map(([path, title, description, canonical, heading]) => ({
  path,
  title,
  description,
  canonical,
  heading,
  body: [
    description,
    "Use this page as a practical browser tool, then review the output before publishing it to a live platform.",
    "Related pages, privacy information, and contact details are linked in the navigation for crawler and user clarity.",
  ],
}));

function extractArrayLiteral(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) throw new Error(`Marker not found: ${marker}`);
  const assignmentIndex = source.indexOf("=", markerIndex);
  const start = source.indexOf("[", assignmentIndex);
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
  throw new Error("Array end not found");
}

function loadPosts() {
  const source = readFileSync(join(root, "src/data/blog-content.ts"), "utf8");
  const arrayLiteral = extractArrayLiteral(source, "export const BLOG_POSTS");
  const posts = vm.runInNewContext(`(${arrayLiteral})`, {});
  return posts.filter((post) => post?.slug && post?.title && post?.content?.sections?.length);
}

function escapeHtml(value) {
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

function renderShell({ title, description, canonical, heading, bodyHtml, type = "website" }) {
  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="robots" content="index,follow">
    <link rel="canonical" href="${escapeHtml(canonical)}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${escapeHtml(canonical)}">
    <meta property="og:type" content="${type}">
    <meta property="og:site_name" content="Crepika">
    <meta name="google-adsense-account" content="ca-pub-3050601904412736">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3050601904412736" crossorigin="anonymous"></script>
    <style>
      :root{color-scheme:light}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;line-height:1.7;color:#172033;margin:0;background:#f8fafc}
      main{max-width:860px;margin:0 auto;padding:44px 20px 72px}nav{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:32px}
      a{color:#0f766e}h1{font-size:2.2rem;line-height:1.2;margin:0 0 18px}h2{margin-top:34px;font-size:1.35rem}h3{margin-top:24px;font-size:1.08rem}
      .lede{font-size:1.08rem;color:#475569}.panel{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:22px;margin-top:18px}
      li{margin:8px 0}.muted{color:#64748b;font-size:.95rem}.post-list{padding-left:20px}
    </style>
  </head>
  <body>
    <main>
      <nav>
        <a href="/">Home</a><a href="/tools/text-counter">Tools</a><a href="/blog">Blog</a><a href="/about">About</a><a href="/contact">Contact</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a>
      </nav>
      <h1>${escapeHtml(heading)}</h1>
      ${bodyHtml}
      <section class="panel">
        <h2>Site and review context</h2>
        <p>Crepika is a free creator utility site. It provides practical tools, editorial guides, contact information, privacy terms, RSS, robots.txt, ads.txt, and a sitemap so users and crawlers can understand the site without relying only on JavaScript rendering.</p>
        <p>Advertising may appear through Google AdSense Auto Ads. Manual ad units are not inserted in these generated crawler pages, and advertising does not change tool output or editorial recommendations.</p>
        <p>Policy pages: <a href="/privacy">Privacy Policy</a>, <a href="/terms">Terms of Use</a>, <a href="/about">About Crepika</a>, and <a href="/contact">Contact</a>.</p>
      </section>
    </main>
  </body>
</html>`;
}

function writePage(path, html) {
  const target = join(publicDir, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html, "utf8");
}

function renderStaticPage(page) {
  const paragraphs = page.body.map((text, index) => `<p${index === 0 ? ' class="lede"' : ""}>${escapeHtml(text)}</p>`).join("\n");
  return renderShell({
    ...page,
    bodyHtml: `${paragraphs}
      <section class="panel"><h2>Useful links</h2><ul><li><a href="/blog">Browse blog guides</a></li><li><a href="/tools/text-counter">Open creator tools</a></li><li><a href="/contact">Report corrections</a></li></ul></section>`,
  });
}

function renderBlogIndex(posts) {
  const latest = posts.slice().reverse().slice(0, 80);
  const links = latest.map((post) => `<li><a href="/blog/${escapeHtml(post.slug)}">${escapeHtml(post.title)}</a><br><span class="muted">${escapeHtml(post.description)}</span></li>`).join("\n");
  return renderShell({
    title: "Crepika Blog | SEO and Creator Workflow Guides",
    description: "Browse Crepika guides about SEO, SNS marketing, image optimization, content workflows, and free creator tools.",
    canonical: `${siteUrl}/blog`,
    heading: "Crepika Blog",
    bodyHtml: `<p class="lede">Browse practical guides for SEO, SNS marketing, creator workflows, image optimization, and publishing checks.</p><section class="panel"><h2>Latest guides</h2><ol class="post-list">${links}</ol></section>`,
  });
}

function renderBlogPost(post) {
  const sections = post.content.sections
    .map((section) => {
      const title = section.heading || section.title || "Guide section";
      const subsections = (section.subsections ?? [])
        .map((subsection) => `<h3>${escapeHtml(subsection.subheading)}</h3><p>${escapeHtml(stripMarkdown(subsection.content))}</p>`)
        .join("\n");
      return `<section class="panel"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(stripMarkdown(section.content))}</p>${subsections}</section>`;
    })
    .join("\n");
  const faq = (post.faq ?? [])
    .slice(0, 5)
    .map((item) => `<h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(stripMarkdown(item.answer))}</p>`)
    .join("\n");
  const faqHtml = faq ? `<section class="panel"><h2>FAQ</h2>${faq}</section>` : "";
  return renderShell({
    title: `${post.title} | Crepika`,
    description: post.description,
    canonical: `${siteUrl}/blog/${post.slug}`,
    heading: post.title,
    type: "article",
    bodyHtml: `<p class="lede">${escapeHtml(post.description)}</p>
      <p class="muted">Published: ${escapeHtml(post.publishDate)} 쨌 Category: ${escapeHtml(post.category)} 쨌 Read time: ${escapeHtml(post.readTime)}</p>
      <section class="panel"><h2>Overview</h2><p>${escapeHtml(stripMarkdown(post.content.introduction))}</p></section>
      ${sections}
      <section class="panel"><h2>Conclusion</h2><p>${escapeHtml(stripMarkdown(post.content.conclusion))}</p></section>
      ${faqHtml}
      <section class="panel"><h2>Next step</h2><p>Use the related Crepika tools from the navigation, then return to this guide when reviewing your final draft.</p></section>`,
  });
}

const posts = loadPosts();

for (const page of [...staticPages, ...toolPages]) {
  writePage(page.path, renderStaticPage(page));
}

writePage("blog/index.html", renderBlogIndex(posts));
for (const post of posts) {
  writePage(`blog/${post.slug}/index.html`, renderBlogPost(post));
}

console.log(`Generated ${staticPages.length + toolPages.length + 1 + posts.length} crawler-visible pages.`);
