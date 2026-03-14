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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { overview, benchmark, customQuery } = body as {
      overview: ProjectOverview;
      benchmark: BenchmarkConfig;
      customQuery?: string;
    };

    const apiKey = process.env.PERPLEXITY_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'PERPLEXITY_API_KEY가 설정되지 않았습니다.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

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
          const startEvent = `event: query_start\ndata: ${JSON.stringify({ queryId: query.id, query: query.query, category: query.category })}\n\n`;
          controller.enqueue(encoder.encode(startEvent));

          try {
            const result = await callPerplexity(query.query, apiKey);
            const content = result.content;
            const sources = result.sources;
            allSources.push(...sources);

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

        const completeEvent = `event: complete\ndata: ${JSON.stringify({
          results,
          sources: allSources,
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
