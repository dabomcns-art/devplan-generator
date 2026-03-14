"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Palette,
  Wand2,
  Monitor,
  Tablet,
  Smartphone,
  ChevronLeft,
  Loader2,
  Info,
  CheckSquare,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { useGeneratorStore } from "@/lib/store/generator-store";
import type { DesignData } from "@/lib/types";

const STYLE_PRESETS: { value: DesignData["style_preset"]; label: string; desc: string }[] = [
  { value: "modern_minimal", label: "모던 미니멀", desc: "깔끔한 여백, 심플한 타이포그래피" },
  { value: "business_pro", label: "비즈니스 프로", desc: "신뢰감 있는 구조적 레이아웃" },
  { value: "creative", label: "크리에이티브", desc: "대담한 색상과 동적인 구성" },
  { value: "dark", label: "다크모드", desc: "어두운 배경과 보라 액센트" },
];

const COLOR_PALETTES: { label: string; colors: string[] }[] = [
  { label: "퍼플 글로우", colors: ["#7c3aed", "#a78bfa", "#ede9fe", "#1e1b4b"] },
  { label: "오션 블루", colors: ["#1d4ed8", "#60a5fa", "#dbeafe", "#0f172a"] },
  { label: "에메랄드", colors: ["#059669", "#34d399", "#d1fae5", "#064e3b"] },
  { label: "선셋 오렌지", colors: ["#ea580c", "#fb923c", "#ffedd5", "#431407"] },
  { label: "로즈 핑크", colors: ["#e11d48", "#fb7185", "#ffe4e6", "#4c0519"] },
  { label: "슬레이트 모노", colors: ["#475569", "#94a3b8", "#f1f5f9", "#0f172a"] },
];

const DOC_LABELS: Record<string, string> = {
  claude_md: "CLAUDE.md (메인 컨텍스트)",
  feature_spec: "기능 상세 스펙",
  api_design: "API 설계 문서",
  database_schema: "DB 스키마",
  ui_menu_tree: "UI 메뉴 트리",
  dev_timeline: "개발 일정",
  tech_stack: "기술 스택",
};

type DeviceMode = "desktop" | "tablet" | "mobile";

const DEVICE_SIZES: Record<DeviceMode, { width: string; label: string }> = {
  desktop: { width: "100%", label: "데스크톱" },
  tablet: { width: "768px", label: "태블릿" },
  mobile: { width: "390px", label: "모바일" },
};

export default function DesignPage() {
  const router = useRouter();
  const { overview, documents, design, updateDesignPreset, setDesignStatus, setDesignResults, setStep, saveToLocal } =
    useGeneratorStore();

  const [selectedPalette, setSelectedPalette] = useState<number | null>(null);
  const [customPrompt, setCustomPrompt] = useState(design.custom_prompt || "");
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  const completedDocs = documents.documents.filter((d) => d.status === "completed");

  const handleGenerate = async () => {
    setIsGenerating(true);
    setDesignStatus("generating");

    try {
      const palette =
        selectedPalette !== null ? COLOR_PALETTES[selectedPalette].colors : undefined;

      const res = await fetch("/api/generate-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          style_preset: design.style_preset,
          custom_prompt: customPrompt,
          project_name: overview.project_name,
          color_palette: palette,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error("디자인 생성에 실패했습니다.");

      setPreviewHtml(data.html);
      setIsFallback(data.fallback);
      setDesignStatus("completed");
      setDesignResults([
        {
          id: "wireframe-1",
          filename: "wireframe.html",
          url: "",
          type: "wireframe",
        },
      ]);
      saveToLocal();

      if (data.fallback) {
        toast.info("API 키가 없어 기본 와이어프레임을 표시합니다.", { duration: 4000 });
      } else {
        toast.success("디자인 와이어프레임이 생성되었습니다.");
      }
    } catch (err) {
      setDesignStatus("error");
      toast.error(err instanceof Error ? err.message : "생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    setStep(6);
    saveToLocal();
    router.push("/generator/export");
  };

  const handleBack = () => {
    setStep(4);
    router.push("/generator/documents");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight text-foreground">Step 5: 디자인 생성</h1>
        <p className="text-lg text-muted-foreground">
          스타일 프리셋과 컬러 팔레트로 UI 와이어프레임을 자동 생성합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
        {/* Left Panel: Settings */}
        <div className="flex flex-col gap-5">
          {/* Style Preset */}
          <div className="rounded-2xl border border-primary/10 bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Wand2 className="w-4 h-4 text-primary" />
              <h2 className="font-bold text-sm">스타일 프리셋</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {STYLE_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => updateDesignPreset(preset.value)}
                  className={cn(
                    "text-left p-3 rounded-xl border transition-all",
                    design.style_preset === preset.value
                      ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10"
                      : "border-primary/10 bg-background hover:border-primary/30 text-foreground"
                  )}
                >
                  <div className="font-bold text-sm">{preset.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-snug">
                    {preset.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <div className="rounded-2xl border border-primary/10 bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-4 h-4 text-primary" />
              <h2 className="font-bold text-sm">컬러 팔레트</h2>
            </div>
            <div className="flex flex-col gap-2">
              {COLOR_PALETTES.map((palette, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPalette(idx === selectedPalette ? null : idx)}
                  className={cn(
                    "flex items-center gap-3 p-2.5 rounded-xl border transition-all",
                    selectedPalette === idx
                      ? "border-primary bg-primary/10"
                      : "border-primary/10 hover:border-primary/30"
                  )}
                >
                  <div className="flex gap-1 shrink-0">
                    {palette.colors.map((c, ci) => (
                      <div
                        key={ci}
                        className="w-5 h-5 rounded-full border border-white/10"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <span
                    className={cn(
                      "text-sm",
                      selectedPalette === idx ? "text-primary font-medium" : "text-foreground"
                    )}
                  >
                    {palette.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt */}
          <div className="rounded-2xl border border-primary/10 bg-card p-5">
            <h2 className="font-bold text-sm mb-3">커스텀 프롬프트</h2>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={"추가 디자인 요구사항을 입력하세요...\n예: 카드형 레이아웃, 애니메이션 효과"}
              rows={4}
              className="w-full bg-input border border-primary/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Doc Checklist */}
          <div className="rounded-2xl border border-primary/10 bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-bold text-sm">디자인 API에 전달되는 문서</h2>
              <div className="relative group">
                <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 text-xs bg-card border border-primary/10 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 shadow-xl">
                  생성된 문서의 내용을 참고하여 와이어프레임을 구성합니다.
                </div>
              </div>
            </div>
            {completedDocs.length === 0 ? (
              <p className="text-xs text-muted-foreground">생성된 문서가 없습니다.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {completedDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-2 text-sm">
                    <CheckSquare className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-foreground">
                      {DOC_LABELS[doc.doc_type] || doc.filename}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition-all",
              isGenerating
                ? "bg-primary/40 cursor-not-allowed"
                : "gradient-purple shadow-xl shadow-primary/30 hover:brightness-110 active:scale-[0.98]"
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                와이어프레임 생성 중...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                디자인 생성
              </>
            )}
          </button>
        </div>

        {/* Right Panel: Preview */}
        <div className="flex flex-col gap-4">
          {/* Device Switcher */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-secondary border border-primary/10 rounded-xl p-1">
              {(["desktop", "tablet", "mobile"] as DeviceMode[]).map((mode) => {
                const icons: Record<DeviceMode, React.ReactNode> = {
                  desktop: <Monitor className="w-4 h-4" />,
                  tablet: <Tablet className="w-4 h-4" />,
                  mobile: <Smartphone className="w-4 h-4" />,
                };
                return (
                  <button
                    key={mode}
                    onClick={() => setDeviceMode(mode)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all",
                      deviceMode === mode
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {icons[mode]}
                    <span className="hidden sm:inline">{DEVICE_SIZES[mode].label}</span>
                  </button>
                );
              })}
            </div>

            {isFallback && (
              <span className="text-xs text-muted-foreground bg-primary/5 border border-primary/10 px-2.5 py-1 rounded-full">
                기본 와이어프레임
              </span>
            )}
          </div>

          {/* Preview Area */}
          <div className="flex-1 rounded-2xl border border-primary/10 bg-card overflow-hidden min-h-[500px] flex flex-col">
            {previewHtml ? (
              <div className="flex-1 overflow-auto flex justify-center bg-background/50 p-4">
                <div
                  className="bg-white rounded-xl overflow-hidden transition-all duration-300 shadow-2xl"
                  style={{
                    width: DEVICE_SIZES[deviceMode].width,
                    maxWidth: "100%",
                    minHeight: "500px",
                  }}
                >
                  <iframe
                    srcDoc={previewHtml}
                    className="w-full h-full border-0"
                    style={{ minHeight: "600px" }}
                    title="디자인 미리보기"
                    sandbox="allow-scripts"
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <div className="w-16 h-16 rounded-2xl gradient-purple-subtle border border-primary/20 flex items-center justify-center">
                  <Palette className="w-8 h-8 text-primary/60" />
                </div>
                <div className="text-center">
                  <p className="font-bold mb-1">디자인 미리보기</p>
                  <p className="text-sm">
                    왼쪽 설정을 완료하고{" "}
                    <span className="text-primary font-bold">디자인 생성</span> 버튼을
                    클릭하세요
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-8 border-t border-primary/10">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-primary/10 text-sm font-bold text-muted-foreground hover:bg-secondary transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          이전
        </button>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end text-right">
            <p className="text-xs text-muted-foreground">Next Step</p>
            <p className="text-sm font-bold text-foreground">내보내기</p>
          </div>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-3 rounded-xl gradient-purple text-white text-sm font-bold shadow-xl shadow-primary/20 hover:brightness-110 transition-all group"
          >
            내보내기
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
