#!/usr/bin/env node
/**
 * 기존 454개와 중복 없는 새 제목 300개 생성 (3인 페르소나)
 * → scripts/titles-input.json 저장
 * → node scripts/generate-titles.mjs --add  로 큐에 등록
 *
 * 사용법: node scripts/generate-300-titles.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const QUEUE_FILE  = join(ROOT, 'scripts', 'post-queue.json');
const OUTPUT_FILE = join(ROOT, 'scripts', 'titles-input.json');

// ── 3인 페르소나 정의 ─────────────────────────────────────────
const PERSONAS = [
  {
    name: '김민혁',
    role: 'SEO·디지털 마케팅 전략가',
    focus: 'SEO 전략, 네이버/구글 상위 노출, 검색 광고, 데이터 분석, 콘텐츠 마케팅, 브랜드 검색 전략, 이커머스 SEO, 퍼포먼스 마케팅, GA4/GTM 활용',
    style: '데이터 기반의 롱테일 키워드 포함 제목, 구체적 수치·연도 포함',
  },
  {
    name: '이지수',
    role: 'SNS·크리에이터 전략가',
    focus: '인스타그램, 틱톡, 유튜브 쇼츠, 릴스, 카카오채널, 링크드인, 서브스택, 뉴스레터, 팟캐스트, 클래스101, 온라인 코스, 퍼스널브랜딩, 팔로워 성장, 커뮤니티 빌딩, 당근마켓 판매',
    style: '초보자·중급자 검색 의도 일치, 실용적 제목, 궁금증 유발',
  },
  {
    name: '박준영',
    role: '기술·자동화 전문가',
    focus: '노션 활용, AI 도구(ChatGPT, Perplexity, Midjourney, Sora, Kling, Canva AI), 자동화(Make.com, Zapier, n8n), 크리에이터 세금·법인, 그로스해킹, A/B 테스트, CRO, 구독 모델, SaaS 마케팅, 도구 비교, 효율화',
    style: '단계별 방법론, 도구 이름 포함, 효율·시간 절약 강조',
  },
];

// ── 카테고리 분배 ─────────────────────────────────────────────
const CATEGORY_DIST = { guide: 30, tips: 25, insights: 25, 'case-study': 20 }; // 100개 기준 %

// ── 기존 제목 로드 ────────────────────────────────────────────
function loadExistingTitles() {
  const queue = JSON.parse(readFileSync(QUEUE_FILE, 'utf-8'));
  return queue.map(e => e.title);
}

// ── 단순 Jaccard 유사도 (단어 집합 기반) ──────────────────────
function jaccard(a, b) {
  const setA = new Set(a.split(/\s+/).map(w => w.replace(/[^\w가-힣]/g, '')).filter(w => w.length > 1));
  const setB = new Set(b.split(/\s+/).map(w => w.replace(/[^\w가-힣]/g, '')).filter(w => w.length > 1));
  const inter = [...setA].filter(w => setB.has(w)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : inter / union;
}

function isDuplicate(title, existingTitles, threshold = 0.6) {
  for (const existing of existingTitles) {
    if (jaccard(title, existing) >= threshold) return true;
  }
  return false;
}

// ── claude CLI 호출 (API키 불필요) ────────────────────────────
async function callClaude(system, user) {
  const fullPrompt = system ? `${system}\n\n---\n${user}` : user;
  const result = spawnSync('claude', ['--print', '--dangerously-skip-permissions'], {
    input: fullPrompt,
    encoding: 'utf-8',
    maxBuffer: 20 * 1024 * 1024,
    timeout: 300000, // 5분
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`claude exit ${result.status}`);
  return result.stdout.trim();
}

// ── 1 페르소나에서 N개 제목 생성 ─────────────────────────────
async function generateTitlesForPersona(persona, existingTitles, count = 110) {
  const catCounts = {
    guide:         Math.round(count * CATEGORY_DIST.guide / 100),
    tips:          Math.round(count * CATEGORY_DIST.tips / 100),
    insights:      Math.round(count * CATEGORY_DIST.insights / 100),
    'case-study':  Math.round(count * CATEGORY_DIST['case-study'] / 100),
  };

  const system = `당신은 크레피카(crepika.com) 콘텐츠 팀의 ${persona.role} ${persona.name}입니다.
전문 분야: ${persona.focus}
제목 스타일: ${persona.style}

역할: 한국 크리에이터·마케터가 실제로 검색할 것 같은 블로그 제목을 생성합니다.
규칙:
- 한국어 제목만 작성
- 구체적·실용적 (추상적 제목 금지)
- 검색 의도 명확 (정보성, 방법론, 사례, 비교)
- JSON 배열만 반환 (코드 펜스 없음, 추가 설명 없음)`;

  const existingSample = existingTitles.slice(-100).join('\n'); // 최근 100개만 컨텍스트로

  const user = `다음은 이미 존재하는 블로그 제목 일부입니다 (중복 금지):
---
${existingSample}
---

위와 중복되지 않는 새 제목 ${count}개를 생성하세요.
카테고리 분배: guide ${catCounts.guide}개, tips ${catCounts.tips}개, insights ${catCounts.insights}개, case-study ${catCounts['case-study']}개

다음 JSON 배열 형식으로만 응답하세요:
[
  {
    "title": "제목 텍스트",
    "category": "guide|tips|insights|case-study",
    "mainKeyword": "메인 키워드",
    "extendedKeywords": ["확장 키워드1", "확장 키워드2", "확장 키워드3"],
    "author": "${persona.name}",
    "estimatedReadTime": "X분"
  }
]`;

  console.log(`  📝 ${persona.name} — API 호출 중...`);
  const raw = await callClaude(system, user);

  // JSON 파싱
  let titles;
  try {
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('JSON 배열 없음');
    titles = JSON.parse(match[0]);
  } catch (e) {
    console.error(`  ⚠️  ${persona.name} JSON 파싱 실패: ${e.message}`);
    return [];
  }

  console.log(`  ✓ ${persona.name} — ${titles.length}개 생성`);
  return titles;
}

// ── 메인 ─────────────────────────────────────────────────────
async function main() {
  console.log('🎯 제목 300개 생성 시작 (3인 페르소나)\n');

  const existingTitles = loadExistingTitles();
  console.log(`기존 제목: ${existingTitles.length}개\n`);

  const allGenerated = [];
  const allTitles = [...existingTitles];

  for (const persona of PERSONAS) {
    console.log(`\n[${persona.name}] ${persona.role}`);
    const deduped = [];

    // 50개씩 최대 4번 호출해서 100개 채우기
    for (let round = 1; round <= 4 && deduped.length < 100; round++) {
      const need = Math.min(60, 100 - deduped.length + 10); // 10개 버퍼
      console.log(`  📝 ${persona.name} 라운드${round} — ${need}개 요청`);
      const batch = await generateTitlesForPersona(persona, allTitles, need);

      for (const item of batch) {
        if (deduped.length >= 100) break;
        if (!item.title || isDuplicate(item.title, allTitles)) continue;
        deduped.push(item);
        allTitles.push(item.title);
      }
      console.log(`  ✓ 라운드${round} 후 누적: ${deduped.length}/100`);

      if (deduped.length >= 100) break;
    }

    const final = deduped.slice(0, 100);
    allGenerated.push(...final);
    console.log(`  ✅ ${persona.name} — 최종 ${final.length}개 확정`);
  }

  // 정확히 300개 확인
  console.log(`\n총 생성: ${allGenerated.length}개`);
  if (allGenerated.length < 300) {
    console.warn(`⚠️  300개 미달 (${allGenerated.length}개) — 부족분은 수동 보완 필요`);
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(allGenerated.slice(0, 300), null, 2), 'utf-8');
  console.log(`\n✅ 저장 완료: scripts/titles-input.json (${Math.min(allGenerated.length, 300)}개)`);
  console.log(`\n다음 실행: node scripts/generate-titles.mjs --add`);
}

main().catch(e => { console.error('❌ 오류:', e.message); process.exit(1); });
