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
