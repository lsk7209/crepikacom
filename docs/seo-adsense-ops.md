# SEO / GSC / AdSense Operations

This project is a Vite React static site deployed through the normal GitHub to Vercel integration.

Do not run direct Vercel deployment commands from local automation. Push verified commits and let the configured GitHub/Vercel path deploy.

## Verification Commands

Run the full operations check:

```sh
npm run verify:ops
```

Run individual checks:

```sh
npm run verify:seo
npm run verify:live
npm run verify:gsc
npm run verify:adsense
```

## What Each Check Proves

- `verify:seo`: local generated crawler pages, metadata, sitemap, RSS/feed, robots, ads.txt, structured data, and release cadence gates.
- `verify:live`: production HTTP checks for canonical host redirect, robots, ads.txt, sitemap, RSS/feed, security.txt, sample page metadata, and Korean crawler-shell labels on a sample article page.
- `verify:gsc`: Google Search Console sitemap status for `https://crepika.com/sitemap.xml`.
- `verify:adsense`: read-only AdSense readiness for `crepika.com` only. It must not print OAuth tokens, client secrets, revenue metrics, or unrelated sites.

## Current Known External Follow-Ups

- `www.crepika.com` currently redirects to `https://crepika.com` with `307`. The repository has permanent redirect config, but the live domain-level Vercel redirect must be changed to `308` or `301` in the Vercel dashboard.
- AdSense account and ad client are ready, but site review can still report `GETTING_READY`.
- A severe AdSense `payment-hold` alert must be resolved in the Google account UI before approval probability is fully optimized.

## AdSense Constraints

- Publisher: `ca-pub-3050601904412736`
- `ads.txt`: `google.com, pub-3050601904412736, DIRECT, f08c47fec0942fa0`
- Auto Ads only. Do not add manual ad slots unless the site strategy changes explicitly.

## Report Locations

Site-optimizer audit reports are written outside the repository:

```text
D:\.site-optimizer\crepika.com\reports
D:\.site-optimizer\crepika.com\logs
```
