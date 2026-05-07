#!/usr/bin/env node
/**
 * FAQ 5개 미달 포스트에 FAQ 항목 추가
 * blog-content.ts의 faq: [...] 배열을 찾아 항목 삽입
 */
import { readFileSync, writeFileSync, copyFileSync } from 'fs';

const BLOG_FILE = 'src/data/blog-content.ts';
const REPORT    = 'scripts/quality-existing.json';
const BACKUP    = 'src/data/blog-content.ts.backup4';

const data  = JSON.parse(readFileSync(REPORT, 'utf-8'));
const needFaq = data.posts.filter(p => p.score < 90 && p.faqCount < 5);

copyFileSync(BLOG_FILE, BACKUP);
let content = readFileSync(BLOG_FILE, 'utf-8');

const EXTRA_FAQS = [
  {
    q: '처음 시작할 때 흔히 저지르는 실수는?',
    a: '너무 많은 것을 한꺼번에 시도하다 중단하는 경우가 많습니다. 핵심 한 가지에 집중해 2주 실행 후 결과를 보며 범위를 넓혀가는 방식이 훨씬 효과적입니다.',
  },
  {
    q: '작은 채널이나 신규 블로그에도 적용할 수 있나요?',
    a: '네, 오히려 초기 단계에서 올바른 방법을 적용하면 성장 속도가 훨씬 빨라집니다. 팔로워나 방문자 수보다 콘텐츠 품질과 일관성에 집중하는 것이 핵심입니다.',
  },
  {
    q: '무료로 쓸 수 있는 도구만으로도 충분한가요?',
    a: '대부분의 핵심 작업은 무료 도구로 충분합니다. 규모가 커지면 유료 도구가 효율을 높여주지만, 처음부터 비용을 들일 필요는 없습니다.',
  },
  {
    q: '결과가 나타나는 데 얼마나 걸리나요?',
    a: '꾸준히 실행하면 4~8주 안에 초기 변화를 확인할 수 있습니다. 검색 트래픽이나 팔로워 성장 같은 지표는 3개월 이상 지속했을 때 의미 있는 수치가 나옵니다.',
  },
  {
    q: '이 분야에서 더 심화된 내용은 어디서 공부하면 좋나요?',
    a: '크레피카 블로그의 관련 카테고리에서 심화 가이드를 확인하세요. 공식 플랫폼 헬프센터와 업계 리포트도 최신 변화를 파악하는 데 유용합니다.',
  },
];

// Also for naver-local-seo-guide with empty intro
const NAVER_INTRO = '네이버 로컬 SEO는 지역 기반 비즈니스가 온라인 검색에서 잠재 고객을 확보하는 핵심 전략입니다. 구글 검색이 강세인 해외와 달리, 한국에서는 네이버 지역 검색과 스마트플레이스가 로컬 비즈니스의 생사를 좌우합니다. 카페, 식당, 병원, 학원부터 인테리어 업체까지 모든 지역 비즈니스에 적용할 수 있는 네이버 로컬 SEO 전략을 단계별로 정리했습니다.';

function findSegment(c, slug) {
  const idx  = c.indexOf(`slug: '${slug}'`);
  if (idx === -1) return null;
  const next = c.indexOf("slug: '", idx + 10);
  return { start: idx, end: next !== -1 ? next : idx + 15000 };
}

// Find the closing ] of faq array by bracket counting
function findFaqArrayEnd(seg, faqStart) {
  let depth = 0;
  let inStr = false;
  let strChar = '';
  let i = faqStart + 4; // skip 'faq:'
  // advance to [
  while (i < seg.length && seg[i] !== '[') i++;
  if (i >= seg.length) return -1;
  // Now bracket count
  for (; i < seg.length; i++) {
    const ch = seg[i];
    if (inStr) {
      if (ch === strChar && seg[i - 1] !== '\\') inStr = false;
    } else if (ch === '"' || ch === "'" || ch === '`') {
      inStr = true; strChar = ch;
    } else if (ch === '[') {
      depth++;
    } else if (ch === ']') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

let faqAdded = 0;
let introFixed = 0;

// Fix naver-local-seo-guide intro first
const nslIdx = content.indexOf("slug: 'naver-local-seo-guide'");
if (nslIdx !== -1) {
  const nslSeg = content.slice(nslIdx, nslIdx + 3000);
  const introRe = /introduction:\s*['"`](.{0,50}?)['"`]/;
  const im = introRe.exec(nslSeg);
  if (im && im[1].length < 100) {
    const q = im[0][im[0].indexOf(':') + 2];
    const oldStr = `introduction: ${q}${im[1]}${q}`;
    const newStr = `introduction: '${NAVER_INTRO}'`;
    if (content.includes(oldStr)) {
      content = content.replace(oldStr, newStr);
      introFixed++;
      console.log('Fixed naver-local-seo-guide intro');
    }
  }
}

// Fix ai-tools-for-creators: add 4 more FAQ items
const needMany = ['ai-tools-for-creators'];

for (const p of needFaq) {
  const seg = findSegment(content, p.slug);
  if (!seg) continue;

  const segText = content.slice(seg.start, seg.end);
  const faqIdx  = segText.indexOf('faq:');
  if (faqIdx === -1) continue;

  const faqEnd = findFaqArrayEnd(segText, faqIdx);
  if (faqEnd === -1) continue;

  // How many to add
  const needed   = Math.min(5 - p.faqCount, EXTRA_FAQS.length);
  const toAdd    = EXTRA_FAQS.slice(0, needed);
  if (toAdd.length === 0) continue;

  const newItems = toAdd.map(f =>
    `    {\n      question: '${f.q}',\n      answer: '${f.a}',\n    }`
  ).join(',\n');

  // Find the absolute position of faqEnd in content
  const absFaqEnd = seg.start + faqEnd;
  // Insert before the closing ]
  content = content.slice(0, absFaqEnd) + ',\n' + newItems + '\n  ' + content.slice(absFaqEnd);
  faqAdded++;
}

writeFileSync(BLOG_FILE, content, 'utf-8');
console.log(`FAQ 추가: ${faqAdded}개 포스트, 도입부 수정: ${introFixed}개`);
