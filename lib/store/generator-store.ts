import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  GeneratorState,
  ProjectOverview,
  BenchmarkConfig,
  ResearchData,
  ResearchResult,
  Source,
  DocumentFile,
  DesignFile,
  GeneratedDocuments,
  DesignData,
  ProjectMeta,
} from '@/lib/types';

const DEFAULT_OVERVIEW: ProjectOverview = {
  project_name: '',
  project_purpose: '',
  target_users: [],
  core_features: [],
  platform: [],
  budget_scale: 'mvp',
  timeline: '3months',
};

const DEFAULT_BENCHMARK: BenchmarkConfig = {
  type: 'benchmark',
  targets: [],
};

const DEFAULT_RESEARCH: ResearchData = {
  status: 'idle',
  queries: [],
  results: {
    market_analysis: '',
    competitor_analysis: '',
    korean_market: '',
    tech_trends: '',
  },
  sources: [],
};

const DEFAULT_DOCUMENTS: GeneratedDocuments = {
  status: 'idle',
  documents: [],
  total_tokens_used: 0,
};

const DEFAULT_DESIGN: DesignData = {
  status: 'idle',
  style_preset: 'modern_minimal',
  results: [],
};

interface GeneratorActions {
  setStep: (step: 1 | 2 | 3 | 4 | 5 | 6) => void;
  updateOverview: (data: Partial<ProjectOverview>) => void;
  updateBenchmark: (data: Partial<BenchmarkConfig>) => void;
  setResearchStatus: (status: ResearchData['status']) => void;
  setResearchResults: (data: ResearchResult, sources: Source[]) => void;
  updateResearchQuery: (queryId: string, update: Partial<ResearchData['queries'][0]>) => void;
  setResearchQueries: (queries: ResearchData['queries']) => void;
  setDocumentsStatus: (status: GeneratedDocuments['status']) => void;
  addDocument: (doc: DocumentFile) => void;
  updateDocument: (id: string, update: Partial<DocumentFile>) => void;
  updateDocumentContent: (id: string, content: string) => void;
  setDesignStatus: (status: DesignData['status']) => void;
  setDesignResults: (files: DesignFile[]) => void;
  updateDesignPreset: (preset: DesignData['style_preset']) => void;
  saveToLocal: () => void;
  loadFromLocal: (projectId: string) => boolean;
  resetAll: () => void;
  initNewProject: () => string;
}

type GeneratorStore = GeneratorState & GeneratorActions;

export const useGeneratorStore = create<GeneratorStore>((set, get) => ({
  current_step: 1,
  project_id: '',
  overview: { ...DEFAULT_OVERVIEW },
  benchmark: { ...DEFAULT_BENCHMARK },
  research: { ...DEFAULT_RESEARCH },
  documents: { ...DEFAULT_DOCUMENTS },
  design: { ...DEFAULT_DESIGN },

  setStep: (step) => set({ current_step: step }),

  updateOverview: (data) =>
    set((state) => ({
      overview: { ...state.overview, ...data },
    })),

  updateBenchmark: (data) =>
    set((state) => ({
      benchmark: { ...state.benchmark, ...data },
    })),

  setResearchStatus: (status) =>
    set((state) => ({
      research: { ...state.research, status },
    })),

  setResearchResults: (data, sources) =>
    set((state) => ({
      research: { ...state.research, results: data, sources, status: 'completed' },
    })),

  updateResearchQuery: (queryId, update) =>
    set((state) => ({
      research: {
        ...state.research,
        queries: state.research.queries.map((q) =>
          q.id === queryId ? { ...q, ...update } : q
        ),
      },
    })),

  setResearchQueries: (queries) =>
    set((state) => ({
      research: { ...state.research, queries },
    })),

  setDocumentsStatus: (status) =>
    set((state) => ({
      documents: { ...state.documents, status },
    })),

  addDocument: (doc) =>
    set((state) => ({
      documents: {
        ...state.documents,
        documents: [...state.documents.documents, doc],
        total_tokens_used: state.documents.total_tokens_used + doc.tokens_used,
      },
    })),

  updateDocument: (id, update) =>
    set((state) => ({
      documents: {
        ...state.documents,
        documents: state.documents.documents.map((d) =>
          d.id === id ? { ...d, ...update } : d
        ),
      },
    })),

  updateDocumentContent: (id, content) =>
    set((state) => ({
      documents: {
        ...state.documents,
        documents: state.documents.documents.map((d) =>
          d.id === id ? { ...d, content, modified: true } : d
        ),
      },
    })),

  setDesignStatus: (status) =>
    set((state) => ({
      design: { ...state.design, status },
    })),

  setDesignResults: (files) =>
    set((state) => ({
      design: { ...state.design, results: files, status: 'completed' },
    })),

  updateDesignPreset: (preset) =>
    set((state) => ({
      design: { ...state.design, style_preset: preset },
    })),

  saveToLocal: () => {
    const state = get();
    if (!state.project_id) return;

    const data: GeneratorState = {
      current_step: state.current_step,
      project_id: state.project_id,
      overview: state.overview,
      benchmark: state.benchmark,
      research: state.research,
      documents: state.documents,
      design: state.design,
    };

    localStorage.setItem(`devplan:project:${state.project_id}`, JSON.stringify(data));
    localStorage.setItem('devplan:current', state.project_id);

    // Update project list
    const metaList: ProjectMeta[] = JSON.parse(
      localStorage.getItem('devplan:projects') || '[]'
    );
    const existing = metaList.findIndex((m) => m.id === state.project_id);
    const meta: ProjectMeta = {
      id: state.project_id,
      name: state.overview.project_name || '새 프로젝트',
      created_at: existing >= 0 ? metaList[existing].created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
      current_step: state.current_step,
      status: state.current_step === 6 ? 'completed' : 'in_progress',
    };

    if (existing >= 0) {
      metaList[existing] = meta;
    } else {
      metaList.unshift(meta);
    }
    localStorage.setItem('devplan:projects', JSON.stringify(metaList));
  },

  loadFromLocal: (projectId) => {
    const raw = localStorage.getItem(`devplan:project:${projectId}`);
    if (!raw) return false;
    try {
      const data: GeneratorState = JSON.parse(raw);
      set({ ...data });
      return true;
    } catch {
      return false;
    }
  },

  resetAll: () =>
    set({
      current_step: 1,
      project_id: '',
      overview: { ...DEFAULT_OVERVIEW },
      benchmark: { ...DEFAULT_BENCHMARK },
      research: { ...DEFAULT_RESEARCH },
      documents: { ...DEFAULT_DOCUMENTS },
      design: { ...DEFAULT_DESIGN },
    }),

  initNewProject: () => {
    const id = uuidv4();
    set({
      current_step: 1,
      project_id: id,
      overview: { ...DEFAULT_OVERVIEW },
      benchmark: { ...DEFAULT_BENCHMARK },
      research: { ...DEFAULT_RESEARCH },
      documents: { ...DEFAULT_DOCUMENTS },
      design: { ...DEFAULT_DESIGN },
    });
    return id;
  },
}));
