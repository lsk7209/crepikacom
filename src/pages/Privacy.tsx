import { Helmet } from "react-helmet-async";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <>
      <Helmet>
        <title>개인정보처리방침 | 크레피카</title>
        <meta
          name="description"
          content="크레피카 개인정보처리방침. 모든 도구는 브라우저 내에서 처리되며 서버에 데이터를 전송하지 않습니다. Google AdSense 광고 및 쿠키 정책을 포함합니다."
        />
        <link rel="canonical" href="https://crepika.com/privacy" />
        <meta name="robots" content="index,follow" />
      </Helmet>

      <div className="container px-4 py-12 mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">개인정보처리방침</h1>
          <p className="text-lg text-muted-foreground">최종 업데이트: 2026년 5월 6일</p>
        </div>

        <article className="prose prose-slate dark:prose-invert max-w-none space-y-10 text-base leading-relaxed">

          <section>
            <h2 className="text-2xl font-bold mb-4">1. 개요</h2>
            <p className="text-muted-foreground leading-relaxed">
              크레피카(이하 "서비스")는 이용자의 개인정보 보호를 매우 중요하게 생각합니다. 본 방침은 서비스
              이용 시 수집·처리되는 정보의 종류와 방법, 그리고 이용자의 권리를 설명합니다.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              <strong>핵심 요약:</strong> 크레피카의 모든 도구(QR 생성기, 텍스트 카운터, WebP 변환기 등)는
              입력된 데이터를 서버에 전송하지 않습니다. 모든 처리는 이용자의 브라우저 내에서만 이루어집니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. 수집하는 정보</h2>
            <h3 className="text-xl font-semibold mb-3">2-1. 도구 사용 데이터 (클라이언트 측 처리)</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              텍스트, 이미지, URL 등 도구에 입력하는 모든 데이터는 이용자의 기기(브라우저)에서만 처리되며
              크레피카 서버로 전송되지 않습니다.
            </p>
            <h3 className="text-xl font-semibold mb-3">2-2. 브라우저 로컬 저장소 (localStorage)</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              서비스 편의를 위해 다음 정보를 이용자의 브라우저 로컬 저장소에만 저장합니다. 서버에는 전송되지 않습니다.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>즐겨찾기 도구 목록</li>
              <li>최근 사용 도구 기록</li>
              <li>UI 환경 설정 (테마 등)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              브라우저 캐시·쿠키 삭제 시 위 정보가 모두 삭제됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. 쿠키 및 광고</h2>
            <h3 className="text-xl font-semibold mb-3">3-1. Google AdSense 광고</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              크레피카는 무료 서비스 운영을 위해 Google AdSense를 통해 광고를 게재합니다.
              Google은 이용자의 이전 방문 기록을 기반으로 맞춤형 광고를 표시하기 위해 쿠키를 사용할 수 있습니다.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>광고 관련 쿠키는 Google의 개인정보처리방침을 따릅니다.</li>
              <li>Google을 포함한 제3자 광고 사업자는 쿠키 또는 유사 기술을 사용해 이 사이트와 다른 사이트 방문 정보를 바탕으로 광고를 표시할 수 있습니다.</li>
              <li>광고는 Google AdSense 자동 광고 방식으로 게재될 수 있으며, 크레피카는 본문을 가리거나 클릭을 유도하는 수동 광고 슬롯을 배치하지 않습니다.</li>
              <li>맞춤형 광고 수신 거부: <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google 광고 설정</a>에서 변경 가능합니다.</li>
              <li>Google의 광고 데이터 사용 방식은 <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google 광고 기술 안내</a>에서 확인할 수 있습니다.</li>
              <li>EU 이용자의 경우 GDPR에 따른 동의 절차가 적용됩니다.</li>
            </ul>
            <h3 className="text-xl font-semibold mb-3 mt-6">3-2. 분석 쿠키</h3>
            <p className="text-muted-foreground leading-relaxed">
              Google Analytics 등 분석 도구를 통해 방문 페이지, 체류 시간, 기기 정보 등
              익명화된 집계 데이터를 수집할 수 있습니다. 개인 식별 정보는 수집하지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. 제3자 서비스</h2>
            <ul className="list-disc pl-6 space-y-3 text-muted-foreground">
              <li><strong>Google AdSense:</strong> 광고 게재 및 광고 성과 측정. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google 개인정보처리방침</a></li>
              <li><strong>Google Analytics:</strong> 사이트 이용 통계 분석. 방문 페이지, 기기 유형, 브라우저 정보 등 집계 데이터를 분석합니다.</li>
              <li><strong>Vercel:</strong> 웹 호스팅. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Vercel 개인정보처리방침</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. 이용자의 권리</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              크레피카는 개인 데이터를 서버에 저장하지 않으므로 삭제·수정 요청의 대상이 되는 개인정보가 없습니다.
              다음 방법으로 로컬 저장 데이터를 직접 제어할 수 있습니다.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>브라우저 캐시·쿠키 삭제로 로컬 저장소 초기화</li>
              <li>브라우저 설정에서 쿠키 차단</li>
              <li>Google 광고 설정에서 맞춤형 광고 비활성화</li>
              <li>브라우저 확장 프로그램으로 애널리틱스 차단</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. 아동 보호</h2>
            <p className="text-muted-foreground leading-relaxed">
              크레피카는 만 14세 미만 아동의 개인정보를 고의로 수집하지 않습니다.
              14세 미만 이용자는 보호자의 동의 하에 서비스를 이용하시기 바랍니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. 방침 변경 안내</h2>
            <p className="text-muted-foreground leading-relaxed">
              본 방침은 법령 변경이나 서비스 정책 변경 시 업데이트될 수 있습니다.
              중요한 변경 사항은 페이지 상단의 "최종 업데이트" 날짜를 통해 확인하시기 바랍니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. 문의</h2>
            <p className="text-muted-foreground leading-relaxed">
              개인정보처리방침에 관한 문의사항은{" "}
              <Link to="/contact" className="text-primary hover:underline">문의하기 페이지</Link>
              를 통해 연락주세요. 이메일: <a href="mailto:support@crepika.com" className="text-primary hover:underline">support@crepika.com</a>
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              <Link to="/terms" className="text-primary hover:underline">이용약관</Link>과{" "}
              <Link to="/about" className="text-primary hover:underline">크레피카 소개</Link>도 함께 확인해 보세요.
            </p>
          </section>

        </article>
      </div>
    </>
  );
}
