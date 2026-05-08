#!/usr/bin/env node
/**
 * 미발행 큐 항목 → Claude API → scripts/drafts/{slug}.json
 * 품질 게이트 90점 이상, 3,500~6,000자, 3개 병렬 처리
 * 재시작 안전: 이미 완료된 slug 스킵
 *
 * 사용법:
 *   node scripts/batch-generate.mjs           → 전체 미발행+드래프트 없는 항목 생성
 *   node scripts/batch-generate.mjs --status  → 진행 상황만 확인
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT          = join(__dirname, '..');
const QUEUE_FILE    = join(ROOT, 'scripts', 'post-queue.json');
const DRAFTS_DIR    = join(ROOT, 'scripts', 'drafts');
const FAILED_DIR    = join(ROOT, 'scripts', 'drafts', 'failed');
const PROGRESS_FILE = join(ROOT, 'scripts', 'batch-progress.json');
const BLOG_CONTENT  = join(ROOT, 'src', 'data', 'blog-content.ts');

mkdirSync(DRAFTS_DIR, { recursive: true });
mkdirSync(FAILED_DIR, { recursive: true });

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY && process.argv[2] !== '--status') {
  console.error('❌ ANTHROPIC_API_KEY 없음'); process.exit(1);
}

const MODEL       = 'claude-sonnet-4-6';
const CONCURRENCY = 3;
const MAX_RETRIES = 3;

// ── 클리셰 단어 ───────────────────────────────────────────────
const CLICHE_WORDS = ['결론적으로', '중요한 것은', '매우 중요합니다', '이러한 측면에서', '다시 말해서', '한마디로 말씀드리면'];

// ── 도구 매핑 ─────────────────────────────────────────────────
const TOOL_MAP = {
  guide:        ['text-counter', 'hashtag-mixer'],
  tips:         ['byte-counter', 'insta-spacer'],
  insights:     ['text-counter', 'qr-generator'],
  'case-study': ['webp-converter', 'hashtag-mixer'],
};

// ── 기발행 슬러그 목록 ────────────────────────────────────────
function getExistingSlugs() {
  const content = readFileSync(BLOG_CONTENT, 'utf-8');
  const re = /slug:\s*[`'"]([^`'"]+)[`'"]/g;
  const slugs = [];
  let m;
  while ((m = re.exec(content)) !== null) slugs.push(m[1]);
  return slugs;
}

// ── 품질 점수 계산 ────────────────────────────────────────────
function scorePost(post) {
  let score = 0;
  const issues = [];

  const sectionCount = post.content?.sections?.length ?? 0;
  const faqCount = post.faq?.length ?? 0;
  const introLen = (post.content?.introduction ?? '').length;
  const conclusionLen = (post.content?.conclusion ?? '').length;
  const descLen = (post.description ?? '').length;
  const fullText = JSON.stringify(post.content ?? '');
  const approxLen = fullText.length;
  const clicheCount = CLICHE_WORDS.reduce((n, w) => n + (fullText.split(w).length - 1), 0);

  // 섹션 수 (25점)
  if (sectionCount >= 5)      score += 25;
  else if (sectionCount >= 4) { score += 20; issues.push(`섹션 ${sectionCount}개`); }
  else { score += 0; issues.push(`섹션 부족 ${sectionCount}개`); }

  // FAQ (15점)
  if (faqCount >= 5)      score += 15;
  else if (faqCount >= 4) { score += 12; issues.push(`FAQ ${faqCount}개`); }
  else { score += 0; issues.push(`FAQ 부족 ${faqCount}개`); }

  // 도입부 (15점)
  if (introLen >= 300)      score += 15;
  else if (introLen >= 200) { score += 12; issues.push(`도입부 ${introLen}자`); }
  else { score += 0; issues.push(`도입부 너무 짧음`); }

  // 결론 (10점)
  if (conclusionLen >= 200)      score += 10;
  else if (conclusionLen >= 100) { score += 8; issues.push(`결론 ${conclusionLen}자`); }
  else { score += 0; issues.push(`결론 부족`); }

  // 메타 설명 (10점)
  if (descLen >= 120 && descLen <= 160) score += 10;
  else if (descLen >= 80)               { score += 7; issues.push(`메타 ${descLen}자`); }
  else { score += 3; issues.push(`메타 설명 짧음 ${descLen}자`); }

  // 전체 콘텐츠 양 (15점) — 3500자 이상 목표
  if (approxLen >= 5000)      score += 15;
  else if (approxLen >= 3500) { score += 12; issues.push(`콘텐츠 ${approxLen}자`); }
  else if (approxLen >= 2000) { score += 7;  issues.push(`콘텐츠 부족 ${approxLen}자`); }
  else { score += 0; issues.push(`콘텐츠 매우 부족`); }

  // AI 클리셰 (10점)
  if (clicheCount === 0)     score += 10;
  else if (clicheCount <= 2) { score += 7; issues.push(`클리셰 ${clicheCount}개`); }
  else { score += 0; issues.push(`클리셰 과다 ${clicheCount}개`); }

  return { score: Math.min(score, 100), issues };
}

// ── 저자 페르소나 ─────────────────────────────────────────────
const AUTHOR_PERSONAS = {
  '김민혁': `SEO 전략가 김민혁입니다. 데이터 기반 분석, 구체적 수치(%), 구글·네이버 검색 전략 전문가입니다.
논리적이고 근거 있는 문체로, 반드시 실제 통계·수치·연도를 포함해 작성하세요.`,
  '이지수': `소셜미디어 전문가 이지수입니다. 인스타그램·틱톡·유튜브 실전 경험 기반으로
크리에이터가 즉시 적용할 수 있는 실용적 조언을 제공합니다. 친근하고 활력 있는 문체로 작성하세요.`,
  '박준영': `개발자 출신 크리에이터 박준영입니다. AI 도구·자동화·효율화 관점에서 콘텐츠를 다룹니다.
명확하고 단계적인 문체로, 구체적 도구명과 사용법을 포함해 작성하세요.`,
};

// ── Claude API 호출 ───────────────────────────────────────────
async function callClaude(system, user) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 16000,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return (await res.json()).content[0].text;
}

// ── 단일 글 생성 ──────────────────────────────────────────────
async function generatePost(entry, relatedSlugs) {
  const author = entry.author || '김민혁';
  const persona = AUTHOR_PERSONAS[author] || AUTHOR_PERSONAS['김민혁'];
  const relatedTools = TOOL_MAP[entry.category] || ['text-counter'];
  const today = new Date().toISOString().split('T')[0];

  const system = `당신은 ${persona}

크레피카(crepika.com)의 전문 콘텐츠 작가입니다. 다음 도구를 본문에 자연스럽게 1~2회 연결하세요:
- 글자수 세기 (/tools/text-counter)
- 한글 바이트 카운터 (/tools/byte-counter)
- WebP 변환기 (/tools/webp-converter)
- 인스타 줄바꿈 (/tools/insta-spacer)
- 해시태그 믹서 (/tools/hashtag-mixer)
- QR 코드 생성기 (/tools/qr-generator)

글쓰기 원칙:
1. 한국어만 사용
2. 총 글자수 5,000~6,000자 (한국어 기준, 반드시 충족)
3. 섹션 5개 이상, 각 섹션 600자 이상
4. FAQ 5개 이상 (실제 검색 질문 형식)
5. 상투어 완전 금지: "결론적으로", "중요한 것은", "매우 중요합니다", "이러한 측면에서"
6. 구체적 수치·사례·연도 포함 (막연한 표현 제거)
7. **볼드**, - 리스트, ## 마크다운 활용
8. EEAT 충족 (전문성·권위·신뢰·경험)
9. 메인 키워드 밀도 1~3%, 소제목에 키워드 포함
10. JSON만 반환 (코드 펜스 없음, 추가 설명 없음)`;

  const user = `다음 주제로 고품질 블로그 포스트를 작성하세요.

제목: ${entry.title}
슬러그: ${entry.slug}
카테고리: ${entry.category}
메인 키워드: ${entry.mainKeyword || entry.title.split(':')[0]}
확장 키워드: ${(entry.extendedKeywords || []).join(', ')}
저자: ${author}
읽기 시간: ${entry.estimatedReadTime || '8분'}
발행일: ${today}

다음 JSON 구조로만 응답하세요 (코드 펜스 없이):
{
  "slug": "${entry.slug}",
  "title": "${entry.title}",
  "description": "120~155자 메타 설명 (메인 키워드 포함)",
  "category": "${entry.category}",
  "publishDate": "${today}",
  "dateModified": "${today}",
  "readTime": "${entry.estimatedReadTime || '8분'}",
  "author": "${author}",
  "keywords": ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5", "키워드6"],
  "content": {
    "introduction": "300자 이상 강렬한 도입부 — 독자의 문제를 명확히 제시하고 해결책 예고",
    "sections": [
      {
        "heading": "섹션 제목 (키워드 포함)",
        "content": "600자 이상 내용 (마크다운: **볼드**, - 리스트, 구체적 수치)",
        "subsections": [
          { "subheading": "서브 제목", "content": "서브 내용" }
        ]
      }
    ],
    "conclusion": "200자 이상 — 핵심 요약 + 크레피카 도구 활용 CTA"
  },
  "relatedTools": ${JSON.stringify(relatedTools)},
  "relatedPosts": ${JSON.stringify(relatedSlugs.slice(0, 3))},
  "faq": [
    { "question": "실제 검색 질문?", "answer": "상세한 답변 (100자 이상)" }
  ]
}`;

  const raw = await callClaude(system, user);

  // JSON 추출
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('JSON 없음');
  return JSON.parse(jsonMatch[0]);
}

// ── 진행률 저장/로드 ─────────────────────────────────────────
function loadProgress() {
  if (!existsSync(PROGRESS_FILE)) return { completed: [], failed: [] };
  return JSON.parse(readFileSync(PROGRESS_FILE, 'utf-8'));
}

function saveProgress(progress) {
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf-8');
}

// ── 상태 확인 ─────────────────────────────────────────────────
function showStatus() {
  const queue = JSON.parse(readFileSync(QUEUE_FILE, 'utf-8'));
  const unpublished = queue.filter(e => !e.published);
  const withDraft = unpublished.filter(e => existsSync(join(DRAFTS_DIR, `${e.slug}.json`)));
  const withoutDraft = unpublished.filter(e => !existsSync(join(DRAFTS_DIR, `${e.slug}.json`)));
  const failedFiles = existsSync(FAILED_DIR) ? readdirSync(FAILED_DIR).filter(f => f.endsWith('.json')) : [];

  const progress = loadProgress();
  const etaDays = withoutDraft.length > 0 ? (withoutDraft.length / CONCURRENCY / 60 / 60).toFixed(1) : 0;

  console.log('📊 batch-generate 현황');
  console.log(`   미발행 전체: ${unpublished.length}개`);
  console.log(`   드래프트 있음: ${withDraft.length}개 (발행 준비 완료)`);
  console.log(`   드래프트 없음: ${withoutDraft.length}개 (생성 필요)`);
  console.log(`   실패 항목: ${failedFiles.length}개`);
  console.log(`   이번 세션 완료: ${progress.completed.length}개`);
  if (withoutDraft.length > 0) {
    console.log(`   예상 생성 시간: ~${etaDays}시간 (3병렬)`);
    console.log(`\n  다음 5개 생성 대상:`);
    withoutDraft.slice(0, 5).forEach(e => console.log(`   [${e.id}] ${e.title.slice(0, 60)}`));
  }
}

// ── 메인 ─────────────────────────────────────────────────────
async function main() {
  if (process.argv[2] === '--status') { showStatus(); return; }

  showStatus();
  console.log('\n');

  const queue = JSON.parse(readFileSync(QUEUE_FILE, 'utf-8'));
  const existingSlugs = getExistingSlugs();

  // 최근 발행된 슬러그 (관련 포스트용)
  const recentSlugs = queue.filter(e => e.published).map(e => e.slug).slice(-10);

  // 드래프트 없는 미발행 항목 추출
  const targets = queue.filter(e =>
    !e.published && !existsSync(join(DRAFTS_DIR, `${e.slug}.json`))
  );

  if (targets.length === 0) {
    console.log('✅ 생성할 항목 없음 — 모든 항목에 드래프트 존재');
    return;
  }

  console.log(`🚀 생성 시작: ${targets.length}개 (동시 ${CONCURRENCY}개)\n`);

  const progress = loadProgress();
  let doneCount = 0;
  let failCount = 0;
  const startTime = Date.now();

  // 배치 처리 (CONCURRENCY개씩)
  for (let i = 0; i < targets.length; i += CONCURRENCY) {
    const batch = targets.slice(i, i + CONCURRENCY);

    await Promise.all(batch.map(async (entry) => {
      // 이미 완료된 항목 스킵
      if (progress.completed.includes(entry.slug)) {
        doneCount++;
        return;
      }

      let post = null;
      let lastErr = null;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          const relatedSlugs = queue
            .filter(e => e.published && e.category === entry.category)
            .map(e => e.slug).slice(-3);

          post = await generatePost(entry, relatedSlugs.length ? relatedSlugs : recentSlugs);

          const { score, issues } = scorePost(post);

          if (score >= 90) {
            writeFileSync(join(DRAFTS_DIR, `${entry.slug}.json`), JSON.stringify(post, null, 2), 'utf-8');
            progress.completed.push(entry.slug);
            doneCount++;
            const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
            console.log(`  ✅ [${score}점] ${entry.slug.slice(0, 50)} (${elapsed}분 경과, ${doneCount}/${targets.length})`);
            return;
          }

          // 90점 미달 — 재시도 프롬프트에 약점 포함
          console.log(`  ↻ [${score}점] ${entry.slug.slice(0, 40)} — 재시도 ${attempt}/${MAX_RETRIES}: ${issues.join(', ')}`);
          lastErr = `점수 ${score}: ${issues.join(', ')}`;

        } catch (e) {
          lastErr = e.message;
          console.log(`  ↻ [오류] ${entry.slug.slice(0, 40)} — 재시도 ${attempt}/${MAX_RETRIES}: ${e.message.slice(0, 60)}`);
          await new Promise(r => setTimeout(r, 3000 * attempt));
        }
      }

      // 3회 실패 → failed/
      console.log(`  ❌ [실패] ${entry.slug} — ${lastErr?.slice(0, 60)}`);
      if (post) {
        writeFileSync(join(FAILED_DIR, `${entry.slug}.json`), JSON.stringify({ entry, post, error: lastErr }, null, 2), 'utf-8');
      }
      progress.failed.push({ slug: entry.slug, error: lastErr });
      failCount++;
    }));

    saveProgress(progress);

    // API rate limit 방지: 배치 간 1초 대기
    if (i + CONCURRENCY < targets.length) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log(`\n🎉 배치 생성 완료!`);
  console.log(`   성공: ${doneCount}개, 실패: ${failCount}개, 소요: ${elapsed}분`);
  console.log(`   실패 항목: scripts/drafts/failed/`);
  console.log(`\n다음 단계: GitHub Actions가 5시간마다 자동 발행합니다.`);
}

main().catch(e => { console.error('❌ 치명적 오류:', e.message); process.exit(1); });
