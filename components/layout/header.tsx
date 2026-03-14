"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Moon, Sun, User, Zap } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Theme = "dark" | "ocean";

export default function Header() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("devplan-theme") as Theme | null;
    if (saved === "ocean") {
      setTheme("ocean");
      document.documentElement.classList.add("theme-ocean");
      document.documentElement.classList.remove("theme-dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "ocean" : "dark";
    setTheme(next);
    localStorage.setItem("devplan-theme", next);

    if (next === "ocean") {
      document.documentElement.classList.add("theme-ocean");
      document.documentElement.classList.remove("theme-dark");
    } else {
      document.documentElement.classList.add("theme-dark");
      document.documentElement.classList.remove("theme-ocean");
    }
  };

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
            onClick={toggleTheme}
            aria-label="테마 전환"
            className={cn(
              "flex items-center gap-2 px-3 h-10 rounded-lg text-sm font-medium transition-all",
              theme === "dark"
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "bg-blue-100 text-blue-600 hover:bg-blue-200"
            )}
          >
            {theme === "dark" ? (
              <>
                <Moon className="w-4 h-4" />
                <span className="hidden sm:inline">다크모드</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4" />
                <span className="hidden sm:inline">오션블루</span>
              </>
            )}
          </button>

          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-tr from-primary to-purple-400 text-white cursor-pointer border-2 border-primary/30">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
