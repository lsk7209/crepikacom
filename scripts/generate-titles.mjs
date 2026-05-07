#!/usr/bin/env node
/**
 * 제목 큐 등록 스크립트
 * titles-input.json 파일에서 제목 목록을 읽어 post-queue.json에 추가합니다.
 * 콘텐츠 생성은 Claude Code가 직접 처리.
 *
 * 사용법:
 *   node scripts/generate-titles.mjs              → post-queue.json 상태 확인
 *   node scripts/generate-titles.mjs --add        → titles-input.json → 큐에 추가
 *   node scripts/generate-titles.mjs --check      → 중복 검사
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const QUEUE_FILE = join(ROOT, 'scripts', 'post-queue.json');
const INPUT_FILE = join(ROOT, 'scripts', 'titles-input.json');
const BLOG_CONTENT_FILE = join(ROOT, 'src', 'data', 'blog-content.ts');

function getExistingSlugs() {
  const content = readFileSync(BLOG_CONTENT_FILE, 'utf-8');
  const re = /slug:\s*['"]([^'"]+)['"]/g;
  const slugs = [];
  let m;
  while ((m = re.exec(content)) !== null) slugs.push(m[1]);
  return new Set(slugs);
}

function showStatus() {
  const queue = JSON.parse(readFileSync(QUEUE_FILE, 'utf-8'));
  const published = queue.filter(e => e.published).length;
  const pending = queue.filter(e => !e.published).length;
  console.log(`📊 post-queue.json 현황`);
  console.log(`   전체: ${queue.length}개`);
  console.log(`   발행 완료: ${published}개`);
  console.log(`   미발행 (발행 대기): ${pending}개`);
  if (pending > 0) {
    console.log(`\n  첫 5개 미발행:`);
    queue.filter(e => !e.published).slice(0, 5).forEach(e => console.log(`   [${e.id}] ${e.title}`));
  }
}

function addTitles() {
  if (!existsSync(INPUT_FILE)) {
    console.error(`❌ ${INPUT_FILE} 파일이 없습니다.`);
    console.log('   titles-input.json 형식:');
    console.log(`   [{"title":"제목","category":"guide","mainKeyword":"키워드","extendedKeywords":["k1","k2"],"author":"김민혁","estimatedReadTime":"8분","slug":"optional-slug"}]`);
    process.exit(1);
  }

  const input = JSON.parse(readFileSync(INPUT_FILE, 'utf-8'));
  const queue = JSON.parse(readFileSync(QUEUE_FILE, 'utf-8'));
  const existingSlugs = getExistingSlugs();
  const queueSlugs = new Set(queue.map(e => e.slug));
  const maxId = Math.max(...queue.map(e => e.id), 0);

  const KO_MAP = [
    ['스레드','threads'],['트위터','twitter'],['핀터레스트','pinterest'],
    ['링크드인','linkedin'],['틱톡','tiktok'],['유튜브','youtube'],
    ['인스타그램','instagram'],['인스타','insta'],['네이버','naver'],
    ['카카오','kakao'],['구글','google'],['페이스북','facebook'],
    ['마케팅','marketing'],['전략','strategy'],['가이드','guide'],
    ['완벽','complete'],['완전','complete'],['정복','mastery'],
    ['팁','tips'],['블로그','blog'],['콘텐츠','content'],
    ['키워드','keyword'],['검색','search'],['광고','ads'],
    ['수익화','monetization'],['수익','revenue'],['분석','analytics'],
    ['자동화','automation'],['도구','tools'],['크리에이터','creator'],
    ['소셜미디어','social'],['알고리즘','algorithm'],['최적화','optimization'],
    ['성장','growth'],['팔로워','follower'],['브랜드','brand'],
    ['커뮤니티','community'],['편집','editing'],['쇼핑','shopping'],
    ['라이브','live'],['숏폼','shortform'],['릴스','reels'],
    ['쇼츠','shorts'],['클립','clips'],['입문','beginner'],
    ['심화','advanced'],['실전','practical'],['사례','case'],
    ['비교','comparison'],['활용','usage'],['방법','method'],
  ];

  function makeSlug(title) {
    let s = title.toLowerCase();
    for (const [k, v] of KO_MAP) s = s.replace(new RegExp(k, 'g'), v);
    return s.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  }

  let added = 0, skipped = 0;
  const newEntries = [];

  input.forEach((item, i) => {
    let slug = item.slug || makeSlug(item.title);
    let finalSlug = slug;
    let suffix = 1;
    const allSlugs = new Set([...existingSlugs, ...queueSlugs, ...newEntries.map(e => e.slug)]);
    while (allSlugs.has(finalSlug)) finalSlug = `${slug}-${suffix++}`;

    if (queueSlugs.has(finalSlug)) { skipped++; return; }

    newEntries.push({
      id: maxId + newEntries.length + 1,
      slug: finalSlug,
      title: item.title,
      category: item.category || 'guide',
      mainKeyword: item.mainKeyword || item.title.split(':')[0].trim(),
      extendedKeywords: item.extendedKeywords || [],
      author: item.author || '김민혁',
      estimatedReadTime: item.estimatedReadTime || '8분',
      published: false,
    });
    added++;
  });

  queue.push(...newEntries);
  writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2), 'utf-8');
  console.log(`✅ ${added}개 추가 완료 (스킵: ${skipped}개)`);
  console.log(`   전체 큐: ${queue.length}개`);
}

function checkDuplicates() {
  const queue = JSON.parse(readFileSync(QUEUE_FILE, 'utf-8'));
  const existingSlugs = getExistingSlugs();
  const overlap = queue.filter(e => existingSlugs.has(e.slug) && !e.published);
  console.log(`중복 슬러그 (큐에 있지만 blog-content.ts에도 있음): ${overlap.length}개`);
  overlap.slice(0, 10).forEach(e => console.log(`  - ${e.slug}`));
}

const arg = process.argv[2];
if (arg === '--add') addTitles();
else if (arg === '--check') checkDuplicates();
else showStatus();
