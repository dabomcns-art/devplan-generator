// ─── Step 1: 프로젝트 개요 ───
export type Platform = 'web' | 'ios' | 'android' | 'desktop' | 'api';

export interface TargetUser {
  id: string;
  label: string;
  custom?: boolean;
}

export interface CoreFeature {
  id: string;
  title: string;
  description?: string;
  priority: 'must' | 'should' | 'nice';
}

export interface ProjectOverview {
  project_name: string;
  project_purpose: string;
  target_users: TargetUser[];
  core_features: CoreFeature[];
  platform: Platform[];
  tech_preference?: string;
  budget_scale: 'mvp' | 'medium' | 'large';
  timeline: '1month' | '3months' | '6months' | '1year';
}

// ─── Step 2: 벤치마킹 ───
export type AnalysisScope = 'ui_ux' | 'features' | 'business_model' | 'tech_stack';

export interface BenchmarkTarget {
  id: string;
  service_name: string;
  service_url?: string;
  og_image?: string;
  og_description?: string;
  analysis_scope: AnalysisScope[];
}

export interface BenchmarkConfig {
  type: 'clone' | 'benchmark' | 'reference';
  targets: BenchmarkTarget[];
  differentiation?: string;
  exclude_features?: string;
}

// ─── Step 3: 업계 조사 ───
export interface ResearchQuery {
  id: string;
  query: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  category: 'market' | 'competitor' | 'korean_market' | 'tech_trend';
}

export interface ResearchResult {
  market_analysis: string;
  competitor_analysis: string;
  korean_market: string;
  tech_trends: string;
  custom_results?: Record<string, string>;
}

export interface Source {
  title: string;
  url: string;
  snippet: string;
}

export interface ResearchData {
  status: 'idle' | 'running' | 'completed' | 'error';
  queries: ResearchQuery[];
  results: ResearchResult;
  sources: Source[];
}

// ─── Step 4: 생성 문서 ───
export type DocType =
  | 'claude_md'
  | 'feature_spec'
  | 'api_design'
  | 'database_schema'
  | 'ui_menu_tree'
  | 'dev_timeline'
  | 'tech_stack';

export interface DocumentFile {
  id: string;
  filename: string;
  doc_type: DocType;
  content: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  tokens_used: number;
  created_at: string;
  modified: boolean;
}

export interface GeneratedDocuments {
  status: 'idle' | 'generating' | 'completed' | 'error';
  documents: DocumentFile[];
  total_tokens_used: number;
}

// ─── Step 5: 디자인 ───
export interface DesignFile {
  id: string;
  filename: string;
  url: string;
  type: 'wireframe' | 'mockup' | 'token';
}

export interface DesignData {
  status: 'idle' | 'generating' | 'completed' | 'error';
  style_preset: 'modern_minimal' | 'business_pro' | 'creative' | 'dark';
  color_palette?: string[];
  custom_prompt?: string;
  results: DesignFile[];
}

// ─── 메인 스토어 ───
export interface GeneratorState {
  current_step: 1 | 2 | 3 | 4 | 5 | 6;
  project_id: string;
  overview: ProjectOverview;
  benchmark: BenchmarkConfig;
  research: ResearchData;
  documents: GeneratedDocuments;
  design: DesignData;
}

export interface ProjectMeta {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  current_step: number;
  status: 'in_progress' | 'completed';
}
