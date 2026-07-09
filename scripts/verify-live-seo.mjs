#!/usr/bin/env node
const SITE_URL = process.env.SITE_URL || "https://crepika.com";
const WWW_SITE_URL = "https://www.crepika.com";
const ADSENSE_CLIENT = "ca-pub-3050601904412736";
const GA4_MEASUREMENT_ID = "G-P8LJ76FVM4";
const ADS_TXT_LINE = "google.com, pub-3050601904412736, DIRECT, f08c47fec0942fa0";
const ROOT_HTML_PATHS = ["/"];
const SAMPLE_HTML_PATHS = ["/blog", "/tools/qr-generator", "/about", "/contact", "/privacy", "/terms"];
const SAMPLE_ARTICLE_PATH = "/blog/review-psychology-marketing";
const EXPECTED_JSON_LD_TYPES = {
  "/": ["WebSite", "Organization"],
  "/blog": ["Organization", "WebSite", "CollectionPage", "BreadcrumbList"],
  "/tools/qr-generator": ["Organization", "WebSite", "WebPage", "SoftwareApplication", "BreadcrumbList"],
  "/about": ["Organization", "WebSite", "WebPage", "BreadcrumbList"],
  "/contact": ["Organization", "WebSite", "WebPage", "BreadcrumbList"],
  "/privacy": ["Organization", "WebSite", "WebPage", "BreadcrumbList"],
  "/terms": ["Organization", "WebSite", "WebPage", "BreadcrumbList"],
  [SAMPLE_ARTICLE_PATH]: ["Organization", "WebSite", "Article", "FAQPage", "BreadcrumbList"],
};
const SITE_IDENTITY_SAMPLE_PATHS = new Set([...ROOT_HTML_PATHS, ...SAMPLE_HTML_PATHS, SAMPLE_ARTICLE_PATH]);
const BRAND_NAME_KO = "\uD06C\uB808\uD53C\uCE74";
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
  "analytics-dashboard": "engagement-rate-calculator",
  "revenue-calculator": "adsense-rpm-calculator",
  "sns-analytics": "ctr-calculator",
  "sns-calendar": "utm-url-builder",
};
const LEGACY_BLOG_REDIRECTS = {
  "threads-marketing-complete-guide-meta-threads-follower-2026-": "threads-marketing-complete-guide-meta-threads-follower-2026",
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
const ROOT_ROUTE_SEGMENTS = new Set(["blog", "tools", "topics"]);
const ALLOWED_STATIC_ROUTES = new Set([
  "/",
  "/about",
  "/contact",
  "/editorial-policy",
  "/privacy",
  "/terms",
  "/tool-data-policy",
  "/topics/seo",
  "/topics/instagram",
  "/topics/adsense",
  "/topics/creator-tools",
  "/rss.xml",
  "/feed.xml",
  "/sitemap.xml",
  "/robots.txt",
  "/ads.txt",
  "/llms.txt",
  "/llms-full.txt",
  "/ai-index.json",
  "/.well-known/security.txt",
]);
const GENERIC_ROUTE_SEGMENTS = new Set(["article", "content", "draft", "index", "new", "page", "post", "temp", "test"]);

const failures = [];

function fail(message) {
  failures.push(message);
}

function countMatches(value, pattern) {
  return (value.match(pattern) ?? []).length;
}

function extractXmlTags(source, tag) {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "g");
  return [...source.matchAll(re)].map((match) => match[1].trim());
}

function validateReadableUrlPath(path, context) {
  if (!path.startsWith("/")) {
    fail(`${context} must start with a slash: ${path}`);
    return;
  }
  if (path !== "/" && path.endsWith("/")) {
    fail(`${context} must not include a trailing slash: ${path}`);
  }
  if (/[?#]/.test(path)) {
    fail(`${context} must not include query strings or fragments: ${path}`);
  }
  if (/%[0-9a-f]{2}/i.test(path)) {
    fail(`${context} must use readable path text instead of percent encoding: ${path}`);
  }

  const normalized = path.replace(/\/+$/, "") || "/";
  if (ALLOWED_STATIC_ROUTES.has(normalized)) return;

  const segments = normalized.split("/").filter(Boolean);
  if (!segments.length) return;
  const root = segments[0];
  if (!ROOT_ROUTE_SEGMENTS.has(root)) {
    fail(`${context} must use an approved top-level route segment: ${path}`);
  }
  if (segments.length < 2) return;

  for (const segment of segments.slice(1)) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(segment)) {
      fail(`${context} contains a non-readable URL segment "${segment}": ${path}`);
    }
    if (/^\d+$/.test(segment)) {
      fail(`${context} contains a numeric-only URL segment "${segment}": ${path}`);
    }
    if (GENERIC_ROUTE_SEGMENTS.has(segment)) {
      fail(`${context} contains a generic URL segment "${segment}"; use descriptive words: ${path}`);
    }
  }
}

function validateReadableCanonicalUrl(url, context) {
  let parsed = null;
  try {
    parsed = new URL(url);
  } catch {
    fail(`${context} is not a valid absolute URL: ${url}`);
    return false;
  }
  if (parsed.origin !== SITE_URL) {
    fail(`${context} must use the canonical apex host: ${url}`);
  }
  validateReadableUrlPath(`${parsed.pathname}${parsed.search}${parsed.hash}`, context);
  return parsed.origin === SITE_URL;
}

function listDuplicateValues(values) {
  return values.filter((value, index) => values.indexOf(value) !== index);
}

function parseDateOnly(value, context) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    fail(`${context} must use YYYY-MM-DD format; got ${value || "missing"}.`);
    return null;
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    fail(`${context} is not a valid calendar date: ${value}.`);
    return null;
  }
  return parsed;
}

function validateDateNotFuture(value, context) {
  const parsed = parseDateOnly(value, context);
  if (!parsed) return;
  const today = new Date().toISOString().slice(0, 10);
  if (value > today) {
    fail(`${context} must not be in the future; got ${value}, today is ${today}.`);
  }
}

function parseRssItems(source) {
  return [...source.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => {
    const item = match[1];
    return {
      link: item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? "",
      guid: item.match(/<guid[^>]*>([\s\S]*?)<\/guid>/)?.[1]?.trim() ?? "",
      pubDate: item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() ?? "",
    };
  });
}

function rssPubDateToDateOnly(value, context) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    fail(`${context} must be a valid RSS pubDate; got ${value || "missing"}.`);
    return "";
  }
  const dateOnly = parsed.toISOString().slice(0, 10);
  validateDateNotFuture(dateOnly, context);
  return dateOnly;
}

function extractAnchorHrefs(body) {
  return [...body.matchAll(/<a\b[^>]*\shref=["']([^"']+)["'][^>]*>/gi)].map((match) => match[1]);
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

async function getHead(path) {
  const url = path.startsWith("http") ? path : `${SITE_URL}${path}`;
  const response = await fetch(url, {
    method: "HEAD",
    headers: {
      "user-agent": "CrepikaLiveSEOCheck/1.0",
    },
    redirect: "follow",
  });
  return { url, response };
}

async function getReachability(path) {
  const head = await getHead(path);
  if (head.response.status !== 405) return head;
  const fetched = await get(path);
  return { url: fetched.url, response: fetched.response };
}

async function mapWithConcurrency(values, limit, mapper) {
  const results = new Array(values.length);
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(limit, values.length) }, async () => {
    while (nextIndex < values.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(values[currentIndex], currentIndex);
    }
  });
  await Promise.all(workers);
  return results;
}

function extractMetaContent(body, attribute, value) {
  const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `<meta\\s+[^>]*${attribute}=["']${escapedValue}["'][^>]*content=["']([^"']+)["'][^>]*>`,
    "i",
  );
  const reversePattern = new RegExp(
    `<meta\\s+[^>]*content=["']([^"']+)["'][^>]*${attribute}=["']${escapedValue}["'][^>]*>`,
    "i",
  );
  return body.match(pattern)?.[1] ?? body.match(reversePattern)?.[1] ?? "";
}

function extractLinkHref(body, rel) {
  const escapedRel = rel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `<link\\s+[^>]*rel=["']${escapedRel}["'][^>]*href=["']([^"']+)["'][^>]*>`,
    "i",
  );
  const reversePattern = new RegExp(
    `<link\\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']${escapedRel}["'][^>]*>`,
    "i",
  );
  return body.match(pattern)?.[1] ?? body.match(reversePattern)?.[1] ?? "";
}

function validateUrlSignalConsistency(path, body) {
  const expectedCanonical = `${SITE_URL}${path}`;
  const canonicalCount = countMatches(body, /<link\b[^>]*rel=["']canonical["'][^>]*>/gi);
  const canonical = extractLinkHref(body, "canonical");
  const ogUrl = extractMetaContent(body, "property", "og:url");
  const objects = extractJsonLdObjects(body);
  const matchedJsonLdTypes = [];

  if (canonicalCount !== 1) {
    fail(`${path} must expose exactly one canonical link; found ${canonicalCount}.`);
  }
  if (!canonical) {
    fail(`${path} is missing a canonical href.`);
  } else {
    if (canonical !== expectedCanonical) {
      fail(`${path} canonical href must be ${expectedCanonical}; got ${canonical}.`);
    }
    validateReadableCanonicalUrl(canonical, `${path} canonical URL`);
  }
  if (ogUrl !== canonical) {
    fail(`${path} og:url must match canonical href; got ${ogUrl || "missing"}.`);
  }

  for (const entry of objects) {
    if (!entry || typeof entry !== "object") continue;
    if (["Article", "CollectionPage", "SoftwareApplication", "WebPage"].includes(entry["@type"]) && entry.url) {
      matchedJsonLdTypes.push(entry["@type"]);
      if (entry.url !== canonical) {
        fail(`${path} ${entry["@type"]} JSON-LD url must match canonical href.`);
      }
    }
    if (entry["@type"] === "Article" && entry.mainEntityOfPage?.["@id"] !== canonical) {
      fail(`${path} Article mainEntityOfPage must match canonical href.`);
    }
    if (entry["@type"] === "BreadcrumbList" && Array.isArray(entry.itemListElement) && entry.itemListElement.length) {
      const lastItem = entry.itemListElement.at(-1)?.item;
      if (lastItem && lastItem !== canonical) {
        fail(`${path} BreadcrumbList final item must match canonical href.`);
      }
    }
  }

  return {
    canonical,
    expectedCanonical,
    canonicalCount,
    ogUrl,
    ogMatchesCanonical: ogUrl === canonical,
    jsonLdUrlTypesChecked: [...new Set(matchedJsonLdTypes)],
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

function extractImageTags(body) {
  return [...body.matchAll(/<img\b(?:"[^"]*"|'[^']*'|\{[^}]*\}|[^>])*>/gi)].map((match) => match[0]);
}

function hasAttribute(tag, name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\s${escapedName}(?:\\s*=|\\s|>|$)`, "i").test(tag);
}

function getAttributeValue(tag, name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`\\s${escapedName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|\\{([^}]*)\\})`, "i");
  const match = tag.match(pattern);
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? "";
}

function validateInlineImageAlt(path, body) {
  const imageTags = extractImageTags(body);
  for (const [index, tag] of imageTags.entries()) {
    const hidden =
      /aria-hidden\s*=\s*(?:"true"|'true'|\{true\})/i.test(tag) ||
      /role\s*=\s*(?:"presentation"|'presentation'|"none"|'none')/i.test(tag);
    const hasAlt = hasAttribute(tag, "alt");
    const altValue = getAttributeValue(tag, "alt").trim();
    if (!hasAlt) {
      fail(`${path} image ${index + 1} is missing alt text.`);
    }
    if (hasAlt && !altValue && !hidden) {
      fail(`${path} image ${index + 1} has empty alt text without a decorative image marker.`);
    }
  }
  return {
    images: imageTags.length,
    altChecked: imageTags.length,
  };
}

async function validateSocialImage(path, body) {
  const ogImage = extractMetaContent(body, "property", "og:image");
  const twitterImage = extractMetaContent(body, "name", "twitter:image");
  const ogImageType = extractMetaContent(body, "property", "og:image:type");
  const ogImageWidth = extractMetaContent(body, "property", "og:image:width");
  const ogImageHeight = extractMetaContent(body, "property", "og:image:height");
  const ogImageAlt = extractMetaContent(body, "property", "og:image:alt");
  const twitterImageAlt = extractMetaContent(body, "name", "twitter:image:alt");

  if (!ogImage.startsWith(`${SITE_URL}/`) || !ogImage.endsWith(".png")) {
    fail(`${path} must use a canonical PNG og:image URL.`);
  }
  if (twitterImage !== ogImage) {
    fail(`${path} twitter:image must match og:image.`);
  }
  if (ogImageType !== "image/png") {
    fail(`${path} must declare og:image:type image/png.`);
  }
  if (ogImageWidth !== "1200") {
    fail(`${path} must declare og:image:width 1200.`);
  }
  if (ogImageHeight !== "630") {
    fail(`${path} must declare og:image:height 630.`);
  }
  if (ogImageAlt.length < 6) {
    fail(`${path} must declare meaningful og:image:alt text.`);
  }
  if (twitterImageAlt !== ogImageAlt) {
    fail(`${path} twitter:image:alt must match og:image:alt.`);
  }

  let imageStatus = 0;
  let imageContentType = "";
  let imageCacheControl = "";
  if (ogImage) {
    const image = await getHead(ogImage);
    imageStatus = image.response.status;
    imageContentType = image.response.headers.get("content-type") ?? "";
    imageCacheControl = image.response.headers.get("cache-control") ?? "";
    if (!image.response.ok) {
      fail(`${path} og:image returned HTTP ${image.response.status}: ${ogImage}`);
    }
    if (!imageContentType.toLowerCase().startsWith("image/png")) {
      fail(`${path} og:image must return image/png; got ${imageContentType || "missing"}.`);
    }
  }

  return {
    ogImage,
    twitterImage,
    type: ogImageType,
    width: ogImageWidth,
    height: ogImageHeight,
    alt: ogImageAlt,
    imageStatus,
    imageContentType,
    imageCacheControl,
  };
}

async function validateInternalLinks(path, body) {
  const ids = new Set([...body.matchAll(/\sid=["']([^"']+)["']/gi)].map((match) => match[1]));
  const links = [];
  const seen = new Set();

  for (const rawHref of extractAnchorHrefs(body)) {
    if (!rawHref || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) continue;
    if (/^https?:\/\/(?!crepika\.com\/)/i.test(rawHref)) continue;

    let route = rawHref;
    let hash = "";
    if (rawHref.startsWith(`${SITE_URL}/`)) {
      route = rawHref.slice(SITE_URL.length);
    } else if (rawHref.startsWith("https://www.crepika.com/")) {
      fail(`${path} contains a non-canonical www internal link: ${rawHref}`);
      continue;
    } else if (/^https?:\/\//i.test(rawHref)) {
      fail(`${path} contains a non-canonical internal link host: ${rawHref}`);
      continue;
    }

    if (route.startsWith("#")) {
      hash = route.slice(1);
      if (hash && !ids.has(hash)) {
        fail(`${path} links to missing same-page fragment: ${rawHref}`);
      }
      continue;
    }

    const hashIndex = route.indexOf("#");
    if (hashIndex !== -1) {
      hash = route.slice(hashIndex + 1);
      route = route.slice(0, hashIndex);
    }
    const queryIndex = route.indexOf("?");
    if (queryIndex !== -1) {
      fail(`${path} contains query-string internal link that should not be crawler navigation: ${rawHref}`);
      route = route.slice(0, queryIndex);
    }
    route = route.replace(/\/+$/, "") || "/";
    if (!route.startsWith("/")) {
      fail(`${path} contains unsupported relative internal link: ${rawHref}`);
      continue;
    }

    const key = `${route}#${hash}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (hash && route === path && !ids.has(hash)) {
      fail(`${path} links to missing same-page fragment: ${rawHref}`);
    }

    const result = await getReachability(route);
    if (result.response.status >= 400) {
      fail(`${path} links to ${route}, which returned HTTP ${result.response.status}.`);
    }
    links.push({
      href: rawHref,
      route,
      status: result.response.status,
    });
  }

  return {
    checked: links.length,
    links,
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

function validateSiteIdentitySchema(path, body) {
  const objects = extractJsonLdObjects(body);
  const organization = objects.find((entry) => entry?.["@type"] === "Organization" && entry?.["@id"] === `${SITE_URL}/#organization`);
  const website = objects.find((entry) => entry?.["@type"] === "WebSite" && entry?.["@id"] === `${SITE_URL}/#website`);
  const result = {
    organizationId: organization?.["@id"] ?? "",
    websiteId: website?.["@id"] ?? "",
    organizationMembers: Array.isArray(organization?.member) ? organization.member.length : 0,
    hasContactPoint: organization?.contactPoint?.["@type"] === "ContactPoint",
    hasDiscoverySameAs:
      Array.isArray(organization?.sameAs) &&
      organization.sameAs.includes(`${SITE_URL}/rss.xml`) &&
      organization.sameAs.includes(`${SITE_URL}/llms.txt`),
    hasSearchAction: website?.potentialAction?.["@type"] === "SearchAction",
  };

  if (!organization) {
    fail(`${path} is missing the canonical Organization JSON-LD identity.`);
    return result;
  }
  if (organization.name !== BRAND_NAME_KO || organization.alternateName !== "Crepika" || organization.url !== SITE_URL) {
    fail(`${path} Organization identity must expose canonical name, alternateName, and URL.`);
  }
  if (organization.logo?.["@type"] !== "ImageObject" || organization.logo?.url !== `${SITE_URL}/og-image.png` || organization.logo?.width !== 1200 || organization.logo?.height !== 630) {
    fail(`${path} Organization identity must expose the canonical 1200x630 logo ImageObject.`);
  }
  if (!result.hasContactPoint) {
    fail(`${path} Organization identity must expose a support contactPoint.`);
  }
  if (!result.hasDiscoverySameAs) {
    fail(`${path} Organization sameAs must expose RSS and llms.txt discovery URLs.`);
  }
  if (result.organizationMembers < 3) {
    fail(`${path} Organization identity must expose editorial team members for E-E-A-T.`);
  }

  if (!website) {
    fail(`${path} is missing the canonical WebSite JSON-LD identity.`);
    return result;
  }
  if (website.name !== BRAND_NAME_KO || website.url !== SITE_URL || website.inLanguage !== "ko-KR") {
    fail(`${path} WebSite identity must expose canonical name, URL, and ko-KR language.`);
  }
  if (website.publisher?.["@id"] !== `${SITE_URL}/#organization`) {
    fail(`${path} WebSite identity must reference the canonical Organization publisher.`);
  }
  if (!result.hasSearchAction || !String(website.potentialAction?.target?.urlTemplate ?? "").startsWith(`${SITE_URL}/blog?search=`)) {
    fail(`${path} WebSite identity must expose the blog SearchAction URL template.`);
  }

  return result;
}

function validateArticleTrustSchema(path, body) {
  const canonical = `${SITE_URL}${path}`;
  const objects = extractJsonLdObjects(body);
  const article = objects.find((entry) => entry?.["@type"] === "Article");
  const faqPage = objects.find((entry) => entry?.["@type"] === "FAQPage");
  const result = {
    articleId: article?.["@id"] ?? "",
    wordCount: Number(article?.wordCount ?? 0),
    authorId: article?.author?.["@id"] ?? "",
    publisherId: article?.publisher?.["@id"] ?? "",
    hasImageObject: article?.image?.["@type"] === "ImageObject",
    hasMainEntityOfPage: article?.mainEntityOfPage?.["@id"] === canonical,
    hasSpeakable: article?.speakable?.["@type"] === "SpeakableSpecification",
    faqCount: Array.isArray(faqPage?.mainEntity) ? faqPage.mainEntity.length : 0,
  };

  if (!article) {
    fail(`${path} is missing Article structured data.`);
    return result;
  }
  if (article["@id"] !== `${canonical}#article`) {
    fail(`${path} Article @id must match the canonical article fragment.`);
  }
  if (article.url !== canonical) {
    fail(`${path} Article url must match the canonical URL.`);
  }
  for (const field of ["headline", "description", "datePublished", "dateModified", "inLanguage", "articleSection", "keywords", "timeRequired"]) {
    if (typeof article[field] !== "string" || article[field].trim().length < 2) {
      fail(`${path} Article structured data is missing a meaningful ${field}.`);
    }
  }
  if (article.inLanguage !== "ko-KR") {
    fail(`${path} Article inLanguage must be ko-KR.`);
  }
  if (!Number.isFinite(result.wordCount) || result.wordCount < 200) {
    fail(`${path} Article wordCount must be at least 200.`);
  }
  if (article.image?.["@type"] !== "ImageObject" || article.image?.url !== `${SITE_URL}/og-image.png` || article.image?.width !== 1200 || article.image?.height !== 630) {
    fail(`${path} Article image must be a 1200x630 canonical ImageObject.`);
  }
  if (article.author?.["@type"] !== "Person" || !String(article.author?.["@id"] ?? "").startsWith(`${SITE_URL}/about#`) || article.author?.url !== `${SITE_URL}/about` || !String(article.author?.image ?? "").startsWith(`${SITE_URL}/`)) {
    fail(`${path} Article author must expose Person @id, URL, and canonical image.`);
  }
  if (article.publisher?.["@type"] !== "Organization" || article.publisher?.["@id"] !== `${SITE_URL}/#organization` || article.publisher?.logo?.url !== `${SITE_URL}/og-image.png`) {
    fail(`${path} Article publisher must expose the canonical Organization and logo.`);
  }
  if (article.mainEntityOfPage?.["@type"] !== "WebPage" || article.mainEntityOfPage?.["@id"] !== canonical) {
    fail(`${path} Article mainEntityOfPage must be the canonical WebPage object.`);
  }
  if (article.isPartOf?.["@type"] !== "WebSite" || article.isPartOf?.["@id"] !== `${SITE_URL}/#website`) {
    fail(`${path} Article must reference the canonical WebSite via isPartOf.`);
  }
  if (article.speakable?.["@type"] !== "SpeakableSpecification" || !Array.isArray(article.speakable?.cssSelector) || !article.speakable.cssSelector.includes("h1")) {
    fail(`${path} Article must expose speakable selectors for AEO parsing.`);
  }
  if (!faqPage || !Array.isArray(faqPage.mainEntity) || faqPage.mainEntity.length < 2) {
    fail(`${path} visible FAQ content must be mirrored as FAQPage JSON-LD.`);
  }

  return result;
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

function validateGa4Analytics(path, body) {
  const loaderCount = countMatches(
    body,
    new RegExp(`googletagmanager\\.com/gtag/js\\?id=${GA4_MEASUREMENT_ID}`, "g"),
  );
  const hasDataLayer = body.includes("window.dataLayer = window.dataLayer || [];");
  const initialPageViewDisabled = body.includes(`gtag('config', '${GA4_MEASUREMENT_ID}', { send_page_view: false });`);
  const hasTagManagerHint = body.includes('href="https://www.googletagmanager.com"');
  const hasAnalyticsHint = body.includes('href="https://www.google-analytics.com"');

  if (loaderCount !== 1) {
    fail(`${path} must load the GA4 gtag loader exactly once; found ${loaderCount}.`);
  }
  if (!hasDataLayer) {
    fail(`${path} is missing the GA4 dataLayer bootstrap.`);
  }
  if (!initialPageViewDisabled) {
    fail(`${path} must disable the initial GA4 page_view so SPA route tracking is not duplicated.`);
  }
  if (!hasTagManagerHint) {
    fail(`${path} is missing a Google Tag Manager preconnect or prefetch hint.`);
  }
  if (!hasAnalyticsHint) {
    fail(`${path} is missing a Google Analytics collection prefetch hint.`);
  }

  return {
    measurementId: GA4_MEASUREMENT_ID,
    gtagLoaderCount: loaderCount,
    dataLayer: hasDataLayer,
    initialPageViewDisabled,
    tagManagerHint: hasTagManagerHint,
    analyticsHint: hasAnalyticsHint,
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

async function validateDiscoveryConsistency() {
  const [sitemapResult, rssResult, feedResult, aiIndexResult] = await Promise.all([
    get("/sitemap.xml"),
    get("/rss.xml"),
    get("/feed.xml"),
    get("/ai-index.json"),
  ]);

  for (const { url, response } of [sitemapResult, rssResult, feedResult, aiIndexResult]) {
    if (!response.ok) fail(`${url} returned HTTP ${response.status} during discovery consistency validation.`);
  }

  const sitemapBlogUrls = extractXmlTags(sitemapResult.body, "loc").filter((loc) =>
    loc.startsWith(`${SITE_URL}/blog/`),
  );
  const sitemapUrls = extractXmlTags(sitemapResult.body, "loc");
  const sitemapEntries = new Map(
    [...sitemapResult.body.matchAll(/<url>\s*<loc>([\s\S]*?)<\/loc>\s*<lastmod>([\s\S]*?)<\/lastmod>[\s\S]*?<\/url>/g)].map(
      (match) => [match[1].trim(), { lastmod: match[2].trim() }],
    ),
  );
  if (sitemapEntries.size !== sitemapUrls.length) {
    fail(`sitemap.xml must expose one lastmod for every URL; found ${sitemapEntries.size} lastmod blocks for ${sitemapUrls.length} URLs.`);
  }
  for (const url of sitemapUrls) {
    validateReadableCanonicalUrl(url, "Live sitemap URL");
    validateDateNotFuture(sitemapEntries.get(url)?.lastmod ?? "", `Live sitemap lastmod for ${url}`);
  }
  const sitemapReachability = await mapWithConcurrency(sitemapUrls, 12, async (url) => {
    try {
      const { response } = await getReachability(url);
      return {
        url,
        status: response.status,
        redirected: response.redirected,
        finalUrl: response.url,
      };
    } catch (error) {
      return {
        url,
        status: 0,
        redirected: false,
        finalUrl: "",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });
  const unreachableSitemapUrls = sitemapReachability.filter((entry) => entry.status !== 200);
  const redirectedSitemapUrls = sitemapReachability.filter((entry) => entry.redirected || entry.finalUrl !== entry.url);
  if (unreachableSitemapUrls.length) {
    fail(`sitemap.xml contains non-200 URLs: ${unreachableSitemapUrls.slice(0, 10).map((entry) => `${entry.url} -> ${entry.status}`).join(", ")}`);
  }
  if (redirectedSitemapUrls.length) {
    fail(`sitemap.xml contains redirected URLs: ${redirectedSitemapUrls.slice(0, 10).map((entry) => `${entry.url} -> ${entry.finalUrl || "unknown"}`).join(", ")}`);
  }
  const rssLinks = extractXmlTags(rssResult.body, "link").filter((link) =>
    link.startsWith(`${SITE_URL}/blog/`),
  );
  const rssGuids = extractXmlTags(rssResult.body, "guid").filter((guid) =>
    guid.startsWith(`${SITE_URL}/blog/`),
  );
  const feedLinks = extractXmlTags(feedResult.body, "link").filter((link) =>
    link.startsWith(`${SITE_URL}/blog/`),
  );
  const feedGuids = extractXmlTags(feedResult.body, "guid").filter((guid) =>
    guid.startsWith(`${SITE_URL}/blog/`),
  );
  const rssItems = parseRssItems(rssResult.body).filter((item) => item.link.startsWith(`${SITE_URL}/blog/`));
  const feedItems = parseRssItems(feedResult.body).filter((item) => item.link.startsWith(`${SITE_URL}/blog/`));

  const duplicateSitemapUrls = listDuplicateValues(sitemapBlogUrls);
  const duplicateRssLinks = listDuplicateValues(rssLinks);
  const duplicateFeedLinks = listDuplicateValues(feedLinks);
  if (duplicateSitemapUrls.length) {
    fail(`sitemap.xml has duplicate blog URLs: ${[...new Set(duplicateSitemapUrls)].slice(0, 10).join(", ")}`);
  }
  if (duplicateRssLinks.length) {
    fail(`rss.xml has duplicate item links: ${[...new Set(duplicateRssLinks)].slice(0, 10).join(", ")}`);
  }
  if (duplicateFeedLinks.length) {
    fail(`feed.xml has duplicate item links: ${[...new Set(duplicateFeedLinks)].slice(0, 10).join(", ")}`);
  }
  if (rssLinks.length < 20 || rssLinks.length > 100) {
    fail(`rss.xml must expose 20-100 recent blog item links; found ${rssLinks.length}.`);
  }
  if (JSON.stringify(feedLinks) !== JSON.stringify(rssLinks)) {
    fail("feed.xml item links must exactly match rss.xml item links.");
  }
  if (JSON.stringify(feedGuids) !== JSON.stringify(rssGuids)) {
    fail("feed.xml item guids must exactly match rss.xml item guids.");
  }
  for (const [index, url] of rssLinks.entries()) {
    if (rssGuids[index] !== url) {
      fail(`rss.xml guid ${index + 1} must match its canonical link ${url}; got ${rssGuids[index] || "missing"}.`);
    }
    if (!sitemapBlogUrls.includes(url)) {
      fail(`RSS/feed item is missing from sitemap.xml: ${url}`);
    }
    const rssItem = rssItems[index];
    const feedItem = feedItems[index];
    const rssDate = rssPubDateToDateOnly(rssItem?.pubDate ?? "", `rss.xml pubDate for ${url}`);
    const feedDate = rssPubDateToDateOnly(feedItem?.pubDate ?? "", `feed.xml pubDate for ${url}`);
    if (feedDate && rssDate && feedDate !== rssDate) {
      fail(`feed.xml pubDate for ${url} must match rss.xml pubDate date (${rssDate}); got ${feedDate}.`);
    }
    const sitemapLastmod = sitemapEntries.get(url)?.lastmod;
    if (rssDate && sitemapLastmod !== rssDate) {
      fail(`sitemap.xml lastmod for recent RSS item ${url} must match rss.xml pubDate date (${rssDate}); got ${sitemapLastmod || "missing"}.`);
    }
  }

  let aiIndex = null;
  try {
    aiIndex = JSON.parse(aiIndexResult.body);
  } catch (error) {
    fail(`/ai-index.json is not valid JSON during discovery consistency validation: ${error instanceof Error ? error.message : error}`);
  }

  const aiLatestUrls = Array.isArray(aiIndex?.blog?.latest)
    ? aiIndex.blog.latest.map((post) => post?.url)
    : [];
  const expectedAiLatestUrls = rssLinks.slice(0, 12);
  if (aiIndex?.blog?.count !== sitemapBlogUrls.length) {
    fail(`ai-index.json blog.count (${aiIndex?.blog?.count}) must match sitemap blog URL count (${sitemapBlogUrls.length}).`);
  }
  if (JSON.stringify(aiLatestUrls) !== JSON.stringify(expectedAiLatestUrls)) {
    fail("ai-index.json blog.latest URLs must match the first 12 RSS item links.");
  }

  return {
    path: "discovery-consistency",
    sitemapReadableUrls: sitemapUrls.length,
    sitemapLastmodUrls: sitemapEntries.size,
    sitemapReachableUrls: sitemapReachability.filter((entry) => entry.status === 200 && !entry.redirected && entry.finalUrl === entry.url).length,
    sitemapRedirectedUrls: redirectedSitemapUrls.length,
    sitemapNon200Urls: unreachableSitemapUrls.length,
    sitemapBlogUrls: sitemapBlogUrls.length,
    rssItems: rssLinks.length,
    feedItems: feedLinks.length,
    aiLatestItems: aiLatestUrls.length,
    rssFeedMatch: JSON.stringify(feedLinks) === JSON.stringify(rssLinks),
    aiLatestMatchesRss: JSON.stringify(aiLatestUrls) === JSON.stringify(expectedAiLatestUrls),
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

  for (const [legacySlug, canonicalSlug] of Object.entries(LEGACY_BLOG_REDIRECTS)) {
    const legacyPath = `/blog/${legacySlug}`;
    const canonicalPath = `/blog/${canonicalSlug}`;
    const redirect = await getRedirect(`${SITE_URL}${legacyPath}`);
    const pointsToCanonicalBlog =
      redirect.status === 308 &&
      [canonicalPath, `${SITE_URL}${canonicalPath}`].includes(redirect.location);
    if (!pointsToCanonicalBlog) {
      fail(
        `${redirect.url} must 308 redirect to ${canonicalPath}; got ${redirect.status} ${redirect.location}.`,
      );
    }
    checks.push({
      path: legacyPath,
      status: redirect.status,
      location: redirect.location,
      canonicalBlogRedirect: pointsToCanonicalBlog,
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
  checks.push(await validateDiscoveryConsistency());

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
      urlSignals: validateUrlSignalConsistency(path, body),
      siteIdentitySchema: validateSiteIdentitySchema(path, body),
      inlineImageAlt: validateInlineImageAlt(path, body),
      socialImage: await validateSocialImage(path, body),
      internalLinks: await validateInternalLinks(path, body),
      analytics: validateGa4Analytics(path, body),
      adsensePolicy: validateAdSenseAutoAds(path, body),
      readableRootText: true,
    });
  }

  for (const path of SAMPLE_HTML_PATHS) {
    const { response, body } = await get(path);
    if (!response.ok) fail(`${path} returned HTTP ${response.status}.`);
    const headers = validateHtmlHeaders(path, response);
    const structuredData = validateJsonLdTypes(path, body);
    const siteIdentitySchema = SITE_IDENTITY_SAMPLE_PATHS.has(path) ? validateSiteIdentitySchema(path, body) : undefined;
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
      urlSignals: validateUrlSignalConsistency(path, body),
      ...(siteIdentitySchema ? { siteIdentitySchema } : {}),
      inlineImageAlt: validateInlineImageAlt(path, body),
      socialImage: await validateSocialImage(path, body),
      internalLinks: await validateInternalLinks(path, body),
      adsensePolicy: validateAdSenseAutoAds(path, body),
    });
  }

  {
    const path = SAMPLE_ARTICLE_PATH;
    const { response, body } = await get(path);
    if (!response.ok) fail(`${path} returned HTTP ${response.status}.`);
    const headers = validateHtmlHeaders(path, response);
    const structuredData = validateJsonLdTypes(path, body);
    const siteIdentitySchema = validateSiteIdentitySchema(path, body);
    const articleTrustSchema = validateArticleTrustSchema(path, body);
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
      urlSignals: validateUrlSignalConsistency(path, body),
      siteIdentitySchema,
      articleTrustSchema,
      inlineImageAlt: validateInlineImageAlt(path, body),
      socialImage: await validateSocialImage(path, body),
      internalLinks: await validateInternalLinks(path, body),
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
