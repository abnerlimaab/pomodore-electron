import { ipcMain, BrowserWindow, Notification } from 'electron';
import { IPC } from '../ipc-channels';

let timerTimeout: ReturnType<typeof setTimeout> | null = null;
let windowRef: BrowserWindow | null = null;

export function initTimerHandler(mainWindow: BrowserWindow): void {
  windowRef = mainWindow;
}

export function registerTimerHandlers(): void {
  ipcMain.handle(IPC.TIMER.SCHEDULE, (_e, { finishAt, label }: { finishAt: number; label: string }) => {
    if (timerTimeout) { clearTimeout(timerTimeout); timerTimeout = null; }
    const delay = Math.max(0, finishAt - Date.now());
    timerTimeout = setTimeout(() => {
      timerTimeout = null;
      if (Notification.isSupported()) {
        new Notification({
          title: 'Pomodore - Sessão Concluída!',
          body: `Sessão "${label}" finalizada.`,
        }).show();
      }
      windowRef?.webContents.send(IPC.TIMER.FINISHED);
    }, delay);
    return { success: true };
  });

  ipcMain.handle(IPC.TIMER.CANCEL, () => {
    if (timerTimeout) { clearTimeout(timerTimeout); timerTimeout = null; }
    return { success: true };
  });
}
