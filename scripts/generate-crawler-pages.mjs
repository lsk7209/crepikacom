import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { readFileSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const siteUrl = "https://crepika.com";
const toolQueueFile = join(root, "scripts", "tool-queue.json");

const alwaysPublishedToolPaths = new Set([
  "/tools/text-counter",
  "/tools/byte-counter",
  "/tools/lorem-generator",
  "/tools/webp-converter",
  "/tools/insta-spacer",
  "/tools/hashtag-mixer",
  "/tools/qr-generator",
]);

function loadPublishedQueuedToolPaths() {
  try {
    const queue = JSON.parse(readFileSync(toolQueueFile, "utf8"));
    return new Set(
      queue
        .filter((item) => item.status === "published" && item.path)
        .map((item) => item.path),
    );
  } catch {
    return new Set();
  }
}

const publishedQueuedToolPaths = loadPublishedQueuedToolPaths();

function shouldRenderToolPage(canonical) {
  const path = new URL(canonical).pathname;
  return alwaysPublishedToolPaths.has(path) || publishedQueuedToolPaths.has(path);
}

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
  ["tools/seo-title-length-checker/index.html", "SEO Title Length Checker | Crepika", "Check title length, keyword position, and search snippet readability before publishing.", `${siteUrl}/tools/seo-title-length-checker`, "SEO Title Length Checker"],
  ["tools/meta-description-checker/index.html", "Meta Description Checker | Crepika", "Check meta description length, keyword placement, CTA clarity, and snippet quality.", `${siteUrl}/tools/meta-description-checker`, "Meta Description Checker"],
  ["tools/slug-generator/index.html", "URL Slug Generator | Crepika", "Convert article and tool titles into readable lowercase URL slugs.", `${siteUrl}/tools/slug-generator`, "URL Slug Generator"],
  ["tools/utm-url-builder/index.html", "UTM URL Builder | Crepika", "Build clean campaign tracking URLs for GA4 without a login step.", `${siteUrl}/tools/utm-url-builder`, "UTM URL Builder"],
  ["tools/ctr-calculator/index.html", "CTR Calculator | Crepika", "Calculate click-through rate from impressions and clicks for search, ads, email, and social links.", `${siteUrl}/tools/ctr-calculator`, "CTR Calculator"],
  ["tools/adsense-rpm-calculator/index.html", "AdSense RPM Calculator | Crepika", "Calculate page RPM from estimated earnings and pageviews for blog revenue checks.", `${siteUrl}/tools/adsense-rpm-calculator`, "AdSense RPM Calculator"],
  ["tools/h-tag-structure-checker/index.html", "H Tag Structure Checker | Crepika", "Check H1, H2, and H3 hierarchy for SEO-friendly article structure.", `${siteUrl}/tools/h-tag-structure-checker`, "H Tag Structure Checker"],
  ["tools/blog-outline-builder/index.html", "Blog Outline Builder | Crepika", "Build a structured H2 and H3 outline for SEO-friendly blog posts.", `${siteUrl}/tools/blog-outline-builder`, "Blog Outline Builder"],
  ["tools/article-word-count-planner/index.html", "Article Word Count Planner | Crepika", "Estimate a useful article length from section count and content depth.", `${siteUrl}/tools/article-word-count-planner`, "Article Word Count Planner"],
  ["tools/keyword-density-checker/index.html", "Keyword Density Checker | Crepika", "Check keyword frequency and density in article drafts.", `${siteUrl}/tools/keyword-density-checker`, "Keyword Density Checker"],
  ["tools/internal-link-anchor-planner/index.html", "Internal Link Anchor Planner | Crepika", "Plan natural internal link anchor text for blog articles.", `${siteUrl}/tools/internal-link-anchor-planner`, "Internal Link Anchor Planner"],
  ["tools/serp-snippet-preview/index.html", "SERP Snippet Preview | Crepika", "Preview title, description, and URL as a search result snippet.", `${siteUrl}/tools/serp-snippet-preview`, "SERP Snippet Preview"],
  ["tools/alt-text-helper/index.html", "Alt Text Helper | Crepika", "Draft useful image alt text from context and keyword.", `${siteUrl}/tools/alt-text-helper`, "Alt Text Helper"],
  ["tools/content-freshness-checklist/index.html", "Content Freshness Checklist | Crepika", "Check whether a blog post needs freshness updates.", `${siteUrl}/tools/content-freshness-checklist`, "Content Freshness Checklist"],
  ["tools/eeat-signal-checker/index.html", "E-E-A-T Signal Checker | Crepika", "Check experience, evidence, specificity, and author context signals.", `${siteUrl}/tools/eeat-signal-checker`, "E-E-A-T Signal Checker"],
  ["tools/blog-intro-hook-checker/index.html", "Blog Intro Hook Checker | Crepika", "Check whether a blog introduction gives readers a clear reason to continue.", `${siteUrl}/tools/blog-intro-hook-checker`, "Blog Intro Hook Checker"],
  ["tools/list-to-table-converter/index.html", "List to Table Converter | Crepika", "Convert delimited text lists into Markdown tables.", `${siteUrl}/tools/list-to-table-converter`, "List to Table Converter"],
  ["tools/markdown-table-builder/index.html", "Markdown Table Builder | Crepika", "Build a Markdown table template from columns and row count.", `${siteUrl}/tools/markdown-table-builder`, "Markdown Table Builder"],
  ["tools/source-link-organizer/index.html", "Source Link Organizer | Crepika", "Organize source names and URLs into a clean reference list.", `${siteUrl}/tools/source-link-organizer`, "Source Link Organizer"],
  ["tools/instagram-caption-builder/index.html", "Instagram Caption Builder | Crepika", "Build a structured Instagram caption with hook, body, and CTA.", `${siteUrl}/tools/instagram-caption-builder`, "Instagram Caption Builder"],
  ["tools/reels-hook-bank-builder/index.html", "Reels Hook Bank Builder | Crepika", "Generate short hook lines for Instagram Reels and short videos.", `${siteUrl}/tools/reels-hook-bank-builder`, "Reels Hook Bank Builder"],
  ["tools/youtube-title-length-checker/index.html", "YouTube Title Length Checker | Crepika", "Check YouTube title length, keyword position, and click signal.", `${siteUrl}/tools/youtube-title-length-checker`, "YouTube Title Length Checker"],
  ["tools/youtube-description-formatter/index.html", "YouTube Description Formatter | Crepika", "Format a YouTube description with summary, links, and chapters.", `${siteUrl}/tools/youtube-description-formatter`, "YouTube Description Formatter"],
  ["tools/shorts-script-timer/index.html", "Shorts Script Timer | Crepika", "Estimate speaking time for Shorts, Reels, and short-form scripts.", `${siteUrl}/tools/shorts-script-timer`, "Shorts Script Timer"],
  ["tools/thread-post-splitter/index.html", "Thread Post Splitter | Crepika", "Split long text into numbered thread posts within a character limit.", `${siteUrl}/tools/thread-post-splitter`, "Thread Post Splitter"],
  ["tools/linkedin-post-formatter/index.html", "LinkedIn Post Formatter | Crepika", "Format an idea into a LinkedIn post with hook, insight, and CTA.", `${siteUrl}/tools/linkedin-post-formatter`, "LinkedIn Post Formatter"],
  ["tools/hashtag-group-planner/index.html", "Hashtag Group Planner | Crepika", "Build hashtag groups by core topic, niche, discovery, and brand.", `${siteUrl}/tools/hashtag-group-planner`, "Hashtag Group Planner"],
  ["tools/hashtag-rotation-tracker/index.html", "Hashtag Rotation Tracker | Crepika", "Split hashtags into rotation sets for cleaner content testing.", `${siteUrl}/tools/hashtag-rotation-tracker`, "Hashtag Rotation Tracker"],
  ["tools/social-bio-length-checker/index.html", "Social Bio Length Checker | Crepika", "Check social profile bio length, audience, value, and CTA.", `${siteUrl}/tools/social-bio-length-checker`, "Social Bio Length Checker"],
  ["tools/creator-media-kit-checklist/index.html", "Creator Media Kit Checklist | Crepika", "Check creator media kit essentials for brand collaboration.", `${siteUrl}/tools/creator-media-kit-checklist`, "Creator Media Kit Checklist"],
  ["tools/collaboration-email-builder/index.html", "Collaboration Email Builder | Crepika", "Draft a creator collaboration email for brand outreach.", `${siteUrl}/tools/collaboration-email-builder`, "Collaboration Email Builder"],
  ["tools/comment-reply-template-builder/index.html", "Comment Reply Template Builder | Crepika", "Generate reusable reply templates for comments and questions.", `${siteUrl}/tools/comment-reply-template-builder`, "Comment Reply Template Builder"],
  ["tools/pinned-comment-cta-builder/index.html", "Pinned Comment CTA Builder | Crepika", "Create pinned comment CTA options for posts and videos.", `${siteUrl}/tools/pinned-comment-cta-builder`, "Pinned Comment CTA Builder"],
  ["tools/content-repurpose-planner/index.html", "Content Repurpose Planner | Crepika", "Plan how to repurpose one source content across multiple platforms.", `${siteUrl}/tools/content-repurpose-planner`, "Content Repurpose Planner"],
  ["tools/publishing-calendar-planner/index.html", "Publishing Calendar Planner | Crepika", "Build a simple content publishing calendar from topics and duration.", `${siteUrl}/tools/publishing-calendar-planner`, "Publishing Calendar Planner"],
  ["tools/hook-strength-checker/index.html", "Hook Strength Checker | Crepika", "Check hook strength for social posts and short-form content.", `${siteUrl}/tools/hook-strength-checker`, "Hook Strength Checker"],
  ["tools/caption-line-break-cleaner/index.html", "Caption Line Break Cleaner | Crepika", "Clean social caption line breaks for mobile readability.", `${siteUrl}/tools/caption-line-break-cleaner`, "Caption Line Break Cleaner"],
  ["tools/emoji-density-checker/index.html", "Emoji Density Checker | Crepika", "Check emoji count and density in social copy.", `${siteUrl}/tools/emoji-density-checker`, "Emoji Density Checker"],
  ["tools/sns-cta-library-builder/index.html", "SNS CTA Library Builder | Crepika", "Generate CTA lines for saves, comments, clicks, and follows.", `${siteUrl}/tools/sns-cta-library-builder`, "SNS CTA Library Builder"],
  ["tools/image-aspect-ratio-checker/index.html", "Image Aspect Ratio Checker | Crepika", "Calculate image aspect ratio and match common platform presets.", `${siteUrl}/tools/image-aspect-ratio-checker`, "Image Aspect Ratio Checker"],
  ["tools/thumbnail-size-planner/index.html", "Thumbnail Size Planner | Crepika", "Plan thumbnail size, ratio, safe area, and text length by platform.", `${siteUrl}/tools/thumbnail-size-planner`, "Thumbnail Size Planner"],
  ["tools/filename-seo-cleaner/index.html", "Filename SEO Cleaner | Crepika", "Clean image filenames into readable lowercase SEO-friendly names.", `${siteUrl}/tools/filename-seo-cleaner`, "Filename SEO Cleaner"],
  ["tools/batch-filename-planner/index.html", "Batch Filename Planner | Crepika", "Generate consistent batch filenames from image descriptions.", `${siteUrl}/tools/batch-filename-planner`, "Batch Filename Planner"],
  ["tools/image-compression-savings-calculator/index.html", "Image Compression Savings Calculator | Crepika", "Calculate per-image and total file size savings after compression.", `${siteUrl}/tools/image-compression-savings-calculator`, "Image Compression Savings Calculator"],
  ["tools/og-image-text-checker/index.html", "OG Image Text Checker | Crepika", "Check Open Graph image text length, specificity, and brand signal.", `${siteUrl}/tools/og-image-text-checker`, "OG Image Text Checker"],
  ["tools/color-contrast-checker/index.html", "Color Contrast Checker | Crepika", "Check text and background color contrast ratio for readable UI and content.", `${siteUrl}/tools/color-contrast-checker`, "Color Contrast Checker"],
  ["tools/brand-color-palette-notes/index.html", "Brand Color Palette Notes | Crepika", "Turn brand colors into practical palette role notes for UI and content.", `${siteUrl}/tools/brand-color-palette-notes`, "Brand Color Palette Notes"],
  ["tools/svg-data-uri-encoder/index.html", "SVG Data URI Encoder | Crepika", "Encode small SVG markup into a CSS-friendly data URI.", `${siteUrl}/tools/svg-data-uri-encoder`, "SVG Data URI Encoder"],
  ["tools/base64-image-size-estimator/index.html", "Base64 Image Size Estimator | Crepika", "Estimate image size overhead when embedding images as Base64.", `${siteUrl}/tools/base64-image-size-estimator`, "Base64 Image Size Estimator"],
  ["tools/exif-privacy-checklist/index.html", "EXIF Privacy Checklist | Crepika", "Check image publishing privacy risks from EXIF, GPS, faces, and visible details.", `${siteUrl}/tools/exif-privacy-checklist`, "EXIF Privacy Checklist"],
  ["tools/image-alt-batch-planner/index.html", "Image Alt Batch Planner | Crepika", "Draft page-aware alt text for multiple images at once.", `${siteUrl}/tools/image-alt-batch-planner`, "Image Alt Batch Planner"],
  ["tools/favicon-checklist-builder/index.html", "Favicon Checklist Builder | Crepika", "Build a favicon and app icon preparation checklist.", `${siteUrl}/tools/favicon-checklist-builder`, "Favicon Checklist Builder"],
  ["tools/open-graph-image-checklist/index.html", "Open Graph Image Checklist | Crepika", "Check OG image size, ratio, text length, and share-card readability.", `${siteUrl}/tools/open-graph-image-checklist`, "Open Graph Image Checklist"],
  ["tools/file-size-unit-converter/index.html", "File Size Unit Converter | Crepika", "Convert file size values between bytes, KB, MB, and GB.", `${siteUrl}/tools/file-size-unit-converter`, "File Size Unit Converter"],
  ["tools/utm-consistency-checker/index.html", "UTM Consistency Checker | Crepika", "Check campaign URLs for missing UTM fields and naming inconsistencies.", `${siteUrl}/tools/utm-consistency-checker`, "UTM Consistency Checker"],
  ["tools/url-encoder-decoder/index.html", "URL Encoder Decoder | Crepika", "Encode and decode URLs with Korean, spaces, and special characters.", `${siteUrl}/tools/url-encoder-decoder`, "URL Encoder Decoder"],
  ["tools/query-string-parser/index.html", "Query String Parser | Crepika", "Parse URL query parameters and check UTM fields, empty values, and duplicates.", `${siteUrl}/tools/query-string-parser`, "Query String Parser"],
  ["tools/link-cleanup-tool/index.html", "Link Cleanup Tool | Crepika", "Clean share URLs by keeping selected UTM parameters and removing extra tracking values.", `${siteUrl}/tools/link-cleanup-tool`, "Link Cleanup Tool"],
  ["tools/qr-campaign-url-builder/index.html", "QR Campaign URL Builder | Crepika", "Build UTM campaign URLs for offline QR code placements.", `${siteUrl}/tools/qr-campaign-url-builder`, "QR Campaign URL Builder"],
  ["tools/redirect-chain-notes-builder/index.html", "Redirect Chain Notes Builder | Crepika", "Document redirect flows and summarize redirect chain risk.", `${siteUrl}/tools/redirect-chain-notes-builder`, "Redirect Chain Notes Builder"],
  ["tools/canonical-url-checklist/index.html", "Canonical URL Checklist | Crepika", "Check canonical URL domain, path, query, and self-reference consistency.", `${siteUrl}/tools/canonical-url-checklist`, "Canonical URL Checklist"],
  ["tools/sitemap-url-batch-builder/index.html", "Sitemap URL Batch Builder | Crepika", "Convert path lists into canonical sitemap URL candidates.", `${siteUrl}/tools/sitemap-url-batch-builder`, "Sitemap URL Batch Builder"],
  ["tools/robots-rule-draft-builder/index.html", "Robots Rule Draft Builder | Crepika", "Draft robots.txt Allow, Disallow, and Sitemap rules.", `${siteUrl}/tools/robots-rule-draft-builder`, "Robots Rule Draft Builder"],
  ["tools/anchor-text-variation-builder/index.html", "Anchor Text Variation Builder | Crepika", "Generate natural anchor text variations for internal links.", `${siteUrl}/tools/anchor-text-variation-builder`, "Anchor Text Variation Builder"],
  ["tools/broken-link-outreach-template/index.html", "Broken Link Outreach Template | Crepika", "Draft a polite email for broken link replacement outreach.", `${siteUrl}/tools/broken-link-outreach-template`, "Broken Link Outreach Template"],
  ["tools/affiliate-disclosure-builder/index.html", "Affiliate Disclosure Builder | Crepika", "Draft transparent affiliate disclosure copy for content pages.", `${siteUrl}/tools/affiliate-disclosure-builder`, "Affiliate Disclosure Builder"],
  ["tools/campaign-naming-convention-builder/index.html", "Campaign Naming Convention Builder | Crepika", "Create consistent UTM campaign naming rules for GA4 reports.", `${siteUrl}/tools/campaign-naming-convention-builder`, "Campaign Naming Convention Builder"],
  ["tools/landing-page-cta-url-builder/index.html", "Landing Page CTA URL Builder | Crepika", "Build UTM URLs for landing page CTA placement tracking.", `${siteUrl}/tools/landing-page-cta-url-builder`, "Landing Page CTA URL Builder"],
  ["tools/conversion-rate-calculator/index.html", "Conversion Rate Calculator | Crepika", "Calculate conversion rate from visits and conversions.", `${siteUrl}/tools/conversion-rate-calculator`, "Conversion Rate Calculator"],
  ["tools/adsense-cpc-calculator/index.html", "AdSense CPC Calculator | Crepika", "Calculate estimated AdSense cost per click from earnings and ad clicks.", `${siteUrl}/tools/adsense-cpc-calculator`, "AdSense CPC Calculator"],
  ["tools/faq-schema-builder/index.html", "FAQ Schema Builder | Crepika", "Convert visible questions and answers into FAQPage JSON-LD drafts for structured data review.", `${siteUrl}/tools/faq-schema-builder`, "FAQ Schema Builder"],
  ["tools/howto-schema-builder/index.html", "HowTo Schema Builder | Crepika", "Convert step-by-step instructions into HowTo JSON-LD drafts for procedural content.", `${siteUrl}/tools/howto-schema-builder`, "HowTo Schema Builder"],
  ["tools/blog-cta-checker/index.html", "Blog CTA Checker | Crepika", "Check whether a blog call-to-action is specific, action-oriented, and useful for readers.", `${siteUrl}/tools/blog-cta-checker`, "Blog CTA Checker"],
  ["tools/paragraph-readability-checker/index.html", "Paragraph Readability Checker | Crepika", "Find overly long paragraphs and mobile readability risks in article drafts.", `${siteUrl}/tools/paragraph-readability-checker`, "Paragraph Readability Checker"],
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
})).filter((page) => shouldRenderToolPage(page.canonical));

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
