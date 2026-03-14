import { z } from 'zod';

export const projectOverviewSchema = z.object({
  project_name: z.string().min(2, '프로젝트명은 2자 이상이어야 합니다').max(50, '50자 이내로 입력해주세요'),
  project_purpose: z.string().min(10, '프로젝트 목적은 10자 이상이어야 합니다').max(500, '500자 이내로 입력해주세요'),
  target_users: z.array(z.object({
    id: z.string(),
    label: z.string().min(1),
    custom: z.boolean().optional(),
  })).min(1, '타겟 사용자를 1명 이상 선택해주세요'),
  core_features: z.array(z.object({
    id: z.string(),
    title: z.string().min(2, '기능명은 2자 이상이어야 합니다'),
    description: z.string().optional(),
    priority: z.enum(['must', 'should', 'nice']),
  })).min(1, '핵심 기능을 1개 이상 입력해주세요').max(10),
  platform: z.array(z.enum(['web', 'ios', 'android', 'desktop', 'api'])).min(1, '플랫폼을 1개 이상 선택해주세요'),
  tech_preference: z.string().optional(),
  budget_scale: z.enum(['mvp', 'medium', 'large']),
  timeline: z.enum(['1month', '3months', '6months', '1year']),
});

export const benchmarkSchema = z.object({
  type: z.enum(['clone', 'benchmark', 'reference']),
  targets: z.array(z.object({
    id: z.string(),
    service_name: z.string().min(1, '서비스명을 입력해주세요'),
    service_url: z.string().url('올바른 URL을 입력해주세요').optional().or(z.literal('')),
    analysis_scope: z.array(
      z.enum(['ui_ux', 'features', 'business_model', 'tech_stack'])
    ).min(1, '분석 범위를 1개 이상 선택해주세요'),
  })).min(1, '벤치마킹 대상을 1개 이상 입력해주세요').max(5),
  differentiation: z.string().optional(),
  exclude_features: z.string().optional(),
});

export type ProjectOverviewFormData = z.infer<typeof projectOverviewSchema>;
export type BenchmarkFormData = z.infer<typeof benchmarkSchema>;
