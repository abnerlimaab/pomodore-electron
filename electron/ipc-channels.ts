/**
 * Single source of truth for all IPC channel names.
 * Both main process handlers and preload script import from here,
 * ensuring compile-time safety — a rename here breaks everywhere it's used.
 */

export const IPC = {
  DB: {
    GET_TEMAS:           'db:getTemas',
    CREATE_TEMA:         'db:createTema',
    UPDATE_TEMA:         'db:updateTema',
    DELETE_TEMA:         'db:deleteTema',
    GET_ATIVIDADES:      'db:getAtividades',
    CREATE_ATIVIDADE:    'db:createAtividade',
    UPDATE_ATIVIDADE:    'db:updateAtividade',
    DELETE_ATIVIDADE:    'db:deleteAtividade',
    CREATE_SESSAO:       'db:createSessao',
    FINALIZE_SESSAO:     'db:finalizeSessao',
    CREATE_VINCULO:      'db:createVinculo',
    GET_SESSOES_BY_RANGE: 'db:getSessoesByRange',
  },
  TRAY: {
    UPDATE_TIME:  'tray:updateTime',
    TOGGLE_PLAY:  'tray:togglePlay',   // main → renderer
  },
  NOTIFICATION: {
    SHOW: 'notification:show',
  },
  TIMER: {
    SCHEDULE:  'timer:schedule',
    CANCEL:    'timer:cancel',
    FINISHED:  'timer:finished',       // main → renderer
  },
  STORE: {
    GET: 'store:get',
    SET: 'store:set',
  },
  SESSION: {
    CHECK_INTERRUPTED: 'session:checkInterrupted', // main → renderer
  },
} as const;
