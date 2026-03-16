import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import NavigationRail, { RAIL_COLLAPSED, RAIL_EXPANDED } from './components/NavigationRail';
import TimerPage from './pages/TimerPage';
import ActivitiesPage from './pages/ActivitiesPage';
import ReportsPage from './pages/ReportsPage';
import { createAppTheme } from './theme';
import useAppStore from './store/useAppStore';

type Page = 'timer' | 'activities' | 'reports';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('timer');
  const { colorScheme, palette, railExpanded, setGrupos, setAtividades } = useAppStore();

  const theme = createAppTheme(colorScheme, palette);

  useEffect(() => {
    const loadData = async () => {
      if (!window.electronAPI?.db) return;
      try {
        const [grupos, atividades] = await Promise.all([
          window.electronAPI.db.getTemas(),
          window.electronAPI.db.getAtividades({}),
        ]);
        if (grupos && !('error' in grupos)) setGrupos(grupos);
        if (atividades && !('error' in atividades)) setAtividades(atividades);
      } catch (e) {
        console.error('Failed to load initial data:', e);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const refreshAtividades = async () => {
      if (currentPage === 'timer' && window.electronAPI?.db) {
        try {
          const data = await window.electronAPI.db.getAtividades({});
          if (data && !('error' in data)) setAtividades(data);
        } catch (e) {
          console.error('Failed to refresh atividades:', e);
        }
      }
    };
    refreshAtividades();
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'timer':      return <TimerPage />;
      case 'activities': return <ActivitiesPage />;
      case 'reports':    return <ReportsPage />;
      default:           return <TimerPage />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', backgroundColor: 'background.default' }}>
        <NavigationRail currentPage={currentPage} onNavigate={(p) => setCurrentPage(p as Page)} />
        <Box
          component="main"
          sx={{
            flex: 1,
            ml: `${railExpanded ? RAIL_EXPANDED : RAIL_COLLAPSED}px`,
            transition: 'margin-left 0.22s ease',
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {renderPage()}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
