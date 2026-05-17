import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { getToolById } from "@/data/tools-config";
import { TextCounterTool } from "@/tools/text/TextCounterTool";
import { LoremGeneratorTool } from "@/tools/plan/LoremGeneratorTool";
import { ByteCounterTool } from "@/tools/plan/ByteCounterTool";
import { WebpConverterTool } from "@/tools/image/WebpConverterTool";
import { InstaSpacerTool } from "@/tools/publish/InstaSpacerTool";
import { HashtagMixerTool } from "@/tools/publish/HashtagMixerTool";
import { QrGeneratorTool } from "@/tools/analyze/QrGeneratorTool";
import { addRecentTool } from "@/utils/localStorage";
import { toast } from "@/hooks/use-toast";

import { TOOL_DETAILED_CONTENT, ToolDetailedContent } from "@/data/tool-content";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, Lightbulb, HelpCircle, Link as LinkIcon, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const TOOL_INTRO_HEADING: Record<string, string> = {
  'text-counter': '텍스트 카운터가 필요한 이유',
  'webp-converter': 'WebP 변환기의 핵심 역할',
  'qr-generator': 'QR 코드 생성기의 효과',
  'lorem-generator': '로렘 생성기가 디자인 작업에 필수인 이유',
  'byte-counter': '한글 바이트 카운터가 SEO에 중요한 이유',
  'insta-spacer': '인스타 줄바꿈 포매터의 역할',
  'hashtag-mixer': '해시태그 믹서로 알고리즘 페널티 방지하기',
};

// Dynamic detailed article component for better SEO/AEO/GEO
const DetailedToolArticle = ({ content }: { content: ToolDetailedContent }) => (
  <div className="space-y-12 mt-8 border-t pt-12">
    {/* Introduction */}
    <section>
      <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2">
        <CheckCircle2 className="text-primary h-8 w-8" />
        {TOOL_INTRO_HEADING[content.id] ?? '도구 소개'}
      </h2>
      <div className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
        {content.introduction}
      </div>
    </section>

    {/* Key Benefits */}
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {content.keyBenefits.map((benefit, idx) => (
        <div key={idx} className="bg-muted/30 rounded-xl p-6 border border-border/50 hover:border-primary/30 transition-colors">
          <h3 className="text-xl font-bold mb-3 text-primary">{benefit.title}</h3>
          <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
        </div>
      ))}
    </section>

    {/* How to Use */}
    <section className="bg-card rounded-2xl border p-8 shadow-sm">
      <h2 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-2">
        <Lightbulb className="text-amber-500 h-8 w-8" />
        도구 사용 가이드 및 꿀팁
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h3 className="text-xl font-semibold mb-4 text-foreground/80">단계별 사용 방법</h3>
          <ol className="space-y-4">
            {content.howToUse.steps.map((step, idx) => (
              <li key={idx} className="flex gap-4">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold mt-1">
                  {idx + 1}
                </span>
                <p className="text-muted-foreground leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4 text-foreground/80">전문가 실전 팁</h3>
          <ul className="space-y-4">
            {content.howToUse.tips.map((tip, idx) => (
              <li key={idx} className="flex gap-3 items-start bg-amber-500/5 p-4 rounded-lg border border-amber-500/10">
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200 mt-1">TIP</Badge>
                <p className="text-sm md:text-base text-muted-foreground">{tip}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>

    {/* FAQ Area for AEO (Answer Engine Optimization) */}
    <section>
      <h2 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-2">
        <HelpCircle className="text-blue-500 h-8 w-8" />
        자주 묻는 질문 (FAQ)
      </h2>
      <Accordion type="single" collapsible className="w-full">
        {content.faq.map((item, idx) => (
          <AccordionItem key={idx} value={`faq-${idx}`} className="border-b-border/50">
            <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline hover:text-primary transition-colors py-5">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-6">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>

    {/* Related Resources for Inlinks */}
    <section className="bg-muted/20 border rounded-2xl p-8">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <LinkIcon className="h-5 w-5" />
        함께 활용하면 좋은 리소스
      </h2>
      <div className="flex flex-wrap gap-4">
        {content.relatedResources.map((res, idx) => (
          <Link
            key={idx}
            to={res.path}
            className="group flex items-center gap-2 bg-background border px-4 py-3 rounded-xl hover:border-primary hover:shadow-md transition-all"
          >
            <span className="font-medium group-hover:text-primary">{res.title}</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>
    </section>
  </div>
);

export default function ToolPage() {
  const { id } = useParams<{ id: string }>();
  const config = getToolById(id || '');

  const [resultSlot, setResultSlot] = useState<React.ReactNode>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (resultSlot && id) {
      addRecentTool(id);
    }
  }, [resultSlot, id]);

  if (!config) {
    return <Navigate to="/404" replace />;
  }

  const handleResult = (result: React.ReactNode) => {
    setResultSlot(result);
    setErrorMessage(null);
  };

  const handleError = (error: string | null) => {
    setErrorMessage(error);
    setResultSlot(null);
    if (error) {
      toast({
        variant: 'destructive',
        title: '오류',
        description: error,
      });
    }
  };

  let toolComponent;
  const detailedContent = id ? TOOL_DETAILED_CONTENT[id] : undefined;

  switch (id) {
    case 'text-counter':
      toolComponent = TextCounterTool({
        onResult: handleResult,
        onError: handleError,
      });
      break;

    case 'lorem-generator':
      toolComponent = LoremGeneratorTool({
        onResult: handleResult,
        onError: handleError,
      });
      break;

    case 'byte-counter':
      toolComponent = ByteCounterTool({
        onResult: handleResult,
        onError: handleError,
      });
      break;

    case 'webp-converter':
      toolComponent = WebpConverterTool({
        onResult: handleResult,
        onError: handleError,
        onProcessing: setIsProcessing,
      });
      break;

    case 'insta-spacer':
      toolComponent = InstaSpacerTool({
        onResult: handleResult,
        onError: handleError,
      });
      break;

    case 'hashtag-mixer':
      toolComponent = HashtagMixerTool({
        onResult: handleResult,
        onError: handleError,
      });
      break;

    case 'qr-generator':
      toolComponent = QrGeneratorTool({
        onResult: handleResult,
        onError: handleError,
      });
      break;

    default:
      return <Navigate to="/404" replace />;
  }

  const seoArticle = detailedContent ? (
    <DetailedToolArticle content={detailedContent} />
  ) : (
    <div className="py-12 text-center text-muted-foreground border-t mt-8">
      <p>상세 가이드를 준비 중입니다.</p>
    </div>
  );

  const faqSchema = detailedContent?.faq?.length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": detailedContent.faq.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": { "@type": "Answer", "text": item.answer }
    }))
  } : null;

  const howToSchema = detailedContent?.howToUse?.steps?.length ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `${config.titleKo} 사용 방법`,
    "description": config.seoDescription || config.descriptionKo,
    "inLanguage": "ko-KR",
    "tool": [{ "@type": "HowToTool", "name": config.titleKo }],
    "step": detailedContent.howToUse.steps.map((step, idx) => ({
      "@type": "HowToStep",
      "position": idx + 1,
      "name": `${idx + 1}단계`,
      "text": step,
    }))
  } : null;

  return (
    <>
    {faqSchema && (
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
    )}
    {howToSchema && (
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(howToSchema)}</script>
      </Helmet>
    )}
    <ToolLayout
      config={config}
      inputSlot={toolComponent.inputSlot}
      actionSlot={toolComponent.actionSlot}
      resultSlot={resultSlot}
      seoArticle={seoArticle}
      isProcessing={isProcessing}
      errorMessage={errorMessage || undefined}
    />
    </>
  );
}
