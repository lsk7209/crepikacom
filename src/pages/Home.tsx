import { Link } from "react-router-dom";
import { TOOLS_CONFIG, CATEGORY_LABELS, Category } from "@/data/tools-config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";
import { Helmet } from "react-helmet";

export default function Home() {
  // Group tools by category
  const categories = ['plan', 'create', 'publish', 'analyze'] as Category[];
  const toolsByCategory = categories.map(category => ({
    category,
    label: CATEGORY_LABELS[category],
    tools: TOOLS_CONFIG.filter(tool => tool.category === category),
  }));

  return (
    <>
      <Helmet>
        <title>CrePic - No Login. 3-Second Tools for Creators</title>
        <meta 
          name="description" 
          content="Free online tools for creators. QR code generator, text counter, WebP converter, and more. No login required. Instant results." 
        />
      </Helmet>

      <div className="container px-4 py-12 mx-auto max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            No Login. 3-Second Tools.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Fast, free tools for creators. Choose what you need and get instant results.
          </p>
        </div>

        {/* Tools Grid by Category */}
        <div className="space-y-12">
          {toolsByCategory.map(({ category, label, tools }) => (
            tools.length > 0 && (
              <section key={category}>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold">{label}</h2>
                  <Badge variant="secondary">{tools.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tools.map((tool) => (
                    <Link
                      key={tool.id}
                      to={tool.path}
                      className="group"
                    >
                      <Card className="h-full transition-all hover:shadow-lg hover:scale-105 hover:border-primary/50">
                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="outline" className="mb-2">
                              {label}
                            </Badge>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <CardTitle className="group-hover:text-primary transition-colors">
                            {tool.title}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {tool.oneLineProblem}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {tool.description}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Instant Results</h3>
            <p className="text-sm text-muted-foreground">
              All processing happens in your browser. No waiting, no uploads.
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10 mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">100% Private</h3>
            <p className="text-sm text-muted-foreground">
              Your data never leaves your device. No servers, no storage.
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-success/10 mb-4">
              <span className="text-2xl">🆓</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Always Free</h3>
            <p className="text-sm text-muted-foreground">
              No subscriptions, no hidden fees. Use as much as you need.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
