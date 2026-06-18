import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { getToolById, type ToolConfig } from "@/data/tools-config";
import { addRecentTool } from "@/utils/localStorage";
import { toast } from "@/hooks/use-toast";

import type { ToolDetailedContent } from "@/data/tool-content";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, Lightbulb, HelpCircle, Link as LinkIcon, ArrowRight, ClipboardCheck } from "lucide-react";
import { Link } from "react-router-dom";

type ToolSlots = {
  inputSlot: ReactNode;
  actionSlot: ReactNode;
};

type ToolRendererProps = {
  toolId?: string;
  onResult: (result: ReactNode | null) => void;
  onError: (error: string | null) => void;
  onProcessing?: (isProcessing: boolean) => void;
};

type ToolRenderer = (props: ToolRendererProps) => ToolSlots;

const BUILTIN_TOOL_LOADERS: Record<string, () => Promise<ToolRenderer>> = {
  "text-counter": () => import("@/tools/text/TextCounterTool").then((m) => m.TextCounterTool),
  "lorem-generator": () => import("@/tools/plan/LoremGeneratorTool").then((m) => m.LoremGeneratorTool),
  "byte-counter": () => import("@/tools/plan/ByteCounterTool").then((m) => m.ByteCounterTool),
  "webp-converter": () => import("@/tools/image/WebpConverterTool").then((m) => m.WebpConverterTool),
  "insta-spacer": () => import("@/tools/publish/InstaSpacerTool").then((m) => m.InstaSpacerTool),
  "hashtag-mixer": () => import("@/tools/publish/HashtagMixerTool").then((m) => m.HashtagMixerTool),
  "qr-generator": () => import("@/tools/analyze/QrGeneratorTool").then((m) => m.QrGeneratorTool),
};

function loadToolRenderer(id: string): Promise<ToolRenderer> {
  const loadBuiltin = BUILTIN_TOOL_LOADERS[id];
  if (loadBuiltin) return loadBuiltin();
  return import("@/tools/generated/SimpleGeneratedTool").then((m) => m.SimpleGeneratedTool);
}

async function loadDetailedContent(id: string): Promise<ToolDetailedContent | undefined> {
  if (BUILTIN_TOOL_LOADERS[id]) {
    const module = await import("@/data/tool-content");
    return module.TOOL_DETAILED_CONTENT[id];
  }
  const module = await import("@/data/generated-tool-content");
  return module.GENERATED_TOOL_CONTENT[id];
}

const TOOL_INTRO_HEADING: Record<string, string> = {
  'text-counter': '텍스트 카운터가 필요한 이유',
  'webp-converter': 'WebP 변환기의 핵심 역할',
  'qr-generator': 'QR 코드 생성기의 효과',
  'lorem-generator': '로렘 생성기가 디자인 작업에 필수인 이유',
  'byte-counter': '한글 바이트 카운터가 SEO에 중요한 이유',
  'insta-spacer': '인스타 줄바꿈 포매터의 역할',
  'hashtag-mixer': '해시태그 믹서로 알고리즘 페널티 방지하기',
};

const TOOL_USE_CASES: Record<string, string[]> = {
  "text-counter": [
    "메타 타이틀과 디스크립션을 발행 전에 길이 기준으로 점검할 때",
    "인스타그램, 유튜브, 블로그 초안의 앞부분 핵심 문장을 다듬을 때",
    "외주 원고나 팀 문서의 분량 기준을 빠르게 맞출 때",
  ],
  "byte-counter": [
    "네이버 검색 결과에서 제목과 설명이 잘리지 않도록 확인할 때",
    "한글, 영문, 숫자가 섞인 문구의 실제 바이트 길이를 점검할 때",
    "문자 발송이나 플랫폼 입력 제한을 넘기지 않도록 검수할 때",
  ],
  "webp-converter": [
    "블로그 대표 이미지와 본문 이미지를 WebP로 줄여 LCP 부담을 낮출 때",
    "여러 플랫폼에 올릴 이미지를 발행 전 가볍게 만들 때",
    "사이트 속도 개선 전후의 이미지 용량 차이를 확인할 때",
  ],
  "qr-generator": [
    "오프라인 홍보물에서 블로그, 랜딩 페이지, 쿠폰 페이지로 연결할 때",
    "행사 안내문, 명함, 매장 메뉴판에 빠른 접속 경로를 넣을 때",
    "UTM 캠페인 URL을 QR로 바꿔 유입 경로를 구분할 때",
  ],
};

function getToolUseCases(content: ToolDetailedContent) {
  return (
    TOOL_USE_CASES[content.id] ?? [
      "초안 작성 후 발행 전에 오류와 누락을 빠르게 점검할 때",
      "반복 작업을 줄이고 같은 기준으로 여러 콘텐츠를 검수할 때",
      "블로그, SNS, 뉴스레터 등 채널별 입력 제한을 맞출 때",
    ]
  );
}

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

    <section className="rounded-2xl border bg-sky-500/[0.04] p-6">
      <h2 className="mb-5 flex items-center gap-2 text-2xl font-bold">
        <ClipboardCheck className="h-6 w-6 text-sky-400" />
        이런 상황에서 쓰면 좋습니다
      </h2>
      <div className="grid gap-3 md:grid-cols-3">
        {getToolUseCases(content).map((useCase) => (
          <div key={useCase} className="rounded-lg border bg-background/70 p-4 text-sm text-muted-foreground">
            {useCase}
          </div>
        ))}
      </div>
    </section>

    <section className="rounded-2xl border bg-background p-6">
      <h2 className="mb-4 text-2xl font-bold">공식 기준과 함께 확인하세요</h2>
      <p className="text-muted-foreground leading-relaxed">
        크레피카 도구의 계산 결과는 발행 전 점검을 돕는 참고값입니다. 검색 노출, 구조화 데이터, 접근성,
        이미지 최적화처럼 플랫폼 정책이 영향을 주는 항목은 공개 문서와 실제 발행 화면을 함께 확인해야 합니다.
      </p>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        특히 텍스트 카운터와 바이트 계산기는 문장을 대신 평가하지 않습니다. 제목이 짧아도 검색 의도와 맞지
        않으면 성과가 낮을 수 있고, 본문이 길어도 중복 문장이 많으면 품질 신호가 약해질 수 있습니다.
        도구 결과는 초안의 형식 오류를 줄이는 기준으로 사용하고, 최종 발행 전에는 독자가 얻는 정보와
        출처, 내부 링크, 모바일 화면 가독성을 함께 점검해야 합니다.
      </p>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        크레피카는 로그인 없이 빠르게 쓰는 작업 도구를 지향합니다. 파일이나 텍스트를 입력할 때는 공개 전
        원고, 고객 정보, 비밀번호, 계약 조건처럼 민감한 내용을 불필요하게 넣지 않는 것이 좋습니다.
        결과가 복사 가능한 형태로 제공되더라도 실제 플랫폼 제한은 네이버, 인스타그램, 유튜브, 블로그
        편집기의 최신 정책을 기준으로 다시 확인해야 합니다.
      </p>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <a href="https://developers.google.com/search/docs" target="_blank" rel="noopener noreferrer" className="rounded-lg border p-4 text-sm text-muted-foreground hover:border-primary">
          <strong className="block text-foreground">Google Search Central</strong>
          검색 친화적인 콘텐츠와 기술 SEO 기준을 확인합니다.
        </a>
        <a href="https://schema.org" target="_blank" rel="noopener noreferrer" className="rounded-lg border p-4 text-sm text-muted-foreground hover:border-primary">
          <strong className="block text-foreground">schema.org</strong>
          FAQ, HowTo, Article 구조화 데이터 기준을 확인합니다.
        </a>
        <a href="https://developer.mozilla.org" target="_blank" rel="noopener noreferrer" className="rounded-lg border p-4 text-sm text-muted-foreground hover:border-primary">
          <strong className="block text-foreground">MDN Web Docs</strong>
          웹 표준, 이미지 형식, 접근성 기본 원칙을 확인합니다.
        </a>
      </div>
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
  const config = getToolById(id || "");
  const [renderer, setRenderer] = useState<ToolRenderer | null>(null);
  const [detailedContent, setDetailedContent] = useState<ToolDetailedContent | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !config) return;
    let cancelled = false;
    setRenderer(null);
    setDetailedContent(undefined);
    setLoadError(null);

    Promise.all([loadToolRenderer(id), loadDetailedContent(id)])
      .then(([loadedRenderer, loadedContent]) => {
        if (cancelled) return;
        setRenderer(() => loadedRenderer);
        setDetailedContent(loadedContent);
      })
      .catch(() => {
        if (!cancelled) setLoadError("도구를 불러오지 못했습니다.");
      });

    return () => {
      cancelled = true;
    };
  }, [id, config]);

  if (!config) {
    return <Navigate to="/404" replace />;
  }

  if (loadError) {
    return <Navigate to="/404" replace />;
  }

  if (!id || !renderer) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <ToolRuntime
      key={id}
      id={id}
      config={config}
      renderer={renderer}
      detailedContent={detailedContent}
    />
  );
}

function ToolRuntime({
  id,
  config,
  renderer,
  detailedContent,
}: {
  id: string;
  config: ToolConfig;
  renderer: ToolRenderer;
  detailedContent?: ToolDetailedContent;
}) {
  const [resultSlot, setResultSlot] = useState<ReactNode>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (resultSlot && id) {
      addRecentTool(id);
    }
  }, [resultSlot, id]);

  const handleResult = (result: ReactNode) => {
    setResultSlot(result);
    setErrorMessage(null);
  };

  const handleError = (error: string | null) => {
    setErrorMessage(error);
    setResultSlot(null);
    if (error) {
      toast({
        variant: "destructive",
        title: "오류",
        description: error,
      });
    }
  };

  const toolComponent = renderer({
    toolId: id,
    onResult: handleResult,
    onError: handleError,
    onProcessing: setIsProcessing,
  });

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
