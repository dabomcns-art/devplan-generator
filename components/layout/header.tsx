"use client";

import Link from "next/link";
import { Moon, User, Zap } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-background/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 md:px-10 h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg gradient-purple flex items-center justify-center shadow-lg shadow-primary/20">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-foreground text-lg tracking-tight">DevPlan Generator</span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Projects", href: "/projects" },
            { label: "Templates", href: "/templates" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            aria-label="다크 모드 전환"
            className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary hover:bg-primary/20 transition-all"
          >
            <Moon className="w-4 h-4" />
          </button>

          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-tr from-primary to-purple-400 text-white cursor-pointer border-2 border-primary/30">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
