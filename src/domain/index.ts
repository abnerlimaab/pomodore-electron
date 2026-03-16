// Re-exports the canonical domain entities from the main process.
// Use only with `import type` — TypeScript erases these at build time
// so Vite never tries to bundle Electron code.
export type {
  Tema,
  Atividade,
  AtividadeSessao,
  Sessao,
  SelectedActivity,
  InterruptedSession,
} from '../../electron/domain/entities';
