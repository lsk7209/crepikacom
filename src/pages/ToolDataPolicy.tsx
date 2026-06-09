import { Helmet } from "react-helmet-async";

const SITE_URL = "https://crepika.com";

export default function ToolDataPolicy() {
  return (
    <>
      <Helmet>
        <title>도구 데이터 처리 방식 | 크레피카</title>
        <meta
          name="description"
          content="크레피카 무료 도구가 입력값을 어떻게 처리하고 사용자 데이터를 보호하는지 안내합니다."
        />
        <link rel="canonical" href={`${SITE_URL}/tool-data-policy`} />
        <meta property="og:title" content="도구 데이터 처리 방식 | 크레피카" />
        <meta
          property="og:description"
          content="브라우저 기반 도구 처리, 개인정보 입력 주의, 분석/광고 스크립트 범위를 설명합니다."
        />
        <meta property="og:url" content={`${SITE_URL}/tool-data-policy`} />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
      </Helmet>
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-4 text-4xl font-bold">도구 데이터 처리 방식</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          크레피카 도구는 빠른 사용성과 개인정보 노출 최소화를 목표로 설계합니다.
        </p>
        <section className="space-y-6">
          <div>
            <h2 className="mb-2 text-2xl font-semibold">브라우저 우선 처리</h2>
            <p className="text-muted-foreground">
              글자수, 바이트, QR, WebP, UTM 같은 주요 도구는 가능한 한 브라우저 안에서 처리합니다.
              사용자가 입력한 초안은 발행 전 직접 확인해야 하며, 민감정보 입력은 피해야 합니다.
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-2xl font-semibold">분석과 광고</h2>
            <p className="text-muted-foreground">
              사이트 개선을 위해 GA4와 Google AdSense 자동광고 스크립트가 로드될 수 있습니다.
              수집 범위와 쿠키 관련 내용은 개인정보처리방침에서 함께 안내합니다.
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-2xl font-semibold">사용자 확인 책임</h2>
            <p className="text-muted-foreground">
              도구 결과는 발행 보조 자료입니다. 플랫폼 정책, 광고 심사, 검색 노출 결과는 외부
              서비스 정책과 계정 상태에 따라 달라질 수 있습니다.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
