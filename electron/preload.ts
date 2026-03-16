import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  db: {
    getTemas: () => ipcRenderer.invoke('db:getTemas'),
    createTema: (data: object) => ipcRenderer.invoke('db:createTema', data),
    updateTema: (data: object) => ipcRenderer.invoke('db:updateTema', data),
    deleteTema: (id: number) => ipcRenderer.invoke('db:deleteTema', id),
    getAtividades: (filters: object) => ipcRenderer.invoke('db:getAtividades', filters),
    createAtividade: (data: object) => ipcRenderer.invoke('db:createAtividade', data),
    updateAtividade: (data: object) => ipcRenderer.invoke('db:updateAtividade', data),
    deleteAtividade: (id: number) => ipcRenderer.invoke('db:deleteAtividade', id),
    createSessao: (data: object) => ipcRenderer.invoke('db:createSessao', data),
    finalizeSessao: (data: object) => ipcRenderer.invoke('db:finalizeSessao', data),
    createVinculo: (data: object) => ipcRenderer.invoke('db:createVinculo', data),
    getSessoesByRange: (range: object) => ipcRenderer.invoke('db:getSessoesByRange', range),
  },
  tray: {
    updateTime: (data: object) => ipcRenderer.invoke('tray:updateTime', data),
  },
  notification: {
    show: (data: object) => ipcRenderer.invoke('notification:show', data),
  },
  store: {
    get: (key: string) => ipcRenderer.invoke('store:get', key),
    set: (key: string, value: unknown) => ipcRenderer.invoke('store:set', key, value),
  },
  timer: {
    schedule: (data: object) => ipcRenderer.invoke('timer:schedule', data),
    cancel: () => ipcRenderer.invoke('timer:cancel'),
  },
  onTimerFinished: (callback: () => void) => {
    ipcRenderer.on('timer-finished', () => callback());
  },
  removeTimerFinished: () => {
    ipcRenderer.removeAllListeners('timer-finished');
  },
  onCheckInterrupted: (callback: (data: unknown) => void) => {
    ipcRenderer.on('check-interrupted-session', (_event, data) => callback(data));
  },
  removeCheckInterrupted: () => {
    ipcRenderer.removeAllListeners('check-interrupted-session');
  },
});
