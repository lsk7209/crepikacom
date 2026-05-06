import { ToolConfig, Category } from "@/data/tools-config";
import { AdSlot } from "@/components/ad/AdSlot";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { ChevronRight, Home as HomeIcon } from "lucide-react";

const SITE_URL = "https://crepika.com";
const TOOL_OG_IMAGES: Record<Category, string> = {
  plan:    `${SITE_URL}/images/og-tool-plan.svg`,
  create:  `${SITE_URL}/images/og-tool-create.svg`,
  publish: `${SITE_URL}/images/og-tool-publish.svg`,
  analyze: `${SITE_URL}/images/og-tool-analyze.svg`,
};

interface ToolLayoutProps {
  config: ToolConfig;
  inputSlot: React.ReactNode;
  actionSlot: React.ReactNode;
  resultSlot?: React.ReactNode;
  seoArticle: React.ReactNode;
  isProcessing?: boolean;
  errorMessage?: string;
}

export function ToolLayout({
  config,
  inputSlot,
  actionSlot,
  resultSlot,
  seoArticle,
  isProcessing = false,
  errorMessage,
}: ToolLayoutProps) {
  const pageTitle = config.seoTitle || `${config.titleKo} | 크레피카`;
  const pageDescription = config.seoDescription || config.descriptionKo;

  const canonicalUrl = `${SITE_URL}${config.path}`;
  const ogImage = TOOL_OG_IMAGES[config.category] ?? `${SITE_URL}/og-image.svg`;

  // SoftwareApplication schema
  const schemaData = config.schemaType === 'SoftwareApplication' ? {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": config.titleKo,
    "alternateName": config.titleEn,
    "description": pageDescription,
    "applicationCategory": "UtilitiesApplication",
    "inLanguage": "ko-KR",
    "url": canonicalUrl,
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW" },
    "operatingSystem": "Web Browser",
    "publisher": { "@type": "Organization", "name": "크레피카", "url": "https://crepika.com" }
  } : null;

  // BreadcrumbList schema
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://crepika.com" },
      { "@type": "ListItem", "position": 2, "name": config.titleKo, "item": canonicalUrl }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={config.keywords.join(', ')} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="크레피카" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:locale" content="ko_KR" />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />
        {schemaData && (
          <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
        )}
        <script type="application/ld+json">{JSON.stringify(breadcrumbData)}</script>
      </Helmet>

      <div className="container px-4 py-6 md:py-8 mx-auto max-w-2xl">
        {/* Breadcrumbs for SEO and Navigation */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-primary flex items-center gap-1 transition-colors">
            <HomeIcon className="h-3 w-3" />
            <span>홈</span>
          </Link>
          <ChevronRight className="h-3 w-3 flex-shrink-0" />
          <span className="font-medium text-foreground truncate">{config.titleKo}</span>
        </nav>

        {/* Header - 3-Second Rule: Title + Problem at top */}
        <header className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {config.titleKo}
          </h1>
          <p className="text-sm text-muted-foreground/70 mb-2">
            {config.titleEn}
          </p>
          <p className="text-base md:text-lg text-muted-foreground">
            {config.oneLineProblemKo}
          </p>
        </header>

        {/* Top Ad */}
        <AdSlot type="top" strategy={config.adStrategy} className="mb-6" />

        {/* Main Tool Interface - 3-Second Rule: Input + Action visible without scroll */}
        <main className="bg-card rounded-lg border shadow-sm p-4 md:p-6 mb-6">
          {/* Input Section */}
          <div className="mb-4">
            {inputSlot}
          </div>

          {/* Action Button */}
          <div className="mb-4">
            {actionSlot}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm" role="alert">
              {errorMessage}
            </div>
          )}

          {/* Processing Overlay - Only for process_heavy strategy */}
          {config.adStrategy === 'process_heavy' && isProcessing && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-card rounded-lg border shadow-lg p-6 max-w-md w-full mx-4">
                <div className="text-center mb-4">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" aria-hidden="true"></div>
                  <p className="text-lg font-semibold mb-2">파일을 변환하는 중...</p>
                  <p className="text-sm text-muted-foreground">잠시만 기다려 주세요</p>
                </div>
                <AdSlot type="loading" strategy={config.adStrategy} isProcessing={isProcessing} />
              </div>
            </div>
          )}

          {/* Result Section */}
          {resultSlot && (
            <div className="mt-6 pt-6 border-t">
              {resultSlot}
              <div className="mt-4">
                <AdSlot
                  type={config.adStrategy === 'download_focused' ? 'download' : 'bottom'}
                  strategy={config.adStrategy}
                />
              </div>
            </div>
          )}
        </main>

        {/* SEO Article */}
        <article className="prose prose-sm max-w-none dark:prose-invert">
          {seoArticle}
        </article>
      </div>
    </>
  );
}
