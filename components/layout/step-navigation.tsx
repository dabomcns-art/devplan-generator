"use client";

import {
  Lightbulb,
  Target,
  Search,
  FileText,
  Palette,
  Download,
  Check,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const STEPS = [
  { id: 1, label: "프로젝트 개요", icon: Lightbulb },
  { id: 2, label: "벤치마킹", icon: Target },
  { id: 3, label: "업계 조사", icon: Search },
  { id: 4, label: "문서 생성", icon: FileText },
  { id: 5, label: "디자인", icon: Palette },
  { id: 6, label: "내보내기", icon: Download },
];

interface StepNavigationProps {
  currentStep: number;
  completedSteps?: number[];
}

export default function StepNavigation({ currentStep, completedSteps = [] }: StepNavigationProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-primary/10">
        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <Rocket className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-foreground text-sm font-bold">Project Setup</h3>
          <p className="text-muted-foreground text-xs">v1.2.0 Stable</p>
        </div>
      </div>

      {/* Steps */}
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {STEPS.map((step) => {
          const isCompleted = completedSteps.includes(step.id) || step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isAccessible = isCompleted || isCurrent;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                isCurrent && "bg-primary text-white shadow-lg shadow-primary/20",
                isCompleted && !isCurrent && "text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer",
                !isAccessible && "text-muted-foreground/40 cursor-not-allowed"
              )}
            >
              <div className="relative">
                {isCompleted && !isCurrent ? (
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                ) : (
                  <Icon className={cn(
                    "w-5 h-5",
                    isCurrent && "text-white",
                    !isCurrent && !isCompleted && "text-muted-foreground/40"
                  )} />
                )}
              </div>
              <span className={cn(
                "text-sm font-medium",
                isCurrent && "font-semibold"
              )}>
                {step.id}. {step.label}
              </span>
            </div>
          );
        })}
      </nav>

      {/* Pro Tip */}
      <div className="mx-3 mb-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Pro Tip</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          상세한 설명을 입력할수록 AI가 더 정확한 계획서를 생성합니다.
        </p>
      </div>
    </div>
  );
}
