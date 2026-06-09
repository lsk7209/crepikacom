# Crepika Utility Tool Expansion Plan

## Goal

Create 100 useful, browser-first utility tools that fit Crepika's creator, SEO, SNS, and content workflow concept. The tools should increase organic search coverage, repeat usage, internal linking opportunities, and AdSense approval confidence without adding manual ad slots or external API dependence.

## Operating Principles

- Every tool must solve one concrete creator or marketer problem in under 30 seconds.
- Core processing should run in the browser whenever possible.
- No login, no upload to server, no external AI/API dependency for tool output.
- Each tool page needs its own meta title, meta description, canonical URL, FAQ, HowTo schema, and sitemap inclusion only after publication.
- Auto Ads only. Do not place manual AdSense slots.
- Publish gradually: one tool every five hours from a pre-reviewed queue.
- Build reusable tool shells so 100 pages do not become 100 unrelated implementations.

## Tool Quality Standard

Each tool should include:

- Clear input area with example placeholder.
- One primary action.
- Useful result summary.
- Copy button and reset button.
- Download button only when the result is a file, table, CSV, TXT, PNG, or JSON.
- At least three practical interpretation tips.
- FAQ with direct answers.
- Related tools block with at least three internal links.
- Privacy note when user input may contain URLs, text, filenames, or campaign data.

## Recommended Architecture

### 1. Data Model

Add a publication queue separate from blog posts:

- `site-config/tool-roadmap-100.json`: source roadmap and editorial metadata.
- `scripts/tool-queue.json`: active publication queue.
- `src/data/tools-config.ts`: only published tools are exposed to users.
- `src/data/tool-content.ts`: detailed article/FAQ/HowTo content.
- `src/tools/generated/`: reusable tool implementations for simple calculator/formatter/checker tools.

### 2. Tool Types

Use four implementation templates:

- `text-transform`: input text -> cleaned, formatted, scored, or converted text.
- `score-checker`: input text/URL fields -> checklist score and recommendations.
- `calculator`: numeric fields -> calculated metrics and interpretation.
- `builder`: structured fields -> generated URL, brief, checklist, CSV, or markdown.

This avoids bespoke code for every small tool.

### 3. Five-Hour Release Model

Do not rely on `cron: 0 */5 * * *` alone because it creates uneven day boundaries. Use:

- GitHub Actions every hour.
- Script checks `lastPublishedAt`.
- If at least five hours passed, publish the next queued tool.
- Commit updated config, sitemap, crawler page, RSS/tools feed, and queue state.

Result: exactly throttled release behavior without needing a long-running local scheduler.

### 4. Publication State

Tool queue entry states:

- `draft`: planned but not implemented.
- `ready`: implemented and passed local verification.
- `scheduled`: ready and assigned to release order.
- `published`: exposed in config, sitemap, static crawler page, and navigation/search.
- `held`: paused due to quality, duplicate, or policy risk.

Only `ready` or `scheduled` tools can be auto-published.

## 100-Tool Roadmap

### SEO And Blog Tools

| No | Tool | User Value | Type |
| --- | --- | --- | --- |
| 1 | SEO Title Length Checker | Checks Google/Naver title length, keyword position, and truncation risk. | score-checker |
| 2 | Meta Description Checker | Scores description length, front-loaded keyword, CTA, and duplicate wording risk. | score-checker |
| 3 | H Tag Structure Checker | Checks whether H1/H2/H3 hierarchy is orderly from pasted outline. | score-checker |
| 4 | Blog Outline Builder | Turns a topic into an H2/H3 outline template without using external AI. | builder |
| 5 | FAQ Schema Draft Builder | Converts questions and answers into JSON-LD FAQ schema. | builder |
| 6 | HowTo Schema Draft Builder | Converts step-by-step instructions into HowTo JSON-LD. | builder |
| 7 | Article Word Count Planner | Estimates target word count by content type and section count. | calculator |
| 8 | Keyword Density Checker | Calculates keyword frequency, phrase repetition, and stuffing risk. | score-checker |
| 9 | Internal Link Anchor Planner | Builds anchor text candidates from target URL, keyword, and intent. | builder |
| 10 | Blog CTA Checker | Scores whether a CTA is clear, specific, and placed near action points. | score-checker |
| 11 | SERP Snippet Preview | Previews title, URL, and meta description as search snippet. | builder |
| 12 | Slug Generator | Converts Korean/English titles into readable lowercase URL slugs. | text-transform |
| 13 | Alt Text Helper | Builds concise image alt text from image subject, context, and keyword. | builder |
| 14 | Content Freshness Checklist | Checks dates, statistics, screenshots, links, and review notes. | score-checker |
| 15 | E-E-A-T Signal Checker | Checks author, sources, examples, experience, and update notes. | score-checker |
| 16 | Blog Intro Hook Checker | Scores the first paragraph for problem, audience, and promised outcome. | score-checker |
| 17 | Paragraph Readability Checker | Finds overly long paragraphs and suggests split points. | score-checker |
| 18 | List-To-Table Converter | Converts bullet lists into markdown tables for clearer comparisons. | text-transform |
| 19 | Markdown Table Builder | Generates markdown tables from rows and columns. | builder |
| 20 | Source Link Organizer | Organizes external sources with title, publisher, date, and purpose. | builder |

### SNS And Creator Publishing Tools

| No | Tool | User Value | Type |
| --- | --- | --- | --- |
| 21 | Instagram Caption Structure Builder | Creates caption sections: hook, value, proof, CTA, hashtags. | builder |
| 22 | Reels Hook Bank Builder | Generates reusable hook patterns from topic and audience. | builder |
| 23 | YouTube Title Length Checker | Checks title length, clarity, and front-loaded keyword. | score-checker |
| 24 | YouTube Description Formatter | Structures description, chapters, links, and CTA. | text-transform |
| 25 | Shorts Script Timer | Estimates spoken duration from Korean or English script. | calculator |
| 26 | Thread Post Splitter | Splits long text into numbered thread posts. | text-transform |
| 27 | LinkedIn Post Formatter | Formats long professional posts with short paragraphs and CTA. | text-transform |
| 28 | Hashtag Group Planner | Builds branded, niche, and broad hashtag groups. | builder |
| 29 | Hashtag Rotation Tracker | Helps rotate hashtag sets to reduce repetition. | builder |
| 30 | Social Bio Length Checker | Checks profile bio length and CTA clarity. | score-checker |
| 31 | Creator Media Kit Checklist | Builds a simple media kit checklist for creators. | builder |
| 32 | Collaboration Email Builder | Creates a structured collaboration inquiry template. | builder |
| 33 | Comment Reply Template Builder | Builds polite reply templates for common creator comments. | builder |
| 34 | Pinned Comment CTA Builder | Creates pinned comment CTA variants for SNS posts. | builder |
| 35 | Content Repurpose Planner | Converts one idea into blog, reel, thread, newsletter, and short posts. | builder |
| 36 | Publishing Calendar Planner | Creates a weekly posting grid by platform and goal. | builder |
| 37 | Hook Strength Checker | Scores a short hook for specificity, tension, and audience fit. | score-checker |
| 38 | Caption Line Break Cleaner | Cleans extra spaces and normalizes line breaks. | text-transform |
| 39 | Emoji Density Checker | Checks whether emoji usage is excessive or readable. | score-checker |
| 40 | SNS CTA Library Builder | Builds CTA variants by platform and funnel stage. | builder |

### Image, File, And Asset Tools

| No | Tool | User Value | Type |
| --- | --- | --- | --- |
| 41 | Image Aspect Ratio Checker | Calculates aspect ratio and platform fit. | calculator |
| 42 | Thumbnail Size Planner | Gives recommended dimensions for YouTube, blog, OG, and SNS. | calculator |
| 43 | Filename SEO Cleaner | Converts messy image filenames into readable SEO-friendly names. | text-transform |
| 44 | Batch Filename Planner | Generates a batch filename pattern with sequence numbers. | builder |
| 45 | Image Compression Savings Calculator | Estimates size savings from compression or WebP conversion. | calculator |
| 46 | OG Image Text Checker | Checks whether title text is short enough for social previews. | score-checker |
| 47 | Color Contrast Checker | Checks foreground/background contrast ratio. | score-checker |
| 48 | Brand Color Palette Notes | Builds palette notes with primary, accent, warning, and neutral colors. | builder |
| 49 | SVG Data URI Encoder | Encodes SVG into CSS-safe data URI. | text-transform |
| 50 | Base64 Image Size Estimator | Estimates base64 overhead for embedded images. | calculator |
| 51 | EXIF Privacy Checklist | Guides users on what metadata to remove before publishing. | score-checker |
| 52 | Image Alt Batch Planner | Creates alt text worksheet rows for multiple images. | builder |
| 53 | Favicon Checklist Builder | Lists required favicon and app icon sizes. | builder |
| 54 | Open Graph Image Checklist | Checks OG image dimensions, text length, and safe area. | score-checker |
| 55 | File Size Unit Converter | Converts bytes, KB, MB, GB, and MiB. | calculator |

### URL, Tracking, And Campaign Tools

| No | Tool | User Value | Type |
| --- | --- | --- | --- |
| 56 | UTM URL Builder | Builds clean campaign URLs with standardized parameters. | builder |
| 57 | UTM Consistency Checker | Detects mixed case, spaces, and inconsistent source names. | score-checker |
| 58 | URL Encoder Decoder | Encodes and decodes URL components. | text-transform |
| 59 | Query String Parser | Parses URL query params into a readable table. | text-transform |
| 60 | Link Cleanup Tool | Removes tracking parameters while preserving useful params. | text-transform |
| 61 | QR Campaign URL Builder | Combines UTM and QR campaign naming. | builder |
| 62 | Redirect Chain Notes Builder | Helps document observed redirect hops manually. | builder |
| 63 | Canonical URL Checklist | Checks URL host, slash, query, and canonical consistency. | score-checker |
| 64 | Sitemap URL Batch Builder | Creates a list of URLs for sitemap review. | builder |
| 65 | Robots Rule Draft Builder | Drafts simple robots.txt allow/disallow notes. | builder |
| 66 | Anchor Text Variation Builder | Creates safe anchor text variants for internal links. | builder |
| 67 | Broken Link Outreach Template | Builds a polite broken-link replacement email. | builder |
| 68 | Affiliate Disclosure Builder | Creates concise disclosure text templates. | builder |
| 69 | Campaign Naming Convention Builder | Creates naming rules for source, medium, campaign, and content. | builder |
| 70 | Landing Page CTA URL Builder | Builds CTA URLs with campaign labels and notes. | builder |

### Analytics, Revenue, And Growth Calculators

| No | Tool | User Value | Type |
| --- | --- | --- | --- |
| 71 | CTR Calculator | Calculates click-through rate and needed clicks. | calculator |
| 72 | Conversion Rate Calculator | Calculates conversions, rate, and needed sessions. | calculator |
| 73 | AdSense RPM Calculator | Calculates page RPM from earnings and pageviews. | calculator |
| 74 | AdSense CPC Calculator | Estimates CPC from revenue and clicks. | calculator |
| 75 | Newsletter Growth Calculator | Projects subscriber growth and churn. | calculator |
| 76 | Engagement Rate Calculator | Calculates engagement by followers or reach. | calculator |
| 77 | Content ROI Calculator | Estimates return from content cost and revenue. | calculator |
| 78 | Break-Even Calculator | Calculates sales or conversions needed to break even. | calculator |
| 79 | A/B Test Sample Notes | Helps estimate whether a test has enough data. | calculator |
| 80 | Publishing Pace Calculator | Calculates how long a content queue lasts by cadence. | calculator |
| 81 | Keyword Opportunity Scorer | Scores keyword ideas by intent, difficulty note, and business fit. | score-checker |
| 82 | Content Decay Monitor Sheet Builder | Builds rows for monitoring old content performance. | builder |
| 83 | Lead Magnet Math Calculator | Estimates leads from traffic, opt-in rate, and conversion rate. | calculator |
| 84 | Creator Pricing Calculator | Estimates sponsored post pricing from reach and engagement. | calculator |
| 85 | Funnel Drop-Off Calculator | Calculates step-by-step funnel loss. | calculator |

### Productivity, Formatting, And Developer-Friendly Tools

| No | Tool | User Value | Type |
| --- | --- | --- | --- |
| 86 | Markdown Cleaner | Cleans messy markdown spacing and headings. | text-transform |
| 87 | HTML Entity Converter | Converts HTML entities to text and text to entities. | text-transform |
| 88 | JSON Formatter | Formats, validates, and minifies JSON locally. | text-transform |
| 89 | CSV To Markdown Table | Converts CSV into markdown tables. | text-transform |
| 90 | Markdown To Plain Text | Removes markdown syntax for clean copy. | text-transform |
| 91 | Text Deduplicator | Removes duplicate lines while preserving order. | text-transform |
| 92 | Case Converter | Converts text to lower, upper, title, kebab, snake, and camel case. | text-transform |
| 93 | Regex Escape Tool | Escapes text for safe regex usage. | text-transform |
| 94 | HTML Meta Tag Builder | Builds meta title, description, canonical, OG, and Twitter tags. | builder |
| 95 | JSON-LD Organization Builder | Builds Organization schema from site details. | builder |
| 96 | Checklist Builder | Turns pasted notes into checkbox markdown. | text-transform |
| 97 | Meeting Notes To Action Items | Extracts action-item style lines from notes. | text-transform |
| 98 | Prompt Brief Builder | Builds structured briefs for writers, designers, or developers. | builder |
| 99 | Privacy Policy Input Checklist | Helps users list data types used by a tool or site. | builder |
| 100 | Tool Idea Scorer | Scores new utility ideas by usefulness, search demand, uniqueness, and build effort. | score-checker |

## First 20 Build Order

Start with tools that are useful, low-risk, and template-friendly:

1. SEO Title Length Checker
2. Meta Description Checker
3. Slug Generator
4. UTM URL Builder
5. URL Encoder Decoder
6. CTR Calculator
7. Conversion Rate Calculator
8. AdSense RPM Calculator
9. Markdown Cleaner
10. CSV To Markdown Table
11. JSON Formatter
12. Image Aspect Ratio Checker
13. Filename SEO Cleaner
14. Instagram Caption Structure Builder
15. Thread Post Splitter
16. YouTube Description Formatter
17. Blog CTA Checker
18. FAQ Schema Draft Builder
19. HowTo Schema Draft Builder
20. Paragraph Readability Checker

These establish the reusable templates before moving to the remaining 80.

## Automation Plan

### Files To Add

- `.github/workflows/auto-publish-tools.yml`
- `scripts/publish-tool-once.mjs`
- `scripts/tool-queue.json`
- `scripts/generate-tool-pages.mjs` or extend `scripts/generate-crawler-pages.mjs`

### Publish Logic

1. Load `scripts/tool-queue.json`.
2. Read the latest `publishedAt` timestamp.
3. If fewer than five hours have passed, exit without changes.
4. Find the first `scheduled` or `ready` tool.
5. Add it to published tool config.
6. Update sitemap and crawler page generation inputs.
7. Mark queue item as `published`.
8. Commit and push through GitHub only.

### Workflow Schedule

Use hourly cron:

```yaml
schedule:
  - cron: "7 * * * *"
```

The script enforces the five-hour gap. This is safer than relying on GitHub cron precision alone.

## SEO/GEO/AEO Requirements Per Tool

- Meta title format: `{Tool Name} - {Primary Use} | 크레피카`
- Description: concrete task, no hype, includes "무료", "로그인 없음" where true.
- Canonical: `https://crepika.com/tools/{slug}`
- Schema:
  - `SoftwareApplication`
  - `FAQPage`
  - `HowTo` when steps are meaningful
- Page copy:
  - One clear problem statement.
  - One short usage guide.
  - Three practical tips.
  - Five FAQ items.
  - Related tools.

## Risk Controls

- Do not publish empty shell tools.
- Do not expose "AI" tools unless the output is deterministic and local.
- Do not promise legal, financial, medical, or guaranteed SEO outcomes.
- Do not add ad slots.
- Do not add tools that require user secrets, passwords, tokens, or private account data.
- Keep generated pages lightweight to avoid worsening the current large `blog-data` chunk warning.

## Success Metrics

- 100 tools published over about 21 days.
- Every published tool returns useful output without a network call.
- Sitemap includes only published tools.
- GSC can fetch every tool URL.
- Tool pages generate internal links to blog posts and related tools.
- No increase in manual ad layout CLS risk.

