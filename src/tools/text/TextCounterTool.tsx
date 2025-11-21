import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface TextCounterToolProps {
  onResult: (result: React.ReactNode) => void;
  onError: (error: string | null) => void;
}

export function TextCounterTool({ onResult, onError }: TextCounterToolProps) {
  const [text, setText] = useState("");

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    onError(null);

    // Real-time calculation
    if (newText.trim()) {
      calculateAndDisplay(newText);
    } else {
      onResult(null);
    }
  };

  const handleCount = () => {
    if (!text.trim()) {
      onError("텍스트를 입력하세요.");
      onResult(null);
      return;
    }

    calculateAndDisplay(text);
  };

  const calculateAndDisplay = (inputText: string) => {
    const withSpaces = inputText.length;
    const withoutSpaces = inputText.replace(/\s/g, '').length;
    const lineCount = inputText.split('\n').length;
    const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
    
    // Korean byte calculation (Naver standard: Korean char = 2 bytes)
    const byteCount = [...inputText].reduce((acc, char) => {
      const code = char.charCodeAt(0);
      // Korean characters range
      if ((code >= 0xAC00 && code <= 0xD7A3) || (code >= 0x1100 && code <= 0x11FF)) {
        return acc + 2;
      }
      return acc + 1;
    }, 0);

    onResult(
      <div className="space-y-4">
        {withSpaces > 10000 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              긴 텍스트는 브라우저가 느려질 수 있습니다.
            </AlertDescription>
          </Alert>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">With Spaces</p>
            <p className="text-3xl font-bold text-primary">{withSpaces}</p>
          </div>
          <div className="bg-secondary rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Without Spaces</p>
            <p className="text-3xl font-bold text-primary">{withoutSpaces}</p>
          </div>
          <div className="bg-secondary rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Words</p>
            <p className="text-3xl font-bold text-accent">{wordCount}</p>
          </div>
          <div className="bg-secondary rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Lines</p>
            <p className="text-3xl font-bold text-accent">{lineCount}</p>
          </div>
          <div className="col-span-2 bg-secondary rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Bytes (Korean Standard)</p>
            <p className="text-3xl font-bold text-accent">{byteCount}</p>
          </div>
        </div>
      </div>
    );
  };

  return {
    inputSlot: (
      <div className="space-y-2">
        <Label htmlFor="text-input">Enter your text</Label>
        <Textarea
          id="text-input"
          placeholder="Type or paste your text here..."
          value={text}
          onChange={handleTextChange}
          className="min-h-[180px] resize-none"
          aria-label="Text input for counting"
        />
      </div>
    ),
    actionSlot: (
      <Button 
        onClick={handleCount}
        disabled={!text.trim()}
        className="w-full"
        size="lg"
      >
        Count
      </Button>
    ),
  };
}
