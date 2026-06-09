import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const SITE_URL = "https://crepika.com";

export default function EditorialPolicy() {
  return (
    <>
      <Helmet>
        <title>콘텐츠 작성 기준 | 크레피카</title>
        <meta
          name="description"
          content="크레피카가 SEO, SNS, 크리에이터 도구 콘텐츠를 작성하고 검수하는 기준입니다."
        />
        <link rel="canonical" href={`${SITE_URL}/editorial-policy`} />
        <meta property="og:title" content="콘텐츠 작성 기준 | 크레피카" />
        <meta
          property="og:description"
          content="크레피카 콘텐츠의 작성, 검수, 정정, 출처 반영 기준을 안내합니다."
        />
        <meta property="og:url" content={`${SITE_URL}/editorial-policy`} />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
      </Helmet>
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-4 text-4xl font-bold">콘텐츠 작성 기준</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          크레피카는 크리에이터와 블로거가 실제 발행 전에 확인할 수 있는 실행형 정보를 우선합니다.
        </p>
        <section className="space-y-6">
          <div>
            <h2 className="mb-2 text-2xl font-semibold">작성 원칙</h2>
            <p className="text-muted-foreground">
              글은 검색 의도, 실행 순서, 확인 가능한 참고 자료, 관련 도구 링크를 기준으로 구성합니다.
              단순 요약보다 사용자가 바로 점검할 수 있는 체크리스트와 예시를 우선합니다.
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-2xl font-semibold">검수와 정정</h2>
            <p className="text-muted-foreground">
              오래된 정보, 잘못된 링크, 정책 변경 가능성이 있는 내용은 주기적으로 검토합니다.
              정정 요청은 <Link className="text-primary underline" to="/contact">문의 페이지</Link>에서 받습니다.
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-2xl font-semibold">광고와 독립성</h2>
            <p className="text-muted-foreground">
              크레피카는 Google AdSense 자동광고를 사용할 수 있지만, 광고 노출 여부가 도구 결과나
              편집 추천 내용에 영향을 주지 않도록 운영합니다.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
