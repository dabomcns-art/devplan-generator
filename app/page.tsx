"use client";

import Link from "next/link";
import {
  Zap,
  ArrowRight,
  Play,
  Lightbulb,
  ClipboardList,
  Layers,
  Network,
  ListChecks,
  CalendarClock,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react";
import ThemeToggle from "@/components/layout/theme-toggle";

const steps = [
  {
    id: 1,
    icon: Lightbulb,
    title: "아이디어 입력",
    description: "프로젝트 아이디어와 목표를 간단히 설명하세요. AI가 핵심을 파악합니다.",
  },
  {
    id: 2,
    icon: ClipboardList,
    title: "요구사항 분석",
    description: "AI가 기능 요구사항을 자동으로 분류하고 우선순위를 정합니다.",
  },
  {
    id: 3,
    icon: Layers,
    title: "기술 스택 추천",
    description: "프로젝트에 최적화된 기술 스택과 라이브러리를 추천받으세요.",
  },
  {
    id: 4,
    icon: Network,
    title: "아키텍처 설계",
    description: "시스템 구조와 데이터 흐름을 자동으로 설계하고 다이어그램으로 시각화합니다.",
  },
  {
    id: 5,
    icon: ListChecks,
    title: "태스크 분할",
    description: "개발 작업을 세분화하여 팀원별 역할과 의존성을 명확히 합니다.",
  },
  {
    id: 6,
    icon: CalendarClock,
    title: "일정 산출",
    description: "각 태스크의 난이도와 의존성을 고려한 현실적인 개발 일정을 산출합니다.",
  },
];

const navLinks = [
  { label: "Process", href: "#process" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Community", href: "#community" },
];

const footerColumns = [
  {
    title: "Product",
    links: ["기능 소개", "요금제", "업데이트 내역", "로드맵"],
  },
  {
    title: "Resources",
    links: ["문서", "API 레퍼런스", "튜토리얼", "블로그"],
  },
  {
    title: "Company",
    links: ["소개", "채용", "파트너십", "문의"],
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* ── Header ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-primary/10 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg gradient-purple flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground text-lg tracking-tight">DevPlan</span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA + Theme + Avatar */}
          <div className="flex items-center gap-3 shrink-0">
            <ThemeToggle />
            <Link
              href="/generator"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white gradient-purple hover:opacity-90 transition-opacity"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden">
              <span className="text-xs font-bold text-primary">U</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ───────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-28 pb-36 px-6">
          {/* Radial gradient background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(127,13,242,0.15), transparent 70%)",
            }}
          />

          <div className="relative max-w-4xl mx-auto text-center">
            {/* Badge with ping animation */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              v2.0 Beta Now Available
            </div>

            {/* H1 */}
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight mb-6">
              AI와 함께하는
              <br />
              <span className="text-gradient">프로젝트 기획의 혁신</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              아이디어를 입력하면 AI가 요구사항 분석부터 기술 스택 추천,
              아키텍처 설계, 일정 산출까지 완성된 로드맵을 자동으로 생성합니다.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/generator"
                className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl text-base font-semibold text-white gradient-purple shadow-xl shadow-primary/30 hover:scale-105 transition-transform duration-200"
              >
                시작하기
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl text-base font-semibold text-foreground border border-primary/30 bg-white/5 backdrop-blur hover:bg-white/10 transition-colors">
                <Play className="w-4 h-4 text-primary" />
                데모 보기
              </button>
            </div>

            {/* Hero graphic placeholder */}
            <div className="relative mx-auto max-w-3xl rounded-2xl border border-primary/20 bg-slate-900/50 overflow-hidden aspect-video">
              {/* Gradient overlay */}
              <div className="absolute inset-0 gradient-purple-subtle opacity-30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl gradient-purple flex items-center justify-center mx-auto mb-4 glow-primary">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-muted-foreground text-sm">AI 기획 도구 미리보기</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6-Step Process ─────────────────────────────── */}
        <section id="process" className="py-24 px-6 bg-slate-900/30">
          <div className="max-w-6xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
                6-Step Process
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
                아이디어에서 실행 계획까지
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                복잡한 기획 과정을 AI가 체계적으로 안내합니다.
              </p>
            </div>

            {/* Steps grid — 3x2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.id}
                    className="group relative p-8 rounded-2xl border border-primary/10 bg-[#191022]/50 hover:border-primary/30 transition-all duration-300"
                  >
                    {/* Step number */}
                    <span className="absolute top-6 right-6 text-4xl font-black text-primary/10 select-none group-hover:text-primary/20 transition-colors">
                      {String(step.id).padStart(2, "0")}
                    </span>

                    {/* Icon */}
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <Icon className="w-6 h-6 text-primary group-hover:text-white transition-colors duration-300" />
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>

                    {/* Decorative image placeholder */}
                    <div className="mt-6 rounded-xl bg-primary/5 border border-primary/10 h-24 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary/40" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CTA Section ────────────────────────────────── */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-primary p-12 text-center">
              {/* Decorative blobs */}
              <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />

              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                  지금 바로 혁신을 경험하세요
                </h2>
                <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                  수백 시간의 기획 작업을 단 몇 분으로 줄여보세요.
                  첫 번째 프로젝트 플랜은 무료입니다.
                </p>
                <Link
                  href="/generator"
                  className="inline-flex items-center gap-2 h-12 px-8 rounded-xl text-base font-semibold bg-white text-primary hover:bg-white/90 transition-colors shadow-xl"
                >
                  무료로 시작하기
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="border-t border-primary/10">
        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* 5-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            {/* Brand column */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg gradient-purple flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-foreground text-lg">DevPlan</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                AI 기반으로 프로젝트 기획을 자동화하는 차세대 개발 계획 플랫폼입니다.
                아이디어에서 실행 로드맵까지 단 몇 분 만에 완성하세요.
              </p>
            </div>

            {/* Link columns */}
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold text-foreground mb-4">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link
                        href="#"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-primary/10">
            <p className="text-sm text-muted-foreground">
              © 2024 DevPlan Generator. All rights reserved.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-2">
              <Link
                href="#"
                aria-label="Twitter"
                className="w-9 h-9 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </Link>
              <Link
                href="#"
                aria-label="GitHub"
                className="w-9 h-9 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Github className="w-4 h-4" />
              </Link>
              <Link
                href="#"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
