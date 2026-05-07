import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator } from 'lucide-react';
import { trackToolUse } from "@/utils/analytics";

interface ByteCounterToolProps {
  onResult: (result: React.ReactNode) => void;
  onError: (error: string) => void;
}

export function ByteCounterTool({ onResult, onError }: ByteCounterToolProps) {
  const [text, setText] = useState('');

  const calculateBytes = (str: string): number => {
    // UTF-8 byte calculation
    // Korean characters: 3 bytes
    // English/numbers: 1 byte
    return new Blob([str]).size;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    
    if (value) {
      calculateAndDisplay(value);
    } else {
      onResult(null);
    }
  };

  const handleCount = () => {
    if (!text.trim()) {
      onError('텍스트를 입력하세요.');
      return;
    }
    trackToolUse('byte-counter');
    calculateAndDisplay(text);
  };

  const calculateAndDisplay = (input: string) => {
    const totalChars = input.length;
    const charsWithoutSpaces = input.replace(/\s/g, '').length;
    const lineCount = input.split('\n').length;
    const byteCount = calculateBytes(input);
    const koreanCount = (input.match(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g) || []).length;
    const englishCount = (input.match(/[a-zA-Z]/g) || []).length;

    const result = (
      <div className="space-y-3">
        {totalChars > 10000 && (
          <Alert>
            <AlertDescription>
              긴 텍스트는 브라우저가 느려질 수 있습니다.
            </AlertDescription>
          </Alert>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">총 글자 수</div>
            <div className="text-2xl font-bold text-primary">{totalChars}</div>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">공백 제외</div>
            <div className="text-2xl font-bold text-primary">{charsWithoutSpaces}</div>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">줄 수</div>
            <div className="text-2xl font-bold text-primary">{lineCount}</div>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">UTF-8 바이트</div>
            <div className="text-2xl font-bold text-accent">{byteCount}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">한글</div>
            <div className="text-lg font-semibold">{koreanCount}자</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">영문</div>
            <div className="text-lg font-semibold">{englishCount}자</div>
          </div>
        </div>
        <Alert>
          <AlertDescription className="text-xs">
            UTF-8 인코딩 기준: 한글 1자 = 3바이트, 영문/숫자 = 1바이트. 네이버 메타설명·카카오 등 서버 측 바이트 제한 확인에 적합합니다.
          </AlertDescription>
        </Alert>
      </div>
    );

    onResult(result);
  };

  return {
    inputSlot: (
      <div className="space-y-2">
        <label htmlFor="byte-text" className="text-sm font-medium">
          텍스트 입력
        </label>
        <Textarea
          id="byte-text"
          value={text}
          onChange={handleTextChange}
          placeholder="바이트 수를 계산할 텍스트를 입력하세요..."
          rows={8}
          className="resize-none"
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
        <Calculator className="mr-2 h-5 w-5" />
        바이트 수 계산
      </Button>
    ),
  };
}
