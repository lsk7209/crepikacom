/**
 * Distributes 200 blog post publish dates naturally across Jan 6 – May 7, 2026.
 * Updates: public/sitemap.xml, public/rss.xml, src/data/blog-content.ts
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// --- Generate working-day schedule ---
function isWeekday(d) {
  const day = d.getDay();
  return day !== 0 && day !== 6;
}

function workdaysBetween(start, end) {
  const days = [];
  const cur = new Date(start);
  while (cur <= end) {
    if (isWeekday(cur)) days.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

const startDate = new Date('2026-01-06');
const endDate   = new Date('2026-05-07');
const workdays  = workdaysBetween(startDate, endDate);

const POST_COUNT = 211;
const dates = [];

// Distribute evenly: assign each post a working day index, spreading 211 posts across available workdays
// This gives ~2-3 posts per working day naturally
for (let i = 0; i < POST_COUNT; i++) {
  const dayIdx = Math.floor(i * workdays.length / POST_COUNT);
  dates.push(workdays[Math.min(dayIdx, workdays.length - 1)]);
}

// --- Read slugs from sitemap (in order) ---
const sitemapPath = path.join(ROOT, 'public', 'sitemap.xml');
const sitemapRaw  = readFileSync(sitemapPath, 'utf-8');

// Extract blog post slugs in document order
const blogUrlRe = /<loc>https:\/\/crepika\.com\/blog\/([^<]+)<\/loc>/g;
const slugsInOrder = [];
let m;
while ((m = blogUrlRe.exec(sitemapRaw)) !== null) {
  slugsInOrder.push(m[1]);
}
console.log(`Found ${slugsInOrder.length} blog post URLs in sitemap`);

if (slugsInOrder.length !== POST_COUNT) {
  console.warn(`Note: Expected ${POST_COUNT} posts, found ${slugsInOrder.length}.`);
}

// Build slug → date map
const slugDateMap = {};
slugsInOrder.forEach((slug, i) => { slugDateMap[slug] = dates[i]; });

// --- Update sitemap.xml ---
let newSitemap = sitemapRaw;
slugsInOrder.forEach((slug, i) => {
  const date = dates[i];
  // Replace the lastmod for this exact URL block
  const urlBlockRe = new RegExp(
    `(<loc>https://crepika\\.com/blog/${slug}</loc>\\s*<lastmod>)[^<]+(</lastmod>)`,
    'g'
  );
  newSitemap = newSitemap.replace(urlBlockRe, `$1${date}$2`);
});
writeFileSync(sitemapPath, newSitemap, 'utf-8');
console.log('✓ sitemap.xml updated');

// --- Update rss.xml ---
const rssPath = path.join(ROOT, 'public', 'rss.xml');
const rssRaw  = readFileSync(rssPath, 'utf-8');

let newRss = rssRaw;
// RSS items have <link>https://crepika.com/blog/SLUG</link> and <pubDate>...</pubDate>
slugsInOrder.forEach((slug, i) => {
  const date = dates[i];
  // Convert YYYY-MM-DD to RFC 822 (e.g. "Tue, 06 Jan 2026 09:00:00 +0900")
  const d = new Date(`${date}T09:00:00+09:00`);
  const rfc822 = d.toUTCString().replace('GMT', '+0900');

  const rssBlockRe = new RegExp(
    `(<link>https://crepika\\.com/blog/${slug}</link>[\\s\\S]*?<pubDate>)[^<]+(</pubDate>)`,
    'g'
  );
  newRss = newRss.replace(rssBlockRe, `$1${rfc822}$2`);
});
writeFileSync(rssPath, newRss, 'utf-8');
console.log('✓ rss.xml updated');

// --- Update blog-content.ts publishDate fields ---
const blogContentPath = path.join(ROOT, 'src', 'data', 'blog-content.ts');
let blogContent = readFileSync(blogContentPath, 'utf-8');

const publishDateRe = /publishDate:\s*["']\d{4}-\d{2}-\d{2}["']/g;
let updatedCount = 0;

slugsInOrder.forEach((slug, i) => {
  const date = dates[i];
  const slugEscaped = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Find slug position
  const slugRe = new RegExp(`slug:\\s*["']${slugEscaped}["']`);
  const slugMatch = slugRe.exec(blogContent);
  if (!slugMatch) { console.warn(`  ! slug not found: ${slug}`); return; }

  // Find next publishDate within 2000 chars after slug
  const searchStart = slugMatch.index;
  const searchEnd = Math.min(searchStart + 2000, blogContent.length);
  const segment = blogContent.slice(searchStart, searchEnd);
  const pdMatch = /publishDate:\s*["'](\d{4}-\d{2}-\d{2})["']/.exec(segment);
  if (!pdMatch) { console.warn(`  ! publishDate not found near slug: ${slug}`); return; }

  const absPos = searchStart + pdMatch.index;
  const oldStr = pdMatch[0];
  const newStr = oldStr.replace(/\d{4}-\d{2}-\d{2}/, date);
  if (oldStr === newStr) return; // already correct
  blogContent = blogContent.slice(0, absPos) + newStr + blogContent.slice(absPos + oldStr.length);
  updatedCount++;
});
writeFileSync(blogContentPath, blogContent, 'utf-8');
console.log(`✓ blog-content.ts updated (${updatedCount} posts)`);

// --- Print sample ---
console.log('\nSample date distribution:');
console.log('Post 1:', dates[0], '|', 'Post 50:', dates[49], '|', 'Post 100:', dates[99], '|', 'Post 200:', dates[199]);
