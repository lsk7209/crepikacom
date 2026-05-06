import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Clock, Calendar, ArrowRight, Tag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllBlogPosts, BlogPost } from "@/data/blog-content";
import { useState, useMemo } from "react";

const CATEGORY_LABELS: Record<BlogPost['category'], string> = {
    'guide': '가이드',
    'tips': '팁 & 트릭',
    'insights': '인사이트',
    'case-study': '케이스 스터디'
};

export default function BlogList() {
    const allPosts = getAllBlogPosts();
    const [selectedCategory, setSelectedCategory] = useState<BlogPost['category'] | 'all'>('all');

    const collectionSchema = useMemo(() => ({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "크리에이터 블로그",
        "description": "인스타그램 마케팅, 네이버 SEO, 소셜미디어 전략 등 크리에이터를 위한 실전 가이드",
        "url": "https://crepika.com/blog",
        "publisher": {
            "@type": "Organization",
            "name": "크레피카",
            "url": "https://crepika.com"
        },
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": allPosts.length,
            "itemListElement": allPosts.map((post, idx) => ({
                "@type": "ListItem",
                "position": idx + 1,
                "url": `https://crepika.com/blog/${post.slug}`,
                "name": post.title,
                "description": post.description
            }))
        }
    }), [allPosts]);

    const filteredPosts = selectedCategory === 'all'
        ? allPosts
        : allPosts.filter(post => post.category === selectedCategory);

    return (
        <>
            <Helmet>
                <title>크리에이터 블로그 - 마케팅 팁과 가이드 | 크레피카</title>
                <meta
                    name="description"
                    content="인스타그램 마케팅, 네이버 SEO, 소셜미디어 전략 등 크리에이터를 위한 실전 가이드와 팁. 무료로 배우는 디지털 마케팅."
                />
                <meta name="keywords" content="크리에이터 블로그, 마케팅 가이드, 인스타그램 팁, 네이버 SEO, 소셜미디어 전략" />
                <link rel="canonical" href="https://crepika.com/blog" />
                <meta property="og:title" content="크리에이터 블로그 - 마케팅 팁과 가이드 | 크레피카" />
                <meta property="og:description" content="인스타그램 마케팅, 네이버 SEO, 소셜미디어 전략 등 크리에이터를 위한 실전 가이드와 팁" />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://crepika.com/blog" />
                <meta property="og:image" content="https://crepika.com/og-image.svg" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:image" content="https://crepika.com/og-image.svg" />
                <script type="application/ld+json">{JSON.stringify(collectionSchema)}</script>
            </Helmet>

            <div className="container px-4 py-12 mx-auto max-w-7xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">크리에이터 블로그</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        인스타그램, 네이버, 유튜브 등 다양한 플랫폼에서 성공하기 위한
                        실전 마케팅 전략과 팁을 공유합니다.
                    </p>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 justify-center mb-12">
                    <Badge
                        variant={selectedCategory === 'all' ? 'default' : 'outline'}
                        className="cursor-pointer px-4 py-2"
                        onClick={() => setSelectedCategory('all')}
                    >
                        전체
                    </Badge>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <Badge
                            key={key}
                            variant={selectedCategory === key ? 'default' : 'outline'}
                            className="cursor-pointer px-4 py-2"
                            onClick={() => setSelectedCategory(key as BlogPost['category'])}
                        >
                            {label}
                        </Badge>
                    ))}
                </div>

                {/* Blog Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPosts.map((post) => (
                        <Link
                            key={post.slug}
                            to={`/blog/${post.slug}`}
                            className="group"
                        >
                            <Card className="h-full transition-all hover:shadow-lg hover:scale-105 hover:border-primary/50">
                                <CardHeader>
                                    <div className="flex items-center justify-between mb-3">
                                        <Badge variant="outline">
                                            {CATEGORY_LABELS[post.category]}
                                        </Badge>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                                        {post.title}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-3 mt-2">
                                        {post.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>{post.publishDate}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            <span>{post.readTime}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-3">
                                        {post.keywords.slice(0, 3).map((keyword, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                                <Tag className="h-3 w-3 mr-1" />
                                                {keyword}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {filteredPosts.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-lg text-muted-foreground">
                            해당 카테고리의 글이 아직 없습니다.
                        </p>
                    </div>
                )}

                {/* CTA Section */}
                <section className="mt-20 text-center bg-muted/30 rounded-lg p-8">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                        블로그 글이 도움이 되셨나요?
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                        크레피카의 무료 도구들로 배운 내용을 바로 실전에 활용해보세요.
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                        무료 도구 사용하기
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </section>
            </div>
        </>
    );
}
