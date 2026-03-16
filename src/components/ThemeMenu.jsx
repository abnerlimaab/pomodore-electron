import React, { useState } from 'react';
import {
  Box,
  Popover,
  Typography,
  Tooltip,
  Divider,
} from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';
import CheckIcon from '@mui/icons-material/Check';
import { PALETTES } from '../theme';
import useAppStore from '../store/useAppStore';

export default function ThemeMenu({ expanded = false }) {
  const { palette, setPalette, colorScheme } = useAppStore();
  const [anchor, setAnchor] = useState(null);

  const trigger = (
    <Box
      onClick={(e) => setAnchor(e.currentTarget)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: expanded ? 1.5 : 0,
        px: expanded ? 1.5 : 0,
        py: 1,
        borderRadius: 2,
        cursor: 'pointer',
        width: expanded ? '100%' : 'auto',
        color: 'text.secondary',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <PaletteIcon fontSize="small" sx={{ flexShrink: 0 }} />
      {expanded && (
        <Typography variant="body2" noWrap sx={{ fontWeight: 400 }}>
          Aparência
        </Typography>
      )}
    </Box>
  );

  return (
    <>
      {expanded ? trigger : (
        <Tooltip title="Aparência" placement="right">{trigger}</Tooltip>
      )}

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
        transformOrigin={{ vertical: 'center', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              ml: 1,
              p: 2,
              borderRadius: 3,
              width: 200,
              border: '1px solid',
              borderColor: 'divider',
            },
          },
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Paleta
        </Typography>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
          {Object.entries(PALETTES).map(([key, p]) => {
            const color = colorScheme === 'dark' ? p.dark.primary : p.light.primary;
            const containerColor = colorScheme === 'dark' ? p.dark.primaryContainer : p.light.primaryContainer;
            const selected = palette === key;

            return (
              <Tooltip key={key} title={p.label} placement="top">
                <Box
                  onClick={() => { setPalette(key); setAnchor(null); }}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${color} 50%, ${containerColor} 50%)`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: selected ? '2px solid' : '2px solid transparent',
                    borderColor: selected ? 'text.primary' : 'transparent',
                    transition: 'transform 0.15s ease, border-color 0.15s ease',
                    '&:hover': { transform: 'scale(1.15)' },
                  }}
                >
                  {selected && (
                    <CheckIcon sx={{ fontSize: 16, color: '#fff', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))' }} />
                  )}
                </Box>
              </Tooltip>
            );
          })}
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Modo
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          {[{ id: 'light', label: 'Claro' }, { id: 'dark', label: 'Escuro' }].map(({ id, label }) => (
            <Box
              key={id}
              onClick={() => useAppStore.getState().setColorScheme(id)}
              sx={{
                flex: 1,
                py: 0.75,
                borderRadius: 2,
                textAlign: 'center',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: colorScheme === id ? 600 : 400,
                bgcolor: colorScheme === id ? 'primary.main' : 'action.hover',
                color: colorScheme === id ? 'primary.contrastText' : 'text.secondary',
                transition: 'background-color 0.2s ease',
                '&:hover': { bgcolor: colorScheme === id ? 'primary.dark' : 'action.selected' },
              }}
            >
              {label}
            </Box>
          ))}
        </Box>
      </Popover>
    </>
  );
}
