import { generateResearchQueries } from '@/lib/prompts/research-queries';
import type { ProjectOverview, BenchmarkConfig, ResearchQuery, Source } from '@/lib/types';

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  citations?: string[];
}

async function callPerplexity(query: string, apiKey: string): Promise<{ content: string; sources: Source[] }> {
  const messages: PerplexityMessage[] = [
    {
      role: 'system',
      content:
        '당신은 IT 업계 분석 전문가입니다. 요청된 주제에 대해 최신 정보를 바탕으로 체계적이고 심층적인 분석을 한국어로 제공합니다. 마크다운 형식으로 작성하고, 구체적인 수치와 사례를 포함하세요.',
    },
    {
      role: 'user',
      content: query,
    },
  ];

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      const res = await fetch(PERPLEXITY_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages,
          max_tokens: 2000,
          temperature: 0.2,
          return_citations: true,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Perplexity API error ${res.status}: ${err}`);
      }

      const data: PerplexityResponse = await res.json();
      const content = data.choices[0]?.message?.content || '';
      const sources: Source[] = (data.citations || []).slice(0, 5).map((url, i) => ({
        title: `출처 ${i + 1}`,
        url,
        snippet: '',
      }));

      return { content, sources };
    } catch (err) {
      attempts++;
      if (attempts >= maxAttempts) throw err;
      await new Promise((r) => setTimeout(r, 1000 * attempts));
    }
  }

  return { content: '', sources: [] };
}

function getMockResult(query: ResearchQuery): string {
  const mockContent: Record<ResearchQuery['category'], string> = {
    market: `# 시장 분석 (데모 데이터)

## 시장 규모
- 국내 시장 규모: 약 **2.3조원** (2024년 기준)
- 연평균 성장률(CAGR): **18.5%** (2024-2028)
- 글로벌 시장 규모: **$45B** (2024년)

## 주요 트렌드
1. **AI 기반 자동화** 급속 확산
2. 모바일 퍼스트 전략 강화
3. 구독형 SaaS 모델 주류화
4. 개인화 경험 요구 증가

## 성장 동인
- 디지털 전환 가속화
- 원격 근무 확산에 따른 디지털 도구 수요 증가
- 클라우드 인프라 비용 절감`,

    competitor: `# 경쟁사 분석 (데모 데이터)

## 주요 경쟁사

| 서비스명 | 강점 | 약점 | 월 이용자 |
|---------|------|------|----------|
| 경쟁사 A | 풍부한 기능, 브랜드 인지도 | 높은 가격, 복잡한 UI | 50만명 |
| 경쟁사 B | 직관적 UX, 저렴한 가격 | 기능 한계, 확장성 부족 | 20만명 |
| 경쟁사 C | 한국 시장 특화, 카카오 연동 | 글로벌 확장 어려움 | 80만명 |

## 차별화 기회
- 더 나은 UX/UI로 진입 장벽 낮추기
- AI 기능 강화로 자동화 수준 향상
- 합리적인 가격 정책으로 SMB 시장 공략`,

    korean_market: `# 한국 시장 분석 (데모 데이터)

## 한국 시장 특성
- **카카오/네이버 생태계** 연동 필수
- **빠른 로딩 속도** 및 실시간 알림 기대
- **카드 결제 및 카카오페이** 선호
- **모바일 중심** 사용 패턴 (PC 대비 70% 모바일)

## 규제 환경
- 개인정보보호법 준수 필수
- 전자상거래법 적용 검토
- 정보통신망법 고려

## 로컬라이제이션 요구사항
1. 한국어 UI/UX 최적화
2. 한국 휴대폰 번호 형식 지원
3. 주민등록번호 대신 본인인증 서비스 연동
4. 국내 CDN 활용으로 빠른 응답속도 확보`,

    tech_trend: `# 기술 트렌드 (데모 데이터)

## 2024-2025 주요 기술 트렌드

### 프론트엔드
- **Next.js 14+** App Router 표준화
- **React Server Components** 성능 최적화
- **Tailwind CSS + shadcn/ui** 디자인 시스템

### 백엔드
- **서버리스 아키텍처** (Vercel, AWS Lambda)
- **Edge Computing** 글로벌 응답속도 개선
- **tRPC** 타입 안전 API 개발

### AI/ML 통합
- **LLM API 통합** (OpenAI, Anthropic, Google)
- **RAG 아키텍처** 도입 증가
- **AI 코드 어시스턴트** 개발 생산성 향상

### 데이터베이스
- **PostgreSQL + Prisma** 표준 조합
- **Redis** 캐싱 레이어 필수화
- **Vector DB** (Pinecone, pgvector) AI 기능 지원`,
  };

  return mockContent[query.category] || `# ${query.query}\n\n분석 결과가 없습니다.`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { overview, benchmark, customQuery } = body as {
      overview: ProjectOverview;
      benchmark: BenchmarkConfig;
      customQuery?: string;
    };

    const apiKey = process.env.PERPLEXITY_API_KEY;
    const useMock = !apiKey;

    let queries = generateResearchQueries(overview, benchmark);

    if (customQuery) {
      queries = [
        {
          id: 'custom-' + Date.now(),
          query: customQuery,
          status: 'pending',
          category: 'market',
        },
      ];
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const allSources: Source[] = [];
        const results: Record<string, string> = {
          market_analysis: '',
          competitor_analysis: '',
          korean_market: '',
          tech_trends: '',
        };

        const categoryToResultKey: Record<ResearchQuery['category'], string> = {
          market: 'market_analysis',
          competitor: 'competitor_analysis',
          korean_market: 'korean_market',
          tech_trend: 'tech_trends',
        };

        for (const query of queries) {
          // Emit query_start
          const startEvent = `event: query_start\ndata: ${JSON.stringify({ queryId: query.id, query: query.query, category: query.category })}\n\n`;
          controller.enqueue(encoder.encode(startEvent));

          try {
            let content: string;
            let sources: Source[] = [];

            if (useMock) {
              // Simulate delay for demo
              await new Promise((r) => setTimeout(r, 800));
              content = getMockResult(query);
            } else {
              const result = await callPerplexity(query.query, apiKey);
              content = result.content;
              sources = result.sources;
              allSources.push(...sources);
            }

            const resultKey = categoryToResultKey[query.category];
            if (resultKey && !customQuery) {
              if (results[resultKey]) {
                results[resultKey] += '\n\n---\n\n' + content;
              } else {
                results[resultKey] = content;
              }
            } else if (customQuery) {
              results['market_analysis'] = content;
            }

            // Emit query_result
            const resultEvent = `event: query_result\ndata: ${JSON.stringify({
              queryId: query.id,
              content,
              sources,
            })}\n\n`;
            controller.enqueue(encoder.encode(resultEvent));
          } catch (err) {
            const errorEvent = `event: query_result\ndata: ${JSON.stringify({
              queryId: query.id,
              error: err instanceof Error ? err.message : 'Unknown error',
            })}\n\n`;
            controller.enqueue(encoder.encode(errorEvent));
          }
        }

        // Emit complete
        const completeEvent = `event: complete\ndata: ${JSON.stringify({
          results,
          sources: allSources,
          usedMock: useMock,
        })}\n\n`;
        controller.enqueue(encoder.encode(completeEvent));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
