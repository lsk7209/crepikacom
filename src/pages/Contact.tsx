import { Helmet } from "react-helmet";
import { Mail, MessageSquare, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Contact() {
  return (
    <>
      <Helmet>
        <title>문의하기 | 크레피카</title>
        <meta 
          name="description" 
          content="크레피카에 문의하기. 질문, 피드백, 제안 사항이 있으신가요? 언제든 연락 주세요." 
        />
        <meta name="keywords" content="문의하기, 고객지원, 피드백, 크레피카 연락처" />
        <link rel="canonical" href="https://crepika.com/contact" />
      </Helmet>

      <div className="container px-4 py-12 mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">문의하기</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            질문, 피드백, 제안 사항이 있으신가요? 언제든 연락 주세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Email Support
              </CardTitle>
              <CardDescription>
                Send us an email and we'll get back to you as soon as possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a 
                href="mailto:support@crepic.com" 
                className="text-primary hover:underline font-medium"
              >
                support@crepic.com
              </a>
              <p className="text-sm text-muted-foreground mt-2">
                Response time: Usually within 24-48 hours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Website Feedback
              </CardTitle>
              <CardDescription>
                Report bugs, suggest features, or share your experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a 
                href="mailto:feedback@crepic.com" 
                className="text-primary hover:underline font-medium"
              >
                feedback@crepic.com
              </a>
              <p className="text-sm text-muted-foreground mt-2">
                We appreciate all feedback to improve CrePic
              </p>
            </CardContent>
          </Card>
        </div>

        <article className="prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">How do I report a bug?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Please email us at feedback@crepic.com with details about the issue, including:
                  which tool you were using, what you expected to happen, and what actually happened. 
                  Screenshots are very helpful!
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Can I request a new tool?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Absolutely! We're always looking to add tools that help creators work faster. 
                  Send your suggestion to feedback@crepic.com and let us know what problem you're trying to solve.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Do you offer business partnerships?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  For business inquiries, partnerships, or advertising opportunities, 
                  please contact us at support@crepic.com with details about your proposal.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Is my data safe?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Yes! All tools run entirely in your browser. Your files and data never leave your device. 
                  Read our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> for more details.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">How can I support CrePic?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The best way to support us is by sharing CrePic with others who might find it useful. 
                  We also display ads to keep the service free, so allowing ads on our site helps support ongoing development.
                  <a href="/" className="text-primary hover:underline ml-1">모든 도구 보기</a>에서 더 많은 도구를 확인하세요.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Response Time</h2>
            <p className="text-muted-foreground leading-relaxed">
              We aim to respond to all inquiries within 24-48 hours during business days. 
              Please note that response times may be longer during weekends and holidays.
            </p>
          </section>
        </article>
      </div>
    </>
  );
}
