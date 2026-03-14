"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Theme = "dark" | "ocean";

export default function ThemeToggle() {
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
  );
}
