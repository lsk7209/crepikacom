#!/usr/bin/env node
/**
 * 크레피카 기존 포스트 품질 개선 스크립트
 * - /tools/ 링크가 없는 포스트에 도구 마크다운 링크 + E-E-A-T 신호 추가
 * - claude-haiku로 introduction만 최소 수정 (원문 구조 유지)
 * - scripts/improve-progress.json에 진행 상황 저장 (재시작 가능)
 *
 * 사용법:
 *   node scripts/improve-posts.mjs                  # 전체 처리
 *   node scripts/improve-posts.mjs --limit=30       # 30개만 처리
 *   node scripts/improve-posts.mjs --dry-run        # 분석만, 수정 없음
 *   node scripts/improve-posts.mjs --reset          # 진행 상황 초기화
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const BLOG_CONTENT_FILE = join(ROOT, 'src', 'data', 'blog-content.ts');
const PROGRESS_FILE = join(__dirname, 'improve-progress.json');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const isDryRun = process.argv.includes('--dry-run');
const isReset = process.argv.includes('--reset');
const isNoApi = process.argv.includes('--no-api');

if (!isDryRun && !isNoApi && !ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY 환경변수가 필요합니다.');
  console.error('   크레딧 없이 실행하려면: node scripts/improve-posts.mjs --no-api');
  process.exit(1);
}

const CREPIKA_TOOLS = [
  { name: '글자수 세기', path: '/tools/text-counter', use: '원고·캡션 글자수 즉시 확인' },
  { name: '한글 바이트 카운터', path: '/tools/byte-counter', use: '네이버 메타 80바이트 준수' },
  { name: 'WebP 변환기', path: '/tools/webp-converter', use: '이미지 용량 최적화' },
  { name: '인스타 줄바꿈 포매터', path: '/tools/insta-spacer', use: '인스타 캡션 줄바꿈 유지' },
  { name: '해시태그 믹서', path: '/tools/hashtag-mixer', use: '해시태그 순서 랜덤 조합' },
  { name: 'QR 코드 생성기', path: '/tools/qr-generator', use: '오프라인 채널 QR 연결' },
  { name: '로렘 생성기', path: '/tools/lorem-generator', use: '디자인 시안 더미 텍스트' },
];

const TOOL_LINK_PATTERN = /\[[^\]]+\]\(\/tools\/[^)]+\)/;

// ─── 범용 문자열 파서 ─────────────────────────────────────────────────────────

/**
 * 위치 pos에서 시작하는 JS 문자열 리터럴 파싱
 * 지원: 'single' | `backtick` (double은 미사용)
 * 반환: { text, quoteChar, contentStart, contentEnd(닫는 따옴표 포함 끝 인덱스+1) }
 */
function parseStringAt(src, pos) {
  const q = src[pos];
  if (q !== "'" && q !== '`') return null;

  let i = pos + 1;
  let text = '';

  while (i < src.length) {
    const ch = src[i];
    // 이스케이프 시퀀스
    if (ch === '\\' && i + 1 < src.length) {
      const next = src[i + 1];
      if (next === q) { text += q; i += 2; continue; }
      if (next === 'n') { text += '\n'; i += 2; continue; }
      if (next === 't') { text += '\t'; i += 2; continue; }
      if (next === '\\') { text += '\\'; i += 2; continue; }
      text += next; i += 2; continue;
    }
    // 닫는 따옴표
    if (ch === q) { i++; break; }
    text += ch;
    i++;
  }

  return { text, quoteChar: q, contentStart: pos + 1, end: i };
}

/**
 * 블록 텍스트에서 fieldName의 문자열 값 파싱
 * fieldName: 'value' 또는 fieldName: `value` 모두 처리
 */
function extractStringField(blockText, fieldName) {
  const markerRe = new RegExp(fieldName + ':\\s*([\'\x60])');
  const m = markerRe.exec(blockText);
  if (!m) return null;

  const quoteStart = m.index + m[0].length - 1;
  const parsed = parseStringAt(blockText, quoteStart);
  if (!parsed) return null;

  return {
    text: parsed.text,
    quoteChar: parsed.quoteChar,
    // relativeStart: 따옴표 포함 전체 시작 위치
    relativeStart: quoteStart,
    // relativeEnd: 닫는 따옴표 다음 위치
    relativeEnd: parsed.end,
    // contentStart / contentEnd: 따옴표 안쪽 내용 범위
    contentStart: quoteStart + 1,
    contentEnd: parsed.end - 1,
  };
}

/** 파일에서 모든 slug 값 추출 (single/backtick 모두) */
function getAllSlugs(content) {
  const re = /slug:\s*(['`])/g;
  const slugs = [];
  let m;
  while ((m = re.exec(content)) !== null) {
    const parsed = parseStringAt(content, m.index + m[0].length - 1);
    if (parsed) slugs.push(parsed.text);
  }
  return slugs;
}

/** slug 위치에서 시작해 다음 slug 위치까지의 블록 반환 */
function getPostBlock(content, slug) {
  // slug: 'value' 또는 slug: `value`
  const re = /slug:\s*(['`])/g;
  let found = null;
  let m;
  while ((m = re.exec(content)) !== null) {
    const parsed = parseStringAt(content, m.index + m[0].length - 1);
    if (parsed && parsed.text === slug) {
      found = { matchIndex: m.index, afterEnd: parsed.end };
      break;
    }
  }
  if (!found) return null;

  // 이 포스트 블록의 fileStart: slug 이전 `{` 탐색
  let blockStart = found.matchIndex;
  for (let i = found.matchIndex - 1; i >= 0; i--) {
    if (content[i] === '{') { blockStart = i; break; }
    if (content[i] === ',' && i < found.matchIndex - 5) break;
  }

  // 다음 slug 위치 찾기
  const nextRe = /slug:\s*(['`])/g;
  nextRe.lastIndex = found.afterEnd;
  const next = nextRe.exec(content);
  const blockEnd = next ? next.index : content.length;

  return { text: content.slice(blockStart, blockEnd), fileStart: blockStart, fileEnd: blockEnd };
}

/** 블록에서 메타데이터 추출 */
function extractMeta(blockText) {
  const getStr = (field) => {
    const f = extractStringField(blockText, field);
    return f ? f.text : '';
  };
  const keywords = [];
  const kwM = /keywords:\s*\[([\s\S]*?)\]/.exec(blockText);
  if (kwM) {
    const re = /(['`])([^'`]+)\1/g;
    let m;
    while ((m = re.exec(kwM[1])) !== null) keywords.push(m[2]);
  }
  return {
    title: getStr('title'),
    author: getStr('author'),
    category: getStr('category'),
    slug: getStr('slug'),
    keywords,
  };
}

/** 카테고리별 도구 2개 반환 */
function getToolsForCategory(category) {
  const map = {
    guide: ['글자수 세기', '해시태그 믹서'],
    tips: ['한글 바이트 카운터', '인스타 줄바꿈 포매터'],
    insights: ['글자수 세기', 'QR 코드 생성기'],
    'case-study': ['WebP 변환기', '해시태그 믹서'],
  };
  const names = map[category] || ['글자수 세기', 'WebP 변환기'];
  const preferred = names.map(n => CREPIKA_TOOLS.find(t => t.name === n)).filter(Boolean);
  return preferred.length >= 2
    ? preferred.slice(0, 2)
    : [...preferred, ...CREPIKA_TOOLS.filter(t => !preferred.includes(t))].slice(0, 2);
}

// ─── Claude API ───────────────────────────────────────────────────────────────

async function callClaude(system, user) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.content[0].text.trim();
}

async function improveIntroduction(introText, meta, tools) {
  const toolList = tools.map(t => `  - [${t.name}](${t.path}) — ${t.use}`).join('\n');

  const system = `당신은 한국어 블로그 콘텐츠 편집자입니다.
주어진 introduction 텍스트를 최소한으로 수정해 SEO 품질을 높입니다.

수정 규칙 (반드시 준수):
1. 원문 구조, 핵심 정보, 문체를 최대한 유지
2. 아래 도구 중 정확히 2개를 문맥에 맞게 마크다운 링크로 삽입:
${toolList}
3. 도구 링크 삽입 방식: 기존 문장 내 자연스러운 위치, 또는 도구 활용 문장 1줄 추가
4. 출처 없는 퍼센트·수치가 있으면 "(2025년 기준)" 추가
5. E-E-A-T: "직접", "실제로", "테스트", "경험" 표현이 없으면 1문장 추가
6. 핵심 정보 삭제·대폭 변경 절대 금지
7. 수정된 텍스트만 반환 (설명·코드펜스 없음)`;

  const user = `제목: ${meta.title}
저자: ${meta.author}
카테고리: ${meta.category}
키워드: ${meta.keywords.slice(0, 3).join(', ')}

--- 원문 introduction ---
${introText}
--- 끝 ---

위 원문을 수정 규칙에 따라 개선하여 반환하세요.`;

  return callClaude(system, user);
}

/**
 * API 없이 규칙 기반으로 도구 링크 2개를 introduction 끝에 삽입
 * 키워드·제목 기반으로 관련 도구 선택 후 자연스러운 안내 문장 추가
 */
function injectToolLinksSimple(introText, meta, tools) {
  const t1 = tools[0];
  const t2 = tools[1];

  // 이미 링크가 있으면 그대로 반환
  if (TOOL_LINK_PATTERN.test(introText)) return introText;

  // 도구 활용 안내 문장 (카테고리별)
  const sentences = {
    guide: `\n\n실전에 바로 쓸 수 있는 [${t1.name}](${t1.path})과 [${t2.name}](${t2.path})을 활용하면 이 가이드의 내용을 더욱 빠르게 적용할 수 있습니다.`,
    tips: `\n\n[${t1.name}](${t1.path})으로 즉시 확인하고, [${t2.name}](${t2.path})까지 함께 활용하면 작업 효율이 크게 높아집니다.`,
    insights: `\n\n이 글의 인사이트를 실제로 적용할 때 [${t1.name}](${t1.path})과 [${t2.name}](${t2.path})을 함께 사용해보세요.`,
    'case-study': `\n\n사례에서 소개된 방법을 직접 따라 하려면 [${t1.name}](${t1.path})과 [${t2.name}](${t2.path})을 활용하면 수고를 크게 줄일 수 있습니다.`,
  };

  const suffix = sentences[meta.category] || sentences.guide;
  return introText.trimEnd() + suffix;
}

// ─── 파일 내 introduction 교체 ────────────────────────────────────────────────

/**
 * fileContent 내 slug 포스트의 introduction 값을 newText로 교체
 * 원본 quoteChar(single/backtick) 유지, 필요한 이스케이프 처리
 */
function replaceIntroduction(fileContent, slug, newText) {
  const block = getPostBlock(fileContent, slug);
  if (!block) throw new Error(`슬러그 ${slug} 블록 없음`);

  const introField = extractStringField(block.text, 'introduction');
  if (!introField) throw new Error(`${slug} introduction 필드 없음`);

  // 파일 내 절대 위치
  const absContentStart = block.fileStart + introField.contentStart;
  const absContentEnd = block.fileStart + introField.contentEnd;

  // 이스케이프 (원본 quoteChar 기준)
  let escaped;
  if (introField.quoteChar === '`') {
    escaped = newText
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\$\{/g, '\\${');
  } else {
    escaped = newText
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'");
  }

  return (
    fileContent.slice(0, absContentStart) +
    escaped +
    fileContent.slice(absContentEnd)
  );
}

// ─── 메인 ────────────────────────────────────────────────────────────────────

async function main() {
  if (isReset && existsSync(PROGRESS_FILE)) {
    writeFileSync(PROGRESS_FILE, '{}', 'utf-8');
    console.log('🔄 진행 상황 초기화 완료');
  }

  console.log('🔍 blog-content.ts 분석 중...');
  let fileContent = readFileSync(BLOG_CONTENT_FILE, 'utf-8').replace(/\r\n/g, '\n');

  const allSlugs = getAllSlugs(fileContent);
  console.log(`📊 총 ${allSlugs.length}개 포스트`);

  // 도구 링크 없는 포스트 필터링
  const noLinkSlugs = [];
  for (const slug of allSlugs) {
    const block = getPostBlock(fileContent, slug);
    if (!block) continue;
    if (!TOOL_LINK_PATTERN.test(block.text)) noLinkSlugs.push(slug);
  }
  console.log(`⚠️  도구 링크 없는 포스트: ${noLinkSlugs.length}개`);
  console.log(`✅  도구 링크 있는 포스트: ${allSlugs.length - noLinkSlugs.length}개`);

  if (isDryRun) {
    console.log('\n📋 [DRY RUN] 개선 대상 포스트 (처음 20개):');
    noLinkSlugs.slice(0, 20).forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
    if (noLinkSlugs.length > 20) console.log(`  ... 외 ${noLinkSlugs.length - 20}개`);
    return;
  }

  // 진행 상황 로드
  let progress = existsSync(PROGRESS_FILE)
    ? JSON.parse(readFileSync(PROGRESS_FILE, 'utf-8'))
    : {};
  const done = Object.values(progress).filter(v => v === 'done').length;
  if (done > 0) console.log(`📂 이전 진행: ${done}개 완료`);

  const toProcess = noLinkSlugs.filter(s => progress[s] !== 'done');

  const limitArg = process.argv.find(a => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : toProcess.length;
  const batch = toProcess.slice(0, limit);

  console.log(`🚀 처리 대상: ${batch.length}개 (limit=${limit})\n`);

  let improved = 0;
  let failed = 0;

  for (let i = 0; i < batch.length; i++) {
    const slug = batch[i];
    process.stdout.write(`[${i + 1}/${batch.length}] ${slug} ... `);

    try {
      const block = getPostBlock(fileContent, slug);
      if (!block) throw new Error('블록 없음');

      const meta = extractMeta(block.text);
      const introField = extractStringField(block.text, 'introduction');
      if (!introField) throw new Error('introduction 필드 없음');

      const tools = getToolsForCategory(meta.category);
      let newIntro;
      if (isNoApi) {
        newIntro = injectToolLinksSimple(introField.text, meta, tools);
      } else {
        newIntro = await improveIntroduction(introField.text, meta, tools);
      }

      if (!TOOL_LINK_PATTERN.test(newIntro)) {
        throw new Error('도구 링크 삽입 실패');
      }

      fileContent = replaceIntroduction(fileContent, slug, newIntro);
      progress[slug] = 'done';
      improved++;
      console.log('✅');
    } catch (err) {
      progress[slug] = `error: ${err.message}`;
      failed++;
      console.log(`❌ ${err.message}`);
    }

    // 10개마다 중간 저장
    if ((i + 1) % 10 === 0 || i === batch.length - 1) {
      writeFileSync(BLOG_CONTENT_FILE, fileContent, 'utf-8');
      writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf-8');
      console.log(`  💾 중간 저장 (${i + 1}/${batch.length})`);
    }

    // API rate limit 방지 (no-api 모드에서는 불필요)
    if (!isNoApi && i < batch.length - 1) await new Promise(r => setTimeout(r, 800));
  }

  console.log(`\n🎉 완료: 개선 ${improved}개, 실패 ${failed}개`);
  console.log(`📁 진행 상황: ${PROGRESS_FILE}`);

  if (toProcess.length > batch.length) {
    const remaining = toProcess.length - batch.length;
    console.log(`\n▶ 나머지 ${remaining}개:`);
    console.log(`  node scripts/improve-posts.mjs --limit=${Math.min(remaining, 50)}`);
  }
}

main().catch(err => {
  console.error('❌ 치명적 오류:', err);
  process.exit(1);
});
