"use client";

import { useState } from "react";
import {
  Folder,
  FolderOpen,
  FileText,
  FileJson,
  FileCode,
  File,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface TreeFile {
  name: string;
  path: string;
  size?: number;
  type: "folder" | "markdown" | "json" | "html" | "css" | "ts" | "other";
  children?: TreeFile[];
}

interface FileTreeProps {
  files: TreeFile[];
  selectedPath?: string;
  onSelect?: (file: TreeFile) => void;
  className?: string;
}

function getFileIcon(type: TreeFile["type"], isOpen?: boolean) {
  switch (type) {
    case "folder":
      return isOpen ? (
        <FolderOpen className="w-4 h-4 text-yellow-400/80 shrink-0" />
      ) : (
        <Folder className="w-4 h-4 text-yellow-400/80 shrink-0" />
      );
    case "markdown":
      return <FileText className="w-4 h-4 text-blue-400/80 shrink-0" />;
    case "json":
      return <FileJson className="w-4 h-4 text-green-400/80 shrink-0" />;
    case "html":
    case "css":
    case "ts":
      return <FileCode className="w-4 h-4 text-purple-400/80 shrink-0" />;
    default:
      return <File className="w-4 h-4 text-muted-foreground shrink-0" />;
  }
}

function formatSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

interface TreeNodeProps {
  file: TreeFile;
  selectedPath?: string;
  onSelect?: (file: TreeFile) => void;
  depth: number;
}

function TreeNode({ file, selectedPath, onSelect, depth }: TreeNodeProps) {
  const [isOpen, setIsOpen] = useState(depth === 0);
  const isSelected = selectedPath === file.path;
  const isFolder = file.type === "folder";

  const handleClick = () => {
    if (isFolder) {
      setIsOpen((prev) => !prev);
    } else {
      onSelect?.(file);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={cn(
          "w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm transition-colors text-left",
          isSelected && !isFolder
            ? "bg-primary/15 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
        )}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        {isFolder && (
          <ChevronRight
            className={cn(
              "w-3.5 h-3.5 shrink-0 transition-transform text-muted-foreground/60",
              isOpen && "rotate-90"
            )}
          />
        )}
        {!isFolder && <span className="w-3.5 shrink-0" />}
        {getFileIcon(file.type, isOpen)}
        <span className="flex-1 truncate font-mono text-xs">{file.name}</span>
        {file.size !== undefined && !isFolder && (
          <span className="text-xs text-muted-foreground/50 shrink-0">
            {formatSize(file.size)}
          </span>
        )}
      </button>

      {isFolder && isOpen && file.children && (
        <div>
          {file.children.map((child) => (
            <TreeNode
              key={child.path}
              file={child}
              selectedPath={selectedPath}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({ files, selectedPath, onSelect, className }: FileTreeProps) {
  return (
    <div className={cn("select-none", className)}>
      {files.map((file) => (
        <TreeNode
          key={file.path}
          file={file}
          selectedPath={selectedPath}
          onSelect={onSelect}
          depth={0}
        />
      ))}
    </div>
  );
}
