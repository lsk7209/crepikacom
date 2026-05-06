import { Helmet } from "react-helmet";
import { Mail, MessageSquare, Globe, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Contact() {
  return (
    <>
      <Helmet>
        <title>문의하기 | 크레피카</title>
        <meta
          name="description"
          content="크레피카에 문의하기. 서비스 이용 중 불편한 점이나 제안 사항이 있으신가요? 24시간 이내에 답변해 드리겠습니다."
        />
        <meta name="keywords" content="문의하기, 고객지원, 피드백, 크레피카 연락처, 광고 문의" />
        <link rel="canonical" href="https://crepika.com/contact" />
        <meta property="og:title" content="문의하기 | 크레피카" />
        <meta property="og:description" content="크레피카에 문의하기. 서비스 이용 중 불편한 점이나 제안 사항이 있으신가요? 24시간 이내에 답변해 드리겠습니다." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://crepika.com/contact" />
        <meta property="og:locale" content="ko_KR" />
        <meta property="og:site_name" content="크레피카" />
        <meta property="og:image" content="https://crepika.com/og-image.svg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="문의하기 | 크레피카" />
        <meta name="twitter:image" content="https://crepika.com/og-image.svg" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "크레피카 문의하기",
          "url": "https://crepika.com/contact",
          "description": "크레피카 고객 지원 및 문의 페이지",
          "mainEntity": {
            "@type": "Organization",
            "name": "크레피카",
            "email": "support@crepika.com",
            "url": "https://crepika.com"
          }
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            { "@type": "Question", "name": "도구가 제대로 작동하지 않아요.", "acceptedAnswer": { "@type": "Answer", "text": "대부분의 문제는 브라우저 캐시를 삭제하거나 최신 버전으로 업데이트하면 해결됩니다. 여전히 문제가 발생한다면 오류 내용과 브라우저 종류를 support@crepika.com으로 보내주세요." }},
            { "@type": "Question", "name": "제 데이터는 정말 안전한가요?", "acceptedAnswer": { "@type": "Answer", "text": "네, 100% 안전합니다. 크레피카의 모든 도구는 서버 없는 처리 방식으로 운영됩니다. 입력한 텍스트나 업로드한 이미지는 외부 서버로 전송되지 않고 오직 이용자의 기기 내에서만 처리됩니다." }},
            { "@type": "Question", "name": "새로운 도구를 제안하고 싶습니다.", "acceptedAnswer": { "@type": "Answer", "text": "창의적인 아이디어는 언제나 환영합니다. support@crepika.com으로 기획 의도를 보내주시면 팀에서 검토 후 연락드리겠습니다." }},
            { "@type": "Question", "name": "기업용 대량 처리가 가능한가요?", "acceptedAnswer": { "@type": "Answer", "text": "현재 모든 도구는 웹 기반 무료 서비스로 제공됩니다. API 연동이나 대량 처리를 위한 엔터프라이즈 솔루션이 필요하신 경우 별도로 support@crepika.com으로 문의 부탁드립니다." }}
          ]
        })}</script>
      </Helmet>

      <div className="container px-4 py-12 mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 mb-8 border border-primary/20 shadow-inner">
            <MessageSquare className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">문의하기</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            크레피카는 사용자의 목소리를 가장 소중히 생각합니다.<br />
            질문, 피드백, 제안 사항이 있으시면 언제든 편하게 연락 주세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Mail className="h-6 w-6 text-primary" />
                일반 및 기술 문의
              </CardTitle>
              <CardDescription className="text-base pt-2">
                도구 사용법이나 기술적인 오류에 대한 도움을 드립니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="mailto:support@crepika.com"
                className="text-2xl font-bold text-primary hover:underline transition-all block mb-4"
              >
                support@crepika.com
              </a>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                평균 응답 시간: 24시간 이내 (영업일 기준)
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Globe className="h-6 w-6 text-primary" />
                제휴 및 피드백
              </CardTitle>
              <CardDescription className="text-base pt-2">
                광고 제안, 브랜드 제휴, 새로운 도구 기획안을 환영합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="mailto:support@crepika.com"
                className="text-2xl font-bold text-primary hover:underline transition-all block mb-4"
              >
                support@crepika.com
              </a>
              <p className="text-sm text-muted-foreground leading-relaxed">
                크리에이터를 위한 새로운 아이디어가 있다면 망설이지 말고 보내주세요.
              </p>
            </CardContent>
          </Card>
        </div>

        <section className="bg-muted/30 rounded-3xl p-8 md:p-12 mb-16 border border-primary/5">
          <h2 className="text-3xl font-bold mb-10 text-center">자주 묻는 질문 (FAQ)</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="space-y-3">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                도구가 제대로 작동하지 않아요.
              </h3>
              <p className="text-muted-foreground leading-relaxed pl-6">
                대부분의 문제는 브라우저 캐시를 삭제하거나 최신 버전으로 업데이트하면 해결됩니다.
                여전히 문제가 발생한다면 오류 내용과 브라우저 종류를 메일로 보내주세요.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                새로운 도구를 제안하고 싶습니다.
              </h3>
              <p className="text-muted-foreground leading-relaxed pl-6">
                창의적인 아이디어는 언제나 환영합니다! "이런 도구가 있으면 좋겠다"는 생각만으로도 충분합니다.
                기획 의도를 설명해주시면 팀에서 검토 후 연락드리겠습니다.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                제 데이터는 정말 안전한가요?
              </h3>
              <p className="text-muted-foreground leading-relaxed pl-6">
                네, 100% 안전합니다. 크레피카의 철학은 '서버 없는 처리'입니다.
                여러분이 입력한 텍스트나 업로드한 이미지는 외부 서버로 전송되지 않고 오직 여러분의 기기 내에서만 처리됩니다.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                기업용 대량 처리가 가능한가요?
              </h3>
              <p className="text-muted-foreground leading-relaxed pl-6">
                현재 모든 도구는 웹 기반 무료 서비스로 제공됩니다.
                API 연동이나 대량 처리를 위한 엔터프라이즈 솔루션이 필요하신 경우 별도로 문의 부탁드립니다.
              </p>
            </div>
          </div>
        </section>

        <div className="text-center">
          <p className="text-muted-foreground mb-4">다른 궁금한 점이 있으신가요?</p>
          <a href="/about" className="text-primary font-bold hover:underline inline-flex items-center gap-1">
            크레피카 팀 소개 더 알아보기
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </>
  );
}
