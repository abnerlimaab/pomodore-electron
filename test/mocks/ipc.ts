/**
 * Mocks reutilizáveis da ponte IPC.
 *
 * Exportados como singletons de vi.fn() para que o setup.renderer.ts possa
 * instalá-los em window.__ipc / window.__ipcEvents, e os arquivos de teste
 * possam importar a mesma instância para configurar retornos específicos.
 *
 * @example
 *   import { ipcInvoke } from 'test/mocks/ipc'
 *   ipcInvoke.mockResolvedValueOnce({ data: [{ id: 1, nome: 'Trabalho' }] })
 */
import { vi } from 'vitest'

export const ipcInvoke = vi.fn<[string, unknown?], Promise<unknown>>()
  .mockResolvedValue({ data: null })

export const ipcEventsOn = vi.fn<[string, (data: unknown) => void], void>()
export const ipcEventsRemoveAllListeners = vi.fn<[string], void>()

/** Objeto completo montado em window.__ipc */
export const ipcMock: Window['__ipc'] = {
  invoke: ipcInvoke,
}

/** Objeto completo montado em window.__ipcEvents */
export const ipcEventsMock: Window['__ipcEvents'] = {
  on: ipcEventsOn,
  removeAllListeners: ipcEventsRemoveAllListeners,
}

/**
 * Configura o mock para responder a um canal específico.
 *
 * @example
 *   mockChannel('db.getTemas', [{ id: 1, nome: 'Trabalho', cor_hex: '#6750A4' }])
 */
export function mockChannel(channel: string, data: unknown): void {
  ipcInvoke.mockImplementation(async (ch) => {
    if (ch === channel) return { data }
    return { data: null }
  })
}
