import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import { CircularTimer } from '../../../widgets/timer-display';
import { TimerControls, ModeSelector } from '../../../features/timer-session';
import { ActivityChips } from '../../../features/select-activity';
import { useTimerStore } from '../../../entities/timer';
import { useAtividadeStore } from '../../../entities/atividade';
import { updateTray } from '../../../shared/lib/tray';
import { ipc } from '../../../shared/api/ipc';
import { onTimerFinished, onCheckInterrupted } from '../../../shared/api/ipc-events';
import type { InterruptedSession } from '../../../shared/types';

type SnackbarSeverity = 'success' | 'info' | 'warning' | 'error';

function playAlertBeep(): void {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const doPlay = () => {
      const play = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + start + 0.05);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + start + duration);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration + 0.05);
      };
      const seq = (offset: number) => {
        play(880, offset + 0, 0.2);
        play(880, offset + 0.25, 0.2);
        play(1100, offset + 0.5, 0.4);
      };
      seq(0); seq(1.1); seq(2.2);
    };
    if (ctx.state === 'suspended') {
      ctx.resume().then(doPlay).catch(() => doPlay());
    } else {
      doPlay();
    }
  } catch (e) {
    console.warn('Audio beep failed:', e);
  }
}

export default function TimerPage() {
  const {
    currentMode, timeLeft, isRunning, isPaused,
    currentSessionId, currentSessionStart,
    freeElapsed,
    getModeData, setMode, setCustomSeconds, customSeconds,
    tick, startSession, pauseSession, resumeSession, stopSession, resetTimer,
  } = useTimerStore();
  const { selectedActivities, atividades, clearActivities } = useAtividadeStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishedRef = useRef(false);
  const [stopDialogOpen, setStopDialogOpen] = useState(false);
  const [interruptedData, setInterruptedData] = useState<InterruptedSession | null>(null);
  const [interruptedDialogOpen, setInterruptedDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: SnackbarSeverity }>({ open: false, message: '', severity: 'info' });

  const modeData = getModeData();
  const isBreak = modeData.isBreak;
  const isFree = currentMode === 'free';

  const saveSession = async (isPartial = false) => {
    if (!window.__ipc) return;

    const now = new Date().toISOString();
    let sessaoId = currentSessionId;

    if (sessaoId == null) {
      const start = currentSessionStart || now;
      const result = await ipc.db.createSessao({ tipo: modeData.tipo, inicio: start }) as { id?: number };
      if (result?.id != null) sessaoId = result.id;
    }

    if (sessaoId != null) {
      const state = useTimerStore.getState();
      const totalSeconds = modeData.seconds || customSeconds;
      const elapsed = isFree
        ? state.freeElapsed
        : isPartial
          ? totalSeconds - state.timeLeft
          : totalSeconds;
      await ipc.db.finalizeSessao({ id: sessaoId, fim: now, duracao_total_segundos: Math.max(0, elapsed) });

      for (const act of selectedActivities) {
        await ipc.db.createVinculo({ sessao_id: sessaoId, atividade_id: act.id, prioridade: act.prioridade });
      }
    }

    await ipc.store.set({ key: 'interruptedSession', value: null });
    stopSession();
  };

  const handleTimerFinish = useCallback(async () => {
    playAlertBeep();
    await saveSession(false);
    setSnackbar({ open: true, message: 'Sessão salva!', severity: 'success' });
    finishedRef.current = false;
  }, [currentSessionId, currentSessionStart, selectedActivities, modeData]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        const finished = tick();
        if (finished && !window.__ipc && !finishedRef.current) {
          finishedRef.current = true;
          clearInterval(intervalRef.current!);
          handleTimerFinish();
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  useEffect(() => {
    const display = isFree ? null : timeLeft;
    updateTray(display, isRunning, modeData.label);
  }, [timeLeft, isRunning, freeElapsed, isFree, modeData.label]);

  useEffect(() => {
    return onTimerFinished(() => {
      if (!finishedRef.current) {
        finishedRef.current = true;
        handleTimerFinish();
      }
    });
  }, [handleTimerFinish]);

  useEffect(() => {
    return onCheckInterrupted((data) => {
      setInterruptedData(data);
      setInterruptedDialogOpen(true);
    });
  }, []);

  const handleModeChange = (mode: typeof currentMode) => {
    setMode(mode);
    clearActivities();
  };

  const handleStart = async () => {
    finishedRef.current = false;
    if (!window.__ipc) { startSession(null); return; }
    const now = new Date().toISOString();
    const result = await ipc.db.createSessao({ tipo: modeData.tipo, inicio: now }) as { id?: number };
    const sessaoId = result?.id ?? null;
    startSession(sessaoId);
    if (!isFree) {
      const totalSeconds = currentMode === 'custom' ? customSeconds : (modeData.seconds ?? 0);
      await ipc.timer.schedule({ finishAt: Date.now() + totalSeconds * 1000, label: modeData.label });
    }
  };

  const handlePause = async () => {
    ipc.timer.cancel();
    pauseSession();
    if (window.__ipc) {
      await ipc.store.set({
        key: 'interruptedSession',
        value: {
          sessaoId: currentSessionId,
          start: currentSessionStart,
          tipo: modeData.tipo,
          timeLeft,
          mode: currentMode,
          customSeconds,
          selectedActivities,
        },
      });
    }
  };

  const handleResume = () => {
    resumeSession();
    if (!isFree) {
      ipc.timer.schedule({ finishAt: Date.now() + timeLeft * 1000, label: modeData.label });
    }
  };

  const handleStop = () => {
    ipc.timer.cancel();
    if (isRunning || isPaused) {
      pauseSession();
      setStopDialogOpen(true);
    } else {
      resetTimer();
    }
  };

  const handleStopSave = async () => {
    setStopDialogOpen(false);
    await saveSession(true);
    setSnackbar({ open: true, message: 'Sessão salva!', severity: 'success' });
  };

  const handleStopDiscard = () => {
    setStopDialogOpen(false);
    if (window.__ipc) ipc.store.set({ key: 'interruptedSession', value: null });
    stopSession();
  };

  const handleInterruptedSave = async () => {
    setInterruptedDialogOpen(false);
    if (!interruptedData || !window.__ipc) return;
    const now = new Date().toISOString();
    const sessaoId = interruptedData.sessaoId;
    if (sessaoId) {
      const elapsed = interruptedData.timeLeft != null
        ? (interruptedData.customSeconds || 1500) - interruptedData.timeLeft
        : 0;
      await ipc.db.finalizeSessao({ id: sessaoId, fim: now, duracao_total_segundos: Math.max(0, elapsed) });
    }
    await ipc.store.set({ key: 'interruptedSession', value: null });
    setSnackbar({ open: true, message: 'Sessão anterior salva!', severity: 'success' });
    setInterruptedData(null);
  };

  const handleInterruptedDiscard = async () => {
    setInterruptedDialogOpen(false);
    if (window.__ipc) await ipc.store.set({ key: 'interruptedSession', value: null });
    setInterruptedData(null);
  };

  return (
    <Box sx={{ overflow: 'auto', height: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', py: 4, px: 2, gap: 0 }}>
        <Box sx={{ mb: 4, width: '100%', display: 'flex', justifyContent: 'center' }}>
          <ModeSelector
            currentMode={currentMode}
            isRunning={isRunning}
            onModeChange={handleModeChange}
            customSeconds={customSeconds}
            onCustomSecondsChange={setCustomSeconds}
          />
        </Box>

        <Box sx={{ mb: 5 }}>
          <CircularTimer
            timeLeft={timeLeft}
            totalSeconds={isFree ? null : (currentMode === 'custom' ? customSeconds : modeData.seconds)}
            isRunning={isRunning}
            isPaused={isPaused}
            isFree={isFree}
            freeElapsed={freeElapsed}
            modeName={modeData.label}
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <TimerControls
            isRunning={isRunning}
            isPaused={isPaused}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
          />
        </Box>

        {!isBreak && <ActivityChips atividades={atividades} />}

        <Dialog open={stopDialogOpen} onClose={() => setStopDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Interromper Sessão</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              Deseja salvar o tempo decorrido antes de interromper?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleStopDiscard} color="error" variant="outlined">Descartar</Button>
            <Button onClick={() => setStopDialogOpen(false)} variant="outlined">Cancelar</Button>
            <Button onClick={handleStopSave} variant="contained">Salvar</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={interruptedDialogOpen} onClose={() => setInterruptedDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Sessão Anterior Encontrada</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              Uma sessão não finalizada foi encontrada. Deseja computar o tempo decorrido?
            </Typography>
            {interruptedData && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">Tipo: {interruptedData.tipo}</Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Iniciada: {new Date(interruptedData.start).toLocaleString('pt-BR')}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleInterruptedDiscard} color="error" variant="outlined">Descartar</Button>
            <Button onClick={handleInterruptedSave} variant="contained">Salvar</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={5000}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}
