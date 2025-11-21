import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Upload, Download, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DIMENSION = 4000;

interface WebpConverterToolProps {
  onResult: (result: React.ReactNode) => void;
  onError: (error: string | null) => void;
  onProcessing: (isProcessing: boolean) => void;
}

export function WebpConverterTool({ onResult, onError, onProcessing }: WebpConverterToolProps) {
  const [file, setFile] = useState<File | null>(null);
  const [webpDataUrl, setWebpDataUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [convertedSize, setConvertedSize] = useState<number>(0);
  const [showHighResWarning, setShowHighResWarning] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(selectedFile.type)) {
      onError("JPG 또는 PNG 이미지를 선택하세요.");
      toast({
        variant: 'destructive',
        title: '오류',
        description: 'JPG 또는 PNG 이미지를 선택하세요.',
      });
      return;
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      onError("10MB 이하 이미지만 지원합니다.");
      toast({
        variant: 'destructive',
        title: '오류',
        description: '10MB 이하 이미지만 지원합니다.',
      });
      return;
    }

    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    setWebpDataUrl(null);
    setConvertedSize(0);
    setShowHighResWarning(false);
    onError(null);
    onResult(null);
  };

  const handleConvert = async () => {
    if (!file) {
      onError("이미지를 선택하세요.");
      toast({
        variant: 'destructive',
        title: '오류',
        description: '이미지를 선택하세요.',
      });
      return;
    }

    onProcessing(true);
    onError(null);

    // Simulate processing time for ad display
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Check resolution
          if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
            setShowHighResWarning(true);
            toast({
              title: '경고',
              description: '고해상도 이미지는 브라우저가 느려질 수 있습니다.',
            });
          }

          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            onError("이미지를 변환하지 못했습니다. 다시 시도해 주세요.");
            toast({
              variant: 'destructive',
              title: '오류',
              description: '이미지를 변환하지 못했습니다.',
            });
            onProcessing(false);
            return;
          }

          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                onError("이미지를 변환하지 못했습니다. 다시 시도해 주세요.");
                toast({
                  variant: 'destructive',
                  title: '오류',
                  description: '이미지를 변환하지 못했습니다.',
                });
                onProcessing(false);
                return;
              }

              const dataUrl = URL.createObjectURL(blob);
              setWebpDataUrl(dataUrl);
              setConvertedSize(blob.size);
              onProcessing(false);
              
              const compressionRate = originalSize && blob.size 
                ? ((1 - blob.size / originalSize) * 100).toFixed(1)
                : '0';

              onResult(
                <div className="space-y-4">
                  {showHighResWarning && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        고해상도 이미지는 브라우저가 느려질 수 있습니다.
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-secondary rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Original</p>
                      <p className="text-sm font-semibold">{(originalSize / 1024).toFixed(2)} KB</p>
                    </div>
                    <div className="bg-secondary rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Converted</p>
                      <p className="text-sm font-semibold text-success">{(blob.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <div className="bg-secondary rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Saved</p>
                      <p className="text-sm font-semibold text-accent">{compressionRate}%</p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <img 
                      src={dataUrl} 
                      alt="Converted WebP preview" 
                      className="max-w-full h-auto rounded-lg border"
                      style={{ maxHeight: '300px' }}
                    />
                  </div>

                  <Button
                    onClick={handleDownload}
                    className="w-full"
                    size="lg"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download WebP
                  </Button>
                </div>
              );
              
              toast({
                title: '변환 완료',
                description: '이미지를 WebP 형식으로 변환했습니다.',
              });
            },
            'image/webp',
            0.8 // 80% quality
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      onError("이미지를 변환하지 못했습니다. 다시 시도해 주세요.");
      toast({
        variant: 'destructive',
        title: '오류',
        description: '변환에 실패했습니다.',
      });
      console.error(error);
      onProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!webpDataUrl) return;

    const link = document.createElement('a');
    link.href = webpDataUrl;
    link.download = `converted-${Date.now()}.webp`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: '다운로드 완료',
      description: 'WebP 이미지가 다운로드되었습니다.',
    });
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024).toFixed(2) + ' KB';
  };

  return {
    inputSlot: (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file-input">Select Image (JPG/PNG)</Label>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="file-input"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="mb-1 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span>
                </p>
                <p className="text-xs text-muted-foreground">JPG or PNG (MAX. 10MB)</p>
              </div>
              <input
                id="file-input"
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileChange}
                aria-label="Image file input"
              />
            </label>
          </div>
        </div>
        
        {file && (
          <Alert>
            <AlertDescription>
              Selected: {file.name} ({formatFileSize(file.size)})
            </AlertDescription>
          </Alert>
        )}
      </div>
    ),
    actionSlot: (
      <Button 
        onClick={handleConvert}
        disabled={!file}
        className="w-full"
        size="lg"
      >
        Convert to WebP
      </Button>
    ),
  };
}
