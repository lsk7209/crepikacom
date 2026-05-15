import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllBlogMeta } from "@/data/blog-posts-meta";

const CATEGORY_LABELS: Record<string, string> = {
  guide: "가이드",
  tips: "팁 & 트릭",
  insights: "인사이트",
  "case-study": "케이스 스터디",
};
const CATEGORY_COLORS: Record<string, string> = {
  guide:
    "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  tips: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  insights:
    "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  "case-study":
    "bg-green-500/10 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
};

export default function RecentBlogPosts() {
  const recentPosts = getAllBlogMeta().slice(0, 3);

  return (
    <section className="mt-20 mb-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-primary" />
          <h2 className="text-2xl md:text-3xl font-bold">최신 마케팅 가이드</h2>
        </div>
        <Link
          to="/blog"
          className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
        >
          마케팅 가이드 전체 보기 <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recentPosts.map((post) => (
          <Link key={post.slug} to={`/blog/${post.slug}`} className="group">
            <Card className="h-full hover:shadow-lg hover:border-primary/40 transition-all">
              <CardHeader className="pb-3">
                <Badge
                  variant="outline"
                  className={`w-fit text-xs mb-2 ${CATEGORY_COLORS[post.category] ?? ""}`}
                >
                  {CATEGORY_LABELS[post.category]}
                </Badge>
                <CardTitle className="text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {post.description}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime}</span>
                  </div>
                  <span>·</span>
                  <span>{post.author}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
