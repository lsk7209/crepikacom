export type AdStrategy = 'instant' | 'process_heavy' | 'download_focused';
export type Category = 'plan' | 'create' | 'publish' | 'analyze';

export interface ToolConfig {
  id: string;
  category: Category;
  path: string;
  publicationStatus?: 'published' | 'ready' | 'draft';
  
  // 한국어 필드 (메인)
  titleKo: string;
  descriptionKo: string;
  oneLineProblemKo: string;
  
  // 영어 필드 (보조, SEO용)
  titleEn: string;
  descriptionEn: string;
  oneLineProblemEn?: string;
  
  keywords: string[];
  adStrategy: AdStrategy;
  seoTitle?: string;
  seoDescription?: string;
  schemaType?: 'SoftwareApplication';
}

export const TOOLS_CONFIG: ToolConfig[] = [
  {
    id: 'text-counter',
    category: 'plan',
    titleKo: '텍스트 카운터',
    descriptionKo: '글자 수, 단어 수, 줄 수를 실시간으로 계산합니다. 소셜미디어 게시물 작성에 최적화되어 있습니다.',
    oneLineProblemKo: '트위터, 인스타그램 등 글자수 제한이 있는 곳에 딱 맞는 텍스트를 작성하고 싶으신가요?',
    titleEn: 'Text Counter',
    descriptionEn: 'Count characters and words instantly. Korean-optimized with byte counting.',
    path: '/tools/text-counter',
    keywords: ['텍스트 카운터', '글자수 세기', '문자수', 'text counter', 'character count'],
    adStrategy: 'instant',
    seoTitle: '텍스트 카운터 - 글자수 세기 도구 | 크레피카',
    seoDescription: '글자 수, 단어 수를 실시간으로 세는 무료 도구. 소셜미디어와 SEO 콘텐츠 작성에 최적화. 즉시 결과 확인.',
    schemaType: 'SoftwareApplication',
  },
  {
    id: 'lorem-generator',
    category: 'plan',
    titleKo: '로렘 입숨 생성기',
    descriptionKo: '디자인 시안이나 목업을 위한 더미 텍스트를 즉시 생성합니다. 한국어와 영어 모두 지원합니다.',
    oneLineProblemKo: '디자인이나 시안을 위한 더미 텍스트를 3초 만에 만들고 싶으신가요?',
    titleEn: 'Lorem Ipsum Generator',
    descriptionEn: 'Generate dummy text for designs and mockups in Korean and English.',
    path: '/tools/lorem-generator',
    keywords: ['로렘 입숨', '더미 텍스트', '샘플 텍스트', 'lorem ipsum', 'dummy text'],
    adStrategy: 'instant',
    seoTitle: '로렘 입숨 생성기 - 더미 텍스트 생성 도구 | 크레피카',
    seoDescription: '디자인 시안용 로렘 입숨 더미 텍스트 생성기. 한국어와 영어 지원. 짧게, 보통, 길게 선택 가능.',
    schemaType: 'SoftwareApplication',
  },
  {
    id: 'webp-converter',
    category: 'create',
    titleKo: 'WebP 변환기',
    descriptionKo: 'JPG/PNG 이미지를 WebP 포맷으로 변환하여 웹사이트 로딩 속도를 개선합니다. 80% 품질로 최적화됩니다.',
    oneLineProblemKo: '이미지 용량이 너무 커서 웹사이트가 느리신가요? WebP로 변환하면 빠르게 로딩됩니다.',
    titleEn: 'WebP Converter',
    descriptionEn: 'Convert JPG/PNG to WebP for faster website loading.',
    path: '/tools/webp-converter',
    keywords: ['webp 변환', '이미지 최적화', 'jpg webp', 'png webp', '이미지 압축'],
    adStrategy: 'process_heavy',
    seoTitle: 'WebP 변환기 - 이미지 최적화 도구 | 크레피카',
    seoDescription: 'JPG/PNG를 WebP로 변환하여 빠른 로딩 속도 구현. 80% 품질 유지. 무료 브라우저 기반 변환기.',
    schemaType: 'SoftwareApplication',
  },
  {
    id: 'insta-spacer',
    category: 'publish',
    titleKo: '인스타 줄바꿈 포매터',
    descriptionKo: '인스타그램 캡션의 줄바꿈을 유지하도록 포맷팅합니다. 3초 안에 깨진 형식을 수정합니다.',
    oneLineProblemKo: '인스타그램에 올리면 줄바꿈이 깨지는 캡션을 3초 만에 정리하고 싶으신가요?',
    titleEn: 'Instagram Line Break Formatter',
    descriptionEn: 'Format Instagram captions to preserve line breaks.',
    path: '/tools/insta-spacer',
    keywords: ['인스타그램', '줄바꿈', '캡션', 'instagram', 'line break', '인스타 캡션'],
    adStrategy: 'instant',
    seoTitle: '인스타 줄바꿈 포매터 - 인스타그램 캡션 정리 | 크레피카',
    seoDescription: '인스타그램 캡션 줄바꿈을 유지하는 포매팅 도구. 게시 시 깨지는 형식 방지. 무료 즉시 사용.',
    schemaType: 'SoftwareApplication',
  },
  {
    id: 'hashtag-mixer',
    category: 'publish',
    titleKo: '해시태그 믹서',
    descriptionKo: '최대 30개의 해시태그를 섞고 정리합니다. 중복 제거와 랜덤 순서 변경을 즉시 처리합니다.',
    oneLineProblemKo: '최대 30개의 해시태그를 깔끔하게 섞어서 붙여넣기용으로 만들고 싶으신가요?',
    titleEn: 'Hashtag Mixer',
    descriptionEn: 'Shuffle and organize up to 30 hashtags instantly.',
    path: '/tools/hashtag-mixer',
    keywords: ['해시태그', '인스타그램 해시태그', '해시태그 섞기', 'hashtag', 'instagram'],
    adStrategy: 'instant',
    seoTitle: '해시태그 믹서 - 해시태그 섞기 도구 | 크레피카',
    seoDescription: '인스타그램 해시태그를 섞고 정리하는 도구. 최대 30개, 중복 제거 및 랜덤 순서. 즉시 사용.',
    schemaType: 'SoftwareApplication',
  },
  {
    id: 'qr-generator',
    category: 'analyze',
    titleKo: 'QR 코드 생성기',
    descriptionKo: 'URL로 QR 코드를 즉시 생성합니다. 무료이며 빠르고, 클릭 한 번으로 PNG 다운로드 가능합니다.',
    oneLineProblemKo: '지금 바로 링크를 QR 코드로 만들고 싶으신가요?',
    titleEn: 'QR Code Generator',
    descriptionEn: 'Generate QR codes from URLs instantly.',
    path: '/tools/qr-generator',
    keywords: ['qr 코드', 'qr 생성기', 'url qr', '무료 qr', 'qr code'],
    adStrategy: 'download_focused',
    seoTitle: 'QR 코드 생성기 - 무료 URL QR 변환 도구 | 크레피카',
    seoDescription: 'URL로 QR 코드 즉시 생성. 무료, 빠름, 클릭 한 번에 PNG 다운로드. 로그인 불필요.',
    schemaType: 'SoftwareApplication',
  },
  {
    id: 'byte-counter',
    category: 'plan',
    titleKo: '한글 바이트 카운터',
    descriptionKo: '네이버 SEO 최적화를 위한 바이트 수 계산 도구. UTF-8 기준으로 한글 글자를 정확하게 측정합니다.',
    oneLineProblemKo: '네이버 검색/블로그 최적화를 위해 글자 수뿐만 아니라 바이트 수까지 한 번에 확인하고 싶으신가요?',
    titleEn: 'Korean Byte Counter',
    descriptionEn: 'Count bytes for Naver SEO optimization with Korean support.',
    path: '/tools/byte-counter',
    keywords: ['바이트 카운터', '한글 바이트', '네이버 seo', 'utf-8', '글자수'],
    adStrategy: 'instant',
    seoTitle: '한글 바이트 카운터 - 네이버 SEO 최적화 도구 | 크레피카',
    seoDescription: '네이버 SEO 최적화를 위한 UTF-8 바이트 카운터. 한글 최적화 바이트 수 분석 도구.',
    schemaType: 'SoftwareApplication',
  },
  {
    id: 'seo-title-length-checker',
    category: 'plan',
    titleKo: 'SEO 제목 길이 검사기',
    descriptionKo: '검색 결과에서 제목이 잘리지 않도록 길이, 핵심 키워드 위치, 클릭 유도 요소를 점검합니다.',
    oneLineProblemKo: '블로그나 도구 페이지 제목이 검색 결과에서 잘 읽히는지 바로 확인하고 싶나요?',
    titleEn: 'SEO Title Length Checker',
    descriptionEn: 'Check title length, keyword position, and search snippet readability.',
    path: '/tools/seo-title-length-checker',
    keywords: ['SEO 제목', '타이틀 태그', '제목 길이', '검색 스니펫', 'title tag'],
    adStrategy: 'instant',
    seoTitle: 'SEO 제목 길이 검사기 - 타이틀 태그 점검 도구 | 크레피카',
    seoDescription: 'SEO 제목 길이, 핵심 키워드 위치, 검색 결과 잘림 위험을 무료로 점검하세요. 로그인 없이 바로 사용하는 타이틀 태그 검사 도구.',
    schemaType: 'SoftwareApplication',
  },
  {
    id: 'meta-description-checker',
    category: 'plan',
    titleKo: '메타 설명 검사기',
    descriptionKo: '메타 설명의 길이, 핵심 키워드 위치, CTA, 중복 표현 위험을 점검합니다.',
    oneLineProblemKo: '검색 결과 설명문이 너무 짧거나 길어서 클릭률을 놓치고 있나요?',
    titleEn: 'Meta Description Checker',
    descriptionEn: 'Check meta description length, keyword placement, and call-to-action clarity.',
    path: '/tools/meta-description-checker',
    keywords: ['메타 설명', 'meta description', 'SEO 설명', '검색 설명', '스니펫'],
    adStrategy: 'instant',
    seoTitle: '메타 설명 검사기 - SEO Description 점검 도구 | 크레피카',
    seoDescription: '메타 설명 길이, 키워드 위치, CTA 포함 여부를 무료로 검사하세요. 페이지별 검색 스니펫 품질을 빠르게 개선합니다.',
    schemaType: 'SoftwareApplication',
  },
  {
    id: 'slug-generator',
    category: 'plan',
    titleKo: 'URL 슬러그 생성기',
    descriptionKo: '글 제목을 사람이 읽기 쉬운 영문 소문자 URL 슬러그로 변환합니다.',
    oneLineProblemKo: '블로그 글 주소를 짧고 의미 있게 만들고 싶나요?',
    titleEn: 'URL Slug Generator',
    descriptionEn: 'Convert titles into readable lowercase URL slugs.',
    path: '/tools/slug-generator',
    keywords: ['URL 슬러그', 'slug generator', '블로그 주소', 'SEO URL', '영문 URL'],
    adStrategy: 'instant',
    seoTitle: 'URL 슬러그 생성기 - SEO 친화적 주소 만들기 | 크레피카',
    seoDescription: '글 제목을 읽기 쉬운 URL 슬러그로 변환하세요. 하이픈 기반 lowercase URL을 무료로 생성합니다.',
    schemaType: 'SoftwareApplication',
  },
  {
    id: 'utm-url-builder',
    category: 'analyze',
    titleKo: 'UTM URL 빌더',
    descriptionKo: 'GA4 캠페인 추적을 위한 UTM URL을 일관된 규칙으로 생성합니다.',
    oneLineProblemKo: '인스타그램, 뉴스레터, 광고 링크 성과를 GA4에서 정확히 나눠 보고 싶나요?',
    titleEn: 'UTM URL Builder',
    descriptionEn: 'Build clean campaign tracking URLs for GA4.',
    path: '/tools/utm-url-builder',
    keywords: ['UTM', 'GA4', '캠페인 URL', 'utm builder', '마케팅 링크'],
    adStrategy: 'instant',
    seoTitle: 'UTM URL 빌더 - GA4 캠페인 링크 생성 도구 | 크레피카',
    seoDescription: 'utm_source, utm_medium, utm_campaign 값을 정리해 GA4 캠페인 URL을 무료로 생성하세요. 로그인 없이 바로 사용.',
    schemaType: 'SoftwareApplication',
  },
  {
    id: 'ctr-calculator',
    category: 'analyze',
    titleKo: 'CTR 계산기',
    descriptionKo: '노출수와 클릭수로 클릭률을 계산하고 개선 포인트를 확인합니다.',
    oneLineProblemKo: '검색 결과, 광고, 썸네일의 클릭률을 빠르게 계산하고 싶나요?',
    titleEn: 'CTR Calculator',
    descriptionEn: 'Calculate click-through rate from impressions and clicks.',
    path: '/tools/ctr-calculator',
    keywords: ['CTR 계산기', '클릭률', 'click through rate', '마케팅 계산기', '검색 클릭률'],
    adStrategy: 'instant',
    seoTitle: 'CTR 계산기 - 클릭률 무료 계산 도구 | 크레피카',
    seoDescription: '노출수와 클릭수로 CTR 클릭률을 즉시 계산하세요. 검색, 광고, SNS 링크 성과 분석에 유용한 무료 도구.',
    schemaType: 'SoftwareApplication',
  },
  {
    id: 'adsense-rpm-calculator',
    category: 'analyze',
    titleKo: '애드센스 RPM 계산기',
    descriptionKo: '예상 수익과 페이지뷰로 페이지 RPM을 계산합니다.',
    oneLineProblemKo: '애드센스 수익이 트래픽 대비 어느 정도인지 빠르게 계산하고 싶나요?',
    titleEn: 'AdSense RPM Calculator',
    descriptionEn: 'Calculate page RPM from estimated earnings and pageviews.',
    path: '/tools/adsense-rpm-calculator',
    keywords: ['애드센스 RPM', 'RPM 계산기', 'AdSense', '페이지 RPM', '블로그 수익'],
    adStrategy: 'instant',
    seoTitle: '애드센스 RPM 계산기 - 페이지 RPM 무료 계산 | 크레피카',
    seoDescription: '애드센스 예상 수익과 페이지뷰로 Page RPM을 무료 계산하세요. 블로그 수익성을 빠르게 점검하는 도구.',
    schemaType: 'SoftwareApplication',
  },
  {
    id: 'faq-schema-builder',
    category: 'plan',
    titleKo: 'FAQ 스키마 초안 생성기',
    descriptionKo: '질문과 답변을 FAQPage JSON-LD 초안으로 변환합니다.',
    oneLineProblemKo: '블로그 FAQ를 검색엔진이 이해할 수 있는 구조화 데이터로 바꾸고 싶나요?',
    titleEn: 'FAQ Schema Builder',
    descriptionEn: 'Convert questions and answers into FAQPage JSON-LD.',
    path: '/tools/faq-schema-builder',
    publicationStatus: 'ready',
    keywords: ['FAQ 스키마', 'FAQPage', 'JSON-LD', '구조화 데이터', 'AEO'],
    adStrategy: 'instant',
    seoTitle: 'FAQ 스키마 초안 생성기 - FAQPage JSON-LD 도구 | 크레피카',
    seoDescription: '질문과 답변을 FAQPage JSON-LD 구조화 데이터 초안으로 변환하세요. AEO와 검색 이해도를 높이는 무료 도구.',
    schemaType: 'SoftwareApplication',
  },
  {
    id: 'howto-schema-builder',
    category: 'plan',
    titleKo: 'HowTo 스키마 초안 생성기',
    descriptionKo: '단계별 안내문을 HowTo JSON-LD 초안으로 변환합니다.',
    oneLineProblemKo: '사용법이나 절차형 글을 HowTo 구조화 데이터로 정리하고 싶나요?',
    titleEn: 'HowTo Schema Builder',
    descriptionEn: 'Convert step-by-step instructions into HowTo JSON-LD.',
    path: '/tools/howto-schema-builder',
    publicationStatus: 'ready',
    keywords: ['HowTo 스키마', 'HowTo JSON-LD', '구조화 데이터', '사용법 스키마', 'SEO'],
    adStrategy: 'instant',
    seoTitle: 'HowTo 스키마 초안 생성기 - 단계형 JSON-LD 도구 | 크레피카',
    seoDescription: '단계별 사용법을 HowTo JSON-LD 구조화 데이터 초안으로 변환하세요. 절차형 콘텐츠 SEO에 유용한 무료 도구.',
    schemaType: 'SoftwareApplication',
  },
  {
    id: 'blog-cta-checker',
    category: 'analyze',
    titleKo: '블로그 CTA 검사기',
    descriptionKo: '글 안의 CTA가 구체적이고 행동을 유도하는지 점검합니다.',
    oneLineProblemKo: '블로그 글 마지막 문구가 사용자의 다음 행동을 제대로 이끌고 있나요?',
    titleEn: 'Blog CTA Checker',
    descriptionEn: 'Check whether a blog call-to-action is specific and action-oriented.',
    path: '/tools/blog-cta-checker',
    publicationStatus: 'ready',
    keywords: ['CTA 검사', '블로그 CTA', 'Call To Action', '전환 문구', '내부링크'],
    adStrategy: 'instant',
    seoTitle: '블로그 CTA 검사기 - 행동 유도 문구 점검 도구 | 크레피카',
    seoDescription: '블로그 CTA 문구의 행동 동사, 명확성, 길이를 점검하세요. 내부 링크와 전환 흐름 개선에 유용한 무료 도구.',
    schemaType: 'SoftwareApplication',
  },
  {
    id: 'paragraph-readability-checker',
    category: 'analyze',
    titleKo: '문단 가독성 검사기',
    descriptionKo: '너무 긴 문단과 분리 후보를 찾아 모바일 본문 가독성을 점검합니다.',
    oneLineProblemKo: '블로그 본문이 모바일에서 답답하게 보이는지 빠르게 확인하고 싶나요?',
    titleEn: 'Paragraph Readability Checker',
    descriptionEn: 'Find overly long paragraphs and readability risks in article drafts.',
    path: '/tools/paragraph-readability-checker',
    publicationStatus: 'ready',
    keywords: ['문단 가독성', '블로그 가독성', '모바일 본문', '콘텐츠 최적화', '읽기 쉬운 글'],
    adStrategy: 'instant',
    seoTitle: '문단 가독성 검사기 - 모바일 본문 읽기 쉬움 점검 | 크레피카',
    seoDescription: '긴 문단과 모바일 가독성 위험을 무료로 검사하세요. 블로그 본문 구조와 체류시간 개선에 유용한 도구.',
    schemaType: 'SoftwareApplication',
  },
];

export const CATEGORY_LABELS: Record<Category, string> = {
  plan: '기획',
  create: '제작',
  publish: '발행',
  analyze: '분석',
};

export function searchTools(query: string): ToolConfig[] {
  const publishedTools = TOOLS_CONFIG.filter(tool => tool.publicationStatus !== 'ready' && tool.publicationStatus !== 'draft');
  if (!query.trim()) return publishedTools;
  
  const searchTerm = query.toLowerCase();
  return publishedTools.filter(tool => {
    const searchableText = [
      tool.titleKo,
      tool.titleEn,
      tool.descriptionKo,
      tool.descriptionEn,
      tool.oneLineProblemKo,
      ...tool.keywords,
    ].join(' ').toLowerCase();
    
    return searchableText.includes(searchTerm);
  });
}

export function getToolById(id: string): ToolConfig | undefined {
  return TOOLS_CONFIG.find(tool => tool.id === id && tool.publicationStatus !== 'ready' && tool.publicationStatus !== 'draft');
}

export function getToolsByCategory(category: Category): ToolConfig[] {
  return TOOLS_CONFIG.filter(tool => tool.category === category && tool.publicationStatus !== 'ready' && tool.publicationStatus !== 'draft');
}
