import { defineConfig, defineProject } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Configuração do Vitest v4 com dois projetos separados.
 * Substitui o antigo vitest.workspace.ts (removido no v4).
 *
 * Documentação: https://vitest.dev/guide/projects
 */
export default defineConfig({
  test: {
    projects: [
      // ═════════════════════════════════════════════════════════════════════
      // Main Process — ambiente Node.js (Clean Architecture)
      //
      // Arquivos: electron/**‌/*.spec.ts  (co-localizados)
      // `electron` npm package → redirecionado para mock via alias
      // ═════════════════════════════════════════════════════════════════════
      defineProject({
        test: {
          name: 'main',
          environment: 'node',
          include: ['electron/**/*.spec.ts'],
          exclude: ['**/node_modules/**'],
          setupFiles: ['./test/setup.main.ts'],
          globals: true,
        },
        resolve: {
          alias: {
            // O runtime do Electron não existe fora do processo Electron real.
            // Redirecionamos para o mock para evitar erros de import.
            electron: path.resolve(__dirname, 'test/__mocks__/electron.ts'),
            // Alias de conveniência para imports dentro de electron/
            '@main': path.resolve(__dirname, 'electron'),
          },
        },
      }),

      // ═════════════════════════════════════════════════════════════════════
      // Renderer Process — ambiente jsdom (React / Feature-Sliced Design)
      //
      // Arquivos: src/**‌/*.spec.{ts,tsx}  (co-localizados)
      // window.__ipc e __ipcEvents → mocks via setup.renderer.ts
      // Alias @/ espelha exatamente o vite.config.ts
      // ═════════════════════════════════════════════════════════════════════
      defineProject({
        plugins: [react()],
        test: {
          name: 'renderer',
          environment: 'jsdom',
          include: ['src/**/*.spec.{ts,tsx}'],
          exclude: ['**/node_modules/**'],
          setupFiles: ['./test/setup.renderer.ts'],
          globals: true,
        },
        resolve: {
          alias: {
            '@': path.resolve(__dirname, 'src'),
            // Segurança: redireciona electron se aparecer via import transitivo
            electron: path.resolve(__dirname, 'test/__mocks__/electron.ts'),
          },
        },
      }),
    ],
  },
})
