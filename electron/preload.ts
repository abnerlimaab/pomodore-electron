import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from './ipc-channels';

/**
 * Preload script — the only bridge between Main and Renderer.
 *
 * Rules:
 * - Only expose what the renderer actually needs
 * - All channel names come from IPC constants (no magic strings)
 * - No Node.js APIs leak to the renderer
 */
contextBridge.exposeInMainWorld('electronAPI', {

  // ─── Database ─────────────────────────────────────────────────────────────
  db: {
    getTemas:           ()       => ipcRenderer.invoke(IPC.DB.GET_TEMAS),
    createTema:         (data: object)   => ipcRenderer.invoke(IPC.DB.CREATE_TEMA, data),
    updateTema:         (data: object)   => ipcRenderer.invoke(IPC.DB.UPDATE_TEMA, data),
    deleteTema:         (id: number)     => ipcRenderer.invoke(IPC.DB.DELETE_TEMA, id),
    getAtividades:      (filters: object) => ipcRenderer.invoke(IPC.DB.GET_ATIVIDADES, filters),
    createAtividade:    (data: object)   => ipcRenderer.invoke(IPC.DB.CREATE_ATIVIDADE, data),
    updateAtividade:    (data: object)   => ipcRenderer.invoke(IPC.DB.UPDATE_ATIVIDADE, data),
    deleteAtividade:    (id: number)     => ipcRenderer.invoke(IPC.DB.DELETE_ATIVIDADE, id),
    createSessao:       (data: object)   => ipcRenderer.invoke(IPC.DB.CREATE_SESSAO, data),
    finalizeSessao:     (data: object)   => ipcRenderer.invoke(IPC.DB.FINALIZE_SESSAO, data),
    createVinculo:      (data: object)   => ipcRenderer.invoke(IPC.DB.CREATE_VINCULO, data),
    getSessoesByRange:  (range: object)  => ipcRenderer.invoke(IPC.DB.GET_SESSOES_BY_RANGE, range),
  },

  // ─── Tray ─────────────────────────────────────────────────────────────────
  tray: {
    updateTime: (data: { timeText: string; isRunning: boolean }) =>
      ipcRenderer.invoke(IPC.TRAY.UPDATE_TIME, data),
  },

  // ─── Notifications ────────────────────────────────────────────────────────
  notification: {
    show: (data: { title: string; body: string }) =>
      ipcRenderer.invoke(IPC.NOTIFICATION.SHOW, data),
  },

  // ─── Timer ────────────────────────────────────────────────────────────────
  timer: {
    schedule: (data: { finishAt: number; label: string }) =>
      ipcRenderer.invoke(IPC.TIMER.SCHEDULE, data),
    cancel: () =>
      ipcRenderer.invoke(IPC.TIMER.CANCEL),
  },

  // ─── Persisted store ──────────────────────────────────────────────────────
  store: {
    get: (key: string)                   => ipcRenderer.invoke(IPC.STORE.GET, key),
    set: (key: string, value: unknown)   => ipcRenderer.invoke(IPC.STORE.SET, key, value),
  },

  // ─── Main → Renderer events ───────────────────────────────────────────────
  onTimerFinished: (callback: () => void) => {
    ipcRenderer.on(IPC.TIMER.FINISHED, () => callback());
  },
  removeTimerFinished: () => {
    ipcRenderer.removeAllListeners(IPC.TIMER.FINISHED);
  },

  onCheckInterrupted: (callback: (data: unknown) => void) => {
    ipcRenderer.on(IPC.SESSION.CHECK_INTERRUPTED, (_event, data) => callback(data));
  },
  removeCheckInterrupted: () => {
    ipcRenderer.removeAllListeners(IPC.SESSION.CHECK_INTERRUPTED);
  },
});
