import { Link } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import { TOOLS_CONFIG } from "@/data/tools-config";

function IconSparkles({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </svg>
  );
}

function IconSun({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function IconMoon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Skip to main content — accessibility + AdSense */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-lg"
      >
        메인 콘텐츠로 이동
      </a>
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 md:h-16 items-center justify-between px-4 mx-auto max-w-7xl">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <IconSparkles className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              크레피카
            </span>
          </Link>

          {/* Center: Slogan (hidden on mobile) */}
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
            <p className="text-sm font-medium text-muted-foreground">
              로그인 없이 · 3초 만에 완성
            </p>
          </div>

          {/* Right: Navigation */}
          <nav className="flex items-center gap-1" aria-label="주요 메뉴">
            <button
              onClick={toggle}
              aria-label={
                theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"
              }
              className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-accent/10 transition-colors"
            >
              {theme === "dark" ? (
                <IconSun className="h-4 w-4" />
              ) : (
                <IconMoon className="h-4 w-4" />
              )}
            </button>
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-accent/10"
            >
              도구
            </Link>
            <Link
              to="/blog"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-accent/10"
            >
              블로그
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-accent/10"
            >
              소개
            </Link>
          </nav>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <footer className="bg-muted/50 border-t py-12">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand and Info */}
            <div className="col-span-2 md:col-span-1">
              <Link
                to="/"
                className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4 inline-block"
              >
                크레피카
              </Link>
              <div className="space-y-2 text-xs text-muted-foreground leading-relaxed mt-2">
                <p>
                  <strong>서비스명:</strong> 크레피카 (Crepika)
                </p>
                <p>
                  <strong>이메일:</strong> support@crepika.com
                </p>
                <p className="pt-2">
                  크리에이터의 창작 효율을 높이는 무료 스마트 유틸리티
                  서비스입니다.
                </p>
              </div>
            </div>

            {/* Tools */}
            <div>
              <h3 className="font-semibold mb-4">도구</h3>
              <ul className="space-y-2 text-sm">
                {TOOLS_CONFIG.map((tool) => (
                  <li key={tool.id}>
                    <Link
                      to={tool.path}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {tool.titleKo}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Blog Section */}
            <div>
              <h3 className="font-semibold mb-4">가이드</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/blog"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    전체 블로그
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog/naver-blog-seo-guide"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    네이버 블로그 SEO
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog/instagram-marketing-complete-guide"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    인스타 마케팅 가이드
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog/platform-text-length-guide"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    플랫폼별 글자수 가이드
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog/aeo-search-future-guide"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    AEO 최적화 가이드
                  </Link>
                </li>
                <li>
                  <Link
                    to="/topics/seo"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    SEO 허브
                  </Link>
                </li>
                <li>
                  <Link
                    to="/topics/adsense"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    AdSense 허브
                  </Link>
                </li>
                <li>
                  <a
                    href="/rss.xml"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                  >
                    RSS 피드
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal & Company */}
            <div>
              <h3 className="font-semibold mb-4">고객지원</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/about"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    소개
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    문의하기
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    개인정보처리방침
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    이용약관
                  </Link>
                </li>
                <li>
                  <Link
                    to="/editorial-policy"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    콘텐츠 작성 기준
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tool-data-policy"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    도구 데이터 처리
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <p>© 2026 크레피카 (Crepika). All rights reserved.</p>
            <p>
              모든 데이터는 브라우저 내에서 안전하게 처리되며 서버에 저장되지
              않습니다.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
