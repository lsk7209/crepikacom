#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

let c = readFileSync('src/data/blog-content.ts', 'utf-8');

// Fix description (remove duplicates from earlier fix passes)
const oldDesc = "구글 SGE와 AI 오버뷰 시대, 이제는 클릭이 아닌 답변이 핵심입니다. AEO 최적화 전략과 구조화된 데이터 활용법을 공개합니다. 단계별 실전 방법을 체계적으로 정리했습니다. 실전 경험을 바탕으로 정리했습니다. 실전 경험을 바탕으로 정리했습니다.";
const newDesc = "구글 SGE와 AI 오버뷰 시대에서 클릭이 아닌 답변이 핵심입니다. AEO 최적화 전략과 구조화된 데이터 활용법, AI 답변 엔진에 인용되는 콘텐츠 작성법을 단계별로 안내합니다.";
if (c.includes(oldDesc)) {
  c = c.replace(oldDesc, newDesc);
  console.log('Description fixed');
}

// Add 3 sections before conclusion
const target = "conclusion: `이제 마케터의 목표는 클릭 수만이 아니라";

const newSectionsBlock = `        {
          heading: 'AEO 콘텐츠 구조 설계: 질문-답변 패턴 적용',
          content: \`AI 답변 엔진이 콘텐츠를 채택하는 패턴은 명확합니다. 섹션 첫 줄에 핵심 답변을 먼저 제시하고, 이어서 근거와 예시를 제공하는 구조가 가장 효과적입니다.

**AEO 친화적 섹션 구조:**
1. **핵심 답변 (1~2문장):** "~는 ~입니다" 형태의 직접 답변
2. **근거 설명 (2~4문장):** 데이터나 논리로 뒷받침
3. **실행 단계 (불릿 리스트):** 구체적 실행 방법 3~5가지
4. **예시 또는 주의사항 (1~2문장):** 실수나 모범 사례

이 구조를 모든 섹션에 일관되게 적용하면 AI가 해당 콘텐츠를 답변 출처로 선택할 확률이 높아집니다. 섹션당 300~500자를 유지하는 것이 최적입니다.\`
        },
        {
          heading: 'FAQ 스키마와 구조화 데이터 실전 적용',
          content: \`FAQ 스키마는 AEO의 핵심 기술입니다. 구글 AI Overviews와 Perplexity는 FAQ 스키마가 적용된 콘텐츠를 우선 참조하는 경향이 있습니다.

**FAQ 스키마 적용 단계:**
1. 가장 자주 묻는 질문 5~7개를 글 하단에 배치
2. 질문은 실제 검색어 형태로 작성 (예: "AEO와 SEO의 차이는?")
3. 답변은 50~150자 이내로 명확하게
4. JSON-LD 형식으로 FAQ 스키마 코드 삽입
5. Google Rich Results Test로 스키마 유효성 검증

FAQ 항목 5~7개가 15개의 짧은 답변보다 AI 채택률이 높습니다. 질을 양보다 우선시하세요.\`
        },
        {
          heading: 'AI 오버뷰 시대 트래픽 방어 전략',
          content: \`구글 AI Overviews 확산으로 많은 블로거가 오가닉 트래픽 감소를 경험하고 있습니다. 하지만 이를 기회로 전환하는 전략이 있습니다.

**트래픽 방어 3가지 핵심 방법:**

**1. AI 인용 소스가 되기**
AI가 답변할 때 내 콘텐츠를 출처로 인용하면 브랜드 인지도가 올라갑니다. AEO 최적화로 인용될수록 AI 오버뷰에서 노출이 늘어납니다.

**2. AI가 생성하기 어려운 콘텐츠 강화**
개인 경험담, 최신 사례 연구, 전문가 인터뷰처럼 AI가 직접 만들기 어려운 콘텐츠를 늘리면 클릭을 유지할 수 있습니다.

**3. 미드펀넬 키워드 공략**
구매·비교·선택 단계의 키워드는 AI 오버뷰 커버리지가 낮아 클릭률이 유지됩니다. 단순 정보성 키워드보다 전환 의도가 있는 키워드를 타깃하세요.\`
        },
        {
`;

if (c.includes(target)) {
  // Find the position of target and insert new sections block before it
  // First find the position of `sections: [` which comes before the first heading
  // We need to insert before the conclusion: ` line
  const sectionsEndRe = /(\s*\},\s*\n)(\s*\],\s*\n\s*conclusion:)/;
  const segStart = c.indexOf("slug: 'aeo-search-future-guide'");
  const segEnd   = c.indexOf("slug: '", segStart + 10);
  const seg      = c.slice(segStart, segEnd);

  // Find the end of the sections array (the ], before conclusion:)
  const sectionsEndIdx = seg.indexOf('\n      ],\n      conclusion:');
  if (sectionsEndIdx !== -1) {
    const absIdx = segStart + sectionsEndIdx;
    // Insert new sections before the closing ], of sections array
    const insertStr = `\n        },\n` + newSectionsBlock;
    // Find the last section's closing }
    // The last section ends with: }\n      ],
    const lastSectionClose = seg.lastIndexOf('\n        }');
    if (lastSectionClose !== -1) {
      const absClose = segStart + lastSectionClose + '\n        }'.length;
      c = c.slice(0, absClose) + ',\n' + newSectionsBlock + c.slice(absClose);
      console.log('Added 3 sections successfully');
    } else {
      console.log('Could not find last section close');
    }
  } else {
    console.log('Could not find sections end');
  }
} else {
  console.log('Target string not found:', target.substring(0, 50));
}

writeFileSync('src/data/blog-content.ts', c, 'utf-8');
