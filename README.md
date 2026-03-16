# Pomodore

App desktop de timer Pomodoro construído com Electron e React.

## Funcionalidades

- Timer Pomodoro com modos de foco e pausa
- Gerenciamento de atividades vinculadas às sessões
- Relatórios com gráficos de produtividade
- Ícone na bandeja do sistema (tray)
- Dados armazenados localmente via SQLite (sem backend)
- Suporte a temas

## Stack

- **Electron 29** + **React 18** + **Vite 5**
- **MUI v5** — componentes com Material Design 3
- **Zustand** — gerenciamento de estado
- **sql.js** — SQLite em WebAssembly (local-first, sem dependências nativas)
- **Recharts** — gráficos na página de relatórios
- **electron-store** — configurações persistentes

## Estrutura do projeto

```
├── electron/
│   ├── main.js        # Processo principal, tray, IPC handlers
│   ├── preload.js     # contextBridge expondo window.electronAPI
│   └── database.js    # Queries SQL via sql.js
├── src/
│   ├── pages/
│   │   ├── TimerPage.jsx
│   │   ├── ActivitiesPage.jsx
│   │   └── ReportsPage.jsx
│   ├── components/
│   │   └── Timer/
│   │       ├── CircularTimer.jsx
│   │       ├── TimerControls.jsx
│   │       ├── ModeSelector.jsx
│   │       └── ActivityChips.jsx
│   └── store/
│       └── useAppStore.js  # Store central Zustand
```

## Como rodar

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Gera o instalador em `dist-electron-build/`.

## Banco de dados

O banco SQLite é salvo automaticamente em `app.getPath('userData')/pomodore.db` com as tabelas: `Temas`, `Atividades`, `Sessoes` e `Vinculo_Sessao_Atividade`.
