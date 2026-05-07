#!/usr/bin/env node
import { readFileSync, writeFileSync, copyFileSync } from 'fs';

const BLOG_FILE = 'src/data/blog-content.ts';
copyFileSync(BLOG_FILE, BLOG_FILE + '.backup-threads');

let content = readFileSync(BLOG_FILE, 'utf-8');

const slugKey = "slug: 'threads-marketing-complete-guide-meta-threads-follower-2026-'";
const slugPos = content.indexOf(slugKey);
if (slugPos === -1) {
  console.log('ERROR: Threads slug not found');
  process.exit(1);
}

// The segment from threads post to end of file
const before = content.slice(0, slugPos);
const segRaw = content.slice(slugPos);

// In the file, the double-escaped quote is stored as two backslash chars followed by apostrophe.
// We need to replace \\ + ' (where that combination appears inside single-quoted strings)
// with just \' (single backslash + apostrophe).
// The literal chars we're searching for: backslash, backslash, apostrophe
// In a JS string, backslash is '\\', so two backslashes = '\\\\'
// So the pattern is: '\\\\' + "'"  i.e. the string "\\\\\'"
// We want to replace with: backslash + apostrophe = "\\'"

const doubleEscapeChar = "\\\\'"; // This is the 3-char sequence: \ \ '
const singleEscapeChar = "\\'";   // This is the 2-char sequence: \ '

// Count occurrences
let count = 0;
let idx = 0;
while (true) {
  idx = segRaw.indexOf(doubleEscapeChar, idx);
  if (idx === -1) break;
  count++;
  idx += doubleEscapeChar.length;
}
console.log(`Found ${count} double-escaped quotes in Threads post`);

if (count === 0) {
  console.log('Nothing to fix');
  process.exit(0);
}

// Replace all occurrences in the segment
const fixedSeg = segRaw.split(doubleEscapeChar).join(singleEscapeChar);

// Verify count changed
const afterCount = fixedSeg.split(doubleEscapeChar).length - 1;
console.log(`After fix: ${afterCount} double-escaped quotes remaining`);

content = before + fixedSeg;
writeFileSync(BLOG_FILE, content, 'utf-8');
console.log('Fix applied successfully');
