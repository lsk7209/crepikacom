import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { readFileSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const siteUrl = "https://crepika.com";
const ogImage = `${siteUrl}/og-image.png`;
const toolQueueFile = join(root, "scripts", "tool-queue.json");
const authorProfiles = {
  "\uC774\uC9C0\uC218": {
    id: "leejisu",
    image: "/images/avatar-leejisu.svg",
    description:
      "\uC218\uBC31 \uBA85\uC758 \uD06C\uB9AC\uC5D0\uC774\uD130\u00B7\uBE0C\uB79C\uB4DC SNS \uC131\uC7A5\uC744 \uCEE8\uC124\uD305\uD55C \uC18C\uC15C \uBBF8\uB514\uC5B4 \uC2A4\uD398\uC15C\uB9AC\uC2A4\uD2B8.",
  },
  "\uAE40\uBBFC\uD601": {
    id: "kimminhy",
    image: "/images/avatar-kimminhy.svg",
    description:
      "10\uB144\uCC28 \uB514\uC9C0\uD138 \uB9C8\uCF00\uD130\uC774\uC790 SEO \uC804\uB7B5\uAC00. \uB370\uC774\uD130 \uAE30\uBC18 \uCF58\uD150\uCE20 \uCD5C\uC801\uD654 \uC804\uBB38\uAC00.",
  },
  "\uBC15\uC900\uC601": {
    id: "parkjy",
    image: "/images/avatar-parkjy.svg",
    description:
      "\uD06C\uB808\uD53C\uCE74 \uC218\uC11D \uAC1C\uBC1C\uC790. \uBE0C\uB77C\uC6B0\uC800 \uAE30\uBC18 \uB3C4\uAD6C \uC131\uB2A5\uACFC \uC0AC\uC6A9\uC790 \uB370\uC774\uD130 \uBCF4\uC548\uC744 \uC124\uACC4\uD569\uB2C8\uB2E4.",
  },
};
const categoryLabels = {
  guide: "\uAC00\uC774\uB4DC",
  tips: "\uD301 & \uD2B8\uB9AD",
  insights: "\uC778\uC0AC\uC774\uD2B8",
  "case-study": "\uCF00\uC774\uC2A4 \uC2A4\uD130\uB514",
};
const securityTxt = `Contact: mailto:support@crepika.com
Preferred-Languages: ko, en
Canonical: ${siteUrl}/.well-known/security.txt
Policy: ${siteUrl}/privacy
Expires: 2027-06-10T00:00:00Z
`;

const alwaysPublishedToolPaths = new Set([
  "/tools/text-counter",
  "/tools/byte-counter",
  "/tools/lorem-generator",
  "/tools/webp-converter",
  "/tools/insta-spacer",
  "/tools/hashtag-mixer",
  "/tools/qr-generator",
]);

const toolIdAliases = {
  "email-analytics": "ctr-calculator",
  "email-template": "text-counter",
  "hash-generator": "hashtag-mixer",
  "hashtag-generator": "hashtag-mixer",
  "instagram-spacer": "insta-spacer",
  "platform-compare": "utm-url-builder",
  "pricing-calculator": "adsense-rpm-calculator",
  "revenue-calculator": "adsense-rpm-calculator",
  "sns-analytics": "ctr-calculator",
  "sns-calendar": "utm-url-builder",
};

function loadPublishedQueuedToolPaths() {
  try {
    const queue = JSON.parse(readFileSync(toolQueueFile, "utf8"));
    return new Set(
      queue
        .filter((item) => item.status === "published" && item.path)
        .map((item) => item.path),
    );
  } catch {
    return new Set();
  }
}

const publishedQueuedToolPaths = loadPublishedQueuedToolPaths();

function shouldRenderToolPage(canonical) {
  const path = new URL(canonical).pathname;
  return alwaysPublishedToolPaths.has(path) || publishedQueuedToolPaths.has(path);
}

const staticPages = [
  {
    path: "about/index.html",
    title: "크레피카 소개 | 무료 크리에이터 도구",
    description: "크레피카는 한국 크리에이터, 마케터, 블로거, 소규모 팀을 위한 브라우저 기반 무료 도구와 실전 발행 가이드를 제공합니다.",
    canonical: `${siteUrl}/about`,
    heading: "크레피카 소개",
    body: [
      "크레피카는 로그인 없이 빠르게 발행 전 점검을 끝내고 싶은 크리에이터를 위한 유틸리티 사이트입니다.",
      "글자수 세기, 한글 바이트 확인, WebP 변환, QR 코드 생성, 인스타그램 줄바꿈, 해시태그 조합, 실전 발행 가이드를 중심으로 구성되어 있습니다.",
    ],
  },
  {
    path: "contact/index.html",
    title: "크레피카 문의 | 정정 요청과 도구 제안",
    description: "서비스 질문, 정정 요청, 오류 제보, 크리에이터 도구 제안이 있다면 크레피카에 문의하세요.",
    canonical: `${siteUrl}/contact`,
    heading: "문의",
    body: [
      "정정 요청, 서비스 질문, 도구 제안은 support@crepika.com으로 보내주세요.",
      "오류를 제보할 때는 페이지 URL, 브라우저, 기기, 기대한 결과와 실제 결과를 함께 적어주면 더 빠르게 확인할 수 있습니다.",
    ],
  },
  {
    path: "privacy/index.html",
    title: "개인정보처리방침 | 크레피카",
    description: "크레피카 개인정보처리방침은 브라우저 내 도구 처리, 분석, 쿠키, Google AdSense 이용 방식을 설명합니다.",
    canonical: `${siteUrl}/privacy`,
    heading: "개인정보처리방침",
    body: [
      "크레피카의 핵심 도구 입력값은 가능한 한 사용자의 브라우저 안에서 처리되도록 설계되어 있습니다.",
      "사이트 이용 현황을 이해하고 무료 도구 운영을 지원하기 위해 분석 도구와 Google AdSense 쿠키가 사용될 수 있습니다.",
      "사용자는 온라인 도구에 민감한 개인정보를 입력하기 전 필요성과 개인정보 영향을 직접 확인해야 합니다.",
    ],
  },
  {
    path: "terms/index.html",
    title: "이용약관 | 크레피카",
    description: "크레피카 이용약관은 무료 온라인 크리에이터 도구의 사용 범위, 제한, 책임, 광고 고지를 안내합니다.",
    canonical: `${siteUrl}/terms`,
    heading: "이용약관",
    body: [
      "크레피카 도구는 무료 생산성 보조 수단으로 제공됩니다. 사용자는 결과물을 실제로 발행하기 전에 직접 검토해야 합니다.",
      "권리 침해, 불법 자료 처리, 서비스 공격, 플랫폼 규칙 우회 목적으로 사이트를 사용해서는 안 됩니다.",
    ],
  },
  {
    path: "editorial-policy/index.html",
    title: "콘텐츠 작성 기준 | 크레피카",
    description: "크레피카가 SEO, SNS, 크리에이터 도구 콘텐츠를 작성하고 검수하는 기준입니다.",
    canonical: `${siteUrl}/editorial-policy`,
    heading: "콘텐츠 작성 기준",
    body: [
      "크레피카는 검색 의도, 실행 순서, 확인 가능한 참고 자료, 관련 도구 링크를 기준으로 콘텐츠를 작성합니다.",
      "오래된 정보, 잘못된 링크, 정책 변경 가능성이 있는 내용은 주기적으로 검토하며 정정 요청은 문의 페이지에서 받습니다.",
      "Google AdSense 자동광고가 노출될 수 있지만 광고 노출 여부는 도구 결과나 편집 추천 내용에 영향을 주지 않습니다.",
    ],
  },
  {
    path: "tool-data-policy/index.html",
    title: "도구 데이터 처리 방식 | 크레피카",
    description: "크레피카 무료 도구가 입력값을 어떻게 처리하고 사용자 데이터를 보호하는지 안내합니다.",
    canonical: `${siteUrl}/tool-data-policy`,
    heading: "도구 데이터 처리 방식",
    body: [
      "크레피카 주요 도구는 가능한 한 브라우저 안에서 처리되도록 설계되어 빠른 사용성과 개인정보 노출 최소화를 목표로 합니다.",
      "사용자는 민감정보 입력을 피해야 하며 도구 결과는 발행 전 직접 검토해야 하는 보조 자료입니다.",
      "사이트 개선을 위해 GA4와 Google AdSense 자동광고 스크립트가 로드될 수 있습니다.",
    ],
  },
  {
    path: "blog/index.html",
    title: "크레피카 블로그 | SEO와 크리에이터 워크플로우 가이드",
    description: "SEO, SNS 마케팅, 이미지 최적화, 콘텐츠 워크플로우, 무료 크리에이터 도구 활용법을 다루는 크레피카 가이드입니다.",
    canonical: `${siteUrl}/blog`,
    heading: "크레피카 블로그",
    body: [
      "크레피카 블로그는 실전 SEO, SNS 마케팅, 크리에이터 워크플로우, 이미지 최적화, 발행 점검 주제를 다룹니다.",
      "각 글은 사이트맵과 RSS 피드에 연결되어 검색엔진이 전체 콘텐츠 아카이브를 발견할 수 있게 구성되어 있습니다.",
    ],
  },
];

const blogHubs = [
  {
    slug: "seo",
    title: "SEO 콘텐츠 최적화 허브",
    description: "검색 노출, 구조화 데이터, 사이트맵, 메타 태그, 내부 링크를 한 번에 점검하는 SEO 가이드 모음입니다.",
    match: /seo|search|google|naver|sitemap|robots|schema|canonical|meta|검색|네이버|구글/i,
    tools: ["/tools/seo-title-length-checker", "/tools/meta-description-checker", "/tools/h-tag-structure-checker"],
  },
  {
    slug: "instagram",
    title: "인스타그램 콘텐츠 운영 허브",
    description: "인스타그램 캡션, 해시태그, 릴스, 스토리, 프로필 최적화를 실행 중심으로 정리한 가이드 모음입니다.",
    match: /instagram|insta|reels|hashtag|caption|인스타|인스타그램|릴스|해시태그|캡션/i,
    tools: ["/tools/insta-spacer", "/tools/hashtag-mixer", "/tools/instagram-caption-builder"],
  },
  {
    slug: "adsense",
    title: "애드센스 수익화 준비 허브",
    description: "애드센스 검수, RPM 계산, 콘텐츠 품질, 정책 페이지, 자동광고 운영을 점검하는 수익화 가이드 모음입니다.",
    match: /adsense|rpm|ad|revenue|monetization|광고|수익|애드센스|정책/i,
    tools: ["/tools/adsense-rpm-calculator", "/tools/adsense-cpc-calculator", "/tools/eeat-signal-checker"],
  },
  {
    slug: "creator-tools",
    title: "크리에이터 무료 도구 허브",
    description: "글자수, 바이트, WebP, QR, UTM, CTR처럼 발행 전후에 바로 쓰는 무료 브라우저 도구 모음입니다.",
    match: /tool|tools|creator|webp|qr|utm|ctr|counter|도구|크리에이터|글자수|바이트/i,
    tools: ["/tools/text-counter", "/tools/byte-counter", "/tools/webp-converter", "/tools/qr-generator"],
  },
];

const sharedToolReferences = [
  ["Google Search Central", "https://developers.google.com/search/docs"],
  ["schema.org", "https://schema.org"],
  ["MDN Web Docs", "https://developer.mozilla.org"],
];

const toolPageGuidance = {
  "text-counter": {
    body: [
      "텍스트 카운터는 제목, 메타 설명, SNS 캡션, 블로그 초안을 발행하기 전에 실제 길이를 확인하는 도구입니다. 단순히 글자 수만 보는 것이 아니라 공백 포함 여부, 줄 수, 단어 수, 한글이 섞인 문장의 바이트 감각까지 함께 점검하면 플랫폼별 잘림 위험을 줄일 수 있습니다.",
      "블로그 제목은 핵심 키워드가 앞부분에 있고 독자가 얻는 결과가 분명해야 합니다. 인스타그램이나 유튜브 설명문은 첫 줄에서 맥락을 잡아야 하므로, 전체 분량보다 앞부분의 밀도와 가독성이 더 중요합니다. 이 페이지는 그런 발행 전 판단을 빠르게 반복할 수 있게 만든 작업용 기준점입니다.",
      "계산 결과가 권장 범위 안에 들어와도 그대로 발행하지 말고, 중복 표현, 의미 없는 수식어, 과도한 키워드 반복을 한 번 더 줄이세요. 특히 애드센스 검수 관점에서는 도구 결과보다 사용자가 실제로 얻는 설명, 예시, 정책 페이지, 문의 경로가 함께 보여야 얇은 콘텐츠로 보일 가능성이 낮아집니다.",
      "개인 메모, 고객 정보, 미공개 원고처럼 민감한 텍스트는 온라인 도구에 넣기 전 필요성을 먼저 판단하세요. 크레피카는 브라우저 기반 처리 원칙을 안내하지만, 최종 발행 책임은 사용자에게 있으므로 공개 가능한 문장만 넣고 결과를 직접 검토하는 흐름을 권장합니다.",
    ],
    links: [
      ["Google helpful content", "https://developers.google.com/search/docs/fundamentals/creating-helpful-content"],
      ["MDN Text formatting", "https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/HTML_text_fundamentals"],
    ],
  },
  "byte-counter": {
    body: [
      "한글 바이트 카운터는 한글, 영문, 숫자, 공백, 이모지가 섞인 문장의 실제 데이터 길이를 확인하는 도구입니다. 글자 수가 같아도 UTF-8 기준 바이트 수는 달라질 수 있기 때문에 검색 스니펫, 문자 발송, 플랫폼 입력 제한을 맞출 때 별도 점검이 필요합니다.",
      "네이버 블로그 제목이나 상품 설명처럼 한글 비중이 높은 문장은 눈으로 보기에는 짧아 보여도 바이트 기준으로는 빠르게 길어집니다. 발행 전에는 제목, 요약, 버튼 문구, 이미지 대체 텍스트를 각각 나누어 계산하고, 중요한 단어가 잘리지 않는지 실제 미리보기 화면에서 확인하는 것이 좋습니다.",
      "바이트 수만 맞추는 방식은 좋은 콘텐츠를 보장하지 않습니다. 사용자가 왜 이 문장을 읽어야 하는지, 어떤 행동을 해야 하는지, 어떤 근거를 참고했는지가 함께 있어야 페이지 품질이 올라갑니다. 크레피카는 길이 확인을 보조하고, 최종 표현은 사용자가 맥락에 맞게 다듬는 흐름을 전제로 합니다.",
      "이모지와 특수문자는 플랫폼마다 렌더링 폭과 의미가 다릅니다. 모바일 검색 결과나 SNS 카드에서 과도하게 쓰면 신뢰도가 떨어질 수 있으므로 핵심 키워드, 브랜드명, 구체적 혜택을 우선 배치한 뒤 장식 요소는 마지막에 줄이는 방식을 권장합니다.",
    ],
    links: [
      ["MDN Character encoding", "https://developer.mozilla.org/en-US/docs/Glossary/Character_encoding"],
      ["Google title links", "https://developers.google.com/search/docs/appearance/title-link"],
    ],
  },
  "lorem-generator": {
    body: [
      "로렘 입숨 생성기는 실제 원고가 준비되기 전에도 레이아웃, 카드 높이, 문단 간격, 버튼 주변 여백을 검토할 수 있게 해주는 시안용 텍스트 도구입니다. 디자인 단계에서 임시 문장을 넣으면 제목 길이와 본문 밀도가 화면에 어떤 영향을 주는지 빠르게 확인할 수 있습니다.",
      "더미 텍스트는 최종 콘텐츠가 아닙니다. 공개 페이지에 그대로 남아 있으면 사용자에게 도움이 되지 않고, 검색엔진에도 완성도가 낮은 페이지로 해석될 수 있습니다. 따라서 시안 검토 후에는 실제 독자 질문, 사용 예시, 참고 링크, 문의 경로가 포함된 원문으로 교체해야 합니다.",
      "한글 UI에서는 영문 로렘보다 조사, 띄어쓰기, 행간 차이가 크게 보입니다. 버튼, 카드, 목록, 모바일 문단을 테스트할 때는 한글 더미 텍스트도 함께 넣어 긴 단어 줄바꿈과 좁은 화면 overflow를 확인하세요. 특히 광고 심사 전에는 빈 섹션이나 반복 문구가 남지 않았는지 점검해야 합니다.",
      "크레피카의 생성 결과는 문장 밀도 테스트용 보조 자료입니다. 법률, 의료, 금융, 정책 안내처럼 정확성이 필요한 문서에는 더미 텍스트를 사용하지 말고, 담당자가 검증한 원문과 최신 공식 자료를 넣어야 합니다.",
    ],
    links: [
      ["Google thin content guidance", "https://developers.google.com/search/docs/fundamentals/creating-helpful-content"],
      ["MDN Responsive design", "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design"],
    ],
  },
  "webp-converter": {
    body: [
      "WebP 변환기는 JPG나 PNG 이미지를 더 가벼운 웹용 포맷으로 바꾸어 페이지 로딩 부담을 줄이는 도구입니다. 이미지가 큰 블로그, 랜딩 페이지, 포트폴리오에서는 대표 이미지 하나만 최적화해도 첫 화면 표시 속도와 모바일 데이터 사용량이 달라질 수 있습니다.",
      "이미지 최적화는 파일 형식만 바꾸는 작업이 아닙니다. 실제 표시 크기에 맞는 해상도, 의미 있는 파일명, 이미지 대체 텍스트, 압축 품질, 원본 보관 정책을 함께 정해야 합니다. 크레피카는 변환을 빠르게 처리하지만, 어떤 이미지를 어떤 위치에 쓸지는 발행자가 직접 판단해야 합니다.",
      "애드센스 승인 관점에서는 이미지가 많아도 설명이 부족하면 얇은 페이지로 보일 수 있습니다. 변환한 이미지 주변에는 촬영 맥락, 비교 기준, 사용 방법, 저작권 상태, 관련 참고 링크를 충분히 적어 사용자가 이미지를 이해할 수 있게 해야 합니다.",
      "브라우저나 CMS 환경에 따라 WebP 지원 방식이 다를 수 있으므로, 중요한 페이지는 변환 후 실제 기기에서 표시 여부를 확인하세요. 썸네일, OG 이미지, 본문 이미지가 각각 다른 크기로 쓰인다면 용도별 파일을 나누는 편이 운영에 유리합니다.",
    ],
    links: [
      ["MDN WebP", "https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types#webp"],
      ["Google image SEO", "https://developers.google.com/search/docs/appearance/google-images"],
      ["web.dev images", "https://web.dev/learn/images"],
    ],
  },
  "insta-spacer": {
    body: [
      "인스타 줄바꿈 포매터는 캡션 문단을 읽기 좋게 정리해 모바일 화면에서 핵심 문장이 묻히지 않도록 돕는 도구입니다. 긴 문장을 한 덩어리로 올리면 저장, 댓글, 프로필 클릭을 유도하기 어렵기 때문에 첫 줄, 본문, CTA, 해시태그 영역을 분리해 보는 것이 좋습니다.",
      "줄바꿈은 장식이 아니라 정보 구조입니다. 첫 문장은 독자의 문제를 직접 말하고, 다음 문단은 경험이나 근거를 제시하며, 마지막 문단은 저장, 댓글, 링크 클릭 같은 다음 행동을 명확하게 안내해야 합니다. 크레피카는 그 구조를 깨지지 않게 복사하기 쉬운 형태로 정리합니다.",
      "플랫폼 표시 방식은 앱 버전과 기기마다 달라질 수 있습니다. 변환한 캡션은 게시 직전에 미리보기로 확인하고, 과도한 공백이나 특수문자가 브랜드 톤을 해치지 않는지 점검하세요. 민감한 개인 정보나 비공개 캠페인 문구는 공개 전 내부 검토를 거치는 편이 안전합니다.",
      "애드센스 사이트의 SNS 안내 페이지에 이 도구를 연결할 때는 단순 사용법만 두지 말고, 실제 캡션 예시, 수정 전후 비교, 플랫폼 정책 참고 링크, 문의 경로를 함께 제공하세요. 그래야 도구 페이지가 계산 기능만 있는 빈 화면처럼 보이지 않습니다.",
    ],
    links: [
      ["Instagram help", "https://help.instagram.com/"],
      ["Meta Business Help", "https://www.facebook.com/business/help"],
      ["Google helpful content", "https://developers.google.com/search/docs/fundamentals/creating-helpful-content"],
    ],
  },
  "hashtag-mixer": {
    body: [
      "해시태그 믹서는 반복 사용하던 태그 묶음을 정리하고 순서를 바꾸어 SNS 게시 전 검토 시간을 줄이는 도구입니다. 같은 태그를 그대로 붙여넣기보다 주제 태그, 세부 태그, 브랜드 태그, 캠페인 태그를 나누어 관리하면 콘텐츠별 검색 의도에 더 잘 맞출 수 있습니다.",
      "태그 수가 많다고 항상 도달이 좋아지는 것은 아닙니다. 게시물 본문과 관련 없는 대형 태그를 과하게 넣으면 독자의 신뢰가 떨어지고, 플랫폼이 스팸성 신호로 판단할 수 있습니다. 믹서 결과를 받은 뒤에는 실제 게시물 주제와 맞지 않는 태그를 직접 제거하세요.",
      "좋은 해시태그 운영은 실험 기록이 필요합니다. 날짜, 게시물 유형, 사용한 태그 묶음, 노출, 저장, 댓글, 프로필 클릭을 함께 기록하면 다음 게시물에서 어떤 조합을 유지할지 판단하기 쉽습니다. 크레피카는 태그 정리를 돕고, 성과 해석은 실제 플랫폼 인사이트를 기준으로 해야 합니다.",
      "도구 결과를 상업 캠페인에 사용할 때는 브랜드 가이드, 광고 표기, 협찬 고지, 플랫폼 커뮤니티 규정을 함께 확인하세요. 특히 의료, 금융, 투자, 법률처럼 민감한 주제는 인기 태그보다 정확한 고지와 근거가 우선입니다.",
    ],
    links: [
      ["Instagram help", "https://help.instagram.com/"],
      ["Meta Business Help", "https://www.facebook.com/business/help"],
      ["Google Search Central", "https://developers.google.com/search/docs"],
    ],
  },
  "qr-generator": {
    body: [
      "QR 코드 생성기는 오프라인 안내문, 명함, 포스터, 매장 메뉴, 이벤트 배너를 온라인 페이지와 연결할 때 쓰는 도구입니다. 긴 URL을 직접 입력하게 하는 대신 스마트폰 카메라로 빠르게 이동하게 만들 수 있어 현장 전환 흐름을 단순하게 만듭니다.",
      "QR을 만들기 전에는 연결할 URL이 정확한지, 모바일에서 열리는지, 개인정보 입력 화면이 있다면 고지가 충분한지 먼저 확인해야 합니다. 인쇄 후에는 코드를 바꾸기 어렵기 때문에 최종 파일을 내려받기 전에 실제 기기로 테스트 스캔을 반복하는 것이 중요합니다.",
      "마케팅용 QR은 단순 이미지가 아니라 약속입니다. 사용자가 스캔했을 때 무엇을 얻는지 포스터 주변 문구에 분명히 적고, 연결 페이지에는 행사명, 기간, 문의처, 개인정보 처리 안내, 오류 시 대체 경로를 제공해야 신뢰를 얻을 수 있습니다.",
      "짧은 URL이나 UTM을 붙인 캠페인 URL을 사용할 때는 추적 목적과 분석 도구 설정을 내부 기준에 맞춰 관리하세요. 크레피카는 QR 이미지를 생성하지만, 링크 소유권과 연결 페이지의 법적 고지는 발행자가 책임지고 확인해야 합니다.",
    ],
    links: [
      ["MDN URL", "https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/What_is_a_URL"],
      ["Google Analytics campaign URLs", "https://support.google.com/analytics/answer/10917952"],
      ["Google Search Central", "https://developers.google.com/search/docs"],
    ],
  },
};

function getToolIdFromCanonical(canonical) {
  return new URL(canonical).pathname.split("/").filter(Boolean).at(-1) ?? "";
}

function buildToolPageBody({ canonical, description, heading }) {
  const id = getToolIdFromCanonical(canonical);
  return toolPageGuidance[id]?.body ?? [
    `${heading} 도구는 크리에이터와 마케터가 발행 전 반복 작업을 줄이기 위해 사용하는 브라우저 기반 유틸리티입니다. 결과를 바로 복사할 수 있지만, 최종 게시 전에는 실제 플랫폼 화면과 독자 맥락을 함께 확인해야 합니다.`,
    description,
    "도구 결과만 있는 페이지는 사용자에게 충분한 설명을 주기 어렵습니다. 사용 목적, 입력 전 주의사항, 결과 해석 방법, 관련 정책 페이지, 문의 경로를 함께 제공하면 검색엔진과 방문자가 페이지의 역할을 더 명확하게 이해할 수 있습니다.",
    "크레피카는 무료 도구, 편집 가이드, 개인정보처리방침, 이용약관, RSS, 사이트맵을 함께 제공해 자바스크립트 렌더링 없이도 기본 정보를 확인할 수 있게 구성합니다. 광고가 노출되더라도 도구 결과나 편집 판단에는 영향을 주지 않습니다.",
  ];
}

function buildToolReferenceLinks(canonical) {
  const id = getToolIdFromCanonical(canonical);
  return [...(toolPageGuidance[id]?.links ?? []), ...sharedToolReferences];
}

const toolPages = [
  ["tools/text-counter/index.html", "Text Counter | Crepika", "Count characters, words, lines, and spacing for titles, captions, blog drafts, and meta descriptions.", `${siteUrl}/tools/text-counter`, "Text Counter"],
  ["tools/byte-counter/index.html", "Korean Byte Counter | Crepika", "Check UTF-8 byte length for Korean and English text used in platform fields, SMS, and metadata.", `${siteUrl}/tools/byte-counter`, "Korean Byte Counter"],
  ["tools/lorem-generator/index.html", "Lorem Generator | Crepika", "Generate placeholder text for layout checks, mockups, cards, and page drafts.", `${siteUrl}/tools/lorem-generator`, "Lorem Generator"],
  ["tools/webp-converter/index.html", "WebP Converter | Crepika", "Convert image assets to WebP in the browser to support lighter pages and better publishing workflows.", `${siteUrl}/tools/webp-converter`, "WebP Converter"],
  ["tools/insta-spacer/index.html", "Instagram Spacer | Crepika", "Format Instagram captions with cleaner line breaks and readable paragraph spacing.", `${siteUrl}/tools/insta-spacer`, "Instagram Spacer"],
  ["tools/hashtag-mixer/index.html", "Hashtag Mixer | Crepika", "Mix hashtag groups, reduce repetition, and prepare SNS post tag sets faster.", `${siteUrl}/tools/hashtag-mixer`, "Hashtag Mixer"],
  ["tools/qr-generator/index.html", "QR Code Generator | Crepika", "Create QR codes for URLs and short text without a login step.", `${siteUrl}/tools/qr-generator`, "QR Code Generator"],
  ["tools/seo-title-length-checker/index.html", "SEO Title Length Checker | Crepika", "Check title length, keyword position, and search snippet readability before publishing.", `${siteUrl}/tools/seo-title-length-checker`, "SEO Title Length Checker"],
  ["tools/meta-description-checker/index.html", "Meta Description Checker | Crepika", "Check meta description length, keyword placement, CTA clarity, and snippet quality.", `${siteUrl}/tools/meta-description-checker`, "Meta Description Checker"],
  ["tools/slug-generator/index.html", "URL Slug Generator | Crepika", "Convert article and tool titles into readable lowercase URL slugs.", `${siteUrl}/tools/slug-generator`, "URL Slug Generator"],
  ["tools/utm-url-builder/index.html", "UTM URL Builder | Crepika", "Build clean campaign tracking URLs for GA4 without a login step.", `${siteUrl}/tools/utm-url-builder`, "UTM URL Builder"],
  ["tools/ctr-calculator/index.html", "CTR Calculator | Crepika", "Calculate click-through rate from impressions and clicks for search, ads, email, and social links.", `${siteUrl}/tools/ctr-calculator`, "CTR Calculator"],
  ["tools/adsense-rpm-calculator/index.html", "AdSense RPM Calculator | Crepika", "Calculate page RPM from estimated earnings and pageviews for blog revenue checks.", `${siteUrl}/tools/adsense-rpm-calculator`, "AdSense RPM Calculator"],
  ["tools/h-tag-structure-checker/index.html", "H Tag Structure Checker | Crepika", "Check H1, H2, and H3 hierarchy for SEO-friendly article structure.", `${siteUrl}/tools/h-tag-structure-checker`, "H Tag Structure Checker"],
  ["tools/blog-outline-builder/index.html", "Blog Outline Builder | Crepika", "Build a structured H2 and H3 outline for SEO-friendly blog posts.", `${siteUrl}/tools/blog-outline-builder`, "Blog Outline Builder"],
  ["tools/article-word-count-planner/index.html", "Article Word Count Planner | Crepika", "Estimate a useful article length from section count and content depth.", `${siteUrl}/tools/article-word-count-planner`, "Article Word Count Planner"],
  ["tools/keyword-density-checker/index.html", "Keyword Density Checker | Crepika", "Check keyword frequency and density in article drafts.", `${siteUrl}/tools/keyword-density-checker`, "Keyword Density Checker"],
  ["tools/internal-link-anchor-planner/index.html", "Internal Link Anchor Planner | Crepika", "Plan natural internal link anchor text for blog articles.", `${siteUrl}/tools/internal-link-anchor-planner`, "Internal Link Anchor Planner"],
  ["tools/serp-snippet-preview/index.html", "SERP Snippet Preview | Crepika", "Preview title, description, and URL as a search result snippet.", `${siteUrl}/tools/serp-snippet-preview`, "SERP Snippet Preview"],
  ["tools/alt-text-helper/index.html", "Alt Text Helper | Crepika", "Draft useful image alt text from context and keyword.", `${siteUrl}/tools/alt-text-helper`, "Alt Text Helper"],
  ["tools/content-freshness-checklist/index.html", "Content Freshness Checklist | Crepika", "Check whether a blog post needs freshness updates.", `${siteUrl}/tools/content-freshness-checklist`, "Content Freshness Checklist"],
  ["tools/eeat-signal-checker/index.html", "E-E-A-T Signal Checker | Crepika", "Check experience, evidence, specificity, and author context signals.", `${siteUrl}/tools/eeat-signal-checker`, "E-E-A-T Signal Checker"],
  ["tools/blog-intro-hook-checker/index.html", "Blog Intro Hook Checker | Crepika", "Check whether a blog introduction gives readers a clear reason to continue.", `${siteUrl}/tools/blog-intro-hook-checker`, "Blog Intro Hook Checker"],
  ["tools/list-to-table-converter/index.html", "List to Table Converter | Crepika", "Convert delimited text lists into Markdown tables.", `${siteUrl}/tools/list-to-table-converter`, "List to Table Converter"],
  ["tools/markdown-table-builder/index.html", "Markdown Table Builder | Crepika", "Build a Markdown table template from columns and row count.", `${siteUrl}/tools/markdown-table-builder`, "Markdown Table Builder"],
  ["tools/source-link-organizer/index.html", "Source Link Organizer | Crepika", "Organize source names and URLs into a clean reference list.", `${siteUrl}/tools/source-link-organizer`, "Source Link Organizer"],
  ["tools/instagram-caption-builder/index.html", "Instagram Caption Builder | Crepika", "Build a structured Instagram caption with hook, body, and CTA.", `${siteUrl}/tools/instagram-caption-builder`, "Instagram Caption Builder"],
  ["tools/reels-hook-bank-builder/index.html", "Reels Hook Bank Builder | Crepika", "Generate short hook lines for Instagram Reels and short videos.", `${siteUrl}/tools/reels-hook-bank-builder`, "Reels Hook Bank Builder"],
  ["tools/youtube-title-length-checker/index.html", "YouTube Title Length Checker | Crepika", "Check YouTube title length, keyword position, and click signal.", `${siteUrl}/tools/youtube-title-length-checker`, "YouTube Title Length Checker"],
  ["tools/youtube-description-formatter/index.html", "YouTube Description Formatter | Crepika", "Format a YouTube description with summary, links, and chapters.", `${siteUrl}/tools/youtube-description-formatter`, "YouTube Description Formatter"],
  ["tools/shorts-script-timer/index.html", "Shorts Script Timer | Crepika", "Estimate speaking time for Shorts, Reels, and short-form scripts.", `${siteUrl}/tools/shorts-script-timer`, "Shorts Script Timer"],
  ["tools/thread-post-splitter/index.html", "Thread Post Splitter | Crepika", "Split long text into numbered thread posts within a character limit.", `${siteUrl}/tools/thread-post-splitter`, "Thread Post Splitter"],
  ["tools/linkedin-post-formatter/index.html", "LinkedIn Post Formatter | Crepika", "Format an idea into a LinkedIn post with hook, insight, and CTA.", `${siteUrl}/tools/linkedin-post-formatter`, "LinkedIn Post Formatter"],
  ["tools/hashtag-group-planner/index.html", "Hashtag Group Planner | Crepika", "Build hashtag groups by core topic, niche, discovery, and brand.", `${siteUrl}/tools/hashtag-group-planner`, "Hashtag Group Planner"],
  ["tools/hashtag-rotation-tracker/index.html", "Hashtag Rotation Tracker | Crepika", "Split hashtags into rotation sets for cleaner content testing.", `${siteUrl}/tools/hashtag-rotation-tracker`, "Hashtag Rotation Tracker"],
  ["tools/social-bio-length-checker/index.html", "Social Bio Length Checker | Crepika", "Check social profile bio length, audience, value, and CTA.", `${siteUrl}/tools/social-bio-length-checker`, "Social Bio Length Checker"],
  ["tools/creator-media-kit-checklist/index.html", "Creator Media Kit Checklist | Crepika", "Check creator media kit essentials for brand collaboration.", `${siteUrl}/tools/creator-media-kit-checklist`, "Creator Media Kit Checklist"],
  ["tools/collaboration-email-builder/index.html", "Collaboration Email Builder | Crepika", "Draft a creator collaboration email for brand outreach.", `${siteUrl}/tools/collaboration-email-builder`, "Collaboration Email Builder"],
  ["tools/comment-reply-template-builder/index.html", "Comment Reply Template Builder | Crepika", "Generate reusable reply templates for comments and questions.", `${siteUrl}/tools/comment-reply-template-builder`, "Comment Reply Template Builder"],
  ["tools/pinned-comment-cta-builder/index.html", "Pinned Comment CTA Builder | Crepika", "Create pinned comment CTA options for posts and videos.", `${siteUrl}/tools/pinned-comment-cta-builder`, "Pinned Comment CTA Builder"],
  ["tools/content-repurpose-planner/index.html", "Content Repurpose Planner | Crepika", "Plan how to repurpose one source content across multiple platforms.", `${siteUrl}/tools/content-repurpose-planner`, "Content Repurpose Planner"],
  ["tools/publishing-calendar-planner/index.html", "Publishing Calendar Planner | Crepika", "Build a simple content publishing calendar from topics and duration.", `${siteUrl}/tools/publishing-calendar-planner`, "Publishing Calendar Planner"],
  ["tools/hook-strength-checker/index.html", "Hook Strength Checker | Crepika", "Check hook strength for social posts and short-form content.", `${siteUrl}/tools/hook-strength-checker`, "Hook Strength Checker"],
  ["tools/caption-line-break-cleaner/index.html", "Caption Line Break Cleaner | Crepika", "Clean social caption line breaks for mobile readability.", `${siteUrl}/tools/caption-line-break-cleaner`, "Caption Line Break Cleaner"],
  ["tools/emoji-density-checker/index.html", "Emoji Density Checker | Crepika", "Check emoji count and density in social copy.", `${siteUrl}/tools/emoji-density-checker`, "Emoji Density Checker"],
  ["tools/sns-cta-library-builder/index.html", "SNS CTA Library Builder | Crepika", "Generate CTA lines for saves, comments, clicks, and follows.", `${siteUrl}/tools/sns-cta-library-builder`, "SNS CTA Library Builder"],
  ["tools/image-aspect-ratio-checker/index.html", "Image Aspect Ratio Checker | Crepika", "Calculate image aspect ratio and match common platform presets.", `${siteUrl}/tools/image-aspect-ratio-checker`, "Image Aspect Ratio Checker"],
  ["tools/thumbnail-size-planner/index.html", "Thumbnail Size Planner | Crepika", "Plan thumbnail size, ratio, safe area, and text length by platform.", `${siteUrl}/tools/thumbnail-size-planner`, "Thumbnail Size Planner"],
  ["tools/filename-seo-cleaner/index.html", "Filename SEO Cleaner | Crepika", "Clean image filenames into readable lowercase SEO-friendly names.", `${siteUrl}/tools/filename-seo-cleaner`, "Filename SEO Cleaner"],
  ["tools/batch-filename-planner/index.html", "Batch Filename Planner | Crepika", "Generate consistent batch filenames from image descriptions.", `${siteUrl}/tools/batch-filename-planner`, "Batch Filename Planner"],
  ["tools/image-compression-savings-calculator/index.html", "Image Compression Savings Calculator | Crepika", "Calculate per-image and total file size savings after compression.", `${siteUrl}/tools/image-compression-savings-calculator`, "Image Compression Savings Calculator"],
  ["tools/og-image-text-checker/index.html", "OG Image Text Checker | Crepika", "Check Open Graph image text length, specificity, and brand signal.", `${siteUrl}/tools/og-image-text-checker`, "OG Image Text Checker"],
  ["tools/color-contrast-checker/index.html", "Color Contrast Checker | Crepika", "Check text and background color contrast ratio for readable UI and content.", `${siteUrl}/tools/color-contrast-checker`, "Color Contrast Checker"],
  ["tools/brand-color-palette-notes/index.html", "Brand Color Palette Notes | Crepika", "Turn brand colors into practical palette role notes for UI and content.", `${siteUrl}/tools/brand-color-palette-notes`, "Brand Color Palette Notes"],
  ["tools/svg-data-uri-encoder/index.html", "SVG Data URI Encoder | Crepika", "Encode small SVG markup into a CSS-friendly data URI.", `${siteUrl}/tools/svg-data-uri-encoder`, "SVG Data URI Encoder"],
  ["tools/base64-image-size-estimator/index.html", "Base64 Image Size Estimator | Crepika", "Estimate image size overhead when embedding images as Base64.", `${siteUrl}/tools/base64-image-size-estimator`, "Base64 Image Size Estimator"],
  ["tools/exif-privacy-checklist/index.html", "EXIF Privacy Checklist | Crepika", "Check image publishing privacy risks from EXIF, GPS, faces, and visible details.", `${siteUrl}/tools/exif-privacy-checklist`, "EXIF Privacy Checklist"],
  ["tools/image-alt-batch-planner/index.html", "Image Alt Batch Planner | Crepika", "Draft page-aware alt text for multiple images at once.", `${siteUrl}/tools/image-alt-batch-planner`, "Image Alt Batch Planner"],
  ["tools/favicon-checklist-builder/index.html", "Favicon Checklist Builder | Crepika", "Build a favicon and app icon preparation checklist.", `${siteUrl}/tools/favicon-checklist-builder`, "Favicon Checklist Builder"],
  ["tools/open-graph-image-checklist/index.html", "Open Graph Image Checklist | Crepika", "Check OG image size, ratio, text length, and share-card readability.", `${siteUrl}/tools/open-graph-image-checklist`, "Open Graph Image Checklist"],
  ["tools/file-size-unit-converter/index.html", "File Size Unit Converter | Crepika", "Convert file size values between bytes, KB, MB, and GB.", `${siteUrl}/tools/file-size-unit-converter`, "File Size Unit Converter"],
  ["tools/utm-consistency-checker/index.html", "UTM Consistency Checker | Crepika", "Check campaign URLs for missing UTM fields and naming inconsistencies.", `${siteUrl}/tools/utm-consistency-checker`, "UTM Consistency Checker"],
  ["tools/url-encoder-decoder/index.html", "URL Encoder Decoder | Crepika", "Encode and decode URLs with Korean, spaces, and special characters.", `${siteUrl}/tools/url-encoder-decoder`, "URL Encoder Decoder"],
  ["tools/query-string-parser/index.html", "Query String Parser | Crepika", "Parse URL query parameters and check UTM fields, empty values, and duplicates.", `${siteUrl}/tools/query-string-parser`, "Query String Parser"],
  ["tools/link-cleanup-tool/index.html", "Link Cleanup Tool | Crepika", "Clean share URLs by keeping selected UTM parameters and removing extra tracking values.", `${siteUrl}/tools/link-cleanup-tool`, "Link Cleanup Tool"],
  ["tools/qr-campaign-url-builder/index.html", "QR Campaign URL Builder | Crepika", "Build UTM campaign URLs for offline QR code placements.", `${siteUrl}/tools/qr-campaign-url-builder`, "QR Campaign URL Builder"],
  ["tools/redirect-chain-notes-builder/index.html", "Redirect Chain Notes Builder | Crepika", "Document redirect flows and summarize redirect chain risk.", `${siteUrl}/tools/redirect-chain-notes-builder`, "Redirect Chain Notes Builder"],
  ["tools/canonical-url-checklist/index.html", "Canonical URL Checklist | Crepika", "Check canonical URL domain, path, query, and self-reference consistency.", `${siteUrl}/tools/canonical-url-checklist`, "Canonical URL Checklist"],
  ["tools/sitemap-url-batch-builder/index.html", "Sitemap URL Batch Builder | Crepika", "Convert path lists into canonical sitemap URL candidates.", `${siteUrl}/tools/sitemap-url-batch-builder`, "Sitemap URL Batch Builder"],
  ["tools/robots-rule-draft-builder/index.html", "Robots Rule Draft Builder | Crepika", "Draft robots.txt Allow, Disallow, and Sitemap rules.", `${siteUrl}/tools/robots-rule-draft-builder`, "Robots Rule Draft Builder"],
  ["tools/anchor-text-variation-builder/index.html", "Anchor Text Variation Builder | Crepika", "Generate natural anchor text variations for internal links.", `${siteUrl}/tools/anchor-text-variation-builder`, "Anchor Text Variation Builder"],
  ["tools/broken-link-outreach-template/index.html", "Broken Link Outreach Template | Crepika", "Draft a polite email for broken link replacement outreach.", `${siteUrl}/tools/broken-link-outreach-template`, "Broken Link Outreach Template"],
  ["tools/affiliate-disclosure-builder/index.html", "Affiliate Disclosure Builder | Crepika", "Draft transparent affiliate disclosure copy for content pages.", `${siteUrl}/tools/affiliate-disclosure-builder`, "Affiliate Disclosure Builder"],
  ["tools/campaign-naming-convention-builder/index.html", "Campaign Naming Convention Builder | Crepika", "Create consistent UTM campaign naming rules for GA4 reports.", `${siteUrl}/tools/campaign-naming-convention-builder`, "Campaign Naming Convention Builder"],
  ["tools/landing-page-cta-url-builder/index.html", "Landing Page CTA URL Builder | Crepika", "Build UTM URLs for landing page CTA placement tracking.", `${siteUrl}/tools/landing-page-cta-url-builder`, "Landing Page CTA URL Builder"],
  ["tools/conversion-rate-calculator/index.html", "Conversion Rate Calculator | Crepika", "Calculate conversion rate from visits and conversions.", `${siteUrl}/tools/conversion-rate-calculator`, "Conversion Rate Calculator"],
  ["tools/adsense-cpc-calculator/index.html", "AdSense CPC Calculator | Crepika", "Calculate estimated AdSense cost per click from earnings and ad clicks.", `${siteUrl}/tools/adsense-cpc-calculator`, "AdSense CPC Calculator"],
  ["tools/newsletter-growth-calculator/index.html", "Newsletter Growth Calculator | Crepika", "Forecast newsletter subscribers from growth and churn rates.", `${siteUrl}/tools/newsletter-growth-calculator`, "Newsletter Growth Calculator"],
  ["tools/engagement-rate-calculator/index.html", "Engagement Rate Calculator | Crepika", "Calculate SNS engagement rate from likes, comments, saves, and shares.", `${siteUrl}/tools/engagement-rate-calculator`, "Engagement Rate Calculator"],
  ["tools/content-roi-calculator/index.html", "Content ROI Calculator | Crepika", "Calculate content return on investment from cost and attributed revenue.", `${siteUrl}/tools/content-roi-calculator`, "Content ROI Calculator"],
  ["tools/break-even-calculator/index.html", "Break-even Calculator | Crepika", "Estimate required conversions from cost and profit per conversion.", `${siteUrl}/tools/break-even-calculator`, "Break-even Calculator"],
  ["tools/ab-test-sample-notes/index.html", "A/B Test Sample Notes | Crepika", "Compare two A/B test variants and produce a practical sample note.", `${siteUrl}/tools/ab-test-sample-notes`, "A/B Test Sample Notes"],
  ["tools/publishing-pace-calculator/index.html", "Publishing Pace Calculator | Crepika", "Calculate how long a queued publishing backlog will last.", `${siteUrl}/tools/publishing-pace-calculator`, "Publishing Pace Calculator"],
  ["tools/lead-magnet-math-calculator/index.html", "Lead Magnet Math Calculator | Crepika", "Estimate leads and sales from visitor, signup, and lead-to-sale rates.", `${siteUrl}/tools/lead-magnet-math-calculator`, "Lead Magnet Math Calculator"],
  ["tools/creator-pricing-calculator/index.html", "Creator Pricing Calculator | Crepika", "Estimate creator sponsorship fee ranges from reach and production effort.", `${siteUrl}/tools/creator-pricing-calculator`, "Creator Pricing Calculator"],
  ["tools/funnel-dropoff-calculator/index.html", "Funnel Dropoff Calculator | Crepika", "Calculate funnel conversion rates and identify the weakest step.", `${siteUrl}/tools/funnel-dropoff-calculator`, "Funnel Dropoff Calculator"],
  ["tools/keyword-opportunity-scorer/index.html", "Keyword Opportunity Scorer | Crepika", "Score keyword opportunities from intent, difficulty, and business fit.", `${siteUrl}/tools/keyword-opportunity-scorer`, "Keyword Opportunity Scorer"],
  ["tools/markdown-cleaner/index.html", "Markdown Cleaner | Crepika", "Clean markdown spacing, trailing spaces, and heading formatting.", `${siteUrl}/tools/markdown-cleaner`, "Markdown Cleaner"],
  ["tools/html-entity-converter/index.html", "HTML Entity Converter | Crepika", "Encode or decode common HTML entities for safer HTML text handling.", `${siteUrl}/tools/html-entity-converter`, "HTML Entity Converter"],
  ["tools/json-formatter/index.html", "JSON Formatter | Crepika", "Validate, pretty-print, and minify JSON for structured data and configuration review.", `${siteUrl}/tools/json-formatter`, "JSON Formatter"],
  ["tools/csv-to-markdown-table/index.html", "CSV to Markdown Table | Crepika", "Convert simple CSV rows into markdown tables for blogs and documents.", `${siteUrl}/tools/csv-to-markdown-table`, "CSV to Markdown Table"],
  ["tools/markdown-to-plain-text/index.html", "Markdown to Plain Text | Crepika", "Strip markdown syntax and keep readable plain text for reuse.", `${siteUrl}/tools/markdown-to-plain-text`, "Markdown to Plain Text"],
  ["tools/text-deduplicator/index.html", "Text Deduplicator | Crepika", "Remove duplicate lines while preserving original order.", `${siteUrl}/tools/text-deduplicator`, "Text Deduplicator"],
  ["tools/case-converter/index.html", "Case Converter | Crepika", "Convert text into lower, upper, title, kebab, snake, and camel case.", `${siteUrl}/tools/case-converter`, "Case Converter"],
  ["tools/regex-escape-tool/index.html", "Regex Escape Tool | Crepika", "Escape special regex characters for literal text matching.", `${siteUrl}/tools/regex-escape-tool`, "Regex Escape Tool"],
  ["tools/content-decay-monitor-sheet-builder/index.html", "Content Decay Monitor Sheet Builder | Crepika", "Build a content decay tracking table for stale page performance review.", `${siteUrl}/tools/content-decay-monitor-sheet-builder`, "Content Decay Monitor Sheet Builder"],
  ["tools/html-meta-tag-builder/index.html", "HTML Meta Tag Builder | Crepika", "Draft title, description, canonical, Open Graph, and Twitter meta tags.", `${siteUrl}/tools/html-meta-tag-builder`, "HTML Meta Tag Builder"],
  ["tools/jsonld-organization-builder/index.html", "Organization JSON-LD Builder | Crepika", "Generate Organization JSON-LD from site and profile information.", `${siteUrl}/tools/jsonld-organization-builder`, "Organization JSON-LD Builder"],
  ["tools/checklist-builder/index.html", "Checklist Builder | Crepika", "Convert notes into markdown checkbox checklists.", `${siteUrl}/tools/checklist-builder`, "Checklist Builder"],
  ["tools/meeting-notes-action-items/index.html", "Meeting Notes Action Items | Crepika", "Extract likely action items from meeting notes.", `${siteUrl}/tools/meeting-notes-action-items`, "Meeting Notes Action Items"],
  ["tools/prompt-brief-builder/index.html", "Prompt Brief Builder | Crepika", "Build a structured brief for writing, design, and development prompts.", `${siteUrl}/tools/prompt-brief-builder`, "Prompt Brief Builder"],
  ["tools/privacy-policy-input-checklist/index.html", "Privacy Policy Input Checklist | Crepika", "Create a checklist for data types handled by a site or tool.", `${siteUrl}/tools/privacy-policy-input-checklist`, "Privacy Policy Input Checklist"],
  ["tools/tool-idea-scorer/index.html", "Tool Idea Scorer | Crepika", "Score utility ideas by usefulness, search demand, differentiation, and build difficulty.", `${siteUrl}/tools/tool-idea-scorer`, "Tool Idea Scorer"],
  ["tools/faq-schema-builder/index.html", "FAQ Schema Builder | Crepika", "Convert visible questions and answers into FAQPage JSON-LD drafts for structured data review.", `${siteUrl}/tools/faq-schema-builder`, "FAQ Schema Builder"],
  ["tools/howto-schema-builder/index.html", "HowTo Schema Builder | Crepika", "Convert step-by-step instructions into HowTo JSON-LD drafts for procedural content.", `${siteUrl}/tools/howto-schema-builder`, "HowTo Schema Builder"],
  ["tools/blog-cta-checker/index.html", "Blog CTA Checker | Crepika", "Check whether a blog call-to-action is specific, action-oriented, and useful for readers.", `${siteUrl}/tools/blog-cta-checker`, "Blog CTA Checker"],
  ["tools/paragraph-readability-checker/index.html", "Paragraph Readability Checker | Crepika", "Find overly long paragraphs and mobile readability risks in article drafts.", `${siteUrl}/tools/paragraph-readability-checker`, "Paragraph Readability Checker"],
].map(([path, title, description, canonical, heading]) => ({
  path,
  title,
  description,
  canonical,
  heading,
  body: buildToolPageBody({ canonical, description, heading }),
  references: buildToolReferenceLinks(canonical),
})).filter((page) => shouldRenderToolPage(page.canonical));

function extractArrayLiteral(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) throw new Error(`Marker not found: ${marker}`);
  const assignmentIndex = source.indexOf("=", markerIndex);
  const start = source.indexOf("[", assignmentIndex);
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === quote) quote = "";
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      continue;
    }
    if (ch === "[") depth++;
    if (ch === "]") depth--;
    if (depth === 0) return source.slice(start, i + 1);
  }
  throw new Error("Array end not found");
}

function loadPosts() {
  const source = readFileSync(join(root, "src/data/blog-content.ts"), "utf8");
  const arrayLiteral = extractArrayLiteral(source, "export const BLOG_POSTS");
  const posts = vm.runInNewContext(`(${arrayLiteral})`, {});
  return posts.filter((post) => post?.slug && post?.title && post?.content?.sections?.length);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function stripMarkdown(value) {
  return String(value ?? "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`>#-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const trustedReferenceRules = [
  {
    test: /naver|네이버|smartstore|스마트스토어|searchadvisor/i,
    label: "Naver Search Advisor",
    url: "https://searchadvisor.naver.com/",
  },
  {
    test: /kakao|카카오/i,
    label: "Kakao Business",
    url: "https://business.kakao.com/",
  },
  {
    test: /instagram|facebook|meta|인스타그램|페이스북|메타/i,
    label: "Meta Business Help",
    url: "https://www.facebook.com/business/help",
  },
  {
    test: /youtube|shorts|유튜브|쇼츠/i,
    label: "YouTube Help",
    url: "https://support.google.com/youtube/",
  },
  {
    test: /ga4|analytics|분석|utm|ctr|roas/i,
    label: "Google Analytics Help",
    url: "https://support.google.com/analytics/",
  },
  {
    test: /adsense|rpm|광고|수익|monetization/i,
    label: "Google AdSense Help",
    url: "https://support.google.com/adsense/",
  },
  {
    test: /schema|json-ld|seo|search|google|검색|구조화|canonical|sitemap|robots/i,
    label: "Google Search Central",
    url: "https://developers.google.com/search/docs",
  },
];

function getTrustedReferences(post) {
  const haystack = [
    post.slug,
    post.title,
    post.description,
    post.category,
    ...(post.keywords ?? []),
  ].join(" ");
  const matched = trustedReferenceRules
    .filter((rule) => rule.test.test(haystack))
    .map(({ label, url }) => ({ label, url }));
  const references = matched.length
    ? matched
    : [{ label: "Google Search Central", url: "https://developers.google.com/search/docs" }];
  return references
    .filter((reference, index, list) => list.findIndex((item) => item.url === reference.url) === index)
    .slice(0, 3);
}

function renderArticleSupportLinks(post) {
  const references = getTrustedReferences(post)
    .map(
      (reference) =>
        `<li><a href="${escapeHtml(reference.url)}" rel="noopener noreferrer">${escapeHtml(reference.label)}</a></li>`,
    )
    .join("\n");
  const toolLinks = (post.relatedTools ?? [])
    .map((id) => `/tools/${toolIdAliases[id] ?? id}`)
    .filter((path) => alwaysPublishedToolPaths.has(path) || publishedQueuedToolPaths.has(path))
    .slice(0, 3)
    .map((path) => `<li><a href="${escapeHtml(path)}">${escapeHtml(path.replace("/tools/", ""))}</a></li>`)
    .join("\n");
  const actions =
    toolLinks ||
    '<li><a href="/tools/text-counter">Text Counter</a></li>\n<li><a href="/tools/meta-description-checker">Meta Description Checker</a></li>';

  return `<section class="panel"><h2>공식 참고 자료</h2><ul>${references}</ul><h2>다음 실행</h2><ul>${actions}<li><a href="/blog">관련 가이드 더 보기</a></li></ul></section>`;
}

function getHubForPost(post) {
  const haystack = [
    post.slug,
    post.title,
    post.description,
    post.category,
    ...(post.keywords ?? []),
  ].join(" ");
  return blogHubs.find((hub) => hub.match.test(haystack)) ?? blogHubs[0];
}

function renderArticleDecisionBlock(post) {
  const hub = getHubForPost(post);
  const keyword = post.keywords?.[0] || post.title;
  return `<section class="panel"><h2>실행 기준 요약</h2>
    <table><tbody>
      <tr><th>먼저 볼 것</th><td>${escapeHtml(post.description)}</td></tr>
      <tr><th>발행 전 점검</th><td>${escapeHtml((post.keywords ?? []).slice(0, 3).join(", "))}</td></tr>
      <tr><th>다음 학습</th><td><a href="/topics/${escapeHtml(hub.slug)}">${escapeHtml(hub.title)}</a></td></tr>
    </tbody></table>
    <h3>발행 전 체크리스트</h3>
    <ul>
      <li>${escapeHtml(keyword)}를 적용할 페이지나 채널을 하나만 정합니다.</li>
      <li>본문의 핵심 주장과 예시가 실제 실행 순서로 이어지는지 확인합니다.</li>
      <li>관련 도구로 제목, 설명, 링크, CTA를 발행 전에 한 번 더 점검합니다.</li>
    </ul>
  </section>`;
}

function estimateWordCount(post) {
  const raw = [
    post.content?.introduction,
    ...(post.content?.sections ?? []).flatMap((section) => [
      section.heading ?? section.title ?? "",
      section.content,
      ...(section.subsections?.flatMap((subsection) => [subsection.subheading, subsection.content]) ?? []),
    ]),
    post.content?.conclusion,
    ...(post.faq?.flatMap((item) => [item.question, item.answer]) ?? []),
  ].join(" ");

  return stripMarkdown(raw)
    .split(/\s+/)
    .filter(Boolean).length;
}

function makeAuthorSchema(authorName) {
  const name = authorName || "Crepika";
  const profile = authorProfiles[name] ?? {
    id: "crepika-editorial",
    image: "/og-image.png",
    description: "\uD06C\uB808\uD53C\uCE74 \uCF58\uD150\uCE20 \uD300",
  };

  return {
    "@type": "Person",
    "@id": `${siteUrl}/about#${profile.id}`,
    name,
    url: `${siteUrl}/about`,
    description: profile.description,
    image: `${siteUrl}${profile.image}`,
  };
}

function makePublisherSchema() {
  return {
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "\uD06C\uB808\uD53C\uCE74",
    alternateName: "Crepika",
    url: siteUrl,
    email: "support@crepika.com",
    areaServed: "KR",
    knowsLanguage: ["ko-KR", "en"],
    description:
      "\uAD6D\uB0B4 \uD06C\uB9AC\uC5D0\uC774\uD130\uB97C \uC704\uD55C \uBB34\uB8CC \uC628\uB77C\uC778 \uB3C4\uAD6C \uC11C\uBE44\uC2A4.",
    logo: {
      "@type": "ImageObject",
      url: ogImage,
      width: 1200,
      height: 630,
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@crepika.com",
      availableLanguage: ["Korean", "English"],
    },
    sameAs: [`${siteUrl}/rss.xml`, `${siteUrl}/llms.txt`],
  };
}

function makeWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: "\uD06C\uB808\uD53C\uCE74",
    alternateName: "Crepika",
    url: siteUrl,
    inLanguage: "ko-KR",
    publisher: { "@id": `${siteUrl}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/blog?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

function makeSiteIdentityStructuredData() {
  return [
    {
      "@context": "https://schema.org",
      ...makePublisherSchema(),
      member: Object.entries(authorProfiles).map(([name, profile]) => ({
        "@type": "Person",
        "@id": `${siteUrl}/about#${profile.id}`,
        name,
        url: `${siteUrl}/about`,
        description: profile.description,
        image: `${siteUrl}${profile.image}`,
        worksFor: { "@id": `${siteUrl}/#organization` },
      })),
    },
    makeWebsiteSchema(),
  ];
}

function makeArticleStructuredData(post) {
  const canonical = `${siteUrl}/blog/${post.slug}`;
  const dateModified = post.dateModified || post.publishDate;
  const readMinutes = Number(String(post.readTime ?? "").match(/\d+/)?.[0] ?? 1);
  const faqItems = (post.faq ?? []).slice(0, 5);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${canonical}#article`,
    headline: post.title,
    description: post.description,
    url: canonical,
    image: {
      "@type": "ImageObject",
      url: ogImage,
      width: 1200,
      height: 630,
    },
    wordCount: estimateWordCount(post),
    datePublished: post.publishDate,
    dateModified,
    author: makeAuthorSchema(post.author),
    publisher: makePublisherSchema(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
    inLanguage: "ko-KR",
    articleSection: categoryLabels[post.category] ?? post.category,
    keywords: (post.keywords ?? []).join(", "),
    timeRequired: `PT${readMinutes}M`,
    isPartOf: { "@type": "WebSite", "@id": `${siteUrl}/#website` },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "h2", ".lede"],
    },
  };
  const faqSchema = faqItems.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: stripMarkdown(item.answer),
          },
        })),
      }
    : null;

  return [articleSchema, faqSchema];
}

function renderJsonLd(data) {
  const items = Array.isArray(data) ? data : [data];
  return items
    .filter(Boolean)
    .map((item) => {
      const json = JSON.stringify(item).replaceAll("<", "\\u003c");
      return `    <script type="application/ld+json">${json}</script>`;
    })
    .join("\n");
}

function makeBreadcrumb(canonical, label) {
  const pathname = new URL(canonical).pathname;
  const itemListElement = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Crepika",
      item: `${siteUrl}/`,
    },
  ];

  if (pathname.startsWith("/blog/")) {
    itemListElement.push({
      "@type": "ListItem",
      position: 2,
      name: "블로그",
      item: `${siteUrl}/blog`,
    });
  } else if (pathname.startsWith("/tools/")) {
    itemListElement.push({
      "@type": "ListItem",
      position: 2,
      name: "도구",
      item: `${siteUrl}/tools`,
    });
  }

  itemListElement.push({
    "@type": "ListItem",
    position: itemListElement.length + 1,
    name: label,
    item: canonical,
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };
}

function renderShell({
  title,
  description,
  canonical,
  heading,
  bodyHtml,
  type = "website",
  structuredData = [],
}) {
  const baseStructuredData = Array.isArray(structuredData) ? structuredData : [structuredData];
  const jsonLd = renderJsonLd([
    ...makeSiteIdentityStructuredData(),
    ...baseStructuredData,
    makeBreadcrumb(canonical, heading),
  ]);
  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="robots" content="index,follow,max-image-preview:large">
    <link rel="canonical" href="${escapeHtml(canonical)}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${escapeHtml(canonical)}">
    <meta property="og:type" content="${type}">
    <meta property="og:locale" content="ko_KR">
    <meta property="og:site_name" content="Crepika">
    <meta property="og:image" content="${ogImage}">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${escapeHtml(title)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${ogImage}">
    <meta name="twitter:image:alt" content="${escapeHtml(title)}">
    <meta name="google-adsense-account" content="ca-pub-3050601904412736">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3050601904412736" crossorigin="anonymous"></script>
${jsonLd ? `${jsonLd}\n` : ""}    <style>
      :root{color-scheme:light}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;line-height:1.7;color:#172033;margin:0;background:#f8fafc}
      main{max-width:860px;margin:0 auto;padding:44px 20px 72px}nav{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:32px}
      a{color:#0f766e}h1{font-size:2.2rem;line-height:1.2;margin:0 0 18px}h2{margin-top:34px;font-size:1.35rem}h3{margin-top:24px;font-size:1.08rem}
      .lede{font-size:1.08rem;color:#475569}.panel{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:22px;margin-top:18px}
      table{width:100%;border-collapse:collapse;margin:12px 0}th,td{border:1px solid #e2e8f0;padding:10px;text-align:left;vertical-align:top}th{width:8rem;background:#f1f5f9}
      li{margin:8px 0}.muted{color:#64748b;font-size:.95rem}.post-list{padding-left:20px}
    </style>
  </head>
  <body>
    <main>
      <nav>
        <a href="/">홈</a><a href="/tools/text-counter">도구</a><a href="/blog">블로그</a><a href="/about">소개</a><a href="/contact">문의</a><a href="/privacy">개인정보처리방침</a><a href="/terms">이용약관</a>
      </nav>
      <h1>${escapeHtml(heading)}</h1>
      ${bodyHtml}
      <section class="panel">
        <h2>사이트 검토 정보</h2>
        <p>크레피카는 크리에이터와 마케터를 위한 무료 유틸리티 사이트입니다. 실무 도구, 편집 가이드, 문의 정보, 개인정보처리방침, 이용약관, RSS, robots.txt, ads.txt, 사이트맵을 제공해 사용자와 검색엔진이 자바스크립트 렌더링에만 의존하지 않고 사이트 구조를 이해할 수 있게 합니다.</p>
        <p>광고는 Google AdSense 자동 광고로 노출될 수 있습니다. 이 정적 크롤러 페이지에는 수동 광고 슬롯을 삽입하지 않으며, 광고는 도구 결과나 편집 추천 내용에 영향을 주지 않습니다.</p>
        <p>정책 페이지: <a href="/privacy">개인정보처리방침</a>, <a href="/terms">이용약관</a>, <a href="/about">크레피카 소개</a>, <a href="/contact">문의하기</a>.</p>
      </section>
    </main>
  </body>
</html>`;
}

function writePage(path, html) {
  const target = join(publicDir, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html, "utf8");
}

function renderStaticPage(page) {
  const paragraphs = page.body.map((text, index) => `<p${index === 0 ? ' class="lede"' : ""}>${escapeHtml(text)}</p>`).join("\n");
  const path = new URL(page.canonical).pathname;
  const isTool = path.startsWith("/tools/");
  const referenceLinks = (page.references ?? [])
    .map(([label, href]) => `<li><a href="${escapeHtml(href)}" rel="noopener noreferrer">${escapeHtml(label)}</a></li>`)
    .join("\n");
  const referenceSection = isTool && referenceLinks
    ? `<section class="panel"><h2>공식 참고 자료</h2><ul>${referenceLinks}</ul></section>`
    : "";
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${page.canonical}#webpage`,
      url: page.canonical,
      name: page.title,
      description: page.description,
      inLanguage: "ko-KR",
      isPartOf: { "@id": `${siteUrl}/#website` },
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    isTool
      ? {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: page.heading,
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Web Browser",
          url: page.canonical,
          description: page.description,
          inLanguage: "ko-KR",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "KRW",
          },
          publisher: { "@id": `${siteUrl}/#organization` },
        }
      : null,
  ];
  return renderShell({
    ...page,
    structuredData,
    bodyHtml: `${paragraphs}
      ${referenceSection}
      <section class="panel"><h2>유용한 링크</h2><ul><li><a href="/blog">블로그 가이드 보기</a></li><li><a href="/tools/text-counter">크리에이터 도구 열기</a></li><li><a href="/contact">정정 요청하기</a></li></ul></section>`,
  });
}

function renderBlogIndex(posts) {
  const latest = posts.slice().reverse().slice(0, 80);
  const links = latest.map((post) => `<li><a href="/blog/${escapeHtml(post.slug)}">${escapeHtml(post.title)}</a><br><span class="muted">${escapeHtml(post.description)}</span></li>`).join("\n");
  const hubLinks = blogHubs
    .map((hub) => `<li><a href="/topics/${escapeHtml(hub.slug)}">${escapeHtml(hub.title)}</a><br><span class="muted">${escapeHtml(hub.description)}</span></li>`)
    .join("\n");
  return renderShell({
    title: "크레피카 블로그 | SEO와 크리에이터 워크플로우 가이드",
    description: "SEO, SNS 마케팅, 이미지 최적화, 콘텐츠 워크플로우, 무료 크리에이터 도구 활용법을 다루는 크레피카 가이드입니다.",
    canonical: `${siteUrl}/blog`,
    heading: "크레피카 블로그",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${siteUrl}/blog#collection`,
      url: `${siteUrl}/blog`,
      name: "크레피카 블로그",
      description: "실전 SEO, SNS 마케팅, 크리에이터 워크플로우, 이미지 최적화, 발행 점검 가이드를 모은 페이지입니다.",
      inLanguage: "ko-KR",
      isPartOf: { "@id": `${siteUrl}/#website` },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: latest.length,
        itemListElement: latest.slice(0, 20).map((post, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${siteUrl}/blog/${post.slug}`,
          name: post.title,
        })),
      },
    },
    bodyHtml: `<p class="lede">SEO, SNS 마케팅, 크리에이터 워크플로우, 이미지 최적화, 발행 점검에 필요한 실전 가이드를 모았습니다.</p><section class="panel"><h2>주제별 허브</h2><ul>${hubLinks}</ul></section><section class="panel"><h2>최신 가이드</h2><ol class="post-list">${links}</ol></section>`,
  });
}

function renderBlogHub(hub, posts) {
  const matched = posts
    .filter((post) =>
      hub.match.test([post.slug, post.title, post.description, post.category, ...(post.keywords ?? [])].join(" ")),
    )
    .slice()
    .reverse()
    .slice(0, 36);
  const postLinks = matched
    .map((post) => `<li><a href="/blog/${escapeHtml(post.slug)}">${escapeHtml(post.title)}</a><br><span class="muted">${escapeHtml(post.description)}</span></li>`)
    .join("\n");
  const toolLinks = hub.tools
    .filter((path) => alwaysPublishedToolPaths.has(path) || publishedQueuedToolPaths.has(path))
    .map((path) => `<li><a href="${escapeHtml(path)}">${escapeHtml(path.replace("/tools/", ""))}</a></li>`)
    .join("\n");
  return renderShell({
    title: `${hub.title} | Crepika`,
    description: hub.description,
    canonical: `${siteUrl}/topics/${hub.slug}`,
    heading: hub.title,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${siteUrl}/topics/${hub.slug}#collection`,
      url: `${siteUrl}/topics/${hub.slug}`,
      name: hub.title,
      description: hub.description,
      inLanguage: "ko-KR",
      isPartOf: { "@id": `${siteUrl}/#website` },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: matched.length,
        itemListElement: matched.slice(0, 20).map((post, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${siteUrl}/blog/${post.slug}`,
          name: post.title,
        })),
      },
    },
    bodyHtml: `<p class="lede">${escapeHtml(hub.description)}</p><section class="panel"><h2>함께 쓰면 좋은 도구</h2><ul>${toolLinks}</ul></section><section class="panel"><h2>추천 가이드</h2><ol class="post-list">${postLinks}</ol></section>`,
  });
}

function renderBlogPost(post) {
  const canonical = `${siteUrl}/blog/${post.slug}`;
  const faqItems = (post.faq ?? []).slice(0, 5);
  const sections = post.content.sections
    .map((section, index) => {
      const title = section.heading || section.title || "가이드 섹션";
      const subsections = (section.subsections ?? [])
        .map((subsection) => `<h3>${escapeHtml(subsection.subheading)}</h3><p>${escapeHtml(stripMarkdown(subsection.content))}</p>`)
        .join("\n");
      return `<section class="panel" id="section-${index}"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(stripMarkdown(section.content))}</p>${subsections}</section>`;
    })
    .join("\n");
  const toc = post.content.sections
    .map((section, index) => {
      const title = section.heading || section.title || `섹션 ${index + 1}`;
      return `<li><a href="#section-${index}">${escapeHtml(title)}</a></li>`;
    })
    .join("\n");
  const faq = faqItems
    .map((item) => `<h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(stripMarkdown(item.answer))}</p>`)
    .join("\n");
  const faqHtml = faq ? `<section class="panel"><h2>자주 묻는 질문</h2>${faq}</section>` : "";
  return renderShell({
    title: `${post.title} | Crepika`,
    description: post.description,
    canonical,
    heading: post.title,
    type: "article",
    structuredData: makeArticleStructuredData(post),
    bodyHtml: `<p class="lede">${escapeHtml(post.description)}</p>
      ${renderArticleSupportLinks(post)}
      ${renderArticleDecisionBlock(post)}
      <p class="muted">발행일: ${escapeHtml(post.publishDate)} &middot; 분야: ${escapeHtml(post.category)} &middot; 읽는 시간: ${escapeHtml(post.readTime)}</p>
      <nav class="panel" aria-label="글 목차"><h2>글 목차</h2><ol>${toc}</ol></nav>
      <section class="panel"><h2>핵심 개요</h2><p>${escapeHtml(stripMarkdown(post.content.introduction))}</p></section>
      ${sections}
      <section class="panel"><h2>마무리</h2><p>${escapeHtml(stripMarkdown(post.content.conclusion))}</p></section>
      ${faqHtml}
      <section class="panel"><h2>다음 단계</h2><p>상단의 관련 크레피카 도구를 활용해 초안을 점검한 뒤, 이 가이드로 돌아와 최종 발행 전 구조와 표현을 다시 확인하세요.</p></section>`,
  });
}

const posts = loadPosts();

for (const page of [...staticPages, ...toolPages]) {
  writePage(page.path, renderStaticPage(page));
}

writePage("blog/index.html", renderBlogIndex(posts));
for (const hub of blogHubs) {
  writePage(`topics/${hub.slug}/index.html`, renderBlogHub(hub, posts));
}
for (const post of posts) {
  writePage(`blog/${post.slug}/index.html`, renderBlogPost(post));
}

writePage(".well-known/security.txt", securityTxt);

console.log(`Generated ${staticPages.length + toolPages.length + 1 + blogHubs.length + posts.length} crawler-visible pages.`);
