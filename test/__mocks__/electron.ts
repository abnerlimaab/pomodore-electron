/**
 * Mock completo do módulo `electron`.
 *
 * Usado automaticamente pelo Vitest via resolve.alias nos dois workspaces.
 * Garante que nenhum teste tente inicializar o runtime real do Electron.
 */
import { vi } from 'vitest'

// ─── app ──────────────────────────────────────────────────────────────────────

export const app = {
  getPath: vi.fn((_key: string) => '/tmp/pomodore-test'),
  quit: vi.fn(),
  isPackaged: false,
  whenReady: vi.fn(() => Promise.resolve()),
  on: vi.fn(),
  getVersion: vi.fn(() => '0.0.0-test'),
}

// ─── BrowserWindow ────────────────────────────────────────────────────────────

const browserWindowInstance = {
  loadURL: vi.fn(),
  loadFile: vi.fn(),
  show: vi.fn(),
  hide: vi.fn(),
  close: vi.fn(),
  webContents: {
    send: vi.fn(),
    openDevTools: vi.fn(),
  },
  once: vi.fn(),
  on: vi.fn(),
}

export const BrowserWindow = Object.assign(
  vi.fn(() => browserWindowInstance),
  { getAllWindows: vi.fn(() => []) },
)

// ─── ipcMain ──────────────────────────────────────────────────────────────────

export const ipcMain = {
  handle: vi.fn(),
  on: vi.fn(),
  removeHandler: vi.fn(),
}

// ─── ipcRenderer ─────────────────────────────────────────────────────────────

export const ipcRenderer = {
  invoke: vi.fn().mockResolvedValue(null),
  on: vi.fn(),
  removeAllListeners: vi.fn(),
}

// ─── Tray ────────────────────────────────────────────────────────────────────

export const Tray = vi.fn(() => ({
  on: vi.fn(),
  setContextMenu: vi.fn(),
  setToolTip: vi.fn(),
  setImage: vi.fn(),
}))

// ─── Menu ────────────────────────────────────────────────────────────────────

export const Menu = {
  buildFromTemplate: vi.fn(() => ({})),
  setApplicationMenu: vi.fn(),
}

// ─── nativeImage ─────────────────────────────────────────────────────────────

export const nativeImage = {
  createFromPath: vi.fn(() => ({ isEmpty: vi.fn(() => false) })),
  createEmpty: vi.fn(() => ({})),
}

// ─── Notification ────────────────────────────────────────────────────────────

export const Notification = Object.assign(
  vi.fn(() => ({ show: vi.fn() })),
  { isSupported: vi.fn(() => true) },
)

// ─── contextBridge ───────────────────────────────────────────────────────────

export const contextBridge = {
  exposeInMainWorld: vi.fn(),
}

// ─── shell / dialog ──────────────────────────────────────────────────────────

export const shell = {
  openExternal: vi.fn(),
}

export const dialog = {
  showOpenDialog: vi.fn().mockResolvedValue({ canceled: true, filePaths: [] }),
  showMessageBox: vi.fn().mockResolvedValue({ response: 0 }),
}

// ─── default export (compatibilidade com `import electron from 'electron'`) ──

export default {
  app,
  BrowserWindow,
  ipcMain,
  ipcRenderer,
  Tray,
  Menu,
  nativeImage,
  Notification,
  contextBridge,
  shell,
  dialog,
}
