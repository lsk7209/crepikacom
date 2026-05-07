#!/usr/bin/env node
/**
 * 설명(description) 중복 텍스트 제거
 * "단계별 실전 방법을 체계적으로 정리했습니다. 실전 경험을 바탕으로 정리했습니다. 실전 경험을 바탕으로 정리했습니다." 패턴 제거
 */
import { readFileSync, writeFileSync, copyFileSync } from 'fs';

const BLOG_FILE = 'src/data/blog-content.ts';
copyFileSync(BLOG_FILE, BLOG_FILE + '.backup-desc');

let content = readFileSync(BLOG_FILE, 'utf-8');

// Patterns to remove (trailing duplicate phrases)
const REMOVE_PATTERNS = [
  / 단계별 실전 방법을 체계적으로 정리했습니다\. 실전 경험을 바탕으로 정리했습니다\. 실전 경험을 바탕으로 정리했습니다\./g,
  / 단계별 실전 방법을 체계적으로 정리했습니다\. 실전 경험을 바탕으로 정리했습니다\./g,
  / 실전 경험을 바탕으로 정리했습니다\. 실전 경험을 바탕으로 정리했습니다\./g,
  / 실전에서 바로 활용할 수 있는 방법을 담았습니다\. 실전에서 바로 활용할 수 있는 방법을 담았습니다\./g,
];

let fixed = 0;
for (const re of REMOVE_PATTERNS) {
  const before = content;
  content = content.replace(re, '.');
  const count = (before.length - content.length);
  if (count > 0) {
    console.log(`Pattern removed, saved ${count} chars`);
    fixed++;
  }
}

// Also fix descriptions that still end with duplicate sentence
// Pattern: "A. A." where A is the same sentence repeated
const dupSentRe = /([。．.][^'`"]{10,80})\. \1/g;
const before2 = content;
content = content.replace(dupSentRe, '$1');
if (content !== before2) { console.log('Duplicate sentences removed'); fixed++; }

writeFileSync(BLOG_FILE, content, 'utf-8');
console.log(`Fixed ${fixed} patterns`);
