import { Link } from "react-router-dom";
import { Home, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet";

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>페이지를 찾을 수 없습니다 | 크레피카</title>
        <meta name="description" content="찾으시는 페이지가 존재하지 않거나 아직 준비 중입니다." />
      </Helmet>
      
      <div className="min-h-[calc(100vh-200px)] w-full flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
            <Wrench className="w-10 h-10 text-muted-foreground" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              준비 중입니다
            </h1>
            <p className="text-lg text-muted-foreground">
              준비 중인 도구입니다.
            </p>
            <p className="text-sm text-muted-foreground">
              곧 새로운 도구들이 추가될 예정입니다.
            </p>
          </div>
          
          <Link to="/">
            <Button size="lg" className="mt-4">
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
