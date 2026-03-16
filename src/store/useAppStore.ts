import { create } from 'zustand';
import type { SelectedActivity } from '../types';

// ─── Mode types ───────────────────────────────────────────────────────────────

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
  'break-5':     { label: 'Pausa 5',     seconds: 5 * 60,  tipo: 'Pausa',    isBreak: true  },
  'break-10':    { label: 'Pausa 10',    seconds: 10 * 60, tipo: 'Pausa',    isBreak: true  },
  'break-30':    { label: 'Pausa 30',    seconds: 30 * 60, tipo: 'Pausa',    isBreak: true  },
  'custom':      { label: 'Personalizado', seconds: 25 * 60, tipo: 'Pomodoro', isBreak: false },
  'free':        { label: 'Livre',       seconds: null,    tipo: 'Livre',    isBreak: false },
};

// ─── Store types ──────────────────────────────────────────────────────────────

interface AppStore {
  // Timer state
  currentMode: ModeKey;
  customSeconds: number;
  timeLeft: number;
  isRunning: boolean;
  isPaused: boolean;
  currentSessionId: number | null;
  currentSessionStart: string | null;
  freeElapsed: number;
  timerStartedAt: number | null;
  timeLeftAtStart: number;
  freeElapsedBase: number;

  // Activities
  selectedActivities: SelectedActivity[];

  // Theme
  colorScheme: 'light' | 'dark';
  palette: string;
  railExpanded: boolean;

  // Cached data
  grupos: unknown[];
  atividades: unknown[];

  // Actions
  setColorScheme: (scheme: 'light' | 'dark') => void;
  setPalette: (palette: string) => void;
  toggleRail: () => void;
  setMode: (mode: ModeKey) => void;
  setCustomSeconds: (seconds: number) => void;
  getModeData: () => ModeData;
  getModes: () => Record<ModeKey, ModeData>;
  tick: () => boolean;
  startSession: (sessionId: number | null) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  stopSession: () => void;
  resetTimer: () => void;
  addActivity: (activity: Omit<SelectedActivity, 'prioridade'>) => void;
  removeActivity: (id: number) => void;
  setPrimary: (id: number) => void;
  clearActivities: () => void;
  setGrupos: (grupos: unknown[]) => void;
  setAtividades: (atividades: unknown[]) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

const useAppStore = create<AppStore>()((set, get) => ({
  currentMode: 'pomodoro-25',
  customSeconds: 25 * 60,
  timeLeft: 25 * 60,
  isRunning: false,
  isPaused: false,
  currentSessionId: null,
  currentSessionStart: null,
  freeElapsed: 0,
  timerStartedAt: null,
  timeLeftAtStart: 0,
  freeElapsedBase: 0,

  selectedActivities: [],

  colorScheme: 'dark',
  palette: 'violeta',
  railExpanded: false,

  grupos: [],
  atividades: [],

  setColorScheme: (scheme) => set({ colorScheme: scheme }),
  setPalette: (palette) => set({ palette }),
  toggleRail: () => set((s) => ({ railExpanded: !s.railExpanded })),

  setMode: (mode) => {
    const modeData = MODES[mode];
    if (!modeData) return;
    const seconds = mode === 'custom' ? get().customSeconds : modeData.seconds;
    set({
      currentMode: mode,
      timeLeft: seconds ?? 25 * 60,
      isRunning: false,
      isPaused: false,
      currentSessionId: null,
      currentSessionStart: null,
      freeElapsed: 0,
      selectedActivities: [],
      timerStartedAt: null,
      timeLeftAtStart: 0,
      freeElapsedBase: 0,
    });
  },

  setCustomSeconds: (seconds) => {
    set({ customSeconds: seconds, timeLeft: seconds });
  },

  getModeData: () => {
    const { currentMode, customSeconds } = get();
    const base = MODES[currentMode];
    if (!base) return MODES['pomodoro-25'];
    if (currentMode === 'custom') return { ...base, seconds: customSeconds };
    return base;
  },

  getModes: () => MODES,

  tick: () => {
    const { currentMode, timeLeftAtStart, timerStartedAt, freeElapsedBase } = get();
    const elapsed = Math.floor((Date.now() - (timerStartedAt ?? Date.now())) / 1000);
    if (currentMode === 'free') {
      set({ freeElapsed: freeElapsedBase + elapsed });
      return false;
    }
    const newTimeLeft = Math.max(0, timeLeftAtStart - elapsed);
    set({ timeLeft: newTimeLeft });
    if (newTimeLeft <= 0) {
      set({ isRunning: false });
      return true;
    }
    return false;
  },

  startSession: (sessionId) => {
    const { timeLeft } = get();
    set({
      isRunning: true,
      isPaused: false,
      currentSessionId: sessionId,
      currentSessionStart: new Date().toISOString(),
      timerStartedAt: Date.now(),
      timeLeftAtStart: timeLeft,
      freeElapsedBase: 0,
      freeElapsed: 0,
    });
  },

  pauseSession: () => {
    const { currentMode, timeLeftAtStart, timerStartedAt, freeElapsedBase } = get();
    const elapsed = Math.ceil((Date.now() - (timerStartedAt ?? Date.now())) / 1000);
    if (currentMode === 'free') {
      const newFreeElapsed = freeElapsedBase + elapsed;
      set({ isRunning: false, isPaused: true, freeElapsed: newFreeElapsed, freeElapsedBase: newFreeElapsed, timerStartedAt: null });
    } else {
      const newTimeLeft = Math.max(0, timeLeftAtStart - elapsed);
      set({ isRunning: false, isPaused: true, timeLeft: newTimeLeft, timerStartedAt: null });
    }
  },

  resumeSession: () => {
    const { timeLeft } = get();
    set({ isRunning: true, isPaused: false, timerStartedAt: Date.now(), timeLeftAtStart: timeLeft });
  },

  stopSession: () => {
    const { currentMode, customSeconds } = get();
    const modeData = MODES[currentMode];
    const seconds = currentMode === 'custom' ? customSeconds : (modeData?.seconds ?? 25 * 60);
    set({
      isRunning: false,
      isPaused: false,
      currentSessionId: null,
      currentSessionStart: null,
      timeLeft: seconds,
      freeElapsed: 0,
      timerStartedAt: null,
      timeLeftAtStart: 0,
      freeElapsedBase: 0,
    });
  },

  resetTimer: () => {
    const { currentMode, customSeconds } = get();
    const modeData = MODES[currentMode];
    const seconds = currentMode === 'custom' ? customSeconds : (modeData?.seconds ?? 25 * 60);
    set({
      isRunning: false,
      isPaused: false,
      timeLeft: seconds,
      freeElapsed: 0,
      currentSessionId: null,
      currentSessionStart: null,
      timerStartedAt: null,
      timeLeftAtStart: 0,
      freeElapsedBase: 0,
    });
  },

  addActivity: (activity) => {
    const { selectedActivities } = get();
    if (selectedActivities.find(a => a.id === activity.id)) return;
    const prioridade: 'Primaria' | 'Secundaria' = selectedActivities.length === 0 ? 'Primaria' : 'Secundaria';
    set({ selectedActivities: [...selectedActivities, { ...activity, prioridade }] });
  },

  removeActivity: (id) => {
    let activities = get().selectedActivities.filter(a => a.id !== id);
    if (activities.length > 0 && !activities.find(a => a.prioridade === 'Primaria')) {
      activities = activities.map((a, i) => i === 0 ? { ...a, prioridade: 'Primaria' as const } : a);
    }
    set({ selectedActivities: activities });
  },

  setPrimary: (id) => {
    const activities = get().selectedActivities.map(a => ({
      ...a,
      prioridade: (a.id === id ? 'Primaria' : 'Secundaria') as 'Primaria' | 'Secundaria',
    }));
    set({ selectedActivities: activities });
  },

  clearActivities: () => set({ selectedActivities: [] }),

  setGrupos: (grupos) => set({ grupos }),
  setAtividades: (atividades) => set({ atividades }),
}));

export default useAppStore;
