#!/usr/bin/env node
/**
 * 드래프트 상태 관리 스크립트 (API 불필요)
 * scripts/drafts/{slug}.json 파일 현황 확인 및 관리
 * 실제 콘텐츠 생성은 Claude Code가 직접 처리.
 *
 * 사용법:
 *   node scripts/batch-write.mjs          → 드래프트 현황 확인
 *   node scripts/batch-write.mjs --list   → 미완성 목록 출력
 *   node scripts/batch-write.mjs --clean  → failed/ 목록 확인
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const QUEUE_FILE = join(ROOT, 'scripts', 'post-queue.json');
const DRAFTS_DIR = join(ROOT, 'scripts', 'drafts');
const FAILED_DIR = join(ROOT, 'scripts', 'drafts', 'failed');

mkdirSync(DRAFTS_DIR, { recursive: true });
mkdirSync(FAILED_DIR, { recursive: true });

function showStatus() {
  const queue = JSON.parse(readFileSync(QUEUE_FILE, 'utf-8'));
  const pending = queue.filter(e => !e.published);
  const draftFiles = existsSync(DRAFTS_DIR)
    ? readdirSync(DRAFTS_DIR).filter(f => f.endsWith('.json') && !readdirSync(FAILED_DIR, { withFileTypes: true }).find(d => d.name === f))
    : [];
  const draftSlugs = new Set(draftFiles.map(f => f.replace('.json', '')));
  const readyToPublish = pending.filter(e => draftSlugs.has(e.slug));
  const needsContent   = pending.filter(e => !draftSlugs.has(e.slug));

  console.log('📊 드래프트 현황\n');
  console.log(`  미발행 큐 항목: ${pending.length}개`);
  console.log(`  드래프트 완성:  ${readyToPublish.length}개 → 발행 준비 완료`);
  console.log(`  콘텐츠 필요:    ${needsContent.length}개`);
  console.log(`  실패:           ${existsSync(FAILED_DIR) ? readdirSync(FAILED_DIR).length : 0}개\n`);

  if (readyToPublish.length > 0) {
    const etaDays = Math.ceil(readyToPublish.length / (24 / 5));
    console.log(`  📅 발행 예상 완료: 약 ${etaDays}일 후 (5시간 간격 기준)`);
  }
}

function listMissing() {
  const queue = JSON.parse(readFileSync(QUEUE_FILE, 'utf-8'));
  const pending = queue.filter(e => !e.published);
  const draftFiles = existsSync(DRAFTS_DIR) ? new Set(readdirSync(DRAFTS_DIR).map(f => f.replace('.json', ''))) : new Set();
  const missing = pending.filter(e => !draftFiles.has(e.slug));
  console.log(`콘텐츠 미작성: ${missing.length}개\n`);
  missing.forEach(e => console.log(`  [${e.id}] [${e.category}] ${e.title}`));
}

function listFailed() {
  if (!existsSync(FAILED_DIR)) { console.log('failed/ 디렉토리 없음'); return; }
  const files = readdirSync(FAILED_DIR);
  console.log(`실패 항목: ${files.length}개`);
  files.forEach(f => console.log(`  - ${f}`));
}

const arg = process.argv[2];
if (arg === '--list')  listMissing();
else if (arg === '--clean') listFailed();
else showStatus();
