import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Box,
  Typography,
  Badge,
} from '@mui/material';
import {
  Home as HomeIcon,
  Settings as ConfigurationIcon,
  Edit as DataInputIcon,
  Analytics as AnalysisIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  Description as DocumentationIcon,
} from '@mui/icons-material';
import { PageType } from '../types';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  hasAnalysisData: boolean;
}

const drawerWidth = 240;

const menuItems = [
  { 
    id: 'home' as PageType, 
    label: 'Accueil', 
    icon: HomeIcon,
    description: 'Page d\'accueil'
  },
  { 
    id: 'data-input' as PageType, 
    label: 'Saisie des Données', 
    icon: DataInputIcon,
    description: 'Configuration et saisie des données'
  },
  { 
    id: 'analysis' as PageType, 
    label: 'Analyse', 
    icon: AnalysisIcon,
    description: 'Analyse financière',
    requiresData: true
  },
  { 
    id: 'reports' as PageType, 
    label: 'Rapports', 
    icon: ReportsIcon,
    description: 'Génération de rapports',
    requiresData: true
  },
];

const secondaryItems = [
  { 
    id: 'documentation' as PageType, 
    label: 'Documentation', 
    icon: DocumentationIcon,
    description: 'Guide d\'utilisation'
  },
  { 
    id: 'settings' as PageType, 
    label: 'Paramètres', 
    icon: SettingsIcon,
    description: 'Configuration'
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  open,
  onClose,
  currentPage,
  onPageChange,
  hasAnalysisData,
}) => {
  const handleItemClick = (page: PageType) => {
    onPageChange(page);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar />
      
      {/* Logo Section */}
      <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
        <TrendingUpIcon sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="h6" fontWeight={600}>
          OptimusCredit
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          Analyse Financière
        </Typography>
      </Box>

      <Divider />

      {/* Main Navigation */}
      <List sx={{ flexGrow: 1, px: 1, py: 2 }}>
        {menuItems.map((item) => {
          const isDisabled = item.requiresData && !hasAnalysisData;
          const isActive = currentPage === item.id;
          
          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => !isDisabled && handleItemClick(item.id)}
                disabled={isDisabled}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  },
                  '&:hover': {
                    bgcolor: isActive ? 'primary.dark' : 'action.hover',
                  },
                }}
                selected={isActive}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.requiresData && hasAnalysisData ? (
                    <Badge color="success" variant="dot">
                      <item.icon />
                    </Badge>
                  ) : (
                    <item.icon />
                  )}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  secondary={item.description}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.9rem',
                  }}
                  secondaryTypographyProps={{
                    fontSize: '0.75rem',
                    sx: { opacity: isActive ? 0.8 : 0.6 },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Secondary Navigation */}
      <List sx={{ px: 1, py: 1 }}>
        {secondaryItems.map((item) => {
          const isActive = currentPage === item.id;
          
          return (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                onClick={() => handleItemClick(item.id)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
                selected={isActive}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <item.icon />
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.9rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer */}
      <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper' }}>
        <Typography variant="caption" color="text.secondary">
          Version 2.0.0
        </Typography>
        <br />
        <Typography variant="caption" color="text.secondary">
          © 2025 Kaizen Business Support
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop Drawer */}
      <Drawer
        variant="persistent"
        open={open}
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};