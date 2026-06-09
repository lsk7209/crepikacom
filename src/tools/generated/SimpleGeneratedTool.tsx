import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, RotateCcw, Wand2 } from "lucide-react";
import { trackToolUse } from "@/utils/analytics";

type FieldType = "text" | "textarea" | "number";

interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  defaultValue?: string;
}

interface ResultMetric {
  label: string;
  value: string;
  tone?: "primary" | "accent" | "muted";
}

interface ToolResult {
  summary: string;
  metrics?: ResultMetric[];
  output?: string;
  tips: string[];
}

interface SimpleToolDef {
  id: string;
  buttonLabel: string;
  fields: FieldDef[];
  run: (values: Record<string, string>) => ToolResult;
}

interface SimpleGeneratedToolProps {
  toolId: string;
  onResult: (result: ReactNode | null) => void;
  onError: (error: string | null) => void;
}

const toolDefs: Record<string, SimpleToolDef> = {
  "seo-title-length-checker": {
    id: "seo-title-length-checker",
    buttonLabel: "SEO 제목 검사하기",
    fields: [
      {
        key: "title",
        label: "검사할 제목",
        type: "textarea",
        placeholder: "예: 인스타그램 릴스 조회수 늘리는 법: 초보자를 위한 실전 가이드",
      },
      {
        key: "keyword",
        label: "핵심 키워드",
        type: "text",
        placeholder: "예: 인스타그램 릴스",
      },
    ],
    run: ({ title, keyword }) => {
      const cleanTitle = title.trim();
      const length = cleanTitle.length;
      const keywordIndex = keyword ? cleanTitle.indexOf(keyword.trim()) : -1;
      const frontLoaded = keywordIndex >= 0 && keywordIndex <= 15;
      const score =
        (length >= 25 && length <= 60 ? 40 : length <= 70 ? 25 : 10) +
        (frontLoaded ? 35 : keywordIndex >= 0 ? 20 : 0) +
        (/[:|｜-]/.test(cleanTitle) ? 15 : 8) +
        (/[?0-9]/.test(cleanTitle) ? 10 : 6);

      return {
        summary:
          score >= 80
            ? "검색 결과에서 읽히기 좋은 제목입니다."
            : score >= 60
              ? "사용 가능하지만 길이 또는 키워드 위치를 조금 다듬으면 좋습니다."
              : "검색 노출용 제목으로는 핵심 키워드와 길이 조정이 필요합니다.",
        metrics: [
          { label: "점수", value: `${Math.min(score, 100)}점`, tone: "primary" },
          { label: "글자 수", value: `${length}자`, tone: "accent" },
          {
            label: "키워드 위치",
            value: keywordIndex >= 0 ? `${keywordIndex + 1}번째 글자` : "없음",
          },
        ],
        tips: [
          "핵심 키워드는 가능하면 제목 앞 15자 안에 배치하세요.",
          "Google 기준 50~60자, 네이버 기준 25~35자 안에서 핵심 의미가 보이게 만드세요.",
          "콜론, 숫자, 대상 독자를 함께 쓰면 클릭 전 정보 이해가 빨라집니다.",
        ],
      };
    },
  },
  "meta-description-checker": {
    id: "meta-description-checker",
    buttonLabel: "메타 설명 검사하기",
    fields: [
      {
        key: "description",
        label: "메타 설명",
        type: "textarea",
        placeholder: "검색 결과에 노출될 설명문을 입력하세요.",
      },
      { key: "keyword", label: "핵심 키워드", type: "text", placeholder: "예: SEO 제목" },
    ],
    run: ({ description, keyword }) => {
      const text = description.trim().replace(/\s+/g, " ");
      const length = text.length;
      const keywordIndex = keyword ? text.indexOf(keyword.trim()) : -1;
      const hasAction = /(확인|비교|계산|생성|검사|다운로드|활용|시작)/.test(text);
      const score =
        (length >= 70 && length <= 155 ? 45 : length <= 170 ? 30 : 12) +
        (keywordIndex >= 0 && keywordIndex <= 35 ? 30 : keywordIndex >= 0 ? 15 : 0) +
        (hasAction ? 20 : 8) +
        (text.endsWith(".") || text.endsWith("다.") ? 5 : 0);

      return {
        summary:
          score >= 80
            ? "검색 스니펫으로 쓰기 좋은 설명입니다."
            : score >= 60
              ? "핵심은 전달되지만 CTA나 길이를 조금 더 다듬을 수 있습니다."
              : "설명이 너무 짧거나 길고, 키워드 또는 행동 유도 문구가 약합니다.",
        metrics: [
          { label: "점수", value: `${Math.min(score, 100)}점`, tone: "primary" },
          { label: "글자 수", value: `${length}자`, tone: "accent" },
          { label: "CTA", value: hasAction ? "있음" : "약함" },
        ],
        tips: [
          "첫 문장 앞쪽에 핵심 키워드를 자연스럽게 넣으세요.",
          "무엇을 얻을 수 있는지와 어떤 행동을 하면 되는지 함께 보여주세요.",
          "동일한 설명을 여러 페이지에 반복하면 중복 스니펫 위험이 커집니다.",
        ],
      };
    },
  },
  "slug-generator": {
    id: "slug-generator",
    buttonLabel: "슬러그 생성하기",
    fields: [
      { key: "title", label: "제목", type: "textarea", placeholder: "URL로 바꿀 제목을 입력하세요." },
    ],
    run: ({ title }) => {
      const romanized = title
        .trim()
        .normalize("NFKD")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/_+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase();
      const fallback = romanized || `post-${new Date().toISOString().slice(0, 10)}`;
      return {
        summary: "사람이 읽기 쉬운 URL 슬러그를 생성했습니다.",
        output: fallback,
        metrics: [
          { label: "길이", value: `${fallback.length}자`, tone: "accent" },
          { label: "형식", value: "lowercase-kebab" },
        ],
        tips: [
          "슬러그는 짧고 의미가 분명해야 클릭 전 페이지 내용을 예측할 수 있습니다.",
          "날짜나 불필요한 조사보다 핵심 명사를 남기는 편이 좋습니다.",
          "이미 공개된 URL은 검색 색인과 외부 링크가 있으므로 변경 전 리다이렉트를 준비하세요.",
        ],
      };
    },
  },
  "utm-url-builder": {
    id: "utm-url-builder",
    buttonLabel: "UTM URL 만들기",
    fields: [
      { key: "url", label: "랜딩 URL", type: "text", placeholder: "https://crepika.com/tools/text-counter" },
      { key: "source", label: "utm_source", type: "text", placeholder: "instagram" },
      { key: "medium", label: "utm_medium", type: "text", placeholder: "social" },
      { key: "campaign", label: "utm_campaign", type: "text", placeholder: "creator_tools_launch" },
      { key: "content", label: "utm_content", type: "text", placeholder: "profile_link" },
    ],
    run: ({ url, source, medium, campaign, content }) => {
      const target = new URL(url.trim());
      const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, "_");
      target.searchParams.set("utm_source", normalize(source));
      target.searchParams.set("utm_medium", normalize(medium));
      target.searchParams.set("utm_campaign", normalize(campaign));
      if (content.trim()) target.searchParams.set("utm_content", normalize(content));
      return {
        summary: "GA4에서 일관되게 읽히는 UTM URL을 만들었습니다.",
        output: target.toString(),
        tips: [
          "source, medium, campaign 값은 항상 소문자와 언더스코어로 통일하세요.",
          "같은 캠페인이라면 팀 전체가 동일한 네이밍 규칙을 써야 데이터가 쪼개지지 않습니다.",
          "프로필 링크, 스토리 링크, 고정댓글처럼 위치가 다르면 utm_content로 구분하세요.",
        ],
      };
    },
  },
  "ctr-calculator": {
    id: "ctr-calculator",
    buttonLabel: "CTR 계산하기",
    fields: [
      { key: "impressions", label: "노출수", type: "number", placeholder: "10000" },
      { key: "clicks", label: "클릭수", type: "number", placeholder: "350" },
    ],
    run: ({ impressions, clicks }) => {
      const imp = Number(impressions);
      const clk = Number(clicks);
      const ctr = imp > 0 ? (clk / imp) * 100 : 0;
      return {
        summary: "노출 대비 클릭률을 계산했습니다.",
        metrics: [
          { label: "CTR", value: `${ctr.toFixed(2)}%`, tone: "primary" },
          { label: "노출수", value: imp.toLocaleString(), tone: "muted" },
          { label: "클릭수", value: clk.toLocaleString(), tone: "accent" },
        ],
        tips: [
          "CTR이 낮다면 제목, 썸네일, 메타 설명의 약속이 명확한지 먼저 확인하세요.",
          "노출수가 충분히 쌓이기 전에는 작은 클릭 차이로 CTR이 크게 흔들릴 수 있습니다.",
          "검색 CTR은 순위, 브랜드 인지도, 검색 의도 일치도에 함께 영향을 받습니다.",
        ],
      };
    },
  },
  "adsense-rpm-calculator": {
    id: "adsense-rpm-calculator",
    buttonLabel: "RPM 계산하기",
    fields: [
      { key: "earnings", label: "예상 수익", type: "number", placeholder: "12.5" },
      { key: "pageviews", label: "페이지뷰", type: "number", placeholder: "5000" },
    ],
    run: ({ earnings, pageviews }) => {
      const revenue = Number(earnings);
      const views = Number(pageviews);
      const rpm = views > 0 ? (revenue / views) * 1000 : 0;
      return {
        summary: "페이지뷰 1,000회당 예상 수익을 계산했습니다.",
        metrics: [
          { label: "Page RPM", value: `${rpm.toFixed(2)}`, tone: "primary" },
          { label: "수익", value: revenue.toLocaleString(), tone: "accent" },
          { label: "페이지뷰", value: views.toLocaleString(), tone: "muted" },
        ],
        tips: [
          "RPM은 광고 단가뿐 아니라 국가, 주제, 체류시간, 광고 표시 가능성에 영향을 받습니다.",
          "자동광고 사용 시에는 광고 슬롯을 직접 늘리기보다 페이지 경험과 콘텐츠 품질을 먼저 개선하세요.",
          "하루 단위보다 7일 또는 28일 평균으로 봐야 계절성과 일시 변동을 줄일 수 있습니다.",
        ],
      };
    },
  },
};

const missingToolDef: SimpleToolDef = {
  id: "missing-tool",
  buttonLabel: "실행",
  fields: [],
  run: () => ({
    summary: "아직 구현되지 않은 도구입니다.",
    tips: ["도구 설정은 있지만 실행 로직이 연결되지 않았습니다."],
  }),
};

function ResultView({ result }: { result: ToolResult }) {
  const [copied, setCopied] = useState(false);
  const copyText = result.output ?? result.metrics?.map((m) => `${m.label}: ${m.value}`).join("\n") ?? result.summary;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(copyText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/[0.04] p-4">
        <p className="font-semibold text-cyan-100">{result.summary}</p>
      </div>
      {result.metrics && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {result.metrics.map((metric) => (
            <div key={metric.label} className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className={`mt-1 text-2xl font-bold ${metric.tone === "accent" ? "text-amber-300" : metric.tone === "muted" ? "text-foreground" : "text-cyan-300"}`}>
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      )}
      {result.output && (
        <div className="rounded-lg border bg-background p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <Badge variant="secondary">결과</Badge>
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
              <Copy className="h-4 w-4" />
              {copied ? "복사됨" : "복사"}
            </Button>
          </div>
          <pre className="whitespace-pre-wrap break-all text-sm leading-6 text-foreground">{result.output}</pre>
        </div>
      )}
      <div className="rounded-lg border border-amber-400/20 bg-amber-400/[0.04] p-4">
        <p className="mb-3 font-semibold text-amber-100">실전 팁</p>
        <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
          {result.tips.map((tip) => (
            <li key={tip}>- {tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function SimpleGeneratedTool({ toolId, onResult, onError }: SimpleGeneratedToolProps) {
  const def = toolDefs[toolId] ?? missingToolDef;

  const initialValues = useMemo(
    () => Object.fromEntries(def.fields.map((field) => [field.key, field.defaultValue ?? ""])),
    [def],
  );
  const [values, setValues] = useState<Record<string, string>>(initialValues);

  const updateValue = (key: string, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    onError(null);
  };

  const reset = () => {
    setValues(initialValues);
    onResult(null);
    onError(null);
  };

  const run = () => {
    try {
      const hasInput = def.fields.some((field) => values[field.key]?.trim());
      if (!hasInput) {
        onError("값을 입력한 뒤 다시 실행해 주세요.");
        onResult(null);
        return;
      }
      trackToolUse(def.id);
      onResult(<ResultView result={def.run(values)} />);
    } catch (error) {
      onError(error instanceof Error ? error.message : "입력값을 처리하지 못했습니다.");
      onResult(null);
    }
  };

  return {
    inputSlot: (
      <div className="space-y-4">
        {def === missingToolDef && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            아직 구현되지 않은 도구입니다.
          </div>
        )}
        {def.fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={`${toolId}-${field.key}`}>{field.label}</Label>
            {field.type === "textarea" ? (
              <Textarea
                id={`${toolId}-${field.key}`}
                value={values[field.key] ?? ""}
                onChange={(event) => updateValue(field.key, event.target.value)}
                placeholder={field.placeholder}
                className="min-h-[120px]"
              />
            ) : (
              <Input
                id={`${toolId}-${field.key}`}
                type={field.type}
                value={values[field.key] ?? ""}
                onChange={(event) => updateValue(field.key, event.target.value)}
                placeholder={field.placeholder}
              />
            )}
          </div>
        ))}
      </div>
    ),
    actionSlot: (
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Button onClick={run} size="lg" className="gap-2">
          <Wand2 className="h-4 w-4" />
          {def.buttonLabel}
        </Button>
        <Button onClick={reset} variant="outline" size="lg" aria-label="초기화">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    ),
  };
}
