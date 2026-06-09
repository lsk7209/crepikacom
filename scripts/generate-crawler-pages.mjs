import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { readFileSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const siteUrl = "https://crepika.com";
const ogImage = `${siteUrl}/og-image.png`;
const toolQueueFile = join(root, "scripts", "tool-queue.json");
const authorProfiles = {
  "\uC774\uC9C0\uC218": {
    id: "leejisu",
    image: "/images/avatar-leejisu.svg",
    description:
      "\uC218\uBC31 \uBA85\uC758 \uD06C\uB9AC\uC5D0\uC774\uD130\u00B7\uBE0C\uB79C\uB4DC SNS \uC131\uC7A5\uC744 \uCEE8\uC124\uD305\uD55C \uC18C\uC15C \uBBF8\uB514\uC5B4 \uC2A4\uD398\uC15C\uB9AC\uC2A4\uD2B8.",
  },
  "\uAE40\uBBFC\uD601": {
    id: "kimminhy",
    image: "/images/avatar-kimminhy.svg",
    description:
      "10\uB144\uCC28 \uB514\uC9C0\uD138 \uB9C8\uCF00\uD130\uC774\uC790 SEO \uC804\uB7B5\uAC00. \uB370\uC774\uD130 \uAE30\uBC18 \uCF58\uD150\uCE20 \uCD5C\uC801\uD654 \uC804\uBB38\uAC00.",
  },
  "\uBC15\uC900\uC601": {
    id: "parkjy",
    image: "/images/avatar-parkjy.svg",
    description:
      "\uD06C\uB808\uD53C\uCE74 \uC218\uC11D \uAC1C\uBC1C\uC790. \uBE0C\uB77C\uC6B0\uC800 \uAE30\uBC18 \uB3C4\uAD6C \uC131\uB2A5\uACFC \uC0AC\uC6A9\uC790 \uB370\uC774\uD130 \uBCF4\uC548\uC744 \uC124\uACC4\uD569\uB2C8\uB2E4.",
  },
};
const categoryLabels = {
  guide: "\uAC00\uC774\uB4DC",
  tips: "\uD301 & \uD2B8\uB9AD",
  insights: "\uC778\uC0AC\uC774\uD2B8",
  "case-study": "\uCF00\uC774\uC2A4 \uC2A4\uD130\uB514",
};
const securityTxt = `Contact: mailto:support@crepika.com
Preferred-Languages: ko, en
Canonical: ${siteUrl}/.well-known/security.txt
Policy: ${siteUrl}/privacy
Expires: 2027-06-10T00:00:00Z
`;

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
    title: "크레피카 소개 | 무료 크리에이터 도구",
    description: "크레피카는 한국 크리에이터, 마케터, 블로거, 소규모 팀을 위한 브라우저 기반 무료 도구와 실전 발행 가이드를 제공합니다.",
    canonical: `${siteUrl}/about`,
    heading: "크레피카 소개",
    body: [
      "크레피카는 로그인 없이 빠르게 발행 전 점검을 끝내고 싶은 크리에이터를 위한 유틸리티 사이트입니다.",
      "글자수 세기, 한글 바이트 확인, WebP 변환, QR 코드 생성, 인스타그램 줄바꿈, 해시태그 조합, 실전 발행 가이드를 중심으로 구성되어 있습니다.",
    ],
  },
  {
    path: "contact/index.html",
    title: "크레피카 문의 | 정정 요청과 도구 제안",
    description: "서비스 질문, 정정 요청, 오류 제보, 크리에이터 도구 제안이 있다면 크레피카에 문의하세요.",
    canonical: `${siteUrl}/contact`,
    heading: "문의",
    body: [
      "정정 요청, 서비스 질문, 도구 제안은 support@crepika.com으로 보내주세요.",
      "오류를 제보할 때는 페이지 URL, 브라우저, 기기, 기대한 결과와 실제 결과를 함께 적어주면 더 빠르게 확인할 수 있습니다.",
    ],
  },
  {
    path: "privacy/index.html",
    title: "개인정보처리방침 | 크레피카",
    description: "크레피카 개인정보처리방침은 브라우저 내 도구 처리, 분석, 쿠키, Google AdSense 이용 방식을 설명합니다.",
    canonical: `${siteUrl}/privacy`,
    heading: "개인정보처리방침",
    body: [
      "크레피카의 핵심 도구 입력값은 가능한 한 사용자의 브라우저 안에서 처리되도록 설계되어 있습니다.",
      "사이트 이용 현황을 이해하고 무료 도구 운영을 지원하기 위해 분석 도구와 Google AdSense 쿠키가 사용될 수 있습니다.",
      "사용자는 온라인 도구에 민감한 개인정보를 입력하기 전 필요성과 개인정보 영향을 직접 확인해야 합니다.",
    ],
  },
  {
    path: "terms/index.html",
    title: "이용약관 | 크레피카",
    description: "크레피카 이용약관은 무료 온라인 크리에이터 도구의 사용 범위, 제한, 책임, 광고 고지를 안내합니다.",
    canonical: `${siteUrl}/terms`,
    heading: "이용약관",
    body: [
      "크레피카 도구는 무료 생산성 보조 수단으로 제공됩니다. 사용자는 결과물을 실제로 발행하기 전에 직접 검토해야 합니다.",
      "권리 침해, 불법 자료 처리, 서비스 공격, 플랫폼 규칙 우회 목적으로 사이트를 사용해서는 안 됩니다.",
    ],
  },
  {
    path: "blog/index.html",
    title: "크레피카 블로그 | SEO와 크리에이터 워크플로우 가이드",
    description: "SEO, SNS 마케팅, 이미지 최적화, 콘텐츠 워크플로우, 무료 크리에이터 도구 활용법을 다루는 크레피카 가이드입니다.",
    canonical: `${siteUrl}/blog`,
    heading: "크레피카 블로그",
    body: [
      "크레피카 블로그는 실전 SEO, SNS 마케팅, 크리에이터 워크플로우, 이미지 최적화, 발행 점검 주제를 다룹니다.",
      "각 글은 사이트맵과 RSS 피드에 연결되어 검색엔진이 전체 콘텐츠 아카이브를 발견할 수 있게 구성되어 있습니다.",
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
  ["tools/newsletter-growth-calculator/index.html", "Newsletter Growth Calculator | Crepika", "Forecast newsletter subscribers from growth and churn rates.", `${siteUrl}/tools/newsletter-growth-calculator`, "Newsletter Growth Calculator"],
  ["tools/engagement-rate-calculator/index.html", "Engagement Rate Calculator | Crepika", "Calculate SNS engagement rate from likes, comments, saves, and shares.", `${siteUrl}/tools/engagement-rate-calculator`, "Engagement Rate Calculator"],
  ["tools/content-roi-calculator/index.html", "Content ROI Calculator | Crepika", "Calculate content return on investment from cost and attributed revenue.", `${siteUrl}/tools/content-roi-calculator`, "Content ROI Calculator"],
  ["tools/break-even-calculator/index.html", "Break-even Calculator | Crepika", "Estimate required conversions from cost and profit per conversion.", `${siteUrl}/tools/break-even-calculator`, "Break-even Calculator"],
  ["tools/ab-test-sample-notes/index.html", "A/B Test Sample Notes | Crepika", "Compare two A/B test variants and produce a practical sample note.", `${siteUrl}/tools/ab-test-sample-notes`, "A/B Test Sample Notes"],
  ["tools/publishing-pace-calculator/index.html", "Publishing Pace Calculator | Crepika", "Calculate how long a queued publishing backlog will last.", `${siteUrl}/tools/publishing-pace-calculator`, "Publishing Pace Calculator"],
  ["tools/lead-magnet-math-calculator/index.html", "Lead Magnet Math Calculator | Crepika", "Estimate leads and sales from visitor, signup, and lead-to-sale rates.", `${siteUrl}/tools/lead-magnet-math-calculator`, "Lead Magnet Math Calculator"],
  ["tools/creator-pricing-calculator/index.html", "Creator Pricing Calculator | Crepika", "Estimate creator sponsorship fee ranges from reach and production effort.", `${siteUrl}/tools/creator-pricing-calculator`, "Creator Pricing Calculator"],
  ["tools/funnel-dropoff-calculator/index.html", "Funnel Dropoff Calculator | Crepika", "Calculate funnel conversion rates and identify the weakest step.", `${siteUrl}/tools/funnel-dropoff-calculator`, "Funnel Dropoff Calculator"],
  ["tools/keyword-opportunity-scorer/index.html", "Keyword Opportunity Scorer | Crepika", "Score keyword opportunities from intent, difficulty, and business fit.", `${siteUrl}/tools/keyword-opportunity-scorer`, "Keyword Opportunity Scorer"],
  ["tools/markdown-cleaner/index.html", "Markdown Cleaner | Crepika", "Clean markdown spacing, trailing spaces, and heading formatting.", `${siteUrl}/tools/markdown-cleaner`, "Markdown Cleaner"],
  ["tools/html-entity-converter/index.html", "HTML Entity Converter | Crepika", "Encode or decode common HTML entities for safer HTML text handling.", `${siteUrl}/tools/html-entity-converter`, "HTML Entity Converter"],
  ["tools/json-formatter/index.html", "JSON Formatter | Crepika", "Validate, pretty-print, and minify JSON for structured data and configuration review.", `${siteUrl}/tools/json-formatter`, "JSON Formatter"],
  ["tools/csv-to-markdown-table/index.html", "CSV to Markdown Table | Crepika", "Convert simple CSV rows into markdown tables for blogs and documents.", `${siteUrl}/tools/csv-to-markdown-table`, "CSV to Markdown Table"],
  ["tools/markdown-to-plain-text/index.html", "Markdown to Plain Text | Crepika", "Strip markdown syntax and keep readable plain text for reuse.", `${siteUrl}/tools/markdown-to-plain-text`, "Markdown to Plain Text"],
  ["tools/text-deduplicator/index.html", "Text Deduplicator | Crepika", "Remove duplicate lines while preserving original order.", `${siteUrl}/tools/text-deduplicator`, "Text Deduplicator"],
  ["tools/case-converter/index.html", "Case Converter | Crepika", "Convert text into lower, upper, title, kebab, snake, and camel case.", `${siteUrl}/tools/case-converter`, "Case Converter"],
  ["tools/regex-escape-tool/index.html", "Regex Escape Tool | Crepika", "Escape special regex characters for literal text matching.", `${siteUrl}/tools/regex-escape-tool`, "Regex Escape Tool"],
  ["tools/content-decay-monitor-sheet-builder/index.html", "Content Decay Monitor Sheet Builder | Crepika", "Build a content decay tracking table for stale page performance review.", `${siteUrl}/tools/content-decay-monitor-sheet-builder`, "Content Decay Monitor Sheet Builder"],
  ["tools/html-meta-tag-builder/index.html", "HTML Meta Tag Builder | Crepika", "Draft title, description, canonical, Open Graph, and Twitter meta tags.", `${siteUrl}/tools/html-meta-tag-builder`, "HTML Meta Tag Builder"],
  ["tools/jsonld-organization-builder/index.html", "Organization JSON-LD Builder | Crepika", "Generate Organization JSON-LD from site and profile information.", `${siteUrl}/tools/jsonld-organization-builder`, "Organization JSON-LD Builder"],
  ["tools/checklist-builder/index.html", "Checklist Builder | Crepika", "Convert notes into markdown checkbox checklists.", `${siteUrl}/tools/checklist-builder`, "Checklist Builder"],
  ["tools/meeting-notes-action-items/index.html", "Meeting Notes Action Items | Crepika", "Extract likely action items from meeting notes.", `${siteUrl}/tools/meeting-notes-action-items`, "Meeting Notes Action Items"],
  ["tools/prompt-brief-builder/index.html", "Prompt Brief Builder | Crepika", "Build a structured brief for writing, design, and development prompts.", `${siteUrl}/tools/prompt-brief-builder`, "Prompt Brief Builder"],
  ["tools/privacy-policy-input-checklist/index.html", "Privacy Policy Input Checklist | Crepika", "Create a checklist for data types handled by a site or tool.", `${siteUrl}/tools/privacy-policy-input-checklist`, "Privacy Policy Input Checklist"],
  ["tools/tool-idea-scorer/index.html", "Tool Idea Scorer | Crepika", "Score utility ideas by usefulness, search demand, differentiation, and build difficulty.", `${siteUrl}/tools/tool-idea-scorer`, "Tool Idea Scorer"],
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

function estimateWordCount(post) {
  const raw = [
    post.content?.introduction,
    ...(post.content?.sections ?? []).flatMap((section) => [
      section.heading ?? section.title ?? "",
      section.content,
      ...(section.subsections?.flatMap((subsection) => [subsection.subheading, subsection.content]) ?? []),
    ]),
    post.content?.conclusion,
    ...(post.faq?.flatMap((item) => [item.question, item.answer]) ?? []),
  ].join(" ");

  return stripMarkdown(raw)
    .split(/\s+/)
    .filter(Boolean).length;
}

function makeAuthorSchema(authorName) {
  const name = authorName || "Crepika";
  const profile = authorProfiles[name] ?? {
    id: "crepika-editorial",
    image: "/og-image.png",
    description: "\uD06C\uB808\uD53C\uCE74 \uCF58\uD150\uCE20 \uD300",
  };

  return {
    "@type": "Person",
    "@id": `${siteUrl}/about#${profile.id}`,
    name,
    url: `${siteUrl}/about`,
    description: profile.description,
    image: `${siteUrl}${profile.image}`,
  };
}

function makePublisherSchema() {
  return {
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "\uD06C\uB808\uD53C\uCE74",
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: ogImage,
      width: 1200,
      height: 630,
    },
  };
}

function makeArticleStructuredData(post) {
  const canonical = `${siteUrl}/blog/${post.slug}`;
  const dateModified = post.dateModified || post.publishDate;
  const readMinutes = Number(String(post.readTime ?? "").match(/\d+/)?.[0] ?? 1);
  const faqItems = (post.faq ?? []).slice(0, 5);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${canonical}#article`,
    headline: post.title,
    description: post.description,
    url: canonical,
    image: {
      "@type": "ImageObject",
      url: ogImage,
      width: 1200,
      height: 630,
    },
    wordCount: estimateWordCount(post),
    datePublished: post.publishDate,
    dateModified,
    author: makeAuthorSchema(post.author),
    publisher: makePublisherSchema(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
    inLanguage: "ko-KR",
    articleSection: categoryLabels[post.category] ?? post.category,
    keywords: (post.keywords ?? []).join(", "),
    timeRequired: `PT${readMinutes}M`,
    isPartOf: { "@type": "WebSite", "@id": `${siteUrl}/#website` },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "h2", ".lede"],
    },
  };
  const faqSchema = faqItems.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: stripMarkdown(item.answer),
          },
        })),
      }
    : null;

  return [articleSchema, faqSchema];
}

function renderJsonLd(data) {
  const items = Array.isArray(data) ? data : [data];
  return items
    .filter(Boolean)
    .map((item) => {
      const json = JSON.stringify(item).replaceAll("<", "\\u003c");
      return `    <script type="application/ld+json">${json}</script>`;
    })
    .join("\n");
}

function makeBreadcrumb(canonical, label) {
  const pathname = new URL(canonical).pathname;
  const itemListElement = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Crepika",
      item: `${siteUrl}/`,
    },
  ];

  if (pathname.startsWith("/blog/")) {
    itemListElement.push({
      "@type": "ListItem",
      position: 2,
      name: "블로그",
      item: `${siteUrl}/blog`,
    });
  } else if (pathname.startsWith("/tools/")) {
    itemListElement.push({
      "@type": "ListItem",
      position: 2,
      name: "도구",
      item: `${siteUrl}/tools`,
    });
  }

  itemListElement.push({
    "@type": "ListItem",
    position: itemListElement.length + 1,
    name: label,
    item: canonical,
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };
}

function renderShell({
  title,
  description,
  canonical,
  heading,
  bodyHtml,
  type = "website",
  structuredData = [],
}) {
  const baseStructuredData = Array.isArray(structuredData) ? structuredData : [structuredData];
  const jsonLd = renderJsonLd([...baseStructuredData, makeBreadcrumb(canonical, heading)]);
  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="robots" content="index,follow,max-image-preview:large">
    <link rel="canonical" href="${escapeHtml(canonical)}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${escapeHtml(canonical)}">
    <meta property="og:type" content="${type}">
    <meta property="og:locale" content="ko_KR">
    <meta property="og:site_name" content="Crepika">
    <meta property="og:image" content="${ogImage}">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${escapeHtml(title)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${ogImage}">
    <meta name="twitter:image:alt" content="${escapeHtml(title)}">
    <meta name="google-adsense-account" content="ca-pub-3050601904412736">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3050601904412736" crossorigin="anonymous"></script>
${jsonLd ? `${jsonLd}\n` : ""}    <style>
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
        <a href="/">홈</a><a href="/tools/text-counter">도구</a><a href="/blog">블로그</a><a href="/about">소개</a><a href="/contact">문의</a><a href="/privacy">개인정보처리방침</a><a href="/terms">이용약관</a>
      </nav>
      <h1>${escapeHtml(heading)}</h1>
      ${bodyHtml}
      <section class="panel">
        <h2>사이트 검토 정보</h2>
        <p>크레피카는 크리에이터와 마케터를 위한 무료 유틸리티 사이트입니다. 실무 도구, 편집 가이드, 문의 정보, 개인정보처리방침, 이용약관, RSS, robots.txt, ads.txt, 사이트맵을 제공해 사용자와 검색엔진이 자바스크립트 렌더링에만 의존하지 않고 사이트 구조를 이해할 수 있게 합니다.</p>
        <p>광고는 Google AdSense 자동 광고로 노출될 수 있습니다. 이 정적 크롤러 페이지에는 수동 광고 슬롯을 삽입하지 않으며, 광고는 도구 결과나 편집 추천 내용에 영향을 주지 않습니다.</p>
        <p>정책 페이지: <a href="/privacy">개인정보처리방침</a>, <a href="/terms">이용약관</a>, <a href="/about">크레피카 소개</a>, <a href="/contact">문의하기</a>.</p>
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
  const path = new URL(page.canonical).pathname;
  const isTool = path.startsWith("/tools/");
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${page.canonical}#webpage`,
      url: page.canonical,
      name: page.title,
      description: page.description,
      inLanguage: "ko-KR",
      isPartOf: { "@id": `${siteUrl}/#website` },
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    isTool
      ? {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: page.heading,
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Web Browser",
          url: page.canonical,
          description: page.description,
          inLanguage: "ko-KR",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "KRW",
          },
          publisher: { "@id": `${siteUrl}/#organization` },
        }
      : null,
  ];
  return renderShell({
    ...page,
    structuredData,
    bodyHtml: `${paragraphs}
      <section class="panel"><h2>유용한 링크</h2><ul><li><a href="/blog">블로그 가이드 보기</a></li><li><a href="/tools/text-counter">크리에이터 도구 열기</a></li><li><a href="/contact">정정 요청하기</a></li></ul></section>`,
  });
}

function renderBlogIndex(posts) {
  const latest = posts.slice().reverse().slice(0, 80);
  const links = latest.map((post) => `<li><a href="/blog/${escapeHtml(post.slug)}">${escapeHtml(post.title)}</a><br><span class="muted">${escapeHtml(post.description)}</span></li>`).join("\n");
  return renderShell({
    title: "크레피카 블로그 | SEO와 크리에이터 워크플로우 가이드",
    description: "SEO, SNS 마케팅, 이미지 최적화, 콘텐츠 워크플로우, 무료 크리에이터 도구 활용법을 다루는 크레피카 가이드입니다.",
    canonical: `${siteUrl}/blog`,
    heading: "크레피카 블로그",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${siteUrl}/blog#collection`,
      url: `${siteUrl}/blog`,
      name: "크레피카 블로그",
      description: "실전 SEO, SNS 마케팅, 크리에이터 워크플로우, 이미지 최적화, 발행 점검 가이드를 모은 페이지입니다.",
      inLanguage: "ko-KR",
      isPartOf: { "@id": `${siteUrl}/#website` },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: latest.length,
        itemListElement: latest.slice(0, 20).map((post, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${siteUrl}/blog/${post.slug}`,
          name: post.title,
        })),
      },
    },
    bodyHtml: `<p class="lede">SEO, SNS 마케팅, 크리에이터 워크플로우, 이미지 최적화, 발행 점검에 필요한 실전 가이드를 모았습니다.</p><section class="panel"><h2>최신 가이드</h2><ol class="post-list">${links}</ol></section>`,
  });
}

function renderBlogPost(post) {
  const canonical = `${siteUrl}/blog/${post.slug}`;
  const faqItems = (post.faq ?? []).slice(0, 5);
  const sections = post.content.sections
    .map((section, index) => {
      const title = section.heading || section.title || "가이드 섹션";
      const subsections = (section.subsections ?? [])
        .map((subsection) => `<h3>${escapeHtml(subsection.subheading)}</h3><p>${escapeHtml(stripMarkdown(subsection.content))}</p>`)
        .join("\n");
      return `<section class="panel" id="section-${index}"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(stripMarkdown(section.content))}</p>${subsections}</section>`;
    })
    .join("\n");
  const toc = post.content.sections
    .map((section, index) => {
      const title = section.heading || section.title || `섹션 ${index + 1}`;
      return `<li><a href="#section-${index}">${escapeHtml(title)}</a></li>`;
    })
    .join("\n");
  const faq = faqItems
    .map((item) => `<h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(stripMarkdown(item.answer))}</p>`)
    .join("\n");
  const faqHtml = faq ? `<section class="panel"><h2>자주 묻는 질문</h2>${faq}</section>` : "";
  return renderShell({
    title: `${post.title} | Crepika`,
    description: post.description,
    canonical,
    heading: post.title,
    type: "article",
    structuredData: makeArticleStructuredData(post),
    bodyHtml: `<p class="lede">${escapeHtml(post.description)}</p>
      <p class="muted">발행일: ${escapeHtml(post.publishDate)} &middot; 분야: ${escapeHtml(post.category)} &middot; 읽는 시간: ${escapeHtml(post.readTime)}</p>
      <nav class="panel" aria-label="글 목차"><h2>글 목차</h2><ol>${toc}</ol></nav>
      <section class="panel"><h2>핵심 개요</h2><p>${escapeHtml(stripMarkdown(post.content.introduction))}</p></section>
      ${sections}
      <section class="panel"><h2>마무리</h2><p>${escapeHtml(stripMarkdown(post.content.conclusion))}</p></section>
      ${faqHtml}
      <section class="panel"><h2>다음 단계</h2><p>상단의 관련 크레피카 도구를 활용해 초안을 점검한 뒤, 이 가이드로 돌아와 최종 발행 전 구조와 표현을 다시 확인하세요.</p></section>`,
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

writePage(".well-known/security.txt", securityTxt);

console.log(`Generated ${staticPages.length + toolPages.length + 1 + posts.length} crawler-visible pages.`);
