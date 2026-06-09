import { Helmet } from "react-helmet-async";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <>
      <Helmet>
        <title>이용약관 | 크레피카</title>
        <meta
          name="description"
          content="크레피카 이용약관. 무료 온라인 크리에이터 도구 사용 시 적용되는 서비스 이용 조건, 금지 행위, 면책 조항을 확인하세요."
        />
        <meta name="keywords" content="이용약관, 서비스 약관, 크레피카 정책, 사용 조건" />
        <link rel="canonical" href="https://crepika.com/terms" />
        <meta name="robots" content="index,follow" />
        <meta property="og:title" content="이용약관 | 크레피카" />
        <meta property="og:description" content="크레피카 이용약관. 무료 온라인 크리에이터 도구 사용 시 적용되는 서비스 이용 조건을 확인하세요." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://crepika.com/terms" />
        <meta property="og:site_name" content="크레피카" />
      </Helmet>

      <div className="container px-4 py-12 mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">이용약관</h1>
          <p className="text-lg text-muted-foreground">최종 업데이트: 2026년 5월 6일</p>
        </div>

        <article className="prose prose-slate dark:prose-invert max-w-none space-y-10 text-base leading-relaxed">

          <section>
            <h2 className="text-2xl font-bold mb-4">1. 약관 동의</h2>
            <p className="text-muted-foreground leading-relaxed">
              크레피카(이하 "서비스") 웹사이트에 접속하거나 도구를 사용하면 본 이용약관에 동의하는 것으로 간주됩니다.
              본 약관의 일부 또는 전부에 동의하지 않는 경우 서비스 이용을 중단해 주세요.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              크레피카는 대한민국 전자상거래 등에서의 소비자 보호에 관한 법률 및 관련 법령에 따라 서비스를 운영합니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. 서비스 이용 라이선스</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              크레피카는 이용자에게 다음 조건을 준수하는 범위 내에서 개인적 또는 상업적 목적으로 도구를 사용할 수 있는 비독점적 이용 권한을 부여합니다.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>합법적인 목적에 한하여 도구를 자유롭게 이용할 수 있습니다.</li>
              <li>서비스의 소스 코드를 역공학(Reverse Engineering) 또는 무단 복제하는 행위는 금지됩니다.</li>
              <li>타인의 권리를 침해하거나 제3자에게 해를 끼치는 용도로 서비스를 사용할 수 없습니다.</li>
              <li>서비스에 과도한 부하를 주거나 운영을 방해하는 행위는 금지됩니다.</li>
              <li>생성된 결과물(QR 코드, 변환된 이미지 등)은 출처 표기 없이 상업적으로 활용 가능합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. 서비스 이용 가능성 및 변경</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              크레피카는 안정적인 서비스를 제공하기 위해 최선을 다하지만, 다음의 사유로 서비스가 일시적으로 중단될 수 있습니다.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>서버 점검, 보안 업데이트 등 정기·긴급 유지보수</li>
              <li>천재지변, 정전, 해킹 등 불가항력적 사고</li>
              <li>서비스 기능 개선 및 신규 도구 배포에 따른 일시적 중단</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              사전 예고 없이 특정 도구를 수정·종료하거나 서비스 구성을 변경할 수 있습니다. 중요한 변경 사항은 공지를 통해 안내하겠습니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. 보증 부인 (면책 조항)</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              크레피카는 서비스를 "현재 상태(as-is)"로 제공하며, 다음 사항에 대해 명시적·묵시적 보증을 하지 않습니다.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>서비스가 이용자의 특정 요구 사항을 충족한다는 보증</li>
              <li>서비스가 중단 없이, 오류 없이, 안전하게 작동한다는 보증</li>
              <li>도구 결과물의 완전한 정확성 및 신뢰성</li>
              <li>소프트웨어 결함의 완전한 수정 보증</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              이용자는 서비스 이용 결과에 대해 스스로 판단하고 책임을 지며, 중요한 결정에는 전문가의 검토를 받으시기 바랍니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. 책임 제한</h2>
            <p className="text-muted-foreground leading-relaxed">
              크레피카 및 운영 팀은 서비스 이용 또는 이용 불가로 인해 발생하는 데이터 손실, 이익 손실, 업무 중단 등 어떠한 직·간접적 손해에 대해서도 법적 책임을 지지 않습니다.
              이용자는 본 약관에 동의함으로써 이 책임 제한 사항을 수락하는 것으로 간주됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. 이용자 콘텐츠 및 책임</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              이용자는 다음 사항에 대한 단독 책임을 집니다.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>도구를 통해 처리하는 모든 콘텐츠(텍스트, 이미지, URL 등)</li>
              <li>해당 콘텐츠를 처리할 권리(저작권, 초상권 등)의 보유 여부</li>
              <li>처리된 결과물의 활용과 관련된 모든 법적 의무</li>
              <li>도구 결과물의 정확성 검증 및 활용 판단</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              크레피카의 모든 도구는 서버리스 방식으로 운영되므로 이용자가 입력한 데이터는 크레피카 서버에 전송되지 않습니다.
              그러나 처리된 결과물의 사용과 관련된 법적 책임은 이용자 본인에게 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. 지식재산권</h2>
            <p className="text-muted-foreground leading-relaxed">
              크레피카 웹사이트의 디자인, 소스 코드, UI 구성, 브랜드 로고, 블로그 콘텐츠 등 모든 저작물은 크레피카 팀에 귀속되며
              국내외 저작권법 및 지식재산권법에 의해 보호됩니다. 서면 동의 없이 복사, 수정, 재배포하는 행위는 금지됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. 광고 표시 동의</h2>
            <p className="text-muted-foreground leading-relaxed">
              크레피카는 무료 서비스의 지속적인 운영을 위해 Google AdSense를 통한 광고를 게재합니다.
              서비스를 이용함으로써 이용자는 광고 표시에 동의하는 것으로 간주됩니다.
              Google AdSense의 데이터 처리 방식에 대해서는{" "}
              <Link to="/privacy" className="text-primary hover:underline">개인정보처리방침</Link>을 참고해 주세요.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. 금지 행위</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              다음 행위는 서비스 이용 자격을 박탈할 수 있으며, 관련 법령에 따라 법적 조치가 취해질 수 있습니다.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>대한민국 및 국제법에 위반되는 목적으로 서비스를 이용하는 행위</li>
              <li>타인을 비방·위협·기만하거나 명예를 훼손하는 콘텐츠 처리</li>
              <li>크레피카 운영팀 또는 제3자를 사칭하는 행위</li>
              <li>자동화 봇·스크립트를 이용한 대규모 서비스 호출로 서버에 과부하를 주는 행위</li>
              <li>서비스의 보안 취약점을 악용하거나 해킹을 시도하는 행위</li>
              <li>불법 저작물, 개인정보, 음란물 등 위법 콘텐츠를 처리하는 행위</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">10. 약관 변경</h2>
            <p className="text-muted-foreground leading-relaxed">
              크레피카는 법령 개정, 서비스 정책 변경 등의 사유가 있을 때 본 약관을 수정할 수 있습니다.
              변경된 약관은 페이지 상단의 "최종 업데이트" 날짜와 함께 게시되며, 변경 후에도 서비스를 계속 이용하시면 개정 약관에 동의한 것으로 간주됩니다.
              중요한 변경 사항은 사전에 공지드리겠습니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">11. 준거법 및 관할</h2>
            <p className="text-muted-foreground leading-relaxed">
              본 이용약관은 대한민국 법률을 준거법으로 하며, 서비스와 관련하여 분쟁이 발생하는 경우 대한민국 법원을 관할 법원으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">12. 문의</h2>
            <p className="text-muted-foreground leading-relaxed">
              이용약관에 관한 문의 사항은{" "}
              <Link to="/contact" className="text-primary hover:underline">문의하기 페이지</Link>
              를 통해 연락 주시거나,{" "}
              <a href="mailto:support@crepika.com" className="text-primary hover:underline">support@crepika.com</a>
              으로 이메일을 보내주세요.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              <Link to="/privacy" className="text-primary hover:underline">개인정보처리방침</Link>과{" "}
              <Link to="/about" className="text-primary hover:underline">크레피카 소개</Link>도 함께 확인해 보세요.
            </p>
          </section>

        </article>
      </div>
    </>
  );
}
