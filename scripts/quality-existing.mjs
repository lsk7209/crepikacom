#!/usr/bin/env node
/**
 * 기존 blog-content.ts 포스트 품질 검사 (메모리 효율 버전)
 * - heading: 또는 title:(섹션용) 모두 인식
 * - 백틱 문자열도 파싱
 */
import { readFileSync, writeFileSync } from 'fs';

const CLICHE = ['결론적으로','중요한 것은','매우 중요합니다','이러한 측면에서','다시 말해서','한마디로 말씀드리면'];
const content = readFileSync('src/data/blog-content.ts', 'utf-8');

const slugRe = /slug:\s*['"`]([^'"`]+)['"`]/g;
const positions = [];
let m;
while ((m = slugRe.exec(content)) !== null) positions.push({ slug: m[1], pos: m.index });

function extractLen(seg, field) {
  // Backtick string (don't use ' or " as closing, only `)
  const btRe = new RegExp(`${field}:\\s*\`([\\s\\S]{10,700}?)\``);
  const btM = btRe.exec(seg);
  if (btM) return btM[1].length;
  // Single-quote string
  const sqRe = new RegExp(`${field}:\\s*'([\\s\\S]{5,700}?)'`);
  const sqM = sqRe.exec(seg);
  if (sqM) return sqM[1].length;
  // Double-quote string
  const dqRe = new RegExp(`${field}:\\s*"([\\s\\S]{5,700}?)"`);
  const dqM = dqRe.exec(seg);
  if (dqM) return dqM[1].length;
  return 0;
}

const results = [];
for (let i = 0; i < positions.length; i++) {
  const start = positions[i].pos;
  const end   = i + 1 < positions.length ? positions[i + 1].pos : start + 12000;
  const seg   = content.slice(start, Math.min(end, start + 12000));

  // Sections: count both "heading:" and section-level "title:" (indented 8+ spaces)
  const headingCount = (seg.match(/heading:/g) || []).length;
  const secTitleCount = (seg.match(/\s{8,}title:/g) || []).length;
  const secCount = headingCount + secTitleCount;

  const faqCount  = (seg.match(/question:/g) || []).length;
  const introLen  = extractLen(seg, 'introduction');
  const concLen   = extractLen(seg, 'conclusion');
  const descLen   = extractLen(seg, 'description');
  const approxLen = seg.length;
  const cc        = CLICHE.reduce((n, w) => n + (seg.split(w).length - 1), 0);

  let score = 0;
  const issues = [];

  if (secCount >= 5)      score += 25;
  else if (secCount >= 4) score += 20;
  else if (secCount >= 3) { score += 12; issues.push('섹션' + secCount); }
  else                    { issues.push('섹션' + secCount); }

  if (faqCount >= 5)      score += 15;
  else if (faqCount >= 4) score += 12;
  else if (faqCount >= 2) { score += 7; issues.push('FAQ' + faqCount); }
  else                    { score += 0; issues.push('FAQ없음'); }

  if (introLen >= 300)      score += 15;
  else if (introLen >= 200) score += 12;
  else if (introLen >= 100) { score += 7;  issues.push('도입부' + introLen); }
  else                      { score += 0;  issues.push('도입부없음'); }

  if (concLen >= 200)      score += 10;
  else if (concLen >= 100) score += 8;
  else if (concLen >= 50)  { score += 5; issues.push('결론짧음'); }
  else                     { score += 0; issues.push('결론없음'); }

  if (descLen >= 120 && descLen <= 160) score += 10;
  else if (descLen >= 80)               score += 7;
  else                                  { score += 3; issues.push('설명' + descLen + '자'); }

  if (approxLen >= 5000)      score += 15;
  else if (approxLen >= 3000) score += 12;
  else if (approxLen >= 2000) { score += 7; issues.push('볼륨부족'); }
  else                        { score += 0; issues.push('볼륨없음'); }

  if (cc === 0)     score += 10;
  else if (cc <= 2) score += 7;
  else              { score += 0; issues.push('클리셰' + cc); }

  results.push({ slug: positions[i].slug, score, issues, secCount, faqCount, introLen, concLen, descLen, approxLen, cc });
}

const avg      = results.reduce((a, b) => a + b.score, 0) / results.length;
const below90  = results.filter(r => r.score < 90);
const above90  = results.filter(r => r.score >= 90);

console.log(`총: ${results.length} | 평균: ${avg.toFixed(1)} | 90+: ${above90.length} | 미달: ${below90.length}`);

if (below90.length) {
  console.log('\n미달 목록 (하위 30개):');
  below90.sort((a, b) => a.score - b.score).slice(0, 30).forEach(r => {
    console.log(`  [${r.score}] ${r.slug}${r.issues.length ? ' → ' + r.issues.join(', ') : ''}`);
  });
}

writeFileSync('scripts/quality-existing.json', JSON.stringify({
  generatedAt: new Date().toISOString(),
  avg: parseFloat(avg.toFixed(1)),
  above90: above90.length,
  below90: below90.length,
  posts: results.sort((a, b) => a.score - b.score),
}, null, 2));
console.log('\n리포트: scripts/quality-existing.json');
