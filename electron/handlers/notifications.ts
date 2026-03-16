import { ipcMain, Notification } from 'electron';
import { IPC } from '../ipc-channels';

export function registerNotificationHandlers(): void {
  ipcMain.handle(IPC.NOTIFICATION.SHOW, (_e, { title, body }: { title: string; body: string }) => {
    try {
      if (Notification.isSupported()) {
        new Notification({ title, body }).show();
      }
      return { success: true };
    } catch (e: unknown) { return { error: (e as Error).message }; }
  });
}
