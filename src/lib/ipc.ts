import type { AppRouter, Procedure } from '../../electron/ipc/router';

// ─── Typed client ─────────────────────────────────────────────────────────────

type IpcClient<TRouter> = {
  [TNamespace in keyof TRouter]: {
    [TProcedure in keyof TRouter[TNamespace]]:
      TRouter[TNamespace][TProcedure] extends Procedure<infer TInput, infer TOutput>
        ? [TInput] extends [void]
          ? () => Promise<TOutput>
          : (input: TInput) => Promise<TOutput>
        : never;
  };
};

type Envelope<T> = { data: T } | { error: string };

// ─── Proxy implementation ─────────────────────────────────────────────────────

export const ipc = new Proxy({} as IpcClient<AppRouter>, {
  get(_target, namespace: string) {
    return new Proxy({}, {
      get(_target2, proc: string) {
        return (input?: unknown) => {
          const channel = `${namespace}.${proc}`;
          return window.__ipc!.invoke(channel, input).then((res) => {
            const envelope = res as Envelope<unknown>;
            if ('error' in envelope) throw new Error(envelope.error);
            return envelope.data;
          });
        };
      },
    });
  },
});
