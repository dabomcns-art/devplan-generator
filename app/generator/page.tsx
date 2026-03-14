"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import {
  Plus,
  Trash2,
  Sparkles,
  ChevronDown,
  Brain,
  FolderOpen,
  Target,
  FileText,
  Cpu,
  Clock,
  DollarSign,
  Layers,
  ArrowRight,
  Globe,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useGeneratorStore } from "@/lib/store/generator-store";
import { projectOverviewSchema, type ProjectOverviewFormData } from "@/lib/validators/schemas";
import type { Platform } from "@/lib/types";

const TARGET_USER_PRESETS = [
  "일반 소비자",
  "B2B 기업",
  "내부 직원",
  "학생",
  "개발자",
  "디자이너",
  "마케터",
];

const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
  { value: "web", label: "웹" },
  { value: "ios", label: "iOS" },
  { value: "android", label: "Android" },
  { value: "desktop", label: "데스크톱" },
  { value: "api", label: "API" },
];

const BUDGET_OPTIONS = [
  { value: "mvp" as const, label: "MVP", desc: "최소 기능 제품" },
  { value: "medium" as const, label: "중소규모", desc: "주요 기능 포함" },
  { value: "large" as const, label: "대규모", desc: "전체 기능 구현" },
];

const TIMELINE_OPTIONS = [
  { value: "1month" as const, label: "1개월" },
  { value: "3months" as const, label: "3개월" },
  { value: "6months" as const, label: "6개월" },
  { value: "1year" as const, label: "1년" },
];

interface QuickTemplate {
  id: string;
  label: string;
  overview: ProjectOverviewFormData;
}

export default function Step1Page() {
  const router = useRouter();
  const store = useGeneratorStore();
  const [templates, setTemplates] = useState<QuickTemplate[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [analyzeUrl, setAnalyzeUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStatus, setAnalyzeStatus] = useState<"idle" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<ProjectOverviewFormData>({
    resolver: zodResolver(projectOverviewSchema),
    defaultValues: {
      project_name: store.overview.project_name || "",
      project_purpose: store.overview.project_purpose || "",
      target_users: store.overview.target_users.length > 0 ? store.overview.target_users : [],
      core_features: store.overview.core_features.length > 0 ? store.overview.core_features : [],
      platform: store.overview.platform.length > 0 ? store.overview.platform : [],
      budget_scale: store.overview.budget_scale || "mvp",
      timeline: store.overview.timeline || "3months",
    },
    mode: "onChange",
  });

  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({ control, name: "core_features" });

  const watchedData = watch();

  // Load templates
  useEffect(() => {
    fetch("/templates/quick-start.json")
      .then((r) => r.json())
      .then(setTemplates)
      .catch(() => {});
  }, []);

  // Auto-save debounced
  const watchedJson = JSON.stringify(watchedData);
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const data = JSON.parse(watchedJson);
        store.updateOverview(data);
        store.saveToLocal();
      } catch { /* ignore */ }
    }, 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedJson]);

  const handleAnalyzeUrl = async () => {
    if (!analyzeUrl.trim()) return;
    setIsAnalyzing(true);
    setAnalyzeStatus("idle");

    try {
      const res = await fetch("/api/analyze-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: analyzeUrl.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "분석 실패");

      const o = data.overview;
      reset({
        project_name: o.project_name || "",
        project_purpose: o.project_purpose || "",
        target_users: o.target_users || [],
        core_features: o.core_features || [],
        platform: o.platform || [],
        budget_scale: o.budget_scale || "mvp",
        timeline: o.timeline || "3months",
      });
      store.updateOverview(o);
      setAnalyzeStatus("success");
    } catch {
      setAnalyzeStatus("error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyTemplate = (tpl: QuickTemplate) => {
    reset(tpl.overview);
    store.updateOverview(tpl.overview);
    setShowTemplates(false);
  };

  const toggleTargetUser = (label: string) => {
    const current = watchedData.target_users || [];
    const exists = current.find((u) => u.label === label);
    if (exists) {
      setValue(
        "target_users",
        current.filter((u) => u.label !== label),
        { shouldValidate: true }
      );
    } else {
      setValue(
        "target_users",
        [...current, { id: uuidv4(), label }],
        { shouldValidate: true }
      );
    }
  };

  const togglePlatform = (platform: Platform) => {
    const current = watchedData.platform || [];
    if (current.includes(platform)) {
      setValue(
        "platform",
        current.filter((p) => p !== platform),
        { shouldValidate: true }
      );
    } else {
      setValue("platform", [...current, platform], { shouldValidate: true });
    }
  };

  const onSubmit = (data: ProjectOverviewFormData) => {
    store.updateOverview(data);
    store.setStep(2);
    store.saveToLocal();
    router.push("/generator/benchmark");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-black text-foreground">
          Step 1: Project Overview
        </h1>
        <p className="mt-2 text-muted-foreground">
          Define the core foundation of your project so AI can generate the perfect development plan.
        </p>
      </div>

      {/* AI URL Analysis */}
      <div className="rounded-2xl border border-primary/20 shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left: gradient area */}
          <div className="relative flex items-center justify-center md:w-48 min-h-[160px] bg-gradient-to-br from-primary/30 via-primary/10 to-transparent">
            <div className="absolute inset-0 gradient-purple-subtle" />
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/20 shadow-lg shadow-primary/20">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <span className="text-xs font-medium text-primary/70">AI Engine</span>
            </div>
          </div>

          {/* Right: URL input */}
          <div className="flex-1 bg-card p-6">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2 className="text-lg font-bold text-foreground">AI 자동 분석</h2>
              <span className="rounded-full bg-primary/20 px-3 py-0.5 text-xs font-semibold text-primary">
                AI Powered
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              벤치마킹할 서비스 URL을 입력하면 AI가 분석하여 아래 모든 항목을 자동으로 채워줍니다.
            </p>
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="url"
                  value={analyzeUrl}
                  onChange={(e) => { setAnalyzeUrl(e.target.value); setAnalyzeStatus("idle"); }}
                  placeholder="https://example.com"
                  disabled={isAnalyzing}
                  className="w-full rounded-xl border border-slate-800 bg-input pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow disabled:opacity-50"
                />
              </div>
              <button
                type="button"
                onClick={handleAnalyzeUrl}
                disabled={isAnalyzing || !analyzeUrl.trim()}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all shrink-0",
                  isAnalyzing || !analyzeUrl.trim()
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "gradient-purple shadow-lg shadow-primary/30 hover:opacity-90"
                )}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    분석 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    AI 분석
                  </>
                )}
              </button>
            </div>
            {analyzeStatus === "success" && (
              <div className="flex items-center gap-2 text-sm text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                분석 완료! 아래 항목이 자동으로 채워졌습니다.
              </div>
            )}
            {analyzeStatus === "error" && (
              <p className="text-sm text-destructive">분석에 실패했습니다. URL을 확인하고 다시 시도하세요.</p>
            )}

            {/* Template dropdown */}
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-primary/10">
              <span className="text-xs text-muted-foreground">또는</span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="flex items-center gap-2 rounded-xl border border-primary/20 px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  템플릿으로 시작
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showTemplates && "rotate-180")} />
                </button>
                {showTemplates && (
                  <div className="absolute z-10 mt-2 w-72 rounded-xl border border-border bg-card p-2 shadow-xl">
                    {templates.length === 0 && (
                      <p className="px-3 py-2 text-sm text-muted-foreground">템플릿 없음</p>
                    )}
                    {templates.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => applyTemplate(tpl)}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-secondary"
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Name */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm font-bold text-foreground">
            <FolderOpen className="h-4 w-4 text-primary" />
            프로젝트명 <span className="text-destructive">*</span>
          </label>
          <input
            {...register("project_name")}
            placeholder="예: DevPlan Generator"
            className="w-full rounded-xl border border-slate-800 bg-input px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
          />
          {errors.project_name && (
            <p className="text-sm text-destructive">{errors.project_name.message}</p>
          )}
        </div>

        {/* Target Users (Industry Vertical / chip toggle) */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Target className="h-4 w-4 text-primary" />
            타겟 사용자 <span className="text-destructive">*</span>
          </label>
          <div className="flex flex-wrap gap-2 rounded-xl border border-slate-800 bg-input px-4 py-3 min-h-[60px]">
            {TARGET_USER_PRESETS.map((user) => (
              <button
                key={user}
                type="button"
                onClick={() => toggleTargetUser(user)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  watchedData.target_users?.some((u) => u.label === user)
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-slate-700 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                )}
              >
                {user}
              </button>
            ))}
            {/* AI 분석으로 추가된 커스텀 유저 */}
            {(watchedData.target_users || [])
              .filter((u) => !TARGET_USER_PRESETS.includes(u.label))
              .map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => toggleTargetUser(u.label)}
                  className="rounded-full border border-primary bg-primary/20 text-primary px-3 py-1 text-xs font-medium transition-colors"
                >
                  {u.label} ✕
                </button>
              ))}
          </div>
          {errors.target_users && (
            <p className="text-sm text-destructive">{errors.target_users.message}</p>
          )}
        </div>

        {/* Project Description — full width */}
        <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm font-bold text-foreground">
            <FileText className="h-4 w-4 text-primary" />
            프로젝트 목적 <span className="text-destructive">*</span>
          </label>
          <textarea
            {...register("project_purpose")}
            rows={4}
            placeholder="프로젝트의 목적과 배경을 설명해주세요..."
            className="w-full rounded-xl border border-slate-800 bg-input px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow resize-none"
          />
          {errors.project_purpose && (
            <p className="text-sm text-destructive">{errors.project_purpose.message}</p>
          )}
        </div>

        {/* Platform */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Layers className="h-4 w-4 text-primary" />
            플랫폼 <span className="text-destructive">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {PLATFORM_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => togglePlatform(opt.value)}
                className={cn(
                  "rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
                  watchedData.platform?.includes(opt.value)
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-slate-800 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {errors.platform && (
            <p className="text-sm text-destructive">{errors.platform.message}</p>
          )}
        </div>

        {/* Budget Scale */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm font-bold text-foreground">
            <DollarSign className="h-4 w-4 text-primary" />
            프로젝트 규모
          </label>
          <div className="grid grid-cols-3 gap-2">
            {BUDGET_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue("budget_scale", opt.value, { shouldValidate: true })}
                className={cn(
                  "rounded-xl border p-3 text-left transition-colors",
                  watchedData.budget_scale === opt.value
                    ? "border-primary bg-primary/20"
                    : "border-slate-800 hover:border-primary/50"
                )}
              >
                <div className="text-sm font-semibold text-foreground">{opt.label}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Clock className="h-4 w-4 text-primary" />
            목표 기간
          </label>
          <div className="flex flex-wrap gap-2">
            {TIMELINE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue("timeline", opt.value, { shouldValidate: true })}
                className={cn(
                  "rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
                  watchedData.timeline === opt.value
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-slate-800 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Core Features — full width */}
        <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Cpu className="h-4 w-4 text-primary" />
              핵심 기능
            </label>
            <button
              type="button"
              onClick={() => appendFeature({ id: uuidv4(), title: "", priority: "must" })}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-secondary"
            >
              <Plus className="h-3.5 w-3.5 text-primary" />
              기능 추가
            </button>
          </div>
          {errors.core_features && (
            <p className="text-sm text-destructive">{errors.core_features.message}</p>
          )}
          <div className="space-y-2">
            {featureFields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-center gap-3 rounded-xl border border-slate-800 bg-input p-3"
              >
                <input
                  {...register(`core_features.${index}.title`)}
                  placeholder="기능명을 입력하세요"
                  className="flex-1 rounded-xl border border-slate-800 bg-secondary/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                />
                <select
                  {...register(`core_features.${index}.priority`)}
                  className="rounded-xl border border-slate-800 bg-secondary/30 px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                >
                  <option value="must">필수</option>
                  <option value="should">권장</option>
                  <option value="nice">선택</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {featureFields.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-800 py-8 text-center text-sm text-muted-foreground">
                기능을 추가해주세요 (최소 1개)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-6">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="rounded-xl border border-slate-800 px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          취소
        </button>
        <div className="flex items-center gap-4">
          <span className="hidden sm:block text-sm text-muted-foreground">
            다음: 벤치마킹 입력
          </span>
          <button
            type="submit"
            disabled={!isValid}
            className={cn(
              "group flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all",
              isValid
                ? "bg-primary shadow-xl shadow-primary/40 hover:opacity-90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            Continue to Features
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </form>
  );
}
