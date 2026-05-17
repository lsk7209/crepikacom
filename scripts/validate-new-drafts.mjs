#!/usr/bin/env node
/**
 * Validate all drafts: required fields, content length, no cliches.
 */
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DRAFTS_DIR = join(ROOT, 'scripts', 'drafts');

const CLICHES = [
  /여러분\s*안녕하세요/,
  /오늘은\s*[^.]{2,30}\s*에\s*대해/,
  /^결론적으로/m,
  /^마치며/m,
  /^글을\s*마무리/m,
  /(혁신적|놀라운|압도적인)/,
];

const VALID_AUTHORS = new Set(['이지수', '김민혁', '박준영']);
const VALID_CATEGORIES = new Set(['guide', 'tips', 'insights', 'case-study']);

const issues = {
  missing_field: [],
  short_content: [],
  cliche: [],
  invalid_author: [],
  invalid_category: [],
};

const files = readdirSync(DRAFTS_DIR).filter(f => f.endsWith('.json'));
let valid = 0;

for (const f of files) {
  const slug = f.replace(/\.json$/, '');
  try {
    const d = JSON.parse(readFileSync(join(DRAFTS_DIR, f), 'utf-8'));
    const required = ['slug', 'title', 'description', 'category', 'author', 'keywords', 'content', 'faq'];
    const missing = required.filter(k => !d[k]);
    if (missing.length) {
      issues.missing_field.push(`${slug}: ${missing.join(',')}`);
      continue;
    }
    if (!VALID_AUTHORS.has(d.author)) issues.invalid_author.push(`${slug}: ${d.author}`);
    if (!VALID_CATEGORIES.has(d.category)) issues.invalid_category.push(`${slug}: ${d.category}`);

    const intro = d.content?.introduction || '';
    const sectionsLen = (d.content?.sections || []).reduce((s, sec) => s + (sec.content?.length || 0), 0);
    const conclusion = d.content?.conclusion || '';
    if (intro.length < 500 || sectionsLen < 3000 || conclusion.length < 300) {
      issues.short_content.push(`${slug}: intro=${intro.length} sections=${sectionsLen} concl=${conclusion.length}`);
    }

    const fullText = intro + ' ' + (d.content?.sections || []).map(s => s.content).join(' ') + ' ' + conclusion;
    for (const re of CLICHES) {
      if (re.test(fullText)) {
        issues.cliche.push(`${slug}: ${re.source}`);
        break;
      }
    }
    valid++;
  } catch (e) {
    issues.missing_field.push(`${slug}: parse-error - ${e.message}`);
  }
}

console.log(`총 파일: ${files.length}, 유효: ${valid}`);
for (const [k, arr] of Object.entries(issues)) {
  if (arr.length) {
    console.log(`\n⚠️  ${k}: ${arr.length}건`);
    arr.slice(0, 5).forEach(x => console.log(`   ${x}`));
    if (arr.length > 5) console.log(`   ... 외 ${arr.length - 5}건`);
  }
}
