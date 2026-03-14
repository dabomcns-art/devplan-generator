"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import {
  Plus,
  Trash2,
  ChevronLeft,
  Globe,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useGeneratorStore } from "@/lib/store/generator-store";
import type { BenchmarkTarget, AnalysisScope } from "@/lib/types";

const BENCHMARK_TYPES = [
  { value: "clone" as const, label: "클론", desc: "1:1 전체 기능 복제" },
  { value: "benchmark" as const, label: "벤치마킹", desc: "참고 + 차별화" },
  { value: "reference" as const, label: "참고만", desc: "UI/UX 패턴 참고" },
];

const SCOPE_OPTIONS: { value: AnalysisScope; label: string }[] = [
  { value: "ui_ux", label: "UI/UX" },
  { value: "features", label: "핵심 기능" },
  { value: "business_model", label: "비즈니스 모델" },
  { value: "tech_stack", label: "기술 스택" },
];

const POPULAR_SERVICES = [
  { name: "배달의민족", url: "https://www.baemin.com" },
  { name: "토스", url: "https://toss.im" },
  { name: "당근마켓", url: "https://www.daangn.com" },
  { name: "노션", url: "https://www.notion.so" },
  { name: "리멤버", url: "https://www.rememberapp.co.kr" },
  { name: "인프런", url: "https://www.inflearn.com" },
  { name: "쿠팡", url: "https://www.coupang.com" },
  { name: "카카오", url: "https://www.kakaocorp.com" },
];

export default function Step2Page() {
  const router = useRouter();
  const store = useGeneratorStore();
  const benchmark = store.benchmark;

  const [type, setType] = useState(benchmark.type);
  const [targets, setTargets] = useState<BenchmarkTarget[]>(
    benchmark.targets.length > 0
      ? benchmark.targets
      : [{ id: uuidv4(), service_name: "", analysis_scope: ["ui_ux", "features"] }]
  );
  const [differentiation, setDifferentiation] = useState(benchmark.differentiation || "");
  const [excludeFeatures, setExcludeFeatures] = useState(benchmark.exclude_features || "");

  const addTarget = () => {
    if (targets.length >= 5) return;
    setTargets([
      ...targets,
      { id: uuidv4(), service_name: "", analysis_scope: ["ui_ux", "features"] },
    ]);
  };

  const removeTarget = (id: string) => {
    if (targets.length <= 1) return;
    setTargets(targets.filter((t) => t.id !== id));
  };

  const updateTarget = (id: string, update: Partial<BenchmarkTarget>) => {
    setTargets(targets.map((t) => (t.id === id ? { ...t, ...update } : t)));
  };

  const toggleScope = (targetId: string, scope: AnalysisScope) => {
    const target = targets.find((t) => t.id === targetId);
    if (!target) return;
    const scopes = target.analysis_scope.includes(scope)
      ? target.analysis_scope.filter((s) => s !== scope)
      : [...target.analysis_scope, scope];
    updateTarget(targetId, { analysis_scope: scopes });
  };

  const addPreset = (name: string, url: string) => {
    const exists = targets.find((t) => t.service_name === name);
    if (exists) return;
    if (targets.length >= 5) return;

    const emptySlot = targets.find((t) => !t.service_name);
    if (emptySlot) {
      updateTarget(emptySlot.id, { service_name: name, service_url: url });
    } else {
      setTargets([
        ...targets,
        { id: uuidv4(), service_name: name, service_url: url, analysis_scope: ["ui_ux", "features"] },
      ]);
    }
  };

  const saveAndNext = () => {
    store.updateBenchmark({
      type,
      targets,
      differentiation,
      exclude_features: excludeFeatures,
    });
    store.setStep(3);
    store.saveToLocal();
    router.push("/generator/research");
  };

  const goBack = () => {
    store.updateBenchmark({ type, targets, differentiation, exclude_features: excludeFeatures });
    store.saveToLocal();
    router.push("/generator");
  };

  const isValid = targets.length > 0 && targets.every((t) => t.service_name && t.analysis_scope.length > 0);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight text-foreground">
          Step 2: 벤치마킹 / 클론 타겟
        </h1>
        <p className="text-lg text-muted-foreground">
          참고할 서비스를 입력하고 분석 범위를 설정합니다.
        </p>
      </div>

      {/* Benchmark Type */}
      <div className="rounded-2xl border border-primary/10 bg-card p-6">
        <h2 className="mb-4 text-base font-bold text-foreground">분석 유형</h2>
        <div className="grid grid-cols-3 gap-3">
          {BENCHMARK_TYPES.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setType(opt.value)}
              className={cn(
                "rounded-xl border p-4 text-left transition-all",
                type === opt.value
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                  : "border-primary/10 hover:border-primary/30 bg-background"
              )}
            >
              <div className="text-sm font-bold text-foreground">{opt.label}</div>
              <div className="mt-1 text-xs text-muted-foreground">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Target Services */}
      <div className="rounded-2xl border border-primary/10 bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">타겟 서비스</h2>
          <button
            onClick={addTarget}
            disabled={targets.length >= 5}
            className={cn(
              "flex items-center gap-1.5 rounded-xl border border-primary/20 px-3 py-1.5 text-sm font-medium transition-all",
              targets.length >= 5
                ? "cursor-not-allowed text-muted-foreground/40"
                : "text-primary hover:bg-primary/10"
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            서비스 추가 ({targets.length}/5)
          </button>
        </div>

        <div className="space-y-4">
          {targets.map((target, i) => (
            <div
              key={target.id}
              className="rounded-xl border border-primary/10 bg-background p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  서비스 {i + 1}
                </span>
                {targets.length > 1 && (
                  <button
                    onClick={() => removeTarget(target.id)}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">서비스명</label>
                  <input
                    value={target.service_name}
                    onChange={(e) => updateTarget(target.id, { service_name: e.target.value })}
                    placeholder="예: 토스"
                    className="w-full rounded-xl border border-primary/10 bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">URL (선택)</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={target.service_url || ""}
                      onChange={(e) => updateTarget(target.id, { service_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full rounded-xl border border-primary/10 bg-input py-3 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">분석 범위</label>
                <div className="flex flex-wrap gap-2">
                  {SCOPE_OPTIONS.map((scope) => (
                    <button
                      key={scope.value}
                      onClick={() => toggleScope(target.id, scope.value)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                        target.analysis_scope.includes(scope.value)
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-primary/10 text-muted-foreground hover:border-primary/30"
                      )}
                    >
                      {scope.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Services */}
      <div className="rounded-2xl border border-primary/10 bg-card p-6">
        <h2 className="mb-4 text-base font-bold text-foreground">인기 서비스 프리셋</h2>
        <div className="grid grid-cols-4 gap-2">
          {POPULAR_SERVICES.map((svc) => (
            <button
              key={svc.name}
              onClick={() => addPreset(svc.name, svc.url)}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
                targets.some((t) => t.service_name === svc.name)
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-primary/10 text-muted-foreground hover:border-primary/30 hover:bg-primary/5"
              )}
            >
              {svc.name}
            </button>
          ))}
        </div>
      </div>

      {/* Differentiation & Exclusion */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-primary/10 bg-card p-6">
          <h2 className="mb-3 text-base font-bold text-foreground">차별화 포인트</h2>
          <textarea
            value={differentiation}
            onChange={(e) => setDifferentiation(e.target.value)}
            rows={3}
            placeholder="우리 서비스만의 차별화 포인트..."
            className="w-full rounded-xl border border-primary/10 bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all"
          />
        </div>
        <div className="rounded-2xl border border-primary/10 bg-card p-6">
          <h2 className="mb-3 text-base font-bold text-foreground">제외 기능</h2>
          <textarea
            value={excludeFeatures}
            onChange={(e) => setExcludeFeatures(e.target.value)}
            rows={3}
            placeholder="제외하고 싶은 기능..."
            className="w-full rounded-xl border border-primary/10 bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all"
          />
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-8 border-t border-primary/10">
        <button
          onClick={goBack}
          className="flex items-center gap-2 rounded-xl border border-primary/10 px-6 py-3 text-sm font-bold text-muted-foreground hover:bg-secondary transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
          이전
        </button>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end text-right">
            <p className="text-xs text-muted-foreground">Next Step</p>
            <p className="text-sm font-bold text-foreground">업계 조사</p>
          </div>
          <button
            onClick={saveAndNext}
            disabled={!isValid}
            className={cn(
              "flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold text-white transition-all group",
              isValid
                ? "gradient-purple shadow-xl shadow-primary/30 hover:brightness-110"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            업계 조사
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
