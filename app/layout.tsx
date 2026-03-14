import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevPlan Generator - AI 프로젝트 개발 계획서 자동 생성",
  description: "AI가 업계 조사부터 기획 문서, UI 디자인까지 자동으로 생성합니다. 아이디어에서 코드 구조까지 단 몇 분 만에 완성하세요.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="theme-dark">
      <body className="min-h-screen font-sans antialiased">
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "hsl(260 20% 12%)",
              border: "1px solid hsl(260 20% 20%)",
              color: "hsl(260 10% 90%)",
            },
          }}
        />
      </body>
    </html>
  );
}
