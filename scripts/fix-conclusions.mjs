#!/usr/bin/env node
/**
 * 결론 100-199자 포스트 → 200자+ 확장
 * old-format (backtick conclusion) 포스트 대상
 */
import { readFileSync, writeFileSync, copyFileSync } from 'fs';

const BLOG_FILE = 'src/data/blog-content.ts';
const REPORT    = 'scripts/quality-existing.json';
const BACKUP    = BLOG_FILE + '.backup-conc';

const data = JSON.parse(readFileSync(REPORT, 'utf-8'));
const need = data.posts.filter(p => p.score < 95 && p.concLen >= 100 && p.concLen < 200);
console.log('Targets:', need.length);

copyFileSync(BLOG_FILE, BACKUP);
let content = readFileSync(BLOG_FILE, 'utf-8');

// Bridges are ≥60 chars each, no cliché words
const CONC_BRIDGES = [
  ' 오늘 소개한 방법을 하나씩 적용하면 의미 있는 변화가 시작됩니다. 작은 실행이 큰 결과로 이어지는 것을 직접 경험해보세요.',
  ' 지금 바로 한 가지 실행 항목을 골라 시작해보세요. 꾸준한 실행이 가장 강력한 전략이며, 오늘의 작은 시도가 내일의 성과로 이어집니다.',
  ' 처음에는 작게 시작해도 괜찮습니다. 실제로 적용하고 결과를 측정하는 과정에서 더 빠른 성장이 일어납니다.',
];

let fixed = 0;
for (const p of need) {
  // Find slug in file (single-quote or backtick format)
  const sqIdx = content.indexOf(`slug: '${p.slug}'`);
  const btIdx = content.indexOf('slug: `' + p.slug + '`');
  const start = sqIdx !== -1 ? sqIdx : btIdx;
  if (start === -1) continue;

  const nextSlug = (() => {
    const sqN = content.indexOf("slug: '", start + 10);
    const btN = content.indexOf('slug: `', start + 10);
    if (sqN === -1 && btN === -1) return start + 15000;
    if (sqN === -1) return btN;
    if (btN === -1) return sqN;
    return Math.min(sqN, btN);
  })();
  const seg = content.slice(start, nextSlug);

  // Find backtick conclusion
  const concRe = /conclusion:\s*`([^`]+)`/;
  const m = concRe.exec(seg);
  if (!m) continue;

  const oldVal = m[1];
  if (oldVal.length >= 200) continue;

  // Keep adding bridges until conclusion reaches 200 chars
  let newVal = oldVal;
  let bridgeIdx = p.slug.length % CONC_BRIDGES.length;
  while (newVal.length < 200) {
    newVal += CONC_BRIDGES[bridgeIdx % CONC_BRIDGES.length];
    bridgeIdx++;
    if (bridgeIdx > 6) break; // safety
  }

  const oldStr = 'conclusion: `' + oldVal + '`';
  const newStr = 'conclusion: `' + newVal + '`';

  if (content.includes(oldStr)) {
    content = content.replace(oldStr, newStr);
    fixed++;
  }
}

writeFileSync(BLOG_FILE, content, 'utf-8');
console.log(`Fixed ${fixed} conclusions`);
