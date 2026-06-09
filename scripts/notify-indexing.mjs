#!/usr/bin/env node
import { createSign } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

const SITE_URL = trimTrailingSlash(process.env.SITE_URL || "https://crepika.com");
const SITEMAP_URL = process.env.SITEMAP_URL || `${SITE_URL}/sitemap.xml`;
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "crepika2026indexnow";
const DEFAULT_GOOGLE_CREDENTIALS = "D:\\env\\cursorai-451704-85a5abbe8eeb.json";
const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/indexing",
  "https://www.googleapis.com/auth/webmasters",
].join(" ");

function trimTrailingSlash(value) {
  return String(value).replace(/\/+$/, "");
}

function parseArgs(argv) {
  const options = { urls: [], slugs: [], strict: false, dryRun: false, json: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--urls" && next) {
      options.urls.push(...splitList(next));
      i++;
    } else if (arg === "--slugs" && next) {
      options.slugs.push(...splitList(next));
      i++;
    } else if (arg === "--strict") {
      options.strict = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--json") {
      options.json = true;
    }
  }
  return options;
}

function splitList(value) {
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeUrl(value) {
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return `${SITE_URL}${value}`;
  return `${SITE_URL}/blog/${value}`;
}

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function loadGoogleCredentials() {
  const rawJson = process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON;
  if (rawJson?.trim()) {
    return JSON.parse(rawJson);
  }

  const configuredPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || DEFAULT_GOOGLE_CREDENTIALS;
  if (configuredPath && existsSync(configuredPath)) {
    return JSON.parse(readFileSync(configuredPath, "utf-8"));
  }

  return null;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    // Keep the raw body for diagnostics.
  }
  return { ok: response.ok, status: response.status, body };
}

async function getGoogleAccessToken(credentials) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(
    JSON.stringify({
      iss: credentials.client_email,
      scope: GOOGLE_SCOPES,
      aud: credentials.token_uri || "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    }),
  );
  const unsigned = `${header}.${claim}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(credentials.private_key, "base64url");
  const assertion = `${unsigned}.${signature}`;

  const token = await requestJson(credentials.token_uri || "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!token.ok || !token.body?.access_token) {
    throw new Error(`Google token request failed: ${token.status}`);
  }
  return token.body.access_token;
}

async function notifyIndexNow(provider, endpoint, url) {
  const target = `${endpoint}?url=${encodeURIComponent(url)}&key=${encodeURIComponent(INDEXNOW_KEY)}`;
  const response = await requestJson(target);
  return { provider, url, ok: response.ok, status: response.status };
}

async function pingSitemap(provider, endpoint) {
  const response = await requestJson(`${endpoint}${encodeURIComponent(SITEMAP_URL)}`);
  return { provider, url: SITEMAP_URL, ok: response.ok, status: response.status };
}

async function notifyGoogle(urls) {
  const credentials = loadGoogleCredentials();
  if (!credentials) {
    return [
      {
        provider: "google",
        ok: true,
        skipped: true,
        reason: "missing_google_service_account",
      },
    ];
  }

  const token = await getGoogleAccessToken(credentials);
  const headers = {
    authorization: `Bearer ${token}`,
    "content-type": "application/json",
  };

  const results = [];
  for (const url of urls) {
    const response = await requestJson("https://indexing.googleapis.com/v3/urlNotifications:publish", {
      method: "POST",
      headers,
      body: JSON.stringify({ url, type: "URL_UPDATED" }),
    });
    results.push({ provider: "google-indexing", url, ok: response.ok, status: response.status });
  }

  const siteUrl = `${SITE_URL}/`;
  const sitemapResponse = await requestJson(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(SITEMAP_URL)}`,
    { method: "PUT", headers },
  );
  results.push({
    provider: "gsc-sitemap",
    url: SITEMAP_URL,
    ok: sitemapResponse.ok,
    status: sitemapResponse.status,
  });

  return results;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const urls = [...new Set([...options.urls, ...options.slugs].map(normalizeUrl))];

  if (!urls.length) {
    throw new Error("Provide --urls or --slugs.");
  }

  if (options.dryRun) {
    console.log(JSON.stringify({ dryRun: true, urls, sitemap: SITEMAP_URL }, null, 2));
    return;
  }

  const tasks = [];
  for (const url of urls) {
    tasks.push(notifyIndexNow("indexnow", "https://api.indexnow.org/indexnow", url));
    tasks.push(notifyIndexNow("naver-indexnow", "https://searchadvisor.naver.com/indexnow", url));
  }
  tasks.push(pingSitemap("bing-sitemap", "https://www.bing.com/ping?sitemap="));

  const settled = await Promise.allSettled([...tasks, notifyGoogle(urls)]);
  const results = settled.flatMap((item) => {
    if (item.status === "fulfilled") return Array.isArray(item.value) ? item.value : [item.value];
    return [{ provider: "unknown", ok: false, error: item.reason?.message || String(item.reason) }];
  });

  const failed = results.filter((result) => !result.ok);
  const output = {
    ok: failed.length === 0,
    urls,
    sitemap: SITEMAP_URL,
    results,
  };

  if (options.json) {
    console.log(JSON.stringify(output, null, 2));
  } else {
    for (const result of results) {
      const status = result.skipped ? `skipped:${result.reason}` : result.status ?? result.error ?? "ok";
      console.log(`${result.provider}: ${status}`);
    }
  }

  if (options.strict && failed.length) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
