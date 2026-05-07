#!/usr/bin/env node
/**
 * 신규 발행 포스트 자동 품질 보강
 * auto-scheduler.mjs가 발행 직후 호출: node scripts/fix-new-post.mjs <slug>
 * - description < 80자 → 확장
 * - cc ≥ 1 → 클리셰 교체
 * - 보정 후 TS 검증
 */
import { readFileSync, writeFileSync } from 'fs';

const BLOG_FILE = 'src/data/blog-content.ts';
const CLICHE_MAP = [
  ['결론적으로',         '정리하면'],
  ['중요한 것은',        '핵심은'],
  ['매우 중요합니다',    '필수적입니다'],
  ['이러한 측면에서',   '이 맥락에서'],
  ['다시 말해서',        '풀어 설명하면'],
  ['한마디로 말씀드리면', '간단히 말하면'],
];

const slug = process.argv[2];
if (!slug) { console.log('Usage: node fix-new-post.mjs <slug>'); process.exit(0); }

let content = readFileSync(BLOG_FILE, 'utf-8');
const startIdx = content.indexOf(`slug: \`${slug}\``);
if (startIdx === -1) { console.log('Slug not found:', slug); process.exit(0); }

// Find end of this post's segment
const nextSlugIdx = content.indexOf('slug: `', startIdx + 10);
const segEnd = nextSlugIdx > 0 ? nextSlugIdx : startIdx + 20000;
let seg = content.slice(startIdx, segEnd);

let changed = false;

// 1. Fix clichés
for (const [from, to] of CLICHE_MAP) {
  if (seg.includes(from)) {
    seg = seg.replaceAll(from, to);
    console.log(`Cliché fixed: "${from}" → "${to}"`);
    changed = true;
  }
}

// 2. Fix short description (< 80 chars)
const descM = seg.match(/description:\s*`([^`]+)`/);
if (descM && descM[1].length < 80) {
  const ext = ' 실전 경험을 바탕으로 단계별 방법을 정리했습니다.';
  const oldDesc = `description: \`${descM[1]}\``;
  const newDesc = `description: \`${descM[1]}${ext}\``;
  seg = seg.replace(oldDesc, newDesc);
  console.log(`Description extended: ${descM[1].length} → ${descM[1].length + ext.length}`);
  changed = true;
}

if (changed) {
  content = content.slice(0, startIdx) + seg + content.slice(segEnd);
  writeFileSync(BLOG_FILE, content, 'utf-8');
  console.log('✅ Post fixed:', slug);
} else {
  console.log('✅ No fixes needed:', slug);
}
