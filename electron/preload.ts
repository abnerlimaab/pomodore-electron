import { contextBridge, ipcRenderer } from 'electron';

/**
 * Preload script — the only bridge between Main and Renderer.
 *
 * Rules:
 * - Only expose what the renderer actually needs
 * - No Node.js APIs leak to the renderer
 * - __ipc: generic bidirectional call bridge (typed in src/lib/ipc.ts via Proxy)
 * - __ipcEvents: push-event subscription bridge (typed in src/lib/ipc-events.ts)
 */

contextBridge.exposeInMainWorld('__ipc', {
  invoke: (channel: string, input?: unknown) => ipcRenderer.invoke(channel, input),
});

contextBridge.exposeInMainWorld('__ipcEvents', {
  on: (channel: string, cb: (data: unknown) => void) => {
    ipcRenderer.on(channel, (_event, data) => cb(data));
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
});
