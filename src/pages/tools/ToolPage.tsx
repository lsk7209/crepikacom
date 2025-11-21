import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { getToolById } from "@/data/tools-config";
import { TextCounterTool } from "@/tools/text/TextCounterTool";
import { WebpConverterTool } from "@/tools/image/WebpConverterTool";
import { QrGeneratorTool } from "@/tools/analyze/QrGeneratorTool";

// SEO Article components
const TextCounterArticle = () => (
  <div className="bg-card rounded-lg border p-6 space-y-6">
    <div>
      <h2 className="text-2xl font-bold mb-3">Why use a text counter?</h2>
      <p className="text-muted-foreground">
        Accurate character counting is essential for social media posts, SEO meta descriptions, 
        and content creation. Our tool provides real-time counting with Korean-optimized byte 
        calculation following Naver standards, where each Korean character counts as 2 bytes.
        Perfect for Twitter limits, Instagram captions, and blog meta descriptions.
      </p>
    </div>

    <div>
      <h2 className="text-2xl font-bold mb-3">How to use this tool</h2>
      <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
        <li>Type or paste your text into the input area</li>
        <li>View real-time character counts instantly</li>
        <li>Check "With Spaces" for total characters including spaces</li>
        <li>Check "Without Spaces" for character count excluding spaces</li>
        <li>View word count, line count, and Korean-optimized byte count</li>
      </ol>
    </div>

    <div>
      <h3 className="text-xl font-semibold mb-2">Tips</h3>
      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
        <li>Korean byte counting follows Naver blog standards (2 bytes per Hangul character)</li>
        <li>Great for checking social media post lengths before publishing</li>
        <li>Use for SEO title and description optimization</li>
      </ul>
    </div>
  </div>
);

const WebPConverterArticle = () => (
  <div className="bg-card rounded-lg border p-6 space-y-6">
    <div>
      <h2 className="text-2xl font-bold mb-3">Why use a WebP converter?</h2>
      <p className="text-muted-foreground">
        WebP is a modern image format that provides superior compression for images on the web. 
        Converting to WebP can reduce file sizes by 25-35% compared to JPEG and PNG, leading to 
        faster page loads and better user experience. This tool converts your images with 80% 
        quality, maintaining visual fidelity while significantly reducing file size. All processing 
        happens in your browser for maximum privacy.
      </p>
    </div>

    <div>
      <h2 className="text-2xl font-bold mb-3">How to use this tool</h2>
      <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
        <li>Click the upload area or drag & drop your JPG/PNG image (max 10MB)</li>
        <li>Click "Convert to WebP" button and wait 2-3 seconds</li>
        <li>Preview the converted image and check size savings</li>
        <li>Click "Download WebP" to save the optimized image</li>
        <li>Use the WebP image on your website for faster loading</li>
      </ol>
    </div>

    <div>
      <h3 className="text-xl font-semibold mb-2">Browser Support</h3>
      <p className="text-sm text-muted-foreground">
        WebP is supported by all modern browsers including Chrome, Firefox, Safari, and Edge. 
        For older browsers, consider providing fallback images.
      </p>
    </div>
  </div>
);

const QRGeneratorArticle = () => (
  <div className="bg-card rounded-lg border p-6 space-y-6">
    <div>
      <h2 className="text-2xl font-bold mb-3">Why use a QR code generator?</h2>
      <p className="text-muted-foreground">
        QR codes are essential for bridging physical and digital experiences. Whether you're 
        sharing a website URL, social media profile, or event registration link, QR codes 
        make it easy for users to access content instantly by scanning with their phone camera.
        Perfect for business cards, marketing materials, product packaging, and event posters.
      </p>
    </div>

    <div>
      <h2 className="text-2xl font-bold mb-3">How to use this tool</h2>
      <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
        <li>Enter the URL you want to convert to a QR code (https:// is optional)</li>
        <li>Click "Generate QR Code" button</li>
        <li>Preview the generated QR code</li>
        <li>Click "Download PNG" to save the QR code image</li>
        <li>Use the downloaded QR code in your marketing materials, business cards, or websites</li>
      </ol>
    </div>

    <div>
      <h3 className="text-xl font-semibold mb-2">Best Practices</h3>
      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
        <li>Test your QR code before printing to ensure it scans correctly</li>
        <li>Use URL shorteners for very long URLs to improve scan reliability</li>
        <li>Maintain good contrast when placing QR codes on colored backgrounds</li>
        <li>Ensure the QR code is large enough to scan (minimum 2x2 cm recommended)</li>
      </ul>
    </div>
  </div>
);

export default function ToolPage() {
  const { id } = useParams<{ id: string }>();
  const config = getToolById(id || '');

  const [resultSlot, setResultSlot] = useState<React.ReactNode>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // If tool not found, redirect to 404
  if (!config) {
    return <Navigate to="/404" replace />;
  }

  // Render appropriate tool component
  let toolComponent;
  let seoArticle;

  switch (id) {
    case 'text-counter':
      toolComponent = TextCounterTool({
        onResult: setResultSlot,
        onError: setErrorMessage,
      });
      seoArticle = <TextCounterArticle />;
      break;

    case 'webp-converter':
      toolComponent = WebpConverterTool({
        onResult: setResultSlot,
        onError: setErrorMessage,
        onProcessing: setIsProcessing,
      });
      seoArticle = <WebPConverterArticle />;
      break;

    case 'qr-generator':
      toolComponent = QrGeneratorTool({
        onResult: setResultSlot,
        onError: setErrorMessage,
      });
      seoArticle = <QRGeneratorArticle />;
      break;

    default:
      return <Navigate to="/404" replace />;
  }

  return (
    <ToolLayout
      config={config}
      inputSlot={toolComponent.inputSlot}
      actionSlot={toolComponent.actionSlot}
      resultSlot={resultSlot}
      seoArticle={seoArticle}
      isProcessing={isProcessing}
      errorMessage={errorMessage || undefined}
    />
  );
}
