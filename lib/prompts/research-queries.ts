import type { ProjectOverview, BenchmarkConfig, ResearchQuery } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export function generateResearchQueries(
  overview: ProjectOverview,
  benchmarkTargets: BenchmarkConfig
): ResearchQuery[] {
  const project_name = overview.project_name || '프로젝트';
  const project_purpose = overview.project_purpose || '서비스';
  const target_users = overview.target_users || [];
  const platform = overview.platform || [];
  const targets = benchmarkTargets?.targets || [];
  const targetNames = targets.map((t) => t.service_name).join(', ');
  const userLabels = target_users.map((u) => u.label).join(', ');
  const platformStr = platform.join(', ') || '웹';

  const queries: ResearchQuery[] = [
    {
      id: uuidv4(),
      query: `${project_name} 관련 시장 규모, 성장률, 주요 트렌드 분석 2024-2025년 한국 및 글로벌 시장`,
      status: 'pending',
      category: 'market',
    },
    {
      id: uuidv4(),
      query: `${project_purpose} 분야 주요 경쟁사 분석: ${targetNames || '주요 서비스들'}의 핵심 기능, 수익 모델, 강단점 비교`,
      status: 'pending',
      category: 'competitor',
    },
    {
      id: uuidv4(),
      query: `한국 시장에서 ${project_name} 유사 서비스 현황, 사용자 트렌드, 규제 환경, 로컬라이제이션 요구사항 (타겟: ${userLabels || '일반 사용자'})`,
      status: 'pending',
      category: 'korean_market',
    },
    {
      id: uuidv4(),
      query: `${platformStr} 플랫폼 기반 ${project_purpose} 서비스 개발에 적합한 최신 기술 스택, 아키텍처 패턴, 개발 도구 트렌드 2024-2025`,
      status: 'pending',
      category: 'tech_trend',
    },
  ];

  // Add competitor-specific queries if targets exist
  if (targets.length > 0) {
    targets.slice(0, 2).forEach((target) => {
      queries.push({
        id: uuidv4(),
        query: `${target.service_name} 서비스 상세 분석: UI/UX 특징, 핵심 기능, 사용자 경험, 차별화 전략${target.service_url ? ` (${target.service_url})` : ''}`,
        status: 'pending',
        category: 'competitor',
      });
    });
  }

  return queries;
}
