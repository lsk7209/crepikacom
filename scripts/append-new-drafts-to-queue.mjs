#!/usr/bin/env node
/**
 * Scan scripts/drafts/ for slugs not in post-queue.json, append them.
 * Run after batch agent completion.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const QUEUE_FILE = join(ROOT, 'scripts', 'post-queue.json');
const DRAFTS_DIR = join(ROOT, 'scripts', 'drafts');

const queue = JSON.parse(readFileSync(QUEUE_FILE, 'utf-8'));
const existingSlugs = new Set(queue.map(e => e.slug));
const maxId = queue.reduce((m, e) => Math.max(m, e.id || 0), 0);

const draftFiles = readdirSync(DRAFTS_DIR).filter(f => f.endsWith('.json'));
const newDrafts = [];

for (const f of draftFiles) {
  const slug = f.replace(/\.json$/, '');
  if (existingSlugs.has(slug)) continue;
  try {
    const draft = JSON.parse(readFileSync(join(DRAFTS_DIR, f), 'utf-8'));
    if (!draft.title) {
      console.warn(`⚠️  ${slug}: title 없음, 스킵`);
      continue;
    }
    newDrafts.push({ slug, draft });
  } catch (e) {
    console.warn(`⚠️  ${slug}: JSON 파싱 실패 - ${e.message}`);
  }
}

console.log(`기존 큐: ${queue.length}개`);
console.log(`디스크 드래프트: ${draftFiles.length}개`);
console.log(`신규 추가 대상: ${newDrafts.length}개`);

let nextId = maxId + 1;
for (const { slug, draft } of newDrafts) {
  queue.push({
    id: nextId++,
    slug,
    title: draft.title,
    publishDate: draft.publishDate || '2026-05-18',
    category: draft.category || 'guide',
    published: false,
  });
}

writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2), 'utf-8');
console.log(`✅ 큐 업데이트 완료 — 총 ${queue.length}개 (마지막 ID: ${nextId - 1})`);
