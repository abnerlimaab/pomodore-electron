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
import CircularTimer from '../components/Timer/CircularTimer';
import TimerControls from '../components/Timer/TimerControls';
import ModeSelector from '../components/Timer/ModeSelector';
import ActivityChips from '../components/Timer/ActivityChips';
import useAppStore from '../store/useAppStore';
import { updateTray } from '../components/TrayManager';

// Web Audio API beep
function playAlertBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const doPlay = () => {
      const play = (freq, start, duration) => {
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
      const seq = (offset) => {
        play(880, offset + 0, 0.2);
        play(880, offset + 0.25, 0.2);
        play(1100, offset + 0.5, 0.4);
      };
      seq(0);
      seq(1.1);
      seq(2.2);
    };
    // AudioContext fica suspenso quando a tela apaga; resume() garante que toca
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
  const store = useAppStore();
  const {
    currentMode,
    timeLeft,
    isRunning,
    isPaused,
    currentSessionId,
    currentSessionStart,
    selectedActivities,
    atividades,
    freeElapsed,
    getModeData,
    setMode,
    setCustomSeconds,
    customSeconds,
    tick,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    resetTimer,
  } = store;

  const intervalRef = useRef(null);
  const finishedRef = useRef(false);
  const [stopDialogOpen, setStopDialogOpen] = useState(false);
  const [interruptedData, setInterruptedData] = useState(null);
  const [interruptedDialogOpen, setInterruptedDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const modeData = getModeData();
  const isBreak = modeData.isBreak;
  const isFree = currentMode === 'free';

  const saveSession = async (isPartial = false) => {
    console.log('[saveSession] início', { isPartial, currentSessionId, currentMode, customSeconds });
    if (!window.electronAPI) {
      console.warn('[saveSession] sem electronAPI, abortando');
      return;
    }

    const now = new Date().toISOString();
    let sessaoId = currentSessionId;

    if (sessaoId == null) {
      // Create new session
      const start = currentSessionStart || now;
      const result = await window.electronAPI.db.createSessao({
        tipo: modeData.tipo,
        inicio: start,
      });
      console.log('[saveSession] createSessao resultado:', result);
      if (result && !result.error && result.id != null) {
        sessaoId = result.id;
      }
    }

    console.log('[saveSession] sessaoId:', sessaoId);

    if (sessaoId != null) {
      const state = useAppStore.getState();
      const totalSeconds = modeData.seconds || customSeconds;
      const elapsed = isFree
        ? state.freeElapsed
        : isPartial
          ? totalSeconds - state.timeLeft
          : totalSeconds;
      console.log('[saveSession] state.timeLeft:', state.timeLeft, '| totalSeconds:', totalSeconds, '| elapsed calculado:', elapsed, '| isFree:', isFree, '| isPartial:', isPartial);
      const finalizeResult = await window.electronAPI.db.finalizeSessao({
        id: sessaoId,
        fim: now,
        duracao_total_segundos: Math.max(0, elapsed),
      });
      console.log('[saveSession] finalizeSessao resultado:', finalizeResult);

      // Save activity links
      for (const act of selectedActivities) {
        await window.electronAPI.db.createVinculo({
          sessao_id: sessaoId,
          atividade_id: act.id,
          prioridade: act.prioridade,
        });
      }
    } else {
      console.warn('[saveSession] sessaoId é nulo, sessão não será salva');
    }

    // Clear interrupted session if it was one
    if (window.electronAPI?.store) {
      await window.electronAPI.store.set('interruptedSession', null);
    }

    stopSession();
  };

  const handleTimerFinish = useCallback(async () => {
    playAlertBeep();

    // Notification is shown by main process; only show here as fallback (no electronAPI)
    if (!window.electronAPI?.timer && window.electronAPI?.notification) {
      await window.electronAPI.notification.show({
        title: 'Pomodore - Sessão Concluída!',
        body: `Sessão "${modeData.label}" finalizada.`,
      });
    }

    await saveSession(false);
    setSnackbar({ open: true, message: 'Sessão salva!', severity: 'success' });
    finishedRef.current = false;
  }, [currentSessionId, currentSessionStart, selectedActivities, modeData]);

  // Tick interval — only updates display; finish is triggered by main process IPC
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        const finished = tick();
        // Fallback: if no electronAPI timer, handle finish from renderer
        if (finished && !window.electronAPI?.timer && !finishedRef.current) {
          finishedRef.current = true;
          clearInterval(intervalRef.current);
          handleTimerFinish();
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  // Update tray when time changes
  useEffect(() => {
    const display = isFree ? null : timeLeft;
    updateTray(display, isRunning, modeData.label);
  }, [timeLeft, isRunning, freeElapsed, isFree, modeData.label]);

  // Listen for timer-finished from main process (fires on time even in background)
  useEffect(() => {
    if (window.electronAPI?.onTimerFinished) {
      window.electronAPI.onTimerFinished(() => {
        if (!finishedRef.current) {
          finishedRef.current = true;
          handleTimerFinish();
        }
      });
      return () => window.electronAPI.removeTimerFinished?.();
    }
  }, [handleTimerFinish]);

  // Listen for interrupted session from main process
  useEffect(() => {
    if (window.electronAPI?.onCheckInterrupted) {
      window.electronAPI.onCheckInterrupted((data) => {
        setInterruptedData(data);
        setInterruptedDialogOpen(true);
      });
      return () => window.electronAPI.removeCheckInterrupted?.();
    }
  }, []);

  const handleStart = async () => {
    finishedRef.current = false;
    console.log('[handleStart] modo:', currentMode, '| customSeconds:', customSeconds, '| modeData:', modeData);
    if (!window.electronAPI) {
      startSession(null);
      return;
    }
    const now = new Date().toISOString();
    const result = await window.electronAPI.db.createSessao({
      tipo: modeData.tipo,
      inicio: now,
    });
    console.log('[handleStart] createSessao resultado:', result);
    const sessaoId = result && !result.error && result.id != null ? result.id : null;
    startSession(sessaoId);
    if (!isFree && window.electronAPI.timer) {
      const totalSeconds = currentMode === 'custom' ? customSeconds : modeData.seconds;
      await window.electronAPI.timer.schedule({ finishAt: Date.now() + totalSeconds * 1000, label: modeData.label });
    }
  };

  const handlePause = async () => {
    window.electronAPI?.timer?.cancel();
    pauseSession();
    // Save interrupted state in case of app close
    if (window.electronAPI?.store) {
      await window.electronAPI.store.set('interruptedSession', {
        sessaoId: currentSessionId,
        start: currentSessionStart,
        tipo: modeData.tipo,
        timeLeft,
        mode: currentMode,
        customSeconds,
        selectedActivities,
      });
    }
  };

  const handleResume = () => {
    resumeSession();
    if (!isFree && window.electronAPI?.timer) {
      window.electronAPI.timer.schedule({ finishAt: Date.now() + timeLeft * 1000, label: modeData.label });
    }
  };

  const handleStop = () => {
    window.electronAPI?.timer?.cancel();
    if (isRunning || isPaused) {
      pauseSession();
      setStopDialogOpen(true);
    } else {
      resetTimer();
    }
  };

  const handleStopSave = async () => {
    console.log('[handleStopSave] chamado');
    setStopDialogOpen(false);
    await saveSession(true);
    setSnackbar({ open: true, message: 'Sessão salva!', severity: 'success' });
  };

  const handleStopDiscard = () => {
    setStopDialogOpen(false);
    if (window.electronAPI?.store) {
      window.electronAPI.store.set('interruptedSession', null);
    }
    stopSession();
  };

  const handleInterruptedSave = async () => {
    setInterruptedDialogOpen(false);
    if (!interruptedData || !window.electronAPI) return;
    const now = new Date().toISOString();
    const sessaoId = interruptedData.sessaoId;
    if (sessaoId) {
      const elapsed = interruptedData.timeLeft != null
        ? (interruptedData.customSeconds || 1500) - interruptedData.timeLeft
        : 0;
      await window.electronAPI.db.finalizeSessao({
        id: sessaoId,
        fim: now,
        duracao_total_segundos: Math.max(0, elapsed),
      });
    }
    await window.electronAPI.store.set('interruptedSession', null);
    setSnackbar({ open: true, message: 'Sessão anterior salva!', severity: 'success' });
    setInterruptedData(null);
  };

  const handleInterruptedDiscard = async () => {
    setInterruptedDialogOpen(false);
    if (window.electronAPI?.store) {
      await window.electronAPI.store.set('interruptedSession', null);
    }
    setInterruptedData(null);
  };

  return (
    <Box sx={{ overflow: 'auto', height: '100%' }}>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100%',
        py: 4,
        px: 2,
        gap: 0,
      }}
    >
      {/* Mode selector */}
      <Box sx={{ mb: 4, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <ModeSelector
          currentMode={currentMode}
          isRunning={isRunning}
          onModeChange={setMode}
          customSeconds={customSeconds}
          onCustomSecondsChange={setCustomSeconds}
        />
      </Box>

      {/* Circular timer */}
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

      {/* Timer controls */}
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

      {/* Activity chips - only for non-break modes */}
      {!isBreak && (
        <ActivityChips atividades={atividades} />
      )}

      {/* Stop confirmation dialog */}
      <Dialog open={stopDialogOpen} onClose={() => setStopDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Interromper Sessão</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Deseja salvar o tempo decorrido antes de interromper?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleStopDiscard} color="error" variant="outlined">
            Descartar
          </Button>
          <Button onClick={() => setStopDialogOpen(false)} variant="outlined">
            Cancelar
          </Button>
          <Button onClick={handleStopSave} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Interrupted session dialog */}
      <Dialog open={interruptedDialogOpen} onClose={() => setInterruptedDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Sessão Anterior Encontrada</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Uma sessão não finalizada foi encontrada. Deseja computar o tempo decorrido?
          </Typography>
          {interruptedData && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Tipo: {interruptedData.tipo}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Iniciada: {new Date(interruptedData.start).toLocaleString('pt-BR')}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleInterruptedDiscard} color="error" variant="outlined">
            Descartar
          </Button>
          <Button onClick={handleInterruptedSave} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
    </Box>
  );
}
