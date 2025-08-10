import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Chip,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountBalance as BankIcon,
  Refresh as ResetIcon,
} from '@mui/icons-material';
import { PageType } from '../types';

interface HeaderProps {
  onMenuClick: () => void;
  currentPage: PageType;
  onReset?: () => void;
}

const pageTitle = {
  home: 'Accueil',
  configuration: 'Configuration',
  'data-input': 'Saisie des Données',
  upload: 'Import Excel',
  'manual-input': 'Saisie Manuelle',
  analysis: 'Analyse Financière',
  reports: 'Rapports',
  settings: 'Paramètres',
  documentation: 'Documentation',
};

export const Header: React.FC<HeaderProps> = ({ onMenuClick, currentPage, onReset }) => {
  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'primary.main',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'center' }}>
          <img 
            src="/OC_logo.png" 
            alt="Optimus Credit" 
            style={{ 
              height: '40px',
              marginRight: '12px'
            }}
          />
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              fontWeight: 600,
              letterSpacing: '0.5px',
            }}
          >
            OptimusCredit
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label={pageTitle[currentPage]}
            color="secondary"
            variant="outlined"
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)',
              '& .MuiChip-label': {
                fontWeight: 500,
              },
            }}
          />
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255,255,255,0.8)',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            Plateforme d'Analyse Financière
          </Typography>
          
          {onReset && (
            <Tooltip title="Réinitialiser la session et recommencer">
              <Button
                variant="outlined"
                size="small"
                onClick={onReset}
                startIcon={<ResetIcon />}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  ml: 2,
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.5)',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                  display: { xs: 'none', md: 'flex' },
                }}
              >
                Reset
              </Button>
            </Tooltip>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};