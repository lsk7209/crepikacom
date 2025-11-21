import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface LoremGeneratorToolProps {
  onResult: (result: React.ReactNode) => void;
  onError: (error: string | null) => void;
}

// Pre-defined lorem text
const LOREM_EN = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
  "Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
  "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione.",
  "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.",
  "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti.",
  "Et harum quidem rerum facilis est et expedita distinctio nam libero tempore cum soluta nobis est eligendi optio cumque nihil impedit.",
];

const LOREM_KR = [
  "국민경제의 발전을 위한 중요정책의 수립에 관하여 대통령의 자문에 응하기 위하여 국민경제자문회의를 둘 수 있다.",
  "헌법재판소 재판관은 정당에 가입하거나 정치에 관여할 수 없다. 대통령은 내란 또는 외환의 죄를 범한 경우를 제외하고는 재직중 형사상의 소추를 받지 아니한다.",
  "모든 국민은 인간으로서의 존엄과 가치를 가지며, 행복을 추구할 권리를 가진다. 국가는 개인이 가지는 불가침의 기본적 인권을 확인하고 이를 보장할 의무를 진다.",
  "국회는 헌법 또는 법률에 특별한 규정이 없는 한 재적의원 과반수의 출석과 출석의원 과반수의 찬성으로 의결한다.",
  "대통령은 조국의 평화적 통일을 위한 성실한 의무를 진다. 모든 국민은 법률이 정하는 바에 의하여 국방의 의무를 진다.",
  "국가는 농지에 관하여 경자유전의 원칙이 달성될 수 있도록 노력하여야 하며, 농지의 소작제도는 금지된다.",
  "언론·출판은 타인의 명예나 권리 또는 공중도덕이나 사회윤리를 침해하여서는 아니된다. 언론·출판이 타인의 명예나 권리를 침해한 때에는 피해자는 이에 대한 피해의 배상을 청구할 수 있다.",
  "국회의원과 정부는 법률안을 제출할 수 있다. 정당의 목적이나 활동이 민주적 기본질서에 위배될 때에는 정부는 헌법재판소에 그 해산을 제소할 수 있다.",
  "모든 국민은 신체의 자유를 가진다. 누구든지 법률에 의하지 아니하고는 체포·구속·압수·수색 또는 심문을 받지 아니한다.",
  "국회의원은 법률이 정하는 직을 겸할 수 없다. 국회의원은 그 지위를 남용하여 국가·공공단체 또는 기업체와의 계약이나 그 처분에 의하여 재산상의 권리·이익 또는 직위를 취득할 수 없다.",
];

type Language = 'English' | 'Korean';
type Length = 'short' | 'medium' | 'long';

const LENGTH_MAP: Record<Length, number> = {
  short: 1,
  medium: 3,
  long: 5,
};

export function LoremGeneratorTool({ onResult, onError }: LoremGeneratorToolProps) {
  const [language, setLanguage] = useState<Language>('English');
  const [length, setLength] = useState<Length>('medium');
  const [generatedText, setGeneratedText] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const corpus = language === 'English' ? LOREM_EN : LOREM_KR;
    const paragraphCount = LENGTH_MAP[length];
    
    // Generate paragraphs
    const paragraphs: string[] = [];
    for (let i = 0; i < paragraphCount; i++) {
      // Select 3-5 sentences per paragraph
      const sentenceCount = 3 + Math.floor(Math.random() * 3);
      const sentences: string[] = [];
      
      for (let j = 0; j < sentenceCount; j++) {
        const randomIndex = Math.floor(Math.random() * corpus.length);
        sentences.push(corpus[randomIndex]);
      }
      
      paragraphs.push(sentences.join(' '));
    }
    
    const result = paragraphs.join('\n\n');
    setGeneratedText(result);
    onError(null);

    onResult(
      <div className="space-y-4">
        <div className="bg-secondary rounded-lg p-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Language:</span>
            <span className="font-semibold">{language}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-muted-foreground">Paragraphs:</span>
            <span className="font-semibold">{paragraphCount}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-muted-foreground">Characters:</span>
            <span className="font-semibold">{result.length}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="generated-output">Generated Text</Label>
          <Textarea
            id="generated-output"
            value={result}
            readOnly
            className="min-h-[250px] resize-none text-sm"
            aria-label="Generated lorem text"
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
      await navigator.clipboard.writeText(generatedText);
      setCopied(true);
      toast({
        title: '복사 완료',
        description: '텍스트가 클립보드에 복사되었습니다.',
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
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="language-select">Language</Label>
          <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
            <SelectTrigger id="language-select" aria-label="Select language">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Korean">Korean</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="length-select">Length</Label>
          <Select value={length} onValueChange={(value) => setLength(value as Length)}>
            <SelectTrigger id="length-select" aria-label="Select length">
              <SelectValue placeholder="Select length" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">짧게 (1 paragraph)</SelectItem>
              <SelectItem value="medium">보통 (3 paragraphs)</SelectItem>
              <SelectItem value="long">길게 (5 paragraphs)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    ),
    actionSlot: (
      <Button 
        onClick={handleGenerate}
        className="w-full"
        size="lg"
      >
        Generate
      </Button>
    ),
  };
}
