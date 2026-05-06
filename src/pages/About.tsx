import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Sparkles, Zap, Shield, Heart, Users, Award, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function About() {
  const team = [
    {
      name: "김민혁",
      role: "SEO & 콘텐츠 전략가",
      bio: "10년차 디지털 마케터로, 데이터 기반의 SEO 전략과 콘텐츠 최적화 전문가입니다. 크리에이터들이 검색 결과에서 더 빛날 수 있도록 돕고 있습니다.",
      initials: "MH",
      image: "/images/avatar-kimminhy.svg"
    },
    {
      name: "이지수",
      role: "소셜 미디어 스페셜리스트",
      bio: "인스타그램 및 틱톡 트렌드 분석가로, 수백 명의 크리에이터와 브랜드의 SNS 성장을 컨설팅했습니다. 실전에서 바로 쓰는 도구 기획을 담당합니다.",
      initials: "JS",
      image: "/images/avatar-leejisu.svg"
    },
    {
      name: "박준영",
      role: "수석 개발자",
      bio: "사용자의 데이터 보안과 도구의 성능을 책임집니다. 크레피카의 모든 도구가 브라우저 내에서 안전하고 빠르게 작동하도록 아키텍처를 설계했습니다.",
      initials: "JY",
      image: "/images/avatar-parkjy.svg"
    }
  ];

  return (
    <>
      <Helmet>
        <title>서비스 소개 및 팀 정보 | 크레피카</title>
        <meta
          name="description"
          content="크레피카(Crepika)는 크리에이터를 위한 전문 도구를 만드는 팀입니다. SEO, SNS 마케팅, 이미지 최적화 전문가들이 제공하는 100% 무료 도구들을 만나보세요."
        />
        <meta name="keywords" content="크레피카 소개, SEO 전문가, 마케팅 팀, 무료 크리에이터 도구, E-E-A-T" />
        <link rel="canonical" href="https://crepika.com/about" />
        <meta property="og:title" content="서비스 소개 및 팀 정보 | 크레피카" />
        <meta property="og:description" content="크레피카(Crepika)는 크리에이터를 위한 전문 도구를 만드는 팀입니다. SEO, SNS 마케팅, 이미지 최적화 전문가들이 제공하는 100% 무료 도구들을 만나보세요." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://crepika.com/about" />
        <meta property="og:locale" content="ko_KR" />
        <meta property="og:site_name" content="크레피카" />
        <meta property="og:image" content="https://crepika.com/og-image.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="크레피카 팀 소개" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="서비스 소개 및 팀 정보 | 크레피카" />
        <meta name="twitter:description" content="크레피카 팀 소개. SEO, 소셜미디어, 개발 전문가들이 만드는 크리에이터 무료 도구 서비스." />
        <meta name="twitter:image" content="https://crepika.com/og-image.png" />
        <meta name="twitter:image:alt" content="크레피카 팀 소개" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "url": "https://crepika.com/about",
          "name": "크레피카 팀 소개",
          "description": "크리에이터를 위한 무료 온라인 도구 서비스 크레피카의 팀과 철학을 소개합니다.",
          "mainEntity": {
            "@type": "Organization",
            "@id": "https://crepika.com/#organization",
            "name": "크레피카",
            "alternateName": "Crepika",
            "url": "https://crepika.com",
            "logo": "https://crepika.com/og-image.png",
            "email": "support@crepika.com",
            "foundingDate": "2025",
            "description": "국내 크리에이터를 위한 무료 온라인 도구 서비스. 로그인 없이 3초 안에 사용 가능한 QR 생성기, 글자수 세기, WebP 변환기 등을 제공합니다.",
            "areaServed": "KR",
            "knowsLanguage": ["ko", "en"],
            "member": [
              {
                "@type": "Person",
                "@id": "https://crepika.com/about#kimminhy",
                "name": "김민혁",
                "jobTitle": "SEO & 콘텐츠 전략가",
                "description": "10년차 디지털 마케터이자 SEO 전략가. 데이터 기반 콘텐츠 최적화 전문가로 구글·네이버 양대 검색 생태계에서 크리에이터 성장을 지원합니다.",
                "image": "https://crepika.com/images/avatar-kimminhy.svg",
                "worksFor": { "@id": "https://crepika.com/#organization" },
                "knowsAbout": ["SEO", "콘텐츠 마케팅", "네이버 블로그 최적화", "구글 검색 최적화", "AEO", "GEO", "디지털 마케팅", "키워드 전략"]
              },
              {
                "@type": "Person",
                "@id": "https://crepika.com/about#leejisu",
                "name": "이지수",
                "jobTitle": "소셜 미디어 스페셜리스트",
                "description": "수백 명의 크리에이터·브랜드 SNS 성장을 컨설팅한 소셜 미디어 전문가. 인스타그램·유튜브 알고리즘 기반 실전 전략을 공유합니다.",
                "image": "https://crepika.com/images/avatar-leejisu.svg",
                "worksFor": { "@id": "https://crepika.com/#organization" },
                "knowsAbout": ["인스타그램 마케팅", "소셜 미디어 전략", "SNS 알고리즘", "해시태그 전략", "콘텐츠 크리에이터", "릴스 최적화", "틱톡 마케팅"]
              },
              {
                "@type": "Person",
                "@id": "https://crepika.com/about#parkjy",
                "name": "박준영",
                "jobTitle": "수석 개발자",
                "description": "크레피카 수석 개발자. 사용자 데이터 보안과 도구 성능을 책임지며 브라우저 내 안전한 처리 아키텍처를 설계합니다.",
                "image": "https://crepika.com/images/avatar-parkjy.svg",
                "worksFor": { "@id": "https://crepika.com/#organization" },
                "knowsAbout": ["웹 개발", "React", "TypeScript", "WebP 최적화", "프론트엔드 성능", "브라우저 보안", "QR 코드"]
              }
            ]
          }
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://crepika.com" },
            { "@type": "ListItem", "position": 2, "name": "서비스 소개", "item": "https://crepika.com/about" }
          ]
        })}</script>
      </Helmet>

      <div className="container px-4 py-12 mx-auto max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 mb-8 border border-primary/20 shadow-inner">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
            크리에이터의 시간을<br />
            <span className="text-primary">가치 있게 만드는 팀</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            크레피카는 복잡한 설치나 가입 없이, 오직 크리에이터의 창작 효율에만 집중하는
            전문가 수준의 웹 유틸리티를 연구하고 개발합니다.
          </p>
        </div>

        {/* Core Values Section */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-none shadow-md bg-muted/30">
              <CardHeader className="pb-2">
                <Zap className="h-8 w-8 text-yellow-500 mb-2" />
                <CardTitle className="text-xl">즉시 사용</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  로그인이나 가입 절차가 전혀 없습니다. 필요할 때 바로 접속해서 즉시 결과를 확인하세요.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-muted/30">
              <CardHeader className="pb-2">
                <Shield className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle className="text-xl">강력한 보안</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  여러분의 데이터는 서버에 저장되지 않습니다. 모든 처리는 브라우저 내에서 프라이빗하게 이루어집니다.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-muted/30">
              <CardHeader className="pb-2">
                <Heart className="h-8 w-8 text-red-500 mb-2" />
                <CardTitle className="text-xl">완전 무료</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  모든 기본 기능은 유료 결제 없이 영구적으로 무료로 제공됩니다. 제한 없는 도구를 경험하세요.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-muted/30">
              <CardHeader className="pb-2">
                <Award className="h-8 w-8 text-purple-500 mb-2" />
                <CardTitle className="text-xl">전문가 설계</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  단순한 기능을 넘어 마케팅 및 SEO 전문가의 실전 노하우가 반영된 정교한 도구를 만듭니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* E-E-A-T Section */}
        <section className="mb-24 bg-card border rounded-3xl p-8 md:p-12 shadow-sm">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">왜 크레피카를 믿을 수 있나요? (E-E-A-T)</h2>
            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="bg-primary/10 p-3 rounded-2xl flex-shrink-0">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">전문적 경험 (Experience & Expertise)</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    저희 팀은 네이버, 인스타그램, 유튜브, 그리고 구글 검색 최적화 분야에서 10년 이상의 실전 경험을 가진
                    전문가들로 구성되어 있습니다. 단순히 코드를 짜는 것이 아니라, 실제 서비스의 성장 원리를 도구에 녹여냈습니다.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="bg-primary/10 p-3 rounded-2xl flex-shrink-0">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">데이터의 권위와 신뢰 (Authority & Trust)</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    크레피카의 모든 텍스트 카운터와 바이트 카운터는 각 플랫폼(네이버, 카카오 등)의 최신 기술 가이드를
                    준수합니다. 또한 파일 변환 시 개인정보를 서버로 절대 전송하지 않는 투명한 정책으로 운영됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-24">
          <h2 className="text-3xl font-bold mb-12 text-center">함께하는 사람들</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {team.map((member, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <Avatar className="w-24 h-24 mb-6 border-4 border-background ring-2 ring-primary/20">
                  <AvatarImage src={member.image} alt={member.name} />
                  <AvatarFallback className="text-xl font-bold">{member.initials}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-primary font-semibold text-sm mb-4">{member.role}</p>
                <p className="text-muted-foreground text-sm leading-relaxed px-4">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-12 border border-primary/10">
          <h2 className="text-3xl font-bold mb-6">여러분의 비즈니스 성장을 돕겠습니다</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            도구 사용 중 불편한 점이 있거나 새로운 도구 제안이 있으시다면 언제든 연락주세요.
            크리에이터 여러분의 소중한 피드백이 저희를 성장시킵니다.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Mail className="h-5 w-5" />
              문의하기
            </Link>
            <Link
              to="/"
              className="bg-background border px-8 py-3 rounded-xl font-bold hover:bg-muted transition-colors"
            >
              도구 목록 보기
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
