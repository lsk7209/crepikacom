#!/usr/bin/env node
/**
 * 5시간 ± jitter 자동 발행 스케줄러
 * scripts/drafts/{slug}.json 에서 순서대로 발행 → git push → Vercel 자동 배포
 *
 * 실행: node scripts/auto-scheduler.mjs
 * 중단: echo $null > scripts/stop.signal  (PowerShell)
 *       또는 touch scripts/stop.signal    (bash)
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { createSign } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const QUEUE_FILE     = join(ROOT, 'scripts', 'post-queue.json');
const DRAFTS_DIR     = join(ROOT, 'scripts', 'drafts');
const STOP_SIGNAL    = join(ROOT, 'scripts', 'stop.signal');
const PUBLISH_LOG    = join(ROOT, 'scripts', 'publish-log.json');
const REPORTS_DIR    = join(ROOT, 'scripts', 'daily-reports');
const BLOG_CONTENT   = join(ROOT, 'src', 'data', 'blog-content.ts');
const SITEMAP_FILE   = join(ROOT, 'public', 'sitemap.xml');
const RSS_FILE       = join(ROOT, 'public', 'rss.xml');

mkdirSync(REPORTS_DIR, { recursive: true });

const SITE_URL = 'https://crepika.com';
const BASE_INTERVAL_MS = 5 * 60 * 60 * 1000;  // 5시간
const MIN_JITTER_MS = -42 * 60 * 1000;          // -42분
const MAX_JITTER_MS = 78 * 60 * 1000;           // +78분
const MAX_CONSECUTIVE_FAILS = 5;

let consecutiveFails = 0;
let todayPublishCount = 0;
let todayDate = new Date().toISOString().split('T')[0];
const publishLog = existsSync(PUBLISH_LOG) ? JSON.parse(readFileSync(PUBLISH_LOG, 'utf-8')) : [];

// ────────────────────────────────────────────────
// 유틸
// ────────────────────────────────────────────────
function getTodayDate() { return new Date().toISOString().split('T')[0]; }

function jitteredSleep() {
  const jitter = MIN_JITTER_MS + Math.random() * (MAX_JITTER_MS - MIN_JITTER_MS);
  let sleepMs = BASE_INTERVAL_MS + jitter;

  // 새벽 1~5시(KST = UTC+9) 발행 억제: 50% 확률로 추가 대기
  const kstHour = (new Date().getUTCHours() + 9) % 24;
  if (kstHour >= 1 && kstHour < 5 && Math.random() < 0.5) {
    sleepMs += 3 * 60 * 60 * 1000; // +3시간
    console.log('🌙 새벽 시간 감지 — 발행 시간 지연');
  }

  const mins = Math.round(sleepMs / 60000);
  const nextTime = new Date(Date.now() + sleepMs);
  console.log(`⏰ 다음 발행: ${nextTime.toLocaleString('ko-KR')} (${mins}분 후)\n`);
  return new Promise(r => setTimeout(r, sleepMs));
}

function getNextDraft() {
  if (!existsSync(DRAFTS_DIR)) return null;
  const queue = JSON.parse(readFileSync(QUEUE_FILE, 'utf-8'));
  // Find first unpublished queue entry that has a draft file
  const unpublished = queue.filter(e => !e.published);
  for (const entry of unpublished) {
    const draftPath = join(DRAFTS_DIR, `${entry.slug}.json`);
    if (existsSync(draftPath)) {
      return { entry, post: JSON.parse(readFileSync(draftPath, 'utf-8')), draftPath };
    }
  }
  return null;
}

// ────────────────────────────────────────────────
// blog-content.ts 삽입
// ────────────────────────────────────────────────
function postToTs(post) {
  // Recursively convert the JS object to a TypeScript object literal.
  // All strings become template literals so multi-line content is always valid.
  function escTs(str) {
    return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
  }
  function toTs(val, depth) {
    const pad = '  '.repeat(depth);
    const ipad = '  '.repeat(depth + 1);
    if (val === null) return 'null';
    if (typeof val === 'boolean' || typeof val === 'number') return String(val);
    if (typeof val === 'string') return '`' + escTs(val) + '`';
    if (Array.isArray(val)) {
      if (val.length === 0) return '[]';
      const items = val.map(v => ipad + toTs(v, depth + 1));
      return '[\n' + items.join(',\n') + ',\n' + pad + ']';
    }
    const entries = Object.entries(val).map(([k, v]) => ipad + k + ': ' + toTs(v, depth + 1));
    return '{\n' + entries.join(',\n') + ',\n' + pad + '}';
  }
  return toTs(post, 1);
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

// ────────────────────────────────────────────────
// Git commit + push
// ────────────────────────────────────────────────
function gitPush(post) {
  const msg = `Auto-publish: ${post.title.slice(0, 60)}`;
  execSync('git add src/data/blog-content.ts src/data/blog-posts-meta.ts public/sitemap.xml public/rss.xml scripts/post-queue.json', { cwd: ROOT });
  execSync(`git -c user.email="lsk7209@gmail.com" -c user.name="lsk7209" commit -m "${msg.replace(/"/g, "'")}"`, { cwd: ROOT });
  execSync('git push origin main', { cwd: ROOT });
  console.log('🚀 git push 완료 → Vercel 배포 시작');
}

// ────────────────────────────────────────────────
// Google Indexing API (JWT RS256)
// ────────────────────────────────────────────────
async function googleIndexingApiPing(url) {
  const SA_PATH = 'D:/env/cursorai-451704-85a5abbe8eeb.json';
  const sa = JSON.parse(readFileSync(SA_PATH, 'utf-8'));

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    sub: sa.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })).toString('base64url');

  const sigInput = `${header}.${payload}`;
  const sign = createSign('RSA-SHA256');
  sign.update(sigInput);
  const sig = sign.sign(sa.private_key, 'base64url');
  const jwt = `${sigInput}.${sig}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) throw new Error(`token error: ${JSON.stringify(tokenData)}`);

  const indexRes = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenData.access_token}`,
    },
    body: JSON.stringify({ url, type: 'URL_UPDATED' }),
  });
  return indexRes.status;
}

// ────────────────────────────────────────────────
// 검색엔진 핑
// ────────────────────────────────────────────────
async function pingSearchEngines(slug) {
  const url = `${SITE_URL}/blog/${slug}`;
  const indexNowKey = 'crepika2026indexnow';
  const indexNowBody = JSON.stringify({
    host: 'crepika.com',
    key: indexNowKey,
    keyLocation: `${SITE_URL}/${indexNowKey}.txt`,
    urlList: [url],
  });

  await Promise.allSettled([
    fetch('https://www.bing.com/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: indexNowBody,
    }).then(r => console.log(`📡 Bing IndexNow: ${r.status}`)).catch(() => {}),
    fetch('https://searchadvisor.naver.com/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: indexNowBody,
    }).then(r => console.log(`📡 Naver IndexNow: ${r.status}`)).catch(() => {}),
    googleIndexingApiPing(url)
      .then(status => console.log(`📡 Google Indexing API: ${status}`))
      .catch(e => console.log(`📡 Google Indexing API 실패: ${e.message}`)),
  ]);
}

// ────────────────────────────────────────────────
// 일별 리포트
// ────────────────────────────────────────────────
function writeDailyReport() {
  const today = getTodayDate();
  const queue = JSON.parse(readFileSync(QUEUE_FILE, 'utf-8'));
  const published = queue.filter(e => e.published).length;
  const remaining = queue.filter(e => !e.published).length;
  const etaDays = remaining > 0 ? Math.ceil(remaining / (24 / 5)) : 0;
  const etaDate = new Date(Date.now() + etaDays * 86400000).toISOString().split('T')[0];

  const todayLogs = publishLog.filter(l => l.date === today);
  const reportPath = join(REPORTS_DIR, `${today}.md`);
  writeFileSync(reportPath, `# 크레피카 자동 발행 일별 리포트 — ${today}

## 오늘 발행
${todayLogs.map(l => `- [${l.title.slice(0, 50)}](${SITE_URL}/blog/${l.slug})`).join('\n') || '없음'}

## 전체 현황
- 발행 완료: ${published}개
- 남은 글: ${remaining}개
- 예상 완료일: ${etaDate} (약 ${etaDays}일 후)

## 연속 실패: ${consecutiveFails}회
`);
}

// ────────────────────────────────────────────────
// 큐 업데이트
// ────────────────────────────────────────────────
function markPublished(entry) {
  const queue = JSON.parse(readFileSync(QUEUE_FILE, 'utf-8'));
  const e = queue.find(q => q.id === entry.id);
  if (e) { e.published = true; e.publishedDate = getTodayDate(); }
  writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2), 'utf-8');
}

// ────────────────────────────────────────────────
// 메인 루프
// ────────────────────────────────────────────────
async function publishOne() {
  const next = getNextDraft();

  if (!next) {
    console.log('✅ 모든 드래프트 발행 완료!');
    return false;
  }

  const { entry, post, draftPath } = next;
  console.log(`\n📰 발행 시작: [${entry.id}] ${entry.title.slice(0, 60)}`);

  try {
    injectIntoBlogContent(post);
    injectIntoSitemap(post);
    injectIntoRss(post);
    // Auto-fix quality issues (clichés, short description) before git push
    try { execSync(`node scripts/fix-new-post.mjs "${post.slug}"`, { cwd: ROOT, stdio: 'inherit' }); } catch {}
    // Regenerate blog-posts-meta.ts (lightweight listing data)
    try { execSync('node scripts/gen-meta.mjs', { cwd: ROOT, stdio: 'inherit' }); } catch {}
    markPublished(entry);
    gitPush(post);
    await pingSearchEngines(post.slug);

    publishLog.push({ date: getTodayDate(), slug: post.slug, title: post.title });
    writeFileSync(PUBLISH_LOG, JSON.stringify(publishLog, null, 2), 'utf-8');

    consecutiveFails = 0;
    console.log(`✅ 발행 완료: ${SITE_URL}/blog/${post.slug}`);
    return true;
  } catch (e) {
    consecutiveFails++;
    console.error(`❌ 발행 실패 (연속 ${consecutiveFails}회):`, e.message);
    // 삽입 실패 시 blog-content.ts 롤백 시도
    try { execSync('git checkout -- src/data/blog-content.ts public/sitemap.xml public/rss.xml', { cwd: ROOT }); } catch (_) {}
    return null;
  }
}

async function main() {
  console.log('🤖 크레피카 자동 발행 스케줄러 시작');
  console.log(`   기본 간격: 5시간 ± ${Math.abs(MIN_JITTER_MS/60000)}~${MAX_JITTER_MS/60000}분 jitter`);
  console.log('   중단: scripts/stop.signal 파일 생성\n');

  while (true) {
    // 중단 신호 확인
    if (existsSync(STOP_SIGNAL)) {
      console.log('🛑 stop.signal 감지 — 스케줄러 종료');
      break;
    }

    // 연속 5회 실패 시 일시 정지
    if (consecutiveFails >= MAX_CONSECUTIVE_FAILS) {
      console.error(`⛔ 연속 ${MAX_CONSECUTIVE_FAILS}회 실패 — 자동 일시 정지`);
      console.error('   문제를 확인 후 스크립트를 재시작하세요.');
      break;
    }

    // 일별 리포트 (자정 전후 1분 내)
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() < 5) {
      writeDailyReport();
      console.log(`📊 일별 리포트 생성: ${getTodayDate()}`);
    }

    const result = await publishOne();

    if (result === false) {
      // 모든 드래프트 소진
      writeDailyReport();
      console.log('\n🎉 전체 300편 발행 완료!');
      break;
    }

    await jitteredSleep();
  }
}

main().catch(e => {
  console.error('❌ 치명적 오류:', e);
  process.exit(1);
});
