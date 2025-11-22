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
          <nav>
            <Link 
              to="/" 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-accent/10"
            >
              도구
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t bg-muted/30 py-12 mt-16">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">크레피카</span>
              </div>
              <p className="text-sm text-muted-foreground">
                로그인 없이 3초 만에 끝나는 크리에이터 도구
              </p>
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
                    텍스트 카운터
                  </Link>
                </li>
                <li>
                  <Link to="/tools/webp-converter" className="text-muted-foreground hover:text-primary transition-colors">
                    WebP 변환기
                  </Link>
                </li>
                <li>
                  <Link to="/tools/qr-generator" className="text-muted-foreground hover:text-primary transition-colors">
                    QR 코드 생성기
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold mb-4">회사</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                    소개
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                    문의
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-4">법률</h3>
              <ul className="space-y-2 text-sm">
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

          <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 크레피카. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              국내 크리에이터를 위해 ❤️로 만들었습니다
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
