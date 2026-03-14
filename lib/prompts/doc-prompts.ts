import type { DocType, GeneratorState } from '@/lib/types';

interface DocPrompt {
  system: string;
  user: string;
}

const KOREAN_LOCALIZATION_CONTEXT = `
한국형 기획 문서 작성 지침:
- 모든 내용은 한국어로 작성
- 한국 시장 특성 반영 (카카오, 네이버 연동, 한국 결제 시스템 등)
- 한국 사용자 UX 선호도 고려 (카드형 UI, 빠른 로딩, 모바일 퍼스트)
- 관련 한국 법규 및 규제 언급 (개인정보보호법, 전자상거래법 등)
- 실무에서 바로 활용 가능한 구체적인 내용 포함
`;

export function getDocPrompt(docType: DocType, context: Partial<GeneratorState>): DocPrompt {
  const projectName = context.overview?.project_name || '프로젝트';
  const projectPurpose = context.overview?.project_purpose || '';
  const platforms = context.overview?.platform?.join(', ') || 'web';
  const budgetScale = context.overview?.budget_scale || 'mvp';
  const timeline = context.overview?.timeline || '3months';
  const benchmarkTargets = context.benchmark?.targets?.map((t) => t.service_name).join(', ') || '';
  const researchSummary = [
    context.research?.results?.market_analysis?.slice(0, 500) || '',
    context.research?.results?.competitor_analysis?.slice(0, 500) || '',
  ]
    .filter(Boolean)
    .join('\n');

  const baseSystem = `당신은 한국의 시니어 소프트웨어 아키텍트이자 기술 기획자입니다.
실무 경험을 바탕으로 체계적이고 실용적인 개발 문서를 작성합니다.
${KOREAN_LOCALIZATION_CONTEXT}
마크다운 형식으로 작성하고, 헤더, 표, 코드 블록을 적절히 활용하세요.`;

  const projectContext = `
프로젝트명: ${projectName}
목적: ${projectPurpose}
플랫폼: ${platforms}
예산 규모: ${budgetScale}
개발 기간: ${timeline}
벤치마킹 대상: ${benchmarkTargets}
${researchSummary ? `\n조사 결과 요약:\n${researchSummary}` : ''}
`.trim();

  switch (docType) {
    case 'claude_md':
      return {
        system: baseSystem,
        user: `다음 프로젝트 정보를 바탕으로 Claude Code용 CLAUDE.md 파일을 작성하세요.

${projectContext}

CLAUDE.md에 포함할 내용:
1. 프로젝트 요약 (한국어)
2. 핵심 워크플로우 (단계별)
3. 기술 스택 요약
4. 참조 문서 목록 (docs/ 폴더 구조)
5. 핵심 설계 결정사항
6. Claude Code 명령어 예시

실무에서 바로 사용할 수 있는 완성도 높은 CLAUDE.md를 작성해주세요.`,
      };

    case 'feature_spec':
      return {
        system: baseSystem,
        user: `다음 프로젝트 정보를 바탕으로 기능 상세 스펙 문서(feature-spec.md)를 작성하세요.

${projectContext}

기능 스펙에 포함할 내용:
1. 기능 목록 및 우선순위 (Must Have / Should Have / Nice to Have)
2. 각 기능별 상세 설명
   - 입력값 및 출력값
   - 비즈니스 로직
   - 예외 처리
   - 성능 요구사항
3. 사용자 스토리 (User Stories)
4. 인수 기준 (Acceptance Criteria)
5. 의존성 및 제약사항

마크다운 표와 체크리스트를 활용해 실무적으로 유용하게 작성하세요.`,
      };

    case 'api_design':
      return {
        system: baseSystem,
        user: `다음 프로젝트 정보를 바탕으로 API 설계 문서(api-design.md)를 작성하세요.

${projectContext}

API 설계 문서에 포함할 내용:
1. API 개요 및 설계 원칙 (RESTful / GraphQL 등)
2. 인증/인가 방식 (JWT, OAuth 등)
3. 엔드포인트 목록 (메서드, 경로, 설명)
4. 주요 API 상세 스펙
   - Request/Response 예시 (JSON)
   - 에러 코드 및 메시지
5. 버전 관리 전략
6. Rate Limiting 정책

실제 개발에 바로 활용 가능한 수준의 API 스펙을 작성하세요.`,
      };

    case 'database_schema':
      return {
        system: baseSystem,
        user: `다음 프로젝트 정보를 바탕으로 데이터베이스 스키마 문서(database-schema.md)를 작성하세요.

${projectContext}

DB 스키마 문서에 포함할 내용:
1. 데이터베이스 선택 및 이유 (MySQL, PostgreSQL, MongoDB 등)
2. ERD 다이어그램 (Mermaid 형식)
3. 주요 테이블/컬렉션 정의
   - 컬럼명, 타입, 제약조건
   - 인덱스 전략
   - 관계 설명
4. 데이터 마이그레이션 전략
5. 백업 및 복구 계획

실무적이고 확장 가능한 스키마를 설계하세요.`,
      };

    case 'ui_menu_tree':
      return {
        system: baseSystem,
        user: `다음 프로젝트 정보를 바탕으로 UI 메뉴 트리 문서(ui-menu-tree.md)를 작성하세요.

${projectContext}

UI 메뉴 트리에 포함할 내용:
1. 전체 화면 구조 개요
2. 페이지/화면 목록 (계층 구조)
3. 각 화면별 구성 요소
   - 주요 UI 컴포넌트
   - 사용자 액션
   - 네비게이션 흐름
4. 모바일/데스크톱 반응형 구조
5. 공통 컴포넌트 목록

한국 사용자 UX 선호도를 반영한 메뉴 구조를 설계하세요.`,
      };

    case 'dev_timeline':
      return {
        system: baseSystem,
        user: `다음 프로젝트 정보를 바탕으로 개발 타임라인 문서(development-timeline.md)를 작성하세요.

${projectContext}

개발 타임라인에 포함할 내용:
1. 전체 개발 로드맵 (Gantt 차트 - Mermaid 형식)
2. 스프린트 계획 (2주 단위)
   - 각 스프린트 목표
   - 주요 deliverable
   - 팀 구성 및 역할
3. 마일스톤 정의
4. 리스크 및 대응 방안
5. QA 및 배포 계획

${timeline} 일정에 맞는 현실적인 타임라인을 작성하세요.`,
      };

    case 'tech_stack':
      return {
        system: baseSystem,
        user: `다음 프로젝트 정보를 바탕으로 기술 스택 문서(tech-stack.md)를 작성하세요.

${projectContext}

기술 스택 문서에 포함할 내용:
1. 선택한 기술 스택 전체 목록
2. 각 기술 선택 이유 및 대안 비교
3. 프로젝트 폴더 구조 (tree 형식)
4. 주요 패키지 및 버전
5. 개발 환경 설정 가이드
6. CI/CD 파이프라인 구성
7. 클라우드 인프라 구성 (AWS, GCP, Vercel 등)

${budgetScale} 규모에 적합한 기술 선택을 하고 비용 효율성도 고려하세요.`,
      };

    default:
      return {
        system: baseSystem,
        user: `${projectName} 프로젝트의 ${docType} 문서를 작성해주세요.\n\n${projectContext}`,
      };
  }
}
