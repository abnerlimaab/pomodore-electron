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

- **Electron 29** + **React 18** + **Vite 5** + **TypeScript 5**
- **MUI v5** — componentes com Material Design 3
- **Zustand** — gerenciamento de estado
- **sql.js** — SQLite em WebAssembly (local-first, sem dependências nativas)
- **Recharts** — gráficos na página de relatórios
- **electron-store** — configurações persistentes

## Arquitetura

### Processo principal — Clean Architecture (`electron/`)

O processo principal segue Clean Architecture com separação estrita de camadas.
Dependências apontam sempre para dentro: Infrastructure → Application → Repositories → Domain.

```
electron/
├── domain/
│   └── entities.ts              # Entidades de negócio puras (sem dependências)
├── repositories/
│   ├── IAtividadeRepository.ts  # Interfaces (contratos)
│   ├── ISessaoRepository.ts
│   └── ITemaRepository.ts
├── application/
│   ├── AtividadeUseCases.ts     # Casos de uso (dependem apenas de interfaces)
│   ├── SessaoUseCases.ts
│   └── TemaUseCases.ts
├── infrastructure/
│   └── db/
│       ├── DbConnection.ts      # Conexão SQLite via sql.js
│       ├── SqliteAtividadeRepository.ts
│       ├── SqliteSessaoRepository.ts
│       └── SqliteTemaRepository.ts
├── ipc/
│   └── router.ts                # Roteador IPC (camada de transporte)
├── handlers/
│   └── tray.ts                  # Handler da bandeja do sistema
├── preload.ts                   # contextBridge — expõe window.__ipc e window.__ipcEvents
└── main.ts                      # Entry point do processo principal
```

### Processo renderer — Feature-Sliced Design (`src/`)

O renderer segue FSD com hierarquia de camadas estrita.
Importações fluem de cima para baixo: `app > pages > widgets > features > entities > shared`.

```
src/
├── app/
│   └── index.tsx                # Providers, roteamento, bootstrap
├── pages/
│   ├── timer/                   # Página do timer Pomodoro
│   ├── activities/              # Página de gerenciamento de atividades
│   └── reports/                 # Página de relatórios
├── widgets/
│   ├── navigation-rail/         # Barra de navegação lateral
│   └── timer-display/           # Display circular do timer
├── features/
│   ├── select-activity/         # Seleção de atividade para a sessão
│   └── timer-session/           # Controles e seletores de modo do timer
├── entities/
│   ├── atividade/               # Store e tipos de atividade
│   ├── tema/                    # Store de tema
│   └── timer/                   # Store, modos e lógica do timer
└── shared/
    ├── api/
    │   ├── ipc.ts               # Cliente IPC type-safe (proxy via AppRouter)
    │   └── ipc-events.ts        # Subscrições a eventos do processo principal
    ├── lib/                     # Utilitários (formatTime, tray)
    ├── model/                   # Stores globais de UI
    ├── types/                   # Tipos compartilhados
    ├── config/                  # Configuração de tema MUI
    └── ui/                      # Componentes de UI genéricos
```

### Ponte IPC — IPC-as-API

O preload expõe dois objetos globais via `contextBridge`:

- `window.__ipc.invoke(channel, input)` — chamadas request/response (Promise)
- `window.__ipcEvents.on(channel, callback)` — eventos push do processo principal

O cliente IPC em `src/shared/api/ipc.ts` gera um proxy type-safe sobre `window.__ipc`,
espelhando o `AppRouter` definido em `electron/ipc/router.ts`.

## Qualidade de código

### ESLint + Prettier

Configuração ESLint Flat Config (`eslint.config.mjs`) com:

- **`typescript-eslint` strict** — checagem estrita para `electron/` e `src/`
- **`eslint-plugin-react`** + **`eslint-plugin-react-hooks`** — regras para o renderer
- **`@conarti/eslint-plugin-feature-sliced`** — guards automáticos de camadas FSD
- **`no-restricted-imports`** — guards de camadas Clean Architecture no processo principal
- **`eslint-config-prettier`** — desabilita regras que conflitam com o Prettier

```bash
npm run lint          # checar erros
npm run lint:fix      # corrigir automaticamente
npm run format        # formatar com Prettier
npm run format:check  # verificar formatação
```

### Testes unitários — Vitest v4

Dois projetos separados com ambientes isolados:

| Projeto    | Ambiente | Arquivos                    |
|------------|----------|-----------------------------|
| `main`     | Node.js  | `electron/**/*.spec.ts`     |
| `renderer` | jsdom    | `src/**/*.spec.{ts,tsx}`    |

Mocks disponíveis:

- `test/__mocks__/electron.ts` — mock completo do módulo `electron`
- `test/mocks/ipc.ts` — mocks de `window.__ipc` e `window.__ipcEvents` com helper `mockChannel`

```bash
npm test                # modo watch
npm run test:run        # execução única
npm run test:main       # apenas processo principal
npm run test:renderer   # apenas renderer
npm run test:coverage   # cobertura de código
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

O banco SQLite é salvo automaticamente em `app.getPath('userData')/pomodore.db` com as tabelas:
`Temas`, `Atividades`, `Sessoes` e `Vinculo_Sessao_Atividade`.
