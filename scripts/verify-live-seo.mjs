#!/usr/bin/env node
const SITE_URL = process.env.SITE_URL || "https://crepika.com";
const ADS_TXT_LINE = "google.com, pub-3050601904412736, DIRECT, f08c47fec0942fa0";
const SAMPLE_HTML_PATHS = ["/blog", "/tools/qr-generator", "/about", "/contact", "/privacy", "/terms"];

const failures = [];

function fail(message) {
  failures.push(message);
}

async function get(path) {
  const url = path.startsWith("http") ? path : `${SITE_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      "user-agent": "CrepikaLiveSEOCheck/1.0",
    },
    redirect: "follow",
  });
  const body = await response.text();
  return { url, response, body };
}

function hasMeaningfulMeta(body) {
  return {
    title: /<title>[^<]{10,}<\/title>/i.test(body),
    description: /<meta\s+name="description"\s+content="[^"]{40,}"/i.test(body),
    canonical: /<link\s+rel="canonical"\s+href="https:\/\/crepika\.com\//i.test(body),
    largeImagePreview: /<meta\s+name="robots"\s+content="[^"]*max-image-preview:large/i.test(body),
    ogImage: /<meta\s+property="og:image"\s+content="https:\/\/crepika\.com\/og-image\.png"/i.test(body),
    twitterCard: /<meta\s+name="twitter:card"\s+content="summary_large_image"/i.test(body),
    h1: (body.match(/<h1\b/gi) || []).length === 1,
    adsense: body.includes("ca-pub-3050601904412736"),
  };
}

function allowsGeneralCrawlers(body) {
  const normalized = body.replace(/\r\n/g, "\n");
  const sections = normalized.split(/\n(?=User-agent:)/i);
  const generalSection = sections.find((section) => /^User-agent:\s*\*/im.test(section));
  return Boolean(generalSection) && !/^Disallow:\s*\/\s*$/im.test(generalSection);
}

function validateHeadingOrder(path, body) {
  const hLevels = [...body.matchAll(/<h([1-6])\b/gi)].map((match) => Number(match[1]));
  if (hLevels[0] !== 1) {
    fail(`${path} heading hierarchy must start with H1.`);
    return;
  }
  for (let index = 1; index < hLevels.length; index++) {
    if (hLevels[index] > hLevels[index - 1] + 1) {
      fail(`${path} skips heading level H${hLevels[index - 1]} to H${hLevels[index]}.`);
      return;
    }
  }
}

async function validateTextEndpoint(path, predicate, message) {
  const { response, body } = await get(path);
  if (!response.ok) fail(`${path} returned HTTP ${response.status}.`);
  if (!predicate(body)) fail(message);
  return {
    path,
    status: response.status,
    bytes: body.length,
  };
}

async function main() {
  const checks = [];

  checks.push(
    await validateTextEndpoint(
      "/robots.txt",
      (body) => body.includes(`Sitemap: ${SITE_URL}/sitemap.xml`) && allowsGeneralCrawlers(body),
      "robots.txt must expose the canonical sitemap and must not block all crawlers.",
    ),
  );
  checks.push(
    await validateTextEndpoint(
      "/ads.txt",
      (body) => body.trim() === ADS_TXT_LINE,
      "ads.txt does not match the approved AdSense publisher line.",
    ),
  );
  checks.push(
    await validateTextEndpoint(
      "/sitemap.xml",
      (body) =>
        body.trimStart().startsWith('<?xml version="1.0" encoding="UTF-8"?>') &&
        body.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"') &&
        (body.match(/<loc>/g) || []).length >= 300,
      "sitemap.xml is not a substantial canonical XML sitemap.",
    ),
  );
  checks.push(
    await validateTextEndpoint(
      "/rss.xml",
      (body) =>
        body.trimStart().startsWith('<?xml version="1.0" encoding="UTF-8"') &&
        body.includes("<channel>") &&
        body.includes("<language>ko-KR</language>") &&
        (body.match(/<item>/g) || []).length >= 20,
      "rss.xml is not a substantial ko-KR RSS feed.",
    ),
  );
  checks.push(
    await validateTextEndpoint(
      "/feed.xml",
      (body) =>
        body.trimStart().startsWith('<?xml version="1.0" encoding="UTF-8"') &&
        body.includes("<channel>") &&
        body.includes("<language>ko-KR</language>") &&
        body.includes(`href="${SITE_URL}/feed.xml"`) &&
        (body.match(/<item>/g) || []).length >= 20,
      "feed.xml is not a substantial ko-KR RSS feed alias.",
    ),
  );
  checks.push(
    await validateTextEndpoint(
      "/.well-known/security.txt",
      (body) =>
        body.includes("Contact: mailto:support@crepika.com") &&
        body.includes("Preferred-Languages: ko, en") &&
        body.includes(`Canonical: ${SITE_URL}/.well-known/security.txt`) &&
        body.includes(`Policy: ${SITE_URL}/privacy`) &&
        body.includes("Expires: 2027-06-10T00:00:00Z"),
      "security.txt must expose the canonical support contact and policy URL.",
    ),
  );

  for (const path of SAMPLE_HTML_PATHS) {
    const { response, body } = await get(path);
    if (!response.ok) fail(`${path} returned HTTP ${response.status}.`);
    const meta = hasMeaningfulMeta(body);
    for (const [name, ok] of Object.entries(meta)) {
      if (!ok) fail(`${path} is missing live HTML marker: ${name}.`);
    }
    validateHeadingOrder(path, body);
    checks.push({
      path,
      status: response.status,
      bytes: body.length,
      htmlBasics: meta,
    });
  }

  if (failures.length) {
    console.error("Live SEO verification failed:");
    for (const message of failures) console.error(`- ${message}`);
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        site: SITE_URL,
        checks,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
