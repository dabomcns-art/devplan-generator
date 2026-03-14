"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Files,
  HardDrive,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Coins,
  FileDown,
  Loader2,
  Cloud,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { saveAs } from "file-saver";
import { cn } from "@/lib/utils/cn";
import { useGeneratorStore } from "@/lib/store/generator-store";
import { createProjectZip } from "@/lib/utils/zip";
import FileTree, { type TreeFile } from "@/components/shared/file-tree";
import { MarkdownPreview } from "@/components/shared/markdown-preview";
import type { DocumentFile } from "@/lib/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function estimateDeployTime(docCount: number): string {
  if (docCount <= 3) return "~1분";
  if (docCount <= 5) return "~2분";
  return "~3분";
}

function docToTreeFile(doc: DocumentFile): TreeFile {
  return {
    name: doc.filename,
    path: `docs/${doc.filename}`,
    size: new Blob([doc.content]).size,
    type: "markdown",
  };
}

function buildTreeFiles(
  projectName: string,
  docs: DocumentFile[],
  hasDesign: boolean
): TreeFile[] {
  const safeName = projectName.replace(/[^a-zA-Z0-9가-힣\-_]/g, "_") || "project";

  const children: TreeFile[] = [
    {
      name: "docs",
      path: "docs",
      type: "folder",
      children: docs.map(docToTreeFile),
    },
  ];

  if (hasDesign) {
    children.push({
      name: "design",
      path: "design",
      type: "folder",
      children: [
        { name: "wireframe.html", path: "design/wireframe.html", type: "html" },
      ],
    });
  }

  children.push({ name: "README.md", path: "README.md", type: "markdown" });

  return [{ name: safeName, path: safeName, type: "folder", children }];
}

// ─── Stats Card ───────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}

function StatCard({ icon, label, value, sub }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-primary/5 border border-primary/10 p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ExportPage() {
  const router = useRouter();
  const { overview, documents, design, research, resetAll, setStep, saveToLocal } =
    useGeneratorStore();

  const completedDocs = documents.documents.filter((d) => d.status === "completed");
  const hasDesign = design.results.length > 0;

  const totalSizeBytes = completedDocs.reduce(
    (acc, d) => acc + new Blob([d.content]).size,
    0
  );
  const totalFiles = completedDocs.length + (hasDesign ? 1 : 0) + 1; // +README
  const totalTokens = documents.total_tokens_used;
  const estimatedCostUsd = (totalTokens / 1_000_000) * 15; // Claude Sonnet output price estimate

  const treeFiles = buildTreeFiles(overview.project_name, completedDocs, hasDesign);

  const [selectedDoc, setSelectedDoc] = useState<DocumentFile | null>(
    completedDocs[0] || null
  );
  const [isDownloading, setIsDownloading] = useState(false);

  const handleFileSelect = useCallback(
    (file: TreeFile) => {
      if (file.type === "folder") return;
      // Find matching document by path
      const doc = completedDocs.find((d) => `docs/${d.filename}` === file.path);
      if (doc) setSelectedDoc(doc);
      else setSelectedDoc(null);
    },
    [completedDocs]
  );

  const handleDownloadSingle = (doc: DocumentFile) => {
    const blob = new Blob([doc.content], { type: "text/markdown;charset=utf-8" });
    saveAs(blob, doc.filename);
    toast.success(`${doc.filename} 다운로드 완료`);
  };

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      const blob = await createProjectZip({
        projectName: overview.project_name || "devplan-project",
        documents: completedDocs,
        research: research.status === "completed" ? research : undefined,
        designFiles: design.results,
      });

      const safeName =
        (overview.project_name || "devplan-project").replace(/[^a-zA-Z0-9가-힣\-_]/g, "_");
      saveAs(blob, `${safeName}.zip`);
      toast.success("ZIP 파일 다운로드 완료");

      // Mark as completed
      setStep(6);
      saveToLocal();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "다운로드에 실패했습니다.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleNewProject = () => {
    resetAll();
    router.push("/");
  };

  const handleBack = () => {
    setStep(5);
    router.push("/generator/design");
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span>Project</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span>Build</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-primary font-medium">Export</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Step 6: Export Project</h1>
          <p className="text-muted-foreground">
            생성된 모든 산출물을 확인하고 다운로드하세요.
          </p>
        </div>
        <button
          onClick={handleDownloadZip}
          disabled={isDownloading || completedDocs.length === 0}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-xl shadow-primary/30 transition-all duration-200 whitespace-nowrap",
            isDownloading || completedDocs.length === 0
              ? "bg-primary/40 cursor-not-allowed"
              : "bg-primary hover:-translate-y-1 active:translate-y-0"
          )}
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              ZIP 생성 중...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download All as ZIP
            </>
          )}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<Files className="w-5 h-5 text-primary" />}
          label="Total Files"
          value={`${totalFiles}개`}
          sub={`문서 ${completedDocs.length}개${hasDesign ? " + 디자인 1개" : ""} + README`}
        />
        <StatCard
          icon={<HardDrive className="w-5 h-5 text-primary" />}
          label="Build Size"
          value={formatBytes(totalSizeBytes)}
          sub="압축 전 총 크기"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-primary" />}
          label="Est. Deploy Time"
          value={estimateDeployTime(completedDocs.length)}
          sub="Vercel 기준"
        />
      </div>

      {/* Main Layout: cols-12 */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: File Explorer (col-span-4) */}
        <div className="xl:col-span-4 rounded-2xl bg-primary/5 border border-primary/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-primary/10">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Project Tree
            </h2>
          </div>
          <div className="p-3 overflow-auto max-h-[520px]">
            {treeFiles.length > 0 ? (
              <FileTree
                files={treeFiles}
                selectedPath={selectedDoc ? `docs/${selectedDoc.filename}` : undefined}
                onSelect={handleFileSelect}
              />
            ) : (
              <p className="text-xs text-muted-foreground px-3 py-4">
                생성된 파일이 없습니다.
              </p>
            )}
          </div>
        </div>

        {/* Right: File Preview Cards (col-span-8) */}
        <div className="xl:col-span-8">
          {completedDocs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {completedDocs.map((doc) => {
                const isSelected = selectedDoc?.filename === doc.filename;
                return (
                  <button
                    key={doc.filename}
                    onClick={() => setSelectedDoc(doc)}
                    className={cn(
                      "rounded-2xl bg-primary/5 border text-left transition-all duration-200 overflow-hidden group",
                      isSelected
                        ? "border-primary/50 shadow-lg shadow-primary/10"
                        : "border-primary/10 hover:border-primary/50"
                    )}
                  >
                    {/* Preview area */}
                    <div className="h-40 bg-background rounded-xl m-3 mb-0 relative overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
                      {isSelected && selectedDoc ? (
                        <div className="relative z-10 w-full h-full overflow-hidden p-3">
                          <div className="text-[10px] text-muted-foreground leading-relaxed line-clamp-[8] font-mono whitespace-pre-wrap break-words">
                            {selectedDoc.content.slice(0, 400)}
                          </div>
                        </div>
                      ) : (
                        <div className="relative z-10 flex flex-col items-center gap-2 text-muted-foreground/40">
                          <Files className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* File info */}
                    <div className="px-4 py-3 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">{doc.filename}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          markdown · {formatBytes(new Blob([doc.content]).size)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadSingle(doc);
                          }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="개별 다운로드"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>
                        <Eye className="w-4 h-4 text-muted-foreground/50" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center py-20 text-muted-foreground text-sm">
              생성된 문서가 없습니다.
            </div>
          )}

          {/* Selected file full preview */}
          {selectedDoc && (
            <div className="mt-4 rounded-2xl bg-primary/5 border border-primary/10 overflow-hidden">
              <div className="px-5 py-3 border-b border-primary/10 flex items-center justify-between">
                <span className="text-sm font-mono font-medium">{selectedDoc.filename}</span>
                <span className="text-xs text-muted-foreground">
                  {formatBytes(new Blob([selectedDoc.content]).size)}
                </span>
              </div>
              <div className="overflow-auto p-5 max-h-[360px]">
                <MarkdownPreview content={selectedDoc.content} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cloud Sync Banner */}
      <div className="rounded-2xl bg-primary/10 border border-primary/20 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="w-11 h-11 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
          <Cloud className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground">Cloud Sync Enabled</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            프로젝트 산출물이 자동으로 클라우드에 동기화됩니다. 언제든지 다시 접근할 수 있습니다.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/30 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Preview All
          </button>
          <button
            onClick={handleNewProject}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Next Project
          </button>
        </div>
      </div>

      {/* Summary (token / cost info) */}
      {(totalTokens > 0 || estimatedCostUsd > 0) && (
        <div className="rounded-2xl bg-primary/5 border border-primary/10 p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Usage Summary
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">프로젝트명</p>
              <p className="text-sm font-medium">{overview.project_name || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">생성 문서</p>
              <p className="text-sm font-medium">{completedDocs.length}종</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Coins className="w-3 h-3" />
                토큰 사용량
              </p>
              <p className="text-sm font-medium">
                {totalTokens > 0 ? `${(totalTokens / 1000).toFixed(1)}K` : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">API 비용 추정</p>
              <p className="text-sm font-medium">
                {estimatedCostUsd > 0 ? `~$${estimatedCostUsd.toFixed(3)}` : "—"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
