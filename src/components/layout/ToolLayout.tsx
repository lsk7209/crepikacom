import { ToolConfig } from "@/data/tools-config";
import { AdSlot } from "@/components/ad/AdSlot";
import { Helmet } from "react-helmet";

interface ToolLayoutProps {
  config: ToolConfig;
  inputSlot: React.ReactNode;
  actionSlot: React.ReactNode;
  resultSlot?: React.ReactNode;
  seoArticle: React.ReactNode;
  isProcessing?: boolean;
}

export function ToolLayout({
  config,
  inputSlot,
  actionSlot,
  resultSlot,
  seoArticle,
  isProcessing = false,
}: ToolLayoutProps) {
  const pageTitle = config.seoTitle || `${config.title} | CrePic`;

  // Generate JSON-LD schema
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": config.title,
    "description": config.description,
    "applicationCategory": "UtilitiesApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "operatingSystem": "Web Browser"
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={config.description} />
        <meta name="keywords" content={config.keywords.join(', ')} />
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>

      <div className="container px-4 py-8 mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {config.title}
          </h1>
          <p className="text-lg text-muted-foreground">
            {config.oneLineProblem}
          </p>
        </div>

        {/* Top Ad */}
        <AdSlot type="top" className="mb-6" />

        {/* Main Tool Interface */}
        <div className="bg-card rounded-lg border shadow-sm p-6 mb-6">
          {/* Input Section */}
          <div className="mb-4">
            {inputSlot}
          </div>

          {/* Action Button */}
          <div className="mb-4">
            {actionSlot}
          </div>

          {/* Processing Overlay */}
          {config.adStrategy === 'process_heavy' && isProcessing && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-card rounded-lg border shadow-lg p-6 max-w-md w-full mx-4">
                <div className="text-center mb-4">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                  <p className="text-lg font-semibold mb-2">Processing your file...</p>
                  <p className="text-sm text-muted-foreground">This will take just a moment</p>
                </div>
                <AdSlot type="loading" />
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
                />
              </div>
            </div>
          )}
        </div>

        {/* SEO Article */}
        <div className="prose prose-sm max-w-none">
          {seoArticle}
        </div>
      </div>
    </>
  );
}
