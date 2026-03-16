import React, { useState } from 'react';
import {
  Box,
  Chip,
  Autocomplete,
  TextField,
  Typography,
  Tooltip,
  IconButton,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import useAppStore from '../../store/useAppStore';

export default function ActivityChips({ atividades }) {
  const { selectedActivities, addActivity, removeActivity, setPrimary } = useAppStore();
  const [inputValue, setInputValue] = useState('');

  const activeAtividades = atividades.filter(
    (a) => a.status === 'ativa' && !selectedActivities.find((s) => s.id === a.id)
  );

  const handleSelect = (event, value) => {
    if (!value) return;
    addActivity({
      id: value.id,
      nome: value.nome,
      tema_nome: value.tema_nome,
      tema_cor: value.tema_cor,
    });
    setInputValue('');
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 500 }}>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', textAlign: 'center' }}>
        Atividades
      </Typography>

      {/* Selected activity chips */}
      {selectedActivities.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5, justifyContent: 'center' }}>
          {selectedActivities.map((activity) => (
            <Chip
              key={activity.id}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Tooltip title={activity.prioridade === 'Primaria' ? 'Primária' : 'Definir como Primária'}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPrimary(activity.id);
                      }}
                      sx={{ p: 0, color: activity.prioridade === 'Primaria' ? 'warning.main' : 'text.disabled' }}
                    >
                      {activity.prioridade === 'Primaria' ? (
                        <StarIcon sx={{ fontSize: 14 }} />
                      ) : (
                        <StarBorderIcon sx={{ fontSize: 14 }} />
                      )}
                    </IconButton>
                  </Tooltip>
                  <span>{activity.nome}</span>
                </Box>
              }
              onDelete={() => removeActivity(activity.id)}
              size="small"
              sx={{
                backgroundColor: activity.tema_cor
                  ? `${activity.tema_cor}33`
                  : 'action.selected',
                borderColor: activity.tema_cor || 'divider',
                border: '1px solid',
                fontWeight: activity.prioridade === 'Primaria' ? 600 : 400,
              }}
            />
          ))}
        </Box>
      )}

      {/* Activity selector */}
      <Autocomplete
        options={activeAtividades}
        getOptionLabel={(option) =>
          `${option.nome}${option.tema_nome ? ` (${option.tema_nome})` : ''}`
        }
        inputValue={inputValue}
        onInputChange={(_, v) => setInputValue(v)}
        onChange={handleSelect}
        value={null}
        size="small"
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Adicionar atividade..."
            size="small"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 6,
              },
            }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {option.tema_cor && (
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: option.tema_cor,
                    flexShrink: 0,
                  }}
                />
              )}
              <Typography variant="body2">{option.nome}</Typography>
              {option.tema_nome && (
                <Typography variant="caption" color="text.secondary">
                  {option.tema_nome}
                </Typography>
              )}
            </Box>
          </li>
        )}
        noOptionsText={
          atividades.length === 0
            ? 'Nenhuma atividade cadastrada. Crie em Atividades.'
            : 'Todas as atividades já selecionadas'
        }
        sx={{ maxWidth: 400, mx: 'auto' }}
      />
    </Box>
  );
}
