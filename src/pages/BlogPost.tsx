import { useParams, Navigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Clock, Calendar, ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getBlogPostBySlug, getRelatedPosts } from "@/data/blog-content";
import { getToolById } from "@/data/tools-config";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function BlogPost() {
    const { slug } = useParams<{ slug: string }>();

    if (!slug) {
        return <Navigate to="/blog" replace />;
    }

    const post = getBlogPostBySlug(slug);

    if (!post) {
        return <Navigate to="/blog" replace />;
    }

    const relatedPosts = getRelatedPosts(slug, 3);
    const relatedTools = post.relatedTools
        .map(toolId => getToolById(toolId))
        .filter(Boolean);

    // Generate FAQ Schema
    const faqSchema = post.faq ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": post.faq.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    } : null;

    // Generate Article Schema
    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "description": post.description,
        "datePublished": post.publishDate,
        "author": {
            "@type": "Person",
            "name": post.author
        },
        "publisher": {
            "@type": "Organization",
            "name": "크레피카",
            "logo": {
                "@type": "ImageObject",
                "url": "https://crepika.com/favicon.ico"
            }
        },
        "keywords": post.keywords.join(", ")
    };

    return (
        <>
            <Helmet>
                <title>{post.title} | 크레피카 블로그</title>
                <meta name="description" content={post.description} />
                <meta name="keywords" content={post.keywords.join(", ")} />
                <link rel="canonical" href={`https://crepika.com/blog/${post.slug}`} />

                {/* Open Graph */}
                <meta property="og:title" content={post.title} />
                <meta property="og:description" content={post.description} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={`https://crepika.com/blog/${post.slug}`} />
                <meta property="article:published_time" content={post.publishDate} />
                <meta property="article:author" content="크레피카" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={post.title} />
                <meta name="twitter:description" content={post.description} />

                {/* Structured Data */}
                <script type="application/ld+json">
                    {JSON.stringify(articleSchema)}
                </script>
                {faqSchema && (
                    <script type="application/ld+json">
                        {JSON.stringify(faqSchema)}
                    </script>
                )}
            </Helmet>

            <article className="container px-4 py-12 mx-auto max-w-4xl">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                    <Link to="/" className="hover:text-primary transition-colors">홈</Link>
                    <span>/</span>
                    <Link to="/blog" className="hover:text-primary transition-colors">블로그</Link>
                    <span>/</span>
                    <span className="text-foreground">{post.title}</span>
                </nav>

                {/* Header */}
                <header className="mb-12">
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
                        {post.keywords.map((keyword, index) => (
                            <Badge key={index} variant="secondary">
                                {keyword}
                            </Badge>
                        ))}
                    </div>
                </header>

                <Separator className="my-8" />

                {/* Introduction */}
                <section className="prose prose-slate dark:prose-invert max-w-none mb-12">
                    <p className="text-lg leading-relaxed whitespace-pre-line">
                        {post.content.introduction}
                    </p>
                </section>

                {/* Main Content Sections */}
                {post.content.sections.map((section, index) => (
                    <section key={index} className="mb-12">
                        <h2 className="text-3xl font-bold mb-6" id={`section-${index}`}>
                            {section.heading}
                        </h2>
                        <div className="prose prose-slate dark:prose-invert max-w-none">
                            <p className="text-lg leading-relaxed whitespace-pre-line mb-6">
                                {section.content}
                            </p>
                        </div>

                        {section.subsections && section.subsections.map((subsection, subIndex) => (
                            <div key={subIndex} className="ml-4 mb-6 pl-4 border-l-4 border-primary/20">
                                <h3 className="text-2xl font-semibold mb-4">
                                    {subsection.subheading}
                                </h3>
                                <div className="prose prose-slate dark:prose-invert max-w-none">
                                    <p className="text-base leading-relaxed whitespace-pre-line">
                                        {subsection.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </section>
                ))}

                {/* Conclusion */}
                <section className="mb-12 bg-muted/30 rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">결론</h2>
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        <p className="text-lg leading-relaxed whitespace-pre-line">
                            {post.content.conclusion}
                        </p>
                    </div>
                </section>

                {/* Author Info / E-E-A-T Box */}
                <section className="mb-16 bg-card border rounded-3xl p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <Avatar className="w-24 h-24 border-2 border-primary/10">
                            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" alt={post.author} />
                            <AvatarFallback>{post.author.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-sm font-semibold text-primary mb-1">Meet the Author</h3>
                            <div className="text-2xl font-bold mb-3">{post.author}</div>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                10년차 디지털 마케터이자 SEO 전략가입니다. 데이터 기반의 콘텐츠 최적화 전문가로 활동하며,
                                크리에이터들이 검색 결과에서 더 높은 가치를 인정받을 수 있도록 돕고 있습니다.
                            </p>
                            <Link
                                to="/about"
                                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                            >
                                팀 전체 소개 보기
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                {post.faq && post.faq.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold mb-6">자주 묻는 질문 (FAQ)</h2>
                        <Accordion type="single" collapsible className="w-full">
                            {post.faq.map((item, index) => (
                                <AccordionItem key={index} value={`faq-${index}`}>
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

                {/* Related Tools CTA */}
                {relatedTools.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-6">이 글과 관련된 무료 도구</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {relatedTools.map((tool) => (
                                <Link
                                    key={tool.id}
                                    to={tool.path}
                                    className="group"
                                >
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
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-6">관련 글 더 보기</h2>
                        <div className="space-y-4">
                            {relatedPosts.map((relatedPost) => (
                                <Link
                                    key={relatedPost.slug}
                                    to={`/blog/${relatedPost.slug}`}
                                    className="block group"
                                >
                                    <Card className="transition-all hover:shadow-md hover:border-primary/50">
                                        <CardHeader>
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <CardTitle className="group-hover:text-primary transition-colors mb-2">
                                                        {relatedPost.title}
                                                    </CardTitle>
                                                    <CardTitle className="text-sm text-muted-foreground line-clamp-2">
                                                        {relatedPost.description}
                                                    </CardTitle>
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

                {/* Navigation */}
                <div className="flex justify-between items-center pt-8 border-t">
                    <Link to="/blog">
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            블로그 목록으로
                        </Button>
                    </Link>
                    <Link to="/">
                        <Button className="gap-2">
                            무료 도구 사용하기
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </article>
        </>
    );
}
