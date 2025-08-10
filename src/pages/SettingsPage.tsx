import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Info as InfoIcon,
  Update as UpdateIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { PageType } from '../types';

interface SettingsPageProps {
  onNavigate: (page: PageType) => void;
}

const features = [
  {
    icon: <SpeedIcon />,
    title: 'Performance Optimisée',
    description: 'Analyse rapide et précise des données financières',
    status: 'active',
  },
  {
    icon: <SecurityIcon />,
    title: 'Sécurité Avancée',
    description: 'Protection des données et conformité bancaire',
    status: 'active',
  },
  {
    icon: <TrendingUpIcon />,
    title: 'Analyse Multi-années',
    description: 'Comparaison et tendances sur plusieurs exercices',
    status: 'active',
  },
  {
    icon: <StorageIcon />,
    title: 'Export Professionnel',
    description: 'Rapports PDF et Excel de qualité bancaire',
    status: 'active',
  },
];

const systemInfo = [
  { label: 'Version', value: '2.0.0' },
  { label: 'Dernière mise à jour', value: '03 Août 2025' },
  { label: 'Type de licence', value: 'Professionnelle' },
  { label: 'Statut', value: 'Actif' },
];

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Paramètres & Configuration
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {/* System Information */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <InfoIcon sx={{ mr: 1 }} />
                Informations Système
              </Typography>
              
              <Grid container spacing={2}>
                {systemInfo.map((item, index) => (
                  <Grid item xs={6} sm={3} key={index}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {item.label}
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {item.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Fonctionnalités Disponibles
              </Typography>
              
              <List>
                {features.map((feature, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                        {feature.icon}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={feature.title}
                      secondary={feature.description}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                    <Chip
                      label={feature.status === 'active' ? 'Actif' : 'Inactif'}
                      color={feature.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Configuration Options */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <SettingsIcon sx={{ mr: 1 }} />
                Options de Configuration
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    <LanguageIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Langue
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Interface en français
                    </Typography>
                    <Button variant="outlined" size="small" disabled>
                      Français
                    </Button>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    <PaletteIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Thème
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Mode d'affichage
                    </Typography>
                    <Button variant="outlined" size="small" disabled>
                      Clair
                    </Button>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          {/* About */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <TrendingUpIcon sx={{ fontSize: 40 }} />
              </Avatar>
              
              <Typography variant="h5" fontWeight={600} gutterBottom>
                OptimusCredit
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Plateforme professionnelle d'analyse financière 
                pour le secteur bancaire et financier.
              </Typography>

              <Chip
                label="Version 2.0.0"
                color="primary"
                variant="outlined"
                sx={{ mb: 2 }}
              />

              <Typography variant="body2" color="text.secondary">
                Développé par <strong>Kaizen Corporation</strong>
              </Typography>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Support & Assistance
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Besoin d'aide ? Consultez nos ressources ou contactez notre équipe.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => window.open('mailto:support@kaizen-corporation.com')}
                >
                  Contacter le Support
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => onNavigate('home')}
                >
                  Guide d'Utilisation
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="text.secondary" align="center">
                © 2025 Kaizen Business Support
                <br />
                Tous droits réservés
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};