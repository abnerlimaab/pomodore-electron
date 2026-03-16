import { ipcMain } from 'electron';
import { IPC } from '../ipc-channels';
import * as db from '../database';

export function registerDatabaseHandlers(): void {
  ipcMain.handle(IPC.DB.GET_TEMAS, () => {
    try { return db.getTemas(); } catch (e: unknown) { return { error: (e as Error).message }; }
  });

  ipcMain.handle(IPC.DB.CREATE_TEMA, (_e, data) => {
    try { return db.createTema(data); } catch (e: unknown) { return { error: (e as Error).message }; }
  });

  ipcMain.handle(IPC.DB.UPDATE_TEMA, (_e, data) => {
    try { return db.updateTema(data); } catch (e: unknown) { return { error: (e as Error).message }; }
  });

  ipcMain.handle(IPC.DB.DELETE_TEMA, (_e, id) => {
    try { return db.deleteTema(id); } catch (e: unknown) { return { error: (e as Error).message }; }
  });

  ipcMain.handle(IPC.DB.GET_ATIVIDADES, (_e, filters) => {
    try { return db.getAtividades(filters); } catch (e: unknown) { return { error: (e as Error).message }; }
  });

  ipcMain.handle(IPC.DB.CREATE_ATIVIDADE, (_e, data) => {
    try { return db.createAtividade(data); } catch (e: unknown) { return { error: (e as Error).message }; }
  });

  ipcMain.handle(IPC.DB.UPDATE_ATIVIDADE, (_e, data) => {
    try { return db.updateAtividade(data); } catch (e: unknown) { return { error: (e as Error).message }; }
  });

  ipcMain.handle(IPC.DB.DELETE_ATIVIDADE, (_e, id) => {
    try { return db.deleteAtividade(id); } catch (e: unknown) { return { error: (e as Error).message }; }
  });

  ipcMain.handle(IPC.DB.CREATE_SESSAO, (_e, data) => {
    try { return db.createSessao(data); } catch (e: unknown) { return { error: (e as Error).message }; }
  });

  ipcMain.handle(IPC.DB.FINALIZE_SESSAO, (_e, data) => {
    try { return db.finalizeSessao(data); } catch (e: unknown) { return { error: (e as Error).message }; }
  });

  ipcMain.handle(IPC.DB.CREATE_VINCULO, (_e, data) => {
    try { return db.createVinculo(data); } catch (e: unknown) { return { error: (e as Error).message }; }
  });

  ipcMain.handle(IPC.DB.GET_SESSOES_BY_RANGE, (_e, range) => {
    try { return db.getSessoesByRange(range); } catch (e: unknown) { return { error: (e as Error).message }; }
  });
}
