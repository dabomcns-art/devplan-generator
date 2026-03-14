"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Search,
  ChevronLeft,
  Plus,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Loader2,
  Circle,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useGeneratorStore } from "@/lib/store/generator-store";
import type { ResearchQuery, Source } from "@/lib/types";

const TAB_CONFIG = [
  { id: "market_analysis" as const, label: "시장분석" },
  { id: "competitor_analysis" as const, label: "경쟁사" },
  { id: "korean_market" as const, label: "한국시장" },
  { id: "tech_trends" as const, label: "기술트렌드" },
] as const;

type TabId = (typeof TAB_CONFIG)[number]["id"];

function QueryStatusIcon({ status }: { status: ResearchQuery["status"] }) {
  if (status === "pending") return <Circle className="w-4 h-4 text-muted-foreground" />;
  if (status === "running") return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
  if (status === "completed") return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  return <XCircle className="w-4 h-4 text-destructive" />;
}

function QueryStatusBadge({ status }: { status: ResearchQuery["status"] }) {
  const labels: Record<ResearchQuery["status"], string> = {
    pending: "대기",
    running: "조사중",
    completed: "완료",
    error: "오류",
  };
  const colors: Record<ResearchQuery["status"], string> = {
    pending: "text-muted-foreground bg-secondary",
    running: "text-primary bg-primary/10",
    completed: "text-green-400 bg-green-500/10",
    error: "text-destructive bg-destructive/10",
  };
  return (
    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", colors[status])}>
      {labels[status]}
    </span>
  );
}

export default function ResearchPage() {
  const router = useRouter();
  const {
    overview,
    benchmark,
    research,
    setResearchStatus,
    setResearchQueries,
    updateResearchQuery,
    setResearchResults,
    setStep,
  } = useGeneratorStore();

  const [activeTab, setActiveTab] = useState<TabId>("market_analysis");
  const [customQuery, setCustomQuery] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const completedCount = research.queries.filter((q) => q.status === "completed").length;
  const totalCount = research.queries.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const runResearch = useCallback(
    async (custom?: string) => {
      if (isRunning) return;
      setIsRunning(true);
      setResearchStatus("running");

      try {
        const res = await fetch("/api/research", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            overview,
            benchmark,
            ...(custom ? { customQuery: custom } : {}),
          }),
        });

        if (!res.ok || !res.body) {
          throw new Error("조사 API 호출 실패");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        const accumulatedResults = {
          market_analysis: "",
          competitor_analysis: "",
          korean_market: "",
          tech_trends: "",
        };
        const accumulatedSources: Source[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("event: ")) continue;
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.queryId && data.query) {
                  setResearchQueries(
                    research.queries.length > 0
                      ? research.queries
                      : [
                          {
                            id: data.queryId,
                            query: data.query,
                            category: data.category,
                            status: "running",
                          },
                        ]
                  );
                  updateResearchQuery(data.queryId, { status: "running" });
                } else if (data.queryId && (data.content !== undefined || data.error)) {
                  if (data.error) {
                    updateResearchQuery(data.queryId, { status: "error" });
                  } else {
                    updateResearchQuery(data.queryId, { status: "completed" });
                    if (data.sources) accumulatedSources.push(...data.sources);
                  }
                } else if (data.results) {
                  Object.assign(accumulatedResults, data.results);
                  if (data.sources) accumulatedSources.push(...data.sources);
                  setResearchResults(accumulatedResults, accumulatedSources);
                }
              } catch {
                // ignore parse errors
              }
            }
          }
        }

        setResearchStatus("completed");
      } catch (err) {
        console.error("Research error:", err);
        setResearchStatus("error");
      } finally {
        setIsRunning(false);
      }
    },
    [isRunning, overview, benchmark, research.queries, setResearchStatus, setResearchQueries, updateResearchQuery, setResearchResults]
  );

  const handleStart = () => {
    if (research.queries.length === 0) {
      import("@/lib/prompts/research-queries").then(({ generateResearchQueries }) => {
        const queries = generateResearchQueries(overview, benchmark);
        setResearchQueries(queries);
        runResearch();
      });
    } else {
      runResearch();
    }
  };

  const handleCustomQuery = () => {
    if (!customQuery.trim()) return;
    runResearch(customQuery.trim());
    setCustomQuery("");
  };

  const handleNext = () => {
    setStep(4);
    router.push("/generator/documents");
  };

  const handlePrev = () => {
    setStep(2);
    router.push("/generator/benchmark");
  };

  const activeContent = research.results[activeTab];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight text-foreground">Step 3: 업계 조사</h1>
        <p className="text-lg text-muted-foreground">
          AI가 시장 분석, 경쟁사 조사, 기술 트렌드를 자동으로 수집합니다.
        </p>
      </div>

      {/* Query List */}
      <div className="rounded-2xl border border-primary/10 bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-foreground">조사 항목</h2>
          {totalCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {completedCount}/{totalCount} 완료
            </span>
          )}
        </div>

        {research.queries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            [조사 시작] 버튼을 클릭하면 자동으로 조사 항목이 생성됩니다.
          </p>
        ) : (
          <ul className="space-y-2">
            {research.queries.map((q) => (
              <li
                key={q.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10"
              >
                <div className="mt-0.5 shrink-0">
                  <QueryStatusIcon status={q.status} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-snug line-clamp-2">{q.query}</p>
                </div>
                <div className="shrink-0">
                  <QueryStatusBadge status={q.status} />
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>전체 진행률</span>
              <span className="font-bold">{progress}%</span>
            </div>
            <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Start button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleStart}
            disabled={isRunning}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all",
              "gradient-purple text-white shadow-xl shadow-primary/20",
              "hover:brightness-110 active:scale-95",
              isRunning && "opacity-60 cursor-not-allowed"
            )}
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                조사 중...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                조사 시작
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Viewer */}
      {research.status !== "idle" && (
        <div className="rounded-2xl border border-primary/10 bg-card overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-primary/10">
            {TAB_CONFIG.map((tab) => {
              const hasContent = !!research.results[tab.id];
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-5 py-3 text-sm font-medium transition-colors relative",
                    activeTab === tab.id
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                    !hasContent && "opacity-50"
                  )}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="p-6 min-h-[300px]">
            {activeContent ? (
              <div className="prose-dark">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeContent}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                {isRunning ? (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
                    <p className="text-sm">조사 중입니다...</p>
                  </>
                ) : (
                  <>
                    <Search className="w-8 h-8 mb-3 opacity-30" />
                    <p className="text-sm">조사를 시작하면 결과가 여기에 표시됩니다.</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sources */}
      {research.sources.length > 0 && (
        <div className="rounded-2xl border border-primary/10 bg-card p-6">
          <h2 className="text-base font-bold text-foreground mb-3">참고 출처</h2>
          <ul className="space-y-2">
            {research.sources.map((source, i) => (
              <li key={i}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors group"
                >
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="truncate">{source.title || source.url}</span>
                </a>
                {source.snippet && (
                  <p className="text-xs text-muted-foreground mt-0.5 ml-5 line-clamp-1">
                    {source.snippet}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Custom Query */}
      <div className="rounded-2xl border border-primary/10 bg-card p-6">
        <h2 className="text-base font-bold text-foreground mb-3">추가 조사</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCustomQuery()}
            placeholder="추가로 조사하고 싶은 내용을 입력하세요..."
            className="flex-1 px-4 py-3 rounded-xl border border-primary/10 bg-input text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
          <button
            onClick={handleCustomQuery}
            disabled={!customQuery.trim() || isRunning}
            className={cn(
              "flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-bold",
              "bg-primary/10 text-primary border border-primary/20",
              "hover:bg-primary/20 transition-all",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            <Plus className="w-4 h-4" />
            추가
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-8 border-t border-primary/10">
        <button
          onClick={handlePrev}
          className="flex items-center gap-2 rounded-xl border border-primary/10 px-6 py-3 text-sm font-bold text-muted-foreground hover:bg-secondary transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          이전
        </button>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end text-right">
            <p className="text-xs text-muted-foreground">Next Step</p>
            <p className="text-sm font-bold text-foreground">문서 생성</p>
          </div>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-3 rounded-xl gradient-purple text-white text-sm font-bold shadow-xl shadow-primary/20 hover:brightness-110 transition-all group"
          >
            문서 생성
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
