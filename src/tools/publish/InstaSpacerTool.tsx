import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface InstaSpacerToolProps {
  onResult: (result: React.ReactNode) => void;
  onError: (error: string | null) => void;
}

export function InstaSpacerTool({ onResult, onError }: InstaSpacerToolProps) {
  const [text, setText] = useState("");
  const [formattedText, setFormattedText] = useState("");
  const [copied, setCopied] = useState(false);

  const handleFormat = () => {
    if (!text.trim()) {
      onError("텍스트를 입력하세요.");
      toast({
        variant: 'destructive',
        title: '오류',
        description: '텍스트를 입력하세요.',
      });
      return;
    }

    // Format text for Instagram
    // Replace multiple spaces/tabs with single space
    let formatted = text.replace(/[ \t]+/g, ' ');
    
    // Add invisible Braille character (U+2800) at the end of each line to preserve line breaks
    const lines = formatted.split('\n');
    formatted = lines.map(line => {
      const trimmed = line.trim();
      return trimmed ? trimmed + '\u2800' : '\u2800';
    }).join('\n');

    setFormattedText(formatted);
    onError(null);

    onResult(
      <div className="space-y-4">
        <Alert>
          <AlertDescription>
            결과를 복사한 후, 실제 인스타 앱에 붙여 넣어 줄바꿈을 확인해 보세요.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="formatted-output">Formatted Text</Label>
          <Textarea
            id="formatted-output"
            value={formatted}
            readOnly
            className="min-h-[200px] resize-none font-mono text-sm"
            aria-label="Formatted text output"
          />
        </div>

        <Button
          onClick={handleCopy}
          className="w-full"
          size="lg"
          variant={copied ? "secondary" : "default"}
        >
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy to Clipboard
            </>
          )}
        </Button>
      </div>
    );
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedText);
      setCopied(true);
      toast({
        title: '복사 완료',
        description: '클립보드에 복사되었습니다.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: '복사 실패',
        description: '클립보드 복사에 실패했습니다.',
      });
      console.error(err);
    }
  };

  return {
    inputSlot: (
      <div className="space-y-2">
        <Label htmlFor="text-input">Enter your caption</Label>
        <Textarea
          id="text-input"
          placeholder="Type or paste your Instagram caption here..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onError(null);
          }}
          className="min-h-[180px] resize-none"
          aria-label="Text input for Instagram formatting"
        />
      </div>
    ),
    actionSlot: (
      <Button 
        onClick={handleFormat}
        disabled={!text.trim()}
        className="w-full"
        size="lg"
      >
        Format for Instagram
      </Button>
    ),
  };
}
