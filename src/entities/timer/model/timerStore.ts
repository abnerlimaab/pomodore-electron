import { create } from 'zustand';
import { MODES, type ModeKey, type ModeData } from '../lib/modes';

interface TimerState {
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
}

export const useTimerStore = create<TimerState>()((set, get) => ({
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
      timerStartedAt: null,
      timeLeftAtStart: 0,
      freeElapsedBase: 0,
      // Note: clearing selectedActivities is the page's responsibility
    });
  },

  setCustomSeconds: (seconds) => set({ customSeconds: seconds, timeLeft: seconds }),

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
      isRunning: false, isPaused: false,
      currentSessionId: null, currentSessionStart: null,
      timeLeft: seconds, freeElapsed: 0,
      timerStartedAt: null, timeLeftAtStart: 0, freeElapsedBase: 0,
    });
  },

  resetTimer: () => {
    const { currentMode, customSeconds } = get();
    const modeData = MODES[currentMode];
    const seconds = currentMode === 'custom' ? customSeconds : (modeData?.seconds ?? 25 * 60);
    set({
      isRunning: false, isPaused: false,
      timeLeft: seconds, freeElapsed: 0,
      currentSessionId: null, currentSessionStart: null,
      timerStartedAt: null, timeLeftAtStart: 0, freeElapsedBase: 0,
    });
  },
}));
