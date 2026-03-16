import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';

function formatTime(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function useTimerSize(): number {
  const [size, setSize] = useState(240);
  useEffect(() => {
    const update = () => {
      const available = window.innerWidth - 60 - 80;
      const availableH = window.innerHeight - 290;
      setSize(Math.min(240, Math.max(150, available, availableH)));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return size;
}

interface CircularTimerProps {
  timeLeft: number;
  totalSeconds: number | null;
  isRunning: boolean;
  isPaused: boolean;
  isFree: boolean;
  freeElapsed: number;
  modeName: string;
}

export default function CircularTimer({
  timeLeft,
  totalSeconds,
  isRunning,
  isPaused,
  isFree,
  freeElapsed,
  modeName,
}: CircularTimerProps) {
  const theme = useTheme();
  const size = useTimerSize();

  let progress = 100;
  if (!isFree && totalSeconds && totalSeconds > 0) {
    progress = (timeLeft / totalSeconds) * 100;
  }

  const displayTime = isFree ? formatTime(freeElapsed) : formatTime(timeLeft);
  const thickness = 4;

  const getColor = () => {
    if (!isRunning && !isPaused) return theme.palette.text.secondary;
    if (isPaused) return (theme.palette.warning as { main?: string })?.main ?? '#F4A261';
    return theme.palette.primary.main;
  };

  const timeFontSize = size < 180
    ? (isFree && freeElapsed >= 3600 ? '1.6rem' : '2rem')
    : (isFree && freeElapsed >= 3600 ? '2.2rem' : '2.8rem');

  if (isFree) {
    return (
      <Box sx={{ width: size, height: size, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}
        >
          {modeName || 'Timer'}
        </Typography>
        <Typography
          sx={{ fontWeight: 300, fontVariantNumeric: 'tabular-nums', fontSize: timeFontSize, lineHeight: 1, color: getColor(), letterSpacing: '-0.02em', transition: 'color 0.3s ease' }}
        >
          {displayTime}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
          decorrido
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <CircularProgress
        variant="determinate"
        value={100}
        size={size}
        thickness={thickness}
        sx={{ position: 'absolute', color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
      />
      <CircularProgress
        variant="determinate"
        value={progress}
        size={size}
        thickness={thickness}
        sx={{
          position: 'absolute',
          color: getColor(),
          transition: 'color 0.3s ease',
          '& .MuiCircularProgress-circle': { strokeLinecap: 'round', transition: 'stroke-dashoffset 1s linear' },
        }}
      />
      <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', fontSize: size < 180 ? '0.6rem' : '0.75rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', mb: 0.5 }}
        >
          {modeName || 'Timer'}
        </Typography>
        <Typography
          sx={{ fontWeight: 300, fontVariantNumeric: 'tabular-nums', fontSize: timeFontSize, lineHeight: 1, color: 'text.primary', letterSpacing: '-0.02em' }}
        >
          {displayTime}
        </Typography>
      </Box>
    </Box>
  );
}
