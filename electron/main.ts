import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, Notification, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import * as dbModule from './database';

// Handle squirrel events on Windows (only when package is installed)
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  if (require('electron-squirrel-startup')) app.quit();
} catch (_) {}

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let store: { get: (key: string) => unknown; set: (key: string, value: unknown) => void } | null = null;
let timerTimeout: ReturnType<typeof setTimeout> | null = null;

// Lazy load electron-store (ESM in v9+)
async function loadStore(): Promise<void> {
  try {
    const { default: ElectronStore } = await import('electron-store');
    store = new ElectronStore() as typeof store;
  } catch (_e) {
    const storePath = path.join(app.getPath('userData'), 'store.json');
    let data: Record<string, unknown> = {};
    try { data = JSON.parse(fs.readFileSync(storePath, 'utf-8')); } catch {}
    store = {
      get: (key: string) => data[key],
      set: (key: string, value: unknown) => {
        data[key] = value;
        fs.writeFileSync(storePath, JSON.stringify(data, null, 2));
      },
    };
  }
}

function getIconPath(): string {
  const iconFile = 'icon.png';
  const prodPath = path.join(process.resourcesPath, iconFile);
  const devPath = path.join(__dirname, '..', iconFile);
  return fs.existsSync(prodPath) ? prodPath : devPath;
}

function updateTrayMenu(timeText: string | null, isRunning: boolean): void {
  if (!tray) return;
  const contextMenu = Menu.buildFromTemplate([
    { label: timeText || 'Pomodore', enabled: false },
    { type: 'separator' },
    {
      label: isRunning ? 'Pausar' : 'Retomar',
      click: () => { mainWindow?.webContents.send('tray-toggle-play'); },
    },
    {
      label: 'Abrir app',
      click: () => { mainWindow?.show(); },
    },
    { type: 'separator' },
    { label: 'Sair', click: () => app.quit() },
  ]);
  tray.setToolTip(timeText || 'Pomodore');
  tray.setContextMenu(contextMenu);
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 500,
    minHeight: 500,
    icon: getIconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#1C1B1F',
  });

  const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    const interrupted = store ? store.get('interruptedSession') : null;
    if (interrupted) {
      mainWindow?.webContents.send('check-interrupted-session', interrupted);
    }
  });

  mainWindow.on('close', (_e) => {
    if (process.platform !== 'darwin') {
      // On Windows/Linux, hide to tray; actual quit from tray menu
    }
  });
}

app.whenReady().then(async () => {
  await loadStore();
  await dbModule.initDatabase();

  createWindow();

  try {
    const icon = nativeImage.createFromPath(getIconPath());
    tray = new Tray(icon);
    tray.setToolTip('Pomodore');
    updateTrayMenu('Pomodore', false);
    tray.on('double-click', () => { mainWindow?.show(); });
  } catch (e) {
    console.error('Tray creation failed:', e);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ─── IPC Handlers - Database ──────────────────────────────────────────────────

ipcMain.handle('db:getTemas', () => {
  try { return dbModule.getTemas(); } catch (e: unknown) { return { error: (e as Error).message }; }
});

ipcMain.handle('db:createTema', (_e, data) => {
  try { return dbModule.createTema(data); } catch (e: unknown) { return { error: (e as Error).message }; }
});

ipcMain.handle('db:updateTema', (_e, data) => {
  try { return dbModule.updateTema(data); } catch (e: unknown) { return { error: (e as Error).message }; }
});

ipcMain.handle('db:deleteTema', (_e, id) => {
  try { return dbModule.deleteTema(id); } catch (e: unknown) { return { error: (e as Error).message }; }
});

ipcMain.handle('db:getAtividades', (_e, filters) => {
  try { return dbModule.getAtividades(filters); } catch (e: unknown) { return { error: (e as Error).message }; }
});

ipcMain.handle('db:createAtividade', (_e, data) => {
  try { return dbModule.createAtividade(data); } catch (e: unknown) { return { error: (e as Error).message }; }
});

ipcMain.handle('db:updateAtividade', (_e, data) => {
  try { return dbModule.updateAtividade(data); } catch (e: unknown) { return { error: (e as Error).message }; }
});

ipcMain.handle('db:deleteAtividade', (_e, id) => {
  try { return dbModule.deleteAtividade(id); } catch (e: unknown) { return { error: (e as Error).message }; }
});

ipcMain.handle('db:createSessao', (_e, data) => {
  try { return dbModule.createSessao(data); } catch (e: unknown) { return { error: (e as Error).message }; }
});

ipcMain.handle('db:finalizeSessao', (_e, data) => {
  try { return dbModule.finalizeSessao(data); } catch (e: unknown) { return { error: (e as Error).message }; }
});

ipcMain.handle('db:createVinculo', (_e, data) => {
  try { return dbModule.createVinculo(data); } catch (e: unknown) { return { error: (e as Error).message }; }
});

ipcMain.handle('db:getSessoesByRange', (_e, range) => {
  try { return dbModule.getSessoesByRange(range); } catch (e: unknown) { return { error: (e as Error).message }; }
});

// ─── IPC Handlers - Tray ─────────────────────────────────────────────────────

ipcMain.handle('tray:updateTime', (_e, { timeText, isRunning }: { timeText: string; isRunning: boolean }) => {
  try {
    updateTrayMenu(timeText, isRunning);
    return { success: true };
  } catch (e: unknown) { return { error: (e as Error).message }; }
});

// ─── IPC Handlers - Notifications ────────────────────────────────────────────

ipcMain.handle('notification:show', (_e, { title, body }: { title: string; body: string }) => {
  try {
    if (Notification.isSupported()) {
      new Notification({ title, body }).show();
    }
    return { success: true };
  } catch (e: unknown) { return { error: (e as Error).message }; }
});

// ─── IPC Handlers - Timer ────────────────────────────────────────────────────

ipcMain.handle('timer:schedule', (_e, { finishAt, label }: { finishAt: number; label: string }) => {
  if (timerTimeout) { clearTimeout(timerTimeout); timerTimeout = null; }
  const delay = Math.max(0, finishAt - Date.now());
  timerTimeout = setTimeout(() => {
    timerTimeout = null;
    if (Notification.isSupported()) {
      new Notification({ title: 'Pomodore - Sessão Concluída!', body: `Sessão "${label}" finalizada.` }).show();
    }
    mainWindow?.webContents.send('timer-finished');
  }, delay);
  return { success: true };
});

ipcMain.handle('timer:cancel', () => {
  if (timerTimeout) { clearTimeout(timerTimeout); timerTimeout = null; }
  return { success: true };
});

// ─── IPC Handlers - Store ────────────────────────────────────────────────────

ipcMain.handle('store:get', (_e, key: string) => {
  try { return store ? store.get(key) : null; } catch (_e) { return null; }
});

ipcMain.handle('store:set', (_e, key: string, value: unknown) => {
  try {
    if (store) store.set(key, value);
    return { success: true };
  } catch (e: unknown) { return { error: (e as Error).message }; }
});

// Explicitly avoid unused import warning
void shell;
