import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, ToggleButton, ToggleButtonGroup, Paper,
  Chip, CircularProgress, TextField, InputAdornment, Select,
  MenuItem, FormControl, SelectChangeEvent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from '@mui/material/styles';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { ipc } from '../../../shared/api/ipc';
import type { Sessao, AtividadeSessao } from '../../../shared/types';

const CHART_COLORS = [
  '#6750A4', '#B5262B', '#1B6B3A', '#1565C0', '#E65100',
  '#AD1457', '#00695C', '#4527A0', '#558B2F', '#F57F17',
  '#7B61FF', '#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF',
];

function formatSeconds(seconds: number | undefined): string {
  if (!seconds) return '0s';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

function getDateRange(filter: string): { inicio: string; fim: string } {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const start = new Date(now);
  if (filter === 'day') {
    start.setHours(0, 0, 0, 0);
  } else if (filter === 'week') {
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
  } else if (filter === 'month') {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  }
  return { inicio: start.toISOString(), fim: end.toISOString() };
}

function getDayLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const sessionDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (sessionDay.getTime() === today.getTime()) return 'Hoje';
  if (sessionDay.getTime() === yesterday.getTime()) return 'Ontem';
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <Paper sx={{ p: 1.5, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="caption" fontWeight={600} color="text.primary" display="block">{label}</Typography>
      {payload.map((entry, i) => (
        <Typography key={i} variant="caption" display="block" sx={{ color: entry.color }}>
          {entry.name}: {formatSeconds(entry.value * 60)}
        </Typography>
      ))}
    </Paper>
  );
}

interface GroupedTimelineProps {
  sessions: Sessao[];
}

function GroupedTimeline({ sessions }: GroupedTimelineProps) {
  if (!sessions.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="body2" color="text.secondary">Nenhuma sessão para exibir</Typography>
      </Box>
    );
  }

  const sorted = [...sessions].sort((a, b) => new Date(b.inicio).getTime() - new Date(a.inicio).getTime());

  const groups: Array<{ label: string; sessions: Sessao[] }> = [];
  const groupMap = new Map<string, { label: string; sessions: Sessao[] }>();
  sorted.forEach(s => {
    const label = getDayLabel(s.inicio);
    if (!groupMap.has(label)) {
      const group = { label, sessions: [] as Sessao[] };
      groups.push(group);
      groupMap.set(label, group);
    }
    groupMap.get(label)!.sessions.push(s);
  });

  return (
    <Box>
      {groups.map(({ label, sessions: daySessions }) => (
        <Box key={label} sx={{ mb: 3 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.7rem' }}>
            {label}
          </Typography>
          {daySessions.map(session => {
            const start = new Date(session.inicio);
            const duration = session.duracao_total_segundos;
            const primaryActs = session.atividades?.filter((a: AtividadeSessao) => a.prioridade === 'Primaria') || [];
            const secondaryActs = session.atividades?.filter((a: AtividadeSessao) => a.prioridade === 'Secundaria') || [];
            const color = session.tipo === 'Pausa' ? '#00695C' : session.tipo === 'Livre' ? '#1565C0' : '#6750A4';
            return (
              <Box key={session.id} sx={{ display: 'flex', alignItems: 'flex-start', mb: 0.5, gap: 2, py: 1, px: 1.5, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                <Box sx={{ width: 72, flexShrink: 0, textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">{formatSeconds(duration)}</Typography>
                </Box>
                <Box sx={{ width: Math.max(8, Math.min(200, ((duration ?? 0) / 3600) * 200)), minWidth: 8, mt: 0.5 }}>
                  <Box sx={{ height: 10, backgroundColor: color, borderRadius: 1, mb: 0.5, opacity: 0.9 }} />
                  {secondaryActs.length > 0 && <Box sx={{ height: 6, backgroundColor: color, borderRadius: 1, opacity: 0.4 }} />}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mb: 0.25 }}>
                    <Chip label={session.tipo} size="small" sx={{ height: 18, fontSize: '0.65rem', backgroundColor: `${color}33`, color, fontWeight: 600 }} />
                    {primaryActs.map((a: AtividadeSessao, i: number) => (
                      <Typography key={i} variant="caption" fontWeight={500}>
                        {a.nome}
                        {a.tema_nome && <Typography component="span" variant="caption" color="text.secondary"> ({a.tema_nome})</Typography>}
                      </Typography>
                    ))}
                  </Box>
                  {secondaryActs.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {secondaryActs.map((a: AtividadeSessao, i: number) => (
                        <Typography key={i} variant="caption" color="text.secondary">{a.nome}</Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      ))}
    </Box>
  );
}

interface ChartEntry {
  name: string;
  minutes: number;
  color: string;
}

export default function ReportsPage() {
  const theme = useTheme();
  const [filter, setFilter] = useState('week');
  const [sessions, setSessions] = useState<Sessao[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');

  const loadSessions = async () => {
    if (!window.__ipc) return;
    setLoading(true);
    try {
      const range = getDateRange(filter);
      const data = await ipc.db.getSessoesByRange(range);
      setSessions(Array.isArray(data) ? data as Sessao[] : []);
    } catch (e) {
      console.error('Failed to load sessions:', e);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSessions(); }, [filter]);

  const groups = useMemo(() => {
    const map = new Map<number, { id: number; nome: string }>();
    sessions.forEach(s => s.atividades?.forEach((a: AtividadeSessao) => {
      if (a.tema_id != null && !map.has(a.tema_id)) {
        map.set(a.tema_id, { id: a.tema_id, nome: a.tema_nome || 'Sem nome' });
      }
    }));
    return Array.from(map.values()).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    const valid = sessions.filter(s => s.duracao_total_segundos);
    if (!searchQuery && !selectedGroup) return valid;
    return valid.filter(s => {
      const acts = s.atividades || [];
      if (!acts.length) return false;
      const matchesSearch = !searchQuery || acts.some((a: AtividadeSessao) => a.nome?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesGroup = !selectedGroup || acts.some((a: AtividadeSessao) => String(a.tema_id) === String(selectedGroup));
      return matchesSearch && matchesGroup;
    });
  }, [sessions, searchQuery, selectedGroup]);

  const { barData, donutData, totalTime, totalSessions } = useMemo(() => {
    const grupoMap: Record<string, ChartEntry> = {};
    let totalSeconds = 0;
    let total = 0;
    filteredSessions.forEach(session => {
      total++;
      totalSeconds += session.duracao_total_segundos ?? 0;
      session.atividades?.forEach((act: AtividadeSessao) => {
        if (act.prioridade !== 'Primaria') return;
        const key = act.tema_id != null ? `g_${act.tema_id}` : `a_${act.atividade_id}`;
        const name = act.tema_nome || act.nome || 'Sem grupo';
        const color = act.tema_cor || '#6750A4';
        if (!grupoMap[key]) grupoMap[key] = { name, minutes: 0, color };
        grupoMap[key].minutes += Math.floor((session.duracao_total_segundos ?? 0) / 60);
      });
      if (!session.atividades?.length) {
        const key = session.tipo || 'Outro';
        const color = session.tipo === 'Pausa' ? '#00695C' : '#1565C0';
        if (!grupoMap[key]) grupoMap[key] = { name: key, minutes: 0, color };
        grupoMap[key].minutes += Math.floor((session.duracao_total_segundos ?? 0) / 60);
      }
    });
    const chartData = Object.values(grupoMap).sort((a, b) => b.minutes - a.minutes);
    return { barData: chartData, donutData: chartData, totalTime: totalSeconds, totalSessions: total };
  }, [filteredSessions]);

  const stats = [
    { label: 'Tempo Total', value: formatSeconds(totalTime) },
    { label: 'Sessões', value: totalSessions },
    { label: 'Média/Sessão', value: totalSessions > 0 ? formatSeconds(Math.floor(totalTime / totalSessions)) : '—' },
  ];

  const isFiltering = searchQuery || selectedGroup;
  const isEmpty = filteredSessions.length === 0;

  return (
    <Box sx={{ overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 2, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <Typography variant="h6" fontWeight={600}>Histórico</Typography>
        <ToggleButtonGroup value={filter} exclusive onChange={(_, v) => v && setFilter(v)} size="small">
          <ToggleButton value="day">Dia</ToggleButton>
          <ToggleButton value="week">Semana</ToggleButton>
          <ToggleButton value="month">Mês</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ px: 2, py: 1, display: 'flex', gap: 1.5, alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <TextField
          size="small"
          placeholder="Buscar atividade..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, maxWidth: 280 }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={selectedGroup}
            onChange={(e: SelectChangeEvent) => setSelectedGroup(e.target.value)}
            displayEmpty
            renderValue={v => v ? (groups.find(g => String(g.id) === String(v))?.nome ?? 'Grupo') : 'Todos os grupos'}
          >
            <MenuItem value="">Todos os grupos</MenuItem>
            {groups.map(g => <MenuItem key={g.id} value={g.id}>{g.nome}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ p: { xs: 1.5, sm: 3 }, overflow: 'auto', flex: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              {stats.map(stat => (
                <Paper key={stat.label} sx={{ p: 2, flex: 1, minWidth: 120, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h5" fontWeight={700} color="primary.main">{stat.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                </Paper>
              ))}
            </Box>

            {isEmpty ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="body1" color="text.secondary">
                  {isFiltering ? 'Nenhuma sessão encontrada para o filtro aplicado.' : 'Nenhuma sessão registrada neste período.'}
                </Typography>
                {!isFiltering && <Typography variant="caption" color="text.secondary">Conclua algumas sessões para ver suas estatísticas aqui.</Typography>}
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
                  <Paper sx={{ p: 2, flex: '1 1 220px', minWidth: 200, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>Tempo por Grupo (minutos)</Typography>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                          {barData.map((entry, index) => (
                            <Cell key={index} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>

                  <Paper sx={{ p: 2, flex: '1 1 200px', minWidth: 180, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>Distribuição</Typography>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="minutes" paddingAngle={2}>
                          {donutData.map((entry, index) => (
                            <Cell key={index} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          formatter={(value: number) => [formatSeconds(value * 60), 'Tempo']}
                          contentStyle={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8, color: theme.palette.text.primary }}
                          labelStyle={{ color: theme.palette.text.primary }}
                          itemStyle={{ color: theme.palette.text.primary }}
                        />
                        <Legend formatter={value => (
                          <Typography component="span" variant="caption" color="text.secondary">{value}</Typography>
                        )} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Box>

                <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>Linha do Tempo</Typography>
                  <GroupedTimeline sessions={filteredSessions} />
                </Paper>
              </>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
