// Re-exports canonical domain entities from the main process.
// Use only with `import type` — TypeScript erases at build time.
export type {
  Tema,
  Atividade,
  AtividadeSessao,
  Sessao,
  SelectedActivity,
  InterruptedSession,
} from '../../../electron/domain/entities';

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
