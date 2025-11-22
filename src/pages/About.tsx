import { Helmet } from "react-helmet";
import { Sparkles, Zap, Shield, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function About() {
  return (
    <>
      <Helmet>
        <title>About CrePic | No Login. 3-Second Tools</title>
        <meta 
          name="description" 
          content="Learn about CrePic - free, instant tools for creators. Our mission is to provide fast, secure, and accessible web tools without login requirements." 
        />
      </Helmet>

      <div className="container px-4 py-12 mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About CrePic</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Fast, free, and private tools for creators around the world
          </p>
        </div>

        <article className="prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              CrePic was created with a simple philosophy: powerful tools should be accessible to everyone, instantly, without barriers.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              We believe that creators, whether they're social media managers, designers, developers, or content writers, 
              shouldn't have to sign up, pay, or wait to use basic utilities that make their work easier.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Every tool on CrePic runs entirely in your browser. Your data never touches our servers. 
              No tracking, no storage, no compromises on privacy.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">What We Offer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Instant Processing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    All tools work directly in your browser using modern web technologies. 
                    No server uploads, no waiting time, just instant results.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Complete Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Your files and data never leave your device. Everything is processed locally, 
                    ensuring your privacy and security at all times.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Always Free
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    No subscriptions, no premium tiers, no hidden costs. 
                    All tools are completely free to use, forever.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    No Login Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Jump straight to work without creating accounts or remembering passwords. 
                    Use any tool instantly, whenever you need it.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Tools</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              We currently offer tools across four categories designed to support your creative workflow:
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground min-w-[100px]">Plan:</span>
                <span>Text analysis and dummy content generation tools to help you prepare content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground min-w-[100px]">Create:</span>
                <span>Image optimization and conversion tools for better web performance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground min-w-[100px]">Publish:</span>
                <span>Social media formatting and hashtag management for Instagram and other platforms</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground min-w-[100px]">Analyze:</span>
                <span>QR code generation and other utility tools for sharing and distribution</span>
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Technology</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              CrePic is built with modern web technologies including React, TypeScript, and Tailwind CSS. 
              We leverage the latest browser APIs to provide desktop-quality tools directly in your web browser.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our progressive web app (PWA) architecture means you can install CrePic on your device 
              and access tools even with limited internet connectivity.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">Growing Together</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              We're constantly adding new tools based on what creators need most. 
              Every tool is designed with the same principles: speed, privacy, and simplicity.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Whether you're optimizing images for your website, formatting Instagram captions, 
              or generating QR codes for your business, CrePic is here to help you work faster and smarter.
            </p>
          </section>
        </article>
      </div>
    </>
  );
}
