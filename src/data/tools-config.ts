export type AdStrategy = 'instant' | 'process_heavy' | 'download_focused';
export type Category = 'plan' | 'create' | 'publish' | 'analyze';

export interface ToolConfig {
  id: string;
  category: Category;
  title: string;
  description: string;
  path: string;
  oneLineProblem: string;
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
    title: 'Text Counter',
    description: 'Count characters and words instantly. Korean-optimized with byte counting for Naver standards.',
    path: '/tools/text-counter',
    oneLineProblem: 'Need to know exact character count for social media posts?',
    keywords: ['text counter', 'character count', 'word count', 'korean text', 'byte counter'],
    adStrategy: 'instant',
    seoTitle: 'Text Counter - Character & Word Count Tool | CrePic',
    seoDescription: 'Count characters, words, and bytes instantly. Korean-optimized text counter for social media, SEO, and content creation. Free and instant results.',
    schemaType: 'SoftwareApplication',
  },
  {
    id: 'lorem-generator',
    category: 'plan',
    title: 'Lorem Ipsum Generator',
    description: 'Generate dummy text for designs and mockups. English and Korean lorem ipsum in seconds.',
    path: '/tools/lorem-generator',
    oneLineProblem: '디자인이나 시안을 위한 더미 텍스트를 3초 만에 만듭니다.',
    keywords: ['lorem ipsum', 'dummy text', 'placeholder text', 'korean lorem', 'text generator'],
    adStrategy: 'instant',
    seoTitle: 'Lorem Ipsum Generator - English & Korean Dummy Text | CrePic',
    seoDescription: 'Generate lorem ipsum dummy text for designs and mockups. Supports English and Korean. Choose short, medium, or long paragraphs.',
    schemaType: 'SoftwareApplication',
  },
  {
    id: 'webp-converter',
    category: 'create',
    title: 'WebP Converter',
    description: 'Convert JPG/PNG to WebP format for faster website loading. Optimize images with 80% quality.',
    path: '/tools/webp-converter',
    oneLineProblem: 'Images too large? Convert to WebP for faster loading.',
    keywords: ['webp converter', 'image optimizer', 'jpg to webp', 'png to webp', 'compress image'],
    adStrategy: 'process_heavy',
    seoTitle: 'WebP Converter - Fast Image Optimizer | CrePic',
    seoDescription: 'Convert JPG/PNG to WebP format for faster loading. Optimize images with 80% quality. Free browser-based converter.',
    schemaType: 'SoftwareApplication',
  },
  {
    id: 'insta-spacer',
    category: 'publish',
    title: 'Instagram Line Break Formatter',
    description: 'Format Instagram captions to preserve line breaks. Fix broken formatting in 3 seconds.',
    path: '/tools/insta-spacer',
    oneLineProblem: '인스타에 올리면 줄바꿈이 깨지는 캡션을 3초 만에 정리합니다.',
    keywords: ['instagram', 'line break', 'caption formatter', 'instagram spacing', 'social media'],
    adStrategy: 'instant',
    seoTitle: 'Instagram Line Break Formatter - Fix Caption Spacing | CrePic',
    seoDescription: 'Format Instagram captions to preserve line breaks and spacing. Prevent broken formatting when posting. Free and instant.',
    schemaType: 'SoftwareApplication',
  },
  {
    id: 'hashtag-mixer',
    category: 'publish',
    title: 'Hashtag Mixer',
    description: 'Shuffle and organize up to 30 hashtags. Remove duplicates and randomize order instantly.',
    path: '/tools/hashtag-mixer',
    oneLineProblem: '최대 30개의 해시태그를 깔끔하게 섞어서 붙여넣기용으로 만들어 줍니다.',
    keywords: ['hashtag', 'instagram hashtags', 'shuffle hashtags', 'hashtag mixer', 'social media'],
    adStrategy: 'instant',
    seoTitle: 'Hashtag Mixer - Shuffle & Organize Social Media Tags | CrePic',
    seoDescription: 'Shuffle and organize up to 30 hashtags for Instagram and social media. Remove duplicates and randomize order instantly.',
    schemaType: 'SoftwareApplication',
  },
  {
    id: 'qr-generator',
    category: 'analyze',
    title: 'QR Code Generator',
    description: 'Generate QR codes instantly from URLs. Free, fast, and download as PNG in one click.',
    path: '/tools/qr-generator',
    oneLineProblem: 'Need a QR code for your link right now?',
    keywords: ['qr code', 'qr generator', 'url to qr', 'free qr code', 'qr code maker'],
    adStrategy: 'download_focused',
    seoTitle: 'QR Code Generator - Free URL to QR Converter | CrePic',
    seoDescription: 'Generate QR codes from URLs instantly. Free, fast, and download as PNG in one click. No login required.',
    schemaType: 'SoftwareApplication',
  },
  {
    id: 'byte-counter',
    category: 'plan',
    title: 'Korean Byte Counter',
    description: 'Count bytes for Naver SEO optimization. UTF-8 byte counting with Korean character support.',
    path: '/tools/byte-counter',
    oneLineProblem: '네이버 검색/블로그 최적화를 위해 글자 수 뿐만 아니라 바이트 수까지 한 번에 확인합니다.',
    keywords: ['byte counter', 'korean bytes', 'naver seo', 'utf-8', 'character counter'],
    adStrategy: 'instant',
    seoTitle: 'Korean Byte Counter - Naver SEO Optimizer | CrePic',
    seoDescription: 'Count UTF-8 bytes for Naver SEO optimization. Korean-optimized byte counter with character analysis.',
    schemaType: 'SoftwareApplication',
  },
];

export const CATEGORY_LABELS: Record<Category, string> = {
  plan: 'Plan',
  create: 'Create',
  publish: 'Publish',
  analyze: 'Analyze',
};

export function searchTools(query: string): ToolConfig[] {
  if (!query.trim()) return TOOLS_CONFIG;
  
  const searchTerm = query.toLowerCase();
  return TOOLS_CONFIG.filter(tool => {
    const searchableText = [
      tool.title,
      tool.description,
      tool.oneLineProblem,
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
