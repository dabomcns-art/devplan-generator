import { getDocPrompt } from '@/lib/prompts/doc-prompts';
import type { DocType, GeneratorState } from '@/lib/types';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

const MOCK_DOCS: Record<DocType, string> = {
  claude_md: `# DevPlan Generator - 프로젝트 개발 계획서 자동 생성 플랫폼

## 프로젝트 요약
AI 기반 프로젝트 개발 계획서 및 관련 문서를 자동 생성하는 웹 애플리케이션.

## 핵심 워크플로우
1. **프로젝트 개요 입력** - 프로그램명, 목적, 타겟 사용자
2. **벤치마킹 타겟 입력** - 참고 서비스 분석
3. **업계 조사** - Perplexity API 활용
4. **문서 생성** - Claude API 활용
5. **디자인 생성** - Stitch API 활용
6. **내보내기** - ZIP 다운로드

## 기술 스택
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: Perplexity + Anthropic Claude
- **Deploy**: Vercel

## 핵심 설계 결정사항
- 서버리스 아키텍처로 인프라 관리 최소화
- 스트리밍 응답으로 실시간 생성 경험 제공
- 로컬 스토리지 기반 프로젝트 저장`,

  feature_spec: `# 기능 상세 스펙

## Must Have 기능

### 1. 프로젝트 개요 입력
- **입력**: 프로젝트명, 목적, 타겟 유저, 핵심 기능
- **출력**: 구조화된 ProjectOverview 객체
- **검증**: 필수 필드 유효성 검사

### 2. 업계 조사 자동화
- **입력**: ProjectOverview, BenchmarkConfig
- **출력**: 카테고리별 리서치 결과
- **로직**: Perplexity API 병렬 호출

### 3. 문서 자동 생성
- **입력**: 리서치 결과 + 프로젝트 개요
- **출력**: 7종 마크다운 문서
- **로직**: Claude API 스트리밍

## Should Have 기능
- 문서 편집 기능
- ZIP 다운로드
- 프로젝트 히스토리 관리

## Nice to Have 기능
- 팀 협업 기능
- 버전 관리
- 템플릿 공유`,

  api_design: `# API 설계 문서

## 설계 원칙
- RESTful API 설계
- JWT 기반 인증
- 버전 관리: /api/v1/

## 주요 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| POST | /api/research | 업계 조사 실행 |
| POST | /api/generate-docs | 문서 생성 |
| POST | /api/design | 디자인 생성 |
| GET | /api/projects | 프로젝트 목록 |

## 인증 방식
\`\`\`
Authorization: Bearer {jwt_token}
\`\`\`

## 에러 코드
- 400: 잘못된 요청
- 401: 인증 필요
- 429: Rate Limit 초과
- 500: 서버 오류`,

  database_schema: `# 데이터베이스 스키마

## 기술 선택
**PostgreSQL** + **Prisma ORM**
- 복잡한 관계형 데이터 처리
- 타입 안전성 보장

## ERD (Mermaid)

\`\`\`mermaid
erDiagram
    User ||--o{ Project : owns
    Project ||--o{ Document : contains
    Project ||--|| ResearchResult : has

    User {
        string id PK
        string email
        string name
        datetime created_at
    }

    Project {
        string id PK
        string user_id FK
        string name
        json overview
        json benchmark
        int current_step
        datetime updated_at
    }

    Document {
        string id PK
        string project_id FK
        string doc_type
        text content
        int tokens_used
        datetime created_at
    }
\`\`\`

## 인덱스 전략
- users.email (unique)
- projects.user_id
- documents.project_id`,

  ui_menu_tree: `# UI 메뉴 트리

## 전체 화면 구조

\`\`\`
/ (홈)
├── /generator (생성 워크플로우)
│   ├── /generator/overview (Step 1: 프로젝트 개요)
│   ├── /generator/benchmark (Step 2: 벤치마킹)
│   ├── /generator/research (Step 3: 업계 조사)
│   ├── /generator/documents (Step 4: 문서 생성)
│   ├── /generator/design (Step 5: 디자인)
│   └── /generator/export (Step 6: 내보내기)
├── /dashboard (대시보드)
├── /projects (프로젝트 목록)
└── /templates (템플릿)
\`\`\`

## 공통 컴포넌트
- Header (로고, 네비게이션, 사용자 메뉴)
- StepNavigation (사이드바 진행 단계)
- ProgressBar (단계 진행률)
- MarkdownViewer (문서 미리보기)

## 반응형 전략
- Mobile: 하단 탭 네비게이션
- Tablet: 접이식 사이드바
- Desktop: 고정 사이드바 + 3컬럼 레이아웃`,

  dev_timeline: `# 개발 타임라인

## 전체 로드맵

\`\`\`mermaid
gantt
    title 개발 일정
    dateFormat YYYY-MM-DD

    section Phase 1 - MVP
    환경 설정           :done, 2024-01-01, 1w
    Step 1-2 UI 개발    :done, 2024-01-08, 2w
    Step 3-4 API 연동   :active, 2024-01-22, 2w

    section Phase 2 - 완성
    Step 5-6 개발       :2024-02-05, 2w
    테스트 및 QA        :2024-02-19, 1w
    배포 및 런칭        :2024-02-26, 1w
\`\`\`

## 스프린트 계획

### Sprint 1 (1-2주차)
- [ ] 프로젝트 기본 구조 설정
- [ ] 인증 시스템 구현
- [ ] Step 1 UI/기능 완성

### Sprint 2 (3-4주차)
- [ ] Step 2-3 완성
- [ ] Perplexity API 연동
- [ ] 리서치 결과 뷰어

### Sprint 3 (5-6주차)
- [ ] Claude API 연동
- [ ] 문서 생성 UI
- [ ] 편집 기능

### Sprint 4 (7-8주차)
- [ ] 디자인 생성
- [ ] ZIP 내보내기
- [ ] QA 및 배포`,

  tech_stack: `# 기술 스택

## 선택 스택

### 프론트엔드
| 기술 | 버전 | 선택 이유 |
|------|------|----------|
| Next.js | 14.x | App Router, SSR, 최적화 |
| TypeScript | 5.x | 타입 안전성 |
| Tailwind CSS | 3.x | 빠른 UI 개발 |
| Zustand | 5.x | 가벼운 상태 관리 |
| React Hook Form | 7.x | 폼 관리 |

### 백엔드 (서버리스)
| 기술 | 선택 이유 |
|------|----------|
| Next.js API Routes | 별도 서버 불필요 |
| Vercel | 자동 스케일링, 무료 티어 |

### AI API
| 서비스 | 용도 |
|--------|------|
| Perplexity sonar-pro | 리서치 |
| Anthropic Claude 3.5 | 문서 생성 |

## 폴더 구조

\`\`\`
src/
├── app/
│   ├── api/
│   │   ├── research/
│   │   └── generate-docs/
│   └── generator/
│       ├── overview/
│       ├── benchmark/
│       ├── research/
│       └── documents/
├── components/
├── lib/
│   ├── types/
│   ├── store/
│   └── prompts/
└── public/
\`\`\``,
};

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
      // Return mock streaming response
      const mockContent = MOCK_DOCS[doc_type] || `# ${doc_type}\n\n문서 내용을 생성 중입니다...`;
      const encoder = new TextEncoder();

      const stream = new ReadableStream({
        async start(controller) {
          // Stream mock content in chunks to simulate real streaming
          const words = mockContent.split(' ');
          for (let i = 0; i < words.length; i += 3) {
            const chunk = words.slice(i, i + 3).join(' ') + ' ';
            controller.enqueue(encoder.encode(chunk));
            await new Promise((r) => setTimeout(r, 30));
          }
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Content-Type-Options': 'nosniff',
        },
      });
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

    // Forward the streaming response, extracting text deltas
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
