"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, FolderOpen, Trash2, ArrowLeft, FileText } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ProjectMeta } from "@/lib/types";
import { useGeneratorStore } from "@/lib/store/generator-store";

const STEP_LABELS: Record<number, string> = {
  1: "프로젝트 개요",
  2: "벤치마킹",
  3: "업계 조사",
  4: "문서 생성",
  5: "디자인",
  6: "내보내기",
};

export default function HistoryPage() {
  const [projects, setProjects] = useState<ProjectMeta[]>([]);
  const loadFromLocal = useGeneratorStore((s) => s.loadFromLocal);

  useEffect(() => {
    const raw = localStorage.getItem("devplan:projects");
    if (raw) {
      try {
        setProjects(JSON.parse(raw));
      } catch {
        // ignore
      }
    }
  }, []);

  const handleDelete = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    localStorage.setItem("devplan:projects", JSON.stringify(updated));
    localStorage.removeItem(`devplan:project:${id}`);
  };

  const handleOpen = (id: string) => {
    loadFromLocal(id);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>홈으로</span>
            </Link>
            <h1 className="text-xl font-bold">프로젝트 히스토리</h1>
          </div>
          <Link
            href="/generator"
            className="rounded-lg gradient-purple px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            새 프로젝트
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-6 py-8">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="mb-4 h-16 w-16 text-muted-foreground/30" />
            <h2 className="mb-2 text-lg font-semibold text-foreground">
              아직 생성한 프로젝트가 없습니다
            </h2>
            <p className="mb-6 text-muted-foreground">
              새 프로젝트를 시작하여 AI 기반 개발 계획서를 생성해보세요.
            </p>
            <Link
              href="/generator"
              className="rounded-lg gradient-purple px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
            >
              프로젝트 시작하기
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group flex items-center justify-between rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground">
                      {project.name}
                    </h3>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium",
                        project.status === "completed"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      {project.status === "completed" ? "완료" : "진행 중"}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(project.updated_at).toLocaleDateString("ko-KR")}
                    </span>
                    <span>
                      Step {project.current_step}: {STEP_LABELS[project.current_step]}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Link
                    href="/generator"
                    onClick={() => handleOpen(project.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-secondary"
                  >
                    <FolderOpen className="h-3.5 w-3.5" />
                    열기
                  </Link>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
