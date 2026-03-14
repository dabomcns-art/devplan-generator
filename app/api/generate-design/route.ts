import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { style_preset, custom_prompt, project_name, color_palette } = body;

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY가 설정되지 않았습니다." },
        { status: 500 }
      );
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
      const err = await response.text();
      return NextResponse.json(
        { error: `Anthropic API error: ${err}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const html = data.content?.[0]?.text;

    if (!html) {
      return NextResponse.json(
        { error: "API에서 빈 응답이 반환되었습니다." },
        { status: 502 }
      );
    }

    // Extract HTML if wrapped in code block
    const match = html.match(/```html\n?([\s\S]*?)```/) || html.match(/```\n?([\s\S]*?)```/);
    const cleanHtml = match ? match[1] : html;

    return NextResponse.json({ html: cleanHtml, fallback: false });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
