import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Download, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import QRCode from "qrcode";

const MAX_URL_LENGTH = 2048;

interface QrGeneratorToolProps {
  onResult: (result: React.ReactNode) => void;
  onError: (error: string | null) => void;
}

export function QrGeneratorTool({ onResult, onError }: QrGeneratorToolProps) {
  const [url, setUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [showLongUrlWarning, setShowLongUrlWarning] = useState(false);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    onError(null);
    setShowLongUrlWarning(newUrl.length > MAX_URL_LENGTH);
  };

  const normalizeUrl = (inputUrl: string): string => {
    const trimmed = inputUrl.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  const handleGenerate = async () => {
    if (!url.trim()) {
      onError("URL을 입력하세요.");
      toast({
        variant: 'destructive',
        title: '오류',
        description: 'URL을 입력하세요.',
      });
      return;
    }

    if (url.length > MAX_URL_LENGTH) {
      toast({
        title: '경고',
        description: 'URL이 너무 깁니다. 단축 URL 사용을 권장합니다.',
      });
    }

    const normalizedUrl = normalizeUrl(url);

    try {
      const dataUrl = await QRCode.toDataURL(normalizedUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrDataUrl(dataUrl);
      onError(null);
      
      onResult(
        <div className="space-y-4">
          {showLongUrlWarning && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                URL이 너무 깁니다. 단축 URL 사용을 권장합니다.
              </AlertDescription>
            </Alert>
          )}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg border-2 border-border inline-block">
              <img 
                src={dataUrl} 
                alt="Generated QR Code" 
                className="w-64 h-64"
              />
            </div>
          </div>
          <Button
            onClick={handleDownload}
            className="w-full"
            size="lg"
          >
            <Download className="mr-2 h-4 w-4" />
            Download PNG
          </Button>
        </div>
      );
      
      toast({
        title: 'QR 코드 생성 완료',
        description: 'QR 코드를 다운로드할 수 있습니다.',
      });
    } catch (error) {
      onError("QR 코드 생성에 실패했습니다.");
      toast({
        variant: 'destructive',
        title: '오류',
        description: 'QR 코드를 생성하지 못했습니다. URL을 확인해 주세요.',
      });
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
    toast({
      title: '다운로드 완료',
      description: 'QR 코드가 다운로드되었습니다.',
    });
  };

  return {
    inputSlot: (
      <div className="space-y-2">
        <Label htmlFor="url-input">Enter URL</Label>
        <Input
          id="url-input"
          type="url"
          placeholder="example.com or https://example.com"
          value={url}
          onChange={handleUrlChange}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          aria-label="URL input for QR code generation"
        />
        {showLongUrlWarning && (
          <p className="text-xs text-warning">URL이 {url.length}자입니다. 2048자 이하를 권장합니다.</p>
        )}
      </div>
    ),
    actionSlot: (
      <Button 
        onClick={handleGenerate}
        disabled={!url.trim()}
        className="w-full"
        size="lg"
      >
        Generate QR Code
      </Button>
    ),
  };
}
