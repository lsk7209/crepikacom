import { Link, Navigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, BookOpen, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllBlogMeta } from "@/data/blog-posts-meta";
import { getHubBySlug, getPostsForHub } from "@/data/blog-hubs";
import { getToolById } from "@/data/tools-config";

const SITE_URL = "https://crepika.com";

export default function BlogHub() {
  const { hubSlug } = useParams<{ hubSlug: string }>();
  const hub = getHubBySlug(hubSlug);

  if (!hub) return <Navigate to="/blog" replace />;

  const posts = getPostsForHub(getAllBlogMeta(), hub);
  const tools = hub.primaryToolPaths
    .map((path) => getToolById(path.split("/").pop() ?? ""))
    .filter(Boolean);
  const canonicalUrl = `${SITE_URL}/topics/${hub.slug}`;
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${canonicalUrl}#collection`,
    url: canonicalUrl,
    name: hub.title,
    description: hub.description,
    inLanguage: "ko-KR",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: posts.length,
      itemListElement: posts.slice(0, 20).map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}/blog/${post.slug}`,
        name: post.title,
        description: post.description,
      })),
    },
  };

  return (
    <>
      <Helmet>
        <title>{hub.title} | 크레피카 블로그</title>
        <meta name="description" content={hub.description} />
        <meta name="keywords" content={hub.keywords.join(", ")} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${hub.title} | 크레피카`} />
        <meta property="og:description" content={hub.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={hub.title} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={hub.title} />
        <meta name="twitter:description" content={hub.description} />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />
        <meta name="twitter:image:alt" content={hub.title} />
        <script type="application/ld+json">
          {JSON.stringify(collectionSchema)}
        </script>
      </Helmet>

      <main className="container mx-auto max-w-7xl px-4 py-12">
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">홈</Link>
          <span>/</span>
          <Link to="/blog" className="hover:text-primary">블로그</Link>
          <span>/</span>
          <span className="text-foreground">{hub.title}</span>
        </nav>

        <header className="mb-10 max-w-3xl">
          <Badge variant="secondary" className="mb-4">주제 허브</Badge>
          <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl">
            {hub.title}
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            {hub.description}
          </p>
        </header>

        <section className="mb-12 rounded-lg border bg-card p-6">
          <h2 className="mb-5 flex items-center gap-2 text-2xl font-bold">
            <Wrench className="h-5 w-5 text-primary" />
            함께 쓰면 좋은 도구
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {tools.map((tool) => (
              <Link key={tool.id} to={tool.path} className="group">
                <Card className="h-full transition hover:border-primary/50">
                  <CardHeader>
                    <CardTitle className="text-base group-hover:text-primary">
                      {tool.titleKo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {tool.descriptionKo}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-5 flex items-center gap-2 text-2xl font-bold">
            <BookOpen className="h-5 w-5 text-primary" />
            추천 가이드
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.slug} to={`/blog/${post.slug}`} className="group">
                <Card className="h-full transition hover:border-primary/50 hover:shadow-md">
                  <CardHeader>
                    <Badge variant="outline" className="mb-2 w-fit">
                      {post.category}
                    </Badge>
                    <CardTitle className="line-clamp-2 text-xl group-hover:text-primary">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
                      {post.description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                      읽기 <ArrowRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
