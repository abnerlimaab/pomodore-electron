import React from 'react';
import { Box, IconButton, Tooltip, SxProps, Theme } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import ReplayIcon from '@mui/icons-material/Replay';
import { useTheme } from '@mui/material/styles';

interface TimerControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export default function TimerControls({ isRunning, isPaused, onStart, onPause, onResume, onStop }: TimerControlsProps) {
  const theme = useTheme();

  const iconButtonSx = (color?: string): SxProps<Theme> => ({
    width: 56,
    height: 56,
    backgroundColor: color || theme.palette.primary.main,
    color: '#fff',
    '&:hover': {
      backgroundColor: color ? theme.palette.error.dark : theme.palette.primary.dark,
      transform: 'scale(1.05)',
    },
    transition: 'transform 0.15s ease, background-color 0.2s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  });

  const secondaryIconSx: SxProps<Theme> = {
    width: 48,
    height: 48,
    color: 'text.secondary',
    '&:hover': { color: 'text.primary', backgroundColor: 'action.hover' },
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
      {(isRunning || isPaused) && (
        <Tooltip title="Interromper">
          <IconButton onClick={onStop} sx={secondaryIconSx}>
            <StopIcon />
          </IconButton>
        </Tooltip>
      )}

      {!isRunning && !isPaused && (
        <Tooltip title="Iniciar">
          <IconButton onClick={onStart} sx={iconButtonSx()}>
            <PlayArrowIcon sx={{ fontSize: 28 }} />
          </IconButton>
        </Tooltip>
      )}

      {isRunning && (
        <Tooltip title="Pausar">
          <IconButton onClick={onPause} sx={iconButtonSx()}>
            <PauseIcon sx={{ fontSize: 28 }} />
          </IconButton>
        </Tooltip>
      )}

      {isPaused && (
        <Tooltip title="Retomar">
          <IconButton onClick={onResume} sx={iconButtonSx()}>
            <PlayArrowIcon sx={{ fontSize: 28 }} />
          </IconButton>
        </Tooltip>
      )}

      {!isRunning && !isPaused && (
        <Tooltip title="Reiniciar">
          <IconButton onClick={onStop} sx={secondaryIconSx}>
            <ReplayIcon />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
