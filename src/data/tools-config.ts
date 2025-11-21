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
  },
];

export const CATEGORY_LABELS: Record<Category, string> = {
  plan: 'Plan',
  create: 'Create',
  publish: 'Publish',
  analyze: 'Analyze',
};

export function getToolById(id: string): ToolConfig | undefined {
  return TOOLS_CONFIG.find(tool => tool.id === id);
}

export function getToolsByCategory(category: Category): ToolConfig[] {
  return TOOLS_CONFIG.filter(tool => tool.category === category);
}
