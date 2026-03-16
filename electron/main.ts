import { app, BrowserWindow, Tray, nativeImage } from 'electron';
import path from 'path';
import fs from 'fs';
import { initDatabase } from './database';
import { registerRouter, initRouter } from './ipc/router';
import { initTrayHandler, updateTrayMenu } from './handlers/tray';

// Handle squirrel events on Windows (only when package is installed)
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  if (require('electron-squirrel-startup')) app.quit();
} catch (_) {}

// ─── Store ────────────────────────────────────────────────────────────────────

type SimpleStore = { get: (key: string) => unknown; set: (key: string, value: unknown) => void };

async function loadStore(): Promise<SimpleStore> {
  try {
    const { default: ElectronStore } = await import('electron-store');
    return new ElectronStore() as SimpleStore;
  } catch {
    const storePath = path.join(app.getPath('userData'), 'store.json');
    let data: Record<string, unknown> = {};
    try { data = JSON.parse(fs.readFileSync(storePath, 'utf-8')); } catch {}
    return {
      get: (key) => data[key],
      set: (key, value) => {
        data[key] = value;
        fs.writeFileSync(storePath, JSON.stringify(data, null, 2));
      },
    };
  }
}

// ─── Window ───────────────────────────────────────────────────────────────────

function getIconPath(): string {
  const iconFile = 'icon.png';
  const prodPath = path.join(process.resourcesPath, iconFile);
  const devPath = path.join(__dirname, '..', iconFile);
  return fs.existsSync(prodPath) ? prodPath : devPath;
}

function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 500,
    minHeight: 500,
    icon: getIconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
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

  return mainWindow;
}

// ─── App lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  const store = await loadStore();
  await initDatabase();

  // Register all IPC handlers before creating the window
  registerRouter();

  const mainWindow = createWindow();

  // Pass references to handlers that need to communicate back to the renderer
  initRouter(mainWindow, store);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    const interrupted = store.get('interruptedSession');
    if (interrupted) {
      mainWindow.webContents.send('session:checkInterrupted', interrupted);
    }
  });

  // Create tray
  try {
    const icon = nativeImage.createFromPath(getIconPath());
    const tray = new Tray(icon);
    initTrayHandler(tray, mainWindow);
    updateTrayMenu('Pomodore', false);
    tray.on('double-click', () => mainWindow.show());
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
