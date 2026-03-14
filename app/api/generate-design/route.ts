import { NextRequest, NextResponse } from "next/server";

const MOCK_WIREFRAME_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>와이어프레임 미리보기</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #0f0a1e; color: #e8e0f0; min-height: 100vh; }
    .navbar { background: #1a1030; border-bottom: 1px solid #2d1f4e; padding: 0 24px; height: 60px; display: flex; align-items: center; justify-content: space-between; }
    .logo { width: 120px; height: 28px; background: linear-gradient(135deg, #7c3aed, #9333ea); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: white; font-weight: 700; }
    .nav-links { display: flex; gap: 24px; }
    .nav-link { width: 60px; height: 14px; background: #2d1f4e; border-radius: 4px; }
    .nav-cta { width: 80px; height: 32px; background: #7c3aed; border-radius: 6px; }
    .hero { padding: 80px 24px 60px; text-align: center; max-width: 800px; margin: 0 auto; }
    .hero-badge { display: inline-block; padding: 4px 14px; background: rgba(124,58,237,0.2); border: 1px solid rgba(124,58,237,0.4); border-radius: 99px; font-size: 12px; color: #a78bfa; margin-bottom: 20px; }
    .hero-title { font-size: 2.5rem; font-weight: 800; margin-bottom: 16px; }
    .hero-title span { background: linear-gradient(135deg, #a78bfa, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero-desc { color: #9ca3af; line-height: 1.7; margin-bottom: 32px; }
    .hero-actions { display: flex; gap: 12px; justify-content: center; }
    .btn-primary { padding: 12px 28px; background: #7c3aed; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; color: white; }
    .btn-secondary { padding: 12px 28px; background: transparent; border: 1px solid #3d2b6e; border-radius: 8px; font-size: 14px; color: #c4b5fd; cursor: pointer; }
    .features { padding: 60px 24px; max-width: 1100px; margin: 0 auto; }
    .section-label { text-align: center; font-size: 13px; color: #7c3aed; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px; }
    .section-title { text-align: center; font-size: 1.75rem; font-weight: 700; margin-bottom: 40px; }
    .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .card { background: #1a1030; border: 1px solid #2d1f4e; border-radius: 12px; padding: 24px; }
    .card-icon { width: 40px; height: 40px; background: rgba(124,58,237,0.2); border-radius: 10px; margin-bottom: 16px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
    .card-title { font-weight: 700; margin-bottom: 8px; }
    .card-desc { color: #9ca3af; font-size: 14px; line-height: 1.6; }
    .steps { padding: 60px 24px; background: #120d24; }
    .steps-inner { max-width: 900px; margin: 0 auto; }
    .step-list { display: flex; flex-direction: column; gap: 16px; margin-top: 40px; }
    .step-item { display: flex; gap: 16px; align-items: flex-start; background: #1a1030; border: 1px solid #2d1f4e; border-radius: 10px; padding: 20px; }
    .step-num { width: 32px; height: 32px; background: #7c3aed; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: white; shrink: 0; flex-shrink: 0; }
    .step-content { flex: 1; }
    .step-title { font-weight: 600; margin-bottom: 4px; }
    .step-desc { color: #9ca3af; font-size: 13px; }
    .cta { padding: 80px 24px; text-align: center; }
    .cta-box { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, rgba(124,58,237,0.15), rgba(147,51,234,0.08)); border: 1px solid rgba(124,58,237,0.3); border-radius: 16px; padding: 48px; }
    .cta-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 12px; }
    .cta-desc { color: #9ca3af; margin-bottom: 28px; }
    footer { background: #0a0718; border-top: 1px solid #1a1030; padding: 32px 24px; text-align: center; color: #4b5563; font-size: 13px; }
  </style>
</head>
<body>
  <nav class="navbar">
    <div class="logo">DevPlan</div>
    <div class="nav-links">
      <div class="nav-link"></div>
      <div class="nav-link"></div>
      <div class="nav-link"></div>
    </div>
    <div class="nav-cta"></div>
  </nav>

  <section class="hero">
    <div class="hero-badge">AI 기반 프로젝트 플래너</div>
    <h1 class="hero-title">아이디어를 <span>완성된 계획서</span>로</h1>
    <p class="hero-desc">업계 조사부터 기능 스펙, UI 디자인까지 AI가 자동으로 생성합니다.<br/>개발 시작까지 걸리는 시간을 90% 줄여보세요.</p>
    <div class="hero-actions">
      <button class="btn-primary">무료로 시작하기</button>
      <button class="btn-secondary">데모 보기</button>
    </div>
  </section>

  <section class="features">
    <p class="section-label">핵심 기능</p>
    <h2 class="section-title">왜 DevPlan Generator인가요?</h2>
    <div class="cards">
      <div class="card">
        <div class="card-icon">🔍</div>
        <div class="card-title">업계 조사 자동화</div>
        <div class="card-desc">Perplexity AI로 실시간 시장·경쟁사·트렌드 분석 리포트를 즉시 생성합니다.</div>
      </div>
      <div class="card">
        <div class="card-icon">📋</div>
        <div class="card-title">기획 문서 일괄 생성</div>
        <div class="card-desc">Claude AI가 CLAUDE.md, 기능 스펙, API 설계, DB 스키마까지 한 번에 작성합니다.</div>
      </div>
      <div class="card">
        <div class="card-icon">🎨</div>
        <div class="card-title">UI 와이어프레임 생성</div>
        <div class="card-desc">스타일 프리셋과 커스텀 프롬프트로 반응형 와이어프레임을 자동 제작합니다.</div>
      </div>
    </div>
  </section>

  <section class="steps">
    <div class="steps-inner">
      <p class="section-label">진행 과정</p>
      <h2 class="section-title">6단계로 완성하는 프로젝트 계획서</h2>
      <div class="step-list">
        <div class="step-item"><div class="step-num">1</div><div class="step-content"><div class="step-title">프로젝트 개요 입력</div><div class="step-desc">프로그램명, 목적, 타겟 사용자, 핵심 기능을 입력합니다.</div></div></div>
        <div class="step-item"><div class="step-num">2</div><div class="step-content"><div class="step-title">벤치마킹 대상 설정</div><div class="step-desc">참고할 서비스 URL과 분석 범위를 선택합니다.</div></div></div>
        <div class="step-item"><div class="step-num">3</div><div class="step-content"><div class="step-title">AI 업계 조사</div><div class="step-desc">Perplexity가 시장·경쟁사·트렌드를 자동 분석합니다.</div></div></div>
        <div class="step-item"><div class="step-num">4</div><div class="step-content"><div class="step-title">기획 문서 생성</div><div class="step-desc">Claude가 7종의 개발 계획 문서를 동시에 작성합니다.</div></div></div>
        <div class="step-item"><div class="step-num">5</div><div class="step-content"><div class="step-title">UI 디자인 생성</div><div class="step-desc">스타일 프리셋 기반 와이어프레임이 자동 생성됩니다.</div></div></div>
        <div class="step-item"><div class="step-num">6</div><div class="step-content"><div class="step-title">ZIP 다운로드</div><div class="step-desc">모든 산출물을 폴더 구조로 정리하여 다운로드합니다.</div></div></div>
      </div>
    </div>
  </section>

  <section class="cta">
    <div class="cta-box">
      <h2 class="cta-title">지금 바로 시작하세요</h2>
      <p class="cta-desc">회원가입 없이 무료로 사용할 수 있습니다.<br/>아이디어 하나로 완성된 프로젝트 계획서를 만들어보세요.</p>
      <button class="btn-primary">무료로 시작하기 →</button>
    </div>
  </section>

  <footer>
    <p>© 2025 DevPlan Generator. AI 기반 프로젝트 계획서 자동 생성 플랫폼.</p>
  </footer>
</body>
</html>`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { style_preset, custom_prompt, project_name, color_palette } = body;

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      // Return mock wireframe when no API key is configured
      return NextResponse.json({ html: MOCK_WIREFRAME_HTML, fallback: true });
    }

    const presetDescriptions: Record<string, string> = {
      modern_minimal: "모던 미니멀 스타일: 깔끔한 여백, 심플한 타이포그래피, 화이트/그레이 중심",
      business_pro: "비즈니스 프로 스타일: 신뢰감 있는 블루/네이비 색상, 구조적인 레이아웃",
      creative: "크리에이티브 스타일: 대담한 색상, 동적인 레이아웃, 그라디언트 활용",
      dark: "다크모드 스타일: 어두운 배경, 보라/퍼플 액센트, 글로우 효과",
    };

    const styleDesc =
      presetDescriptions[style_preset as string] || presetDescriptions.modern_minimal;
    const colorHint =
      color_palette && (color_palette as string[]).length > 0
        ? `컬러 팔레트: ${(color_palette as string[]).join(", ")}`
        : "";

    const prompt = `당신은 UI/UX 전문가입니다. 다음 요구사항에 맞는 완성된 HTML 와이어프레임을 생성하세요.

프로젝트명: ${project_name || "새 프로젝트"}
디자인 스타일: ${styleDesc}
${colorHint}
${custom_prompt ? `추가 요구사항: ${custom_prompt}` : ""}

요구사항:
1. 완전한 HTML 파일 (DOCTYPE, head, body 포함)
2. 인라인 CSS만 사용 (외부 파일 없음)
3. 반응형 레이아웃 (모바일 고려)
4. 다음 섹션 포함: 네비게이션, 히어로, 주요 기능 카드, 단계별 프로세스, CTA, 푸터
5. 실제 텍스트 콘텐츠 (Lorem ipsum 대신 한국어 실제 내용)
6. 모던하고 완성도 높은 디자인

HTML만 출력하세요. 다른 설명은 불필요합니다.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ html: MOCK_WIREFRAME_HTML, fallback: true });
    }

    const data = await response.json();
    const html = data.content?.[0]?.text || MOCK_WIREFRAME_HTML;

    // Extract HTML if wrapped in code block
    const match = html.match(/```html\n?([\s\S]*?)```/) || html.match(/```\n?([\s\S]*?)```/);
    const cleanHtml = match ? match[1] : html;

    return NextResponse.json({ html: cleanHtml, fallback: false });
  } catch {
    return NextResponse.json({ html: MOCK_WIREFRAME_HTML, fallback: true });
  }
}
