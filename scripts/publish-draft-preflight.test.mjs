import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { parseAndValidatePublishDraft } from './publish-draft-preflight.mjs';

const validEntry = { id: 408, slug: 'sales-funnel-email-sequence-conversion-case' };
const validPost = { slug: validEntry.slug, title: 'A descriptive title' };

test('accepts a coherent draft with a readable slug', () => {
  assert.deepEqual(parseAndValidatePublishDraft({ entry: validEntry, draftPath: `scripts/drafts/${validEntry.slug}.json`, source: JSON.stringify(validPost) }), validPost);
});

test('rejects numeric-only slugs before publication can mutate files', () => {
  assert.throws(() => parseAndValidatePublishDraft({ entry: { id: 408, slug: '30' }, draftPath: 'scripts/drafts/30.json', source: JSON.stringify({ ...validPost, slug: '30' }) }), /numeric-only slug/);
});

test('rejects queue and draft slug mismatches', () => {
  assert.throws(() => parseAndValidatePublishDraft({ entry: validEntry, draftPath: `scripts/drafts/${validEntry.slug}.json`, source: JSON.stringify({ ...validPost, slug: `${validEntry.slug}-other` }) }), /does not match draft slug/);
});

test('rejects queue and filename slug mismatches', () => {
  assert.throws(() => parseAndValidatePublishDraft({ entry: validEntry, draftPath: 'scripts/drafts/wrong-file-name.json', source: JSON.stringify(validPost) }), /does not match draft filename slug/);
});

// Queue 418 failed on 2026-10-08: its filename/queue used -str, but JSON used -strategy.
const queue418Slug = 'blog-adsense-revenue-complete-guide-ads-rpm-optimization-str';
test('rejects the exact queue 418 truncated-slug mismatch', () => {
  assert.throws(() => parseAndValidatePublishDraft({
    entry: { id: 418, slug: queue418Slug },
    draftPath: `scripts/drafts/${queue418Slug}.json`,
    source: JSON.stringify({ slug: `${queue418Slug}ategy` }),
  }), /queue slug \"blog-adsense-revenue-complete-guide-ads-rpm-optimization-str\" does not match draft slug/);
});

test('queue 418 repository draft keeps queue, JSON and filename coherent', () => {
  const queue = JSON.parse(readFileSync(new URL('./post-queue.json', import.meta.url), 'utf-8'));
  const entry = queue.find(item => item.id === 418);
  assert.ok(entry);
  assert.equal(entry.slug, queue418Slug);
  const draftPath = new URL(`./drafts/${entry.slug}.json`, import.meta.url);
  const post = parseAndValidatePublishDraft({ entry, draftPath: draftPath.pathname, source: readFileSync(draftPath, 'utf-8') });
  assert.equal(post.slug, queue418Slug);
});
