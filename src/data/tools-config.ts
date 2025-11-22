export type AdStrategy = 'instant' | 'process_heavy' | 'download_focused';
export type Category = 'plan' | 'create' | 'publish' | 'analyze';

export interface ToolConfig {
  id: string;
  category: Category;
  path: string;
  
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
];

export const CATEGORY_LABELS: Record<Category, string> = {
  plan: '기획',
  create: '제작',
  publish: '발행',
  analyze: '분석',
};

export function searchTools(query: string): ToolConfig[] {
  if (!query.trim()) return TOOLS_CONFIG;
  
  const searchTerm = query.toLowerCase();
  return TOOLS_CONFIG.filter(tool => {
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
  return TOOLS_CONFIG.find(tool => tool.id === id);
}

export function getToolsByCategory(category: Category): ToolConfig[] {
  return TOOLS_CONFIG.filter(tool => tool.category === category);
}
