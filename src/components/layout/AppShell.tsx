import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 md:h-16 items-center justify-between px-4 mx-auto max-w-7xl">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              크레피카
            </span>
          </Link>

          {/* Center: Slogan (hidden on mobile) */}
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
            <p className="text-sm font-medium text-muted-foreground">
              No Login. 3-Second Tools.
            </p>
          </div>

          {/* Right: Navigation */}
          <nav className="flex items-center gap-1">
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
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-muted/50 border-t py-12">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand and Info */}
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4 inline-block">
                CrePika
              </Link>
              <div className="space-y-2 text-xs text-muted-foreground leading-relaxed mt-2">
                <p><strong>대표:</strong> 김민혁 | <strong>팀명:</strong> 크레피카(Crepika)</p>
                <p><strong>주소:</strong> 서울특별시 강남구 테헤란로 123, 크리에이티브 타워 15층</p>
                <p><strong>이메일:</strong> support@crepika.com</p>
                <p className="pt-2">전 세계 크리에이터의 창작 효율을 높이는 스마트 유틸리티 서비스를 만듭니다.</p>
              </div>
            </div>

            {/* Tools */}
            <div>
              <h3 className="font-semibold mb-4">도구</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                    전체 도구
                  </Link>
                </li>
                <li>
                  <Link to="/tools/text-counter" className="text-muted-foreground hover:text-primary transition-colors">
                    글자수 세기
                  </Link>
                </li>
                <li>
                  <Link to="/tools/webp-converter" className="text-muted-foreground hover:text-primary transition-colors">
                    WebP 변환
                  </Link>
                </li>
                <li>
                  <Link to="/tools/qr-generator" className="text-muted-foreground hover:text-primary transition-colors">
                    QR 코드
                  </Link>
                </li>
              </ul>
            </div>

            {/* Blog Section */}
            <div>
              <h3 className="font-semibold mb-4">가이드</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                    전체 블로그
                  </Link>
                </li>
                <li>
                  <Link to="/blog/instagram-marketing-complete-guide" className="text-muted-foreground hover:text-primary transition-colors">
                    인스타 마케팅 가이드
                  </Link>
                </li>
                <li>
                  <Link to="/blog/aeo-search-future-guide" className="text-muted-foreground hover:text-primary transition-colors">
                    AEO 최적화 가이드
                  </Link>
                </li>
                <li>
                  <a href="/rss.xml" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
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
                  <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                    소개 (About)
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                    개인정보처리방침
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                    이용약관
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <p>© 2026 CrePika. All rights reserved.</p>
            <p>모든 데이터는 브라우저 내에서 안전하게 처리되며 서버에 저장되지 않습니다.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
