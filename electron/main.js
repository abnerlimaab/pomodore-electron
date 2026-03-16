const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, Notification, shell } = require('electron');
const path = require('path');

// Handle squirrel events on Windows (only when package is installed)
try {
  if (require('electron-squirrel-startup')) app.quit();
} catch (_) {}

let mainWindow;
let tray;
let Store;
let store;
let db;
let timerTimeout = null;

// Lazy load electron-store (ESM in v9+)
async function loadStore() {
  try {
    const { default: ElectronStore } = await import('electron-store');
    store = new ElectronStore();
  } catch (e) {
    // Fallback simple store using JSON
    const fs = require('fs');
    const storePath = path.join(app.getPath('userData'), 'store.json');
    let data = {};
    try { data = JSON.parse(fs.readFileSync(storePath, 'utf-8')); } catch {}
    store = {
      get: (key) => data[key],
      set: (key, value) => {
        data[key] = value;
        fs.writeFileSync(storePath, JSON.stringify(data, null, 2));
      },
    };
  }
}

function getIconPath() {
  // In production the icon is bundled; in dev it sits at the project root
  const iconFile = 'icon.png';
  const prodPath = path.join(process.resourcesPath, iconFile);
  const devPath  = path.join(__dirname, '..', iconFile);
  return require('fs').existsSync(prodPath) ? prodPath : devPath;
}

function updateTrayMenu(timeText, isRunning) {
  if (!tray) return;
  const contextMenu = Menu.buildFromTemplate([
    {
      label: timeText || 'Pomodore',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: isRunning ? 'Pausar' : 'Retomar',
      click: () => {
        mainWindow && mainWindow.webContents.send('tray-toggle-play');
      },
    },
    {
      label: 'Abrir app',
      click: () => {
        mainWindow && mainWindow.show();
      },
    },
    { type: 'separator' },
    {
      label: 'Sair',
      click: () => app.quit(),
    },
  ]);
  tray.setToolTip(timeText || 'Pomodore');
  tray.setContextMenu(contextMenu);
}

function createWindow() {
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

  mainWindow.once('ready-to-show', async () => {
    mainWindow.show();
    // Check for interrupted session
    const interrupted = store ? store.get('interruptedSession') : null;
    if (interrupted) {
      mainWindow.webContents.send('check-interrupted-session', interrupted);
    }
  });

  mainWindow.on('close', (e) => {
    // App will handle session saving via IPC before quitting
    if (process.platform !== 'darwin') {
      // On Windows/Linux, just hide to tray if tray exists
      // actual quit happens from tray menu
    }
  });
}

app.whenReady().then(async () => {
  await loadStore();

  // Initialize database
  const dbModule = require('./database');
  await dbModule.initDatabase();
  db = dbModule;

  createWindow();

  // Create tray
  try {
    const icon = nativeImage.createFromPath(getIconPath());
    tray = new Tray(icon);
    tray.setToolTip('Pomodore');
    updateTrayMenu('Pomodore', false);
    tray.on('double-click', () => {
      mainWindow && mainWindow.show();
    });
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

// IPC Handlers - Database

ipcMain.handle('db:getTemas', () => {
  try { return db.getTemas(); } catch (e) { return { error: e.message }; }
});

ipcMain.handle('db:createTema', (_, data) => {
  try { return db.createTema(data); } catch (e) { return { error: e.message }; }
});

ipcMain.handle('db:updateTema', (_, data) => {
  try { return db.updateTema(data); } catch (e) { return { error: e.message }; }
});

ipcMain.handle('db:deleteTema', (_, id) => {
  try { return db.deleteTema(id); } catch (e) { return { error: e.message }; }
});

ipcMain.handle('db:getAtividades', (_, filters) => {
  try { return db.getAtividades(filters); } catch (e) { return { error: e.message }; }
});

ipcMain.handle('db:createAtividade', (_, data) => {
  try { return db.createAtividade(data); } catch (e) { return { error: e.message }; }
});

ipcMain.handle('db:updateAtividade', (_, data) => {
  try { return db.updateAtividade(data); } catch (e) { return { error: e.message }; }
});

ipcMain.handle('db:deleteAtividade', (_, id) => {
  try { return db.deleteAtividade(id); } catch (e) { return { error: e.message }; }
});

ipcMain.handle('db:createSessao', (_, data) => {
  try { return db.createSessao(data); } catch (e) { return { error: e.message }; }
});

ipcMain.handle('db:finalizeSessao', (_, data) => {
  try { return db.finalizeSessao(data); } catch (e) { return { error: e.message }; }
});

ipcMain.handle('db:createVinculo', (_, data) => {
  try { return db.createVinculo(data); } catch (e) { return { error: e.message }; }
});

ipcMain.handle('db:getSessoesByRange', (_, range) => {
  try { return db.getSessoesByRange(range); } catch (e) { return { error: e.message }; }
});

// IPC Handlers - Tray
ipcMain.handle('tray:updateTime', (_, { timeText, isRunning }) => {
  try {
    updateTrayMenu(timeText, isRunning);
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
});

// IPC Handlers - Notifications
ipcMain.handle('notification:show', (_, { title, body }) => {
  try {
    if (Notification.isSupported()) {
      new Notification({ title, body }).show();
    }
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
});

// IPC Handlers - Timer scheduling (runs in main process, unaffected by renderer throttling)
ipcMain.handle('timer:schedule', (_, { finishAt, label }) => {
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

// IPC Handlers - Store
ipcMain.handle('store:get', (_, key) => {
  try { return store ? store.get(key) : null; } catch (e) { return null; }
});

ipcMain.handle('store:set', (_, key, value) => {
  try {
    if (store) store.set(key, value);
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
});
