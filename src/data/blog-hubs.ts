import type { BlogPostMeta } from "./blog-posts-meta";

export interface BlogHub {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  match: RegExp;
  primaryToolPaths: string[];
}

export const BLOG_HUBS: BlogHub[] = [
  {
    slug: "seo",
    title: "SEO 콘텐츠 최적화 허브",
    description:
      "검색 노출, 구조화 데이터, 사이트맵, 메타 태그, 내부 링크를 한 번에 점검하는 SEO 가이드 모음입니다.",
    keywords: ["seo", "검색", "sitemap", "robots", "schema", "canonical", "meta", "네이버", "구글"],
    match: /seo|search|google|naver|sitemap|robots|schema|canonical|meta|검색|네이버|구글/i,
    primaryToolPaths: [
      "/tools/seo-title-length-checker",
      "/tools/meta-description-checker",
      "/tools/h-tag-structure-checker",
      "/tools/internal-link-anchor-planner",
    ],
  },
  {
    slug: "instagram",
    title: "인스타그램 콘텐츠 운영 허브",
    description:
      "인스타그램 캡션, 해시태그, 릴스, 스토리, 프로필 최적화를 실행 중심으로 정리한 가이드 모음입니다.",
    keywords: ["instagram", "인스타그램", "reels", "릴스", "hashtag", "해시태그", "caption", "캡션"],
    match: /instagram|insta|reels|hashtag|caption|인스타|인스타그램|릴스|해시태그|캡션/i,
    primaryToolPaths: [
      "/tools/insta-spacer",
      "/tools/hashtag-mixer",
      "/tools/instagram-caption-builder",
      "/tools/reels-hook-bank-builder",
    ],
  },
  {
    slug: "adsense",
    title: "애드센스 수익화 준비 허브",
    description:
      "애드센스 검수, RPM 계산, 콘텐츠 품질, 정책 페이지, 자동광고 운영을 점검하는 수익화 가이드 모음입니다.",
    keywords: ["adsense", "애드센스", "rpm", "광고", "수익", "monetization", "policy"],
    match: /adsense|rpm|ad|revenue|monetization|광고|수익|애드센스|정책/i,
    primaryToolPaths: [
      "/tools/adsense-rpm-calculator",
      "/tools/adsense-cpc-calculator",
      "/tools/content-roi-calculator",
      "/tools/eeat-signal-checker",
    ],
  },
  {
    slug: "creator-tools",
    title: "크리에이터 무료 도구 허브",
    description:
      "글자수, 바이트, WebP, QR, UTM, CTR처럼 발행 전후에 바로 쓰는 무료 브라우저 도구 모음입니다.",
    keywords: ["tool", "tools", "creator", "크리에이터", "도구", "webp", "qr", "utm", "ctr", "글자수"],
    match: /tool|tools|creator|webp|qr|utm|ctr|counter|도구|크리에이터|글자수|바이트/i,
    primaryToolPaths: [
      "/tools/text-counter",
      "/tools/byte-counter",
      "/tools/webp-converter",
      "/tools/qr-generator",
    ],
  },
];

export function getHubBySlug(slug?: string) {
  return BLOG_HUBS.find((hub) => hub.slug === slug);
}

export function getPostsForHub(posts: BlogPostMeta[], hub: BlogHub) {
  return posts
    .filter((post) =>
      hub.match.test(
        [post.slug, post.title, post.description, post.category, ...post.keywords].join(" "),
      ),
    )
    .slice(0, 36);
}
