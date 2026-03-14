import { getDocPrompt } from '@/lib/prompts/doc-prompts';
import type { DocType, GeneratorState } from '@/lib/types';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { doc_type, context } = body as {
      doc_type: DocType;
      context: Partial<GeneratorState>;
    };

    if (!doc_type) {
      return new Response(JSON.stringify({ error: 'doc_type is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY가 설정되지 않았습니다.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { system, user } = getDocPrompt(doc_type, context || {});

    const anthropicRes = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        stream: true,
        system,
        messages: [{ role: 'user', content: user }],
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      return new Response(JSON.stringify({ error: `Anthropic API error: ${err}` }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const encoder = new TextEncoder();
    const reader = anthropicRes.body?.getReader();

    if (!reader) {
      return new Response(JSON.stringify({ error: 'No response body' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
                  controller.enqueue(encoder.encode(parsed.delta.text));
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
        controller.close();
      },
      cancel() {
        reader.cancel();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
