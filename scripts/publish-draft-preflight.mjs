import { basename, extname } from 'node:path';

const READABLE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validateReadableSlug(slug, label) {
  if (typeof slug !== 'string' || slug.length === 0) {
    throw new Error(`Publish preflight failed: ${label} is missing.`);
  }
  if (!READABLE_SLUG_PATTERN.test(slug)) {
    throw new Error(`Publish preflight failed: ${label} "${slug}" is not a readable lowercase URL slug.`);
  }
  if (/^\d+$/.test(slug)) {
    throw new Error(`Publish preflight failed: ${label} "${slug}" is a numeric-only slug.`);
  }
}

export function validatePublishDraft({ entry, post, draftPath }) {
  const queueLabel = `queue entry ${entry?.id ?? 'unknown'}`;
  const queueSlug = entry?.slug;
  const draftSlug = post?.slug;
  const filenameSlug = basename(draftPath, extname(draftPath));

  validateReadableSlug(queueSlug, `${queueLabel} slug`);
  validateReadableSlug(draftSlug, `${queueLabel} draft slug`);
  validateReadableSlug(filenameSlug, `${queueLabel} draft filename slug`);

  if (queueSlug !== draftSlug) {
    throw new Error(`Publish preflight failed: queue slug "${queueSlug}" does not match draft slug "${draftSlug}".`);
  }
  if (queueSlug !== filenameSlug) {
    throw new Error(`Publish preflight failed: queue slug "${queueSlug}" does not match draft filename slug "${filenameSlug}".`);
  }
}

export function parseAndValidatePublishDraft({ entry, draftPath, source }) {
  const post = JSON.parse(source);
  validatePublishDraft({ entry, post, draftPath });
  return post;
}
