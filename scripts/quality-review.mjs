#!/usr/bin/env node
/**
 * 포스트 구조적 품질 검사 스크립트 (API 불필요)
 * blog-content.ts의 모든 포스트를 구조 기준으로 점수화 → 미달 포스트 목록 출력
 * 실제 내용 보강은 Claude Code가 직접 처리.
 *
 * 사용법:
 *   node scripts/quality-review.mjs          → 전체 점수 요약
 *   node scripts/quality-review.mjs --below  → 90점 미달 목록
 *   node scripts/quality-review.mjs --detail → 슬러그별 상세 점수
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BLOG_CONTENT_FILE = join(ROOT, 'src', 'data', 'blog-content.ts');
const REPORT_FILE = join(ROOT, 'scripts', 'quality-report.json');

const CLICHE_WORDS = ['결론적으로', '중요한 것은', '매우 중요합니다', '이러한 측면에서', '다시 말해서', '한마디로 말씀드리면'];

function extractPosts() {
  const content = readFileSync(BLOG_CONTENT_FILE, 'utf-8');
  const slugRe = /slug:\s*['"]([^'"]+)['"]/g;
  const posts = [];
  let m;
  while ((m = slugRe.exec(content)) !== null) {
    const pos = m.index;
    const seg = content.slice(pos, pos + 8000);
    const get = (re) => re.exec(seg)?.[1] || '';
    const getAll = (re) => { const arr = []; let x; while ((x = re.exec(seg)) !== null) arr.push(x[1]); return arr; };

    const intro     = get(/introduction:\s*['"]([^'"]{20,})/);
    const conclusion = get(/conclusion:\s*['"]([^'"]{20,})/);
    const sections  = getAll(/heading:\s*['"]([^'"]+)['"]/);
    const faqs      = getAll(/question:\s*['"]([^'"]+)['"]/);
    const keywords  = getAll(/['"]([^'"]{3,20})['"]/);
    const descLen   = get(/description:\s*['"]([^'"]+)['"]/).length;
    const fullText  = seg.slice(0, 6000);

    const clicheCount = CLICHE_WORDS.reduce((n, w) => n + (fullText.split(w).length - 1), 0);
    const approxLen = fullText.length;

    posts.push({
      slug: m[1],
      title: get(/title:\s*['"]([^'"]+)['"]/),
      category: get(/category:\s*['"]([^'"]+)['"]/),
      author: get(/author:\s*['"]([^'"]+)['"]/),
      sectionCount: sections.length,
      faqCount: faqs.length,
      introLen: intro.length,
      conclusionLen: conclusion.length,
      descLen,
      approxLen,
      clicheCount,
      keywordCount: Math.min(keywords.filter(k => k.length > 3).length, 10),
    });
  }
  return posts;
}

function scorePost(p) {
  let score = 0;
  const issues = [];

  // 섹션 수 (25점)
  if (p.sectionCount >= 5)      score += 25;
  else if (p.sectionCount >= 4) score += 20;
  else if (p.sectionCount >= 3) { score += 12; issues.push(`섹션 ${p.sectionCount}개 (4+ 권장)`); }
  else                          { score += 0;  issues.push(`섹션 ${p.sectionCount}개 (너무 적음)`); }

  // FAQ (15점)
  if (p.faqCount >= 5)      score += 15;
  else if (p.faqCount >= 4) score += 12;
  else if (p.faqCount >= 2) { score += 7; issues.push(`FAQ ${p.faqCount}개 (4+ 권장)`); }
  else                      { score += 0; issues.push(`FAQ 없거나 부족`); }

  // 도입부 길이 (15점)
  if (p.introLen >= 300)      score += 15;
  else if (p.introLen >= 200) score += 12;
  else if (p.introLen >= 100) { score += 7; issues.push(`도입부 짧음 (${p.introLen}자)`); }
  else                        { score += 0; issues.push(`도입부 매우 짧음`); }

  // 결론 길이 (10점)
  if (p.conclusionLen >= 200)      score += 10;
  else if (p.conclusionLen >= 100) score += 8;
  else if (p.conclusionLen >= 50)  { score += 5; issues.push(`결론 짧음`); }
  else                             { score += 0; issues.push(`결론 없거나 너무 짧음`); }

  // 메타 설명 (10점)
  if (p.descLen >= 120 && p.descLen <= 160) score += 10;
  else if (p.descLen >= 80)                 score += 7;
  else { score += 3; issues.push(`메타 설명 ${p.descLen}자 (120~155자 권장)`); }

  // 전체 콘텐츠 양 (15점)
  if (p.approxLen >= 5000)       score += 15;
  else if (p.approxLen >= 3000)  score += 12;
  else if (p.approxLen >= 2000)  { score += 7; issues.push(`콘텐츠 볼륨 부족`); }
  else                           { score += 0; issues.push(`콘텐츠 매우 부족`); }

  // AI 클리셰 (10점)
  if (p.clicheCount === 0)      score += 10;
  else if (p.clicheCount <= 2)  score += 7;
  else { score += 0; issues.push(`AI 클리셰 ${p.clicheCount}개`); }

  return { score: Math.min(score, 100), issues };
}

function main() {
  const posts = extractPosts();
  console.log(`📚 총 포스트: ${posts.length}개\n`);

  const results = posts.map(p => ({ ...p, ...scorePost(p) }));
  const avg = results.reduce((a, b) => a + b.score, 0) / results.length;
  const below90 = results.filter(r => r.score < 90);
  const below80 = results.filter(r => r.score < 80);
  const above90 = results.filter(r => r.score >= 90);

  console.log(`📊 품질 통계`);
  console.log(`   평균 점수: ${avg.toFixed(1)}점`);
  console.log(`   90점 이상: ${above90.length}개 (${(above90.length/results.length*100).toFixed(0)}%)`);
  console.log(`   90점 미달: ${below90.length}개`);
  console.log(`   80점 미달: ${below80.length}개`);

  const arg = process.argv[2];

  if (arg === '--below') {
    console.log(`\n⚠️  90점 미달 목록 (${below90.length}개):`);
    below90.sort((a,b) => a.score - b.score).forEach(r => {
      console.log(`  [${r.score}점] ${r.slug}`);
      if (r.issues.length) console.log(`         → ${r.issues.join(', ')}`);
    });
  }

  if (arg === '--detail') {
    results.sort((a,b) => a.score - b.score).forEach(r => {
      console.log(`[${r.score}] ${r.slug} | 섹션:${r.sectionCount} FAQ:${r.faqCount} 소개:${r.introLen}자`);
    });
  }

  // 리포트 저장
  writeFileSync(REPORT_FILE, JSON.stringify({
    generatedAt: new Date().toISOString(),
    totalPosts: results.length,
    averageScore: avg,
    above90: above90.length,
    below90: below90.length,
    posts: results.map(r => ({ slug: r.slug, title: r.title, score: r.score, issues: r.issues }))
  }, null, 2));
  console.log(`\n📄 상세 리포트 저장: scripts/quality-report.json`);
}

main();
