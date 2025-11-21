import { useState } from "react";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { getToolById } from "@/data/tools-config";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download } from "lucide-react";
import QRCode from "qrcode";

export default function QRGenerator() {
  const config = getToolById('qr-generator')!;
  const [url, setUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      toast.error("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrDataUrl(dataUrl);
      toast.success("QR Code generated!");
    } catch (error) {
      toast.error("Failed to generate QR code");
      console.error(error);
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `qr-code-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR Code downloaded!");
  };

  const inputSlot = (
    <div className="space-y-2">
      <Label htmlFor="url-input">Enter URL</Label>
      <Input
        id="url-input"
        type="url"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        aria-label="URL input for QR code generation"
      />
    </div>
  );

  const actionSlot = (
    <Button 
      onClick={handleGenerate}
      disabled={!url.trim()}
      className="w-full"
      size="lg"
    >
      Generate QR Code
    </Button>
  );

  const resultSlot = qrDataUrl ? (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="bg-white p-4 rounded-lg border-2 border-border inline-block">
          <img 
            src={qrDataUrl} 
            alt="Generated QR Code" 
            className="w-64 h-64"
          />
        </div>
      </div>
      <Button
        onClick={handleDownload}
        className="w-full"
        size="lg"
        variant="default"
      >
        <Download className="mr-2 h-4 w-4" />
        Download PNG
      </Button>
    </div>
  ) : null;

  const seoArticle = (
    <div className="bg-card rounded-lg border p-6">
      <h2 className="text-2xl font-bold mb-4">Why use this tool?</h2>
      <p className="text-muted-foreground mb-6">
        QR codes are essential for bridging physical and digital experiences. Whether you're 
        sharing a website URL, social media profile, or event registration link, QR codes 
        make it easy for users to access content instantly by scanning with their phone camera.
      </p>

      <h2 className="text-2xl font-bold mb-4">How to use</h2>
      <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
        <li>Enter the URL you want to convert to a QR code</li>
        <li>Click "Generate QR Code" button</li>
        <li>Preview the generated QR code</li>
        <li>Click "Download PNG" to save the QR code image</li>
        <li>Use the downloaded QR code in your marketing materials, business cards, or websites</li>
      </ol>
    </div>
  );

  return (
    <ToolLayout
      config={config}
      inputSlot={inputSlot}
      actionSlot={actionSlot}
      resultSlot={resultSlot}
      seoArticle={seoArticle}
    />
  );
}
