import { NextResponse } from 'next/server';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL이 필요합니다.' }, { status: 400 });
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const perplexityKey = process.env.PERPLEXITY_API_KEY;

    if (!anthropicKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY가 설정되지 않았습니다.' }, { status: 500 });
    }

    // Step 1: Perplexity로 서비스 정보 수집
    let serviceInfo = '';
    if (perplexityKey) {
      try {
        const pplxRes = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${perplexityKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'sonar-pro',
            messages: [
              {
                role: 'system',
                content: '주어진 URL의 서비스에 대해 상세히 분석하세요. 서비스명, 목적, 타겟 사용자, 핵심 기능, 플랫폼, 기술 스택, 비즈니스 모델을 포함하세요. 한국어로 작성하세요.',
              },
              {
                role: 'user',
                content: `다음 서비스를 분석해주세요: ${url}`,
              },
            ],
            max_tokens: 2000,
            temperature: 0.2,
          }),
        });

        if (pplxRes.ok) {
          const pplxData = await pplxRes.json();
          serviceInfo = pplxData.choices?.[0]?.message?.content || '';
        }
      } catch {
        // Perplexity 실패 시 Claude만으로 진행
      }
    }

    // Step 2: Claude로 구조화된 데이터 추출
    const prompt = `다음 URL의 서비스를 분석하여 프로젝트 개요를 JSON으로 생성하세요.

URL: ${url}
${serviceInfo ? `\n서비스 분석 정보:\n${serviceInfo}` : ''}

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.

{
  "project_name": "서비스명 (한국어)",
  "project_purpose": "서비스의 목적과 핵심 가치를 2-3문장으로 설명",
  "target_users": [
    {"id": "고유ID", "label": "사용자 유형"}
  ],
  "core_features": [
    {"id": "고유ID", "title": "기능명", "priority": "must|should|nice"}
  ],
  "platform": ["web", "ios", "android", "desktop", "api"],
  "budget_scale": "mvp|medium|large",
  "timeline": "1month|3months|6months|1year"
}

규칙:
- target_users: 최소 2개, 최대 5개
- core_features: 최소 4개, 최대 8개. must 3-4개, should 2-3개, nice 1-2개
- platform: 해당 서비스가 제공하는 플랫폼만 포함
- budget_scale: 서비스 규모에 맞게 선택
- timeline: 비슷한 서비스를 처음부터 만든다고 가정했을 때 예상 기간
- id는 짧은 영문 slug 형태 (예: "search", "payment", "user-mgmt")`;

    const claudeRes = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!claudeRes.ok) {
      const err = await claudeRes.text();
      return NextResponse.json({ error: `AI 분석 실패: ${err}` }, { status: 502 });
    }

    const claudeData = await claudeRes.json();
    const text = claudeData.content?.[0]?.text || '';

    // JSON 추출
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI 응답에서 JSON을 추출할 수 없습니다.' }, { status: 502 });
    }

    const overview = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ overview });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
