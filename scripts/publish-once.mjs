#!/usr/bin/env node
/**
 * GitHub Actions용 단발 발행 스크립트
 * scripts/drafts/{slug}.json → blog-content.ts + sitemap + rss → git commit+push → 검색엔진 핑
 * 루프/슬립 없이 1편 발행 후 종료. ANTHROPIC_API_KEY 불필요.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT        = join(__dirname, '..');
const QUEUE_FILE  = join(ROOT, 'scripts', 'post-queue.json');
const DRAFTS_DIR  = join(ROOT, 'scripts', 'drafts');
const PUBLISH_LOG = join(ROOT, 'scripts', 'publish-log.json');
const BLOG_CONTENT = join(ROOT, 'src', 'data', 'blog-content.ts');
const SITEMAP_FILE = join(ROOT, 'public', 'sitemap.xml');
const RSS_FILE     = join(ROOT, 'public', 'rss.xml');
const SITE_URL     = 'https://crepika.com';

function getTodayDate() { return new Date().toISOString().split('T')[0]; }

function getNextDraft() {
  const queue = JSON.parse(readFileSync(QUEUE_FILE, 'utf-8'));
  for (const entry of queue.filter(e => !e.published)) {
    const draftPath = join(DRAFTS_DIR, `${entry.slug}.json`);
    if (existsSync(draftPath)) {
      return { entry, post: JSON.parse(readFileSync(draftPath, 'utf-8')), draftPath };
    }
  }
  return null;
}

function postToTs(post) {
  const json = JSON.stringify(post, null, 2);
  let ts = json.replace(/"([a-zA-Z_][a-zA-Z0-9_]*)":/g, '$1:');
  ts = ts.replace(/"((?:[^"\\]|\\.)*)"/g, (match, jsonBody) => {
    let val;
    try { val = JSON.parse('"' + jsonBody + '"'); } catch { return match; }
    const bt = val.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
    return '`' + bt + '`';
  });
  return ts;
}

function injectIntoBlogContent(post) {
  let content = readFileSync(BLOG_CONTENT, 'utf-8').replace(/\r\n/g, '\n');
  const marker = '];\n\nexport function getBlogPostBySlug';
  const idx = content.indexOf(marker);
  if (idx === -1) throw new Error('blog-content.ts 삽입 위치 없음');
  const postTs = postToTs(post);
  const newEntry = `,\n  ${postTs.split('\n').join('\n  ')}\n`;
  writeFileSync(BLOG_CONTENT, content.slice(0, idx) + newEntry + content.slice(idx), 'utf-8');
}

function injectIntoSitemap(post) {
  let content = readFileSync(SITEMAP_FILE, 'utf-8');
  const today = getTodayDate();
  const newUrl = `\n  <url>\n    <loc>${SITE_URL}/blog/${post.slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
  content = content.replace('</urlset>', newUrl + '\n</urlset>');
  writeFileSync(SITEMAP_FILE, content, 'utf-8');
}

function injectIntoRss(post) {
  let content = readFileSync(RSS_FILE, 'utf-8');
  const pubDate = new Date().toUTCString();
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const newItem = `\n  <item>\n    <title>${esc(post.title)}</title>\n    <link>${SITE_URL}/blog/${post.slug}</link>\n    <description>${esc(post.description)}</description>\n    <pubDate>${pubDate}</pubDate>\n    <guid>${SITE_URL}/blog/${post.slug}</guid>\n    <dc:creator>${post.author}</dc:creator>\n  </item>`;
  content = content
    .replace(/<lastBuildDate>[^<]*<\/lastBuildDate>/, `<lastBuildDate>${pubDate}</lastBuildDate>`)
    .replace('</channel>', newItem + '\n\n</channel>');
  writeFileSync(RSS_FILE, content, 'utf-8');
}

function markPublished(entry) {
  const queue = JSON.parse(readFileSync(QUEUE_FILE, 'utf-8'));
  const e = queue.find(q => q.id === entry.id);
  if (e) { e.published = true; e.publishedDate = getTodayDate(); }
  writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2), 'utf-8');
}

async function pingSearchEngines(slug) {
  const url = `${SITE_URL}/blog/${slug}`;
  const key = 'crepika2026indexnow';
  await Promise.allSettled([
    fetch(`https://api.indexnow.org/indexnow?url=${encodeURIComponent(url)}&key=${key}`)
      .then(r => console.log(`📡 IndexNow: ${r.status}`)).catch(() => {}),
    fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(SITE_URL + '/sitemap.xml')}`)
      .then(r => console.log(`📡 Bing: ${r.status}`)).catch(() => {}),
    fetch(`https://searchadvisor.naver.com/site/submit?url=${encodeURIComponent(SITE_URL + '/sitemap.xml')}`)
      .then(r => console.log(`📡 Naver: ${r.status}`)).catch(() => {}),
  ]);
}

async function main() {
  const next = getNextDraft();
  if (!next) {
    console.log('✅ 모든 드래프트 발행 완료 — 큐 소진');
    process.exit(0);
  }

  const { entry, post } = next;
  console.log(`📰 발행: [${entry.id}] ${post.title}`);

  injectIntoBlogContent(post);
  injectIntoSitemap(post);
  injectIntoRss(post);

  // 클리셰 자동 수정
  try { execSync(`node scripts/fix-new-post.mjs "${post.slug}"`, { cwd: ROOT, stdio: 'inherit' }); } catch {}

  // blog-posts-meta.ts 재생성
  try { execSync('node scripts/gen-meta.mjs', { cwd: ROOT, stdio: 'inherit' }); } catch {}

  markPublished(entry);

  // git commit + push (GitHub Actions 환경에서 자격증명은 workflow에서 처리)
  const msg = `Auto-publish: ${post.title.slice(0, 60)}`;
  execSync('git config user.email "auto-publisher@crepika.com"', { cwd: ROOT });
  execSync('git config user.name "크레피카 자동 발행"', { cwd: ROOT });
  execSync('git add src/data/blog-content.ts src/data/blog-posts-meta.ts public/sitemap.xml public/rss.xml scripts/post-queue.json', { cwd: ROOT });
  execSync(`git commit -m "${msg.replace(/"/g, "'")}"`, { cwd: ROOT });
  execSync('git push origin main', { cwd: ROOT });
  console.log(`🚀 git push 완료 → Vercel 배포 시작`);

  await pingSearchEngines(post.slug);

  const publishLog = existsSync(PUBLISH_LOG) ? JSON.parse(readFileSync(PUBLISH_LOG, 'utf-8')) : [];
  publishLog.push({ date: getTodayDate(), slug: post.slug, title: post.title });
  writeFileSync(PUBLISH_LOG, JSON.stringify(publishLog, null, 2), 'utf-8');

  const queue = JSON.parse(readFileSync(QUEUE_FILE, 'utf-8'));
  const remaining = queue.filter(e => !e.published).length;
  console.log(`✅ 발행 완료: ${SITE_URL}/blog/${post.slug}`);
  console.log(`📊 남은 글: ${remaining}개`);
}

main().catch(e => { console.error('❌ 오류:', e.message); process.exit(1); });
