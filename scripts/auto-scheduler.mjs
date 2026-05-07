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
  // Use backtick template literals for string values to prevent single-quote
  // double-escaping (the old replacer approach caused \' → \\' → build error).
  const json = JSON.stringify(post, null, 2);
  let ts = json.replace(/"([a-zA-Z_][a-zA-Z0-9_]*)":/g, '$1:');
  ts = ts.replace(/"((?:[^"\\]|\\.)*)"/g, (match, jsonBody) => {
    let val;
    try { val = JSON.parse('"' + jsonBody + '"'); } catch { return match; }
    const bt = val
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\$\{/g, '\\${');
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

// ────────────────────────────────────────────────
// Git commit + push
// ────────────────────────────────────────────────
function gitPush(post) {
  const msg = `Auto-publish: ${post.title.slice(0, 60)}`;
  execSync('git add src/data/blog-content.ts public/sitemap.xml public/rss.xml scripts/post-queue.json', { cwd: ROOT });
  execSync(`git commit -m "${msg.replace(/"/g, "'")}"`, { cwd: ROOT });
  execSync('git push origin main', { cwd: ROOT });
  console.log('🚀 git push 완료 → Vercel 배포 시작');
}

// ────────────────────────────────────────────────
// 검색엔진 핑
// ────────────────────────────────────────────────
async function pingSearchEngines(slug) {
  const url = `${SITE_URL}/blog/${slug}`;
  const key = 'crepika2026indexnow';
  await Promise.allSettled([
    fetch(`https://api.indexnow.org/indexnow?url=${encodeURIComponent(url)}&key=${key}`).then(r => console.log(`📡 IndexNow: ${r.status}`)).catch(() => {}),
    fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(SITE_URL + '/sitemap.xml')}`).then(r => console.log(`📡 Bing: ${r.status}`)).catch(() => {}),
    fetch(`https://searchadvisor.naver.com/site/submit?url=${encodeURIComponent(SITE_URL + '/sitemap.xml')}`).then(r => console.log(`📡 Naver: ${r.status}`)).catch(() => {}),
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
