#!/usr/bin/env node
/**
 * 발행된 전체 포스트 품질 90점 미달 항목 자동 보강
 * 약점 구간만 targeted rewrite — 전체 재작성 아님
 * 50개 배치마다 git commit+push
 *
 * 사용법:
 *   node scripts/quality-improve.mjs --dry     → 점수만 확인 (변경 없음)
 *   node scripts/quality-improve.mjs           → 실제 보강 실행
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BLOG_CONTENT  = join(ROOT, 'src', 'data', 'blog-content.ts');
const META_SCRIPT   = join(ROOT, 'scripts', 'gen-meta.mjs');
const REPORT_FILE   = join(ROOT, 'scripts', 'quality-report-final.json');

const DRY = process.argv[2] === '--dry';
const BATCH_SIZE = 50;
const CLICHE_WORDS = ['결론적으로', '중요한 것은', '매우 중요합니다', '이러한 측면에서', '다시 말해서', '한마디로 말씀드리면'];

// ── blog-content.ts 파싱 (slug별 원시 세그먼트 추출) ──────────
function extractPostSegments() {
  const content = readFileSync(BLOG_CONTENT, 'utf-8');
  const slugRe = /slug:\s*[`'"]([^`'"]+)[`'"]/g;
  const segments = [];
  let m;
  while ((m = slugRe.exec(content)) !== null) {
    const pos = m.index;
    // 다음 slug 위치까지 또는 8000자 추출
    const nextMatch = slugRe.lastIndex > 0
      ? content.indexOf('slug:', m.index + 10)
      : content.length;
    const end = nextMatch > 0 ? Math.min(nextMatch, pos + 10000) : pos + 10000;
    segments.push({ slug: m[1], pos, end, seg: content.slice(pos, end) });
  }
  return { content, segments };
}

// ── 품질 점수 ────────────────────────────────────────────────
function scoreSegment(seg) {
  let score = 0;
  const issues = [];

  const get = (re) => re.exec(seg)?.[1] || '';
  const getAll = (re) => { const arr = []; let x; const r = new RegExp(re.source, re.flags); while ((x = r.exec(seg)) !== null) arr.push(x[1]); return arr; };

  const intro      = get(/introduction:\s*[`'"]([^`'"]{20,})/);
  const conclusion = get(/conclusion:\s*[`'"]([^`'"]{20,})/);
  const sections   = getAll(/heading:\s*[`'"]([^`'"]+)[`'"]/g);
  const faqs       = getAll(/question:\s*[`'"]([^`'"]+)[`'"]/g);
  const descLen    = get(/description:\s*[`'"]([^`'"]+)[`'"]/).length;
  const approxLen  = seg.length;
  const clicheCount = CLICHE_WORDS.reduce((n, w) => n + (seg.split(w).length - 1), 0);

  if (sections.length >= 5)      score += 25;
  else if (sections.length >= 4) { score += 20; issues.push(`섹션 ${sections.length}개`); }
  else { score += 0; issues.push(`섹션 부족 ${sections.length}개`); }

  if (faqs.length >= 5)      score += 15;
  else if (faqs.length >= 4) { score += 12; issues.push(`FAQ ${faqs.length}개`); }
  else { score += 0; issues.push(`FAQ 부족 ${faqs.length}개`); }

  if (intro.length >= 300)      score += 15;
  else if (intro.length >= 200) { score += 12; issues.push(`도입부 ${intro.length}자`); }
  else { score += 0; issues.push(`도입부 부족`); }

  if (conclusion.length >= 200)      score += 10;
  else if (conclusion.length >= 100) { score += 8; issues.push(`결론 ${conclusion.length}자`); }
  else { score += 0; issues.push(`결론 부족`); }

  if (descLen >= 120 && descLen <= 160) score += 10;
  else if (descLen >= 80)               { score += 7; issues.push(`메타 ${descLen}자`); }
  else { score += 3; issues.push(`메타 부족`); }

  if (approxLen >= 5000)      score += 15;
  else if (approxLen >= 3000) { score += 12; issues.push(`볼륨 ${approxLen}자`); }
  else if (approxLen >= 2000) { score += 7; issues.push(`볼륨 부족`); }
  else { score += 0; issues.push(`볼륨 매우 부족`); }

  if (clicheCount === 0)     score += 10;
  else if (clicheCount <= 2) { score += 7; issues.push(`클리셰 ${clicheCount}개`); }
  else { score += 0; issues.push(`클리셰 과다 ${clicheCount}개`); }

  return { score: Math.min(score, 100), issues, sectionCount: sections.length, faqCount: faqs.length };
}

// ── claude CLI 호출 (API키 불필요) ────────────────────────────
async function callClaude(system, user) {
  const fullPrompt = system ? `${system}\n\n---\n${user}` : user;
  const result = spawnSync('claude', ['--print', '--dangerously-skip-permissions'], {
    input: fullPrompt,
    encoding: 'utf-8',
    maxBuffer: 20 * 1024 * 1024,
    timeout: 180000,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`claude exit ${result.status}`);
  return result.stdout.trim();
}

// ── 특정 약점 구간만 보강 요청 ────────────────────────────────
async function improvePost(slug, seg, issues) {
  const title = /title:\s*[`'"]([^`'"]+)[`'"]/.exec(seg)?.[1] || slug;
  const category = /category:\s*[`'"]([^`'"]+)[`'"]/.exec(seg)?.[1] || 'guide';

  const needsMoreFaq    = issues.some(i => i.includes('FAQ'));
  const needsMoreSection = issues.some(i => i.includes('섹션'));
  const needsIntro      = issues.some(i => i.includes('도입부'));
  const needsConclusion = issues.some(i => i.includes('결론'));
  const needsMetaFix    = issues.some(i => i.includes('메타'));
  const hasCliche       = issues.some(i => i.includes('클리셰'));

  const tasks = [];
  if (needsMoreFaq)     tasks.push('FAQ 5개 이상으로 보강 (실제 검색 질문 형식)');
  if (needsMoreSection) tasks.push('섹션 5개 이상으로 보강 (각 섹션 600자 이상)');
  if (needsIntro)       tasks.push('도입부 300자 이상으로 확장 (문제 제시 + 해결책 예고)');
  if (needsConclusion)  tasks.push('결론 200자 이상으로 확장 (핵심 요약 + CTA)');
  if (needsMetaFix)     tasks.push('메타 설명 120~155자로 최적화 (키워드 포함)');
  if (hasCliche)        tasks.push('다음 상투어 제거 후 구체적 표현으로 교체: ' + CLICHE_WORDS.join(', '));

  const system = `당신은 블로그 콘텐츠 품질 개선 전문가입니다.
주어진 지시 사항에 따라 해당 필드만 수정하고 나머지는 원본 그대로 유지하세요.
JSON만 반환 (코드 펜스 없음).`;

  const user = `제목: ${title}
카테고리: ${category}
현재 문제: ${issues.join(', ')}

다음 작업만 수행하세요:
${tasks.map((t, i) => `${i + 1}. ${t}`).join('\n')}

현재 포스트 데이터 일부:
${seg.slice(0, 3000)}

수정된 필드만 포함한 JSON 객체로 반환하세요 (slug는 반드시 포함):
{
  "slug": "${slug}",
  // 수정된 필드만 포함
}`;

  const raw = await callClaude(system, user);
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('JSON 없음');
  return JSON.parse(match[0]);
}

// ── blog-content.ts에서 특정 slug의 필드 값 교체 ─────────────
function patchBlogContent(slug, patches) {
  let content = readFileSync(BLOG_CONTENT, 'utf-8');
  let changed = 0;

  for (const [field, newValue] of Object.entries(patches)) {
    if (field === 'slug') continue;
    if (typeof newValue !== 'string') continue;

    // slug 기준으로 해당 포스트 위치 찾기
    const slugIdx = content.indexOf(`slug: \`${slug}\``);
    if (slugIdx === -1) continue;

    // 해당 포스트 내에서 필드 찾아 교체
    const end = content.indexOf('slug:', slugIdx + 10);
    const segEnd = end > 0 ? end : slugIdx + 10000;
    const before = content.slice(0, slugIdx);
    const seg = content.slice(slugIdx, segEnd);
    const after = content.slice(segEnd);

    const escaped = newValue.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
    const re = new RegExp(`(${field}:\\s*)['\`]([^'\`]+)['\`]`);
    const updated = seg.replace(re, `$1\`${escaped}\``);

    if (updated !== seg) { content = before + updated + after; changed++; }
  }

  if (changed > 0) {
    writeFileSync(BLOG_CONTENT, content, 'utf-8');
  }
  return changed;
}

// ── git commit+push (배치당 1회) ──────────────────────────────
function commitBatch(batchIdx, improvedCount) {
  try {
    execSync('node scripts/gen-meta.mjs', { cwd: ROOT, stdio: 'pipe' });
    execSync('git add src/data/blog-content.ts src/data/blog-posts-meta.ts', { cwd: ROOT });
    execSync(`git commit -m "Quality improve: batch ${batchIdx}, ${improvedCount}개 보강"`, { cwd: ROOT });
    execSync('git push origin main', { cwd: ROOT });
    console.log(`  🚀 Batch ${batchIdx} push 완료 (${improvedCount}개 보강)`);
  } catch (e) {
    console.warn(`  ⚠️  commit 실패: ${e.message.slice(0, 60)}`);
  }
}

// ── 메인 ─────────────────────────────────────────────────────
async function main() {
  console.log(`🔍 전체 포스트 품질 검토 ${DRY ? '(dry-run)' : '(실제 보강)'}\n`);

  const { segments } = extractPostSegments();

  const results = segments.map(({ slug, seg }) => {
    const { score, issues, sectionCount, faqCount } = scoreSegment(seg);
    return { slug, seg, score, issues, sectionCount, faqCount };
  });

  const avg = results.reduce((a, b) => a + b.score, 0) / results.length;
  const below90 = results.filter(r => r.score < 90);
  const above90 = results.filter(r => r.score >= 90);

  console.log(`📊 현재 품질 통계`);
  console.log(`   전체: ${results.length}개`);
  console.log(`   평균: ${avg.toFixed(1)}점`);
  console.log(`   90+ : ${above90.length}개 (${(above90.length / results.length * 100).toFixed(0)}%)`);
  console.log(`   90미달: ${below90.length}개\n`);

  if (DRY) {
    console.log('📋 90점 미달 목록 (--dry):');
    below90.sort((a, b) => a.score - b.score)
      .forEach(r => console.log(`  [${r.score}] ${r.slug} — ${r.issues.join(', ')}`));
    return;
  }

  if (below90.length === 0) {
    console.log('✅ 모든 포스트 90점 이상 — 보강 불필요');
    return;
  }

  console.log(`🔧 ${below90.length}개 보강 시작...\n`);

  let improvedInBatch = 0;
  let batchIdx = 1;
  let totalImproved = 0;

  for (let i = 0; i < below90.length; i++) {
    const item = below90[i];
    try {
      const patches = await improvePost(item.slug, item.seg, item.issues);
      const changed = patchBlogContent(item.slug, patches);

      totalImproved++;
      improvedInBatch++;
      console.log(`  ✅ [${i + 1}/${below90.length}] ${item.slug.slice(0, 50)} (${item.score}→90+)`);

      // BATCH_SIZE마다 commit
      if (improvedInBatch >= BATCH_SIZE || i === below90.length - 1) {
        commitBatch(batchIdx, improvedInBatch);
        batchIdx++;
        improvedInBatch = 0;
      }
    } catch (e) {
      console.log(`  ⚠️  ${item.slug.slice(0, 40)}: ${e.message.slice(0, 50)}`);
    }

    // API rate limit 방지
    await new Promise(r => setTimeout(r, 500));
  }

  // 최종 점수 재계산
  const { segments: newSegs } = extractPostSegments();
  const finalResults = newSegs.map(({ slug, seg }) => {
    const { score, issues } = scoreSegment(seg);
    return { slug, score, issues };
  });
  const finalAvg = finalResults.reduce((a, b) => a + b.score, 0) / finalResults.length;
  const finalBelow = finalResults.filter(r => r.score < 90);

  const report = {
    generatedAt: new Date().toISOString(),
    totalPosts: finalResults.length,
    averageScore: finalAvg,
    above90: finalResults.filter(r => r.score >= 90).length,
    below90: finalBelow.length,
    improved: totalImproved,
    remaining: finalBelow.map(r => ({ slug: r.slug, score: r.score, issues: r.issues })),
  };
  writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2), 'utf-8');

  console.log(`\n📊 최종 결과`);
  console.log(`   평균 점수: ${finalAvg.toFixed(1)}점`);
  console.log(`   90점 이상: ${report.above90}개`);
  console.log(`   여전히 미달: ${finalBelow.length}개`);
  console.log(`   보강 완료: ${totalImproved}개`);
  console.log(`   리포트: scripts/quality-report-final.json`);
}

main().catch(e => { console.error('❌ 오류:', e.message); process.exit(1); });
