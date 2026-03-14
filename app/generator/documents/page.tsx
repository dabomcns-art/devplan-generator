"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Loader2,
  CheckCircle2,
  Circle,
  XCircle,
  RefreshCw,
  Edit3,
  Save,
  FileText,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useGeneratorStore } from "@/lib/store/generator-store";
import { MarkdownPreview } from "@/components/shared/markdown-preview";
import type { DocType, DocumentFile } from "@/lib/types";

const DOC_CONFIGS: { type: DocType; filename: string; label: string }[] = [
  { type: "claude_md", filename: "claude.MD", label: "claude.MD" },
  { type: "feature_spec", filename: "docs/feature-spec.md", label: "기능 스펙" },
  { type: "api_design", filename: "docs/api-design.md", label: "API 설계" },
  { type: "database_schema", filename: "docs/database-schema.md", label: "DB 스키마" },
  { type: "ui_menu_tree", filename: "docs/ui-menu-tree.md", label: "UI 메뉴 트리" },
  { type: "dev_timeline", filename: "docs/development-timeline.md", label: "개발 일정" },
  { type: "tech_stack", filename: "docs/tech-stack.md", label: "기술 스택" },
];

const SIDEBAR_ICONS: Record<DocType, string> = {
  claude_md: "O",
  feature_spec: "F",
  api_design: "A",
  database_schema: "D",
  ui_menu_tree: "U",
  dev_timeline: "T",
  tech_stack: "S",
};

export default function Step4Page() {
  const router = useRouter();
  const store = useGeneratorStore();
  const docs = store.documents;
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [copied, setCopied] = useState(false);

  const selectedDoc = docs.documents.find((d) => d.id === selectedDocId);

  const generateDoc = async (docType: DocType, filename: string) => {
    const docId = uuidv4();
    const existingIdx = docs.documents.findIndex((d) => d.doc_type === docType);

    if (existingIdx >= 0) {
      store.updateDocument(docs.documents[existingIdx].id, { status: "generating", content: "" });
    } else {
      store.addDocument({
        id: docId,
        filename,
        doc_type: docType,
        content: "",
        status: "generating",
        tokens_used: 0,
        created_at: new Date().toISOString(),
        modified: false,
      });
    }

    const targetId = existingIdx >= 0 ? docs.documents[existingIdx].id : docId;
    setSelectedDocId(targetId);

    try {
      const response = await fetch("/api/generate-docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doc_type: docType,
          context: {
            overview: store.overview,
            benchmark: store.benchmark,
            research: store.research,
            documents: store.documents,
          },
        }),
      });

      if (!response.ok) throw new Error("Document generation failed");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        store.updateDocument(targetId, { content: fullContent });
      }

      store.updateDocument(targetId, {
        status: "completed",
        content: fullContent,
        tokens_used: Math.ceil(fullContent.length / 4),
      });
    } catch {
      store.updateDocument(targetId, { status: "error" });
    }
  };

  const generateAll = async () => {
    setIsGenerating(true);
    store.setDocumentsStatus("generating");

    for (const config of DOC_CONFIGS) {
      await generateDoc(config.type, config.filename);
    }

    store.setDocumentsStatus("completed");
    setIsGenerating(false);
    store.saveToLocal();
  };

  const regenerateDoc = async (doc: DocumentFile) => {
    const config = DOC_CONFIGS.find((c) => c.type === doc.doc_type);
    if (config) {
      await generateDoc(config.type, config.filename);
    }
  };

  const saveEdit = () => {
    if (selectedDoc) {
      store.updateDocumentContent(selectedDoc.id, editContent);
      setEditMode(false);
    }
  };

  const startEdit = () => {
    if (selectedDoc) {
      setEditContent(selectedDoc.content);
      setEditMode(true);
    }
  };

  const copyContent = () => {
    if (selectedDoc) {
      navigator.clipboard.writeText(selectedDoc.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const completedDocs = docs.documents.filter((d) => d.status === "completed").length;
  const totalTokens = docs.documents.reduce((sum: number, d) => sum + d.tokens_used, 0);
  void totalTokens;

  // Compute streaming progress
  const generatingIdx = DOC_CONFIGS.findIndex((c) => {
    const doc = docs.documents.find((d) => d.doc_type === c.type);
    return doc?.status === "generating";
  });
  const progressPercent =
    isGenerating
      ? Math.round(((completedDocs + (generatingIdx >= 0 ? 0.5 : 0)) / DOC_CONFIGS.length) * 100)
      : completedDocs > 0
      ? Math.round((completedDocs / DOC_CONFIGS.length) * 100)
      : 0;
  const currentTaskLabel =
    generatingIdx >= 0 ? DOC_CONFIGS[generatingIdx].filename : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                "text-xs font-medium uppercase tracking-wider text-primary",
                isGenerating && "flex items-center gap-1.5"
              )}
            >
              {isGenerating && (
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              )}
              {isGenerating ? "AI GENERATION IN PROGRESS" : "STEP 4"}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Technical Specification</h1>
          <p className="mt-1 text-muted-foreground">
            Claude AI가 프로젝트 문서를 자동 생성합니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedDoc?.status === "completed" && !editMode && (
            <button
              onClick={() => regenerateDoc(selectedDoc)}
              className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
            >
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </button>
          )}
          {!isGenerating && docs.status !== "completed" && (
            <button
              onClick={generateAll}
              className="flex items-center gap-2 rounded-lg gradient-purple px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <Play className="h-4 w-4" />
              전체 생성
            </button>
          )}
        </div>
      </div>

      {/* Streaming Progress Bar */}
      {(isGenerating || completedDocs > 0) && (
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Current Task:</span>
              {currentTaskLabel ? (
                <span className="font-mono italic text-primary">{currentTaskLabel}</span>
              ) : (
                <span className="font-mono italic text-green-400">All tasks completed</span>
              )}
            </div>
            <span className="font-mono text-foreground font-semibold">{progressPercent}%</span>
          </div>

          {/* Progress track */}
          <div className="h-2 w-full rounded-full bg-primary/10">
            <div
              className="h-2 rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2 pt-1">
            {DOC_CONFIGS.map((config, idx) => {
              const doc = docs.documents.find((d) => d.doc_type === config.type);
              const status = doc?.status || "pending";
              return (
                <div key={config.type} className="flex items-center gap-1.5">
                  {idx > 0 && (
                    <div
                      className={cn(
                        "h-px w-4",
                        status === "completed" ? "bg-green-500/40" : "bg-primary/20"
                      )}
                    />
                  )}
                  {status === "completed" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  ) : status === "generating" ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : status === "error" ? (
                    <XCircle className="h-4 w-4 text-destructive" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground/40" />
                  )}
                </div>
              );
            })}
            <span className="ml-2 text-xs text-muted-foreground">
              {completedDocs}/{DOC_CONFIGS.length} docs
            </span>
          </div>
        </div>
      )}

      {/* Main Layout: Sidebar + Code Editor */}
      <div className="grid grid-cols-[220px_1fr] gap-4">
        {/* Document Type Sidebar */}
        <div className="rounded-xl border border-primary/20 bg-card p-3 space-y-1">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Documents
          </p>
          {DOC_CONFIGS.map((config) => {
            const doc = docs.documents.find((d) => d.doc_type === config.type);
            const status = doc?.status || "pending";
            const isSelected = selectedDocId && doc?.id === selectedDocId;
            return (
              <button
                key={config.type}
                onClick={() => doc && setSelectedDocId(doc.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  isSelected
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-[10px] font-bold",
                    isSelected ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                  )}
                >
                  {SIDEBAR_ICONS[config.type]}
                </span>
                <span className="flex-1 truncate text-xs font-medium">{config.label}</span>
                {status === "completed" && (
                  <CheckCircle2 className="h-3 w-3 flex-shrink-0 text-green-400" />
                )}
                {status === "generating" && (
                  <Loader2 className="h-3 w-3 flex-shrink-0 animate-spin text-primary" />
                )}
                {status === "error" && (
                  <XCircle className="h-3 w-3 flex-shrink-0 text-destructive" />
                )}
              </button>
            );
          })}
        </div>

        {/* Code Editor Section */}
        <div className="rounded-xl border border-primary/20 shadow-2xl overflow-hidden flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center gap-3 bg-[#1e1329] px-4 py-3 border-b border-primary/20">
            {/* macOS traffic lights */}
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            {/* Filename */}
            <span className="flex-1 text-center font-mono text-xs text-muted-foreground">
              {selectedDoc ? selectedDoc.filename : "— select a document —"}
              {selectedDoc?.modified && (
                <span className="ml-2 text-yellow-400">●</span>
              )}
            </span>
            {/* Action buttons */}
            <div className="flex items-center gap-1.5">
              {selectedDoc?.status === "completed" && !editMode && (
                <>
                  <button
                    onClick={copyContent}
                    className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    <Copy className="h-3 w-3" />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={startEdit}
                    className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    <Edit3 className="h-3 w-3" />
                    Edit
                  </button>
                </>
              )}
              {editMode && (
                <button
                  onClick={saveEdit}
                  className="flex items-center gap-1 rounded gradient-purple px-3 py-1 text-xs text-white"
                >
                  <Save className="h-3 w-3" />
                  Save
                </button>
              )}
            </div>
          </div>

          {/* Editor area */}
          <div className="flex flex-1 bg-[#120b1a] min-h-[480px]">
            {selectedDoc ? (
              editMode ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="flex-1 bg-[#120b1a] p-4 font-mono text-sm text-foreground focus:outline-none resize-none min-h-[480px] leading-relaxed"
                />
              ) : (
                <>
                  {/* Line numbers column */}
                  <div className="select-none border-r border-primary/10 px-3 py-4 text-right">
                    {selectedDoc.content
                      ? selectedDoc.content.split("\n").map((_, i) => (
                          <div key={i} className="font-mono text-xs leading-relaxed text-slate-700">
                            {i + 1}
                          </div>
                        ))
                      : Array.from({ length: 20 }).map((_, i) => (
                          <div key={i} className="font-mono text-xs leading-relaxed text-slate-700">
                            {i + 1}
                          </div>
                        ))}
                  </div>

                  {/* Content area */}
                  <div className="flex-1 overflow-auto p-4">
                    {selectedDoc.status === "generating" ? (
                      <div>
                        <div className="mb-3 flex items-center gap-2 text-xs text-primary font-mono">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span className="italic">Generating document...</span>
                        </div>
                        {selectedDoc.content ? (
                          <div className="prose-dark">
                            <MarkdownPreview content={selectedDoc.content} />
                          </div>
                        ) : (
                          <div className="space-y-2 pt-2">
                            {[60, 80, 45, 70, 55].map((w, i) => (
                              <div
                                key={i}
                                className="h-3 rounded bg-primary/10 animate-pulse"
                                style={{ width: `${w}%` }}
                              />
                            ))}
                          </div>
                        )}
                        {/* Blinking cursor */}
                        <span className="inline-block h-4 w-0.5 bg-primary animate-pulse ml-0.5 mt-1" />
                      </div>
                    ) : selectedDoc.content ? (
                      <div className="prose-dark">
                        <MarkdownPreview content={selectedDoc.content} />
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center space-y-3">
                          <FileText className="mx-auto h-10 w-10 text-primary/20" />
                          <p className="text-sm text-muted-foreground">
                            문서를 생성하면 여기에 미리보기가 표시됩니다.
                          </p>
                          <button
                            onClick={() => {
                              const config = DOC_CONFIGS.find(
                                (c) => c.type === selectedDoc.doc_type
                              );
                              if (config) generateDoc(config.type, config.filename);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs text-primary hover:bg-primary/20 transition-colors"
                          >
                            <Play className="h-3 w-3" />
                            이 문서 생성
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                    <FileText className="h-7 w-7 text-primary/50" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">문서를 선택하거나 생성하세요</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      왼쪽 목록에서 문서를 선택하거나 &quot;전체 생성&quot;을 클릭하세요.
                    </p>
                  </div>
                  {docs.status !== "completed" && !isGenerating && (
                    <button
                      onClick={generateAll}
                      className="inline-flex items-center gap-2 rounded-lg gradient-purple px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                      <Play className="h-4 w-4" />
                      전체 생성 시작
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Status bar */}
          {selectedDoc && (
            <div className="flex items-center justify-between bg-[#1e1329] border-t border-primary/10 px-4 py-1.5">
              <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                <span>Markdown</span>
                {selectedDoc.status === "completed" && (
                  <>
                    <span className="text-primary/30">|</span>
                    <span>{selectedDoc.content.split("\n").length} lines</span>
                    <span className="text-primary/30">|</span>
                    <span>{(selectedDoc.content.length / 1024).toFixed(1)} KB</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                {selectedDoc.status === "completed" && (
                  <span className="text-green-400">
                    {selectedDoc.tokens_used.toLocaleString()} tokens
                  </span>
                )}
                {selectedDoc.status === "generating" && (
                  <span className="text-primary animate-pulse">streaming...</span>
                )}
                {selectedDoc.status === "error" && (
                  <span className="text-destructive">error</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between border-t border-border pt-6">
        <button
          onClick={() => {
            store.saveToLocal();
            router.push("/generator/research");
          }}
          className="flex items-center gap-2 rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <ChevronLeft className="h-4 w-4" />
          이전
        </button>
        <button
          onClick={() => {
            store.setStep(5);
            store.saveToLocal();
            router.push("/generator/design");
          }}
          disabled={completedDocs === 0}
          className={cn(
            "flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-all",
            completedDocs > 0
              ? "gradient-purple hover:opacity-90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          디자인 생성
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
