import { ipcMain, Tray, Menu, BrowserWindow } from 'electron';
import { IPC } from '../ipc-channels';

let trayRef: Tray | null = null;
let windowRef: BrowserWindow | null = null;

export function initTrayHandler(tray: Tray, mainWindow: BrowserWindow): void {
  trayRef = tray;
  windowRef = mainWindow;
}

export function updateTrayMenu(timeText: string | null, isRunning: boolean): void {
  if (!trayRef) return;
  const contextMenu = Menu.buildFromTemplate([
    { label: timeText || 'Pomodore', enabled: false },
    { type: 'separator' },
    {
      label: isRunning ? 'Pausar' : 'Retomar',
      click: () => { windowRef?.webContents.send(IPC.TRAY.TOGGLE_PLAY); },
    },
    {
      label: 'Abrir app',
      click: () => { windowRef?.show(); },
    },
    { type: 'separator' },
    { label: 'Sair', click: () => { require('electron').app.quit(); } },
  ]);
  trayRef.setToolTip(timeText || 'Pomodore');
  trayRef.setContextMenu(contextMenu);
}

export function registerTrayHandlers(): void {
  ipcMain.handle(IPC.TRAY.UPDATE_TIME, (_e, { timeText, isRunning }: { timeText: string; isRunning: boolean }) => {
    try {
      updateTrayMenu(timeText, isRunning);
      return { success: true };
    } catch (e: unknown) { return { error: (e as Error).message }; }
  });
}
