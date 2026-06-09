import { ToolDetailedContent } from "./tool-content";

const relatedBasics = [
  { title: "글자수 세기", path: "/tools/text-counter" },
  { title: "한글 바이트 카운터", path: "/tools/byte-counter" },
  { title: "크리에이터 블로그", path: "/blog" },
];

export const GENERATED_TOOL_CONTENT: Record<string, ToolDetailedContent> = {
  "seo-title-length-checker": {
    id: "seo-title-length-checker",
    introduction:
      "SEO 제목 길이 검사기는 블로그, 랜딩페이지, 도구 페이지의 제목이 검색 결과에서 읽히기 좋은지 빠르게 확인하는 도구입니다. 제목 길이, 핵심 키워드의 앞쪽 배치, 클릭 전에 의미가 전달되는 구조를 함께 점검합니다.",
    howToUse: {
      steps: [
        "검사할 제목을 입력합니다.",
        "타겟 핵심 키워드를 입력합니다.",
        "검사 버튼을 눌러 점수, 글자 수, 키워드 위치를 확인합니다.",
        "제안된 팁을 기준으로 제목을 짧고 구체적으로 다듬습니다.",
      ],
      tips: [
        "핵심 키워드는 제목 앞쪽에 배치하는 편이 검색 의도 전달에 유리합니다.",
        "긴 제목은 뒷부분이 잘릴 수 있으므로 앞 30자 안에 핵심 의미를 담으세요.",
        "숫자, 대상 독자, 결과 약속을 과하지 않게 조합하면 클릭 전 이해가 빨라집니다.",
      ],
    },
    keyBenefits: [
      { title: "검색 노출 점검", description: "제목 길이와 키워드 위치를 한 번에 확인합니다." },
      { title: "클릭률 개선", description: "검색자가 제목만 보고도 얻을 내용을 이해하게 돕습니다." },
      { title: "초안 비교", description: "여러 제목 후보를 빠르게 비교하며 개선할 수 있습니다." },
    ],
    faq: [
      { question: "SEO 제목은 몇 자가 적당한가요?", answer: "Google은 보통 50~60자 안에서 핵심이 보이게 쓰는 것이 좋고, 네이버는 더 짧은 제목이 읽히기 쉽습니다. 정확한 기준보다 앞쪽에 핵심 의미가 보이는지가 중요합니다." },
      { question: "키워드를 꼭 맨 앞에 넣어야 하나요?", answer: "항상 맨 앞일 필요는 없지만, 앞부분에 가까울수록 검색자와 검색엔진이 주제를 빨리 파악하기 쉽습니다." },
      { question: "점수가 높으면 상위노출이 보장되나요?", answer: "아닙니다. 제목은 여러 SEO 요소 중 하나입니다. 본문 품질, 검색 의도, 링크, 사이트 신뢰도도 함께 중요합니다." },
      { question: "블로그 글뿐 아니라 상품 페이지에도 쓸 수 있나요?", answer: "네. 검색 결과에 노출되는 대부분의 페이지 제목 점검에 사용할 수 있습니다." },
    ],
    relatedResources: relatedBasics,
  },
  "meta-description-checker": {
    id: "meta-description-checker",
    introduction:
      "메타 설명 검사기는 검색 결과에 보이는 설명문이 너무 짧거나 길지 않은지, 핵심 키워드와 행동 유도 문구가 자연스럽게 들어갔는지 확인합니다. 중복 설명을 줄이고 페이지별 스니펫 품질을 높이는 데 유용합니다.",
    howToUse: {
      steps: [
        "페이지에 사용할 메타 설명을 입력합니다.",
        "핵심 키워드를 입력합니다.",
        "검사 결과에서 길이, CTA, 키워드 위치를 확인합니다.",
        "페이지마다 고유한 설명으로 다듬습니다.",
      ],
      tips: [
        "설명 첫 문장에는 페이지가 해결하는 문제를 분명히 쓰세요.",
        "여러 페이지에 같은 설명을 반복하면 검색 결과 품질이 낮아질 수 있습니다.",
        "클릭 유도를 위해 확인, 비교, 계산, 생성처럼 구체적인 행동 동사를 활용하세요.",
      ],
    },
    keyBenefits: [
      { title: "스니펫 품질 개선", description: "검색 결과에서 설명이 명확하게 보이도록 돕습니다." },
      { title: "중복 위험 감소", description: "페이지별 고유 설명 작성 기준을 제공합니다." },
      { title: "CTA 점검", description: "사용자가 다음 행동을 이해할 수 있는지 확인합니다." },
    ],
    faq: [
      { question: "메타 설명은 순위에 직접 영향을 주나요?", answer: "직접 순위 요소로 보기 어렵지만, 검색 결과 클릭률과 페이지 이해도에는 영향을 줄 수 있습니다." },
      { question: "몇 자로 작성해야 하나요?", answer: "보통 70~155자 안에서 핵심 가치가 보이게 작성하는 것을 권장합니다." },
      { question: "모든 페이지에 메타 설명이 필요한가요?", answer: "중요 페이지, 도구 페이지, 블로그 글에는 페이지별 고유 설명을 넣는 것이 좋습니다." },
      { question: "키워드를 반복해도 되나요?", answer: "과도한 반복은 부자연스럽습니다. 핵심 키워드는 한 번만 자연스럽게 넣는 편이 좋습니다." },
    ],
    relatedResources: relatedBasics,
  },
  "slug-generator": {
    id: "slug-generator",
    introduction:
      "URL 슬러그 생성기는 글 제목이나 도구 이름을 짧고 읽기 쉬운 URL 경로로 바꾸는 도구입니다. 의미 없는 숫자나 긴 한글 인코딩 URL 대신, 검색자와 운영자가 내용을 예측할 수 있는 주소 체계를 만드는 데 도움을 줍니다.",
    howToUse: {
      steps: [
        "URL로 바꾸고 싶은 제목을 입력합니다.",
        "슬러그 생성 버튼을 누릅니다.",
        "생성된 lowercase-kebab 형식의 슬러그를 복사합니다.",
        "이미 공개된 URL을 바꿀 때는 리다이렉트를 함께 준비합니다.",
      ],
      tips: [
        "슬러그는 짧을수록 관리가 쉽지만, 의미가 사라질 정도로 줄이면 안 됩니다.",
        "불필요한 조사, 날짜, 수식어보다 핵심 명사를 남기세요.",
        "공개된 URL 변경은 검색 색인과 외부 링크에 영향을 줄 수 있습니다.",
      ],
    },
    keyBenefits: [
      { title: "읽기 쉬운 URL", description: "사용자가 주소만 보고도 페이지 주제를 파악할 수 있습니다." },
      { title: "운영 효율", description: "콘텐츠 관리와 내부 링크 작업이 쉬워집니다." },
      { title: "SEO 기본기", description: "의미 있는 URL 구조를 만드는 데 도움을 줍니다." },
    ],
    faq: [
      { question: "한글 URL보다 영문 슬러그가 좋은가요?", answer: "둘 다 사용할 수 있지만, 영문 소문자 슬러그는 공유와 관리가 쉬운 장점이 있습니다." },
      { question: "언더스코어와 하이픈 중 무엇이 좋나요?", answer: "일반적으로 단어 구분에는 하이픈을 권장합니다." },
      { question: "슬러그에 날짜를 넣어도 되나요?", answer: "뉴스나 일지형 콘텐츠는 가능하지만, evergreen 콘텐츠는 날짜를 빼는 편이 오래 쓰기 좋습니다." },
      { question: "기존 URL을 바꿔도 되나요?", answer: "가능하지만 반드시 301 리다이렉트와 내부 링크 업데이트를 함께 검토해야 합니다." },
    ],
    relatedResources: relatedBasics,
  },
  "utm-url-builder": {
    id: "utm-url-builder",
    introduction:
      "UTM URL 빌더는 인스타그램, 뉴스레터, 광고, 제휴 링크처럼 여러 유입 채널을 GA4에서 구분하기 위한 캠페인 URL을 만듭니다. 값의 대소문자와 공백을 정리해 데이터가 쪼개지는 문제를 줄입니다.",
    howToUse: {
      steps: [
        "랜딩 URL을 입력합니다.",
        "source, medium, campaign 값을 입력합니다.",
        "필요하면 content 값으로 위치나 소재를 구분합니다.",
        "생성된 URL을 복사해 캠페인 링크로 사용합니다.",
      ],
      tips: [
        "utm_source는 instagram, newsletter, google처럼 유입처를 적습니다.",
        "utm_medium은 social, email, cpc처럼 매체 유형을 적습니다.",
        "팀 단위로 캠페인 네이밍 규칙을 정해두면 GA4 리포트가 훨씬 깔끔해집니다.",
      ],
    },
    keyBenefits: [
      { title: "GA4 추적 정리", description: "채널과 캠페인을 일관된 이름으로 관리합니다." },
      { title: "실수 감소", description: "공백과 대소문자 혼용을 줄입니다." },
      { title: "성과 비교", description: "프로필, 스토리, 댓글 등 링크 위치별 성과를 나눠 볼 수 있습니다." },
    ],
    faq: [
      { question: "UTM은 언제 써야 하나요?", answer: "외부 채널에서 내 사이트로 보내는 링크를 구분하고 싶을 때 사용합니다." },
      { question: "내부 링크에도 UTM을 써야 하나요?", answer: "보통 내부 링크에는 쓰지 않습니다. 내부 이동에 UTM을 쓰면 원래 유입 정보가 덮일 수 있습니다." },
      { question: "utm_content는 필수인가요?", answer: "필수는 아니지만 같은 캠페인 안에서 소재나 위치를 구분할 때 유용합니다." },
      { question: "한글 값을 써도 되나요?", answer: "가능하지만 리포트 일관성과 공유 편의성을 위해 영문 소문자 규칙을 권장합니다." },
    ],
    relatedResources: relatedBasics,
  },
  "ctr-calculator": {
    id: "ctr-calculator",
    introduction:
      "CTR 계산기는 노출수와 클릭수로 클릭률을 계산합니다. 검색 결과, 광고, 썸네일, 이메일 제목, SNS 링크의 성과를 빠르게 비교할 때 유용합니다.",
    howToUse: {
      steps: [
        "노출수를 입력합니다.",
        "클릭수를 입력합니다.",
        "CTR 계산 버튼을 누릅니다.",
        "결과를 기준으로 제목, 썸네일, 설명 개선 여부를 판단합니다.",
      ],
      tips: [
        "CTR은 노출 위치와 검색 의도에 따라 크게 달라집니다.",
        "소량 데이터에서는 클릭 몇 번 차이로 수치가 크게 흔들립니다.",
        "CTR이 낮다면 먼저 제목과 설명이 사용자의 기대와 맞는지 확인하세요.",
      ],
    },
    keyBenefits: [
      { title: "성과 즉시 계산", description: "노출 대비 클릭 효율을 빠르게 파악합니다." },
      { title: "개선 우선순위", description: "제목, 썸네일, CTA 개선 필요성을 판단합니다." },
      { title: "채널 비교", description: "검색, SNS, 이메일의 클릭 효율을 비교할 수 있습니다." },
    ],
    faq: [
      { question: "CTR 공식은 무엇인가요?", answer: "CTR은 클릭수 ÷ 노출수 × 100입니다." },
      { question: "좋은 CTR 기준은 얼마인가요?", answer: "채널과 노출 위치에 따라 다릅니다. 같은 채널 안에서 이전 기간과 비교하는 방식이 가장 현실적입니다." },
      { question: "CTR만 높으면 좋은가요?", answer: "아닙니다. 클릭 이후 체류, 전환, 수익까지 함께 봐야 합니다." },
      { question: "검색 CTR이 낮으면 어떻게 해야 하나요?", answer: "제목, 메타 설명, 검색 의도 일치 여부를 먼저 점검하세요." },
    ],
    relatedResources: relatedBasics,
  },
  "adsense-rpm-calculator": {
    id: "adsense-rpm-calculator",
    introduction:
      "애드센스 RPM 계산기는 예상 수익과 페이지뷰를 바탕으로 페이지뷰 1,000회당 수익을 계산합니다. 광고 슬롯을 늘리는 대신 콘텐츠 품질, 유입 국가, 주제, 페이지 경험을 함께 점검하는 기준점으로 활용할 수 있습니다.",
    howToUse: {
      steps: [
        "애드센스 예상 수익을 입력합니다.",
        "같은 기간의 페이지뷰를 입력합니다.",
        "RPM 계산 버튼을 누릅니다.",
        "7일 또는 28일 평균과 비교해 추세를 확인합니다.",
      ],
      tips: [
        "RPM은 하루 단위보다 7일 이상 평균으로 보는 편이 안정적입니다.",
        "자동광고 사용 시 수익만 보고 수동 광고 슬롯을 무리하게 늘리지 마세요.",
        "페이지 속도, 콘텐츠 주제, 유입 국가, 광고주 수요가 함께 RPM에 영향을 줍니다.",
      ],
    },
    keyBenefits: [
      { title: "수익성 파악", description: "트래픽 대비 수익 효율을 쉽게 계산합니다." },
      { title: "추세 비교", description: "기간별 RPM 변화를 비교해 이상 징후를 찾습니다." },
      { title: "운영 판단", description: "광고보다 콘텐츠와 페이지 경험 개선 우선순위를 잡는 데 도움을 줍니다." },
    ],
    faq: [
      { question: "RPM 공식은 무엇인가요?", answer: "RPM은 예상 수익 ÷ 페이지뷰 × 1000입니다." },
      { question: "RPM과 CPC는 다른가요?", answer: "네. RPM은 페이지뷰 기준 수익이고, CPC는 클릭 1회당 수익입니다." },
      { question: "RPM이 낮으면 광고를 더 넣어야 하나요?", answer: "자동광고 사용 중이라면 먼저 콘텐츠 품질, 유입 국가, 페이지 속도, 광고 제한 여부를 확인하는 편이 안전합니다." },
      { question: "애드센스 승인 전에도 쓸 수 있나요?", answer: "네. 예상 수익 시뮬레이션이나 승인 후 성과 비교 기준을 잡는 용도로 사용할 수 있습니다." },
    ],
    relatedResources: relatedBasics,
  },
};
