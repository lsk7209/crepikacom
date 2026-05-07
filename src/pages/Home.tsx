import { Link, useSearchParams } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import { CATEGORY_LABELS, Category, searchTools, getToolById, getToolsByCategory, TOOLS_CONFIG } from "@/data/tools-config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Sparkles, Search, Star, Zap, Lock, Gift,
  MousePointerClick, Type, FileImage, BarChart2, CheckCircle2,
} from "lucide-react";
import { Helmet } from "react-helmet";
import { getRecentTools, getFavoriteTools, toggleFavoriteTool, isFavoriteTool } from "@/utils/localStorage";

const RecentBlogPosts = lazy(() => import("./home/RecentBlogPosts"));

const CATEGORY_COLORS: Record<Category, { bg: string; text: string; border: string }> = {
  plan:    { bg: 'bg-blue-500/10',    text: 'text-blue-500',    border: 'border-blue-500/30' },
  create:  { bg: 'bg-violet-500/10',  text: 'text-violet-500',  border: 'border-violet-500/30' },
  publish: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/30' },
  analyze: { bg: 'bg-orange-500/10',  text: 'text-orange-500',  border: 'border-orange-500/30' },
};

const TOP3_IDS = ['text-counter', 'webp-converter', 'qr-generator'];

const POPULAR_KEYWORDS = ['글자수', 'QR코드', 'WebP변환', '해시태그', '바이트계산'];

const HOW_IT_WORKS = [
  { step: '01', icon: MousePointerClick, title: '도구 선택', desc: '7가지 무료 도구 중 필요한 것을 고르세요. 검색이나 카테고리로 빠르게 찾을 수 있어요.' },
  { step: '02', icon: Type, title: '텍스트 · 파일 입력', desc: '글자, 이미지, URL을 그냥 붙여넣거나 올리세요. 서버 전송 없이 브라우저에서만 처리됩니다.' },
  { step: '03', icon: CheckCircle2, title: '즉시 결과 복사 · 저장', desc: '결과를 바로 복사하거나 파일로 저장하세요. 로그인, 회원가입 없이 완전 무료입니다.' },
];

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? "");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentTools, setRecentTools] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(getFavoriteTools());
    setRecentTools(getRecentTools());
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setSearchParams(value ? { q: value } : {}, { replace: true });
  };

  const handleToggleFavorite = (toolId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavoriteTool(toolId);
    setFavorites(getFavoriteTools());
  };

  const filteredTools = searchTools(searchQuery);
  const categories = ['plan', 'create', 'publish', 'analyze'] as Category[];
  const toolsByCategory = categories.map(category => ({
    category,
    label: CATEGORY_LABELS[category],
    tools: filteredTools.filter(tool => tool.category === category),
  }));
  const hasResults = filteredTools.length > 0;

  const favoriteToolConfigs = favorites.map(id => getToolById(id)).filter(Boolean);
  const recentToolConfigs = recentTools.map(id => getToolById(id)).filter(Boolean);
  const top3Tools = TOP3_IDS.map(id => getToolById(id)).filter(Boolean);

  const renderToolCard = (tool: any, showFavorite = true) => {
    const colors = CATEGORY_COLORS[tool.category as Category];
    return (
      <Link key={tool.id} to={tool.path} className="group relative">
        <Card className={`h-full transition-all hover:shadow-lg hover:scale-[1.02] hover:border-primary/50 border ${colors.border} overflow-hidden`}>
          {showFavorite && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 z-10"
              onClick={(e) => handleToggleFavorite(tool.id, e)}
            >
              <Star className={`h-4 w-4 ${isFavoriteTool(tool.id) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
            </Button>
          )}
          <CardHeader>
            <div className="flex items-start justify-between mb-2">
              <Badge variant="outline" className={`${colors.bg} ${colors.text} border-0 text-xs`}>
                {CATEGORY_LABELS[tool.category]}
              </Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <CardTitle className="group-hover:text-primary transition-colors">{tool.titleKo}</CardTitle>
            <CardDescription className="mt-1 text-xs text-muted-foreground/70">{tool.titleEn}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-1">{tool.oneLineProblemKo}</p>
            <p className="text-xs text-muted-foreground/70">{tool.descriptionKo}</p>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <>
      <Helmet>
        <title>크레피카 | 로그인 없이 3초 만에 끝나는 크리에이터 도구</title>
        <meta name="description" content="국내 크리에이터를 위한 초간편 작업 도구함. 네이버·인스타·유튜브용 글자수, 바이트, 이미지, QR 작업을 3초 안에 끝내세요. 로그인 불필요." />
        <meta name="keywords" content="크리에이터 도구, 무료 온라인 도구, 글자수 세기, qr 생성기, webp 변환, 해시태그 믹서, 인스타그램 도구, 네이버 seo" />
        <link rel="canonical" href="https://crepika.com/" />
        <meta property="og:title" content="크레피카 | 로그인 없이 3초 만에 끝나는 크리에이터 도구" />
        <meta property="og:description" content="국내 크리에이터를 위한 초간편 작업 도구함. 네이버·인스타·유튜브용 글자수, 바이트, 이미지, QR 작업을 3초 안에 끝내세요. 로그인 불필요." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://crepika.com/" />
        <meta property="og:locale" content="ko_KR" />
        <meta property="og:site_name" content="크레피카" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="크레피카 | 로그인 없이 3초 만에 끝나는 크리에이터 도구" />
        <meta name="twitter:description" content="국내 크리에이터를 위한 초간편 작업 도구함. 글자수, 바이트, 이미지, QR 작업을 3초 안에 끝내세요." />
        <meta name="twitter:image" content="https://crepika.com/og-image.png" />
        <meta name="twitter:image:alt" content="크레피카 — 크리에이터 필수 도구함" />
        <link rel="alternate" type="application/rss+xml" title="크레피카 블로그" href="https://crepika.com/rss.xml" />
        <meta property="og:image" content="https://crepika.com/og-image.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="크레피카 — 크리에이터 필수 도구함" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": "https://crepika.com/#organization",
          "name": "크레피카",
          "alternateName": "Crepika",
          "url": "https://crepika.com",
          "logo": { "@type": "ImageObject", "url": "https://crepika.com/og-image.png", "width": 1200, "height": 630 },
          "description": "국내 크리에이터를 위한 무료 온라인 도구 서비스. 로그인 없이 3초 안에 사용 가능한 QR 생성기, 글자수 세기, WebP 변환기 등.",
          "email": "support@crepika.com",
          "areaServed": "KR",
          "knowsLanguage": "ko",
          "contactPoint": { "@type": "ContactPoint", "contactType": "customer support", "email": "support@crepika.com", "availableLanguage": "Korean" },
          "sameAs": ["https://crepika.com/rss.xml"]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": "https://crepika.com/#website",
          "name": "크레피카",
          "url": "https://crepika.com",
          "inLanguage": "ko-KR",
          "publisher": { "@id": "https://crepika.com/#organization" },
          "potentialAction": {
            "@type": "SearchAction",
            "target": { "@type": "EntryPoint", "urlTemplate": "https://crepika.com/?q={search_term_string}" },
            "query-input": "required name=search_term_string"
          }
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "크레피카 무료 크리에이터 도구 목록",
          "description": "로그인 없이 즉시 사용 가능한 크리에이터 도구들",
          "url": "https://crepika.com",
          "numberOfItems": TOOLS_CONFIG.length,
          "itemListElement": TOOLS_CONFIG.map((t, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "name": `${t.titleKo} - ${t.titleEn}`,
            "url": `https://crepika.com${t.path}`,
            "description": t.seoDescription || t.descriptionKo,
          }))
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            { "@type": "Question", "name": "크레피카는 무료인가요?", "acceptedAnswer": { "@type": "Answer", "text": "네, 크레피카의 모든 도구는 완전 무료입니다. 로그인이나 결제 없이 바로 사용할 수 있습니다." } },
            { "@type": "Question", "name": "파일이나 텍스트가 서버에 저장되나요?", "acceptedAnswer": { "@type": "Answer", "text": "아니요. 크레피카의 모든 처리는 브라우저 내에서만 이루어집니다. 입력한 데이터나 파일은 서버로 전송되지 않으며 개인정보가 완벽하게 보호됩니다." } },
            { "@type": "Question", "name": "글자수 세기 도구는 어떤 플랫폼을 지원하나요?", "acceptedAnswer": { "@type": "Answer", "text": "네이버 블로그, 인스타그램, 유튜브, 트위터(X), 카카오 등 주요 SNS 플랫폼의 글자수 제한을 기준으로 실시간 체크가 가능합니다." } },
            { "@type": "Question", "name": "한글 바이트 카운터는 왜 필요한가요?", "acceptedAnswer": { "@type": "Answer", "text": "네이버와 같은 국내 포털은 메타 설명 등에 글자 수가 아닌 바이트 수 제한을 적용합니다. 한글 1자는 UTF-8 기준 3바이트이므로 정확한 바이트 계산이 SEO 최적화에 필수입니다." } },
            { "@type": "Question", "name": "WebP 변환기로 어떤 파일을 변환할 수 있나요?", "acceptedAnswer": { "@type": "Answer", "text": "JPG, PNG, GIF 등 일반 이미지 파일을 WebP 형식으로 변환할 수 있습니다. WebP는 동일 품질 대비 파일 크기가 30% 이상 작아 웹사이트 속도 개선에 효과적입니다." } }
          ]
        })}</script>
      </Helmet>

      <div className="container px-4 py-10 mx-auto max-w-7xl">

        {/* ── Hero ────────────────────────────────────────── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
            <Sparkles className="h-4 w-4" />
            크리에이터를 위한 무료 도구
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
            크리에이터 필수 도구함
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-3">
            네이버·인스타·유튜브 콘텐츠 작업을 <strong className="text-foreground">3초 안에</strong> 끝내세요.<br className="hidden md:block" />
            로그인 없이, 광고 없이, 완전 무료로.
          </p>

          {/* 신뢰 지표 */}
          <div className="flex flex-wrap justify-center gap-4 mb-7 text-sm">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60">
              <strong className="text-primary font-bold">{TOOLS_CONFIG.length}가지</strong> 무료 도구
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60">
              <strong className="text-primary font-bold">100%</strong> 브라우저 처리
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60">
              <strong className="text-primary font-bold">0원</strong> · 로그인 불필요
            </span>
          </div>

          {/* 검색창 */}
          <div className="max-w-xl mx-auto mb-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="어떤 작업을 도와드릴까요? (예: 글자수, QR, 해시태그)"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 h-12 text-base rounded-xl"
                aria-label="도구 검색"
              />
            </div>
          </div>

          {/* 인기 키워드 태그 */}
          {!searchQuery && (
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR_KEYWORDS.map((kw) => (
                <button
                  key={kw}
                  onClick={() => handleSearchChange(kw)}
                  className="px-3 py-1 text-sm rounded-full border border-border hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors text-muted-foreground"
                >
                  #{kw}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── 광고 삽입 공간 ────────────────────────────────── */}
        <div className="py-4" aria-hidden="true" />

        {/* ── 즐겨찾기 ─────────────────────────────────────── */}
        {favoriteToolConfigs.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              <h2 className="text-2xl md:text-3xl font-bold">즐겨찾기</h2>
              <Badge variant="secondary">{favoriteToolConfigs.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {favoriteToolConfigs.map((tool) => renderToolCard(tool))}
            </div>
          </section>
        )}

        {/* ── 최근 사용 ─────────────────────────────────────── */}
        {recentToolConfigs.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl md:text-3xl font-bold">최근 사용</h2>
              <Badge variant="secondary">{recentToolConfigs.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentToolConfigs.map((tool) => renderToolCard(tool, false))}
            </div>
          </section>
        )}

        {/* ── 인기 도구 TOP 3 ───────────────────────────────── */}
        {!searchQuery && (
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="h-6 w-6 text-yellow-500" />
              <h2 className="text-2xl md:text-3xl font-bold">이번 주 인기 도구</h2>
              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">TOP 3</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {top3Tools.map((tool, idx) => {
                if (!tool) return null;
                const colors = CATEGORY_COLORS[tool.category as Category];
                return (
                  <Link key={tool.id} to={tool.path} className="group">
                    <Card className={`h-full transition-all hover:shadow-xl hover:scale-[1.02] border-2 ${colors.border} overflow-hidden relative`}>
                      <div className={`absolute top-0 left-0 right-0 h-1 ${colors.bg.replace('/10', '')}`} style={{ background: `linear-gradient(90deg, var(--primary), transparent)` }} />
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                            인기 #{idx + 1}
                          </span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center mb-3`}>
                          <FileImage className={`h-5 w-5 ${colors.text}`} />
                        </div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">{tool.titleKo}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{tool.oneLineProblemKo}</p>
                        <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${colors.text}`}>
                          지금 사용하기 <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── 전체 도구 그리드 ──────────────────────────────── */}
        {hasResults ? (
          <div className="space-y-12">
            {toolsByCategory.map(({ category, label, tools }) => (
              tools.length > 0 && (
                <section key={category}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[category].bg.replace('/10', '-500')}`} />
                    <h2 className="text-2xl md:text-3xl font-bold">{label}</h2>
                    <Badge variant="secondary">{tools.length}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {tools.map((tool) => renderToolCard(tool))}
                  </div>
                </section>
              )
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">해당 키워드로 찾은 도구가 없습니다.</h3>
            <p className="text-muted-foreground mb-4">다른 키워드로 검색하거나 아래 카테고리를 둘러보세요.</p>
            <button onClick={() => handleSearchChange("")} className="text-primary hover:underline">
              모든 도구 보기
            </button>
          </div>
        )}

        {/* ── 광고 삽입 공간 ────────────────────────────────── */}
        <div className="py-8" aria-hidden="true" />

        {/* ── How it Works ─────────────────────────────────── */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">사용 방법</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">3단계면 충분합니다. 설치도, 로그인도, 비용도 없습니다.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* connector line */}
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30" />
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="text-center p-6 rounded-2xl border bg-card/50 relative">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto mb-4 shadow-md">
                  {step}
                </div>
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 mb-3">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 왜 크레피카인가요? ──────────────────────────────── */}
        <section className="mb-12 text-center">
          <h2 className="text-3xl font-bold mb-4">왜 크레피카인가요?</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-10">
            크레피카는 1인 크리에이터, 블로거, 마케터를 위한 필수 도구를 제공합니다.
            소셜미디어 콘텐츠 최적화, 웹 성능을 위한 이미지 변환, 마케팅용 QR 코드 생성 등
            빠르고 스마트한 작업 환경을 만들어 드립니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Zap, color: 'bg-yellow-500/10 text-yellow-500', title: '즉시 결과 확인', desc: '모든 처리가 브라우저에서 이루어집니다. 기다림 없이, 업로드 없이, 몇 초 만에 결과를 확인하세요.' },
              { icon: Lock, color: 'bg-blue-500/10 text-blue-500', title: '100% 프라이빗', desc: '데이터가 기기 밖으로 나가지 않습니다. 서버 없음, 저장 없음. 완벽한 개인정보 보호가 보장됩니다.' },
              { icon: Gift, color: 'bg-green-500/10 text-green-500', title: '항상 무료', desc: '구독료 없음, 숨겨진 비용 없음, 프리미엄 없음. 필요할 때마다 원하는 만큼 사용하세요.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="text-center p-6 rounded-xl border bg-card hover:shadow-md transition-shadow">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${color} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 사용자 유형별 추천 ──────────────────────────────── */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">이런 분들께 딱 맞습니다</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {[
              { title: '소셜미디어 마케터', desc: '인스타그램 캡션 포맷팅, 해시태그 섞기, 최적 게시물 길이를 위한 글자 수 세기, 플랫폼 요구사항에 맞는 콘텐츠 작성을 쉽게 하세요.' },
              { title: '웹 개발자', desc: '빠른 페이지 로딩을 위한 WebP 이미지 변환, 모바일 리다이렉트용 QR 코드 생성, 더 나은 SEO 성능을 위한 콘텐츠 최적화를 손쉽게 처리하세요.' },
              { title: '콘텐츠 크리에이터', desc: '목업용 로렘 입숨 생성, 네이버 최적화를 위한 한글 바이트 계산, 다양한 플랫폼 사양에 맞는 콘텐츠 준비를 빠르게 완료하세요.' },
              { title: '마케팅 팀', desc: '캠페인용 QR 코드 생성, 이메일 마케팅용 이미지 최적화, 퍼블리싱 전 모든 콘텐츠를 완벽하게 포맷팅하세요.' },
            ].map(({ title, desc }) => (
              <div key={title} className="p-6 rounded-xl border bg-card hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold mb-3">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 광고 삽입 공간 ────────────────────────────────── */}
        <div className="py-4" aria-hidden="true" />

        {/* ── 최신 블로그 포스트 (lazy) ────────────────────── */}
        <Suspense fallback={<div className="mt-4 mb-8 h-48 animate-pulse bg-muted/30 rounded-lg" />}>
          <RecentBlogPosts />
        </Suspense>
      </div>
    </>
  );
}
