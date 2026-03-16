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

// ─── Window augmentation ──────────────────────────────────────────────────────

declare global {
  interface Window {
    __ipc?: {
      invoke: (channel: string, input?: unknown) => Promise<unknown>;
    };
    __ipcEvents?: {
      on: (channel: string, cb: (data: unknown) => void) => void;
      removeAllListeners: (channel: string) => void;
    };
    webkitAudioContext?: typeof AudioContext;
  }
}
