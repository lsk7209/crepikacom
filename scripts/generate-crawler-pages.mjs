import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");

const approvalContext = `
      <section class="panel">
        <h2>Creator tool quality and review context</h2>
        <p>Crepika is a browser based utility site for creators, marketers, bloggers, small stores, and social media operators who need simple production tools without a login step. The service focuses on practical tasks such as counting characters, checking Korean byte length, generating placeholder text, converting images to WebP, preserving Instagram line breaks, mixing hashtag groups, and creating QR codes. Each tool is meant to reduce repetitive content production work while keeping the user in control of the final result.</p>
        <p>The pages are intentionally written as educational references as well as tools. A visitor should be able to understand what the tool does, when it is useful, what information is processed, what limitations apply, and where to find related policy pages before the JavaScript application loads. This is important for search crawlers, AdSense review, accessibility tools, and users on slow mobile connections. The static text also links to the about page, contact page, privacy policy, terms of use, blog index, and related tools so the site structure is clear without relying on a single-page-app fallback.</p>
        <p>Crepika does not ask users to upload account credentials, advertising passwords, or private platform tokens. Most utility inputs are processed in the browser. Users should still avoid entering sensitive personal data into any online tool unless it is required and they understand the privacy policy. For image conversion, QR generation, text counting, and formatting tasks, the recommended workflow is to test with non-sensitive content first, check the output, then apply it to final production material.</p>
        <p>Advertising may appear through Google AdSense Auto Ads. AdSense display does not change the tool output, editorial recommendations, or privacy commitments. The site does not place manual ad units in these generated crawler pages. Commercial or affiliate references, if added later in blog content, should be disclosed near the relevant recommendation. The core purpose of the site remains free creator productivity support.</p>
        <p>For search and AdSense readiness, each generated page includes a title, meta description, canonical URL, responsive viewport, indexable robots directive, publisher identifier, internal navigation, and enough visible body text to explain the page independently. Readers can move from any tool route to the blog for deeper tutorials, to the contact page for corrections, to the privacy page for cookie and data handling, and to the terms page for usage limitations.</p>
        <p>Use the tools as starting points, not as automatic professional judgement. SEO snippets, hashtags, QR codes, text byte limits, and image optimization results should be checked against the target platform's current rules before publishing. Platform limits and recommendation systems can change, so the final responsibility for publication, brand compliance, legal compliance, and user-facing accuracy remains with the publisher.</p>
        <p>A practical creator workflow usually starts with a draft, then a length check, then a formatting pass, then an asset optimization pass, then a final publishing check. Crepika connects those steps with lightweight tools. A blogger can count title and meta description length, check byte limits for Korean text, create a QR code for an offline event, convert a thumbnail to a lighter image format, and keep a caption readable on mobile. The goal is not to replace editorial judgement but to remove small repetitive checks that often cause publishing delays.</p>
        <p>The blog and tool pages should also make it clear that the service is not a platform policy authority. Naver, Google, Instagram, YouTube, TikTok, Kakao, and other services can change character limits, media recommendations, ad policies, and ranking signals. Crepika can provide a structured reference and a fast calculation, but users should confirm final requirements in the destination platform before publishing business critical material.</p>
        <p>Corrections are part of the operating model. If a reader finds an outdated platform limit, broken link, unclear privacy explanation, or tool behavior that differs from the description, the contact page gives a direct route to report it. This correction path helps maintain trust signals for readers, search engines, and AdSense review. The site should continue to prefer clear explanations, visible policy links, and conservative claims over exaggerated promises.</p>
      </section>`;

const shell = ({ title, description, canonical, heading, sections, robots = "index,follow" }) => `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta name="robots" content="${robots}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="크레피카">
    <meta name="google-adsense-account" content="ca-pub-3050601904412736">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3050601904412736" crossorigin="anonymous"></script>
    <style>
      body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.7;color:#172033;margin:0;background:#f8fafc}
      main{max-width:880px;margin:0 auto;padding:48px 20px 72px}
      nav{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:36px}
      a{color:#0f766e} h1{font-size:2.4rem;line-height:1.2;margin:0 0 18px} h2{margin-top:34px;font-size:1.35rem}
      .lede{font-size:1.12rem;color:#475569}.panel{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:24px;margin-top:20px}
      li{margin:8px 0}.muted{color:#64748b;font-size:.95rem}
    </style>
  </head>
  <body>
    <main>
      <nav>
        <a href="/">홈</a><a href="/tools/text-counter">도구</a><a href="/blog">블로그</a><a href="/about">소개</a><a href="/contact">문의</a><a href="/privacy">개인정보처리방침</a><a href="/terms">이용약관</a>
      </nav>
      <h1>${heading}</h1>
      ${sections}
      ${approvalContext}
      <section class="panel">
        <h2>운영 및 신뢰 정보</h2>
        <p>크레피카는 국내 크리에이터와 소규모 브랜드가 반복적으로 수행하는 콘텐츠 제작 작업을 줄이기 위해 운영됩니다. 각 페이지는 실제 사용 가능한 도구, 관련 가이드, 문의 경로, 개인정보처리방침, 이용약관으로 연결되어 사이트의 운영 주체와 정책을 확인할 수 있게 구성했습니다.</p>
        <ul>
          <li>주요 도구: 텍스트 카운터, 한글 바이트 카운터, WebP 변환기, QR 코드 생성기, 인스타그램 줄바꿈 포매터, 해시태그 믹서</li>
          <li>주요 콘텐츠: 네이버 블로그 SEO, 구글 검색 최적화, SNS 캡션 작성, 이미지 최적화, 크리에이터 생산성 가이드</li>
          <li>정책 확인: 개인정보처리방침, 이용약관, 문의하기 페이지를 통해 광고, 쿠키, 데이터 처리 기준을 공개합니다.</li>
        </ul>
      </section>
      <p class="muted">이 정적 본문은 검색엔진과 광고 심사 크롤러가 JavaScript 실행 전에도 크레피카의 실제 콘텐츠와 운영 정보를 확인할 수 있도록 제공됩니다. 브라우저에서는 같은 URL에서 React 앱이 로드되어 도구를 사용할 수 있습니다.</p>
    </main>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

const pages = [
  {
    path: "about/index.html",
    title: "서비스 소개 및 팀 정보 | 크레피카",
    description: "크레피카는 크리에이터를 위한 무료 온라인 도구와 실전 마케팅 콘텐츠를 제공하는 서비스입니다.",
    canonical: "https://crepika.com/about",
    heading: "크리에이터의 시간을 가치 있게 만드는 팀",
    sections: `
      <p class="lede">크레피카는 복잡한 설치나 가입 없이 바로 사용할 수 있는 크리에이터 도구함입니다. QR 코드 생성기, 텍스트 카운터, 바이트 카운터, WebP 변환기, 인스타그램 줄바꿈 도구, 해시태그 믹서 등을 무료로 제공합니다.</p>
      <section class="panel"><h2>운영 원칙</h2><ul><li>도구 입력 데이터는 서버에 저장하지 않고 브라우저에서 처리합니다.</li><li>마케팅, SEO, 콘텐츠 제작 실무자가 실제 업무 흐름에 맞춰 도구를 설계합니다.</li><li>로그인 없이 빠르게 사용할 수 있는 기능을 우선합니다.</li></ul></section>
      <section class="panel"><h2>팀 전문성</h2><p>크레피카는 SEO 전략, 소셜 미디어 운영, 프론트엔드 개발 경험을 바탕으로 검색 노출과 콘텐츠 제작 효율을 함께 고려합니다. 블로그 가이드는 네이버, 구글, 인스타그램, 유튜브 등 실제 플랫폼 운영 맥락에 맞춰 작성됩니다.</p></section>
    `,
  },
  {
    path: "contact/index.html",
    title: "문의하기 | 크레피카",
    description: "크레피카 서비스 이용 문의, 기술 오류, 제휴 제안, 새 도구 아이디어를 접수하는 연락 페이지입니다.",
    canonical: "https://crepika.com/contact",
    heading: "문의하기",
    sections: `
      <p class="lede">서비스 이용 중 문제가 있거나 새 도구 제안이 있다면 support@crepika.com 으로 연락해 주세요.</p>
      <section class="panel"><h2>문의 범위</h2><ul><li>도구 사용법과 오류 제보</li><li>광고, 제휴, 콘텐츠 협업 문의</li><li>새로운 무료 도구 제안</li><li>개인정보처리방침과 이용약관 관련 문의</li></ul></section>
      <section class="panel"><h2>응답 기준</h2><p>영업일 기준 24시간 이내 답변을 목표로 하며, 오류 제보 시 URL, 브라우저 종류, 재현 단계를 함께 보내주시면 더 빠르게 확인할 수 있습니다.</p></section>
    `,
  },
  {
    path: "privacy/index.html",
    title: "개인정보처리방침 | 크레피카",
    description: "크레피카 개인정보처리방침. 도구 입력 데이터, 로컬 저장소, Google AdSense 및 Analytics 쿠키 처리 기준을 설명합니다.",
    canonical: "https://crepika.com/privacy",
    heading: "개인정보처리방침",
    sections: `
      <p class="lede">크레피카는 이용자의 개인정보 보호를 중요하게 생각합니다. 텍스트, 이미지, URL 등 도구 입력값은 원칙적으로 이용자의 브라우저 안에서 처리되며 서버에 저장하지 않습니다.</p>
      <section class="panel"><h2>수집 및 처리 정보</h2><ul><li>도구 입력 데이터: 브라우저 내 처리, 서버 저장 없음</li><li>로컬 저장소: 즐겨찾기, 최근 사용 도구, 테마 설정 등 편의 정보</li><li>분석 정보: 방문 페이지, 기기 환경 등 익명화된 집계 지표</li></ul></section>
      <section class="panel"><h2>광고와 쿠키</h2><p>크레피카는 무료 서비스 운영을 위해 Google AdSense 광고를 사용할 수 있습니다. Google 및 제3자 광고 사업자는 쿠키나 식별자를 이용해 광고를 게재할 수 있으며, 이용자는 Google 광고 설정에서 맞춤형 광고를 제어할 수 있습니다.</p></section>
      <section class="panel"><h2>문의</h2><p>개인정보 관련 문의는 support@crepika.com 또는 문의하기 페이지를 통해 접수합니다.</p></section>
    `,
  },
  {
    path: "terms/index.html",
    title: "이용약관 | 크레피카",
    description: "크레피카 무료 온라인 도구 사용 조건, 금지 행위, 책임 제한, 광고 표시 기준을 설명하는 이용약관입니다.",
    canonical: "https://crepika.com/terms",
    heading: "이용약관",
    robots: "index,follow",
    sections: `
      <p class="lede">크레피카 웹사이트에 접속하거나 도구를 사용하면 본 이용약관에 동의하는 것으로 간주됩니다. 모든 도구는 합법적인 개인 및 상업적 목적에 사용할 수 있습니다.</p>
      <section class="panel"><h2>서비스 이용</h2><ul><li>도구 결과물은 이용자가 직접 검토하고 활용합니다.</li><li>서비스 소스 코드의 무단 복제, 과도한 자동 호출, 보안 취약점 악용은 금지됩니다.</li><li>저작권, 초상권, 개인정보 등 타인의 권리를 침해하는 용도로 사용할 수 없습니다.</li></ul></section>
      <section class="panel"><h2>면책과 광고</h2><p>크레피카는 서비스를 현재 상태로 제공하며 결과의 완전한 정확성을 보증하지 않습니다. 무료 서비스 운영을 위해 Google AdSense 등 광고가 표시될 수 있습니다.</p></section>
      <section class="panel"><h2>문의</h2><p>약관 관련 문의는 support@crepika.com 또는 문의하기 페이지로 연락해 주세요.</p></section>
    `,
  },
  {
    path: "blog/index.html",
    title: "크리에이터 마케팅 블로그 | 크레피카",
    description: "SEO, SNS 마케팅, 콘텐츠 제작, 이미지 최적화, 생산성 도구 활용법을 다루는 크레피카 블로그입니다.",
    canonical: "https://crepika.com/blog",
    heading: "크리에이터 마케팅 블로그",
    sections: `
      <p class="lede">크레피카 블로그는 네이버 블로그 SEO, 구글 검색 최적화, 인스타그램과 유튜브 운영, WebP 이미지 최적화, QR 마케팅 등 실무형 가이드를 제공합니다.</p>
      <section class="panel"><h2>주요 주제</h2><ul><li>검색 노출을 위한 글 구조, 제목, 메타데이터 설계</li><li>소셜 미디어 캡션, 해시태그, 숏폼 운영 전략</li><li>크리에이터가 무료 도구로 제작 시간을 줄이는 방법</li><li>Core Web Vitals와 이미지 최적화 실무</li></ul></section>
    `,
  },
];

const toolPages = [
  ["tools/text-counter/index.html", "텍스트 카운터 | 크레피카", "글자 수, 단어 수, 줄 수를 실시간으로 확인하는 무료 텍스트 분석 도구입니다.", "https://crepika.com/tools/text-counter", "텍스트 카운터", "블로그 제목, SNS 캡션, 유튜브 설명, 메타 설명처럼 길이 제한이 중요한 콘텐츠를 작성할 때 바로 사용할 수 있습니다."],
  ["tools/byte-counter/index.html", "한글 바이트 카운터 | 크레피카", "UTF-8 기준 한글과 영문 바이트를 계산해 메타 설명과 SMS 문구 길이를 점검하는 무료 도구입니다.", "https://crepika.com/tools/byte-counter", "한글 바이트 카운터", "네이버 검색 결과 설명, 문자 발송 문구, 제한 길이가 있는 입력란을 작성할 때 글자 수와 바이트 수를 함께 확인합니다."],
  ["tools/lorem-generator/index.html", "로렘 입숨 생성기 | 크레피카", "디자인 시안과 목업 제작에 필요한 한국어와 영어 더미 텍스트를 빠르게 생성하는 도구입니다.", "https://crepika.com/tools/lorem-generator", "로렘 입숨 생성기", "실제 원고가 준비되기 전에도 카드뉴스, 랜딩 페이지, 앱 화면의 텍스트 밀도를 확인할 수 있습니다."],
  ["tools/webp-converter/index.html", "WebP 변환기 | 크레피카", "JPG와 PNG 이미지를 WebP 형식으로 변환해 웹사이트 로딩 속도와 이미지 SEO를 개선하는 무료 도구입니다.", "https://crepika.com/tools/webp-converter", "WebP 변환기", "이미지 파일은 브라우저에서 처리되며, 서버 업로드 없이 빠르게 변환 결과를 내려받을 수 있습니다."],
  ["tools/insta-spacer/index.html", "인스타 줄바꿈 포매터 | 크레피카", "인스타그램 캡션의 줄바꿈과 문단 간격을 깔끔하게 유지하도록 돕는 무료 포맷 도구입니다.", "https://crepika.com/tools/insta-spacer", "인스타 줄바꿈 포매터", "긴 캡션, 공지문, 이벤트 안내 문구를 읽기 쉬운 문단 구조로 정리합니다."],
  ["tools/hashtag-mixer/index.html", "해시태그 믹서 | 크레피카", "해시태그 중복을 줄이고 순서를 섞어 SNS 게시물 태그 묶음을 정리하는 무료 도구입니다.", "https://crepika.com/tools/hashtag-mixer", "해시태그 믹서", "반복적인 태그 조합을 정리하고 게시물마다 조금씩 다른 해시태그 구성을 만들 수 있습니다."],
  ["tools/qr-generator/index.html", "QR 코드 생성기 | 크레피카", "URL과 텍스트를 QR 코드로 변환하고 PNG로 내려받을 수 있는 무료 생성 도구입니다.", "https://crepika.com/tools/qr-generator", "QR 코드 생성기", "오프라인 포스터, 명함, 이벤트 안내문, 매장 메뉴판에서 온라인 페이지로 자연스럽게 연결할 수 있습니다."],
];

for (const [path, title, description, canonical, heading, body] of toolPages) {
  pages.push({
    path,
    title,
    description,
    canonical,
    heading,
    sections: `
      <p class="lede">${body}</p>
      <section class="panel"><h2>사용 방법</h2><ol><li>도구 페이지에 접속합니다.</li><li>분석하거나 변환할 텍스트, URL, 이미지 등 필요한 값을 입력합니다.</li><li>브라우저에서 즉시 계산되거나 생성된 결과를 확인합니다.</li><li>복사 또는 다운로드 기능으로 작업물에 활용합니다.</li></ol></section>
      <section class="panel"><h2>데이터 처리</h2><p>크레피카의 주요 도구는 입력값을 서버에 저장하지 않고 브라우저에서 처리하도록 설계되어 있습니다. 민감한 작업을 할 때도 불필요한 업로드 없이 사용할 수 있습니다.</p></section>
    `,
  });
}

for (const page of pages) {
  const target = join(publicDir, page.path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, shell(page), "utf8");
}

console.log(`Generated ${pages.length} crawler-visible pages.`);
