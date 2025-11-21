import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const MAX_HASHTAGS = 30;

interface HashtagMixerToolProps {
  onResult: (result: React.ReactNode) => void;
  onError: (error: string | null) => void;
}

export function HashtagMixerTool({ onResult, onError }: HashtagMixerToolProps) {
  const [input, setInput] = useState("");
  const [shuffledTags, setShuffledTags] = useState("");
  const [copied, setCopied] = useState(false);

  // Fisher-Yates shuffle algorithm
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleShuffle = () => {
    if (!input.trim()) {
      onError("해시태그를 입력하세요.");
      toast.error("해시태그를 입력하세요.");
      return;
    }

    // Extract hashtags from input
    // Split by various delimiters: space, comma, newline
    const rawTags = input.split(/[\s,\n]+/).filter(tag => tag.trim());
    
    // Normalize hashtags (add # if missing, remove duplicates)
    const normalizedTags = rawTags.map(tag => {
      const cleaned = tag.trim();
      return cleaned.startsWith('#') ? cleaned : `#${cleaned}`;
    });

    // Remove duplicates (case-insensitive)
    const uniqueTags = [...new Set(normalizedTags.map(tag => tag.toLowerCase()))];

    // Validate if any valid hashtags exist
    const validTags = uniqueTags.filter(tag => 
      /^#[a-zA-Z0-9가-힣_]+$/.test(tag)
    );

    if (validTags.length === 0) {
      onError("해시태그 형식(#tag)이 아닙니다. 다시 확인해 주세요.");
      toast.error("유효한 해시태그가 없습니다.");
      return;
    }

    // Limit to MAX_HASHTAGS
    const limitedTags = validTags.slice(0, MAX_HASHTAGS);
    const showWarning = validTags.length > MAX_HASHTAGS;

    // Shuffle
    const shuffled = shuffleArray(limitedTags);
    const result = shuffled.join(' ');
    
    setShuffledTags(result);
    onError(null);

    onResult(
      <div className="space-y-4">
        {showWarning && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              30개까지만 사용됩니다. ({validTags.length}개 입력됨)
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-secondary rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Total Tags</p>
          <p className="text-3xl font-bold text-primary">{limitedTags.length}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="shuffled-output">Shuffled Hashtags</Label>
          <Textarea
            id="shuffled-output"
            value={result}
            readOnly
            className="min-h-[120px] resize-none font-mono text-sm"
            aria-label="Shuffled hashtags output"
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
      await navigator.clipboard.writeText(shuffledTags);
      setCopied(true);
      toast.success("클립보드에 복사되었습니다!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("복사에 실패했습니다.");
      console.error(err);
    }
  };

  return {
    inputSlot: (
      <div className="space-y-2">
        <Label htmlFor="hashtag-input">Enter hashtags</Label>
        <Textarea
          id="hashtag-input"
          placeholder="#instagram #creative #design (separated by spaces, commas, or new lines)"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            onError(null);
          }}
          className="min-h-[150px] resize-none"
          aria-label="Hashtag input"
        />
        <p className="text-xs text-muted-foreground">
          Tip: Enter hashtags separated by spaces, commas, or new lines. Max 30 tags.
        </p>
      </div>
    ),
    actionSlot: (
      <Button 
        onClick={handleShuffle}
        disabled={!input.trim()}
        className="w-full"
        size="lg"
      >
        Shuffle Hashtags
      </Button>
    ),
  };
}
