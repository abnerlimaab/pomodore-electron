/**
 * Setup global para os testes do Renderer Process (React / FSD).
 *
 * Responsabilidades:
 * - Registrar os matchers do @testing-library/jest-dom (toBeInTheDocument, etc.).
 * - Instalar o mock de window.__ipc e window.__ipcEvents antes de cada teste.
 *   Testes de UI nunca devem invocar o backend real.
 * - Resetar mocks entre testes para isolamento.
 */
import '@testing-library/jest-dom'
import { vi, beforeEach, afterEach } from 'vitest'
import { ipcMock, ipcEventsMock, ipcInvoke } from './mocks/ipc'

// ─── IPC Bridge ───────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()

  // Restaura o retorno padrão após clearAllMocks limpar a implementação
  ipcInvoke.mockResolvedValue({ data: null })

  Object.defineProperty(window, '__ipc', {
    value: ipcMock,
    writable: true,
    configurable: true,
  })

  Object.defineProperty(window, '__ipcEvents', {
    value: ipcEventsMock,
    writable: true,
    configurable: true,
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})
