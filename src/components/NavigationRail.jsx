import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Divider,
  Typography,
  IconButton,
} from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import CategoryIcon from '@mui/icons-material/Category';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ThemeMenu from './ThemeMenu';
import useAppStore from '../store/useAppStore';

const RAIL_COLLAPSED = 60;
const RAIL_EXPANDED  = 200;

const navItems = [
  { id: 'timer',      label: 'Cronômetro', icon: <TimerIcon /> },
  { id: 'activities', label: 'Atividades',  icon: <CategoryIcon /> },
  { id: 'reports',    label: 'Histórico',   icon: <BarChartIcon /> },
];

export default function NavigationRail({ currentPage, onNavigate }) {
  const { railExpanded, toggleRail } = useAppStore();
  const width = railExpanded ? RAIL_EXPANDED : RAIL_COLLAPSED;

  return (
    <Box
      sx={{
        width,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: railExpanded ? 'flex-start' : 'center',
        py: 1.5,
        borderRight: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 10,
        overflow: 'hidden',
        transition: 'width 0.22s ease',
      }}
    >
      {/* Header: logo + toggle */}
      <Box sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: railExpanded ? 'space-between' : 'center',
        px: railExpanded ? 1.5 : 0,
        mb: 1,
        flexShrink: 0,
      }}>
        {railExpanded && (
          <Typography sx={{
            fontWeight: 800,
            color: 'primary.main',
            letterSpacing: 2,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}>
            Pomodore
          </Typography>
        )}
        <Tooltip title={railExpanded ? 'Recolher' : 'Expandir'} placement="right">
          <IconButton size="small" onClick={toggleRail} sx={{ color: 'text.secondary', flexShrink: 0 }}>
            {railExpanded ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      <Divider sx={{ width: '80%', mb: 1.5, alignSelf: 'center' }} />

      {/* Navigation items */}
      <List sx={{ width: '100%', px: 0.5, flex: 1 }} disablePadding>
        {navItems.map(item => {
          const btn = (
            <ListItemButton
              selected={currentPage === item.id}
              onClick={() => onNavigate(item.id)}
              sx={{
                flexDirection: railExpanded ? 'row' : 'column',
                alignItems: 'center',
                justifyContent: railExpanded ? 'flex-start' : 'center',
                borderRadius: 2,
                py: railExpanded ? 1 : 1.25,
                px: railExpanded ? 1.5 : 0,
                minWidth: 0,
                gap: railExpanded ? 1.5 : 0,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                  '&:hover': { backgroundColor: 'primary.dark' },
                },
              }}
            >
              <ListItemIcon sx={{
                minWidth: 0,
                color: currentPage === item.id ? 'inherit' : 'text.secondary',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {item.icon}
              </ListItemIcon>
              {railExpanded && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: currentPage === item.id ? 600 : 400,
                    noWrap: true,
                  }}
                  sx={{ m: 0 }}
                />
              )}
            </ListItemButton>
          );

          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              {railExpanded ? btn : (
                <Tooltip title={item.label} placement="right">{btn}</Tooltip>
              )}
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ width: '80%', mb: 1, alignSelf: 'center' }} />

      <Box sx={{
        width: '100%',
        display: 'flex',
        justifyContent: railExpanded ? 'flex-start' : 'center',
        px: railExpanded ? 1 : 0,
      }}>
        <ThemeMenu expanded={railExpanded} />
      </Box>
    </Box>
  );
}

export { RAIL_COLLAPSED, RAIL_EXPANDED };
