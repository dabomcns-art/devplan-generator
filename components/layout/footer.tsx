import Link from "next/link";
import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-purple flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground">DevPlan</span>
          </div>

          <nav className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">서비스 소개</Link>
            <Link href="#" className="hover:text-foreground transition-colors">이용약관</Link>
            <Link href="#" className="hover:text-foreground transition-colors">개인정보처리방침</Link>
            <Link href="#" className="hover:text-foreground transition-colors">고객지원</Link>
          </nav>

          <p className="text-sm text-muted-foreground">
            © 2024 DevPlan Generator. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
