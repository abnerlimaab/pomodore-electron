/**
 * Setup global para os testes do Main Process (Node.js / Clean Architecture).
 *
 * Responsabilidades:
 * - Resetar todos os mocks do vi entre testes.
 * - Garantir que nenhum código tente inicializar o Electron real
 *   (o módulo `electron` já é redirecionado para o mock via resolve.alias).
 */
import { vi, beforeEach, afterEach } from 'vitest'

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})
