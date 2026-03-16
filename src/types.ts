// ─── Domain entities ─────────────────────────────────────────────────────────

export interface Tema {
  id: number;
  nome: string;
  cor_hex: string;
}

export interface Atividade {
  id: number;
  tema_id: number | null;
  nome: string;
  status: 'ativa' | 'inativa';
  tema_nome?: string;
  tema_cor?: string;
}

export interface AtividadeSessao {
  atividade_id: number;
  prioridade: 'Primaria' | 'Secundaria';
  nome: string;
  tema_id: number | null;
  tema_nome: string | null;
  tema_cor: string | null;
}

export interface Sessao {
  id: number;
  tipo: string;
  inicio: string;
  fim?: string;
  duracao_total_segundos?: number;
  atividades?: AtividadeSessao[];
}

export interface SelectedActivity {
  id: number;
  nome: string;
  tema_nome?: string;
  tema_cor?: string;
  prioridade: 'Primaria' | 'Secundaria';
}

export interface InterruptedSession {
  sessaoId: number | null;
  start: string;
  tipo: string;
  timeLeft: number;
  mode: string;
  customSeconds: number;
  selectedActivities: SelectedActivity[];
}

// ─── Electron API exposed via contextBridge ───────────────────────────────────

export interface ElectronAPI {
  db: {
    getTemas: () => Promise<Tema[]>;
    createTema: (data: Omit<Tema, 'id'>) => Promise<Tema>;
    updateTema: (data: Tema) => Promise<Tema>;
    deleteTema: (id: number) => Promise<{ success: true }>;
    getAtividades: (filters: { tema_id?: number; status?: string }) => Promise<Atividade[]>;
    createAtividade: (data: Pick<Atividade, 'nome' | 'status' | 'tema_id'>) => Promise<Atividade>;
    updateAtividade: (data: Pick<Atividade, 'id' | 'nome' | 'status' | 'tema_id'>) => Promise<Atividade>;
    deleteAtividade: (id: number) => Promise<{ success: true }>;
    createSessao: (data: { tipo: string; inicio: string }) => Promise<Sessao>;
    finalizeSessao: (data: { id: number; fim: string; duracao_total_segundos: number }) => Promise<Sessao>;
    createVinculo: (data: { sessao_id: number; atividade_id: number; prioridade: string }) => Promise<object>;
    getSessoesByRange: (range: { inicio: string; fim: string }) => Promise<Sessao[]>;
  };
  tray: {
    updateTime: (data: { timeText: string; isRunning: boolean }) => Promise<{ success: true }>;
  };
  notification: {
    show: (data: { title: string; body: string }) => Promise<{ success: true }>;
  };
  store: {
    get: (key: string) => Promise<unknown>;
    set: (key: string, value: unknown) => Promise<{ success: true }>;
  };
  timer: {
    schedule: (data: { finishAt: number; label: string }) => Promise<{ success: true }>;
    cancel: () => Promise<{ success: true }>;
  };
  onTimerFinished: (callback: () => void) => void;
  removeTimerFinished: () => void;
  onCheckInterrupted: (callback: (data: InterruptedSession) => void) => void;
  removeCheckInterrupted: () => void;
}

// ─── Window augmentation ──────────────────────────────────────────────────────

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    webkitAudioContext?: typeof AudioContext;
  }
}
