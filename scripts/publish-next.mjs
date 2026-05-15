#!/usr/bin/env node
/**
 * 크레피카 자율 발행 스크립트
 * post-queue.json에서 다음 미발행 포스트를 선택해 Claude API로 본문 생성 후 발행합니다.
 */

import { readFileSync, writeFileSync } from 'fs';
import { createSign } from 'crypto';
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
  '김민혁': {
    intro: 'SEO 전략가 김민혁입니다. 구글·네이버 알고리즘 분석 10년 경력, 직접 운영한 50개+ 사이트 데이터 기반으로 작성합니다.',
    style: '논리적·수치 중심. 주장마다 데이터 근거 필수. "필자가 직접 A/B 테스트한 결과", "실제 클라이언트 사례" 형식 활용.',
  },
  '이지수': {
    intro: '소셜미디어 전문가 이지수입니다. 인스타그램 팔로워 12만 크리에이터 컨설팅 4년 경력, 직접 실험하고 검증한 전략만 씁니다.',
    style: '친근·실전적. "제가 실제로 해봤더니", "이 방법으로 팔로워가 3배 늘었어요" 같은 체험 기반 서술. 단계별 실행 가이드.',
  },
  '박준영': {
    intro: '개발자 출신 크리에이터 박준영입니다. 자동화 도구 100개+ 직접 테스트, 시간당 효율 데이터로 검증된 방법만 소개합니다.',
    style: '명확·단계적. 코드/도구 사용법을 개발자 관점에서 쉽게 풀어 설명. 시간 절약 수치 필수 포함.',
  },
};

const CREPIKA_TOOLS = [
  { name: '글자수 세기', path: '/tools/text-counter', use: '원고 글자수·공백 포함/제외 카운팅' },
  { name: '한글 바이트 카운터', path: '/tools/byte-counter', use: '네이버 메타 설명 80바이트 준수' },
  { name: 'WebP 변환기', path: '/tools/webp-converter', use: '이미지 용량 최적화' },
  { name: '인스타 줄바꿈 포매터', path: '/tools/insta-spacer', use: '인스타그램 줄바꿈 유지' },
  { name: '해시태그 믹서', path: '/tools/hashtag-mixer', use: '해시태그 조합 최적화' },
  { name: 'QR 코드 생성기', path: '/tools/qr-generator', use: '오프라인 채널 연결 QR' },
  { name: '로렘 생성기', path: '/tools/lorem-generator', use: '디자인 시안용 더미 텍스트' },
];

function buildSystemPrompt(author) {
  const persona = AUTHOR_PERSONAS[author] || AUTHOR_PERSONAS['김민혁'];
  const toolList = CREPIKA_TOOLS.map(t => `- [${t.name}](${t.path}): ${t.use}`).join('\n');
  return `당신은 ${persona.intro}
${persona.style}

크레피카(crepika.com) 전속 필진으로, 아래 도구를 본문에 자연스럽게 2회 이상 마크다운 링크로 삽입합니다:
${toolList}

## 구글 상위노출 필수 원칙 (엄수)

1. **E-E-A-T 경험 신호**: 매 섹션마다 "직접 해본 결과", "실제 데이터", "사례" 중 1가지 이상 포함. 추상적 조언 금지.
2. **출처 있는 수치**: 통계·수치 사용 시 "(출처: 기관명, 2024년)" 형식 필수. 수치 없이 "많은", "대부분" 표현 금지.
3. **크레피카 도구 마크다운 링크 2회 이상**: relatedTools 배열이 아니라 introduction 또는 section content 본문 안에 [도구명](경로) 형식으로 삽입. 예: "[글자수 세기](/tools/text-counter)로 확인하면"
4. **한국 시장 구체 사례**: 국내 크리에이터·플랫폼(네이버 블로그, 인스타그램 KR, 카카오, 유튜브 KR) 기준 수치와 사례 사용.
5. **검색 의도 직접 해결**: 도입부 첫 3문장 안에 핵심 질문에 직접 답변. "이 글에서는 X를 설명합니다" 금지, "X를 하려면 A→B→C 순서로 하면 됩니다" 형식 사용.
6. **단계별 실행 가이드**: 최소 1개 섹션은 번호 매긴 단계별 방법(1. 2. 3.) 포함.
7. **비교·대조 구조**: 플랫폼/방법/도구 비교 시 표(| 항목 | A | B |) 형식 활용.
8. **분량**: introduction 300자+, 각 section 500자+, conclusion 200자+, FAQ 5개+.
9. JSON만 반환 (코드 펜스 없음, 추가 설명 없음).`;
}

function buildUserPrompt(entry) {
  const today = getTodayDate();
  const relatedTools = getRelatedToolsForCategory(entry.category);
  const allSlugs = getExistingSlugs();
  const relatedSlugs = getPublishedSlugsByCategory(entry.category).length > 0
    ? getPublishedSlugsByCategory(entry.category)
    : allSlugs.slice(-3);

  const toolHints = CREPIKA_TOOLS
    .filter(t => relatedTools.some(r => t.path.includes(r)))
    .concat(CREPIKA_TOOLS.filter(t => !relatedTools.some(r => t.path.includes(r))).slice(0, 2))
    .slice(0, 3)
    .map(t => `"[${t.name}](${t.path})"`)
    .join(', ');

  return `다음 주제로 구글 상위노출 수준의 고품질 블로그 포스트를 작성하세요.

제목: ${entry.title}
슬러그: ${entry.slug}
카테고리: ${entry.category}
메인 키워드: ${entry.mainKeyword}
확장 키워드: ${entry.extendedKeywords.join(', ')}
저자: ${entry.author}
예상 읽기 시간: ${entry.estimatedReadTime}
발행일: ${today}

## 필수 체크리스트 (누락 시 재생성)

### 분량
- introduction: 300자 이상 (핵심 답변을 첫 3문장에 직접 제시)
- 각 section content: 500자 이상
- conclusion: 200자 이상
- sections: 5개 이상
- faq: 5개 이상 (실제 네이버·구글 자동완성에 나오는 질문 형태)
- keywords: 6~8개

### 크레피카 도구 링크 (본문 삽입 필수 — relatedTools 배열 아님)
- ${toolHints} 중 2개를 introduction 또는 section content 본문 문장 안에 마크다운 링크로 삽입
- 삽입 예시: "정확한 글자수 확인은 [글자수 세기](/tools/text-counter)를 사용하면 즉시 확인됩니다."
- 광고성 느낌이 아닌, 독자에게 실질적으로 도움이 되는 맥락에서만 삽입

### E-E-A-T 신호
- 최소 1개 섹션: "실제로 테스트한 결과", "국내 크리에이터 사례", "A/B 비교" 등 경험 기반 서술
- 수치 사용 시 출처 명시: "(출처: 기관명, 2024년)" 또는 "2025년 기준"
- 최소 1개 섹션: 번호 매긴 단계별 가이드(1. 2. 3.)

### 한국 시장 특화
- 플랫폼: 네이버 블로그, 인스타그램, 유튜브, 카카오 기준 사례 사용
- 비교가 있으면 표(마크다운 테이블) 형식 활용

다음 JSON 구조로만 응답하세요 (코드 펜스 없이 순수 JSON):
{
  "slug": "${entry.slug}",
  "title": "${entry.title}",
  "description": "네이버 기준 80바이트(한글 약 40자) 이내 메타 설명 — 핵심 키워드 앞배치",
  "category": "${entry.category}",
  "publishDate": "${today}",
  "dateModified": "${today}",
  "readTime": "${entry.estimatedReadTime}",
  "author": "${entry.author}",
  "keywords": ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5", "키워드6"],
  "content": {
    "introduction": "300자 이상. 첫 3문장에 핵심 답변 + 크레피카 도구 링크 1회",
    "sections": [
      {
        "heading": "섹션 제목 (H2 수준 키워드 포함)",
        "content": "500자 이상. 경험 기반 서술 또는 단계별 가이드 또는 비교표 포함",
        "subsections": [
          { "subheading": "서브 제목", "content": "구체적 방법 또는 사례" }
        ]
      }
    ],
    "conclusion": "200자 이상. 핵심 요약 + 크레피카 도구 링크 1회(introduction에 없는 다른 도구)"
  },
  "relatedTools": ${JSON.stringify(relatedTools)},
  "relatedPosts": ${JSON.stringify(relatedSlugs)},
  "faq": [
    { "question": "실제 검색 질문 형태 (어떻게, 얼마나, 왜 등)?", "answer": "150자 이상 구체적 답변" }
  ]
}`;
}

function postToTs(post) {
  // Serialize to JSON, then convert to TypeScript syntax.
  // Use backtick template literals for string values to avoid single-quote
  // escaping issues (the old approach caused \' → \\\' double-escaping via replacer).
  const json = JSON.stringify(post, null, 2);

  // Step 1: unquote simple identifier keys
  let ts = json.replace(/"([a-zA-Z_][a-zA-Z0-9_]*)":/g, '$1:');

  // Step 2: convert remaining "..." JSON strings to `...` backtick literals
  // JSON body may contain: \\ \" \n \r \t \uXXXX
  ts = ts.replace(/"((?:[^"\\]|\\.)*)"/g, (match, jsonBody) => {
    let val;
    try { val = JSON.parse('"' + jsonBody + '"'); } catch { return match; }
    // Encode for backtick: escape \, `, ${
    const bt = val
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\$\{/g, '\\${');
    return '`' + bt + '`';
  });

  return ts;
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

async function getGoogleAccessToken() {
  try {
    const SA_PATH = 'D:/env/cursorai-451704-85a5abbe8eeb.json';
    const sa = JSON.parse(readFileSync(SA_PATH, 'utf-8'));
    const now = Math.floor(Date.now() / 1000);
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/indexing',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    })).toString('base64url');
    const sigInput = `${header}.${payload}`;
    const sign = createSign('RSA-SHA256');
    sign.update(sigInput);
    const sig = sign.sign(sa.private_key, 'base64url');
    const jwt = `${sigInput}.${sig}`;
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
    });
    if (!res.ok) {
      console.warn(`⚠️ Google 토큰 발급 실패: ${res.status}`);
      return null;
    }
    const data = await res.json();
    return data.access_token;
  } catch (e) {
    console.warn(`⚠️ Google 토큰 오류: ${e.message}`);
    return null;
  }
}

async function pingSearchEngines(slug) {
  const url = `${SITE_URL}/blog/${slug}`;
  const INDEXNOW_KEY = 'crepika2026indexnow';

  const pings = [
    // IndexNow (Bing, Yandex, Seznam 등 동시)
    fetch(`https://api.indexnow.org/indexnow?url=${encodeURIComponent(url)}&key=${INDEXNOW_KEY}`)
      .then(r => console.log(`📡 IndexNow 핑: ${r.status}`))
      .catch(e => console.warn(`⚠️ IndexNow 실패: ${e.message}`)),
    // Bing 사이트맵 핑
    fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(SITE_URL + '/sitemap.xml')}`)
      .then(r => console.log(`📡 Bing 핑: ${r.status}`))
      .catch(e => console.warn(`⚠️ Bing 실패: ${e.message}`)),
    // 네이버 IndexNow 핑
    fetch(`https://searchadvisor.naver.com/indexnow?url=${encodeURIComponent(url)}&key=${INDEXNOW_KEY}`)
      .then(r => console.log(`📡 Naver IndexNow 핑: ${r.status}`))
      .catch(e => console.warn(`⚠️ Naver 실패: ${e.message}`)),
  ];

  await Promise.allSettled(pings);

  // Google Indexing API + GSC 사이트맵 재제출
  const token = await getGoogleAccessToken();
  if (token) {
    try {
      const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ url, type: 'URL_UPDATED' }),
      });
      console.log(`📡 Google Indexing API: ${res.status}`);
    } catch (e) {
      console.warn(`⚠️ Google Indexing API 실패: ${e.message}`);
    }
    try {
      const siteUrl = encodeURIComponent(`${SITE_URL}/`);
      const sitemapUrl = encodeURIComponent(`${SITE_URL}/sitemap.xml`);
      const res = await fetch(
        `https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/sitemaps/${sitemapUrl}`,
        { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } }
      );
      console.log(`📡 GSC 사이트맵 재제출: ${res.status}`);
    } catch (e) {
      console.warn(`⚠️ GSC 사이트맵 재제출 실패: ${e.message}`);
    }
  }

  console.log(`✅ 검색엔진 핑 완료`);
}

main().catch(e => {
  console.error('❌ 치명적 오류:', e);
  process.exit(1);
});
