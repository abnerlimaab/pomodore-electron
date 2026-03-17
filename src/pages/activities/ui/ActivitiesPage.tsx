import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, List, ListItem, ListItemText,
  IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Chip, Tooltip,
  Divider, Alert, Snackbar, MenuItem, Select,
  FormControl, InputLabel, SelectChangeEvent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CircleIcon from '@mui/icons-material/Circle';
import { useTemaStore } from '@/entities/tema';
import { useAtividadeStore } from '@/entities/atividade';
import { ipc } from '@/shared/api/ipc';
import type { Tema, Atividade } from '@/shared/types';

const PRESET_COLORS = [
  '#6750A4', '#B5262B', '#1B6B3A', '#1565C0', '#E65100',
  '#AD1457', '#00695C', '#4527A0', '#558B2F', '#F57F17',
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
      {PRESET_COLORS.map((color) => (
        <Tooltip key={color} title={color}>
          <IconButton
            onClick={() => onChange(color)}
            size="small"
            sx={{
              p: 0.5,
              border: value === color ? '2px solid' : '2px solid transparent',
              borderColor: value === color ? 'text.primary' : 'transparent',
              borderRadius: '50%',
            }}
          >
            <CircleIcon sx={{ color, fontSize: 28 }} />
          </IconButton>
        </Tooltip>
      ))}
      <TextField
        size="small"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#6750A4"
        inputProps={{ maxLength: 7, style: { fontFamily: 'monospace', fontSize: '0.85rem' } }}
        sx={{ width: 120 }}
      />
    </Box>
  );
}

type SnackbarSeverity = 'success' | 'info' | 'warning' | 'error';

export default function ActivitiesPage() {
  const { grupos, setGrupos } = useTemaStore();
  const { atividades, setAtividades } = useAtividadeStore();

  const [selectedGrupo, setSelectedGrupo] = useState<Tema | null>(null);
  const [grupoDialog, setGrupoDialog] = useState<{ open: boolean; editing: Tema | null }>({ open: false, editing: null });
  const [atividadeDialog, setAtividadeDialog] = useState<{ open: boolean; editing: Atividade | null }>({ open: false, editing: null });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: 'grupo' | 'atividade' | null; item: Tema | Atividade | null }>({ open: false, type: null, item: null });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: SnackbarSeverity }>({ open: false, message: '', severity: 'success' });

  const [grupoForm, setGrupoForm] = useState({ nome: '', cor_hex: '#6750A4' });
  const [grupoNomeError, setGrupoNomeError] = useState('');
  const [atividadeForm, setAtividadeForm] = useState<{ nome: string; tema_id: number | ''; status: string }>({ nome: '', tema_id: '', status: 'ativa' });
  const [atividadeNomeError, setAtividadeNomeError] = useState('');

  const loadGrupos = async () => {
    const data = await ipc.db.getTemas();
    setGrupos(data || []);
  };

  const loadAtividades = async () => {
    const data = await ipc.db.getAtividades({});
    setAtividades(data || []);
  };

  useEffect(() => {
    if (!window.__ipc) return;
    loadGrupos();
    loadAtividades();
  }, []);

  const filteredAtividades = selectedGrupo
    ? atividades.filter(a => a.tema_id === selectedGrupo.id)
    : atividades;

  const openCreateGrupo = () => {
    setGrupoForm({ nome: '', cor_hex: '#6750A4' });
    setGrupoNomeError('');
    setGrupoDialog({ open: true, editing: null });
  };

  const openEditGrupo = (grupo: Tema) => {
    setGrupoForm({ nome: grupo.nome, cor_hex: grupo.cor_hex || '#6750A4' });
    setGrupoNomeError('');
    setGrupoDialog({ open: true, editing: grupo });
  };

  const handleSaveGrupo = async () => {
    if (!grupoForm.nome.trim()) return;
    const nome = grupoForm.nome.trim();
    const editingId = grupoDialog.editing?.id;
    const duplicate = grupos.find(g => g.nome.toLowerCase() === nome.toLowerCase() && g.id !== editingId);
    if (duplicate) { setGrupoNomeError('Já existe um grupo com este nome.'); return; }
    setGrupoNomeError('');
    const payload = { ...grupoForm, nome };
    if (editingId) {
      await ipc.db.updateTema({ id: editingId, ...payload });
    } else {
      await ipc.db.createTema(payload);
    }
    setGrupoDialog({ open: false, editing: null });
    await loadGrupos();
    setSnackbar({ open: true, message: 'Grupo salvo!', severity: 'success' });
  };

  const handleDeleteGrupo = async () => {
    if (!deleteDialog.item) return;
    await ipc.db.deleteTema((deleteDialog.item as Tema).id);
    setDeleteDialog({ open: false, type: null, item: null });
    if (selectedGrupo?.id === (deleteDialog.item as Tema).id) setSelectedGrupo(null);
    await loadGrupos();
    await loadAtividades();
    setSnackbar({ open: true, message: 'Grupo excluído!', severity: 'info' });
  };

  const openCreateAtividade = () => {
    setAtividadeForm({ nome: '', tema_id: selectedGrupo?.id ?? '', status: 'ativa' });
    setAtividadeNomeError('');
    setAtividadeDialog({ open: true, editing: null });
  };

  const openEditAtividade = (atividade: Atividade) => {
    setAtividadeForm({ nome: atividade.nome, tema_id: atividade.tema_id ?? '', status: atividade.status || 'ativa' });
    setAtividadeNomeError('');
    setAtividadeDialog({ open: true, editing: atividade });
  };

  const handleSaveAtividade = async () => {
    if (!atividadeForm.nome.trim()) return;
    const nome = atividadeForm.nome.trim();
    const editingId = atividadeDialog.editing?.id;
    const duplicate = atividades.find(a => a.nome.toLowerCase() === nome.toLowerCase() && a.id !== editingId);
    if (duplicate) { setAtividadeNomeError('Já existe uma atividade com este nome.'); return; }
    setAtividadeNomeError('');
    const payload = { ...atividadeForm, nome, tema_id: atividadeForm.tema_id !== '' ? atividadeForm.tema_id : null };
    if (editingId) {
      await ipc.db.updateAtividade({ id: editingId, ...payload, status: payload.status as 'ativa' | 'inativa' });
    } else {
      await ipc.db.createAtividade({ ...payload, status: payload.status as 'ativa' | 'inativa' });
    }
    setAtividadeDialog({ open: false, editing: null });
    await loadAtividades();
    setSnackbar({ open: true, message: 'Atividade salva!', severity: 'success' });
  };

  const handleDeleteAtividade = async () => {
    if (!deleteDialog.item) return;
    await ipc.db.deleteAtividade((deleteDialog.item as Atividade).id);
    setDeleteDialog({ open: false, type: null, item: null });
    await loadAtividades();
    setSnackbar({ open: true, message: 'Atividade excluída!', severity: 'info' });
  };

  const handleToggleStatus = async (atividade: Atividade) => {
    const newStatus = atividade.status === 'ativa' ? 'inativa' : 'ativa';
    await ipc.db.updateAtividade({ ...atividade, status: newStatus, tema_id: atividade.tema_id ?? null });
    await loadAtividades();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, height: '100%', overflow: 'hidden' }}>
      {/* Left panel: Grupos */}
      <Box sx={{ flex: { xs: '0 0 42%', sm: `0 0 280px` }, minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ px: 2, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Grupos</Typography>
          <Button startIcon={<AddIcon />} size="small" variant="contained" onClick={openCreateGrupo}>Adicionar</Button>
        </Box>

        <List sx={{ overflow: 'auto', flex: 1, py: 1 }}>
          <ListItem disablePadding>
            <ListItem
              button
              selected={selectedGrupo === null}
              onClick={() => setSelectedGrupo(null)}
              sx={{ borderRadius: 2, mx: 1, '&.Mui-selected': { bgcolor: 'action.selected' } }}
            >
              <ListItemText primary="Todos os Grupos" primaryTypographyProps={{ variant: 'body2', fontWeight: selectedGrupo === null ? 600 : 400 }} />
              <Chip label={atividades.length} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
            </ListItem>
          </ListItem>

          {grupos.map((grupo) => (
            <ListItem key={grupo.id} disablePadding>
              <ListItem
                button
                selected={selectedGrupo?.id === grupo.id}
                onClick={() => setSelectedGrupo(grupo)}
                sx={{ borderRadius: 2, mx: 1, '&.Mui-selected': { bgcolor: 'action.selected' } }}
              >
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: grupo.cor_hex || '#6750A4', mr: 1, flexShrink: 0 }} />
                <ListItemText
                  primary={grupo.nome}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: selectedGrupo?.id === grupo.id ? 600 : 400, noWrap: true }}
                />
                <Chip label={atividades.filter(a => a.tema_id === grupo.id).length} size="small" sx={{ height: 20, fontSize: '0.7rem', mr: 0.5 }} />
                <Box sx={{ display: 'flex', gap: 0 }}>
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); openEditGrupo(grupo); }} sx={{ p: 0.5 }}>
                    <EditIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDeleteDialog({ open: true, type: 'grupo', item: grupo }); }} sx={{ p: 0.5, color: 'error.main' }}>
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </ListItem>
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
      <Divider sx={{ display: { xs: 'block', sm: 'none' } }} />

      {/* Right panel: Atividades */}
      <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ px: 2, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Atividades
            {selectedGrupo && (
              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>em {selectedGrupo.nome}</Typography>
            )}
          </Typography>
          <Button startIcon={<AddIcon />} size="small" variant="contained" onClick={openCreateAtividade}>Adicionar</Button>
        </Box>

        <List sx={{ overflow: 'auto', flex: 1, py: 1 }}>
          {filteredAtividades.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">{'Nenhuma atividade. Clique em "Adicionar" para criar.'}</Typography>
            </Box>
          )}
          {filteredAtividades.map((atividade) => (
            <ListItem key={atividade.id} sx={{ opacity: atividade.status === 'inativa' ? 0.5 : 1, transition: 'opacity 0.2s' }}>
              {atividade.tema_cor && (
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: atividade.tema_cor, mr: 1.5, flexShrink: 0 }} />
              )}
              <ListItemText
                primary={atividade.nome}
                secondary={atividade.tema_nome || 'Sem grupo'}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Chip
                  label={atividade.status === 'ativa' ? 'Ativa' : 'Inativa'}
                  size="small"
                  color={atividade.status === 'ativa' ? 'success' : 'default'}
                  onClick={() => handleToggleStatus(atividade)}
                  sx={{ height: 22, fontSize: '0.7rem', cursor: 'pointer' }}
                />
                <IconButton size="small" onClick={() => openEditAtividade(atividade)} sx={{ p: 0.5 }}>
                  <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <IconButton size="small" onClick={() => setDeleteDialog({ open: true, type: 'atividade', item: atividade })} sx={{ p: 0.5, color: 'error.main' }}>
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Grupo Dialog */}
      <Dialog open={grupoDialog.open} onClose={() => setGrupoDialog({ open: false, editing: null })} maxWidth="sm" fullWidth>
        <DialogTitle>{grupoDialog.editing ? 'Editar Grupo' : 'Novo Grupo'}</DialogTitle>
        <DialogContent>
          <TextField autoFocus label="Nome do grupo" value={grupoForm.nome} onChange={(e) => { setGrupoNomeError(''); setGrupoForm(f => ({ ...f, nome: e.target.value })); }} fullWidth size="small" sx={{ mt: 1, mb: 2 }} error={!!grupoNomeError} helperText={grupoNomeError} />
          <Typography variant="body2" color="text.secondary" gutterBottom>Cor</Typography>
          <ColorPicker value={grupoForm.cor_hex} onChange={(c) => setGrupoForm(f => ({ ...f, cor_hex: c }))} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setGrupoDialog({ open: false, editing: null })} variant="outlined">Cancelar</Button>
          <Button onClick={handleSaveGrupo} variant="contained" disabled={!grupoForm.nome.trim()}>Salvar</Button>
        </DialogActions>
      </Dialog>

      {/* Atividade Dialog */}
      <Dialog open={atividadeDialog.open} onClose={() => setAtividadeDialog({ open: false, editing: null })} maxWidth="sm" fullWidth>
        <DialogTitle>{atividadeDialog.editing ? 'Editar Atividade' : 'Nova Atividade'}</DialogTitle>
        <DialogContent>
          <TextField autoFocus label="Nome da atividade" value={atividadeForm.nome} onChange={(e) => { setAtividadeNomeError(''); setAtividadeForm(f => ({ ...f, nome: e.target.value })); }} fullWidth size="small" sx={{ mt: 1, mb: 2 }} error={!!atividadeNomeError} helperText={atividadeNomeError} />
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Grupo (opcional)</InputLabel>
            <Select value={atividadeForm.tema_id} onChange={(e: SelectChangeEvent<number | ''>) => setAtividadeForm(f => ({ ...f, tema_id: e.target.value as number | '' }))} label="Grupo (opcional)">
              <MenuItem value="">Sem grupo</MenuItem>
              {grupos.map(g => (
                <MenuItem key={g.id} value={g.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: g.cor_hex || '#6750A4' }} />
                    {g.nome}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select value={atividadeForm.status} onChange={(e) => setAtividadeForm(f => ({ ...f, status: e.target.value }))} label="Status">
              <MenuItem value="ativa">Ativa</MenuItem>
              <MenuItem value="inativa">Inativa</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setAtividadeDialog({ open: false, editing: null })} variant="outlined">Cancelar</Button>
          <Button onClick={handleSaveAtividade} variant="contained" disabled={!atividadeForm.nome.trim()}>Salvar</Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, type: null, item: null })} maxWidth="xs" fullWidth>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Tem certeza que deseja excluir &quot;{(deleteDialog.item as Tema | Atividade)?.nome}&quot;?
            {deleteDialog.type === 'grupo' && ' As atividades deste grupo não serão excluídas, mas perderão a associação.'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteDialog({ open: false, type: null, item: null })} variant="outlined">Cancelar</Button>
          <Button onClick={deleteDialog.type === 'grupo' ? handleDeleteGrupo : handleDeleteAtividade} variant="contained" color="error">Excluir</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
