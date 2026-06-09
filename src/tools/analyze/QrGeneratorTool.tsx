import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlertCircle, Download } from "lucide-react";
import QRCode from "qrcode";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { trackDownload, trackToolUse } from "@/utils/analytics";

const MAX_URL_LENGTH = 2048;

interface QrGeneratorToolProps {
  onResult: (result: ReactNode) => void;
  onError: (error: string | null) => void;
}

function normalizeUrl(inputUrl: string): string {
  const trimmed = inputUrl.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

function buildQrResult(dataUrl: string, isLongUrl: boolean) {
  return (
    <div className="space-y-4">
      {isLongUrl && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            URL이 너무 깁니다. 안정적인 스캔을 위해 짧은 URL 사용을 권장합니다.
          </AlertDescription>
        </Alert>
      )}
      <div className="flex justify-center">
        <div className="bg-white p-4 rounded-lg border-2 border-border inline-block">
          <img src={dataUrl} alt="생성된 QR 코드" className="w-64 h-64" />
        </div>
      </div>
      <Button
        onClick={() => {
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = `qr-code-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          trackDownload("qr-generator", "png");
          document.body.removeChild(link);
          toast({ title: "다운로드 완료", description: "QR 코드가 PNG 파일로 저장되었습니다." });
        }}
        className="w-full"
        size="lg"
      >
        <Download className="mr-2 h-4 w-4" />
        PNG 다운로드
      </Button>
    </div>
  );
}

export function QrGeneratorTool({ onResult, onError }: QrGeneratorToolProps) {
  const [url, setUrl] = useState("");
  const [showLongUrlWarning, setShowLongUrlWarning] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onResultRef.current = onResult;
    onErrorRef.current = onError;
  }, [onError, onResult]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    if (!url.trim() || url.length < 4) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const normalizedUrl = normalizeUrl(url);
      QRCode.toDataURL(normalizedUrl, {
        width: 400,
        margin: 2,
        color: { dark: "#000000", light: "#FFFFFF" },
      })
        .then((dataUrl) => {
          onErrorRef.current(null);
          onResultRef.current(buildQrResult(dataUrl, url.length > MAX_URL_LENGTH));
        })
        .catch(() => {
          onErrorRef.current("QR 코드 미리보기를 생성하지 못했습니다.");
        });
    }, 400);
  }, [url]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    onError(null);
    setShowLongUrlWarning(newUrl.length > MAX_URL_LENGTH);
  };

  const handleGenerate = async () => {
    if (!url.trim()) {
      onError("URL을 입력하세요.");
      toast({
        variant: "destructive",
        title: "오류",
        description: "URL을 입력하세요.",
      });
      return;
    }

    if (url.length > MAX_URL_LENGTH) {
      toast({
        title: "경고",
        description: "URL이 너무 깁니다. 안정적인 스캔을 위해 짧은 URL 사용을 권장합니다.",
      });
    }

    trackToolUse("qr-generator");
    const normalizedUrl = normalizeUrl(url);

    try {
      const dataUrl = await QRCode.toDataURL(normalizedUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      onError(null);
      onResult(buildQrResult(dataUrl, url.length > MAX_URL_LENGTH));

      toast({
        title: "QR 코드 생성 완료",
        description: "QR 코드를 다운로드할 수 있습니다.",
      });
    } catch (error) {
      onError("QR 코드 생성에 실패했습니다.");
      toast({
        variant: "destructive",
        title: "오류",
        description: "QR 코드를 생성하지 못했습니다. URL을 확인해 주세요.",
      });
      console.error(error);
    }
  };

  return {
    inputSlot: (
      <div className="space-y-2">
        <Label htmlFor="url-input">URL을 입력하세요</Label>
        <Input
          id="url-input"
          type="url"
          placeholder="example.com 또는 https://example.com"
          value={url}
          onChange={handleUrlChange}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          aria-label="QR 코드로 변환할 URL 입력"
        />
        {showLongUrlWarning && (
          <p className="text-xs text-warning">
            URL이 {url.length}자입니다. 안정적인 QR 스캔을 위해 2048자 이하를 권장합니다.
          </p>
        )}
      </div>
    ),
    actionSlot: (
      <Button onClick={handleGenerate} disabled={!url.trim()} className="w-full" size="lg">
        QR 코드 생성
      </Button>
    ),
  };
}
