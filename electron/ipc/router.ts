import { ipcMain, BrowserWindow, Notification } from 'electron';
import { updateTrayMenu } from '../handlers/tray';
import { IPC } from '../ipc-channels';
import type { TemaUseCases } from '../application/TemaUseCases';
import type { AtividadeUseCases } from '../application/AtividadeUseCases';
import type { SessaoUseCases } from '../application/SessaoUseCases';
import type { Tema, Atividade, Sessao } from '../domain/entities';

// ─── Procedure helper ─────────────────────────────────────────────────────────

export interface Procedure<TInput, TOutput> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _def: any; // phantom field — carries types, erased at runtime
  handler: (input: TInput) => TOutput | Promise<TOutput>;
}

function procedure<TInput, TOutput>(
  handler: (input: TInput) => TOutput | Promise<TOutput>,
): Procedure<TInput, TOutput> {
  return { _def: null, handler };
}

// ─── Shared refs ──────────────────────────────────────────────────────────────

let windowRef: BrowserWindow | null = null;
let timerTimeout: ReturnType<typeof setTimeout> | null = null;

type SimpleStore = { get: (key: string) => unknown; set: (key: string, value: unknown) => void };
let storeRef: SimpleStore | null = null;

export interface AppUseCases {
  temas: TemaUseCases;
  atividades: AtividadeUseCases;
  sessoes: SessaoUseCases;
}
let useCasesRef: AppUseCases | null = null;

export function initRouter(mainWindow: BrowserWindow, store: SimpleStore, useCases: AppUseCases): void {
  windowRef = mainWindow;
  storeRef = store;
  useCasesRef = useCases;
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const appRouter = {

  db: {
    getTemas:          procedure<void, Tema[]>(() => useCasesRef!.temas.getTemas()),
    createTema:        procedure<{ nome: string; cor_hex?: string }, Tema>(d => useCasesRef!.temas.createTema(d)),
    updateTema:        procedure<{ id: number; nome: string; cor_hex: string }, Tema>(d => useCasesRef!.temas.updateTema(d)),
    deleteTema:        procedure<number, void>(id => useCasesRef!.temas.deleteTema(id)),
    getAtividades:     procedure<{ tema_id?: number; status?: string }, Atividade[]>(f => useCasesRef!.atividades.getAtividades(f)),
    createAtividade:   procedure<{ tema_id?: number | null; nome: string; status?: string }, Atividade>(d => useCasesRef!.atividades.createAtividade(d)),
    updateAtividade:   procedure<{ id: number; tema_id?: number | null; nome: string; status: string }, Atividade>(d => useCasesRef!.atividades.updateAtividade(d)),
    deleteAtividade:   procedure<number, void>(id => useCasesRef!.atividades.deleteAtividade(id)),
    createSessao:      procedure<{ tipo: string; inicio: string }, Pick<Sessao, 'id' | 'tipo' | 'inicio'>>(d => useCasesRef!.sessoes.createSessao(d)),
    finalizeSessao:    procedure<{ id: number; fim: string; duracao_total_segundos: number }, void>(d => useCasesRef!.sessoes.finalizeSessao(d)),
    createVinculo:     procedure<{ sessao_id: number; atividade_id: number; prioridade: string }, void>(d => useCasesRef!.sessoes.createVinculo(d)),
    getSessoesByRange: procedure<{ inicio: string; fim: string }, Sessao[]>(r => useCasesRef!.sessoes.getSessoesByRange(r)),
  },

  tray: {
    updateTime: procedure<{ timeText: string; isRunning: boolean }, { success: true }>(
      ({ timeText, isRunning }) => { updateTrayMenu(timeText, isRunning); return { success: true }; },
    ),
  },

  notification: {
    show: procedure<{ title: string; body: string }, { success: true }>(
      ({ title, body }) => {
        if (Notification.isSupported()) new Notification({ title, body }).show();
        return { success: true };
      },
    ),
  },

  timer: {
    schedule: procedure<{ finishAt: number; label: string }, { success: true }>(
      ({ finishAt, label }) => {
        if (timerTimeout) { clearTimeout(timerTimeout); timerTimeout = null; }
        const delay = Math.max(0, finishAt - Date.now());
        timerTimeout = setTimeout(() => {
          timerTimeout = null;
          if (Notification.isSupported()) {
            new Notification({
              title: 'Pomodore - Sessão Concluída!',
              body: `Sessão "${label}" finalizada.`,
            }).show();
          }
          windowRef?.webContents.send(IPC.TIMER.FINISHED);
        }, delay);
        return { success: true };
      },
    ),
    cancel: procedure<void, { success: true }>(() => {
      if (timerTimeout) { clearTimeout(timerTimeout); timerTimeout = null; }
      return { success: true };
    }),
  },

  store: {
    get: procedure<string, unknown>(key => storeRef?.get(key) ?? null),
    set: procedure<{ key: string; value: unknown }, { success: true }>(({ key, value }) => {
      storeRef?.set(key, value);
      return { success: true };
    }),
  },

};

export type AppRouter = typeof appRouter;

// ─── Registration ─────────────────────────────────────────────────────────────

type AnyProcedure = Procedure<unknown, unknown>;

export function registerRouter(): void {
  for (const [namespace, procedures] of Object.entries(appRouter)) {
    for (const [name, proc] of Object.entries(procedures as Record<string, AnyProcedure>)) {
      const channel = `${namespace}.${name}`;
      ipcMain.handle(channel, async (_e, input: unknown) => {
        try {
          const data = await proc.handler(input);
          return { data };
        } catch (e) {
          return { error: (e as Error).message };
        }
      });
    }
  }
}
