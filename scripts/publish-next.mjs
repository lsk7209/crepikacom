#!/usr/bin/env node
/**
 * 크레피카 자율 발행 스크립트
 * post-queue.json에서 다음 미발행 포스트를 선택해 Claude API로 본문 생성 후 발행합니다.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const QUEUE_FILE = join(ROOT, 'scripts', 'post-queue.json');
const BLOG_CONTENT_FILE = join(ROOT, 'src', 'data', 'blog-content.ts');
const SITEMAP_FILE = join(ROOT, 'public', 'sitemap.xml');
const RSS_FILE = join(ROOT, 'public', 'rss.xml');
const TITLE_FILE = join(ROOT, '.last-published-title');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const SITE_URL = 'https://crepika.com';
const MODEL = 'claude-sonnet-4-6';

// 이미 발행된 슬러그 목록 — blog-content.ts에서 동적으로 추출
function getExistingSlugs() {
  const content = readFileSync(BLOG_CONTENT_FILE, 'utf-8');
  const slugs = [];
  const re = /slug:\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(content)) !== null) slugs.push(m[1]);
  return slugs;
}

// 큐에서 발행된 포스트의 카테고리별 슬러그 반환 (내부 링크 개선용)
function getPublishedSlugsByCategory(category) {
  const queue = JSON.parse(readFileSync(QUEUE_FILE, 'utf-8'));
  const sameCat = queue.filter(e => e.published && e.category === category).map(e => e.slug).slice(-3);
  if (sameCat.length >= 2) return sameCat;
  // 동일 카테고리가 부족하면 전체 최근 발행 슬러그로 보완
  const recent = queue.filter(e => e.published).map(e => e.slug).slice(-3);
  return [...new Set([...sameCat, ...recent])].slice(0, 3);
}

const TOOL_SLUGS = [
  'text-counter',
  'byte-counter',
  'webp-converter',
  'insta-spacer',
  'hashtag-mixer',
  'qr-generator',
  'lorem-generator',
];

function getRelatedToolsForCategory(category) {
  const map = {
    guide: ['text-counter', 'hashtag-mixer'],
    tips: ['byte-counter', 'insta-spacer'],
    insights: ['text-counter', 'qr-generator'],
    'case-study': ['webp-converter', 'hashtag-mixer'],
  };
  return map[category] || ['text-counter'];
}

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function estimateWordCount(obj) {
  return JSON.stringify(obj).length / 3;
}

function validatePost(post) {
  const errors = [];
  if (!post.slug || typeof post.slug !== 'string') errors.push('slug 없음');
  if (!post.title || typeof post.title !== 'string') errors.push('title 없음');
  if (!post.description || typeof post.description !== 'string') errors.push('description 없음');
  if (!['guide', 'tips', 'insights', 'case-study'].includes(post.category)) errors.push('category 오류');
  if (!Array.isArray(post.keywords) || post.keywords.length < 3) errors.push('keywords 3개 미만');
  if (!post.content?.introduction) errors.push('introduction 없음');
  if (!Array.isArray(post.content?.sections) || post.content.sections.length < 4) errors.push(`sections ${post.content?.sections?.length ?? 0}개 (4개 이상 필요)`);
  if (!post.content?.conclusion) errors.push('conclusion 없음');
  if (!Array.isArray(post.faq) || post.faq.length < 4) errors.push(`faq ${post.faq?.length ?? 0}개 (4개 이상 필요)`);
  if (estimateWordCount(post) < 500) errors.push('본문 너무 짧음');
  return errors;
}

async function callClaude(systemPrompt, userPrompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 12000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API 오류 (${response.status}): ${err}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

const AUTHOR_PERSONAS = {
  '김민혁': 'SEO 전략가 김민혁입니다. 데이터 기반 분석, 구체적 수치, 구글·네이버 검색 전략을 전문으로 합니다. 논리적이고 근거 있는 문체로 작성하세요.',
  '이지수': '소셜미디어 전문가 이지수입니다. 인스타그램·틱톡·네이버 블로그 실전 경험을 기반으로 크리에이터가 바로 적용할 수 있는 실용적 조언을 제공합니다. 친근하고 활력 있는 문체로 작성하세요.',
  '박준영': '개발자 출신 크리에이터 박준영입니다. 기술 도구 활용, 자동화, 효율화 관점에서 콘텐츠를 다룹니다. 명확하고 단계적인 문체로 작성하세요.',
};

function buildSystemPrompt(author) {
  const persona = AUTHOR_PERSONAS[author] || AUTHOR_PERSONAS['김민혁'];
  return `당신은 ${persona}

크레피카(crepika.com)의 전문 콘텐츠 작가로서 다음 도구들을 자연스럽게 연결합니다:
- 글자수 세기 (/tools/text-counter)
- 한글 바이트 카운터 (/tools/byte-counter)
- WebP 변환기 (/tools/webp-converter)
- 인스타 줄바꿈 포매터 (/tools/insta-spacer)
- 해시태그 믹서 (/tools/hashtag-mixer)
- QR 코드 생성기 (/tools/qr-generator)
- 로렘 생성기 (/tools/lorem-generator)

글쓰기 원칙:
1. 한국어만 사용 (영어 병기 금지)
2. 실용적이고 즉시 적용 가능한 정보 제공
3. 크레피카 도구를 자연스럽게 1~2회 본문에 연결
4. **볼드**, - 리스트, ## 섹션 마크다운 활용
5. EEAT(전문성·권위·신뢰·경험) 기준 충족
6. 구체적 수치, 사례, 단계별 안내 포함
7. JSON만 반환 (코드 펜스 없음, 추가 설명 없음)`;
}

function buildUserPrompt(entry) {
  const today = getTodayDate();
  const relatedTools = getRelatedToolsForCategory(entry.category);
  const allSlugs = getExistingSlugs();
  const relatedSlugs = getPublishedSlugsByCategory(entry.category).length > 0
    ? getPublishedSlugsByCategory(entry.category)
    : allSlugs.slice(-3);

  return `다음 주제로 고품질 블로그 포스트를 작성하세요.

제목: ${entry.title}
슬러그: ${entry.slug}
카테고리: ${entry.category}
메인 키워드: ${entry.mainKeyword}
확장 키워드: ${entry.extendedKeywords.join(', ')}
저자: ${entry.author}
예상 읽기 시간: ${entry.estimatedReadTime}
발행일: ${today}

요구사항:
- sections 4개 이상 (각 섹션에 풍부한 내용, subsections 선택)
- faq 4개 이상 (AEO 최적화용 실제 검색 질문)
- keywords 5~7개
- introduction 200자 이상
- 각 section content 300자 이상
- conclusion 150자 이상
- relatedTools: ${JSON.stringify(relatedTools)}
- relatedPosts: ${JSON.stringify(relatedSlugs)}
- 본문에서 크레피카 도구 자연 연결 1~2회

다음 JSON 구조로만 응답하세요 (코드 펜스 없이 순수 JSON):
{
  "slug": "${entry.slug}",
  "title": "${entry.title}",
  "description": "155자 이내 메타 설명",
  "category": "${entry.category}",
  "publishDate": "${today}",
  "dateModified": "${today}",
  "readTime": "${entry.estimatedReadTime}",
  "author": "${entry.author}",
  "keywords": ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5"],
  "content": {
    "introduction": "소개 텍스트",
    "sections": [
      {
        "heading": "섹션 제목",
        "content": "섹션 내용 (마크다운 지원)",
        "subsections": [
          { "subheading": "서브 제목", "content": "서브 내용" }
        ]
      }
    ],
    "conclusion": "결론 텍스트"
  },
  "relatedTools": ${JSON.stringify(relatedTools)},
  "relatedPosts": ${JSON.stringify(relatedSlugs)},
  "faq": [
    { "question": "질문?", "answer": "답변" }
  ]
}`;
}

function postToTs(post) {
  const escaped = JSON.stringify(post, (key, value) => {
    if (typeof value === 'string') return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return value;
  }, 2);
  return escaped
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/"/g, "'");
}

function injectIntoBlogContent(post) {
  // Normalize CRLF to LF so the marker search works regardless of OS
  let content = readFileSync(BLOG_CONTENT_FILE, 'utf-8').replace(/\r\n/g, '\n');

  const marker = '];\n\nexport function getBlogPostBySlug';
  const idx = content.indexOf(marker);
  if (idx === -1) throw new Error('blog-content.ts에서 삽입 위치를 찾을 수 없습니다.');

  const postTs = postToTs(post);
  const newEntry = `,\n  ${postTs.split('\n').join('\n  ')}\n`;

  const newContent = content.slice(0, idx) + newEntry + content.slice(idx);
  writeFileSync(BLOG_CONTENT_FILE, newContent, 'utf-8');
  console.log(`✅ blog-content.ts에 "${post.title}" 삽입 완료`);
}

function injectIntoSitemap(post) {
  let content = readFileSync(SITEMAP_FILE, 'utf-8');
  const today = getTodayDate();

  const newUrl = `
  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;

  content = content.replace('</urlset>', newUrl + '\n</urlset>');
  writeFileSync(SITEMAP_FILE, content, 'utf-8');
  console.log(`✅ sitemap.xml 업데이트 완료`);
}

function buildPubDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z');
  return d.toUTCString().replace(/GMT$/, 'GMT');
}

function injectIntoRss(post) {
  let content = readFileSync(RSS_FILE, 'utf-8');

  const newItem = `
  <item>
    <title>${post.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</title>
    <link>${SITE_URL}/blog/${post.slug}</link>
    <description>${post.description.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</description>
    <pubDate>${buildPubDate(post.publishDate)}</pubDate>
    <guid>${SITE_URL}/blog/${post.slug}</guid>
    <dc:creator>${post.author}</dc:creator>
  </item>`;

  content = content
    .replace(/<lastBuildDate>[^<]*<\/lastBuildDate>/, `<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`)
    .replace('</channel>', newItem + '\n\n</channel>');
  writeFileSync(RSS_FILE, content, 'utf-8');
  console.log(`✅ rss.xml 업데이트 완료`);
}

async function main() {
  console.log('🚀 크레피카 자율 발행 시작...');

  const queue = JSON.parse(readFileSync(QUEUE_FILE, 'utf-8'));
  const entry = queue.find(e => !e.published);

  if (!entry) {
    console.log('✅ 발행 대기 중인 포스트가 없습니다. 큐가 완료되었습니다.');
    process.exit(0);
  }

  console.log(`📝 다음 발행 포스트: [${entry.id}] ${entry.title}`);

  const systemPrompt = buildSystemPrompt(entry.author);
  const userPrompt = buildUserPrompt(entry);

  let post = null;
  let errors = [];

  for (let attempt = 1; attempt <= 2; attempt++) {
    console.log(`🤖 Claude API 호출 중... (시도 ${attempt}/2)`);
    try {
      const raw = await callClaude(systemPrompt, attempt === 1 ? userPrompt : userPrompt + '\n\n이전 시도가 다음 이유로 실패했습니다: ' + errors.join(', ') + '\n위 요구사항을 다시 확인하고 완전한 JSON을 반환하세요.');

      const cleaned = raw.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      post = JSON.parse(cleaned);
      errors = validatePost(post);

      if (errors.length === 0) {
        console.log(`✅ 포스트 유효성 검사 통과 (시도 ${attempt})`);
        break;
      } else {
        console.warn(`⚠️ 유효성 검사 실패 (시도 ${attempt}):`, errors);
        post = null;
      }
    } catch (e) {
      console.error(`❌ 시도 ${attempt} 실패:`, e.message);
      errors = [e.message];
    }
  }

  if (!post) {
    console.error('❌ 2회 시도 모두 실패. 이 포스트를 건너뜁니다.');
    entry.published = false;
    entry.error = errors.join('; ');
    entry.skipReason = 'generation_failed';
    writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2), 'utf-8');
    process.exit(1);
  }

  injectIntoBlogContent(post);
  injectIntoSitemap(post);
  injectIntoRss(post);

  entry.published = true;
  entry.publishedDate = getTodayDate();
  writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2), 'utf-8');
  console.log(`✅ post-queue.json 마킹 완료`);

  writeFileSync(TITLE_FILE, post.title, 'utf-8');

  await pingSearchEngines(post.slug);

  console.log(`\n🎉 발행 완료: ${post.title}`);
  console.log(`🔗 URL: ${SITE_URL}/blog/${post.slug}`);
}

async function pingSearchEngines(slug) {
  const url = `${SITE_URL}/blog/${slug}`;
  const INDEXNOW_KEY = 'crepika2026indexnow';

  const pings = [
    // IndexNow (Bing, Yandex, Seznam 등 동시)
    fetch(`https://api.indexnow.org/indexnow?url=${encodeURIComponent(url)}&key=${INDEXNOW_KEY}`)
      .then(r => console.log(`📡 IndexNow 핑: ${r.status}`))
      .catch(() => {}),
    // Bing 사이트맵 핑
    fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(SITE_URL + '/sitemap.xml')}`)
      .then(r => console.log(`📡 Bing 핑: ${r.status}`))
      .catch(() => {}),
    // 네이버 사이트맵 핑
    fetch(`https://searchadvisor.naver.com/site/submit?url=${encodeURIComponent(SITE_URL + '/sitemap.xml')}`)
      .then(r => console.log(`📡 Naver 핑: ${r.status}`))
      .catch(() => {}),
  ];

  await Promise.allSettled(pings);
  console.log(`✅ 검색엔진 핑 완료`);
}

main().catch(e => {
  console.error('❌ 치명적 오류:', e);
  process.exit(1);
});
