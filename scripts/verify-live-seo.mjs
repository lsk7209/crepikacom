#!/usr/bin/env node
const SITE_URL = process.env.SITE_URL || "https://crepika.com";
const WWW_SITE_URL = "https://www.crepika.com";
const ADSENSE_CLIENT = "ca-pub-3050601904412736";
const ADS_TXT_LINE = "google.com, pub-3050601904412736, DIRECT, f08c47fec0942fa0";
const ROOT_HTML_PATHS = ["/"];
const SAMPLE_HTML_PATHS = ["/blog", "/tools/qr-generator", "/about", "/contact", "/privacy", "/terms"];
const SAMPLE_ARTICLE_PATH = "/blog/review-psychology-marketing";
const EXPECTED_JSON_LD_TYPES = {
  "/": ["WebSite", "Organization"],
  "/blog": ["CollectionPage", "BreadcrumbList"],
  "/tools/qr-generator": ["WebPage", "SoftwareApplication", "BreadcrumbList"],
  "/about": ["WebPage", "BreadcrumbList"],
  "/contact": ["WebPage", "BreadcrumbList"],
  "/privacy": ["WebPage", "BreadcrumbList"],
  "/terms": ["WebPage", "BreadcrumbList"],
  [SAMPLE_ARTICLE_PATH]: ["Article", "BreadcrumbList"],
};
const READABLE_HOME_MARKERS = ["\uD06C\uB808\uD53C\uCE74", "\uB85C\uADF8\uC778", "\uBB34\uB8CC"];
const REQUIRED_CRAWLER_SHELL_MARKERS = ["\uAE00 \uBAA9\uCC28", "\uB2E4\uC74C \uB2E8\uACC4", "\uC0AC\uC774\uD2B8 \uAC80\uD1A0 \uC815\uBCF4"];
const FORBIDDEN_CRAWLER_SHELL_MARKERS = ["Table of contents", "Next step", "Site and review context"];
const LEGACY_TOOL_REDIRECTS = {
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
const PUBLIC_ENDPOINT_HEADER_EXPECTATIONS = {
  "/robots.txt": { contentType: "text/plain", cacheControl: "public, max-age=3600, s-maxage=3600" },
  "/ads.txt": { contentType: "text/plain", cacheControl: "public, max-age=3600, s-maxage=3600" },
  "/sitemap.xml": { contentType: "application/xml", cacheControl: "public, max-age=3600, s-maxage=3600" },
  "/rss.xml": { contentType: "application/xml", cacheControl: "public, max-age=3600, s-maxage=3600" },
  "/feed.xml": { contentType: "application/xml", cacheControl: "public, max-age=3600, s-maxage=3600" },
  "/.well-known/security.txt": { contentType: "text/plain", cacheControl: "public, max-age=3600, s-maxage=3600" },
  "/llms.txt": { contentType: "text/plain", cacheControl: "public, max-age=3600, s-maxage=3600" },
  "/llms-full.txt": { contentType: "text/plain", cacheControl: "public, max-age=3600, s-maxage=3600" },
  "/ai-index.json": { contentType: "application/json", cacheControl: "public, max-age=3600, s-maxage=3600" },
};
const HTML_HEADER_EXPECTATIONS = {
  contentType: "text/html",
  cacheControl: "public, max-age=0, must-revalidate",
  xContentTypeOptions: "nosniff",
  xFrameOptions: "SAMEORIGIN",
  referrerPolicy: "strict-origin-when-cross-origin",
  permissionsPolicy: "camera=(), microphone=(), geolocation=()",
};

const failures = [];

function fail(message) {
  failures.push(message);
}

function countMatches(value, pattern) {
  return (value.match(pattern) ?? []).length;
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

async function getRedirect(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "CrepikaLiveSEOCheck/1.0",
    },
    redirect: "manual",
  });
  return {
    url,
    status: response.status,
    location: response.headers.get("location"),
  };
}

function hasMeaningfulMeta(body, options = {}) {
  const { requireH1 = true, requireBreadcrumb = true } = options;
  return {
    title: /<title>[^<]{10,}<\/title>/i.test(body),
    description: /<meta\s+name="description"\s+content="[^"]{40,}"/i.test(body),
    canonical: /<link\s+rel="canonical"\s+href="https:\/\/crepika\.com\//i.test(body),
    largeImagePreview: /<meta\s+name="robots"\s+content="[^"]*max-image-preview:large/i.test(body),
    ogImage: /<meta\s+property="og:image"\s+content="https:\/\/crepika\.com\/og-image\.png"/i.test(body),
    twitterCard: /<meta\s+name="twitter:card"\s+content="summary_large_image"/i.test(body),
    h1: !requireH1 || (body.match(/<h1\b/gi) || []).length === 1,
    breadcrumb: !requireBreadcrumb || hasJsonLdType(body, "BreadcrumbList"),
    adsense: body.includes("ca-pub-3050601904412736"),
  };
}

function extractJsonLdObjects(body) {
  const blocks = [
    ...body.matchAll(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ].map((match) => match[1].trim());

  const objects = [];
  for (const block of blocks) {
    try {
      const parsed = JSON.parse(block);
      objects.push(...(Array.isArray(parsed) ? parsed : [parsed]));
    } catch {
      return [];
    }
  }
  return objects;
}

function extractJsonLdTypes(objects) {
  const types = [];
  const stack = [...objects];
  while (stack.length) {
    const entry = stack.shift();
    if (!entry || typeof entry !== "object") continue;
    if (entry["@type"]) {
      types.push(...(Array.isArray(entry["@type"]) ? entry["@type"] : [entry["@type"]]));
    }
    if (Array.isArray(entry["@graph"])) {
      stack.push(...entry["@graph"]);
    }
  }
  return [...new Set(types)];
}

function hasJsonLdType(body, type) {
  return extractJsonLdObjects(body).some((entry) => entry?.["@type"] === type);
}

function validateJsonLdTypes(path, body) {
  const expectedTypes = EXPECTED_JSON_LD_TYPES[path] ?? [];
  const objects = extractJsonLdObjects(body);
  const types = extractJsonLdTypes(objects);

  if (!objects.length) {
    fail(`${path} must expose parseable JSON-LD structured data.`);
  }
  for (const type of expectedTypes) {
    if (!types.includes(type)) {
      fail(`${path} JSON-LD must include ${type}.`);
    }
  }

  return {
    blocks: (body.match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>/gi) ?? []).length,
    types,
    expectedTypes,
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

function validateCrawlerShellLanguage(path, body) {
  for (const marker of REQUIRED_CRAWLER_SHELL_MARKERS) {
    if (!body.includes(marker)) {
      fail(`${path} is missing required Korean crawler shell marker: ${marker}`);
    }
  }
  for (const marker of FORBIDDEN_CRAWLER_SHELL_MARKERS) {
    if (body.includes(marker)) {
      fail(`${path} contains untranslated crawler shell marker: ${marker}`);
    }
  }
  return {
    koreanShell: REQUIRED_CRAWLER_SHELL_MARKERS.every((marker) => body.includes(marker)),
    untranslatedShell: FORBIDDEN_CRAWLER_SHELL_MARKERS.filter((marker) => body.includes(marker)),
  };
}

function validateAdSenseAutoAds(path, body) {
  const hasAccountMeta = body.includes(`name="google-adsense-account" content="${ADSENSE_CLIENT}"`);
  const loaderCount = countMatches(
    body,
    new RegExp(`pagead2\\.googlesyndication\\.com/pagead/js/adsbygoogle\\.js\\?client=${ADSENSE_CLIENT}`, "g"),
  );
  const manualSlotCount =
    countMatches(body, /<ins[^>]+class=["'][^"']*adsbygoogle/gi) +
    countMatches(body, /adsbygoogle\.push\s*\(/g);

  if (!hasAccountMeta) {
    fail(`${path} is missing the google-adsense-account meta tag.`);
  }
  if (loaderCount !== 1) {
    fail(`${path} must load the AdSense Auto Ads script exactly once; found ${loaderCount}.`);
  }
  if (manualSlotCount > 0) {
    fail(`${path} contains manual AdSense slot code despite the Auto Ads-only policy.`);
  }

  return {
    accountMeta: hasAccountMeta,
    autoAdsLoaderCount: loaderCount,
    manualSlotCount,
    autoAdsOnly: hasAccountMeta && loaderCount === 1 && manualSlotCount === 0,
  };
}

function validatePublicEndpointHeaders(path, response) {
  const expected = PUBLIC_ENDPOINT_HEADER_EXPECTATIONS[path];
  if (!expected) return null;

  const contentType = response.headers.get("content-type") ?? "";
  const cacheControl = response.headers.get("cache-control") ?? "";
  const xContentTypeOptions = response.headers.get("x-content-type-options") ?? "";

  if (!contentType.toLowerCase().startsWith(expected.contentType)) {
    fail(`${path} must use ${expected.contentType} content-type; got ${contentType || "missing"}.`);
  }
  if (cacheControl !== expected.cacheControl) {
    fail(`${path} must use cache-control ${expected.cacheControl}; got ${cacheControl || "missing"}.`);
  }
  if (xContentTypeOptions.toLowerCase() !== "nosniff") {
    fail(`${path} must send X-Content-Type-Options: nosniff.`);
  }

  return {
    contentType,
    cacheControl,
    xContentTypeOptions,
  };
}

function validateHtmlHeaders(path, response) {
  const headers = {
    contentType: response.headers.get("content-type") ?? "",
    cacheControl: response.headers.get("cache-control") ?? "",
    xContentTypeOptions: response.headers.get("x-content-type-options") ?? "",
    xFrameOptions: response.headers.get("x-frame-options") ?? "",
    referrerPolicy: response.headers.get("referrer-policy") ?? "",
    permissionsPolicy: response.headers.get("permissions-policy") ?? "",
  };

  if (!headers.contentType.toLowerCase().startsWith(HTML_HEADER_EXPECTATIONS.contentType)) {
    fail(`${path} must use ${HTML_HEADER_EXPECTATIONS.contentType} content-type; got ${headers.contentType || "missing"}.`);
  }
  for (const [key, expected] of Object.entries(HTML_HEADER_EXPECTATIONS)) {
    if (key === "contentType") continue;
    if (headers[key] !== expected) {
      fail(`${path} must send ${key}=${expected}; got ${headers[key] || "missing"}.`);
    }
  }

  return headers;
}

async function validateTextEndpoint(path, predicate, message) {
  const { response, body } = await get(path);
  if (!response.ok) fail(`${path} returned HTTP ${response.status}.`);
  const headers = validatePublicEndpointHeaders(path, response);
  if (!predicate(body)) fail(message);
  return {
    path,
    status: response.status,
    bytes: body.length,
    ...(headers ? { headers } : {}),
  };
}

async function validateAiIndexEndpoint() {
  const path = "/ai-index.json";
  const { response, body } = await get(path);
  if (!response.ok) fail(`${path} returned HTTP ${response.status}.`);
  const headers = validatePublicEndpointHeaders(path, response);

  let aiIndex = null;
  try {
    aiIndex = JSON.parse(body);
  } catch (error) {
    fail(`${path} is not valid JSON: ${error instanceof Error ? error.message : error}`);
  }

  const siteOk =
    aiIndex?.site?.url === SITE_URL &&
    aiIndex?.site?.name_ko === "\uD06C\uB808\uD53C\uCE74" &&
    aiIndex?.blog?.rss === `${SITE_URL}/rss.xml`;
  const toolCount = Array.isArray(aiIndex?.tools) ? aiIndex.tools.length : 0;
  const blogCount = Number(aiIndex?.blog?.count ?? 0);

  if (!siteOk) {
    fail(`${path} must expose the canonical site URL, Korean brand name, and canonical RSS URL.`);
  }
  if (toolCount < 10) {
    fail(`${path} should expose a substantial published tool index; found ${toolCount}.`);
  }
  if (blogCount < 300) {
    fail(`${path} should expose a substantial blog count; found ${blogCount}.`);
  }

  return {
    path,
    status: response.status,
    bytes: body.length,
    ...(headers ? { headers } : {}),
    aiIndex: {
      site: siteOk,
      tools: toolCount,
      blogCount,
    },
  };
}

async function main() {
  const checks = [];

  for (const [path, expectedLocation] of [
    ["/", `${SITE_URL}/`],
    ["/blog", `${SITE_URL}/blog`],
  ]) {
    const redirect = await getRedirect(`${WWW_SITE_URL}${path}`);
    const pointsToCanonicalHost = [307, 308].includes(redirect.status) && redirect.location === expectedLocation;
    const isPermanent = redirect.status === 308;
    if (!pointsToCanonicalHost) {
      fail(
        `${redirect.url} must redirect to the canonical host ${expectedLocation}; got ${redirect.status} ${redirect.location}.`,
      );
    }
    checks.push({
      path: `${WWW_SITE_URL}${path}`,
      status: redirect.status,
      location: redirect.location,
      canonicalHostRedirect: pointsToCanonicalHost,
      permanent: isPermanent,
    });
  }

  for (const [legacyToolId, canonicalToolId] of Object.entries(LEGACY_TOOL_REDIRECTS)) {
    const legacyPath = `/tools/${legacyToolId}`;
    const canonicalPath = `/tools/${canonicalToolId}`;
    const redirect = await getRedirect(`${SITE_URL}${legacyPath}`);
    const pointsToCanonicalTool =
      redirect.status === 308 &&
      [canonicalPath, `${SITE_URL}${canonicalPath}`].includes(redirect.location);
    if (!pointsToCanonicalTool) {
      fail(
        `${redirect.url} must 308 redirect to ${canonicalPath}; got ${redirect.status} ${redirect.location}.`,
      );
    }
    checks.push({
      path: legacyPath,
      status: redirect.status,
      location: redirect.location,
      canonicalToolRedirect: pointsToCanonicalTool,
      permanent: redirect.status === 308,
    });
  }

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
  checks.push(
    await validateTextEndpoint(
      "/llms.txt",
      (body) =>
        body.includes(SITE_URL) &&
        body.includes(`${SITE_URL}/rss.xml`) &&
        body.includes(`${SITE_URL}/sitemap.xml`),
      "llms.txt must expose the canonical site, RSS, and sitemap URLs.",
    ),
  );
  checks.push(
    await validateTextEndpoint(
      "/llms-full.txt",
      (body) =>
        body.includes(SITE_URL) &&
        body.includes(`${SITE_URL}/rss.xml`) &&
        body.includes(`${SITE_URL}/sitemap.xml`) &&
        body.includes(`${SITE_URL}/blog/`),
      "llms-full.txt must expose canonical URLs for the site, feed, sitemap, and blog entries.",
    ),
  );
  checks.push(await validateAiIndexEndpoint());

  for (const path of ROOT_HTML_PATHS) {
    const { response, body } = await get(path);
    if (!response.ok) fail(`${path} returned HTTP ${response.status}.`);
    const headers = validateHtmlHeaders(path, response);
    const structuredData = validateJsonLdTypes(path, body);
    const meta = hasMeaningfulMeta(body, { requireH1: false, requireBreadcrumb: false });
    for (const [name, ok] of Object.entries(meta)) {
      if (!ok) fail(`${path} is missing live root HTML marker: ${name}.`);
    }
    for (const marker of READABLE_HOME_MARKERS) {
      if (!body.includes(marker)) {
        fail(`${path} is missing readable Korean root marker: ${marker}.`);
      }
    }
    checks.push({
      path,
      status: response.status,
      bytes: body.length,
      headers,
      htmlBasics: meta,
      structuredData,
      adsensePolicy: validateAdSenseAutoAds(path, body),
      readableRootText: true,
    });
  }

  for (const path of SAMPLE_HTML_PATHS) {
    const { response, body } = await get(path);
    if (!response.ok) fail(`${path} returned HTTP ${response.status}.`);
    const headers = validateHtmlHeaders(path, response);
    const structuredData = validateJsonLdTypes(path, body);
    const meta = hasMeaningfulMeta(body);
    for (const [name, ok] of Object.entries(meta)) {
      if (!ok) fail(`${path} is missing live HTML marker: ${name}.`);
    }
    validateHeadingOrder(path, body);
    checks.push({
      path,
      status: response.status,
      bytes: body.length,
      headers,
      htmlBasics: meta,
      structuredData,
      adsensePolicy: validateAdSenseAutoAds(path, body),
    });
  }

  {
    const path = SAMPLE_ARTICLE_PATH;
    const { response, body } = await get(path);
    if (!response.ok) fail(`${path} returned HTTP ${response.status}.`);
    const headers = validateHtmlHeaders(path, response);
    const structuredData = validateJsonLdTypes(path, body);
    const meta = hasMeaningfulMeta(body);
    for (const [name, ok] of Object.entries(meta)) {
      if (!ok) fail(`${path} is missing live article HTML marker: ${name}.`);
    }
    validateHeadingOrder(path, body);
    const shellLanguage = validateCrawlerShellLanguage(path, body);
    checks.push({
      path,
      status: response.status,
      bytes: body.length,
      headers,
      htmlBasics: meta,
      structuredData,
      adsensePolicy: validateAdSenseAutoAds(path, body),
      shellLanguage,
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
