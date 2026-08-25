import assert from 'node:assert/strict';
import test from 'node:test';
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
