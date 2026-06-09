import { useParams, Navigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Clock,
  Calendar,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Share2,
  Copy,
  Check,
  BookOpen,
  Lightbulb,
  TrendingUp,
  Award,
  CheckCircle2,
  ListChecks,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getBlogPostBySlug, getRelatedPosts } from "@/data/blog-content";
import { getToolById } from "@/data/tools-config";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MarkdownContent } from "@/lib/markdown";
import { trackBlogRead } from "@/utils/analytics";
import React, { useState, useEffect, useRef } from "react";

const SITE_URL = "https://crepika.com";

const CATEGORY_GRADIENTS: Record<string, string> = {
  guide: "from-blue-600/20 to-cyan-500/10",
  tips: "from-violet-600/20 to-purple-500/10",
  insights: "from-amber-500/20 to-orange-500/10",
  "case-study": "from-emerald-600/20 to-teal-500/10",
};

const CATEGORY_ACCENT: Record<string, string> = {
  guide: "text-blue-500 bg-blue-500/10",
  tips: "text-violet-500 bg-violet-500/10",
  insights: "text-amber-500 bg-amber-500/10",
  "case-study": "text-emerald-500 bg-emerald-500/10",
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  guide: BookOpen,
  tips: Lightbulb,
  insights: TrendingUp,
  "case-study": Award,
};

const SECTION_ACCENTS = [
  "border-cyan-400/50 bg-cyan-400/10 text-cyan-200",
  "border-amber-400/50 bg-amber-400/10 text-amber-200",
] as const;

const READING_POINT_ACCENTS = [
  "border-cyan-400/25 bg-cyan-400/[0.04] text-cyan-200",
  "border-amber-400/25 bg-amber-400/[0.04] text-amber-200",
] as const;
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

const CATEGORY_OG_IMAGES: Record<string, string> = {
  guide: `${SITE_URL}/images/og-guide.png`,
  tips: `${SITE_URL}/images/og-tips.png`,
  insights: `${SITE_URL}/images/og-insights.png`,
  "case-study": `${SITE_URL}/images/og-case-study.png`,
};

const AUTHOR_BIOS: Record<string, string> = {
  이지수:
    "수백 명의 크리에이터·브랜드 SNS 성장을 컨설팅한 소셜 미디어 스페셜리스트. 인스타그램·유튜브·X 알고리즘 분석을 기반으로 실전에서 바로 쓰는 콘텐츠 전략을 공유합니다.",
  김민혁:
    "10년차 디지털 마케터이자 SEO 전략가. 데이터 기반 콘텐츠 최적화 전문가로 활동하며, 구글·네이버 양대 검색 생태계에서 크리에이터들이 더 빛날 수 있도록 돕고 있습니다.",
  박준영:
    "크레피카 수석 개발자. 사용자 데이터 보안과 도구 성능을 책임지며, 모든 도구가 브라우저 내에서 빠르고 안전하게 작동하도록 아키텍처를 설계·운영하고 있습니다.",
};

const AUTHOR_AVATARS: Record<string, string> = {
  이지수: "/images/avatar-leejisu.svg",
  김민혁: "/images/avatar-kimminhy.svg",
  박준영: "/images/avatar-parkjy.svg",
};

function estimateWordCount(post: NonNullable<ReturnType<typeof getBlogPostBySlug>>) {
  const raw = [
    post.content.introduction,
    ...post.content.sections.flatMap((section) => [
      section.heading ?? section.title ?? "",
      section.content,
      ...(section.subsections?.flatMap((sub) => [sub.subheading, sub.content]) ?? []),
    ]),
    post.content.conclusion,
    ...(post.faq?.flatMap((item) => [item.question, item.answer]) ?? []),
  ].join(" ");

  return raw
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`>#-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const conclusionRef = useRef<HTMLElement>(null);

  const post = slug ? getBlogPostBySlug(slug) : undefined;

  const relatedPosts = getRelatedPosts(slug, 3);
  const relatedTools = post?.relatedTools
    .map((id) => getToolById(id))
    .filter(Boolean) ?? [];

  const canonicalUrl = post ? `${SITE_URL}/blog/${post.slug}` : `${SITE_URL}/blog`;
  const ogImage = post ? CATEGORY_OG_IMAGES[post.category] || DEFAULT_OG_IMAGE : DEFAULT_OG_IMAGE;
  const dateModified = post ? post.dateModified || post.publishDate : undefined;

  const CATEGORY_LABELS_KO: Record<string, string> = {
    guide: "가이드",
    tips: "팁 & 트릭",
    insights: "인사이트",
    "case-study": "케이스 스터디",
  };

  const wordCount = post ? estimateWordCount(post) : 0;

  const articleSchema = post ? {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    wordCount,
    image: {
      "@type": "ImageObject",
      url: ogImage,
      width: 1200,
      height: 630,
    },
    datePublished: post.publishDate,
    dateModified: dateModified,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    author: {
      "@type": "Person",
      "@id": `${SITE_URL}/about#${post.author === "김민혁" ? "kimminhy" : post.author === "이지수" ? "leejisu" : "parkjy"}`,
      name: post.author,
      url: `${SITE_URL}/about`,
      description: AUTHOR_BIOS[post.author] ?? "크레피카 콘텐츠 팀",
      image: AUTHOR_AVATARS[post.author]
        ? `${SITE_URL}${AUTHOR_AVATARS[post.author]}`
        : undefined,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "크레피카",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
      },
    },
    keywords: post.keywords.join(", "),
    inLanguage: "ko-KR",
    articleSection: CATEGORY_LABELS_KO[post.category] ?? post.category,
    timeRequired: `PT${post.readTime.replace("분", "M")}`,
    isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website` },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "h2", ".prose p:first-of-type"],
    },
  } : null;

  const faqSchema = post?.faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: post.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      }
    : null;

  const breadcrumbSchema = post ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "블로그",
        item: `${SITE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: canonicalUrl,
      },
    ],
  } : null;

  useEffect(() => {
    if (!post) return;
    const el = conclusionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackBlogRead(post.slug, post.category);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [post]);

  if (!post) return <Navigate to="/blog" replace />;

  return (
    <>
      <Helmet>
        <title>{post.title} | 크레피카 블로그</title>
        <meta name="description" content={post.description} />
        <meta name="keywords" content={post.keywords.join(", ")} />
        <meta
          name="robots"
          content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="크레피카" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="article:published_time" content={post.publishDate} />
        <meta property="article:modified_time" content={dateModified} />
        <meta property="article:author" content={post.author} />
        <meta
          property="article:section"
          content={CATEGORY_LABELS_KO[post.category] ?? post.category}
        />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={post.title} />
        <meta property="og:locale" content="ko_KR" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.description} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:image:alt" content={post.title} />
        {post.keywords.map((kw, i) => (
          <meta key={i} property="article:tag" content={kw} />
        ))}

        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
        {faqSchema && (
          <script type="application/ld+json">
            {JSON.stringify(faqSchema)}
          </script>
        )}
      </Helmet>

      <ReadingProgressBar />
      <article className="container px-4 py-12 mx-auto max-w-4xl">
        {/* Breadcrumb */}
        <nav
          aria-label="breadcrumb"
          className="flex items-center gap-2 text-sm text-muted-foreground mb-8"
        >
          <Link to="/" className="hover:text-primary transition-colors">
            홈
          </Link>
          <span>/</span>
          <Link to="/blog" className="hover:text-primary transition-colors">
            블로그
          </Link>
          <span>/</span>
          <span className="text-foreground line-clamp-1">{post.title}</span>
        </nav>

        {/* Category Hero Banner */}
        {(() => {
          const Icon = CATEGORY_ICONS[post.category] ?? BookOpen;
          return (
            <div
              className={`w-full rounded-2xl bg-gradient-to-br ${CATEGORY_GRADIENTS[post.category] ?? "from-primary/20 to-primary/10"} border border-primary/10 p-6 mb-8 flex items-center gap-5`}
            >
              <div
                className={`p-3 rounded-xl ${CATEGORY_ACCENT[post.category] ?? "text-primary bg-primary/10"} flex-shrink-0`}
              >
                <Icon className="h-9 w-9" />
              </div>
              <div>
                <Badge variant="secondary" className="mb-1">
                  {CATEGORY_LABELS_KO[post.category] ?? post.category}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {post.readTime} 읽기 · {post.author}
                </p>
              </div>
            </div>
          );
        })()}

        {/* Header */}
        <header className="mb-12">
          <Badge variant="outline" className="mb-4">
            {CATEGORY_LABELS_KO[post.category] ?? post.category}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {post.title}
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            {post.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.publishDate}>{post.publishDate}</time>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{post.readTime} 읽기</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {post.keywords.map((kw, idx) => (
              <Badge key={idx} variant="secondary">
                {kw}
              </Badge>
            ))}
          </div>
        </header>

        <Separator className="my-8" />

        {/* Table of Contents */}
        {post.content.sections.length >= 3 && (
          <TableOfContents sections={post.content.sections} />
        )}

        <ReadingPoints
          sections={post.content.sections}
          keywords={post.keywords}
        />

        {/* Introduction */}
        <section className="mb-12 rounded-lg border border-cyan-400/20 bg-cyan-400/5 p-5 md:p-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-cyan-200">
            <Lightbulb className="h-4 w-4" />
            핵심 요약
          </div>
          <MarkdownContent
            content={post.content.introduction}
            className="text-lg [&_p:last-child]:mb-0"
          />
        </section>

        {/* Main Sections */}
        {post.content.sections.map((section, idx) => (
          <React.Fragment key={idx}>
            <section className="mb-12">
              <h2
                className="mb-6 flex scroll-mt-24 items-start gap-3 text-3xl font-bold leading-tight"
                id={`section-${idx}`}
              >
                <span
                  className={`mt-1 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border text-sm font-bold ${SECTION_ACCENTS[idx % SECTION_ACCENTS.length]}`}
                >
                  {idx + 1}
                </span>
                <span>{section.heading ?? section.title}</span>
              </h2>
              <MarkdownContent content={section.content} />

              {section.subsections?.map((sub, subIdx) => (
                <div
                  key={subIdx}
                  className="ml-2 mb-6 mt-6 border-l-4 border-amber-400/30 bg-amber-400/[0.03] pl-4"
                >
                  <h3 className="text-2xl font-semibold mb-4">
                    {sub.subheading}
                  </h3>
                  <MarkdownContent content={sub.content} />
                </div>
              ))}
            </section>
          </React.Fragment>
        ))}

        {/* Conclusion */}
        <section
          ref={conclusionRef}
          className="mb-12 rounded-lg border border-amber-400/20 bg-amber-400/5 p-6"
        >
          <h2 className="text-2xl font-bold mb-4 text-amber-100">결론</h2>
          <MarkdownContent content={post.content.conclusion} />
        </section>

        {/* Author / E-E-A-T */}
        <section className="mb-16 bg-card border rounded-3xl p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <Avatar className="w-24 h-24 border-2 border-primary/10">
              <AvatarImage
                src={
                  AUTHOR_AVATARS[post.author] ?? "/images/avatar-kimminhy.svg"
                }
                alt={post.author}
              />
              <AvatarFallback>{post.author.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-sm font-semibold text-primary mb-1">
                저자 소개
              </h3>
              <div className="text-2xl font-bold mb-3">{post.author}</div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {AUTHOR_BIOS[post.author] ??
                  "크레피카 콘텐츠 팀 소속. 크리에이터를 위한 실전 디지털 마케팅과 SEO 전략을 연구합니다."}
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                팀 전체 소개 보기 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        {post.faq && post.faq.length > 0 && (
          <section className="mb-12 content-lazy">
            <h2 className="text-3xl font-bold mb-6">자주 묻는 질문 (FAQ)</h2>
            <Accordion type="single" collapsible className="w-full">
              {post.faq.map((item, idx) => (
                <AccordionItem key={idx} value={`faq-${idx}`}>
                  <AccordionTrigger className="text-left">
                    <span className="font-semibold">{item.question}</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {item.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )}

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <section className="mb-12 content-lazy">
            <h2 className="text-2xl font-bold mb-6">
              이 글과 관련된 무료 도구
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedTools.map((tool) => (
                <Link key={tool.id} to={tool.path} className="group">
                  <Card className="transition-all hover:shadow-lg hover:border-primary/50">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="group-hover:text-primary transition-colors">
                          {tool.titleKo}
                        </span>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {tool.descriptionKo}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        <Separator className="my-12" />

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mb-12 content-lazy">
            <h2 className="text-2xl font-bold mb-6">관련 글 더 보기</h2>
            <div className="space-y-4">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.slug}
                  to={`/blog/${rp.slug}`}
                  className="block group"
                >
                  <Card className="transition-all hover:shadow-md hover:border-primary/50">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="group-hover:text-primary transition-colors mb-2">
                            {rp.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {rp.description}
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        <ShareButtons url={canonicalUrl} title={post.title} />

        <div className="flex justify-between items-center pt-8 border-t">
          <Link to="/blog">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> 블로그 목록으로
            </Button>
          </Link>
          <Link to="/">
            <Button className="gap-2">
              무료 도구 사용하기 <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </article>
    </>
  );
}

function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(
        docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0,
      );
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50 bg-transparent">
      <div
        className="h-full bg-primary transition-all duration-75 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function TableOfContents({
  sections,
}: {
  sections: { heading?: string; title?: string }[];
}) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const handler = () => {
      let idx = 0;
      sections.forEach((_, i) => {
        const el = document.getElementById(`section-${i}`);
        if (el && el.getBoundingClientRect().top <= 120) idx = i;
      });
      setActive(idx);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [sections]);
  return (
    <nav className="mb-8 rounded-xl border border-cyan-400/15 bg-muted/30 p-5 text-sm">
      <p className="mb-3 flex items-center gap-2 font-semibold text-foreground">
        <ListChecks className="h-4 w-4 text-cyan-300" />
        목차
      </p>
      <ol className="space-y-1.5 list-none">
        {sections.map((s, i) => (
          <li key={i}>
            <a
              href={`#section-${i}`}
              className={`block px-2 py-1 rounded transition-colors ${active === i ? "text-primary font-semibold bg-primary/10" : "text-muted-foreground hover:text-primary"}`}
            >
              {i + 1}. {s.heading ?? s.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function ReadingPoints({
  sections,
  keywords,
}: {
  sections: { heading?: string; title?: string }[];
  keywords: string[];
}) {
  const points = sections.slice(0, 4);
  if (points.length === 0) return null;

  return (
    <section className="mb-10 rounded-xl border bg-card/60 p-5">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">읽기 포인트</p>
          <h2 className="text-xl font-bold">이 글에서 바로 확인할 내용</h2>
        </div>
        {keywords[0] && (
          <Badge variant="secondary" className="w-fit">
            {keywords[0]}
          </Badge>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {points.map((section, idx) => (
          <a
            key={idx}
            href={`#section-${idx}`}
            className={`group rounded-lg border p-4 transition-colors hover:border-primary/40 ${READING_POINT_ACCENTS[idx % READING_POINT_ACCENTS.length]}`}
          >
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              포인트 {idx + 1}
            </div>
            <p className="line-clamp-2 text-sm leading-relaxed text-foreground group-hover:text-primary">
              {section.heading ?? section.title}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}

function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;

  return (
    <div className="my-8 py-6 border-y">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Share2 className="h-4 w-4" />이 글이 도움이 됐다면 공유해주세요
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-background hover:bg-muted text-sm font-medium transition-colors"
            aria-label="X(트위터)에 공유"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            X 공유
          </a>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "복사됨!" : "링크 복사"}
          </Button>
        </div>
      </div>
    </div>
  );
}
