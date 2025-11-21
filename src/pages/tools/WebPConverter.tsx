import { useState } from "react";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { getToolById } from "@/data/tools-config";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function WebPConverter() {
  const config = getToolById('webp-converter')!;
  const [file, setFile] = useState<File | null>(null);
  const [webpDataUrl, setWebpDataUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [convertedSize, setConvertedSize] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(selectedFile.type)) {
      toast.error("Please select a JPG or PNG image");
      return;
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    setWebpDataUrl(null);
    setConvertedSize(0);
  };

  const handleConvert = async () => {
    if (!file) {
      toast.error("Please select an image file");
      return;
    }

    setIsProcessing(true);

    // Simulate processing time for ad display
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            toast.error("Failed to create canvas context");
            setIsProcessing(false);
            return;
          }

          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                toast.error("Conversion failed");
                setIsProcessing(false);
                return;
              }

              const dataUrl = URL.createObjectURL(blob);
              setWebpDataUrl(dataUrl);
              setConvertedSize(blob.size);
              setIsProcessing(false);
              toast.success("Converted to WebP!");
            },
            'image/webp',
            0.8 // 80% quality
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Conversion failed");
      console.error(error);
      setIsProcessing(false);
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
    toast.success("WebP image downloaded!");
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024).toFixed(2) + ' KB';
  };

  const compressionRate = originalSize && convertedSize 
    ? ((1 - convertedSize / originalSize) * 100).toFixed(1)
    : 0;

  const inputSlot = (
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
  );

  const actionSlot = (
    <Button 
      onClick={handleConvert}
      disabled={!file || isProcessing}
      className="w-full"
      size="lg"
    >
      {isProcessing ? "Converting..." : "Convert to WebP"}
    </Button>
  );

  const resultSlot = webpDataUrl ? (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-secondary rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Original</p>
          <p className="text-sm font-semibold">{formatFileSize(originalSize)}</p>
        </div>
        <div className="bg-secondary rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Converted</p>
          <p className="text-sm font-semibold text-success">{formatFileSize(convertedSize)}</p>
        </div>
        <div className="bg-secondary rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Saved</p>
          <p className="text-sm font-semibold text-accent">{compressionRate}%</p>
        </div>
      </div>

      <div className="flex justify-center">
        <img 
          src={webpDataUrl} 
          alt="Converted WebP preview" 
          className="max-w-full h-auto rounded-lg border"
          style={{ maxHeight: '300px' }}
        />
      </div>

      <Button
        onClick={handleDownload}
        className="w-full"
        size="lg"
        variant="default"
      >
        <Download className="mr-2 h-4 w-4" />
        Download WebP
      </Button>
    </div>
  ) : null;

  const seoArticle = (
    <div className="bg-card rounded-lg border p-6">
      <h2 className="text-2xl font-bold mb-4">Why use this tool?</h2>
      <p className="text-muted-foreground mb-6">
        WebP is a modern image format that provides superior compression for images on the web. 
        Converting to WebP can reduce file sizes by 25-35% compared to JPEG and PNG, leading to 
        faster page loads and better user experience. This tool converts your images with 80% 
        quality, maintaining visual fidelity while significantly reducing file size.
      </p>

      <h2 className="text-2xl font-bold mb-4">How to use</h2>
      <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
        <li>Click the upload area or drag & drop your JPG/PNG image</li>
        <li>Ensure file size is under 10MB</li>
        <li>Click "Convert to WebP" button</li>
        <li>Wait 2-3 seconds for processing</li>
        <li>Preview the converted image and size savings</li>
        <li>Click "Download WebP" to save the optimized image</li>
        <li>Use the WebP image on your website for faster loading</li>
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
      isProcessing={isProcessing}
    />
  );
}
