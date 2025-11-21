import { useState } from "react";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { getToolById } from "@/data/tools-config";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function TextCounter() {
  const config = getToolById('text-counter')!;
  const [text, setText] = useState("");

  // Calculate metrics
  const withSpaces = text.length;
  const withoutSpaces = text.replace(/\s/g, '').length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  
  // Korean byte calculation (Naver standard: Korean char = 2 bytes)
  const byteCount = [...text].reduce((acc, char) => {
    const code = char.charCodeAt(0);
    // Korean characters range
    if ((code >= 0xAC00 && code <= 0xD7A3) || (code >= 0x1100 && code <= 0x11FF)) {
      return acc + 2;
    }
    return acc + 1;
  }, 0);

  const inputSlot = (
    <div className="space-y-2">
      <Label htmlFor="text-input">Enter your text</Label>
      <Textarea
        id="text-input"
        placeholder="Type or paste your text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-[200px] resize-none"
        aria-label="Text input for counting"
      />
    </div>
  );

  const actionSlot = null; // Instant calculation, no action needed

  const resultSlot = text ? (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-secondary rounded-lg p-4 text-center">
        <p className="text-sm text-secondary-foreground/70 mb-1">With Spaces</p>
        <p className="text-3xl font-bold text-primary">{withSpaces}</p>
      </div>
      <div className="bg-secondary rounded-lg p-4 text-center">
        <p className="text-sm text-secondary-foreground/70 mb-1">Without Spaces</p>
        <p className="text-3xl font-bold text-primary">{withoutSpaces}</p>
      </div>
      <div className="bg-secondary rounded-lg p-4 text-center">
        <p className="text-sm text-secondary-foreground/70 mb-1">Words</p>
        <p className="text-3xl font-bold text-accent">{wordCount}</p>
      </div>
      <div className="bg-secondary rounded-lg p-4 text-center">
        <p className="text-sm text-secondary-foreground/70 mb-1">Bytes (KR)</p>
        <p className="text-3xl font-bold text-accent">{byteCount}</p>
      </div>
    </div>
  ) : null;

  const seoArticle = (
    <div className="bg-card rounded-lg border p-6">
      <h2 className="text-2xl font-bold mb-4">Why use this tool?</h2>
      <p className="text-muted-foreground mb-6">
        Accurate character counting is essential for social media posts, SEO meta descriptions, 
        and content creation. Our tool provides real-time counting with Korean-optimized byte 
        calculation following Naver standards, where each Korean character counts as 2 bytes.
      </p>

      <h2 className="text-2xl font-bold mb-4">How to use</h2>
      <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
        <li>Type or paste your text into the input area</li>
        <li>View real-time character counts instantly</li>
        <li>Check "With Spaces" for total characters including spaces</li>
        <li>Check "Without Spaces" for character count excluding spaces</li>
        <li>View word count and Korean-optimized byte count</li>
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
