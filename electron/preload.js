const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  db: {
    getTemas: () => ipcRenderer.invoke('db:getTemas'),
    createTema: (data) => ipcRenderer.invoke('db:createTema', data),
    updateTema: (data) => ipcRenderer.invoke('db:updateTema', data),
    deleteTema: (id) => ipcRenderer.invoke('db:deleteTema', id),
    getAtividades: (filters) => ipcRenderer.invoke('db:getAtividades', filters),
    createAtividade: (data) => ipcRenderer.invoke('db:createAtividade', data),
    updateAtividade: (data) => ipcRenderer.invoke('db:updateAtividade', data),
    deleteAtividade: (id) => ipcRenderer.invoke('db:deleteAtividade', id),
    createSessao: (data) => ipcRenderer.invoke('db:createSessao', data),
    finalizeSessao: (data) => ipcRenderer.invoke('db:finalizeSessao', data),
    createVinculo: (data) => ipcRenderer.invoke('db:createVinculo', data),
    getSessoesByRange: (range) => ipcRenderer.invoke('db:getSessoesByRange', range),
  },
  tray: {
    updateTime: (data) => ipcRenderer.invoke('tray:updateTime', data),
  },
  notification: {
    show: (data) => ipcRenderer.invoke('notification:show', data),
  },
  store: {
    get: (key) => ipcRenderer.invoke('store:get', key),
    set: (key, value) => ipcRenderer.invoke('store:set', key, value),
  },
  timer: {
    schedule: (data) => ipcRenderer.invoke('timer:schedule', data),
    cancel: () => ipcRenderer.invoke('timer:cancel'),
  },
  onTimerFinished: (callback) => {
    ipcRenderer.on('timer-finished', () => callback());
  },
  removeTimerFinished: () => {
    ipcRenderer.removeAllListeners('timer-finished');
  },
  onCheckInterrupted: (callback) => {
    ipcRenderer.on('check-interrupted-session', (_event, data) => callback(data));
  },
  removeCheckInterrupted: () => {
    ipcRenderer.removeAllListeners('check-interrupted-session');
  },
});
