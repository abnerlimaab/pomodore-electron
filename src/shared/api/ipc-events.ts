import type { InterruptedSession } from '../types';
import { IPC } from '../../../electron/ipc-channels';

export function onTimerFinished(callback: () => void): () => void {
  window.__ipcEvents?.on(IPC.TIMER.FINISHED, () => callback());
  return () => window.__ipcEvents?.removeAllListeners(IPC.TIMER.FINISHED);
}

export function onCheckInterrupted(callback: (data: InterruptedSession) => void): () => void {
  window.__ipcEvents?.on(IPC.SESSION.CHECK_INTERRUPTED, (data) => callback(data as InterruptedSession));
  return () => window.__ipcEvents?.removeAllListeners(IPC.SESSION.CHECK_INTERRUPTED);
}

export function onTrayTogglePlay(callback: () => void): () => void {
  window.__ipcEvents?.on(IPC.TRAY.TOGGLE_PLAY, () => callback());
  return () => window.__ipcEvents?.removeAllListeners(IPC.TRAY.TOGGLE_PLAY);
}
