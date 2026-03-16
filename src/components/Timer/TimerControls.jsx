import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import ReplayIcon from '@mui/icons-material/Replay';
import { useTheme } from '@mui/material/styles';

export default function TimerControls({ isRunning, isPaused, onStart, onPause, onResume, onStop }) {
  const theme = useTheme();

  const iconButtonSx = (color) => ({
    width: 56,
    height: 56,
    backgroundColor: color || theme.palette.primary.main,
    color: '#fff',
    '&:hover': {
      backgroundColor: color
        ? theme.palette.error.dark
        : theme.palette.primary.dark,
      transform: 'scale(1.05)',
    },
    transition: 'transform 0.15s ease, background-color 0.2s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  });

  const secondaryIconSx = {
    width: 48,
    height: 48,
    color: 'text.secondary',
    '&:hover': {
      color: 'text.primary',
      backgroundColor: 'action.hover',
    },
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
      {/* Stop button - only when running or paused */}
      {(isRunning || isPaused) && (
        <Tooltip title="Interromper">
          <IconButton onClick={onStop} sx={secondaryIconSx}>
            <StopIcon />
          </IconButton>
        </Tooltip>
      )}

      {/* Main play/pause button */}
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

      {/* Reset button - only when not running */}
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
