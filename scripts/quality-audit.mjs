#!/usr/bin/env node
/**
 * 크레피카 포스트 품질 감사
 * 발행된 모든 포스트를 스캔해 품질 점수를 출력합니다.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const CREPIKA_TOOLS = [
  '/tools/text-counter',
  '/tools/byte-counter',
  '/tools/webp-converter',
  '/tools/insta-spacer',
  '/tools/hashtag-mixer',
  '/tools/qr-generator',
  '/tools/lorem-generator',
];

function extractPosts(tsContent) {
  // Extract JSON-like objects from the TypeScript array
  // This is a simple heuristic: find all slug: occurrences and extract surrounding object text
  const posts = [];
  const slugMatches = [...tsContent.matchAll(/slug:\s*['"]([^'"]+)['"]/g)];

  for (const match of slugMatches) {
    const slug = match[1];
    // Find the position and extract a window around it to gauge content
    const start = match.index;
    const window = tsContent.slice(start, start + 8000);
    posts.push({ slug, window });
  }
  return posts;
}

function scorePost(slug, window) {
  const scores = {};
  let total = 0;

  // 1. Section count (25점)
  const sectionMatches = (window.match(/heading:\s*['"`]/g) || []).length;
  const sectionScore = Math.min(sectionMatches >= 4 ? 25 : sectionMatches >= 3 ? 18 : sectionMatches >= 2 ? 10 : 0, 25);
  scores.sections = { count: sectionMatches, score: sectionScore, max: 25 };
  total += sectionScore;

  // 2. FAQ count (20점)
  const faqMatches = (window.match(/question:\s*['"`]/g) || []).length;
  const faqScore = Math.min(faqMatches >= 4 ? 20 : faqMatches >= 3 ? 15 : faqMatches >= 2 ? 8 : 0, 20);
  scores.faq = { count: faqMatches, score: faqScore, max: 20 };
  total += faqScore;

  // 3. Content length (20점)
  const contentLength = window.length;
  const lengthScore = contentLength >= 3000 ? 20 : contentLength >= 2000 ? 15 : contentLength >= 1000 ? 8 : 0;
  scores.length = { chars: contentLength, score: lengthScore, max: 20 };
  total += lengthScore;

  // 4. Keywords (20점)
  const keywordsMatch = window.match(/keywords:\s*\[([^\]]+)\]/);
  const kwCount = keywordsMatch ? (keywordsMatch[1].match(/['"]/g) || []).length / 2 : 0;
  const kwScore = kwCount >= 5 ? 20 : kwCount >= 3 ? 12 : kwCount >= 1 ? 6 : 0;
  scores.keywords = { count: kwCount, score: kwScore, max: 20 };
  total += kwScore;

  // 5. Crepika tool links (15점)
  const toolLinks = CREPIKA_TOOLS.filter(t => window.includes(t));
  const toolScore = toolLinks.length >= 2 ? 15 : toolLinks.length >= 1 ? 10 : 0;
  scores.toolLinks = { found: toolLinks, score: toolScore, max: 15 };
  total += toolScore;

  return { slug, scores, total, grade: total >= 90 ? '🏆 A+' : total >= 80 ? '✅ A' : total >= 70 ? '🔶 B' : '❌ C' };
}

function main() {
  console.log('🔍 크레피카 포스트 품질 감사 시작...\n');

  const tsContent = readFileSync(join(ROOT, 'src', 'data', 'blog-content.ts'), 'utf-8');
  const posts = extractPosts(tsContent);

  if (posts.length === 0) {
    console.log('포스트를 찾을 수 없습니다.');
    return;
  }

  const results = posts.map(p => scorePost(p.slug, p.window));

  // Sort by score
  results.sort((a, b) => a.total - b.total);

  console.log(`총 ${results.length}개 포스트 분석\n`);
  console.log('─'.repeat(70));

  let passCount = 0;
  for (const r of results) {
    const bar = '█'.repeat(Math.round(r.total / 5)) + '░'.repeat(20 - Math.round(r.total / 5));
    console.log(`${r.grade} [${r.total}/100] ${r.slug}`);
    console.log(`   ${bar} 섹션:${r.scores.sections.count} FAQ:${r.scores.faq.count} KW:${r.scores.keywords.count} 도구링크:${r.scores.toolLinks.found.length}`);
    if (r.total < 90) {
      const issues = [];
      if (r.scores.sections.count < 4) issues.push(`섹션 ${r.scores.sections.count}개→4개 필요`);
      if (r.scores.faq.count < 4) issues.push(`FAQ ${r.scores.faq.count}개→4개 필요`);
      if (r.scores.toolLinks.found.length < 1) issues.push('크레피카 도구 링크 없음');
      if (issues.length) console.log(`   ⚠️  개선 필요: ${issues.join(', ')}`);
    } else {
      passCount++;
    }
  }

  console.log('─'.repeat(70));
  const avg = Math.round(results.reduce((s, r) => s + r.total, 0) / results.length);
  console.log(`\n📊 평균 점수: ${avg}/100`);
  console.log(`✅ 90점 이상: ${passCount}/${results.length}개`);
  console.log(`❌ 90점 미만: ${results.length - passCount}/${results.length}개`);

  const lowScorers = results.filter(r => r.total < 90);
  if (lowScorers.length > 0) {
    console.log('\n⚠️  개선 대상 포스트:');
    lowScorers.forEach(r => console.log(`   - ${r.slug} (${r.total}점)`));
  } else {
    console.log('\n🎉 모든 포스트가 90점 이상입니다!');
  }
}

main();
