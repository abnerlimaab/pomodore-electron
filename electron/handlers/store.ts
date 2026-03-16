import { ipcMain } from 'electron';
import { IPC } from '../ipc-channels';

type SimpleStore = {
  get: (key: string) => unknown;
  set: (key: string, value: unknown) => void;
};

let storeRef: SimpleStore | null = null;

export function initStoreHandler(store: SimpleStore): void {
  storeRef = store;
}

export function registerStoreHandlers(): void {
  ipcMain.handle(IPC.STORE.GET, (_e, key: string) => {
    try { return storeRef ? storeRef.get(key) : null; } catch { return null; }
  });

  ipcMain.handle(IPC.STORE.SET, (_e, key: string, value: unknown) => {
    try {
      storeRef?.set(key, value);
      return { success: true };
    } catch (e: unknown) { return { error: (e as Error).message }; }
  });
}
