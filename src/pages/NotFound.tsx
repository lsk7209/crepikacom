import { Link } from "react-router-dom";
import { Home, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet";

const POPULAR_TOOLS = [
  { path: '/tools/text-counter', label: '글자수 세기' },
  { path: '/tools/qr-generator', label: 'QR 코드 생성기' },
  { path: '/tools/webp-converter', label: 'WebP 변환기' },
  { path: '/tools/hashtag-mixer', label: '해시태그 믹서' },
];

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>페이지를 찾을 수 없습니다 (404) | 크레피카</title>
        <meta name="description" content="요청하신 페이지를 찾을 수 없습니다. 크레피카의 무료 도구들을 이용해 보세요." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="min-h-[calc(100vh-200px)] w-full flex items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-lg">
          <div className="space-y-3">
            <p className="text-8xl font-black text-primary/20 leading-none">404</p>
            <h1 className="text-3xl md:text-4xl font-bold">
              페이지를 찾을 수 없습니다
            </h1>
            <p className="text-muted-foreground">
              요청하신 URL이 존재하지 않거나 삭제되었습니다.<br />
              아래 인기 도구들을 바로 이용해 보세요.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {POPULAR_TOOLS.map(t => (
              <Link
                key={t.path}
                to={t.path}
                className="flex items-center justify-between px-4 py-3 rounded-lg border bg-card hover:border-primary/50 hover:shadow-sm transition-all group"
              >
                <span className="font-medium group-hover:text-primary transition-colors">{t.label}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>

          <Link to="/">
            <Button size="lg" className="mt-2">
              <Home className="mr-2 h-4 w-4" />
              홈으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotFound;
