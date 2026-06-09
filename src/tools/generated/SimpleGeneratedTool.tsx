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
  "faq-schema-builder": {
    id: "faq-schema-builder",
    buttonLabel: "FAQ 스키마 만들기",
    fields: [
      {
        key: "faq",
        label: "질문과 답변",
        type: "textarea",
        placeholder:
          "질문: SEO 제목은 몇 자가 적당한가요?\n답변: 보통 50~60자 안에서 핵심 의미가 보이게 작성합니다.\n\n질문: 메타 설명은 꼭 필요한가요?\n답변: 중요한 페이지에는 고유한 설명을 넣는 것이 좋습니다.",
      },
    ],
    run: ({ faq }) => {
      const blocks = faq
        .split(/\n\s*\n/)
        .map((block) => block.trim())
        .filter(Boolean);
      const items = blocks
        .map((block) => {
          const question = block.match(/(?:질문|Q)[:：]\s*(.+)/i)?.[1]?.trim();
          const answer = block.match(/(?:답변|A)[:：]\s*([\s\S]+)/i)?.[1]?.trim();
          return question && answer ? { question, answer } : null;
        })
        .filter(Boolean) as { question: string; answer: string }[];

      if (!items.length) {
        throw new Error("질문:/답변: 형식으로 최소 1개 FAQ를 입력해 주세요.");
      }

      const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      };

      return {
        summary: `${items.length}개 FAQ를 JSON-LD 스키마 초안으로 변환했습니다.`,
        output: `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`,
        metrics: [
          { label: "FAQ 수", value: `${items.length}개`, tone: "primary" },
          { label: "형식", value: "FAQPage", tone: "accent" },
        ],
        tips: [
          "페이지 본문에 실제로 보이는 질문과 답변만 FAQ 스키마에 넣으세요.",
          "광고성 문구보다 사용자가 바로 이해할 수 있는 짧은 답변이 좋습니다.",
          "스키마 적용 후 Google Rich Results Test에서 오류가 없는지 확인하세요.",
        ],
      };
    },
  },
  "howto-schema-builder": {
    id: "howto-schema-builder",
    buttonLabel: "HowTo 스키마 만들기",
    fields: [
      { key: "name", label: "HowTo 제목", type: "text", placeholder: "예: SEO 제목 검사하는 방법" },
      {
        key: "description",
        label: "간단한 설명",
        type: "textarea",
        placeholder: "이 절차로 제목 길이와 키워드 위치를 점검할 수 있습니다.",
      },
      {
        key: "steps",
        label: "단계 목록",
        type: "textarea",
        placeholder: "1. 제목을 입력합니다.\n2. 핵심 키워드를 입력합니다.\n3. 검사 결과를 확인합니다.",
      },
    ],
    run: ({ name, description, steps }) => {
      const stepItems = steps
        .split("\n")
        .map((line) => line.replace(/^\s*\d+[.)]\s*/, "").trim())
        .filter(Boolean);
      if (!name.trim() || stepItems.length < 2) {
        throw new Error("HowTo 제목과 최소 2개 이상의 단계를 입력해 주세요.");
      }

      const schema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: name.trim(),
        description: description.trim(),
        inLanguage: "ko-KR",
        step: stepItems.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: `${index + 1}단계`,
          text: step,
        })),
      };

      return {
        summary: `${stepItems.length}단계 HowTo JSON-LD 초안을 생성했습니다.`,
        output: `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`,
        metrics: [
          { label: "단계 수", value: `${stepItems.length}개`, tone: "primary" },
          { label: "형식", value: "HowTo", tone: "accent" },
        ],
        tips: [
          "HowTo 스키마는 실제 절차형 콘텐츠에만 사용하세요.",
          "각 단계는 한 가지 행동만 설명하면 검색엔진과 사용자 모두 이해하기 쉽습니다.",
          "도구 사용법, 설정법, 체크 절차처럼 순서가 중요한 페이지에 적합합니다.",
        ],
      };
    },
  },
  "blog-cta-checker": {
    id: "blog-cta-checker",
    buttonLabel: "CTA 검사하기",
    fields: [
      {
        key: "cta",
        label: "CTA 문구",
        type: "textarea",
        placeholder: "예: 지금 SEO 제목 길이 검사기로 내 글 제목을 확인해 보세요.",
      },
    ],
    run: ({ cta }) => {
      const text = cta.trim();
      const hasVerb = /(확인|시작|다운로드|계산|생성|비교|신청|문의|복사|사용|점검)/.test(text);
      const hasSpecificTarget = /(제목|설명|URL|도구|검사기|계산기|가이드|체크리스트|템플릿)/.test(text);
      const hasUrgency = /(지금|바로|오늘|먼저|무료|간단히|3초|1분)/.test(text);
      const length = text.length;
      const score =
        (length >= 18 && length <= 80 ? 30 : length <= 120 ? 18 : 8) +
        (hasVerb ? 30 : 8) +
        (hasSpecificTarget ? 25 : 10) +
        (hasUrgency ? 15 : 6);

      return {
        summary:
          score >= 80
            ? "행동이 분명한 CTA입니다."
            : score >= 60
              ? "사용 가능하지만 행동 동사나 대상 표현을 더 구체화하면 좋습니다."
              : "무엇을 해야 하는지와 왜 해야 하는지가 약합니다.",
        metrics: [
          { label: "점수", value: `${Math.min(score, 100)}점`, tone: "primary" },
          { label: "길이", value: `${length}자`, tone: "accent" },
          { label: "행동 동사", value: hasVerb ? "있음" : "약함" },
        ],
        tips: [
          "CTA는 '좋습니다' 같은 평가보다 '확인하세요', '계산하세요' 같은 행동으로 끝내세요.",
          "사용자가 이동할 대상이 도구인지 글인지 문의인지 분명해야 합니다.",
          "본문 중간에는 부드러운 CTA, 결론에는 직접적인 CTA를 배치하면 자연스럽습니다.",
        ],
      };
    },
  },
  "paragraph-readability-checker": {
    id: "paragraph-readability-checker",
    buttonLabel: "문단 가독성 검사하기",
    fields: [
      {
        key: "text",
        label: "본문 텍스트",
        type: "textarea",
        placeholder: "검사할 블로그 본문이나 문단을 붙여넣으세요.",
      },
    ],
    run: ({ text }) => {
      const paragraphs = text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
      const sentences = text.split(/[.!?。！？]\s*|다\.\s*/).filter((s) => s.trim().length > 0);
      const longParagraphs = paragraphs.filter((p) => p.length > 320);
      const averageParagraphLength = paragraphs.length
        ? Math.round(paragraphs.reduce((sum, p) => sum + p.length, 0) / paragraphs.length)
        : 0;
      const score = Math.max(
        20,
        100 -
          longParagraphs.length * 18 -
          Math.max(0, averageParagraphLength - 180) * 0.12 -
          Math.max(0, sentences.length / Math.max(paragraphs.length, 1) - 5) * 8,
      );

      const output = longParagraphs.length
        ? longParagraphs
            .slice(0, 5)
            .map((p, index) => `긴 문단 ${index + 1} (${p.length}자): ${p.slice(0, 120)}...`)
            .join("\n\n")
        : "과도하게 긴 문단은 발견되지 않았습니다.";

      return {
        summary:
          score >= 80
            ? "모바일에서도 읽기 좋은 문단 구조입니다."
            : score >= 60
              ? "대체로 읽을 수 있지만 긴 문단 일부를 나누면 더 좋아집니다."
              : "문단이 길어 모바일 가독성이 떨어질 가능성이 큽니다.",
        output,
        metrics: [
          { label: "점수", value: `${Math.round(score)}점`, tone: "primary" },
          { label: "문단 수", value: `${paragraphs.length}개`, tone: "accent" },
          { label: "긴 문단", value: `${longParagraphs.length}개` },
        ],
        tips: [
          "모바일 본문은 한 문단을 2~4문장 안으로 유지하면 읽기 쉽습니다.",
          "숫자, 단계, 조건이 많으면 불릿 목록이나 표로 분리하세요.",
          "결론 문단은 짧게 유지하고 다음 행동을 한 문장으로 제시하세요.",
        ],
      };
    },
  },
  "h-tag-structure-checker": {
    id: "h-tag-structure-checker",
    buttonLabel: "H태그 구조 검사하기",
    fields: [
      {
        key: "headings",
        label: "H태그 목록",
        type: "textarea",
        placeholder: "H1 크레피카 블로그\nH2 SEO 기본 점검\nH3 메타 태그 확인\nH2 콘텐츠 구조",
      },
      { key: "keyword", label: "타겟 키워드", type: "text", placeholder: "예: 블로그 SEO" },
    ],
    run: ({ headings, keyword }) => {
      const rows = headings
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const match = line.match(/^(h[1-6])\s*[:-]?\s*(.+)$/i);
          return match ? { level: Number(match[1][1]), text: match[2].trim() } : null;
        })
        .filter((item): item is { level: number; text: string } => Boolean(item));
      const h1Count = rows.filter((row) => row.level === 1).length;
      const skipped = rows.some((row, index) => index > 0 && row.level - rows[index - 1].level > 1);
      const keywordHits = keyword.trim()
        ? rows.filter((row) => row.text.toLowerCase().includes(keyword.trim().toLowerCase())).length
        : 0;
      const score =
        (h1Count === 1 ? 35 : h1Count === 0 ? 8 : 18) +
        (!skipped ? 30 : 8) +
        (rows.length >= 4 ? 15 : 8) +
        (keyword.trim() ? (keywordHits > 0 ? 20 : 4) : 10);

      return {
        summary:
          score >= 80
            ? "검색엔진과 독자가 이해하기 좋은 H태그 구조입니다."
            : score >= 60
              ? "기본 구조는 갖췄지만 H1 개수나 하위 제목 흐름을 조금 더 다듬으면 좋습니다."
              : "H태그 위계가 불안정합니다. H1은 한 번만 쓰고 H2, H3 순서로 다시 정리하세요.",
        metrics: [
          { label: "점수", value: `${Math.min(score, 100)}점`, tone: "primary" },
          { label: "H1 개수", value: `${h1Count}개`, tone: "accent" },
          { label: "키워드 반영", value: keyword.trim() ? `${keywordHits}개` : "미입력" },
        ],
        output: rows.map((row) => `${"  ".repeat(row.level - 1)}H${row.level} ${row.text}`).join("\n"),
        tips: [
          "H1은 페이지의 핵심 주제를 담아 한 번만 사용하는 편이 안전합니다.",
          "H2는 큰 문단, H3는 H2 아래의 세부 설명으로 유지하세요.",
          "모든 제목에 키워드를 반복하기보다 핵심 H1과 주요 H2에 자연스럽게 넣으세요.",
        ],
      };
    },
  },
  "blog-outline-builder": {
    id: "blog-outline-builder",
    buttonLabel: "목차 설계하기",
    fields: [
      { key: "topic", label: "글 주제", type: "text", placeholder: "예: 초보자를 위한 블로그 SEO 점검" },
      { key: "keyword", label: "핵심 키워드", type: "text", placeholder: "예: 블로그 SEO" },
      { key: "audience", label: "독자", type: "text", placeholder: "예: 애드센스 승인을 준비하는 블로거" },
    ],
    run: ({ topic, keyword, audience }) => {
      const cleanTopic = topic.trim() || keyword.trim() || "글 주제";
      const cleanKeyword = keyword.trim() || cleanTopic;
      const cleanAudience = audience.trim() || "처음 방문한 독자";
      const outline = [
        `H1 ${cleanTopic}`,
        `H2 ${cleanAudience}가 먼저 알아야 할 핵심 요약`,
        `H2 ${cleanKeyword}를 시작하기 전 확인할 기준`,
        "H3 현재 상태를 점검하는 방법",
        "H3 흔히 생기는 실수와 피하는 법",
        `H2 ${cleanKeyword} 실행 단계`,
        "H3 1단계: 기본 구조 만들기",
        "H3 2단계: 본문과 예시 보강하기",
        "H3 3단계: 내부 링크와 CTA 연결하기",
        `H2 ${cleanKeyword} 체크리스트`,
        "H2 자주 묻는 질문",
        "H2 마무리와 다음 행동",
      ].join("\n");

      return {
        summary: "검색 의도, 독자 상황, CTA 흐름을 반영한 목차 초안입니다.",
        output: outline,
        metrics: [
          { label: "H2 섹션", value: "6개", tone: "primary" },
          { label: "H3 세부항목", value: "5개", tone: "accent" },
          { label: "키워드", value: cleanKeyword },
        ],
        tips: [
          "첫 H2는 요약과 기준을 담아 이탈을 줄이는 역할로 쓰세요.",
          "중간 H2에는 실제 절차와 예시를 넣어 본문 품질을 확보하세요.",
          "마지막에는 관련 도구, 다음 글, 체크리스트 같은 자연스러운 CTA를 연결하세요.",
        ],
      };
    },
  },
  "article-word-count-planner": {
    id: "article-word-count-planner",
    buttonLabel: "분량 설계하기",
    fields: [
      { key: "sections", label: "예상 H2 개수", type: "number", placeholder: "6" },
      { key: "depth", label: "깊이 수준(1~5)", type: "number", placeholder: "4" },
      { key: "examples", label: "예시/표/FAQ 개수", type: "number", placeholder: "3" },
    ],
    run: ({ sections, depth, examples }) => {
      const sectionCount = Math.max(3, Number(sections) || 6);
      const depthLevel = Math.min(5, Math.max(1, Number(depth) || 3));
      const exampleCount = Math.max(0, Number(examples) || 0);
      const min = sectionCount * 320 + depthLevel * 180 + exampleCount * 120;
      const max = min + sectionCount * 180 + depthLevel * 120;
      const paragraphs = Math.ceil(min / 180);

      return {
        summary: `권장 본문 분량은 약 ${min.toLocaleString()}~${max.toLocaleString()}자입니다.`,
        metrics: [
          { label: "권장 최소", value: `${min.toLocaleString()}자`, tone: "primary" },
          { label: "권장 최대", value: `${max.toLocaleString()}자`, tone: "accent" },
          { label: "권장 문단", value: `${paragraphs}개` },
        ],
        output: [
          `H2당 평균 ${Math.round(min / sectionCount).toLocaleString()}자 이상 확보`,
          `예시/표/FAQ 블록 ${exampleCount}개 반영`,
          `모바일 기준 문단 ${paragraphs}개 이상으로 분리`,
          "도입부 250~400자, 결론 200~350자 권장",
        ].join("\n"),
        tips: [
          "분량보다 검색 의도 충족이 우선입니다. 억지로 늘린 문단은 줄이세요.",
          "긴 설명은 표, 단계, FAQ로 분리하면 애드센스 검수 관점에서도 읽기 쉬워집니다.",
          "경험 예시와 체크리스트를 넣으면 단순 요약 글처럼 보이는 위험을 줄일 수 있습니다.",
        ],
      };
    },
  },
  "keyword-density-checker": {
    id: "keyword-density-checker",
    buttonLabel: "키워드 밀도 검사하기",
    fields: [
      { key: "text", label: "본문", type: "textarea", placeholder: "검사할 본문을 붙여넣으세요." },
      { key: "keyword", label: "핵심 키워드", type: "text", placeholder: "예: 블로그 SEO" },
    ],
    run: ({ text, keyword }) => {
      const body = text.trim();
      const cleanKeyword = keyword.trim();
      const charCount = body.replace(/\s/g, "").length;
      const keywordCount = cleanKeyword
        ? (body.toLowerCase().match(new RegExp(cleanKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").toLowerCase(), "g")) ?? []).length
        : 0;
      const density = charCount && cleanKeyword ? (keywordCount * cleanKeyword.length * 100) / charCount : 0;
      const score = density >= 0.4 && density <= 2.5 ? 90 : density > 0 && density < 4 ? 70 : density === 0 ? 35 : 45;

      return {
        summary:
          score >= 80
            ? "키워드가 과하지 않게 반영되어 있습니다."
            : density === 0
              ? "본문에 핵심 키워드가 직접 등장하지 않습니다."
              : "키워드 반복이 부족하거나 과할 수 있습니다. 문맥 중심으로 조정하세요.",
        metrics: [
          { label: "점수", value: `${score}점`, tone: "primary" },
          { label: "등장 횟수", value: `${keywordCount}회`, tone: "accent" },
          { label: "밀도", value: `${density.toFixed(2)}%` },
        ],
        output: `본문 글자수(공백 제외): ${charCount.toLocaleString()}자\n키워드: ${cleanKeyword || "미입력"}\n권장: 핵심 위치에 자연스럽게 2~5회 반영`,
        tips: [
          "H1, 첫 문단, 주요 H2, 결론에 자연스럽게 한 번씩 배치하는 방식이 안전합니다.",
          "같은 문구 반복보다 동의어와 관련 질문을 함께 쓰면 GEO/AEO 대응에 유리합니다.",
          "키워드 밀도만 맞춘 글보다 구체적인 예시와 실제 절차가 있는 글이 더 강합니다.",
        ],
      };
    },
  },
  "internal-link-anchor-planner": {
    id: "internal-link-anchor-planner",
    buttonLabel: "앵커 문구 설계하기",
    fields: [
      { key: "sourceTopic", label: "현재 글 주제", type: "text", placeholder: "예: 블로그 SEO 점검" },
      { key: "targetPages", label: "연결할 내부 페이지", type: "textarea", placeholder: "SEO 제목 길이 검사기\n메타 설명 검사기\n문단 가독성 검사기" },
      { key: "keyword", label: "핵심 키워드", type: "text", placeholder: "예: 블로그 SEO" },
    ],
    run: ({ sourceTopic, targetPages, keyword }) => {
      const pages = targetPages
        .split("\n")
        .map((page) => page.trim())
        .filter(Boolean)
        .slice(0, 8);
      const topic = sourceTopic.trim() || "현재 글";
      const key = keyword.trim() || "핵심 주제";
      const anchors = pages.map((page, index) => {
        const patterns = [
          `${page}로 ${key} 상태 확인하기`,
          `${topic} 단계에서 ${page} 함께 점검하기`,
          `${key} 개선 전 ${page} 사용하기`,
          `${page} 결과를 기준으로 다음 문단 보강하기`,
        ];
        return `${index + 1}. ${page}\n- 앵커: ${patterns[index % patterns.length]}\n- 위치: 관련 설명 직후 또는 체크리스트 문단`;
      });

      return {
        summary: pages.length ? `${pages.length}개의 내부 링크 앵커 초안을 만들었습니다.` : "연결할 내부 페이지를 입력해 주세요.",
        output: anchors.join("\n\n") || "예: SEO 제목 길이 검사기로 제목 노출 상태 확인하기",
        metrics: [
          { label: "링크 후보", value: `${pages.length}개`, tone: "primary" },
          { label: "권장 본문 위치", value: pages.length >= 2 ? "충분" : "보강 필요", tone: "accent" },
          { label: "키워드", value: key },
        ],
        tips: [
          "앵커는 '여기', '클릭'보다 연결 대상의 효용이 보이는 문구가 좋습니다.",
          "한 문단에 링크를 몰아넣지 말고 관련 설명 바로 뒤에 배치하세요.",
          "SEO 목적 글은 본문 안에 관련 내부 링크 2개 이상을 자연스럽게 연결하는 편이 좋습니다.",
        ],
      };
    },
  },
  "serp-snippet-preview": {
    id: "serp-snippet-preview",
    buttonLabel: "검색결과 미리보기",
    fields: [
      { key: "title", label: "Meta Title", type: "textarea", placeholder: "블로그 SEO 점검 체크리스트 - 제목부터 내부링크까지" },
      { key: "description", label: "Meta Description", type: "textarea", placeholder: "블로그 SEO 점검에 필요한 제목, 설명, H태그, 내부 링크, Alt Text 기준을 한 번에 확인하세요." },
      { key: "url", label: "URL", type: "text", placeholder: "https://crepika.com/blog/seo-checklist" },
    ],
    run: ({ title, description, url }) => {
      const cleanTitle = title.trim().replace(/\s+/g, " ");
      const cleanDescription = description.trim().replace(/\s+/g, " ");
      const cleanUrl = url.trim() || "https://crepika.com/blog/example";
      const titleOk = cleanTitle.length >= 25 && cleanTitle.length <= 60;
      const descOk = cleanDescription.length >= 70 && cleanDescription.length <= 155;
      const score = (titleOk ? 45 : 24) + (descOk ? 40 : 20) + (/^https:\/\/[^/]+\/[a-z0-9-/]+$/i.test(cleanUrl) ? 15 : 7);

      return {
        summary:
          score >= 85
            ? "검색결과에서 잘 읽히는 스니펫 구성입니다."
            : "제목 길이, 설명 길이, URL 가독성을 조금 더 조정하세요.",
        output: `${cleanTitle || "제목을 입력하세요"}\n${cleanUrl}\n${cleanDescription || "설명을 입력하세요"}`,
        metrics: [
          { label: "점수", value: `${score}점`, tone: "primary" },
          { label: "Title", value: `${cleanTitle.length}자`, tone: "accent" },
          { label: "Description", value: `${cleanDescription.length}자` },
        ],
        tips: [
          "핵심 키워드는 제목과 설명 앞쪽에 자연스럽게 배치하세요.",
          "URL은 사람이 읽고 주제를 알 수 있는 영문 소문자 경로가 좋습니다.",
          "설명은 요약만 하지 말고 사용자가 얻는 결과를 함께 보여주세요.",
        ],
      };
    },
  },
  "alt-text-helper": {
    id: "alt-text-helper",
    buttonLabel: "Alt Text 만들기",
    fields: [
      { key: "imageContext", label: "이미지 설명", type: "textarea", placeholder: "예: 블로그 SEO 체크리스트 화면 캡처, H태그와 메타 설명 항목이 보임" },
      { key: "keyword", label: "관련 키워드", type: "text", placeholder: "예: 블로그 SEO 체크리스트" },
    ],
    run: ({ imageContext, keyword }) => {
      const context = imageContext.trim().replace(/\s+/g, " ");
      const key = keyword.trim();
      const alt = context
        ? `${key ? `${key} - ` : ""}${context}`.slice(0, 125)
        : "이미지의 핵심 내용과 사용자가 봐야 할 정보를 구체적으로 입력하세요.";
      const score =
        (context.length >= 20 && context.length <= 120 ? 45 : 22) +
        (key && alt.includes(key) ? 25 : key ? 10 : 15) +
        (!/(이미지|사진|그림)$/.test(alt) ? 20 : 10) +
        (alt.length <= 125 ? 10 : 4);

      return {
        summary: score >= 80 ? "사용자와 검색엔진 모두 이해하기 쉬운 대체 텍스트입니다." : "이미지의 목적과 맥락을 조금 더 구체화하세요.",
        output: alt,
        metrics: [
          { label: "점수", value: `${score}점`, tone: "primary" },
          { label: "길이", value: `${alt.length}자`, tone: "accent" },
          { label: "키워드", value: key ? "반영" : "미입력" },
        ],
        tips: [
          "Alt Text는 보이지 않는 키워드 삽입 공간이 아니라 이미지 이해를 돕는 설명입니다.",
          "장식 이미지는 빈 alt가 나을 수 있고, 정보 이미지는 핵심 정보를 반드시 적어야 합니다.",
          "같은 이미지를 반복 사용할 때도 페이지 맥락에 맞게 문구를 조정하세요.",
        ],
      };
    },
  },
  "content-freshness-checklist": {
    id: "content-freshness-checklist",
    buttonLabel: "최신성 점검하기",
    fields: [
      { key: "lastUpdated", label: "마지막 수정일", type: "text", placeholder: "예: 2026-01-15" },
      { key: "topic", label: "글 주제", type: "text", placeholder: "예: 애드센스 승인 기준" },
      { key: "hasStats", label: "수치/정책/가격 정보 포함 여부", type: "text", placeholder: "예: 포함 / 없음" },
    ],
    run: ({ lastUpdated, topic, hasStats }) => {
      const date = new Date(lastUpdated.trim());
      const validDate = !Number.isNaN(date.getTime());
      const ageDays = validDate ? Math.floor((Date.now() - date.getTime()) / 86400000) : null;
      const sensitive = /(포함|있음|yes|y|정책|가격|수치)/i.test(hasStats);
      const topicText = topic.trim() || "해당 글";
      const risk = !validDate || (ageDays !== null && ageDays > (sensitive ? 90 : 180));
      const score = validDate ? Math.max(35, 100 - Math.max(0, (ageDays ?? 0) - (sensitive ? 60 : 120)) * 0.35) : 45;

      return {
        summary: risk ? `${topicText}은 최신성 보강이 필요합니다.` : `${topicText}은 현재 기준으로 최신성 위험이 낮습니다.`,
        output: [
          `마지막 수정일: ${validDate ? date.toISOString().slice(0, 10) : "확인 필요"}`,
          `경과일: ${ageDays === null ? "계산 불가" : `${ageDays}일`}`,
          `업데이트 우선순위: ${risk ? "높음" : "보통"}`,
          "점검 항목: 통계, 정책, 도구 화면, 가격, 링크, 스크린샷, FAQ",
        ].join("\n"),
        metrics: [
          { label: "점수", value: `${Math.round(score)}점`, tone: "primary" },
          { label: "수정 경과", value: ageDays === null ? "미확인" : `${ageDays}일`, tone: "accent" },
          { label: "민감 정보", value: sensitive ? "있음" : "낮음" },
        ],
        tips: [
          "정책, 가격, 플랫폼 UI를 다루는 글은 3개월 단위로 재검토하세요.",
          "수정했다면 본문에 최근 확인일이나 변경 요약을 짧게 남기세요.",
          "깨진 외부 링크와 오래된 스크린샷은 신뢰도를 빠르게 떨어뜨립니다.",
        ],
      };
    },
  },
  "eeat-signal-checker": {
    id: "eeat-signal-checker",
    buttonLabel: "E-E-A-T 신호 검사하기",
    fields: [
      { key: "content", label: "본문 또는 개요", type: "textarea", placeholder: "검사할 글의 개요, 도입부, 핵심 문단을 붙여넣으세요." },
      { key: "author", label: "작성자/경험 정보", type: "text", placeholder: "예: 직접 운영한 블로그 사례 포함" },
    ],
    run: ({ content, author }) => {
      const text = `${content}\n${author}`.trim();
      const hasExperience = /(직접|경험|사례|운영|테스트|실험|결과)/.test(text);
      const hasEvidence = /(출처|공식|자료|통계|링크|문서|기준)/.test(text);
      const hasSpecifics = /[0-9]|단계|체크리스트|예시|표/.test(text);
      const hasAuthor = author.trim().length >= 8;
      const score = [hasExperience, hasEvidence, hasSpecifics, hasAuthor].filter(Boolean).length * 25;

      return {
        summary:
          score >= 75
            ? "경험, 근거, 구체성이 비교적 잘 드러납니다."
            : "경험 근거와 작성자 맥락을 더 분명히 보강해야 합니다.",
        output: [
          `경험 신호: ${hasExperience ? "있음" : "부족"}`,
          `근거 신호: ${hasEvidence ? "있음" : "부족"}`,
          `구체성 신호: ${hasSpecifics ? "있음" : "부족"}`,
          `작성자 맥락: ${hasAuthor ? "있음" : "부족"}`,
        ].join("\n"),
        metrics: [
          { label: "점수", value: `${score}점`, tone: "primary" },
          { label: "경험", value: hasExperience ? "있음" : "부족", tone: "accent" },
          { label: "근거", value: hasEvidence ? "있음" : "부족" },
        ],
        tips: [
          "직접 해본 과정, 실패 지점, 전후 결과를 넣으면 경험 신호가 강해집니다.",
          "정책이나 수치가 있는 글은 공식 문서나 신뢰할 수 있는 출처를 함께 연결하세요.",
          "작성자 소개, 문의 페이지, 사이트 소개가 있으면 신뢰 구조가 더 자연스럽습니다.",
        ],
      };
    },
  },
  "blog-intro-hook-checker": {
    id: "blog-intro-hook-checker",
    buttonLabel: "도입부 훅 검사하기",
    fields: [
      { key: "intro", label: "도입부", type: "textarea", placeholder: "블로그 글의 첫 2~4문단을 붙여넣으세요." },
      { key: "keyword", label: "핵심 키워드", type: "text", placeholder: "예: 애드센스 승인" },
    ],
    run: ({ intro, keyword }) => {
      const text = intro.trim().replace(/\s+/g, " ");
      const key = keyword.trim();
      const hasProblem = /(문제|어렵|고민|실패|막히|궁금|왜|필요|주의)/.test(text);
      const hasPromise = /(방법|체크|정리|해결|알려|확인|가이드|전략|단계)/.test(text);
      const hasKeyword = key ? text.toLowerCase().includes(key.toLowerCase()) : false;
      const lengthOk = text.length >= 120 && text.length <= 450;
      const score = (lengthOk ? 25 : 12) + (hasProblem ? 25 : 8) + (hasPromise ? 25 : 8) + (key ? (hasKeyword ? 25 : 5) : 15);

      return {
        summary:
          score >= 80
            ? "독자가 계속 읽을 이유가 비교적 선명한 도입부입니다."
            : "문제 제기, 기대 결과, 핵심 키워드를 더 앞쪽에 보강하세요.",
        output: [
          `문제 제기: ${hasProblem ? "있음" : "부족"}`,
          `기대 결과: ${hasPromise ? "있음" : "부족"}`,
          `키워드 반영: ${key ? (hasKeyword ? "있음" : "부족") : "미입력"}`,
          "권장 구조: 공감 문장 -> 문제 정의 -> 글에서 얻을 결과 -> 본문 예고",
        ].join("\n"),
        metrics: [
          { label: "점수", value: `${score}점`, tone: "primary" },
          { label: "길이", value: `${text.length}자`, tone: "accent" },
          { label: "키워드", value: key || "미입력" },
        ],
        tips: [
          "첫 문단은 독자의 상황이나 문제를 직접 짚어야 이탈이 줄어듭니다.",
          "도입부 끝에는 이 글을 읽고 무엇을 해결할 수 있는지 분명히 적으세요.",
          "핵심 키워드는 억지 반복보다 첫 150자 안에 자연스럽게 한 번 넣는 편이 좋습니다.",
        ],
      };
    },
  },
  "list-to-table-converter": {
    id: "list-to-table-converter",
    buttonLabel: "표로 변환하기",
    fields: [
      {
        key: "items",
        label: "목록",
        type: "textarea",
        placeholder: "제목 | 장점 | 주의점\nSEO 제목 | 클릭률 개선 | 과장 금지\n메타 설명 | 요약 전달 | 중복 금지",
      },
    ],
    run: ({ items }) => {
      const rows = items
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => line.split(/[|\t,]/).map((cell) => cell.trim()).filter(Boolean));
      const maxCols = Math.max(2, ...rows.map((row) => row.length));
      const header = rows[0]?.length >= 2 ? rows[0] : Array.from({ length: maxCols }, (_, index) => `항목 ${index + 1}`);
      const bodyRows = rows[0]?.length >= 2 ? rows.slice(1) : rows;
      const normalize = (row: string[]) => Array.from({ length: maxCols }, (_, index) => row[index] ?? "");
      const table = [
        `| ${normalize(header).join(" | ")} |`,
        `| ${Array.from({ length: maxCols }, () => "---").join(" | ")} |`,
        ...bodyRows.map((row) => `| ${normalize(row).join(" | ")} |`),
      ].join("\n");

      return {
        summary: `${bodyRows.length}개 행을 마크다운 표로 변환했습니다.`,
        output: table,
        metrics: [
          { label: "행", value: `${bodyRows.length}개`, tone: "primary" },
          { label: "열", value: `${maxCols}개`, tone: "accent" },
          { label: "형식", value: "Markdown" },
        ],
        tips: [
          "비교, 조건, 장단점처럼 스캔이 필요한 정보는 문단보다 표가 읽기 쉽습니다.",
          "모바일에서는 열이 너무 많으면 읽기 어려우니 2~4열 안에서 정리하세요.",
          "표 앞뒤에 짧은 해설 문단을 넣으면 검색엔진과 독자 모두 맥락을 이해하기 쉽습니다.",
        ],
      };
    },
  },
  "markdown-table-builder": {
    id: "markdown-table-builder",
    buttonLabel: "마크다운 표 만들기",
    fields: [
      { key: "columns", label: "열 이름", type: "text", placeholder: "항목, 설명, 체크 기준" },
      { key: "rows", label: "행 개수", type: "number", placeholder: "5" },
      { key: "topic", label: "표 주제", type: "text", placeholder: "예: SEO 점검표" },
    ],
    run: ({ columns, rows, topic }) => {
      const cols = (columns.trim() || "항목, 설명, 체크 기준")
        .split(/[,\t|]/)
        .map((col) => col.trim())
        .filter(Boolean)
        .slice(0, 6);
      const rowCount = Math.min(12, Math.max(2, Number(rows) || 5));
      const topicText = topic.trim() || "콘텐츠";
      const tableRows = Array.from({ length: rowCount }, (_, index) =>
        `| ${cols.map((col, colIndex) => (colIndex === 0 ? `${topicText} ${index + 1}` : `${col} 입력`)).join(" | ")} |`,
      );
      const table = [`| ${cols.join(" | ")} |`, `| ${cols.map(() => "---").join(" | ")} |`, ...tableRows].join("\n");

      return {
        summary: `${cols.length}열 ${rowCount}행 마크다운 표 템플릿을 만들었습니다.`,
        output: table,
        metrics: [
          { label: "열", value: `${cols.length}개`, tone: "primary" },
          { label: "행", value: `${rowCount}개`, tone: "accent" },
          { label: "주제", value: topicText },
        ],
        tips: [
          "표는 정보 비교에 강하지만, 표만 놓기보다 전후 설명을 함께 쓰세요.",
          "첫 열은 사용자가 비교할 대상을 분명히 보여주는 이름으로 두세요.",
          "너무 긴 문장은 표 안에서 줄바꿈이 생기므로 짧은 구문으로 정리하세요.",
        ],
      };
    },
  },
  "source-link-organizer": {
    id: "source-link-organizer",
    buttonLabel: "출처 정리하기",
    fields: [
      { key: "sources", label: "출처 목록", type: "textarea", placeholder: "Google Search Central | https://developers.google.com/search\nschema.org | https://schema.org" },
      { key: "topic", label: "본문 주제", type: "text", placeholder: "예: 구조화 데이터 적용" },
    ],
    run: ({ sources, topic }) => {
      const topicText = topic.trim() || "본문";
      const rows = sources
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const parts = line.split("|").map((part) => part.trim());
          const url = parts.find((part) => /^https?:\/\//.test(part)) ?? line.match(/https?:\/\/\S+/)?.[0] ?? "";
          const label = (parts.find((part) => part && part !== url) ?? line.replace(url, "").trim() ?? "출처").trim();
          return { label, url };
        });
      const output = rows
        .map((source, index) => `${index + 1}. [${source.label}](${source.url || "https://example.com"}) - ${topicText} 근거 확인용`)
        .join("\n");

      return {
        summary: rows.length ? `${rows.length}개 출처를 본문용 링크 목록으로 정리했습니다.` : "출처 이름과 URL을 입력해 주세요.",
        output: output || "1. [공식 문서](https://example.com) - 본문 근거 확인용",
        metrics: [
          { label: "출처", value: `${rows.length}개`, tone: "primary" },
          { label: "URL 포함", value: `${rows.filter((source) => source.url).length}개`, tone: "accent" },
          { label: "주제", value: topicText },
        ],
        tips: [
          "정책, 수치, 표준을 설명할 때는 공식 문서나 원자료 링크를 우선하세요.",
          "외부 링크는 새 창 여부보다 사용자가 근거를 확인할 수 있는 명확성이 중요합니다.",
          "출처 링크만 나열하지 말고 본문에서 왜 참고했는지 한 문장으로 설명하세요.",
        ],
      };
    },
  },
  "instagram-caption-builder": {
    id: "instagram-caption-builder",
    buttonLabel: "캡션 구조화하기",
    fields: [
      { key: "topic", label: "게시물 주제", type: "text", placeholder: "예: 블로그 SEO 체크리스트" },
      { key: "audience", label: "대상", type: "text", placeholder: "예: 애드센스 승인 준비 중인 블로거" },
      { key: "cta", label: "CTA", type: "text", placeholder: "예: 저장하고 글 발행 전에 확인하기" },
    ],
    run: ({ topic, audience, cta }) => {
      const topicText = topic.trim() || "오늘의 콘텐츠";
      const audienceText = audience.trim() || "콘텐츠를 더 잘 만들고 싶은 분";
      const ctaText = cta.trim() || "저장해두고 필요할 때 다시 확인하세요";
      const caption = [
        `${audienceText}이라면 ${topicText}에서 가장 먼저 봐야 할 포인트가 있습니다.`,
        "",
        `1. 지금 막히는 지점을 한 문장으로 정리하기`,
        "2. 기준을 체크리스트로 나누기",
        "3. 바로 적용할 수 있는 작은 행동부터 실행하기",
        "",
        `오늘은 ${topicText}를 복잡하게 설명하기보다, 바로 점검할 수 있는 흐름으로 정리했습니다.`,
        "",
        ctaText,
      ].join("\n");

      return {
        summary: "훅, 본문, CTA가 분리된 인스타그램 캡션 초안입니다.",
        output: caption,
        metrics: [
          { label: "길이", value: `${caption.length}자`, tone: "primary" },
          { label: "구조", value: "훅/리스트/CTA", tone: "accent" },
          { label: "대상", value: audienceText },
        ],
        tips: [
          "첫 줄은 피드에서 잘리기 전에도 의미가 보여야 합니다.",
          "정보형 캡션은 3~5개 포인트로 나누면 저장 행동을 유도하기 쉽습니다.",
          "CTA는 댓글 유도보다 저장, 공유, 프로필 링크 확인처럼 게시물 목적에 맞춰 정하세요.",
        ],
      };
    },
  },
  "reels-hook-bank-builder": {
    id: "reels-hook-bank-builder",
    buttonLabel: "릴스 훅 만들기",
    fields: [
      { key: "topic", label: "릴스 주제", type: "text", placeholder: "예: 블로그 SEO 체크리스트" },
      { key: "audience", label: "대상", type: "text", placeholder: "예: 애드센스 승인 준비 중인 블로거" },
      { key: "benefit", label: "얻는 결과", type: "text", placeholder: "예: 발행 전 빠르게 점검할 수 있음" },
    ],
    run: ({ topic, audience, benefit }) => {
      const topicText = topic.trim() || "오늘 주제";
      const audienceText = audience.trim() || "콘텐츠를 만드는 사람";
      const benefitText = benefit.trim() || "바로 적용할 수 있는 기준";
      const hooks = [
        `${audienceText}이 ${topicText}에서 자주 놓치는 3가지`,
        `${topicText}, 이 순서로 보면 훨씬 쉬워집니다`,
        `${benefitText}이 필요하다면 이 체크리스트부터 보세요`,
        `${topicText} 전에 이것만 확인해도 실수가 줄어듭니다`,
        `처음 시작하는 ${audienceText}을 위한 ${topicText} 빠른 정리`,
        `${topicText} 때문에 막혔다면 이 10초 요약부터 보세요`,
        `저장해두면 좋은 ${topicText} 기준`,
        `${audienceText}에게 지금 필요한 ${topicText} 핵심만 정리했습니다`,
      ];

      return {
        summary: `${hooks.length}개의 릴스 첫 문장 후보를 만들었습니다.`,
        output: hooks.map((hook, index) => `${index + 1}. ${hook}`).join("\n"),
        metrics: [
          { label: "훅 후보", value: `${hooks.length}개`, tone: "primary" },
          { label: "구조", value: "문제/기준/저장", tone: "accent" },
          { label: "대상", value: audienceText },
        ],
        tips: [
          "릴스 첫 1~2초에는 주제보다 시청자 상황이 먼저 보여야 멈춥니다.",
          "숫자, 실수, 체크리스트, 저장 가치가 보이는 문장이 정보형 릴스에 잘 맞습니다.",
          "훅은 과장보다 영상 안에서 바로 증명할 수 있는 약속이어야 합니다.",
        ],
      };
    },
  },
  "youtube-title-length-checker": {
    id: "youtube-title-length-checker",
    buttonLabel: "유튜브 제목 검사하기",
    fields: [
      { key: "title", label: "제목", type: "textarea", placeholder: "예: 블로그 SEO 체크리스트 7가지: 애드센스 승인 전 꼭 확인하세요" },
      { key: "keyword", label: "핵심 키워드", type: "text", placeholder: "예: 블로그 SEO" },
    ],
    run: ({ title, keyword }) => {
      const cleanTitle = title.trim().replace(/\s+/g, " ");
      const key = keyword.trim();
      const keywordIndex = key ? cleanTitle.toLowerCase().indexOf(key.toLowerCase()) : -1;
      const lengthOk = cleanTitle.length >= 25 && cleanTitle.length <= 70;
      const hasCuriosity = /(왜|방법|가지|전|후|실수|체크|비밀|정리|가이드|초보)/.test(cleanTitle);
      const score =
        (lengthOk ? 35 : cleanTitle.length <= 85 ? 22 : 10) +
        (key ? (keywordIndex >= 0 && keywordIndex <= 25 ? 30 : keywordIndex >= 0 ? 18 : 3) : 15) +
        (hasCuriosity ? 25 : 10) +
        (/[0-9]/.test(cleanTitle) ? 10 : 5);

      return {
        summary:
          score >= 80
            ? "검색과 클릭을 함께 고려한 유튜브 제목입니다."
            : "길이, 키워드 위치, 클릭 이유를 더 선명하게 조정하세요.",
        metrics: [
          { label: "점수", value: `${Math.min(score, 100)}점`, tone: "primary" },
          { label: "길이", value: `${cleanTitle.length}자`, tone: "accent" },
          { label: "키워드 위치", value: keywordIndex >= 0 ? `${keywordIndex + 1}번째` : "없음" },
        ],
        output: [
          `현재 제목: ${cleanTitle || "제목을 입력하세요"}`,
          `권장: 핵심 키워드 앞쪽 + 구체적 결과 + 숫자 또는 상황 단서`,
          `예시: ${key || "핵심 키워드"} 체크리스트 7가지: 초보자가 놓치기 쉬운 기준`,
        ].join("\n"),
        tips: [
          "유튜브 제목은 검색 키워드와 클릭 동기가 함께 보여야 합니다.",
          "너무 긴 제목은 모바일에서 핵심이 잘리므로 앞부분에 의미를 몰아두세요.",
          "과장된 제목은 클릭 후 이탈을 만들 수 있으니 영상 내용으로 증명 가능한 약속만 쓰세요.",
        ],
      };
    },
  },
  "youtube-description-formatter": {
    id: "youtube-description-formatter",
    buttonLabel: "설명란 정리하기",
    fields: [
      { key: "summary", label: "영상 요약", type: "textarea", placeholder: "영상에서 다루는 핵심 내용을 입력하세요." },
      { key: "links", label: "링크", type: "textarea", placeholder: "블로그 글: https://crepika.com/blog\n도구: https://crepika.com/tools" },
      { key: "chapters", label: "챕터", type: "textarea", placeholder: "00:00 인트로\n00:35 핵심 기준\n02:10 체크리스트" },
    ],
    run: ({ summary, links, chapters }) => {
      const cleanSummary = summary.trim() || "이번 영상에서는 핵심 기준과 바로 적용할 수 있는 체크 포인트를 정리합니다.";
      const linkLines = links
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      const chapterLines = chapters
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      const output = [
        cleanSummary,
        "",
        "핵심 내용",
        "- 문제 상황과 기준 정리",
        "- 바로 적용할 수 있는 체크 포인트",
        "- 다음 행동 안내",
        "",
        linkLines.length ? "관련 링크" : "",
        ...linkLines.map((line) => `- ${line}`),
        linkLines.length ? "" : "",
        chapterLines.length ? "타임라인" : "",
        ...chapterLines,
        "",
        "#크리에이터 #콘텐츠마케팅 #블로그SEO",
      ]
        .filter((line, index, array) => line || array[index - 1])
        .join("\n");

      return {
        summary: "요약, 관련 링크, 타임라인이 있는 유튜브 설명란 초안입니다.",
        output,
        metrics: [
          { label: "길이", value: `${output.length}자`, tone: "primary" },
          { label: "링크", value: `${linkLines.length}개`, tone: "accent" },
          { label: "챕터", value: `${chapterLines.length}개` },
        ],
        tips: [
          "설명 첫 2줄에는 영상에서 얻는 결과를 먼저 적으세요.",
          "관련 링크는 사용자가 다음 행동을 할 수 있는 순서로 정리하세요.",
          "챕터는 긴 영상에서 탐색성을 높여 시청자 만족도를 높입니다.",
        ],
      };
    },
  },
  "shorts-script-timer": {
    id: "shorts-script-timer",
    buttonLabel: "쇼츠 시간 계산하기",
    fields: [
      { key: "script", label: "대본", type: "textarea", placeholder: "쇼츠 또는 릴스에서 말할 대본을 붙여넣으세요." },
      { key: "speed", label: "말 속도(분당 글자수)", type: "number", placeholder: "330" },
    ],
    run: ({ script, speed }) => {
      const text = script.trim().replace(/\s+/g, " ");
      const chars = text.length;
      const charsPerMinute = Math.max(180, Number(speed) || 330);
      const seconds = Math.ceil((chars / charsPerMinute) * 60);
      const target = seconds <= 30 ? "30초 쇼츠 가능" : seconds <= 60 ? "60초 안에 가능" : "축약 필요";
      const cutChars = Math.max(0, chars - charsPerMinute);

      return {
        summary: `예상 말하기 시간은 약 ${seconds}초입니다.`,
        output: [
          `예상 시간: ${seconds}초`,
          `판정: ${target}`,
          `60초 목표 초과분: ${cutChars > 0 ? `${cutChars}자 내외 축약` : "없음"}`,
          "권장 구조: 2초 훅 -> 3개 포인트 -> 1문장 CTA",
        ].join("\n"),
        metrics: [
          { label: "예상 시간", value: `${seconds}초`, tone: "primary" },
          { label: "글자수", value: `${chars}자`, tone: "accent" },
          { label: "속도", value: `${charsPerMinute}자/분` },
        ],
        tips: [
          "쇼츠는 첫 문장과 마지막 CTA를 남기고 중복 설명부터 줄이세요.",
          "숫자 목록은 3개 안팎이 짧은 영상에서 기억되기 쉽습니다.",
          "자막까지 고려하면 실제 말 속도보다 조금 여유 있게 계산하는 편이 안전합니다.",
        ],
      };
    },
  },
  "thread-post-splitter": {
    id: "thread-post-splitter",
    buttonLabel: "스레드로 나누기",
    fields: [
      { key: "text", label: "긴 글", type: "textarea", placeholder: "스레드나 X에 나눠 올릴 긴 글을 붙여넣으세요." },
      { key: "limit", label: "글자 제한", type: "number", placeholder: "240" },
    ],
    run: ({ text, limit }) => {
      const max = Math.min(500, Math.max(80, Number(limit) || 240));
      const sentences = text
        .replace(/\s+/g, " ")
        .split(/(?<=[.!?。！？]|다\.|요\.)\s+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean);
      const posts: string[] = [];
      let current = "";
      for (const sentence of sentences.length ? sentences : [text.trim()]) {
        if ((current ? `${current} ${sentence}` : sentence).length <= max) {
          current = current ? `${current} ${sentence}` : sentence;
        } else {
          if (current) posts.push(current);
          current = sentence.length <= max ? sentence : sentence.slice(0, max - 3) + "...";
        }
      }
      if (current) posts.push(current);
      const numbered = posts.map((post, index) => `${index + 1}/${posts.length} ${post}`);

      return {
        summary: `${numbered.length}개의 스레드 포스트로 나눴습니다.`,
        output: numbered.join("\n\n"),
        metrics: [
          { label: "포스트", value: `${numbered.length}개`, tone: "primary" },
          { label: "제한", value: `${max}자`, tone: "accent" },
          { label: "평균", value: `${Math.round(numbered.join("").length / Math.max(numbered.length, 1))}자` },
        ],
        tips: [
          "첫 포스트는 문제와 얻는 결과를 함께 보여줘야 이어 읽힙니다.",
          "각 포스트는 한 가지 생각만 담고, 다음 포스트로 넘어갈 이유를 남기세요.",
          "마지막에는 저장, 공유, 관련 글 확인 같은 하나의 행동만 요청하세요.",
        ],
      };
    },
  },
  "linkedin-post-formatter": {
    id: "linkedin-post-formatter",
    buttonLabel: "링크드인 글 정리하기",
    fields: [
      { key: "idea", label: "핵심 아이디어", type: "textarea", placeholder: "공유하려는 경험, 인사이트, 사례를 입력하세요." },
      { key: "audience", label: "대상 독자", type: "text", placeholder: "예: 1인 크리에이터, 마케터, 블로거" },
      { key: "cta", label: "마지막 행동", type: "text", placeholder: "예: 댓글로 체크리스트 요청하기" },
    ],
    run: ({ idea, audience, cta }) => {
      const ideaText = idea.trim() || "오늘 배운 핵심 인사이트";
      const audienceText = audience.trim() || "이 주제에 관심 있는 분";
      const ctaText = cta.trim() || "여러분은 어떻게 생각하시나요?";
      const post = [
        `${audienceText}에게 꼭 필요한 기준이 하나 있습니다.`,
        "",
        ideaText,
        "",
        "제가 정리한 핵심은 이렇습니다.",
        "1. 문제를 먼저 한 문장으로 좁힙니다.",
        "2. 실제 사례나 숫자로 근거를 붙입니다.",
        "3. 다음 행동을 하나만 제안합니다.",
        "",
        ctaText,
      ].join("\n");

      return {
        summary: "도입, 인사이트, 번호 목록, CTA가 있는 링크드인 글 초안입니다.",
        output: post,
        metrics: [
          { label: "길이", value: `${post.length}자`, tone: "primary" },
          { label: "구조", value: "Hook/List/CTA", tone: "accent" },
          { label: "대상", value: audienceText },
        ],
        tips: [
          "링크드인은 과한 홍보보다 경험에서 나온 기준과 배운 점이 잘 맞습니다.",
          "첫 두 줄에 독자와 문제를 분명히 보여줘야 더 읽힙니다.",
          "마지막 CTA는 댓글, 저장, 대화 요청 중 하나만 선택하세요.",
        ],
      };
    },
  },
  "hashtag-group-planner": {
    id: "hashtag-group-planner",
    buttonLabel: "해시태그 그룹 만들기",
    fields: [
      { key: "topic", label: "콘텐츠 주제", type: "text", placeholder: "예: 블로그 SEO" },
      { key: "niche", label: "세부 분야", type: "text", placeholder: "예: 애드센스, 콘텐츠 마케팅" },
      { key: "brand", label: "브랜드/계정 키워드", type: "text", placeholder: "예: 크레피카" },
    ],
    run: ({ topic, niche, brand }) => {
      const topicText = topic.trim() || "콘텐츠";
      const nicheWords = niche
        .split(/[,،\s]+/)
        .map((word) => word.trim())
        .filter(Boolean)
        .slice(0, 4);
      const brandText = brand.trim();
      const clean = (value: string) => `#${value.replace(/[^0-9A-Za-z가-힣_]/g, "")}`;
      const core = [topicText, `${topicText}팁`, `${topicText}가이드`].map(clean);
      const nicheTags = nicheWords.map(clean);
      const discovery = ["크리에이터", "콘텐츠마케팅", "SNS마케팅", "블로그운영"].map(clean);
      const brandTags = brandText ? [clean(brandText), clean(`${brandText}도구`)] : [];
      const output = [
        "핵심 태그",
        core.join(" "),
        "",
        "세부 태그",
        nicheTags.join(" ") || "#세부분야 #타겟키워드",
        "",
        "발견 태그",
        discovery.join(" "),
        "",
        "브랜드 태그",
        brandTags.join(" ") || "#브랜드명",
      ].join("\n");

      return {
        summary: "핵심, 세부, 발견, 브랜드 그룹으로 해시태그를 나눴습니다.",
        output,
        metrics: [
          { label: "총 태그", value: `${core.length + nicheTags.length + discovery.length + brandTags.length}개`, tone: "primary" },
          { label: "그룹", value: "4개", tone: "accent" },
          { label: "주제", value: topicText },
        ],
        tips: [
          "큰 태그만 반복하지 말고 세부 태그와 브랜드 태그를 섞어 테스트하세요.",
          "게시물마다 같은 태그 묶음을 그대로 반복하면 학습 데이터가 좁아질 수 있습니다.",
          "해시태그보다 첫 줄, 저장 가치, 이미지 품질이 먼저입니다.",
        ],
      };
    },
  },
  "hashtag-rotation-tracker": {
    id: "hashtag-rotation-tracker",
    buttonLabel: "로테이션 만들기",
    fields: [
      { key: "tags", label: "해시태그 목록", type: "textarea", placeholder: "#블로그SEO #콘텐츠마케팅 #크리에이터 #애드센스 #SNS마케팅" },
      { key: "groups", label: "그룹 수", type: "number", placeholder: "3" },
    ],
    run: ({ tags, groups }) => {
      const tagList = tags
        .split(/[\s,]+/)
        .map((tag) => tag.trim())
        .filter(Boolean)
        .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));
      const groupCount = Math.min(6, Math.max(2, Number(groups) || 3));
      const buckets = Array.from({ length: groupCount }, () => [] as string[]);
      tagList.forEach((tag, index) => buckets[index % groupCount].push(tag));
      const output = buckets
        .map((bucket, index) => `세트 ${index + 1}\n${bucket.join(" ") || "#태그를추가하세요"}`)
        .join("\n\n");

      return {
        summary: `${groupCount}개 해시태그 세트로 나눴습니다.`,
        output,
        metrics: [
          { label: "태그", value: `${tagList.length}개`, tone: "primary" },
          { label: "세트", value: `${groupCount}개`, tone: "accent" },
          { label: "평균", value: `${Math.ceil(tagList.length / groupCount)}개/세트` },
        ],
        tips: [
          "성과를 비교하려면 한 번에 너무 많은 변수를 바꾸지 마세요.",
          "각 세트에는 핵심 태그, 세부 태그, 브랜드 태그가 섞이도록 조정하세요.",
          "노출보다 저장, 공유, 프로필 방문 같은 실제 행동 지표를 함께 보세요.",
        ],
      };
    },
  },
  "social-bio-length-checker": {
    id: "social-bio-length-checker",
    buttonLabel: "프로필 소개 검사하기",
    fields: [
      { key: "bio", label: "프로필 소개", type: "textarea", placeholder: "무엇을 누구에게 제공하는지 적은 SNS 프로필 소개를 입력하세요." },
      { key: "limit", label: "글자 제한", type: "number", placeholder: "150" },
    ],
    run: ({ bio, limit }) => {
      const text = bio.trim().replace(/\s+/g, " ");
      const max = Math.min(300, Math.max(60, Number(limit) || 150));
      const hasAudience = /(위한|에게|대상|초보|마케터|크리에이터|블로거|사업자)/.test(text);
      const hasValue = /(도움|제공|정리|성장|수익|전환|자동화|가이드|체크)/.test(text);
      const hasCta = /(링크|문의|받기|확인|다운|구독|DM|프로필)/i.test(text);
      const lengthOk = text.length <= max;
      const score = (lengthOk ? 30 : 12) + (hasAudience ? 25 : 8) + (hasValue ? 25 : 8) + (hasCta ? 20 : 8);

      return {
        summary:
          score >= 80
            ? "대상, 제공 가치, 다음 행동이 비교적 선명한 프로필입니다."
            : "누구를 위한 계정인지와 다음 행동을 더 분명히 보강하세요.",
        output: [
          `길이: ${text.length}/${max}자`,
          `대상: ${hasAudience ? "있음" : "부족"}`,
          `제공 가치: ${hasValue ? "있음" : "부족"}`,
          `CTA: ${hasCta ? "있음" : "부족"}`,
        ].join("\n"),
        metrics: [
          { label: "점수", value: `${score}점`, tone: "primary" },
          { label: "길이", value: `${text.length}자`, tone: "accent" },
          { label: "제한", value: `${max}자` },
        ],
        tips: [
          "프로필 첫 줄에는 누구를 위한 계정인지 바로 보여주세요.",
          "제공 가치는 '팁 공유'보다 구체적인 결과로 적는 편이 좋습니다.",
          "마지막에는 링크 확인, DM, 무료 자료처럼 하나의 행동을 제안하세요.",
        ],
      };
    },
  },
  "creator-media-kit-checklist": {
    id: "creator-media-kit-checklist",
    buttonLabel: "미디어킷 체크하기",
    fields: [
      { key: "channels", label: "채널과 수치", type: "textarea", placeholder: "인스타그램 12,000 팔로워\n블로그 월 30,000 PV\n뉴스레터 2,000 구독자" },
      { key: "offer", label: "협업 제안", type: "textarea", placeholder: "브랜드 리뷰, 콘텐츠 제작, 공동 캠페인 등 가능한 협업 유형" },
    ],
    run: ({ channels, offer }) => {
      const channelLines = channels.split("\n").map((line) => line.trim()).filter(Boolean);
      const offerText = offer.trim();
      const hasNumbers = /[0-9]/.test(channels);
      const hasOffer = offerText.length >= 20;
      const hasChannels = channelLines.length >= 2;
      const score = (hasChannels ? 35 : 15) + (hasNumbers ? 30 : 8) + (hasOffer ? 35 : 12);
      const checklist = [
        `채널 요약: ${hasChannels ? "있음" : "보강 필요"}`,
        `성과 수치: ${hasNumbers ? "있음" : "보강 필요"}`,
        `협업 상품: ${hasOffer ? "있음" : "보강 필요"}`,
        "필수 구성: 소개, 타겟 독자, 채널 수치, 대표 콘텐츠, 협업 유형, 연락처",
        "권장 추가: 과거 협업 사례, 평균 조회수, 저장률, 클릭률, 제작 가능 포맷",
      ].join("\n");

      return {
        summary:
          score >= 80
            ? "협업 제안에 필요한 기본 미디어킷 정보가 갖춰져 있습니다."
            : "채널 수치, 타겟 독자, 협업 상품 설명을 더 구체화하세요.",
        output: checklist,
        metrics: [
          { label: "점수", value: `${score}점`, tone: "primary" },
          { label: "채널", value: `${channelLines.length}개`, tone: "accent" },
          { label: "수치", value: hasNumbers ? "있음" : "부족" },
        ],
        tips: [
          "브랜드 담당자는 팔로워 수보다 타겟 적합성과 평균 성과를 함께 봅니다.",
          "협업 유형은 가능한 산출물과 일정까지 구체적으로 적으면 좋습니다.",
          "연락처와 응답 가능 시간을 명확히 두면 협업 문의 전환이 좋아집니다.",
        ],
      };
    },
  },
  "collaboration-email-builder": {
    id: "collaboration-email-builder",
    buttonLabel: "협업 메일 만들기",
    fields: [
      { key: "brand", label: "브랜드/담당자", type: "text", placeholder: "예: 브랜드명 또는 담당자님" },
      { key: "creator", label: "내 채널 소개", type: "textarea", placeholder: "예: 블로그와 인스타그램에서 크리에이터 도구와 SEO 팁을 다룹니다." },
      { key: "offer", label: "제안 내용", type: "textarea", placeholder: "예: 제품 사용 경험 기반 리뷰 콘텐츠와 숏폼 2개 제작" },
    ],
    run: ({ brand, creator, offer }) => {
      const brandText = brand.trim() || "담당자님";
      const creatorText = creator.trim() || "저는 특정 독자층을 대상으로 실용 콘텐츠를 제작하는 크리에이터입니다.";
      const offerText = offer.trim() || "브랜드 메시지와 독자 니즈를 연결한 콘텐츠 협업을 제안드립니다.";
      const email = [
        `제목: ${brandText}와 함께할 콘텐츠 협업 제안드립니다`,
        "",
        `안녕하세요, ${brandText}.`,
        "",
        creatorText,
        "",
        "이번에 아래와 같은 협업을 제안드리고 싶습니다.",
        offerText,
        "",
        "협업 시 기대할 수 있는 부분은 다음과 같습니다.",
        "1. 실제 사용 맥락을 담은 자연스러운 콘텐츠",
        "2. 블로그/SNS 채널을 활용한 재활용 가능한 노출",
        "3. 결과 확인이 쉬운 링크와 CTA 구성",
        "",
        "검토 가능하시면 간단한 회신 부탁드립니다. 감사합니다.",
      ].join("\n");

      return {
        summary: "브랜드 담당자에게 보낼 협업 제안 메일 초안입니다.",
        output: email,
        metrics: [
          { label: "길이", value: `${email.length}자`, tone: "primary" },
          { label: "구성", value: "소개/제안/기대효과", tone: "accent" },
          { label: "대상", value: brandText },
        ],
        tips: [
          "첫 메일은 길게 설득하기보다 왜 적합한 협업인지 빠르게 보여주세요.",
          "채널 수치, 대표 콘텐츠, 예상 산출물을 구체적으로 넣으면 답장률이 좋아집니다.",
          "가격부터 앞세우기보다 협업 목적과 산출물 범위를 먼저 합의하세요.",
        ],
      };
    },
  },
  "comment-reply-template-builder": {
    id: "comment-reply-template-builder",
    buttonLabel: "댓글 답변 만들기",
    fields: [
      { key: "comment", label: "받은 댓글", type: "textarea", placeholder: "예: 이 방법은 초보자도 바로 적용할 수 있나요?" },
      { key: "tone", label: "톤", type: "text", placeholder: "예: 친절한 전문가, 짧고 따뜻하게" },
      { key: "nextAction", label: "다음 행동", type: "text", placeholder: "예: 관련 체크리스트 확인하기" },
    ],
    run: ({ comment, tone, nextAction }) => {
      const commentText = comment.trim() || "질문 주셔서 감사합니다.";
      const toneText = tone.trim() || "친절하게";
      const actionText = nextAction.trim() || "필요하면 관련 글도 함께 확인해 보세요.";
      const replies = [
        `${commentText}\n\n좋은 질문입니다. 핵심은 먼저 작은 기준부터 적용해보는 것입니다. ${actionText}`,
        `${toneText} 답변드리면, 처음에는 전부 완벽히 하려 하기보다 가장 영향이 큰 한 가지부터 확인하는 편이 좋습니다. ${actionText}`,
        `맞습니다. 이 부분에서 많이 막히는데요. 우선 현재 상태를 점검한 뒤 부족한 항목만 보강해보세요. ${actionText}`,
      ];

      return {
        summary: "상황별로 바로 다듬어 쓸 수 있는 댓글 답변 3개를 만들었습니다.",
        output: replies.map((reply, index) => `${index + 1}. ${reply}`).join("\n\n"),
        metrics: [
          { label: "답변", value: `${replies.length}개`, tone: "primary" },
          { label: "톤", value: toneText, tone: "accent" },
          { label: "CTA", value: nextAction.trim() ? "있음" : "기본" },
        ],
        tips: [
          "댓글 답변은 먼저 인정, 다음에 핵심 답변, 마지막에 추가 행동 순서가 자연스럽습니다.",
          "모든 댓글에 링크를 넣으면 홍보처럼 보일 수 있으니 필요한 경우에만 연결하세요.",
          "반복 질문은 FAQ나 블로그 글로 확장하면 콘텐츠 소재가 됩니다.",
        ],
      };
    },
  },
  "pinned-comment-cta-builder": {
    id: "pinned-comment-cta-builder",
    buttonLabel: "고정댓글 CTA 만들기",
    fields: [
      { key: "content", label: "게시물 내용", type: "textarea", placeholder: "게시물이나 영상의 핵심 내용을 입력하세요." },
      { key: "goal", label: "목표 행동", type: "text", placeholder: "예: 블로그 글 확인, 저장, 댓글 참여, 자료 다운로드" },
    ],
    run: ({ content, goal }) => {
      const topic = content.trim().split(/[.\n]/)[0]?.slice(0, 80) || "오늘 콘텐츠";
      const goalText = goal.trim() || "저장하고 필요할 때 다시 확인하기";
      const ctas = [
        `${topic}가 필요했다면 이 댓글을 저장해두세요. 다음 단계는 ${goalText}입니다.`,
        `핵심만 다시 정리하면: 지금 할 일은 ${goalText}. 놓치지 않게 고정해둡니다.`,
        `더 자세히 보고 싶다면 ${goalText}. 질문은 댓글로 남겨주세요.`,
        `이 콘텐츠가 도움 됐다면 저장 후 ${goalText}까지 이어가 보세요.`,
      ];

      return {
        summary: "게시물 목적에 맞는 고정댓글 CTA 후보를 만들었습니다.",
        output: ctas.map((cta, index) => `${index + 1}. ${cta}`).join("\n"),
        metrics: [
          { label: "CTA 후보", value: `${ctas.length}개`, tone: "primary" },
          { label: "목표", value: goalText, tone: "accent" },
          { label: "주제", value: topic },
        ],
        tips: [
          "고정댓글은 본문을 반복하기보다 다음 행동을 분명히 보여주는 역할이 좋습니다.",
          "하나의 댓글에 여러 행동을 요구하면 전환이 약해집니다.",
          "질문 유도형 CTA는 커뮤니티 반응을 만들 때 유용합니다.",
        ],
      };
    },
  },
  "content-repurpose-planner": {
    id: "content-repurpose-planner",
    buttonLabel: "재활용 계획 만들기",
    fields: [
      { key: "source", label: "원본 콘텐츠", type: "textarea", placeholder: "예: 블로그 SEO 체크리스트 글" },
      { key: "platforms", label: "재활용 플랫폼", type: "text", placeholder: "예: 인스타그램, 유튜브 쇼츠, 링크드인, 스레드" },
    ],
    run: ({ source, platforms }) => {
      const sourceText = source.trim() || "원본 콘텐츠";
      const platformList = (platforms.trim() || "인스타그램, 유튜브 쇼츠, 링크드인, 스레드")
        .split(/[,/]+/)
        .map((item) => item.trim())
        .filter(Boolean);
      const plans = platformList.map((platform) => {
        if (/쇼츠|릴스|short/i.test(platform)) return `${platform}: 핵심 3가지를 45초 대본과 자막 카드로 변환`;
        if (/인스타/i.test(platform)) return `${platform}: 체크리스트형 캐러셀 5장과 저장 CTA로 변환`;
        if (/링크드인/i.test(platform)) return `${platform}: 경험에서 얻은 기준 3가지 인사이트 글로 변환`;
        if (/스레드|x/i.test(platform)) return `${platform}: 번호가 붙은 5~7개 짧은 포스트로 분할`;
        return `${platform}: 핵심 요약, 예시, CTA를 플랫폼 문법에 맞게 재구성`;
      });

      return {
        summary: `${platformList.length}개 플랫폼용 콘텐츠 재활용 계획을 만들었습니다.`,
        output: [`원본: ${sourceText}`, "", ...plans].join("\n"),
        metrics: [
          { label: "플랫폼", value: `${platformList.length}개`, tone: "primary" },
          { label: "원본", value: sourceText.slice(0, 30), tone: "accent" },
          { label: "목적", value: "Repurpose" },
        ],
        tips: [
          "원본을 그대로 복사하지 말고 플랫폼마다 소비 방식에 맞게 구조를 바꾸세요.",
          "하나의 블로그 글은 캐러셀, 쇼츠, 스레드, 뉴스레터 소재로 나눌 수 있습니다.",
          "재활용 콘텐츠마다 원문 링크나 관련 도구 CTA를 자연스럽게 연결하세요.",
        ],
      };
    },
  },
  "publishing-calendar-planner": {
    id: "publishing-calendar-planner",
    buttonLabel: "발행 캘린더 만들기",
    fields: [
      { key: "themes", label: "콘텐츠 주제", type: "textarea", placeholder: "SEO 점검\nSNS 캡션\n애드센스 승인\n이미지 최적화" },
      { key: "days", label: "발행 일수", type: "number", placeholder: "14" },
    ],
    run: ({ themes, days }) => {
      const themeList = themes.split("\n").map((line) => line.trim()).filter(Boolean);
      const fallbackThemes = ["SEO 점검", "SNS 글쓰기", "콘텐츠 재활용", "크리에이터 도구"];
      const topics = themeList.length ? themeList : fallbackThemes;
      const totalDays = Math.min(30, Math.max(7, Number(days) || 14));
      const rows = Array.from({ length: totalDays }, (_, index) => {
        const topic = topics[index % topics.length];
        const format = ["블로그 글", "인스타그램", "쇼츠/릴스", "스레드"][index % 4];
        return `Day ${index + 1}: ${topic} - ${format} - CTA: 관련 도구 확인`;
      });

      return {
        summary: `${totalDays}일 콘텐츠 발행 캘린더 초안입니다.`,
        output: rows.join("\n"),
        metrics: [
          { label: "기간", value: `${totalDays}일`, tone: "primary" },
          { label: "주제", value: `${topics.length}개`, tone: "accent" },
          { label: "포맷", value: "4종 순환" },
        ],
        tips: [
          "같은 주제를 여러 포맷으로 재활용하면 제작 부담이 줄어듭니다.",
          "발행 캘린더에는 제작일, 검수일, 발행일을 분리해두는 편이 안전합니다.",
          "성과가 좋은 주제는 다음 주 캘린더에서 확장 콘텐츠로 이어가세요.",
        ],
      };
    },
  },
  "hook-strength-checker": {
    id: "hook-strength-checker",
    buttonLabel: "훅 강도 검사하기",
    fields: [
      { key: "hook", label: "훅 문장", type: "textarea", placeholder: "예: 블로그 SEO에서 초보자가 가장 많이 놓치는 3가지" },
      { key: "audience", label: "대상", type: "text", placeholder: "예: 애드센스 승인 준비 중인 블로거" },
    ],
    run: ({ hook, audience }) => {
      const text = hook.trim().replace(/\s+/g, " ");
      const audienceText = audience.trim();
      const hasAudience = audienceText ? text.includes(audienceText) || /(초보|블로거|크리에이터|마케터|사업자|운영자)/.test(text) : /(초보|블로거|크리에이터|마케터|사업자|운영자)/.test(text);
      const hasSpecific = /[0-9]|가지|단계|체크|전후|실수|비교/.test(text);
      const hasTension = /(놓치|실수|막히|손해|어렵|왜|문제|주의|전)/.test(text);
      const lengthOk = text.length >= 18 && text.length <= 55;
      const score = (lengthOk ? 25 : 10) + (hasAudience ? 25 : 8) + (hasSpecific ? 25 : 8) + (hasTension ? 25 : 8);

      return {
        summary:
          score >= 80
            ? "멈춰 볼 이유가 비교적 분명한 훅 문장입니다."
            : "대상, 구체성, 긴장 요소를 더 앞쪽에 보강하세요.",
        output: [
          `대상 신호: ${hasAudience ? "있음" : "부족"}`,
          `구체성: ${hasSpecific ? "있음" : "부족"}`,
          `긴장/문제: ${hasTension ? "있음" : "부족"}`,
          `권장 리라이트: ${audienceText || "타겟 독자"}가 놓치기 쉬운 ${text || "핵심 주제"} 체크 포인트`,
        ].join("\n"),
        metrics: [
          { label: "점수", value: `${score}점`, tone: "primary" },
          { label: "길이", value: `${text.length}자`, tone: "accent" },
          { label: "대상", value: audienceText || "자동 판단" },
        ],
        tips: [
          "훅은 주제 소개보다 시청자가 겪는 문제를 먼저 보여줄 때 강해집니다.",
          "숫자, 실수, 체크리스트, 전후 변화는 정보형 콘텐츠 훅에 잘 맞습니다.",
          "영상이나 본문에서 바로 증명할 수 없는 과장형 훅은 피하세요.",
        ],
      };
    },
  },
  "caption-line-break-cleaner": {
    id: "caption-line-break-cleaner",
    buttonLabel: "줄바꿈 정리하기",
    fields: [
      { key: "caption", label: "캡션", type: "textarea", placeholder: "인스타그램이나 SNS 캡션을 붙여넣으세요." },
      { key: "maxLine", label: "권장 줄 길이", type: "number", placeholder: "34" },
    ],
    run: ({ caption, maxLine }) => {
      const max = Math.min(80, Math.max(18, Number(maxLine) || 34));
      const words = caption.trim().replace(/\s+/g, " ").split(" ").filter(Boolean);
      const lines: string[] = [];
      let current = "";
      for (const word of words) {
        if ((current ? `${current} ${word}` : word).length <= max) {
          current = current ? `${current} ${word}` : word;
        } else {
          if (current) lines.push(current);
          current = word;
        }
      }
      if (current) lines.push(current);
      const paragraphs = lines.reduce<string[]>((acc, line, index) => {
        acc.push(line);
        if ((index + 1) % 3 === 0) acc.push("");
        return acc;
      }, []);
      const output = paragraphs.join("\n").trim();

      return {
        summary: `${lines.length}줄로 캡션 줄바꿈을 정리했습니다.`,
        output,
        metrics: [
          { label: "줄 수", value: `${lines.length}줄`, tone: "primary" },
          { label: "권장 길이", value: `${max}자`, tone: "accent" },
          { label: "원문 길이", value: `${caption.trim().length}자` },
        ],
        tips: [
          "모바일 캡션은 한 줄이 길면 읽기 어렵습니다.",
          "3줄 단위로 빈 줄을 넣으면 정보형 캡션을 스캔하기 쉬워집니다.",
          "첫 줄과 마지막 CTA는 따로 분리하면 행동 유도가 더 선명합니다.",
        ],
      };
    },
  },
  "emoji-density-checker": {
    id: "emoji-density-checker",
    buttonLabel: "이모지 밀도 검사하기",
    fields: [
      { key: "text", label: "SNS 문구", type: "textarea", placeholder: "검사할 캡션이나 프로필 문구를 붙여넣으세요." },
    ],
    run: ({ text }) => {
      const body = text.trim();
      const emojiMatches = body.match(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu) ?? [];
      const emojiCount = emojiMatches.length;
      const plainLength = body.replace(/\s/g, "").length;
      const density = plainLength ? (emojiCount / plainLength) * 100 : 0;
      const score = density <= 2.5 ? 90 : density <= 5 ? 70 : density <= 8 ? 50 : 30;

      return {
        summary:
          score >= 80
            ? "이모지 사용량이 과하지 않은 편입니다."
            : "이모지가 많아 핵심 문구의 가독성을 해칠 수 있습니다.",
        output: [
          `이모지 수: ${emojiCount}개`,
          `공백 제외 글자수: ${plainLength}자`,
          `이모지 밀도: ${density.toFixed(2)}%`,
          `권장: 강조용 이모지는 문단당 0~1개 정도로 제한`,
        ].join("\n"),
        metrics: [
          { label: "점수", value: `${score}점`, tone: "primary" },
          { label: "이모지", value: `${emojiCount}개`, tone: "accent" },
          { label: "밀도", value: `${density.toFixed(2)}%` },
        ],
        tips: [
          "이모지는 구조를 돕는 용도로 쓰고, 문장마다 반복하지 않는 편이 좋습니다.",
          "브랜드가 전문적인 톤이라면 이모지를 더 적게 쓰는 것이 안전합니다.",
          "중요한 CTA는 이모지보다 명확한 동사로 전달하세요.",
        ],
      };
    },
  },
  "sns-cta-library-builder": {
    id: "sns-cta-library-builder",
    buttonLabel: "CTA 라이브러리 만들기",
    fields: [
      { key: "goal", label: "목표 행동", type: "text", placeholder: "예: 저장, 댓글, 프로필 링크 클릭, 블로그 방문" },
      { key: "topic", label: "콘텐츠 주제", type: "text", placeholder: "예: 블로그 SEO 체크리스트" },
    ],
    run: ({ goal, topic }) => {
      const goalText = goal.trim() || "저장";
      const topicText = topic.trim() || "이 콘텐츠";
      const ctas = [
        `${topicText}가 필요하다면 지금 ${goalText}해두세요.`,
        `나중에 다시 볼 수 있게 ${goalText}해두면 좋습니다.`,
        `다음 단계가 필요하다면 프로필 링크에서 ${topicText} 자료를 확인하세요.`,
        `이 기준이 도움 됐다면 댓글로 지금 막힌 부분을 남겨주세요.`,
        `${topicText}를 적용하기 전 체크리스트처럼 다시 확인해보세요.`,
        `비슷한 주제를 더 보고 싶다면 팔로우하고 다음 글도 확인하세요.`,
      ];

      return {
        summary: `${ctas.length}개의 SNS CTA 문구를 만들었습니다.`,
        output: ctas.map((cta, index) => `${index + 1}. ${cta}`).join("\n"),
        metrics: [
          { label: "CTA", value: `${ctas.length}개`, tone: "primary" },
          { label: "목표", value: goalText, tone: "accent" },
          { label: "주제", value: topicText },
        ],
        tips: [
          "CTA는 한 게시물에 하나의 행동만 분명히 요청하는 편이 좋습니다.",
          "저장형 콘텐츠는 '나중에 다시 보기' 이유를 함께 적으세요.",
          "링크 클릭 CTA는 링크에서 얻을 결과를 구체적으로 보여줘야 합니다.",
        ],
      };
    },
  },
  "image-aspect-ratio-checker": {
    id: "image-aspect-ratio-checker",
    buttonLabel: "비율 계산하기",
    fields: [
      { key: "width", label: "가로(px)", type: "number", placeholder: "1080" },
      { key: "height", label: "세로(px)", type: "number", placeholder: "1350" },
    ],
    run: ({ width, height }) => {
      const w = Math.max(1, Number(width) || 1080);
      const h = Math.max(1, Number(height) || 1350);
      const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
      const divisor = gcd(w, h);
      const ratioW = Math.round(w / divisor);
      const ratioH = Math.round(h / divisor);
      const decimal = w / h;
      const presets = [
        { name: "Instagram portrait", ratio: 4 / 5 },
        { name: "Square", ratio: 1 },
        { name: "Story/Reels", ratio: 9 / 16 },
        { name: "YouTube thumbnail", ratio: 16 / 9 },
        { name: "OG image", ratio: 1.91 },
      ];
      const nearest = presets.reduce((best, item) =>
        Math.abs(item.ratio - decimal) < Math.abs(best.ratio - decimal) ? item : best,
      );

      return {
        summary: `이미지 비율은 ${ratioW}:${ratioH}입니다.`,
        output: [
          `입력 크기: ${w} x ${h}px`,
          `간단 비율: ${ratioW}:${ratioH}`,
          `소수 비율: ${decimal.toFixed(3)}`,
          `가장 가까운 프리셋: ${nearest.name}`,
        ].join("\n"),
        metrics: [
          { label: "비율", value: `${ratioW}:${ratioH}`, tone: "primary" },
          { label: "크기", value: `${w}x${h}`, tone: "accent" },
          { label: "프리셋", value: nearest.name },
        ],
        tips: [
          "인스타그램 세로형 피드는 4:5, 릴스와 스토리는 9:16이 일반적입니다.",
          "OG 이미지는 보통 1200x630에 가까운 1.91:1 비율을 사용합니다.",
          "업로드 전 플랫폼별 안전 영역에 텍스트가 잘리지 않는지 확인하세요.",
        ],
      };
    },
  },
  "thumbnail-size-planner": {
    id: "thumbnail-size-planner",
    buttonLabel: "썸네일 크기 설계하기",
    fields: [
      { key: "platform", label: "플랫폼", type: "text", placeholder: "예: YouTube, Instagram, Blog, OG" },
      { key: "title", label: "썸네일 문구", type: "textarea", placeholder: "예: 블로그 SEO 체크리스트 7가지" },
    ],
    run: ({ platform, title }) => {
      const platformText = platform.trim().toLowerCase();
      const titleText = title.trim().replace(/\s+/g, " ");
      const presets = [
        { key: "youtube", name: "YouTube thumbnail", size: "1280 x 720", ratio: "16:9", safe: "중앙 80% 안에 얼굴과 핵심 문구 배치" },
        { key: "instagram", name: "Instagram feed portrait", size: "1080 x 1350", ratio: "4:5", safe: "상하 여백 120px 이상 확보" },
        { key: "reels", name: "Reels/Story cover", size: "1080 x 1920", ratio: "9:16", safe: "중앙 1080 x 1350 영역에 핵심 정보 배치" },
        { key: "blog", name: "Blog hero image", size: "1200 x 675", ratio: "16:9", safe: "모바일 크롭을 고려해 중앙에 제목 배치" },
        { key: "og", name: "Open Graph image", size: "1200 x 630", ratio: "1.91:1", safe: "좌우 80px 이상 여백 확보" },
      ];
      const selected = presets.find((item) => platformText.includes(item.key)) ?? presets[0];
      const titleOk = titleText.length <= 34;

      return {
        summary: `${selected.name} 기준 썸네일 설계안입니다.`,
        output: [
          `권장 크기: ${selected.size}`,
          `비율: ${selected.ratio}`,
          `안전 영역: ${selected.safe}`,
          `문구 길이: ${titleText.length}자 (${titleOk ? "적정" : "축약 권장"})`,
          `권장 문구: ${titleOk ? titleText || "핵심 문구를 입력하세요" : `${titleText.slice(0, 30)}...`}`,
        ].join("\n"),
        metrics: [
          { label: "크기", value: selected.size, tone: "primary" },
          { label: "비율", value: selected.ratio, tone: "accent" },
          { label: "문구", value: `${titleText.length}자` },
        ],
        tips: [
          "썸네일 문구는 작은 화면에서도 읽히도록 2~6단어 안에서 정리하세요.",
          "얼굴, 제품, 결과 화면 중 하나는 첫눈에 보이게 두는 편이 좋습니다.",
          "플랫폼 크롭 영역 때문에 핵심 문구를 가장자리 가까이에 두지 마세요.",
        ],
      };
    },
  },
  "filename-seo-cleaner": {
    id: "filename-seo-cleaner",
    buttonLabel: "파일명 정리하기",
    fields: [
      { key: "filename", label: "파일명", type: "textarea", placeholder: "예: 블로그 SEO 체크리스트 최종본 (1).png" },
      { key: "keyword", label: "핵심 키워드", type: "text", placeholder: "예: blog-seo-checklist" },
    ],
    run: ({ filename, keyword }) => {
      const raw = filename.trim() || keyword.trim() || "image file";
      const extensionMatch = raw.match(/\.([a-z0-9]{2,5})$/i);
      const extension = extensionMatch ? extensionMatch[1].toLowerCase() : "webp";
      const base = raw.replace(/\.[a-z0-9]{2,5}$/i, "");
      const seed = keyword.trim() || base;
      const cleaned = seed
        .normalize("NFKD")
        .replace(/[^\w\s-가-힣]/g, " ")
        .replace(/[가-힣]+/g, "")
        .trim()
        .toLowerCase()
        .replace(/[_\s]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") || "optimized-image";
      const output = `${cleaned}.${extension}`;

      return {
        summary: "읽기 쉬운 영문 소문자 파일명으로 정리했습니다.",
        output,
        metrics: [
          { label: "길이", value: `${output.length}자`, tone: "primary" },
          { label: "확장자", value: extension, tone: "accent" },
          { label: "형식", value: "lowercase-kebab" },
        ],
        tips: [
          "이미지 파일명은 의미 없는 숫자보다 주제를 알 수 있는 영문 단어가 좋습니다.",
          "공백, 괄호, 특수문자는 업로드 환경에 따라 문제가 될 수 있어 피하세요.",
          "Alt Text와 파일명은 같은 역할이 아니므로 둘 다 별도로 관리하세요.",
        ],
      };
    },
  },
  "batch-filename-planner": {
    id: "batch-filename-planner",
    buttonLabel: "일괄 파일명 만들기",
    fields: [
      { key: "prefix", label: "접두어", type: "text", placeholder: "예: blog-seo-checklist" },
      { key: "items", label: "파일 설명 목록", type: "textarea", placeholder: "hero image\nh tag example\nmeta description preview" },
      { key: "extension", label: "확장자", type: "text", placeholder: "webp" },
    ],
    run: ({ prefix, items, extension }) => {
      const cleanPart = (value: string) =>
        value
          .trim()
          .toLowerCase()
          .replace(/[^\w\s-]/g, " ")
          .replace(/[_\s]+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
      const prefixText = cleanPart(prefix) || "asset";
      const ext = (extension.trim().replace(/^\./, "").toLowerCase() || "webp").replace(/[^a-z0-9]/g, "") || "webp";
      const lines = items.split("\n").map((line) => line.trim()).filter(Boolean);
      const names = (lines.length ? lines : ["hero", "thumbnail", "detail"]).map((line, index) => {
        const suffix = cleanPart(line) || `image-${index + 1}`;
        return `${prefixText}-${String(index + 1).padStart(2, "0")}-${suffix}.${ext}`;
      });

      return {
        summary: `${names.length}개의 일괄 파일명을 생성했습니다.`,
        output: names.join("\n"),
        metrics: [
          { label: "파일명", value: `${names.length}개`, tone: "primary" },
          { label: "확장자", value: ext, tone: "accent" },
          { label: "접두어", value: prefixText },
        ],
        tips: [
          "일괄 파일명은 같은 접두어와 순번을 쓰면 관리가 쉽습니다.",
          "파일 설명은 이미지 내용이 드러나게 짧은 영문 단어로 정리하세요.",
          "업로드 후 Alt Text는 파일명과 별도로 페이지 맥락에 맞게 작성하세요.",
        ],
      };
    },
  },
  "image-compression-savings-calculator": {
    id: "image-compression-savings-calculator",
    buttonLabel: "절감량 계산하기",
    fields: [
      { key: "before", label: "압축 전 용량(KB)", type: "number", placeholder: "850" },
      { key: "after", label: "압축 후 용량(KB)", type: "number", placeholder: "240" },
      { key: "count", label: "이미지 개수", type: "number", placeholder: "12" },
    ],
    run: ({ before, after, count }) => {
      const beforeKb = Math.max(0, Number(before) || 0);
      const afterKb = Math.max(0, Number(after) || 0);
      const imageCount = Math.max(1, Number(count) || 1);
      const savedPerImage = Math.max(0, beforeKb - afterKb);
      const savedTotal = savedPerImage * imageCount;
      const percent = beforeKb ? (savedPerImage / beforeKb) * 100 : 0;

      return {
        summary: `이미지당 약 ${percent.toFixed(1)}% 용량을 줄였습니다.`,
        output: [
          `이미지당 절감: ${savedPerImage.toLocaleString()}KB`,
          `총 절감: ${savedTotal.toLocaleString()}KB (${(savedTotal / 1024).toFixed(2)}MB)`,
          `절감률: ${percent.toFixed(1)}%`,
          `페이지 이미지 ${imageCount}개 기준 예상 전송량 감소`,
        ].join("\n"),
        metrics: [
          { label: "절감률", value: `${percent.toFixed(1)}%`, tone: "primary" },
          { label: "총 절감", value: `${(savedTotal / 1024).toFixed(2)}MB`, tone: "accent" },
          { label: "이미지", value: `${imageCount}개` },
        ],
        tips: [
          "큰 이미지는 WebP/AVIF 변환과 실제 표시 크기 리사이즈를 함께 적용하세요.",
          "본문 이미지는 품질 70~85 사이에서 먼저 테스트하면 무난합니다.",
          "용량 절감은 Core Web Vitals와 모바일 체감 속도 개선에 직접 도움이 됩니다.",
        ],
      };
    },
  },
  "og-image-text-checker": {
    id: "og-image-text-checker",
    buttonLabel: "OG 문구 검사하기",
    fields: [
      { key: "text", label: "OG 이미지 문구", type: "textarea", placeholder: "예: 블로그 SEO 체크리스트 7가지" },
      { key: "brand", label: "브랜드명", type: "text", placeholder: "예: 크레피카" },
    ],
    run: ({ text, brand }) => {
      const cleanText = text.trim().replace(/\s+/g, " ");
      const brandText = brand.trim();
      const hasBrand = brandText ? cleanText.includes(brandText) : false;
      const lengthOk = cleanText.length >= 8 && cleanText.length <= 42;
      const hasSpecific = /[0-9]|체크|가이드|비교|방법|전략|리스트/.test(cleanText);
      const score = (lengthOk ? 40 : 18) + (hasSpecific ? 30 : 12) + (brandText ? (hasBrand ? 20 : 8) : 15) + (!/[!?]{2,}/.test(cleanText) ? 10 : 4);

      return {
        summary:
          score >= 80
            ? "공유 이미지에서 읽히기 좋은 OG 문구입니다."
            : "문구 길이, 구체성, 브랜드 표시를 더 다듬으세요.",
        output: [
          `문구 길이: ${cleanText.length}자`,
          `구체성: ${hasSpecific ? "있음" : "부족"}`,
          `브랜드 표시: ${brandText ? (hasBrand ? "있음" : "부족") : "미입력"}`,
          `권장: 핵심 결과를 1줄, 브랜드는 작게 보조 배치`,
        ].join("\n"),
        metrics: [
          { label: "점수", value: `${score}점`, tone: "primary" },
          { label: "길이", value: `${cleanText.length}자`, tone: "accent" },
          { label: "브랜드", value: brandText || "미입력" },
        ],
        tips: [
          "OG 이미지는 작은 미리보기에서도 읽히므로 문구를 짧게 유지하세요.",
          "제목 전체를 넣기보다 클릭 이유가 되는 핵심 결과만 남기세요.",
          "브랜드명은 문구를 방해하지 않게 작게 보조 배치하는 편이 좋습니다.",
        ],
      };
    },
  },
  "color-contrast-checker": {
    id: "color-contrast-checker",
    buttonLabel: "대비 검사하기",
    fields: [
      { key: "foreground", label: "글자색 HEX", type: "text", placeholder: "#ffffff" },
      { key: "background", label: "배경색 HEX", type: "text", placeholder: "#0f172a" },
    ],
    run: ({ foreground, background }) => {
      const normalizeHex = (value: string) => {
        const raw = value.trim().replace(/^#/, "");
        if (/^[0-9a-f]{3}$/i.test(raw)) return raw.split("").map((char) => char + char).join("");
        if (/^[0-9a-f]{6}$/i.test(raw)) return raw;
        return "000000";
      };
      const toRgb = (hex: string) => {
        const value = normalizeHex(hex);
        return [0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16));
      };
      const luminance = ([r, g, b]: number[]) => {
        const values = [r, g, b].map((channel) => {
          const normalized = channel / 255;
          return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
        });
        return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
      };
      const fg = toRgb(foreground || "#ffffff");
      const bg = toRgb(background || "#0f172a");
      const lighter = Math.max(luminance(fg), luminance(bg));
      const darker = Math.min(luminance(fg), luminance(bg));
      const ratio = (lighter + 0.05) / (darker + 0.05);
      const aaNormal = ratio >= 4.5;
      const aaLarge = ratio >= 3;

      return {
        summary: aaNormal ? "본문 텍스트에도 사용할 수 있는 색상 대비입니다." : "본문 텍스트에는 대비가 부족합니다.",
        output: [
          `대비율: ${ratio.toFixed(2)}:1`,
          `일반 텍스트 WCAG AA: ${aaNormal ? "통과" : "미달"}`,
          `큰 텍스트 WCAG AA: ${aaLarge ? "통과" : "미달"}`,
          `입력 색상: #${normalizeHex(foreground || "#ffffff")} / #${normalizeHex(background || "#0f172a")}`,
        ].join("\n"),
        metrics: [
          { label: "대비율", value: `${ratio.toFixed(2)}:1`, tone: "primary" },
          { label: "일반 텍스트", value: aaNormal ? "통과" : "미달", tone: aaNormal ? "accent" : "muted" },
          { label: "큰 텍스트", value: aaLarge ? "통과" : "미달" },
        ],
        tips: [
          "본문과 버튼 텍스트는 4.5:1 이상을 목표로 잡으세요.",
          "작은 보조 텍스트는 색이 예뻐도 모바일에서 읽기 어려울 수 있습니다.",
          "CTA 버튼은 브랜드 컬러보다 가독성과 클릭 가능성이 먼저입니다.",
        ],
      };
    },
  },
  "brand-color-palette-notes": {
    id: "brand-color-palette-notes",
    buttonLabel: "컬러 메모 만들기",
    fields: [
      { key: "brand", label: "브랜드/사이트명", type: "text", placeholder: "예: 크레피카" },
      { key: "colors", label: "컬러 HEX 목록", type: "textarea", placeholder: "#0ea5e9\n#f97316\n#111827" },
      { key: "tone", label: "원하는 인상", type: "text", placeholder: "예: 실용적, 신뢰감, 빠른 제작" },
    ],
    run: ({ brand, colors, tone }) => {
      const palette = colors
        .split(/\s|,|\n/)
        .map((color) => color.trim())
        .filter(Boolean)
        .map((color) => (color.startsWith("#") ? color : `#${color}`))
        .filter((color) => /^#[0-9a-f]{3,6}$/i.test(color));
      const selected = palette.length ? palette.slice(0, 5) : ["#0ea5e9", "#f97316", "#111827"];
      const roles = ["Primary", "Accent", "Text", "Surface", "Border"];
      const notes = selected.map((color, index) => `${roles[index] ?? `Color ${index + 1}`}: ${color}`);

      return {
        summary: `${brand.trim() || "브랜드"} 팔레트 운영 메모를 생성했습니다.`,
        output: [
          `브랜드: ${brand.trim() || "미입력"}`,
          `인상: ${tone.trim() || "명확하고 실용적인 톤"}`,
          "",
          ...notes,
          "",
          "운영 메모:",
          "- Primary는 CTA와 핵심 상태에만 제한적으로 사용",
          "- Accent는 강조 배지, 링크 보조, 데이터 하이라이트에 사용",
          "- Text/Surface는 대비 검사를 통과하는 조합으로 고정",
        ].join("\n"),
        metrics: [
          { label: "컬러", value: `${selected.length}개`, tone: "primary" },
          { label: "주요색", value: selected[0], tone: "accent" },
          { label: "브랜드", value: brand.trim() || "미입력" },
        ],
        tips: [
          "팔레트는 색을 많이 쓰는 것보다 역할을 고정하는 것이 중요합니다.",
          "브랜드 컬러와 CTA 컬러가 같다면 보조색으로 상태 정보를 분리하세요.",
          "본문 영역은 팔레트보다 대비와 여백이 더 큰 영향을 줍니다.",
        ],
      };
    },
  },
  "svg-data-uri-encoder": {
    id: "svg-data-uri-encoder",
    buttonLabel: "Data URI 만들기",
    fields: [
      { key: "svg", label: "SVG 코드", type: "textarea", placeholder: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"></svg>" },
    ],
    run: ({ svg }) => {
      const source = svg.trim();
      const compact = source
        .replace(/\s+/g, " ")
        .replace(/>\s+</g, "><")
        .trim();
      const encoded = `data:image/svg+xml,${encodeURIComponent(compact)
        .replace(/'/g, "%27")
        .replace(/"/g, "%22")}`;
      const savings = source.length ? Math.max(0, source.length - encoded.length) : 0;

      return {
        summary: "CSS와 HTML에서 사용할 수 있는 SVG Data URI를 만들었습니다.",
        output: encoded,
        metrics: [
          { label: "원본", value: `${source.length}자`, tone: "primary" },
          { label: "URI", value: `${encoded.length}자`, tone: "accent" },
          { label: "압축차", value: `${savings}자` },
        ],
        tips: [
          "Data URI는 작은 아이콘이나 패턴에 적합하고 큰 SVG에는 비효율적일 수 있습니다.",
          "외부 SVG를 붙여 넣기 전에 불필요한 script, event handler, metadata를 제거하세요.",
          "반복 사용되는 큰 아이콘은 파일로 분리하는 편이 캐시에 유리합니다.",
        ],
      };
    },
  },
  "base64-image-size-estimator": {
    id: "base64-image-size-estimator",
    buttonLabel: "Base64 용량 계산하기",
    fields: [
      { key: "sizeKb", label: "원본 이미지 용량(KB)", type: "number", placeholder: "120" },
      { key: "count", label: "삽입 개수", type: "number", placeholder: "3" },
    ],
    run: ({ sizeKb, count }) => {
      const originalKb = Math.max(0, Number(sizeKb) || 0);
      const itemCount = Math.max(1, Number(count) || 1);
      const base64Kb = originalKb * 1.37;
      const overheadKb = Math.max(0, base64Kb - originalKb);
      const totalKb = base64Kb * itemCount;

      return {
        summary: `Base64 인라인 변환 시 약 ${(overheadKb * itemCount).toFixed(1)}KB가 추가될 수 있습니다.`,
        output: [
          `이미지당 원본: ${originalKb.toFixed(1)}KB`,
          `이미지당 Base64 예상: ${base64Kb.toFixed(1)}KB`,
          `이미지당 증가분: ${overheadKb.toFixed(1)}KB`,
          `총 예상 용량: ${totalKb.toFixed(1)}KB (${(totalKb / 1024).toFixed(2)}MB)`,
        ].join("\n"),
        metrics: [
          { label: "증가율", value: "약 37%", tone: "primary" },
          { label: "총 용량", value: `${(totalKb / 1024).toFixed(2)}MB`, tone: "accent" },
          { label: "개수", value: `${itemCount}개` },
        ],
        tips: [
          "Base64는 네트워크 요청을 줄이지만 파일 크기와 캐시 효율을 악화시킬 수 있습니다.",
          "작은 아이콘은 인라인이 유리할 수 있지만 본문 이미지는 파일로 두는 편이 안전합니다.",
          "반복 노출되는 이미지는 별도 파일로 캐시되게 구성하세요.",
        ],
      };
    },
  },
  "exif-privacy-checklist": {
    id: "exif-privacy-checklist",
    buttonLabel: "EXIF 위험 점검하기",
    fields: [
      { key: "source", label: "이미지 출처/촬영 상황", type: "textarea", placeholder: "예: 스마트폰으로 사무실에서 촬영한 제품 사진" },
      { key: "useCase", label: "공개 위치", type: "text", placeholder: "예: 블로그 본문, SNS, 포트폴리오" },
    ],
    run: ({ source, useCase }) => {
      const text = `${source} ${useCase}`.toLowerCase();
      const riskWords = ["집", "자택", "사무실", "아이", "위치", "gps", "학교", "차량", "주소", "스마트폰"];
      const hits = riskWords.filter((word) => text.includes(word));
      const score = Math.max(20, 100 - hits.length * 12);
      const risk = score >= 80 ? "낮음" : score >= 55 ? "보통" : "높음";

      return {
        summary: `EXIF 개인정보 노출 위험은 ${risk} 수준입니다.`,
        output: [
          `위험 키워드: ${hits.length ? hits.join(", ") : "없음"}`,
          `공개 위치: ${useCase.trim() || "미입력"}`,
          "",
          "게시 전 체크:",
          "- GPS 위치 정보 제거",
          "- 촬영 기기/시간 정보 제거",
          "- 얼굴, 주소, 차량번호, 문서 내용 흐림 처리",
          "- 압축/변환 후 메타데이터가 다시 남았는지 확인",
        ].join("\n"),
        metrics: [
          { label: "위험도", value: risk, tone: "primary" },
          { label: "점수", value: `${score}점`, tone: "accent" },
          { label: "키워드", value: `${hits.length}개` },
        ],
        tips: [
          "스마트폰 원본 사진은 GPS와 촬영 기기 정보가 남을 수 있습니다.",
          "업로드 전 이미지 압축 도구나 편집 도구에서 메타데이터 제거 옵션을 확인하세요.",
          "개인 장소, 아이, 고객 정보가 보이는 이미지는 공개 전 한 번 더 확대해서 보세요.",
        ],
      };
    },
  },
  "image-alt-batch-planner": {
    id: "image-alt-batch-planner",
    buttonLabel: "Alt 일괄 설계하기",
    fields: [
      { key: "topic", label: "페이지 주제", type: "text", placeholder: "예: 블로그 SEO 체크리스트" },
      { key: "images", label: "이미지 설명 목록", type: "textarea", placeholder: "검색 결과 미리보기 화면\nH태그 구조 예시\n메타 설명 작성 화면" },
    ],
    run: ({ topic, images }) => {
      const topicText = topic.trim() || "페이지 주제";
      const lines = images.split("\n").map((line) => line.trim()).filter(Boolean);
      const altTexts = (lines.length ? lines : ["대표 이미지", "본문 예시 이미지", "결과 화면"]).map((line, index) => {
        const clean = line.replace(/\s+/g, " ");
        return `${index + 1}. ${topicText} - ${clean}을 보여주는 이미지`;
      });
      const averageLength = Math.round(altTexts.join("").length / altTexts.length);

      return {
        summary: `${altTexts.length}개의 이미지 Alt Text 초안을 만들었습니다.`,
        output: altTexts.join("\n"),
        metrics: [
          { label: "Alt", value: `${altTexts.length}개`, tone: "primary" },
          { label: "평균 길이", value: `${averageLength}자`, tone: "accent" },
          { label: "주제", value: topicText },
        ],
        tips: [
          "Alt Text는 키워드 반복보다 이미지가 전달하는 정보를 설명해야 합니다.",
          "장식 이미지는 빈 alt를 쓰고, 의미 있는 이미지만 설명을 작성하세요.",
          "같은 이미지를 여러 페이지에서 쓸 때도 페이지 맥락에 맞게 문구를 조정하세요.",
        ],
      };
    },
  },
  "favicon-checklist-builder": {
    id: "favicon-checklist-builder",
    buttonLabel: "파비콘 체크리스트 만들기",
    fields: [
      { key: "brand", label: "브랜드/사이트명", type: "text", placeholder: "예: 크레피카" },
      { key: "source", label: "원본 로고 상태", type: "textarea", placeholder: "예: SVG 로고 있음, 어두운 배경에서 잘 보임, 작은 크기 테스트 필요" },
    ],
    run: ({ brand, source }) => {
      const brandText = brand.trim() || "사이트";
      const sourceText = source.trim() || "원본 로고 확인 필요";
      const checklist = [
        "16x16 favicon.ico 또는 PNG 확인",
        "32x32 브라우저 탭 아이콘 확인",
        "180x180 Apple touch icon 확인",
        "192x192 및 512x512 PWA 아이콘 확인",
        "밝은/어두운 브라우저 탭에서 식별성 확인",
        "로고 주변 투명 여백 과다 여부 확인",
      ];

      return {
        summary: `${brandText} 파비콘 준비 체크리스트를 생성했습니다.`,
        output: [`브랜드: ${brandText}`, `원본 상태: ${sourceText}`, "", ...checklist.map((item) => `- ${item}`)].join("\n"),
        metrics: [
          { label: "항목", value: `${checklist.length}개`, tone: "primary" },
          { label: "브랜드", value: brandText, tone: "accent" },
          { label: "상태", value: sourceText.length > 20 ? "메모 있음" : "간단" },
        ],
        tips: [
          "파비콘은 로고 전체보다 단순한 심볼이 작은 크기에서 더 잘 보입니다.",
          "배경색이 투명한 경우 다크 모드 탭에서도 식별되는지 확인하세요.",
          "사이트맵이나 SEO보다 먼저 브라우저 탭에서 브랜드 인식이 되는지 보는 것이 실용적입니다.",
        ],
      };
    },
  },
  "open-graph-image-checklist": {
    id: "open-graph-image-checklist",
    buttonLabel: "OG 이미지 점검하기",
    fields: [
      { key: "width", label: "가로(px)", type: "number", placeholder: "1200" },
      { key: "height", label: "세로(px)", type: "number", placeholder: "630" },
      { key: "text", label: "이미지 안 문구", type: "textarea", placeholder: "블로그 SEO 체크리스트 7가지" },
    ],
    run: ({ width, height, text }) => {
      const w = Math.max(1, Number(width) || 1200);
      const h = Math.max(1, Number(height) || 630);
      const ratio = w / h;
      const ratioOk = Math.abs(ratio - 1.91) < 0.12;
      const sizeOk = w >= 1200 && h >= 630;
      const textLength = text.trim().replace(/\s+/g, " ").length;
      const textOk = textLength > 0 && textLength <= 42;
      const score = (ratioOk ? 35 : 15) + (sizeOk ? 30 : 12) + (textOk ? 25 : 10) + 10;

      return {
        summary: score >= 80 ? "공유용 OG 이미지 기준에 잘 맞습니다." : "크기, 비율, 문구 길이를 더 다듬으세요.",
        output: [
          `크기: ${w} x ${h}`,
          `비율: ${ratio.toFixed(2)}:1 (${ratioOk ? "권장 범위" : "조정 권장"})`,
          `최소 크기: ${sizeOk ? "통과" : "1200x630 이상 권장"}`,
          `문구 길이: ${textLength}자 (${textOk ? "적정" : "축약 권장"})`,
        ].join("\n"),
        metrics: [
          { label: "점수", value: `${score}점`, tone: "primary" },
          { label: "비율", value: `${ratio.toFixed(2)}:1`, tone: "accent" },
          { label: "문구", value: `${textLength}자` },
        ],
        tips: [
          "OG 이미지는 1200x630에 가까운 1.91:1 비율이 가장 무난합니다.",
          "핵심 문구는 중앙에 두고 가장자리에는 중요한 정보를 배치하지 마세요.",
          "카카오톡, X, 링크드인처럼 공유 환경별 미리보기를 한 번씩 확인하세요.",
        ],
      };
    },
  },
  "file-size-unit-converter": {
    id: "file-size-unit-converter",
    buttonLabel: "용량 변환하기",
    fields: [
      { key: "value", label: "용량 값", type: "number", placeholder: "1536" },
      { key: "unit", label: "단위", type: "text", placeholder: "KB, MB, GB, bytes" },
    ],
    run: ({ value, unit }) => {
      const input = Math.max(0, Number(value) || 0);
      const unitText = unit.trim().toLowerCase();
      const multipliers: Record<string, number> = {
        b: 1,
        byte: 1,
        bytes: 1,
        kb: 1024,
        mb: 1024 ** 2,
        gb: 1024 ** 3,
      };
      const bytes = input * (multipliers[unitText] ?? multipliers.kb);
      const kb = bytes / 1024;
      const mb = kb / 1024;
      const gb = mb / 1024;

      return {
        summary: `${input.toLocaleString()} ${unitText || "KB"}를 주요 단위로 변환했습니다.`,
        output: [
          `Bytes: ${Math.round(bytes).toLocaleString()}`,
          `KB: ${kb.toFixed(2)}`,
          `MB: ${mb.toFixed(3)}`,
          `GB: ${gb.toFixed(4)}`,
        ].join("\n"),
        metrics: [
          { label: "KB", value: kb.toFixed(2), tone: "primary" },
          { label: "MB", value: mb.toFixed(3), tone: "accent" },
          { label: "Bytes", value: Math.round(bytes).toLocaleString() },
        ],
        tips: [
          "웹 성능 점검에서는 KB와 MB를 함께 보면 페이지 무게를 설명하기 쉽습니다.",
          "이미지 한 장보다 페이지 전체 전송량을 기준으로 최적화 우선순위를 정하세요.",
          "동영상과 고해상도 이미지는 GB 단위 저장소 비용까지 함께 고려하세요.",
        ],
      };
    },
  },
  "utm-consistency-checker": {
    id: "utm-consistency-checker",
    buttonLabel: "UTM 일관성 검사하기",
    fields: [
      { key: "urls", label: "UTM URL 목록", type: "textarea", placeholder: "https://example.com/?utm_source=instagram&utm_medium=social&utm_campaign=launch\nhttps://example.com/?utm_source=Instagram&utm_medium=Social&utm_campaign=launch" },
    ],
    run: ({ urls }) => {
      const lines = urls.split("\n").map((line) => line.trim()).filter(Boolean);
      const rows = lines.map((line) => {
        try {
          const parsed = new URL(line);
          return {
            source: parsed.searchParams.get("utm_source") ?? "",
            medium: parsed.searchParams.get("utm_medium") ?? "",
            campaign: parsed.searchParams.get("utm_campaign") ?? "",
          };
        } catch {
          return { source: "", medium: "", campaign: "" };
        }
      });
      const missing = rows.filter((row) => !row.source || !row.medium || !row.campaign).length;
      const sourceSet = new Set(rows.map((row) => row.source).filter(Boolean));
      const mediumSet = new Set(rows.map((row) => row.medium).filter(Boolean));
      const caseIssues = rows.filter((row) => [row.source, row.medium, row.campaign].some((value) => /[A-Z]|\s/.test(value))).length;
      const score = Math.max(20, 100 - missing * 20 - Math.max(0, sourceSet.size - 1) * 8 - Math.max(0, mediumSet.size - 1) * 8 - caseIssues * 10);

      return {
        summary: score >= 80 ? "UTM 네이밍이 비교적 일관적입니다." : "UTM 누락 또는 표기 흔들림을 정리해야 합니다.",
        output: [
          `검사 URL: ${lines.length}개`,
          `필수 UTM 누락: ${missing}개`,
          `source 종류: ${Array.from(sourceSet).join(", ") || "없음"}`,
          `medium 종류: ${Array.from(mediumSet).join(", ") || "없음"}`,
          `대문자/공백 이슈: ${caseIssues}개`,
        ].join("\n"),
        metrics: [
          { label: "점수", value: `${score}점`, tone: "primary" },
          { label: "누락", value: `${missing}개`, tone: missing ? "muted" : "accent" },
          { label: "URL", value: `${lines.length}개` },
        ],
        tips: [
          "utm_source와 utm_medium은 소문자 영문으로 고정하면 GA4 리포트가 깔끔해집니다.",
          "같은 캠페인 안에서는 source, medium, campaign 네이밍 규칙을 문서화하세요.",
          "내부 링크에는 UTM을 붙이지 않는 편이 원본 유입 분석에 안전합니다.",
        ],
      };
    },
  },
  "url-encoder-decoder": {
    id: "url-encoder-decoder",
    buttonLabel: "URL 변환하기",
    fields: [
      { key: "text", label: "URL 또는 텍스트", type: "textarea", placeholder: "https://example.com/search?q=블로그 SEO 체크리스트" },
    ],
    run: ({ text }) => {
      const raw = text.trim();
      const encoded = encodeURI(raw);
      let decoded = raw;
      try {
        decoded = decodeURI(raw);
      } catch {
        decoded = "디코딩할 수 없는 형식입니다.";
      }
      const componentEncoded = encodeURIComponent(raw);

      return {
        summary: "URL 인코딩과 디코딩 결과를 생성했습니다.",
        output: [
          "encodeURI:",
          encoded,
          "",
          "decodeURI:",
          decoded,
          "",
          "encodeURIComponent:",
          componentEncoded,
        ].join("\n"),
        metrics: [
          { label: "원본", value: `${raw.length}자`, tone: "primary" },
          { label: "인코딩", value: `${encoded.length}자`, tone: "accent" },
          { label: "컴포넌트", value: `${componentEncoded.length}자` },
        ],
        tips: [
          "전체 URL은 encodeURI, 쿼리 값 하나는 encodeURIComponent가 더 안전합니다.",
          "한글, 공백, 특수문자가 섞인 캠페인 링크는 공유 전 인코딩 상태를 확인하세요.",
          "이미 인코딩된 값을 다시 인코딩하면 %25가 늘어나는 중복 인코딩 문제가 생길 수 있습니다.",
        ],
      };
    },
  },
  "query-string-parser": {
    id: "query-string-parser",
    buttonLabel: "쿼리 분석하기",
    fields: [
      { key: "url", label: "URL", type: "textarea", placeholder: "https://example.com/page?utm_source=instagram&utm_medium=social&id=123" },
    ],
    run: ({ url }) => {
      const raw = url.trim();
      const query = raw.includes("?") ? raw.slice(raw.indexOf("?") + 1).split("#")[0] : raw.replace(/^\?/, "");
      const params = new URLSearchParams(query);
      const rows = Array.from(params.entries());
      const duplicateKeys = rows
        .map(([key]) => key)
        .filter((key, index, keys) => keys.indexOf(key) !== index);
      const utmCount = rows.filter(([key]) => key.startsWith("utm_")).length;

      return {
        summary: `${rows.length}개의 쿼리 파라미터를 분석했습니다.`,
        output: rows.length
          ? rows.map(([key, value], index) => `${index + 1}. ${key} = ${value || "(empty)"}`).join("\n")
          : "쿼리 파라미터가 없습니다.",
        metrics: [
          { label: "파라미터", value: `${rows.length}개`, tone: "primary" },
          { label: "UTM", value: `${utmCount}개`, tone: "accent" },
          { label: "중복 키", value: `${new Set(duplicateKeys).size}개` },
        ],
        tips: [
          "빈 값이 있는 파라미터는 추적 리포트에서 의도와 다르게 처리될 수 있습니다.",
          "동일한 키가 여러 번 나오면 서버와 분석 도구마다 처리 방식이 다를 수 있습니다.",
          "UTM 값은 소문자와 하이픈 또는 언더스코어 규칙을 미리 정해두세요.",
        ],
      };
    },
  },
  "link-cleanup-tool": {
    id: "link-cleanup-tool",
    buttonLabel: "링크 정리하기",
    fields: [
      { key: "url", label: "원본 URL", type: "textarea", placeholder: "https://example.com/page?utm_source=instagram&fbclid=abc&utm_medium=social#section" },
      { key: "keep", label: "유지할 파라미터", type: "text", placeholder: "utm_source,utm_medium,utm_campaign" },
    ],
    run: ({ url, keep }) => {
      const keepSet = new Set((keep.trim() || "utm_source,utm_medium,utm_campaign,utm_content,utm_term")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean));
      let cleaned = url.trim();
      let removed = 0;
      try {
        const parsed = new URL(cleaned);
        const next = new URLSearchParams();
        parsed.searchParams.forEach((value, key) => {
          if (keepSet.has(key)) {
            next.set(key, value);
          } else {
            removed += 1;
          }
        });
        parsed.search = next.toString();
        parsed.hash = "";
        cleaned = parsed.toString();
      } catch {
        cleaned = url.trim().split("#")[0];
      }

      return {
        summary: `${removed}개의 불필요한 파라미터를 제거했습니다.`,
        output: cleaned,
        metrics: [
          { label: "제거", value: `${removed}개`, tone: "primary" },
          { label: "유지 규칙", value: `${keepSet.size}개`, tone: "accent" },
          { label: "길이", value: `${cleaned.length}자` },
        ],
        tips: [
          "fbclid, gclid 같은 자동 추적값은 공유용 링크에서는 제거해도 되는 경우가 많습니다.",
          "캠페인 성과 분석이 필요하면 UTM 파라미터는 유지하세요.",
          "정리한 링크가 실제로 열리는지 게시 전 한 번 클릭해 확인하세요.",
        ],
      };
    },
  },
  "qr-campaign-url-builder": {
    id: "qr-campaign-url-builder",
    buttonLabel: "QR 캠페인 URL 만들기",
    fields: [
      { key: "url", label: "랜딩 URL", type: "text", placeholder: "https://example.com/landing" },
      { key: "campaign", label: "캠페인명", type: "text", placeholder: "offline-event" },
      { key: "location", label: "QR 배치 위치", type: "text", placeholder: "poster, flyer, booth" },
    ],
    run: ({ url, campaign, location }) => {
      const landing = url.trim() || "https://example.com";
      const campaignText = campaign.trim().toLowerCase().replace(/\s+/g, "-") || "qr-campaign";
      const locationText = location.trim().toLowerCase().replace(/\s+/g, "-") || "offline";
      let output = landing;
      try {
        const parsed = new URL(landing);
        parsed.searchParams.set("utm_source", "qr");
        parsed.searchParams.set("utm_medium", "offline");
        parsed.searchParams.set("utm_campaign", campaignText);
        parsed.searchParams.set("utm_content", locationText);
        output = parsed.toString();
      } catch {
        output = `${landing}?utm_source=qr&utm_medium=offline&utm_campaign=${encodeURIComponent(campaignText)}&utm_content=${encodeURIComponent(locationText)}`;
      }

      return {
        summary: "QR 코드용 캠페인 추적 URL을 생성했습니다.",
        output,
        metrics: [
          { label: "source", value: "qr", tone: "primary" },
          { label: "medium", value: "offline", tone: "accent" },
          { label: "campaign", value: campaignText },
        ],
        tips: [
          "QR 배치 위치는 utm_content로 구분하면 포스터, 전단, 부스 성과를 비교하기 쉽습니다.",
          "QR 코드는 인쇄 전에 실제 스마트폰으로 스캔해 랜딩과 리다이렉트를 확인하세요.",
          "오프라인 캠페인은 짧고 안정적인 랜딩 URL을 쓰는 편이 좋습니다.",
        ],
      };
    },
  },
  "redirect-chain-notes-builder": {
    id: "redirect-chain-notes-builder",
    buttonLabel: "리다이렉트 기록표 만들기",
    fields: [
      { key: "urls", label: "리다이렉트 URL 흐름", type: "textarea", placeholder: "http://example.com\nhttps://example.com\nhttps://www.example.com\nhttps://example.com/final" },
      { key: "reason", label: "점검 목적", type: "text", placeholder: "예: www/non-www 정리, 캠페인 링크 점검" },
    ],
    run: ({ urls, reason }) => {
      const lines = urls.split("\n").map((line) => line.trim()).filter(Boolean);
      const steps = lines.map((line, index) => {
        const arrow = index === lines.length - 1 ? "최종" : "redirect";
        return `${index + 1}. ${line} -> ${arrow}`;
      });
      const chainLength = Math.max(0, lines.length - 1);
      const risk = chainLength <= 1 ? "낮음" : chainLength <= 2 ? "보통" : "높음";

      return {
        summary: `리다이렉트 체인 위험도는 ${risk}입니다.`,
        output: [
          `점검 목적: ${reason.trim() || "리다이렉트 흐름 확인"}`,
          `체인 길이: ${chainLength}`,
          "",
          ...steps,
          "",
          "권장: 최종 URL까지 1회 이내로 이동하도록 정리",
        ].join("\n"),
        metrics: [
          { label: "체인", value: `${chainLength}회`, tone: "primary" },
          { label: "위험도", value: risk, tone: risk === "낮음" ? "accent" : "muted" },
          { label: "URL", value: `${lines.length}개` },
        ],
        tips: [
          "http, www, trailing slash 정책이 섞이면 불필요한 리다이렉트가 생깁니다.",
          "캠페인 URL은 QR 인쇄나 광고 집행 전에 최종 랜딩까지 직접 확인하세요.",
          "긴 체인은 속도, 크롤링, 추적 파라미터 보존에 불리할 수 있습니다.",
        ],
      };
    },
  },
  "canonical-url-checklist": {
    id: "canonical-url-checklist",
    buttonLabel: "Canonical 점검하기",
    fields: [
      { key: "pageUrl", label: "현재 페이지 URL", type: "text", placeholder: "https://crepika.com/blog/example" },
      { key: "canonicalUrl", label: "Canonical URL", type: "text", placeholder: "https://crepika.com/blog/example" },
    ],
    run: ({ pageUrl, canonicalUrl }) => {
      const page = pageUrl.trim();
      const canonical = canonicalUrl.trim();
      let sameOrigin = false;
      let cleanCanonical = false;
      let samePath = false;
      try {
        const pageParsed = new URL(page);
        const canonicalParsed = new URL(canonical || page);
        sameOrigin = pageParsed.origin === canonicalParsed.origin;
        cleanCanonical = !canonicalParsed.search && !canonicalParsed.hash;
        samePath = pageParsed.pathname.replace(/\/$/, "") === canonicalParsed.pathname.replace(/\/$/, "");
      } catch {
        sameOrigin = false;
      }
      const score = (canonical ? 25 : 0) + (sameOrigin ? 25 : 10) + (cleanCanonical ? 25 : 8) + (samePath ? 25 : 12);

      return {
        summary: score >= 80 ? "Canonical URL 선언이 안정적인 편입니다." : "Canonical URL 형식과 대표 URL 정책을 다시 확인하세요.",
        output: [
          `현재 URL: ${page || "미입력"}`,
          `Canonical: ${canonical || "미입력"}`,
          `같은 도메인: ${sameOrigin ? "예" : "아니오/확인 필요"}`,
          `쿼리/해시 없음: ${cleanCanonical ? "예" : "아니오"}`,
          `경로 일치: ${samePath ? "예" : "아니오/의도 확인"}`,
        ].join("\n"),
        metrics: [
          { label: "점수", value: `${score}점`, tone: "primary" },
          { label: "도메인", value: sameOrigin ? "일치" : "확인", tone: sameOrigin ? "accent" : "muted" },
          { label: "정리", value: cleanCanonical ? "깨끗함" : "쿼리 포함" },
        ],
        tips: [
          "Canonical은 보통 쿼리와 해시가 없는 대표 URL로 선언합니다.",
          "www/non-www, trailing slash 정책과 canonical 정책을 일치시키세요.",
          "중복 페이지가 아니라면 자기 자신을 가리키는 self canonical이 안전합니다.",
        ],
      };
    },
  },
  "sitemap-url-batch-builder": {
    id: "sitemap-url-batch-builder",
    buttonLabel: "사이트맵 URL 만들기",
    fields: [
      { key: "baseUrl", label: "사이트 주소", type: "text", placeholder: "https://crepika.com" },
      { key: "paths", label: "경로 목록", type: "textarea", placeholder: "/\n/blog\n/tools/text-counter" },
    ],
    run: ({ baseUrl, paths }) => {
      const base = (baseUrl.trim() || "https://example.com").replace(/\/$/, "");
      const lines = paths.split("\n").map((line) => line.trim()).filter(Boolean);
      const urls = (lines.length ? lines : ["/", "/blog", "/tools"]).map((path) => {
        if (/^https?:\/\//.test(path)) return path.split("#")[0];
        return `${base}/${path.replace(/^\/+/, "")}`.replace(/\/$/, path === "/" ? "/" : "");
      });
      const unique = Array.from(new Set(urls));

      return {
        summary: `${unique.length}개의 사이트맵 URL 후보를 생성했습니다.`,
        output: unique.join("\n"),
        metrics: [
          { label: "URL", value: `${unique.length}개`, tone: "primary" },
          { label: "중복 제거", value: `${urls.length - unique.length}개`, tone: "accent" },
          { label: "기준", value: base },
        ],
        tips: [
          "사이트맵에는 색인시키고 싶은 canonical URL만 넣는 것이 좋습니다.",
          "검색 결과 페이지, 필터 URL, 중복 파라미터 URL은 보통 제외합니다.",
          "URL을 추가한 뒤 robots.txt에서 막고 있지 않은지 함께 확인하세요.",
        ],
      };
    },
  },
  "robots-rule-draft-builder": {
    id: "robots-rule-draft-builder",
    buttonLabel: "robots 규칙 만들기",
    fields: [
      { key: "allowPaths", label: "허용 경로", type: "textarea", placeholder: "/\n/blog/\n/tools/" },
      { key: "disallowPaths", label: "차단 경로", type: "textarea", placeholder: "/admin/\n/api/\n?preview=" },
      { key: "sitemap", label: "Sitemap URL", type: "text", placeholder: "https://crepika.com/sitemap.xml" },
    ],
    run: ({ allowPaths, disallowPaths, sitemap }) => {
      const allow = allowPaths.split("\n").map((line) => line.trim()).filter(Boolean);
      const disallow = disallowPaths.split("\n").map((line) => line.trim()).filter(Boolean);
      const sitemapUrl = sitemap.trim();
      const output = [
        "User-agent: *",
        ...(allow.length ? allow.map((path) => `Allow: ${path}`) : ["Allow: /"]),
        ...disallow.map((path) => `Disallow: ${path}`),
        sitemapUrl ? `Sitemap: ${sitemapUrl}` : "",
      ].filter(Boolean).join("\n");

      return {
        summary: "robots.txt 규칙 초안을 생성했습니다.",
        output,
        metrics: [
          { label: "Allow", value: `${allow.length || 1}개`, tone: "primary" },
          { label: "Disallow", value: `${disallow.length}개`, tone: "accent" },
          { label: "Sitemap", value: sitemapUrl ? "있음" : "없음" },
        ],
        tips: [
          "robots.txt는 색인 제거 도구가 아니라 크롤링 제어 도구입니다.",
          "중요 페이지를 Disallow하면 Google이 내용을 제대로 수집하지 못할 수 있습니다.",
          "적용 전 Search Console robots.txt 테스트와 실제 URL 검사로 확인하세요.",
        ],
      };
    },
  },
  "anchor-text-variation-builder": {
    id: "anchor-text-variation-builder",
    buttonLabel: "앵커 변형 만들기",
    fields: [
      { key: "keyword", label: "핵심 키워드", type: "text", placeholder: "블로그 SEO 체크리스트" },
      { key: "target", label: "연결할 페이지", type: "text", placeholder: "/blog/seo-checklist" },
    ],
    run: ({ keyword, target }) => {
      const key = keyword.trim() || "핵심 주제";
      const page = target.trim() || "/target-page";
      const anchors = [
        key,
        `${key} 자세히 보기`,
        `${key} 체크리스트`,
        `${key} 실전 가이드`,
        `관련 도구로 ${key} 확인하기`,
        `초보자를 위한 ${key}`,
      ];

      return {
        summary: `${anchors.length}개의 자연스러운 앵커 텍스트 변형을 만들었습니다.`,
        output: anchors.map((anchor) => `- [${anchor}](${page})`).join("\n"),
        metrics: [
          { label: "변형", value: `${anchors.length}개`, tone: "primary" },
          { label: "대상", value: page, tone: "accent" },
          { label: "키워드", value: key },
        ],
        tips: [
          "모든 내부 링크에 같은 exact match 앵커를 반복하지 마세요.",
          "앵커 문구는 클릭 후 사용자가 얻을 내용을 예측할 수 있어야 합니다.",
          "본문 안 내부 링크는 문맥이 맞는 위치에 자연스럽게 배치하세요.",
        ],
      };
    },
  },
  "broken-link-outreach-template": {
    id: "broken-link-outreach-template",
    buttonLabel: "제안 메일 만들기",
    fields: [
      { key: "site", label: "상대 사이트/담당자", type: "text", placeholder: "예: example blog 담당자" },
      { key: "brokenUrl", label: "깨진 링크", type: "text", placeholder: "https://example.com/old-resource" },
      { key: "replacement", label: "대체 제안 URL", type: "text", placeholder: "https://crepika.com/blog/resource" },
    ],
    run: ({ site, brokenUrl, replacement }) => {
      const siteText = site.trim() || "담당자님";
      const broken = brokenUrl.trim() || "깨진 링크 URL";
      const replace = replacement.trim() || "대체로 참고할 수 있는 URL";
      const output = [
        `안녕하세요, ${siteText}.`,
        "",
        "자료를 확인하다가 아래 링크가 현재 정상적으로 열리지 않는 것을 발견했습니다.",
        `- 깨진 링크: ${broken}`,
        "",
        "비슷한 주제를 다루는 최신 자료가 있어 함께 전달드립니다.",
        `- 대체 제안: ${replace}`,
        "",
        "사이트 운영에 도움이 되길 바랍니다. 필요하지 않다면 편하게 무시해 주세요.",
        "감사합니다.",
      ].join("\n");

      return {
        summary: "정중한 깨진 링크 제안 메일 초안을 생성했습니다.",
        output,
        metrics: [
          { label: "톤", value: "정중", tone: "primary" },
          { label: "링크", value: "2개", tone: "accent" },
          { label: "길이", value: `${output.length}자` },
        ],
        tips: [
          "깨진 링크 제안은 대량 발송보다 실제로 도움이 되는 자료에만 보내는 편이 안전합니다.",
          "상대 사이트의 주제와 대체 자료의 관련성이 낮으면 스팸처럼 보일 수 있습니다.",
          "대체 자료의 최신성, 작성자, 근거 링크를 먼저 보강하세요.",
        ],
      };
    },
  },
  "affiliate-disclosure-builder": {
    id: "affiliate-disclosure-builder",
    buttonLabel: "제휴 고지 만들기",
    fields: [
      { key: "brand", label: "사이트/브랜드명", type: "text", placeholder: "예: 크레피카" },
      { key: "relationship", label: "제휴 관계", type: "text", placeholder: "예: 일부 링크를 통해 수수료를 받을 수 있음" },
      { key: "placement", label: "노출 위치", type: "text", placeholder: "예: 글 상단, 버튼 주변, 추천 목록 앞" },
    ],
    run: ({ brand, relationship, placement }) => {
      const brandText = brand.trim() || "이 사이트";
      const relationText = relationship.trim() || "일부 링크를 통해 수수료를 받을 수 있습니다";
      const placementText = placement.trim() || "관련 링크 근처와 글 상단";
      const output = [
        `${brandText}는 콘텐츠 운영을 위해 일부 제휴 링크를 사용할 수 있습니다.`,
        `사용자가 해당 링크를 통해 가입하거나 구매하면 ${relationText}.`,
        "다만 추천 여부와 작성 내용은 독자에게 유용한지 여부를 기준으로 판단합니다.",
        "",
        `권장 노출 위치: ${placementText}`,
      ].join("\n");

      return {
        summary: "투명한 제휴 고지 문구 초안을 생성했습니다.",
        output,
        metrics: [
          { label: "문장", value: "3개", tone: "primary" },
          { label: "노출 위치", value: placementText, tone: "accent" },
          { label: "길이", value: `${output.length}자` },
        ],
        tips: [
          "제휴 고지는 사용자가 링크를 클릭하기 전에 볼 수 있는 위치에 두는 편이 안전합니다.",
          "수익 관계를 숨기지 말고 짧고 명확하게 설명하세요.",
          "국가와 플랫폼 정책에 따라 요구 문구가 다를 수 있으니 최종 게시 전 정책을 확인하세요.",
        ],
      };
    },
  },
  "campaign-naming-convention-builder": {
    id: "campaign-naming-convention-builder",
    buttonLabel: "네이밍 규칙 만들기",
    fields: [
      { key: "channel", label: "채널", type: "text", placeholder: "예: instagram, newsletter, google" },
      { key: "goal", label: "캠페인 목표", type: "text", placeholder: "예: signup, tool-launch, ebook" },
      { key: "period", label: "기간/시즌", type: "text", placeholder: "예: 2026-q2" },
    ],
    run: ({ channel, goal, period }) => {
      const clean = (value: string, fallback: string) =>
        (value.trim().toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-|-$/g, "") || fallback);
      const channelText = clean(channel, "channel");
      const goalText = clean(goal, "goal");
      const periodText = clean(period, "period");
      const campaign = `${periodText}-${channelText}-${goalText}`;
      const output = [
        `utm_campaign=${campaign}`,
        `utm_source=${channelText}`,
        "utm_medium=<social|email|cpc|referral>",
        "utm_content=<creative-or-placement>",
        "",
        "규칙: period-channel-goal 형식, 소문자, 공백 대신 하이픈",
      ].join("\n");

      return {
        summary: "GA4에서 쪼개지기 어려운 캠페인 네이밍 규칙을 만들었습니다.",
        output,
        metrics: [
          { label: "campaign", value: campaign, tone: "primary" },
          { label: "source", value: channelText, tone: "accent" },
          { label: "형식", value: "period-channel-goal" },
        ],
        tips: [
          "캠페인명은 사람이 보고 이해할 수 있으면서도 짧아야 합니다.",
          "대문자, 공백, 한글/영문 혼용 규칙이 흔들리면 GA4 리포트가 나뉠 수 있습니다.",
          "팀 문서에 source, medium, campaign 예시를 함께 남겨두세요.",
        ],
      };
    },
  },
  "landing-page-cta-url-builder": {
    id: "landing-page-cta-url-builder",
    buttonLabel: "CTA URL 만들기",
    fields: [
      { key: "landing", label: "랜딩 URL", type: "text", placeholder: "https://crepika.com/tools/text-counter" },
      { key: "cta", label: "CTA 위치/문구", type: "text", placeholder: "hero-start-free" },
      { key: "campaign", label: "캠페인명", type: "text", placeholder: "tool-launch" },
    ],
    run: ({ landing, cta, campaign }) => {
      const clean = (value: string, fallback: string) =>
        (value.trim().toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-|-$/g, "") || fallback);
      const ctaText = clean(cta, "cta");
      const campaignText = clean(campaign, "landing");
      const landingText = landing.trim() || "https://example.com";
      let output = landingText;
      try {
        const parsed = new URL(landingText);
        parsed.searchParams.set("utm_source", "site");
        parsed.searchParams.set("utm_medium", "cta");
        parsed.searchParams.set("utm_campaign", campaignText);
        parsed.searchParams.set("utm_content", ctaText);
        output = parsed.toString();
      } catch {
        output = `${landingText}?utm_source=site&utm_medium=cta&utm_campaign=${encodeURIComponent(campaignText)}&utm_content=${encodeURIComponent(ctaText)}`;
      }

      return {
        summary: "랜딩 페이지 CTA 추적 URL을 생성했습니다.",
        output,
        metrics: [
          { label: "medium", value: "cta", tone: "primary" },
          { label: "content", value: ctaText, tone: "accent" },
          { label: "campaign", value: campaignText },
        ],
        tips: [
          "내부 CTA에 UTM을 과도하게 쓰면 원본 유입 분석이 흐려질 수 있으니 목적을 명확히 하세요.",
          "같은 페이지의 CTA 위치를 비교할 때 utm_content를 사용하면 구분하기 쉽습니다.",
          "중요 전환 버튼은 URL 추적보다 클릭 이벤트 측정도 함께 설정하는 편이 좋습니다.",
        ],
      };
    },
  },
  "conversion-rate-calculator": {
    id: "conversion-rate-calculator",
    buttonLabel: "전환율 계산하기",
    fields: [
      { key: "visitors", label: "방문/클릭 수", type: "number", placeholder: "1200" },
      { key: "conversions", label: "전환 수", type: "number", placeholder: "36" },
    ],
    run: ({ visitors, conversions }) => {
      const visits = Math.max(0, Number(visitors) || 0);
      const converted = Math.max(0, Number(conversions) || 0);
      const rate = visits ? (converted / visits) * 100 : 0;
      const neededForOne = rate ? 100 / rate : 0;

      return {
        summary: `전환율은 ${rate.toFixed(2)}%입니다.`,
        output: [
          `방문/클릭 수: ${visits.toLocaleString()}`,
          `전환 수: ${converted.toLocaleString()}`,
          `전환율: ${rate.toFixed(2)}%`,
          `전환 1건당 필요 방문: ${neededForOne ? neededForOne.toFixed(1) : "계산 불가"}`,
        ].join("\n"),
        metrics: [
          { label: "전환율", value: `${rate.toFixed(2)}%`, tone: "primary" },
          { label: "전환", value: converted.toLocaleString(), tone: "accent" },
          { label: "방문", value: visits.toLocaleString() },
        ],
        tips: [
          "전환율은 채널, 의도, 랜딩 페이지 품질에 따라 크게 달라집니다.",
          "표본이 작을 때는 하루 수치보다 주간 또는 월간 추세를 보세요.",
          "CTA 문구, 페이지 속도, 신뢰 요소가 전환율에 함께 영향을 줍니다.",
        ],
      };
    },
  },
  "adsense-cpc-calculator": {
    id: "adsense-cpc-calculator",
    buttonLabel: "CPC 계산하기",
    fields: [
      { key: "earnings", label: "예상 수익", type: "number", placeholder: "18.5" },
      { key: "clicks", label: "광고 클릭 수", type: "number", placeholder: "42" },
    ],
    run: ({ earnings, clicks }) => {
      const revenue = Math.max(0, Number(earnings) || 0);
      const clickCount = Math.max(0, Number(clicks) || 0);
      const cpc = clickCount ? revenue / clickCount : 0;

      return {
        summary: `예상 CPC는 ${cpc.toFixed(3)}입니다.`,
        output: [
          `수익: ${revenue.toFixed(2)}`,
          `클릭 수: ${clickCount.toLocaleString()}`,
          `CPC: ${cpc.toFixed(3)}`,
          "참고: 실제 AdSense 수익은 국가, 주제, 광고 수요, 무효 트래픽 조정에 따라 달라집니다.",
        ].join("\n"),
        metrics: [
          { label: "CPC", value: cpc.toFixed(3), tone: "primary" },
          { label: "수익", value: revenue.toFixed(2), tone: "accent" },
          { label: "클릭", value: clickCount.toLocaleString() },
        ],
        tips: [
          "CPC 하나만 보지 말고 RPM, 페이지뷰, 클릭률을 함께 봐야 합니다.",
          "광고 클릭을 유도하는 문구나 배치는 정책 위반 위험이 있으므로 피하세요.",
          "콘텐츠 품질과 검색 의도 일치가 장기적인 수익 안정성에 더 중요합니다.",
        ],
      };
    },
  },
  "newsletter-growth-calculator": {
    id: "newsletter-growth-calculator",
    buttonLabel: "Calculate newsletter growth",
    fields: [
      { key: "current", label: "Current subscribers", type: "number", placeholder: "1200" },
      { key: "growth", label: "Monthly growth %", type: "number", placeholder: "8" },
      { key: "churn", label: "Monthly churn %", type: "number", placeholder: "2" },
      { key: "months", label: "Months", type: "number", placeholder: "6" },
    ],
    run: ({ current, growth, churn, months }) => {
      const start = Math.max(0, Number(current) || 0);
      const netRate = ((Number(growth) || 0) - (Number(churn) || 0)) / 100;
      const period = Math.max(1, Math.round(Number(months) || 1));
      const projected = Math.max(0, Math.round(start * Math.pow(1 + netRate, period)));

      return {
        summary: `Projected subscribers after ${period} months: ${projected.toLocaleString()}.`,
        output: [
          `Starting subscribers: ${start.toLocaleString()}`,
          `Net monthly growth: ${(netRate * 100).toFixed(2)}%`,
          `Projected subscribers: ${projected.toLocaleString()}`,
          `Net change: ${(projected - start).toLocaleString()}`,
        ].join("\n"),
        metrics: [
          { label: "Projected", value: projected.toLocaleString(), tone: "primary" },
          { label: "Net rate", value: `${(netRate * 100).toFixed(2)}%`, tone: "accent" },
          { label: "Months", value: String(period) },
        ],
        tips: [
          "Separate organic growth, paid acquisition, and referral growth when you review the real dashboard.",
          "If churn is rising, improve onboarding and send cadence before spending more on acquisition.",
          "Use a conservative rate for planning because subscriber growth rarely stays linear for long periods.",
        ],
      };
    },
  },
  "engagement-rate-calculator": {
    id: "engagement-rate-calculator",
    buttonLabel: "Calculate engagement rate",
    fields: [
      { key: "reach", label: "Reach or followers", type: "number", placeholder: "10000" },
      { key: "likes", label: "Likes", type: "number", placeholder: "420" },
      { key: "comments", label: "Comments", type: "number", placeholder: "38" },
      { key: "saves", label: "Saves", type: "number", placeholder: "74" },
      { key: "shares", label: "Shares", type: "number", placeholder: "31" },
    ],
    run: ({ reach, likes, comments, saves, shares }) => {
      const base = Math.max(0, Number(reach) || 0);
      const total =
        Math.max(0, Number(likes) || 0) +
        Math.max(0, Number(comments) || 0) +
        Math.max(0, Number(saves) || 0) +
        Math.max(0, Number(shares) || 0);
      const rate = base ? (total / base) * 100 : 0;

      return {
        summary: `Engagement rate is ${rate.toFixed(2)}%.`,
        output: [
          `Total engagements: ${total.toLocaleString()}`,
          `Base: ${base.toLocaleString()}`,
          `Engagement rate: ${rate.toFixed(2)}%`,
        ].join("\n"),
        metrics: [
          { label: "Rate", value: `${rate.toFixed(2)}%`, tone: "primary" },
          { label: "Engagements", value: total.toLocaleString(), tone: "accent" },
          { label: "Base", value: base.toLocaleString() },
        ],
        tips: [
          "Use reach for post-level analysis and followers for account-level comparisons.",
          "Saves and shares often signal deeper value than likes, so review them separately.",
          "Compare posts from the same format and platform before deciding a topic is weak.",
        ],
      };
    },
  },
  "content-roi-calculator": {
    id: "content-roi-calculator",
    buttonLabel: "Calculate content ROI",
    fields: [
      { key: "cost", label: "Production cost", type: "number", placeholder: "350" },
      { key: "revenue", label: "Attributed revenue", type: "number", placeholder: "1200" },
    ],
    run: ({ cost, revenue }) => {
      const spend = Math.max(0, Number(cost) || 0);
      const income = Math.max(0, Number(revenue) || 0);
      const profit = income - spend;
      const roi = spend ? (profit / spend) * 100 : 0;

      return {
        summary: `Estimated content ROI is ${roi.toFixed(1)}%.`,
        output: [
          `Revenue: ${income.toLocaleString()}`,
          `Cost: ${spend.toLocaleString()}`,
          `Profit: ${profit.toLocaleString()}`,
          `ROI: ${roi.toFixed(1)}%`,
        ].join("\n"),
        metrics: [
          { label: "ROI", value: `${roi.toFixed(1)}%`, tone: "primary" },
          { label: "Profit", value: profit.toLocaleString(), tone: profit >= 0 ? "accent" : "muted" },
          { label: "Cost", value: spend.toLocaleString() },
        ],
        tips: [
          "Include writing, design, editing, distribution, and tool costs for a realistic result.",
          "Content ROI may continue improving after publication, so review first-touch and long-tail value separately.",
          "For brand campaigns, track leads or qualified actions when direct revenue is not available.",
        ],
      };
    },
  },
  "break-even-calculator": {
    id: "break-even-calculator",
    buttonLabel: "Calculate break-even point",
    fields: [
      { key: "cost", label: "Fixed or campaign cost", type: "number", placeholder: "1500" },
      { key: "margin", label: "Profit per sale/conversion", type: "number", placeholder: "35" },
    ],
    run: ({ cost, margin }) => {
      const fixedCost = Math.max(0, Number(cost) || 0);
      const profitPerUnit = Math.max(0, Number(margin) || 0);
      const units = profitPerUnit ? Math.ceil(fixedCost / profitPerUnit) : 0;

      return {
        summary: profitPerUnit ? `You need ${units.toLocaleString()} conversions to break even.` : "Enter profit per conversion to calculate break-even.",
        output: [
          `Cost: ${fixedCost.toLocaleString()}`,
          `Profit per conversion: ${profitPerUnit.toLocaleString()}`,
          `Break-even conversions: ${units ? units.toLocaleString() : "Not available"}`,
        ].join("\n"),
        metrics: [
          { label: "Break-even", value: units ? units.toLocaleString() : "N/A", tone: "primary" },
          { label: "Margin", value: profitPerUnit.toLocaleString(), tone: "accent" },
          { label: "Cost", value: fixedCost.toLocaleString() },
        ],
        tips: [
          "Use contribution margin, not sale price, for cleaner break-even planning.",
          "If conversion volume looks unrealistic, reduce scope or increase average order value before launching.",
          "Pair this with conversion-rate estimates to translate sales targets into traffic targets.",
        ],
      };
    },
  },
  "ab-test-sample-notes": {
    id: "ab-test-sample-notes",
    buttonLabel: "Review A/B test sample",
    fields: [
      { key: "aViews", label: "Variant A visitors", type: "number", placeholder: "1000" },
      { key: "aConv", label: "Variant A conversions", type: "number", placeholder: "80" },
      { key: "bViews", label: "Variant B visitors", type: "number", placeholder: "1000" },
      { key: "bConv", label: "Variant B conversions", type: "number", placeholder: "96" },
    ],
    run: ({ aViews, aConv, bViews, bConv }) => {
      const av = Math.max(0, Number(aViews) || 0);
      const ac = Math.max(0, Number(aConv) || 0);
      const bv = Math.max(0, Number(bViews) || 0);
      const bc = Math.max(0, Number(bConv) || 0);
      const ar = av ? (ac / av) * 100 : 0;
      const br = bv ? (bc / bv) * 100 : 0;
      const lift = ar ? ((br - ar) / ar) * 100 : 0;
      const sampleFlag = av >= 1000 && bv >= 1000 && ac >= 50 && bc >= 50 ? "directionally useful" : "too thin for a strong call";

      return {
        summary: `Variant B lift is ${lift.toFixed(1)}%; sample looks ${sampleFlag}.`,
        output: [
          `A conversion rate: ${ar.toFixed(2)}%`,
          `B conversion rate: ${br.toFixed(2)}%`,
          `Relative lift: ${lift.toFixed(1)}%`,
          `Sample note: ${sampleFlag}`,
        ].join("\n"),
        metrics: [
          { label: "B lift", value: `${lift.toFixed(1)}%`, tone: "primary" },
          { label: "A CVR", value: `${ar.toFixed(2)}%` },
          { label: "B CVR", value: `${br.toFixed(2)}%`, tone: "accent" },
        ],
        tips: [
          "This is a planning note, not a statistical significance engine.",
          "Avoid stopping tests early only because one variant is temporarily ahead.",
          "Segment mobile and desktop when layout or page speed may affect the outcome.",
        ],
      };
    },
  },
  "publishing-pace-calculator": {
    id: "publishing-pace-calculator",
    buttonLabel: "Calculate publishing runway",
    fields: [
      { key: "queued", label: "Queued items", type: "number", placeholder: "60" },
      { key: "everyHours", label: "Publish every N hours", type: "number", placeholder: "5" },
    ],
    run: ({ queued, everyHours }) => {
      const items = Math.max(0, Math.round(Number(queued) || 0));
      const interval = Math.max(1, Number(everyHours) || 1);
      const hours = items * interval;
      const days = hours / 24;

      return {
        summary: `The queue lasts about ${days.toFixed(1)} days.`,
        output: [
          `Queued items: ${items.toLocaleString()}`,
          `Interval: every ${interval} hours`,
          `Total runway: ${hours.toFixed(1)} hours`,
          `Runway in days: ${days.toFixed(1)}`,
        ].join("\n"),
        metrics: [
          { label: "Runway", value: `${days.toFixed(1)} days`, tone: "primary" },
          { label: "Hours", value: hours.toFixed(1), tone: "accent" },
          { label: "Items", value: items.toLocaleString() },
        ],
        tips: [
          "Keep a reserve so editorial quality does not drop when production slows.",
          "For SEO, pair publishing pace with internal links and sitemap updates.",
          "Use slower cadence for thin pages and faster cadence only when each item is genuinely useful.",
        ],
      };
    },
  },
  "lead-magnet-math-calculator": {
    id: "lead-magnet-math-calculator",
    buttonLabel: "Estimate leads",
    fields: [
      { key: "visitors", label: "Visitors", type: "number", placeholder: "5000" },
      { key: "signupRate", label: "Signup rate %", type: "number", placeholder: "3.5" },
      { key: "salesRate", label: "Lead-to-sale %", type: "number", placeholder: "8" },
    ],
    run: ({ visitors, signupRate, salesRate }) => {
      const traffic = Math.max(0, Number(visitors) || 0);
      const leads = traffic * Math.max(0, Number(signupRate) || 0) / 100;
      const sales = leads * Math.max(0, Number(salesRate) || 0) / 100;

      return {
        summary: `Estimated leads: ${Math.round(leads).toLocaleString()}, estimated sales: ${Math.round(sales).toLocaleString()}.`,
        output: [
          `Visitors: ${traffic.toLocaleString()}`,
          `Estimated leads: ${Math.round(leads).toLocaleString()}`,
          `Estimated sales: ${Math.round(sales).toLocaleString()}`,
        ].join("\n"),
        metrics: [
          { label: "Leads", value: Math.round(leads).toLocaleString(), tone: "primary" },
          { label: "Sales", value: Math.round(sales).toLocaleString(), tone: "accent" },
          { label: "Visitors", value: traffic.toLocaleString() },
        ],
        tips: [
          "A useful lead magnet solves one urgent problem, not every problem in the niche.",
          "Track opt-in source so you can see which content produces qualified leads.",
          "Improve the promise and preview before increasing pop-up pressure.",
        ],
      };
    },
  },
  "creator-pricing-calculator": {
    id: "creator-pricing-calculator",
    buttonLabel: "Estimate creator fee",
    fields: [
      { key: "reach", label: "Expected reach", type: "number", placeholder: "25000" },
      { key: "engagement", label: "Engagement rate %", type: "number", placeholder: "4" },
      { key: "hours", label: "Production hours", type: "number", placeholder: "6" },
    ],
    run: ({ reach, engagement, hours }) => {
      const expectedReach = Math.max(0, Number(reach) || 0);
      const engagementScore = Math.max(0, Number(engagement) || 0);
      const productionHours = Math.max(0, Number(hours) || 0);
      const low = Math.round((expectedReach / 1000) * (8 + engagementScore) + productionHours * 25);
      const high = Math.round(low * 1.8);

      return {
        summary: `Suggested fee range: ${low.toLocaleString()} to ${high.toLocaleString()}.`,
        output: [
          `Low estimate: ${low.toLocaleString()}`,
          `High estimate: ${high.toLocaleString()}`,
          `Inputs: reach ${expectedReach.toLocaleString()}, engagement ${engagementScore.toFixed(1)}%, production ${productionHours.toFixed(1)}h`,
        ].join("\n"),
        metrics: [
          { label: "Low", value: low.toLocaleString(), tone: "primary" },
          { label: "High", value: high.toLocaleString(), tone: "accent" },
          { label: "Hours", value: productionHours.toFixed(1) },
        ],
        tips: [
          "Treat this as a negotiation starting point, not a guaranteed market price.",
          "Add usage rights, exclusivity, rush timing, and revision scope before sending a quote.",
          "For performance campaigns, separate base production fee and bonus conditions.",
        ],
      };
    },
  },
  "funnel-dropoff-calculator": {
    id: "funnel-dropoff-calculator",
    buttonLabel: "Calculate funnel dropoff",
    fields: [
      { key: "visits", label: "Visits", type: "number", placeholder: "10000" },
      { key: "clicks", label: "CTA clicks", type: "number", placeholder: "1200" },
      { key: "leads", label: "Leads", type: "number", placeholder: "260" },
      { key: "sales", label: "Sales", type: "number", placeholder: "34" },
    ],
    run: ({ visits, clicks, leads, sales }) => {
      const v = Math.max(0, Number(visits) || 0);
      const c = Math.max(0, Number(clicks) || 0);
      const l = Math.max(0, Number(leads) || 0);
      const s = Math.max(0, Number(sales) || 0);
      const clickRate = v ? (c / v) * 100 : 0;
      const leadRate = c ? (l / c) * 100 : 0;
      const saleRate = l ? (s / l) * 100 : 0;
      const weakest = [
        { label: "visit to click", value: clickRate },
        { label: "click to lead", value: leadRate },
        { label: "lead to sale", value: saleRate },
      ].sort((a, b) => a.value - b.value)[0];

      return {
        summary: `Weakest funnel step: ${weakest.label} (${weakest.value.toFixed(1)}%).`,
        output: [
          `Visit to click: ${clickRate.toFixed(1)}%`,
          `Click to lead: ${leadRate.toFixed(1)}%`,
          `Lead to sale: ${saleRate.toFixed(1)}%`,
          `Priority: improve ${weakest.label}`,
        ].join("\n"),
        metrics: [
          { label: "Weakest", value: `${weakest.value.toFixed(1)}%`, tone: "primary" },
          { label: "Sales", value: s.toLocaleString(), tone: "accent" },
          { label: "Visits", value: v.toLocaleString() },
        ],
        tips: [
          "Fix the largest dropoff before optimizing steps that already convert well.",
          "A weak visit-to-click step often means message mismatch or unclear CTA placement.",
          "A weak lead-to-sale step usually needs offer, trust, or follow-up improvements.",
        ],
      };
    },
  },
  "keyword-opportunity-scorer": {
    id: "keyword-opportunity-scorer",
    buttonLabel: "Score keyword opportunity",
    fields: [
      { key: "intent", label: "Intent fit 1-10", type: "number", placeholder: "8" },
      { key: "difficulty", label: "Difficulty 1-10", type: "number", placeholder: "4" },
      { key: "business", label: "Business fit 1-10", type: "number", placeholder: "7" },
    ],
    run: ({ intent, difficulty, business }) => {
      const clamp = (value: string) => Math.min(10, Math.max(0, Number(value) || 0));
      const intentScore = clamp(intent);
      const difficultyScore = clamp(difficulty);
      const businessScore = clamp(business);
      const score = Math.round(intentScore * 4 + businessScore * 4 + (10 - difficultyScore) * 2);

      return {
        summary: `Keyword opportunity score: ${score}/100.`,
        output: [
          `Intent fit: ${intentScore}/10`,
          `Business fit: ${businessScore}/10`,
          `Difficulty: ${difficultyScore}/10`,
          `Opportunity score: ${score}/100`,
        ].join("\n"),
        metrics: [
          { label: "Score", value: `${score}/100`, tone: "primary" },
          { label: "Intent", value: `${intentScore}/10`, tone: "accent" },
          { label: "Difficulty", value: `${difficultyScore}/10` },
        ],
        tips: [
          "Prioritize keywords that match user intent and your monetization path, not only search volume.",
          "High difficulty can still be worth targeting if the page can become a strong internal link hub.",
          "Avoid multiple pages targeting the same intent unless each page has a distinct angle.",
        ],
      };
    },
  },
  "markdown-cleaner": {
    id: "markdown-cleaner",
    buttonLabel: "Clean markdown",
    fields: [
      { key: "text", label: "Markdown text", type: "textarea", placeholder: "# Title\n\n\n- item\n\n\n## Section" },
    ],
    run: ({ text }) => {
      const cleaned = text
        .replace(/\r\n/g, "\n")
        .replace(/[ \t]+$/gm, "")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/^(#{1,6})([^\s#])/gm, "$1 $2")
        .trim();
      const headings = (cleaned.match(/^#{1,6}\s+/gm) ?? []).length;

      return {
        summary: `Cleaned markdown with ${headings} headings.`,
        output: cleaned,
        metrics: [
          { label: "Characters", value: cleaned.length.toLocaleString(), tone: "primary" },
          { label: "Headings", value: headings.toLocaleString(), tone: "accent" },
          { label: "Lines", value: cleaned.split("\n").length.toLocaleString() },
        ],
        tips: [
          "Review heading hierarchy after cleanup because spacing fixes do not decide content structure.",
          "Keep one blank line between sections for better readability in most markdown renderers.",
          "Run the final text through preview before publishing long-form content.",
        ],
      };
    },
  },
  "html-entity-converter": {
    id: "html-entity-converter",
    buttonLabel: "Convert entities",
    fields: [
      { key: "text", label: "Text or HTML entities", type: "textarea", placeholder: "Tom & Jerry <b>guide</b> or Tom &amp; Jerry" },
    ],
    run: ({ text }) => {
      const hasEntity = /&(?:amp|lt|gt|quot|#39);/.test(text);
      const output = hasEntity
        ? text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&")
        : text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

      return {
        summary: hasEntity ? "Decoded common HTML entities." : "Encoded text as safe HTML entities.",
        output,
        metrics: [
          { label: "Mode", value: hasEntity ? "Decode" : "Encode", tone: "primary" },
          { label: "Length", value: output.length.toLocaleString(), tone: "accent" },
          { label: "Lines", value: output.split(/\r?\n/).length.toLocaleString() },
        ],
        tips: [
          "Use encoded output when displaying user-provided text inside HTML.",
          "Decode before editing copy that came from an HTML source or CMS export.",
          "This handles common entities, not every named HTML entity in the full spec.",
        ],
      };
    },
  },
  "json-formatter": {
    id: "json-formatter",
    buttonLabel: "Format JSON",
    fields: [
      { key: "json", label: "JSON", type: "textarea", placeholder: "{\"name\":\"Crepika\",\"tools\":100}" },
    ],
    run: ({ json }) => {
      const parsed = JSON.parse(json);
      const pretty = JSON.stringify(parsed, null, 2);
      const minified = JSON.stringify(parsed);

      return {
        summary: "JSON is valid and formatted.",
        output: `${pretty}\n\n--- minified ---\n${minified}`,
        metrics: [
          { label: "Pretty length", value: pretty.length.toLocaleString(), tone: "primary" },
          { label: "Minified", value: minified.length.toLocaleString(), tone: "accent" },
          { label: "Type", value: Array.isArray(parsed) ? "Array" : typeof parsed },
        ],
        tips: [
          "Keep JSON-LD valid before adding it to a page template.",
          "Minified JSON is useful for embedding, while pretty JSON is better for review.",
          "If parsing fails, check trailing commas and unquoted keys first.",
        ],
      };
    },
  },
  "csv-to-markdown-table": {
    id: "csv-to-markdown-table",
    buttonLabel: "Convert to table",
    fields: [
      { key: "csv", label: "CSV", type: "textarea", placeholder: "Name,Score\nTitle,90\nMeta,85" },
    ],
    run: ({ csv }) => {
      const rows = csv.trim().split(/\r?\n/).map((line) => line.split(",").map((cell) => cell.trim()));
      const width = Math.max(...rows.map((row) => row.length));
      const normalize = (row: string[]) => Array.from({ length: width }, (_, index) => row[index] ?? "");
      const [head = [], ...body] = rows.map(normalize);
      const table = [
        `| ${head.join(" | ")} |`,
        `| ${head.map(() => "---").join(" | ")} |`,
        ...body.map((row) => `| ${row.join(" | ")} |`),
      ].join("\n");

      return {
        summary: `Converted ${body.length.toLocaleString()} data rows to a markdown table.`,
        output: table,
        metrics: [
          { label: "Rows", value: body.length.toLocaleString(), tone: "primary" },
          { label: "Columns", value: width.toLocaleString(), tone: "accent" },
          { label: "Characters", value: table.length.toLocaleString() },
        ],
        tips: [
          "This simple converter is best for comma-separated data without embedded commas.",
          "Keep table columns short so mobile readers do not need excessive horizontal scrolling.",
          "For long data, summarize the key rows in prose before the table.",
        ],
      };
    },
  },
  "markdown-to-plain-text": {
    id: "markdown-to-plain-text",
    buttonLabel: "Strip markdown",
    fields: [
      { key: "markdown", label: "Markdown", type: "textarea", placeholder: "## Guide\nUse **clear CTA** and [links](https://example.com)." },
    ],
    run: ({ markdown }) => {
      const plain = markdown
        .replace(/```[\s\S]*?```/g, "")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/[*_~>#-]/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
      const words = plain ? plain.split(/\s+/).length : 0;

      return {
        summary: `Converted markdown to plain text with ${words.toLocaleString()} words.`,
        output: plain,
        metrics: [
          { label: "Words", value: words.toLocaleString(), tone: "primary" },
          { label: "Characters", value: plain.length.toLocaleString(), tone: "accent" },
          { label: "Lines", value: plain.split(/\r?\n/).length.toLocaleString() },
        ],
        tips: [
          "Plain text is useful for email drafts, social captions, and CMS fields that reject markdown.",
          "Review removed links manually if the destination URL is important.",
          "Keep paragraph breaks after stripping so the copy remains readable.",
        ],
      };
    },
  },
  "text-deduplicator": {
    id: "text-deduplicator",
    buttonLabel: "Remove duplicates",
    fields: [
      { key: "text", label: "Lines", type: "textarea", placeholder: "keyword one\nkeyword two\nkeyword one" },
    ],
    run: ({ text }) => {
      const seen = new Set<string>();
      const lines = text.split(/\r?\n/);
      const unique = lines.filter((line) => {
        const key = line.trim().toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      return {
        summary: `Removed ${(lines.length - unique.length).toLocaleString()} duplicate or blank lines.`,
        output: unique.join("\n"),
        metrics: [
          { label: "Unique", value: unique.length.toLocaleString(), tone: "primary" },
          { label: "Removed", value: (lines.length - unique.length).toLocaleString(), tone: "accent" },
          { label: "Original", value: lines.length.toLocaleString() },
        ],
        tips: [
          "Use this for keyword lists, title pools, and checklist cleanup before clustering.",
          "Duplicates are compared case-insensitively after trimming spaces.",
          "Review near-duplicates separately because this tool removes exact line duplicates only.",
        ],
      };
    },
  },
  "case-converter": {
    id: "case-converter",
    buttonLabel: "Convert case",
    fields: [
      { key: "text", label: "Text", type: "textarea", placeholder: "Creator Utility Toolkit" },
    ],
    run: ({ text }) => {
      const words = text.trim().split(/[^A-Za-z0-9가-힣]+/).filter(Boolean);
      const lowerWords = words.map((word) => word.toLowerCase());
      const camel = lowerWords.map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)).join("");
      const variants = [
        `lower: ${text.toLowerCase()}`,
        `UPPER: ${text.toUpperCase()}`,
        `Title: ${lowerWords.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}`,
        `kebab: ${lowerWords.join("-")}`,
        `snake: ${lowerWords.join("_")}`,
        `camel: ${camel}`,
      ].join("\n");

      return {
        summary: `Generated ${words.length ? 6 : 0} case variants.`,
        output: variants,
        metrics: [
          { label: "Words", value: words.length.toLocaleString(), tone: "primary" },
          { label: "Variants", value: "6", tone: "accent" },
          { label: "Characters", value: text.length.toLocaleString() },
        ],
        tips: [
          "Use kebab-case for URL slugs and snake_case for many config keys.",
          "Camel case is useful for variable names but not for readable public URLs.",
          "Review Korean mixed text manually because case conversion mostly affects Latin letters.",
        ],
      };
    },
  },
  "regex-escape-tool": {
    id: "regex-escape-tool",
    buttonLabel: "Escape regex text",
    fields: [
      { key: "text", label: "Literal text", type: "textarea", placeholder: "price (USD) + tax?" },
    ],
    run: ({ text }) => {
      const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      return {
        summary: "Escaped special regex characters for literal matching.",
        output: escaped,
        metrics: [
          { label: "Original", value: text.length.toLocaleString(), tone: "primary" },
          { label: "Escaped", value: escaped.length.toLocaleString(), tone: "accent" },
          { label: "Added", value: (escaped.length - text.length).toLocaleString() },
        ],
        tips: [
          "Use escaped output when you want a regex to match the exact text.",
          "Do not escape text that is already intended to be a regex pattern.",
          "Test the final pattern in your target language because regex flavors can differ.",
        ],
      };
    },
  },
  "content-decay-monitor-sheet-builder": {
    id: "content-decay-monitor-sheet-builder",
    buttonLabel: "Build decay sheet",
    fields: [
      { key: "url", label: "Content URL or title", type: "text", placeholder: "/blog/example-guide" },
      { key: "metric", label: "Main metric", type: "text", placeholder: "Clicks, impressions, CTR, revenue" },
      { key: "period", label: "Review period", type: "text", placeholder: "Last 28 days vs previous 28 days" },
    ],
    run: ({ url, metric, period }) => {
      const name = url.trim() || "Content page";
      const metricName = metric.trim() || "Clicks";
      const reviewPeriod = period.trim() || "Last 28 days vs previous 28 days";
      const output = [
        "| Page | Metric | Current | Previous | Change % | Suspected cause | Action | Owner | Due |",
        "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
        `| ${name} | ${metricName} |  |  |  | SERP change / outdated info / weak CTA | Refresh intro, update facts, add internal links |  |  |`,
        "",
        `Review period: ${reviewPeriod}`,
      ].join("\n");

      return {
        summary: "Created a content decay tracking table template.",
        output,
        metrics: [
          { label: "Metric", value: metricName, tone: "primary" },
          { label: "Rows", value: "1", tone: "accent" },
          { label: "Period", value: reviewPeriod },
        ],
        tips: [
          "Track impressions and CTR separately because rankings and snippets decay for different reasons.",
          "Refresh facts, screenshots, schema, and internal links before rewriting the whole article.",
          "Review high-traffic pages first because small percentage losses can mean large traffic loss.",
        ],
      };
    },
  },
  "html-meta-tag-builder": {
    id: "html-meta-tag-builder",
    buttonLabel: "Build meta tags",
    fields: [
      { key: "title", label: "Meta title", type: "text", placeholder: "Creator Tools for SEO and Content Workflows" },
      { key: "description", label: "Meta description", type: "textarea", placeholder: "Free creator tools for SEO checks, content planning, and publishing workflows." },
      { key: "url", label: "Canonical URL", type: "text", placeholder: "https://crepika.com/tools/text-counter" },
    ],
    run: ({ title, description, url }) => {
      const cleanTitle = title.trim() || "Page title";
      const cleanDescription = description.trim() || "Page description";
      const canonical = url.trim() || "https://example.com/page";
      const tags = [
        `<title>${cleanTitle}</title>`,
        `<meta name="description" content="${cleanDescription}">`,
        `<link rel="canonical" href="${canonical}">`,
        `<meta property="og:title" content="${cleanTitle}">`,
        `<meta property="og:description" content="${cleanDescription}">`,
        `<meta property="og:url" content="${canonical}">`,
        `<meta name="twitter:card" content="summary_large_image">`,
      ].join("\n");

      return {
        summary: "Generated title, description, canonical, OG, and Twitter meta tags.",
        output: tags,
        metrics: [
          { label: "Title", value: `${cleanTitle.length}/60`, tone: "primary" },
          { label: "Description", value: `${cleanDescription.length}/160`, tone: "accent" },
          { label: "Tags", value: "7" },
        ],
        tips: [
          "Place the primary keyword near the front of the title when it reads naturally.",
          "Use one canonical URL per page and keep it consistent with sitemap URLs.",
          "Write descriptions for clicks and clarity; they are not a direct ranking field.",
        ],
      };
    },
  },
  "jsonld-organization-builder": {
    id: "jsonld-organization-builder",
    buttonLabel: "Build Organization JSON-LD",
    fields: [
      { key: "name", label: "Organization name", type: "text", placeholder: "Crepika" },
      { key: "url", label: "Website URL", type: "text", placeholder: "https://crepika.com" },
      { key: "sameAs", label: "SameAs URLs, comma separated", type: "textarea", placeholder: "https://www.youtube.com/@example, https://www.instagram.com/example" },
    ],
    run: ({ name, url, sameAs }) => {
      const sameAsList = sameAs.split(",").map((item) => item.trim()).filter(Boolean);
      const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: name.trim() || "Organization name",
        url: url.trim() || "https://example.com",
        sameAs: sameAsList,
      };

      return {
        summary: "Generated Organization JSON-LD draft.",
        output: `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`,
        metrics: [
          { label: "sameAs", value: sameAsList.length.toLocaleString(), tone: "primary" },
          { label: "Type", value: "Organization", tone: "accent" },
          { label: "Fields", value: "4" },
        ],
        tips: [
          "Use official profile URLs only; avoid adding inactive or unrelated accounts.",
          "Validate the final JSON-LD with a structured data testing tool before publishing.",
          "Keep organization schema consistent with About, Contact, and policy pages.",
        ],
      };
    },
  },
  "checklist-builder": {
    id: "checklist-builder",
    buttonLabel: "Build checklist",
    fields: [
      { key: "notes", label: "Notes or tasks", type: "textarea", placeholder: "Write title\nCheck meta description\nSubmit sitemap" },
    ],
    run: ({ notes }) => {
      const items = notes.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const checklist = items.map((item) => `- [ ] ${item.replace(/^[-*]\s*/, "")}`).join("\n");

      return {
        summary: `Created a checklist with ${items.length.toLocaleString()} items.`,
        output: checklist,
        metrics: [
          { label: "Items", value: items.length.toLocaleString(), tone: "primary" },
          { label: "Format", value: "Markdown", tone: "accent" },
          { label: "Lines", value: checklist.split(/\r?\n/).length.toLocaleString() },
        ],
        tips: [
          "Start each checklist item with a verb so the next action is clear.",
          "Split broad tasks into smaller checks when someone else will review the work.",
          "Keep acceptance checks separate from implementation tasks when planning releases.",
        ],
      };
    },
  },
  "meeting-notes-action-items": {
    id: "meeting-notes-action-items",
    buttonLabel: "Extract action items",
    fields: [
      { key: "notes", label: "Meeting notes", type: "textarea", placeholder: "Need to update sitemap by Friday\nJohn will review content\nDecision: keep 5-hour cadence" },
    ],
    run: ({ notes }) => {
      const actionLines = notes
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => /해야|필요|will|need|todo|action|by\s+\w+/i.test(line));
      const output = actionLines.length
        ? actionLines.map((line) => `- [ ] ${line}`).join("\n")
        : "- [ ] Review notes manually and assign owners";

      return {
        summary: `Found ${actionLines.length.toLocaleString()} likely action items.`,
        output,
        metrics: [
          { label: "Actions", value: actionLines.length.toLocaleString(), tone: "primary" },
          { label: "Lines", value: notes.split(/\r?\n/).length.toLocaleString(), tone: "accent" },
          { label: "Mode", value: "Heuristic" },
        ],
        tips: [
          "This uses simple wording hints, so confirm owners and deadlines manually.",
          "Rewrite vague action items into owner, task, deadline, and evidence format.",
          "Keep decisions separate from tasks so meeting records stay searchable.",
        ],
      };
    },
  },
  "prompt-brief-builder": {
    id: "prompt-brief-builder",
    buttonLabel: "Build prompt brief",
    fields: [
      { key: "goal", label: "Goal", type: "textarea", placeholder: "Create a blog outline for AdSense approval optimization" },
      { key: "audience", label: "Audience", type: "text", placeholder: "Beginner creators" },
      { key: "constraints", label: "Constraints", type: "textarea", placeholder: "Korean, practical, no external API, include checklist" },
    ],
    run: ({ goal, audience, constraints }) => {
      const output = [
        "Objective:",
        goal.trim() || "Describe the target outcome.",
        "",
        "Audience:",
        audience.trim() || "Describe the intended reader or user.",
        "",
        "Constraints:",
        constraints.trim() || "List style, scope, data, and output constraints.",
        "",
        "Expected output:",
        "- Clear structure",
        "- Actionable steps",
        "- Assumptions and validation notes",
      ].join("\n");

      return {
        summary: "Generated a structured prompt brief.",
        output,
        metrics: [
          { label: "Sections", value: "4", tone: "primary" },
          { label: "Length", value: output.length.toLocaleString(), tone: "accent" },
          { label: "Audience", value: audience.trim() ? "Set" : "Missing" },
        ],
        tips: [
          "A good brief states the target result before process details.",
          "Add examples when tone, format, or domain-specific vocabulary matters.",
          "Include non-goals to prevent unnecessary scope expansion.",
        ],
      };
    },
  },
  "privacy-policy-input-checklist": {
    id: "privacy-policy-input-checklist",
    buttonLabel: "Check data inputs",
    fields: [
      { key: "inputs", label: "Data handled by the tool/site", type: "textarea", placeholder: "Email address\nAnalytics cookies\nUploaded image\nPayment info" },
    ],
    run: ({ inputs }) => {
      const rows = inputs.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const checklist = rows.map((item) => `- [ ] Disclose collection/use/storage for: ${item}`).join("\n");
      const sensitive = rows.filter((item) => /email|phone|payment|address|cookie|location|image|file|name/i.test(item)).length;

      return {
        summary: `Created privacy checklist for ${rows.length.toLocaleString()} data inputs.`,
        output: checklist || "- [ ] List data types first, then describe collection, use, storage, and deletion.",
        metrics: [
          { label: "Inputs", value: rows.length.toLocaleString(), tone: "primary" },
          { label: "Sensitive hints", value: sensitive.toLocaleString(), tone: "accent" },
          { label: "Checklist", value: rows.length ? "Ready" : "Empty" },
        ],
        tips: [
          "Include analytics, cookies, contact forms, uploads, and third-party processors.",
          "Privacy pages should match actual site behavior, not a generic template.",
          "For legal compliance, review jurisdiction-specific requirements with a qualified professional.",
        ],
      };
    },
  },
  "tool-idea-scorer": {
    id: "tool-idea-scorer",
    buttonLabel: "Score tool idea",
    fields: [
      { key: "usefulness", label: "Usefulness 1-10", type: "number", placeholder: "8" },
      { key: "search", label: "Search demand 1-10", type: "number", placeholder: "7" },
      { key: "difference", label: "Differentiation 1-10", type: "number", placeholder: "6" },
      { key: "difficulty", label: "Build difficulty 1-10", type: "number", placeholder: "4" },
    ],
    run: ({ usefulness, search, difference, difficulty }) => {
      const clamp = (value: string) => Math.min(10, Math.max(0, Number(value) || 0));
      const useful = clamp(usefulness);
      const demand = clamp(search);
      const unique = clamp(difference);
      const hard = clamp(difficulty);
      const score = Math.round(useful * 3.5 + demand * 3 + unique * 2 + (10 - hard) * 1.5);

      return {
        summary: `Tool idea score: ${score}/100.`,
        output: [
          `Usefulness: ${useful}/10`,
          `Search demand: ${demand}/10`,
          `Differentiation: ${unique}/10`,
          `Build difficulty: ${hard}/10`,
          `Priority score: ${score}/100`,
        ].join("\n"),
        metrics: [
          { label: "Score", value: `${score}/100`, tone: "primary" },
          { label: "Usefulness", value: `${useful}/10`, tone: "accent" },
          { label: "Difficulty", value: `${hard}/10` },
        ],
        tips: [
          "Prioritize tools that solve a repeatable task in under a minute.",
          "A simple tool can still win if it has clear SEO intent and better explanation.",
          "Avoid building low-usefulness ideas only because they are easy.",
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
