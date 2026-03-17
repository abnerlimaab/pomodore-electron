import React, { useState } from 'react';
import {
  Select, MenuItem, FormControl, ListSubheader,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Stack, SelectChangeEvent,
} from '@mui/material';
import type { ModeKey } from '@/entities/timer';

interface ModeSelectorProps {
  currentMode: ModeKey;
  isRunning: boolean;
  onModeChange: (mode: ModeKey) => void;
  customSeconds: number;
  onCustomSecondsChange: (seconds: number) => void;
}

export default function ModeSelector({
  currentMode, isRunning, onModeChange, customSeconds, onCustomSecondsChange,
}: ModeSelectorProps) {
  const [customOpen, setCustomOpen] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(Math.floor((customSeconds || 1500) / 60));
  const [customSecs, setCustomSecs] = useState((customSeconds || 1500) % 60);

  const modeList = [
    { id: 'pomodoro-25', label: 'Pomodoro 25 min' },
    { id: 'pomodoro-50', label: 'Pomodoro 50 min' },
    { id: 'break-5',    label: 'Pausa 5 min'      },
    { id: 'break-10',   label: 'Pausa 10 min'     },
    { id: 'break-30',   label: 'Pausa 30 min'     },
    { id: 'custom',     label: 'Personalizado'    },
    { id: 'free',       label: 'Livre'             },
  ];

  const handleChange = (e: SelectChangeEvent<string>) => {
    const mode = e.target.value as ModeKey;
    if (mode === 'custom') { setCustomOpen(true); return; }
    onModeChange(mode);
  };

  const handleCustomConfirm = () => {
    const totalSeconds = (parseInt(String(customMinutes)) || 0) * 60 + (parseInt(String(customSecs)) || 0);
    if (totalSeconds > 0) { onCustomSecondsChange(totalSeconds); onModeChange('custom'); }
    setCustomOpen(false);
  };

  const currentLabel = modeList.find(m => m.id === currentMode)?.label || 'Selecionar modo';

  return (
    <>
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <Select value={currentMode} onChange={handleChange} disabled={isRunning}
          renderValue={() => currentLabel} sx={{ borderRadius: 3, fontSize: '0.9rem' }}>
          <ListSubheader>Pomodoro</ListSubheader>
          <MenuItem value="pomodoro-25">Pomodoro 25 min</MenuItem>
          <MenuItem value="pomodoro-50">Pomodoro 50 min</MenuItem>
          <ListSubheader>Pausa</ListSubheader>
          <MenuItem value="break-5">Pausa 5 min</MenuItem>
          <MenuItem value="break-10">Pausa 10 min</MenuItem>
          <MenuItem value="break-30">Pausa 30 min</MenuItem>
          <ListSubheader>Outro</ListSubheader>
          <MenuItem value="custom">Personalizado…</MenuItem>
          <MenuItem value="free">Livre</MenuItem>
        </Select>
      </FormControl>

      <Dialog open={customOpen} onClose={() => setCustomOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Cronômetro Personalizado</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Defina a duração do cronômetro
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField label="Minutos" type="number" value={customMinutes}
              onChange={(e) => setCustomMinutes(Math.max(0, parseInt(e.target.value) || 0))}
              inputProps={{ min: 0, max: 180 }} size="small" fullWidth />
            <Typography variant="h5" sx={{ color: 'text.secondary' }}>:</Typography>
            <TextField label="Segundos" type="number" value={customSecs}
              onChange={(e) => setCustomSecs(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
              inputProps={{ min: 0, max: 59 }} size="small" fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setCustomOpen(false)} variant="outlined">Cancelar</Button>
          <Button onClick={handleCustomConfirm} variant="contained">Confirmar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
