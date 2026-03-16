// Re-exports canonical domain entities so existing imports keep working.
export type {
  Tema,
  Atividade,
  AtividadeSessao,
  Sessao,
  SelectedActivity,
  InterruptedSession,
} from '../electron/domain/entities';

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
