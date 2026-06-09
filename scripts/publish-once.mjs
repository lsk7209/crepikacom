#!/usr/bin/env node
/**
 * GitHub Actions용 단발 발행 스크립트
 * scripts/drafts/{slug}.json → blog-content.ts + sitemap + rss → git commit+push → 검색엔진 핑
 * 루프/슬립 없이 1편 발행 후 종료. ANTHROPIC_API_KEY 불필요.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync, execSync } from 'child_process';

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

// slugs: 배치로 발행된 글 slug 배열. IndexNow는 글별, 사이트맵 핑은 1회.
async function pingSearchEngines(slugs) {
  try {
    execFileSync(process.execPath, ['scripts/notify-indexing.mjs', '--slugs', slugs.join(',')], {
      cwd: ROOT,
      stdio: 'inherit',
    });
  } catch (error) {
    console.warn('Indexing notification failed without blocking publication:', error instanceof Error ? error.message : error);
  }
}

async function main() {
  // BATCH_SIZE편을 한 번에 inject한 뒤 1 commit/push로 묶어 Vercel 빌드 횟수를 줄인다.
  // BATCH_SIZE=1 이면 기존 단발 발행과 동일(하위호환). DRY_RUN=1 이면 git push 생략.
  const BATCH_SIZE = Math.max(1, parseInt(process.env.BATCH_SIZE || '5', 10));
  const DRY_RUN = process.env.DRY_RUN === '1';

  const published = [];
  for (let i = 0; i < BATCH_SIZE; i++) {
    const next = getNextDraft();
    if (!next) break;
    const { entry, post } = next;
    console.log(`📰 [${published.length + 1}/${BATCH_SIZE}] 발행: [${entry.id}] ${post.title}`);

    injectIntoBlogContent(post);
    injectIntoSitemap(post);
    injectIntoRss(post);

    // 클리셰 자동 수정 (글별)
    try { execSync(`node scripts/fix-new-post.mjs "${post.slug}"`, { cwd: ROOT, stdio: 'inherit' }); } catch {}

    markPublished(entry);
    published.push(post);
  }

  if (published.length === 0) {
    console.log('✅ 모든 드래프트 발행 완료 — 큐 소진');
    process.exit(0);
  }

  // blog-posts-meta.ts 재생성 (배치당 1회)
  try { execSync('node scripts/gen-meta.mjs', { cwd: ROOT, stdio: 'inherit' }); } catch {}

  // Regenerate canonical indexable surfaces after the batch is injected.
  // This keeps sitemap, RSS, AI index, llms files, and crawler-visible
  // static pages aligned with src/data/blog-content.ts.
  execSync('node scripts/sync-indexable-content.mjs', { cwd: ROOT, stdio: 'inherit' });
  execSync('node scripts/generate-crawler-pages.mjs', { cwd: ROOT, stdio: 'inherit' });
  execSync('node scripts/verify-seo-gates.mjs', { cwd: ROOT, stdio: 'inherit' });
  execSync('npm run lint', { cwd: ROOT, stdio: 'inherit' });
  execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });

  // 로컬 발행 로그 누적 (커밋 대상 아님 — 기존 동작 유지)
  const publishLog = existsSync(PUBLISH_LOG) ? JSON.parse(readFileSync(PUBLISH_LOG, 'utf-8')) : [];
  for (const post of published) publishLog.push({ date: getTodayDate(), slug: post.slug, title: post.title });
  writeFileSync(PUBLISH_LOG, JSON.stringify(publishLog, null, 2), 'utf-8');

  if (DRY_RUN) {
    console.log(`🧪 DRY_RUN — git push 생략. ${published.length}편 inject 완료(워킹트리 확인용).`);
    console.log(`   발행분: ${published.map(p => p.slug).join(', ')}`);
    return;
  }

  // git commit + push (배치당 1회 → Vercel 빌드 1회)
  const titles = published.map(p => p.title.slice(0, 40)).join(', ');
  const msg = `Auto-publish ${published.length} blog posts through scheduled queue`.slice(0, 180);
  execSync('git config user.email "auto-publisher@crepika.com"', { cwd: ROOT });
  execSync('git config user.name "크레피카 자동 발행"', { cwd: ROOT });
  execSync('git add src/data/blog-content.ts src/data/blog-posts-meta.ts src/data/recent-blog-posts-meta.ts public/sitemap.xml public/rss.xml public/ai-index.json public/llms.txt public/llms-full.txt public/blog scripts/post-queue.json', { cwd: ROOT });
  const messageArgs = [
    '-m',
    JSON.stringify(msg),
    '-m',
    JSON.stringify(`Publish scheduled blog batch: ${titles}`.slice(0, 500)),
    '-m',
    JSON.stringify('Constraint: GitHub push is the deployment path; no direct Vercel deployment command is used.'),
    '-m',
    JSON.stringify('Rejected: Manual production deployment | The repository integration owns Vercel deployment.'),
    '-m',
    JSON.stringify('Confidence: high'),
    '-m',
    JSON.stringify('Scope-risk: moderate'),
    '-m',
    JSON.stringify('Directive: Regenerate sitemap, RSS, AI index, llms files, and crawler pages after every scheduled content batch.'),
    '-m',
    JSON.stringify('Tested: publish-once content injection passed; indexable content regenerated; verify:seo, lint, and build passed before commit'),
    '-m',
    JSON.stringify('Not-tested: Live Vercel deployment is handled by GitHub integration after push'),
  ].join(' ');
  execSync(`git commit ${messageArgs}`, { cwd: ROOT });
  execSync('git push origin main', { cwd: ROOT });
  console.log(`🚀 git push 완료 (${published.length}편 1커밋) → Vercel 배포 1회`);

  // 발행분 일괄 검색엔진 핑 (push 후 — 404 방지)
  await pingSearchEngines(published.map(p => p.slug));

  const queue = JSON.parse(readFileSync(QUEUE_FILE, 'utf-8'));
  const remaining = queue.filter(e => !e.published).length;
  console.log(`✅ 배치 발행 완료: ${published.length}편 / 남은 글: ${remaining}개`);
}

main().catch(e => { console.error('❌ 오류:', e.message); process.exit(1); });
