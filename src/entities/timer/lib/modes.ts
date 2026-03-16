export type ModeKey =
  | 'pomodoro-25'
  | 'pomodoro-50'
  | 'break-5'
  | 'break-10'
  | 'break-30'
  | 'custom'
  | 'free';

export interface ModeData {
  label: string;
  seconds: number | null;
  tipo: string;
  isBreak: boolean;
}

export const MODES: Record<ModeKey, ModeData> = {
  'pomodoro-25': { label: 'Pomodoro 25', seconds: 25 * 60, tipo: 'Pomodoro', isBreak: false },
  'pomodoro-50': { label: 'Pomodoro 50', seconds: 50 * 60, tipo: 'Pomodoro', isBreak: false },
  'break-5':     { label: 'Pausa 5',     seconds: 5  * 60, tipo: 'Pausa',    isBreak: true  },
  'break-10':    { label: 'Pausa 10',    seconds: 10 * 60, tipo: 'Pausa',    isBreak: true  },
  'break-30':    { label: 'Pausa 30',    seconds: 30 * 60, tipo: 'Pausa',    isBreak: true  },
  'custom':      { label: 'Personalizado', seconds: 25 * 60, tipo: 'Pomodoro', isBreak: false },
  'free':        { label: 'Livre',       seconds: null,    tipo: 'Livre',    isBreak: false },
};
