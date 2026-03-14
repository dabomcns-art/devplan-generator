"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Zap, User } from "lucide-react";
import ThemeToggle from "@/components/layout/theme-toggle";
import { useGeneratorStore } from "@/lib/store/generator-store";
import StepNavigation from "@/components/layout/step-navigation";

export default function GeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentStep = useGeneratorStore((s) => s.current_step);
  const projectId = useGeneratorStore((s) => s.project_id);
  const initNewProject = useGeneratorStore((s) => s.initNewProject);

  useEffect(() => {
    if (!projectId) {
      initNewProject();
    }
  }, [projectId, initNewProject]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Left sidebar */}
      <aside className="w-64 shrink-0 border-r border-primary/10 bg-background flex flex-col">
        <StepNavigation currentStep={currentStep} />
      </aside>

      {/* Right area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="flex items-center justify-between border-b border-primary/10 px-8 py-3 bg-background/80 backdrop-blur-md shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-purple flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-foreground text-base tracking-tight">DevPlan Generator</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-muted-foreground">
            <Link href="/dashboard" className="text-sm hover:text-primary transition-colors">Dashboard</Link>
            <Link href="/projects" className="text-sm hover:text-primary transition-colors">Projects</Link>
            <Link href="/templates" className="text-sm hover:text-primary transition-colors">Templates</Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center text-white cursor-pointer border-2 border-primary/30">
              <User className="w-4 h-4" />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto w-full px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
