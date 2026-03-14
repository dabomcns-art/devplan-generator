"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative group", className)}>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-secondary border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
        aria-label="내용 복사"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-green-400" />
            <span className="text-green-400">복사됨</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>복사</span>
          </>
        )}
      </button>

      <div className="prose-dark overflow-auto">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
