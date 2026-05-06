import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Clock, Calendar, ArrowRight, Tag, User, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllBlogPosts, BlogPost } from "@/data/blog-content";
import { Input } from "@/components/ui/input";
import { useMemo } from "react";

const CATEGORY_LABELS: Record<BlogPost['category'], string> = {
    'guide': '가이드',
    'tips': '팁 & 트릭',
    'insights': '인사이트',
    'case-study': '케이스 스터디'
};

const CATEGORY_THUMBNAILS: Record<BlogPost['category'], string> = {
    'guide': '/images/og-guide.svg',
    'tips': '/images/og-tips.svg',
    'insights': '/images/og-insights.svg',
    'case-study': '/images/og-case-study.svg',
};

const POSTS_PER_PAGE = 12;

const VALID_CATEGORIES = ['guide', 'tips', 'insights', 'case-study'] as const;

export default function BlogList() {
    const allPosts = getAllBlogPosts();
    const [searchParams, setSearchParams] = useSearchParams();

    const rawCat = searchParams.get('category') ?? 'all';
    const selectedCategory: BlogPost['category'] | 'all' =
        (VALID_CATEGORIES as readonly string[]).includes(rawCat)
            ? (rawCat as BlogPost['category'])
            : 'all';

    const searchQuery = searchParams.get('q') ?? '';

    const rawPage = parseInt(searchParams.get('page') ?? '1', 10);
    const currentPage = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://crepika.com" },
            { "@type": "ListItem", "position": 2, "name": "크리에이터 블로그", "item": "https://crepika.com/blog" }
        ]
    };

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
            "itemListElement": allPosts.slice(0, 20).map((post, idx) => ({
                "@type": "ListItem",
                "position": idx + 1,
                "url": `https://crepika.com/blog/${post.slug}`,
                "name": post.title,
                "description": post.description
            }))
        }
    }), [allPosts]);

    const filteredPosts = useMemo(() => {
        let posts = selectedCategory === 'all' ? allPosts : allPosts.filter(p => p.category === selectedCategory);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            posts = posts.filter(p =>
                p.title.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                p.keywords.some(k => k.toLowerCase().includes(q))
            );
        }
        return posts;
    }, [allPosts, selectedCategory, searchQuery]);

    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
    const paginatedPosts = filteredPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

    const buildParams = (overrides: Record<string, string>) => {
        const base: Record<string, string> = {};
        if (selectedCategory !== 'all') base.category = selectedCategory;
        if (searchQuery) base.q = searchQuery;
        return { ...base, ...overrides };
    };

    const handleCategoryChange = (cat: BlogPost['category'] | 'all') => {
        const params: Record<string, string> = {};
        if (cat !== 'all') params.category = cat;
        if (searchQuery) params.q = searchQuery;
        setSearchParams(params, { replace: true });
    };

    const handleSearchChange = (value: string) => {
        const params: Record<string, string> = {};
        if (selectedCategory !== 'all') params.category = selectedCategory;
        if (value) params.q = value;
        setSearchParams(params, { replace: true });
    };

    const handlePageChange = (page: number) => {
        const params = buildParams(page > 1 ? { page: String(page) } : {});
        delete params.page;
        if (page > 1) params.page = String(page);
        setSearchParams(params, { replace: true });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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
                <meta property="og:site_name" content="크레피카" />
                <meta property="og:url" content="https://crepika.com/blog" />
                <meta property="og:locale" content="ko_KR" />
                <meta property="og:image" content="https://crepika.com/og-image.svg" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:image:alt" content="크레피카 크리에이터 블로그" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:image" content="https://crepika.com/og-image.svg" />
                <script type="application/ld+json">{JSON.stringify(collectionSchema)}</script>
                <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
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

                {/* Search Bar */}
                <div className="max-w-lg mx-auto mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="제목, 키워드로 검색..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-10 h-11"
                            aria-label="블로그 검색"
                        />
                    </div>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 justify-center mb-12">
                    <Badge
                        variant={selectedCategory === 'all' ? 'default' : 'outline'}
                        className="cursor-pointer px-4 py-2"
                        onClick={() => handleCategoryChange('all')}
                    >
                        전체
                    </Badge>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <Badge
                            key={key}
                            variant={selectedCategory === key ? 'default' : 'outline'}
                            className="cursor-pointer px-4 py-2"
                            onClick={() => handleCategoryChange(key as BlogPost['category'])}
                        >
                            {label}
                        </Badge>
                    ))}
                </div>

                {/* Blog Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedPosts.map((post) => (
                        <Link
                            key={post.slug}
                            to={`/blog/${post.slug}`}
                            className="group"
                        >
                            <Card className="h-full transition-all hover:shadow-lg hover:scale-105 hover:border-primary/50 overflow-hidden">
                                <div className="w-full h-36 overflow-hidden">
                                    <img
                                        src={CATEGORY_THUMBNAILS[post.category]}
                                        alt={CATEGORY_LABELS[post.category]}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        width="1200"
                                        height="630"
                                    />
                                </div>
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
                                        <div className="flex items-center gap-1 ml-auto">
                                            <User className="h-3 w-3" />
                                            <span className="text-xs">{post.author}</span>
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
                            {searchQuery ? `"${searchQuery}"에 해당하는 글이 없습니다.` : '해당 카테고리의 글이 아직 없습니다.'}
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                        <button
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40 hover:bg-muted transition-colors"
                        >
                            이전
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                            .reduce<(number | '...')[]>((acc, p, i, arr) => {
                                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...');
                                acc.push(p);
                                return acc;
                            }, [])
                            .map((p, i) =>
                                p === '...' ? (
                                    <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">…</span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => handlePageChange(p as number)}
                                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${currentPage === p ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}
                                    >
                                        {p}
                                    </button>
                                )
                            )
                        }
                        <button
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40 hover:bg-muted transition-colors"
                        >
                            다음
                        </button>
                        <span className="text-sm text-muted-foreground ml-2">
                            {currentPage}/{totalPages} 페이지 ({filteredPosts.length}개)
                        </span>
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
