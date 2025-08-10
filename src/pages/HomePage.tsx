import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Analytics as AnalysisIcon,
  Assessment as ReportsIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Devices as MobileIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { PageType } from '../types';

interface HomePageProps {
  onNavigate: (page: PageType) => void;
}

const features = [
  {
    icon: SpeedIcon,
    title: 'Analyse Rapide',
    description: 'Importez vos données Excel et obtenez une analyse complète en quelques secondes',
  },
  {
    icon: SecurityIcon,
    title: 'Sécurisé',
    description: 'Vos données financières sont traitées de manière sécurisée et confidentielle',
  },
  {
    icon: TrendingUpIcon,
    title: 'Visualisations',
    description: 'Graphiques et tableaux interactifs pour une meilleure compréhension',
  },
  {
    icon: MobileIcon,
    title: 'Multi-plateforme',
    description: 'Accédez à vos analyses depuis n\'importe quel appareil',
  },
];

const steps = [
  'Configurez votre période d\'analyse (jusqu\'à 3 années)',
  'Saisissez vos données par année (Excel, manuel ou OCR)',
  'Consultez l\'analyse complète avec ratios et tendances',
  'Générez des rapports professionnels conformes aux normes BCEAO',
];

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #b5b5b6ff 0%, #999a9bff 100%)',
          color: 'white',
          py: 8,
          px: 4,
          borderRadius: 3,
          mb: 6,
          textAlign: 'center',
        }}
      >
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: 'rgba(255,255,255,0.2)',
            mx: 'auto',
            mb: 3,
          }}
        >
          <TrendingUpIcon sx={{ fontSize: 40 }} />
        </Avatar>
        
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          OptimusCredit
        </Typography>
        
        <Typography variant="h5" component="h2" sx={{ mb: 4, opacity: 0.9 }}>
          Plateforme Professionnelle d'Analyse Financière
        </Typography>
        
        <Typography variant="h6" sx={{ mb: 4, maxWidth: 800, mx: 'auto', opacity: 0.8 }}>
          Analysez vos états financiers, calculez les ratios clés, et générez des rapports 
          professionnels conformes aux normes BCEAO en quelques clics.
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={() => onNavigate('data-input')}
          sx={{
            bgcolor: 'white',
            color: 'primary.main',
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 600,
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.9)',
            },
          }}
          startIcon={<UploadIcon />}
        >
          Commencer l'Analyse
        </Button>
      </Box>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              height: '100%', 
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' },
            }}
            onClick={() => onNavigate('data-input')}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom fontWeight={600}>
                Nouvelle Analyse
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Configurez votre période d'analyse et commencez la saisie des données
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              height: '100%',
              opacity: 0.7,
              cursor: 'not-allowed',
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <AnalysisIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom fontWeight={600}>
                Analyse
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Consultez l'analyse détaillée après l'import des données
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              height: '100%',
              opacity: 0.7,
              cursor: 'not-allowed',
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <ReportsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom fontWeight={600}>
                Rapports
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Générez des rapports PDF ou Excel professionnels
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Features Section */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        Fonctionnalités Principales
      </Typography>

      <Grid container spacing={4} sx={{ mb: 6 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Box sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'primary.main',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <feature.icon sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
                {feature.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {feature.description}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* How it Works Section */}
      <Card sx={{ p: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
          Comment ça marche ?
        </Typography>

        <List>
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <ListItem sx={{ py: 2 }}>
                <ListItemIcon>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: 'primary.main',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    {index + 1}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={step}
                  primaryTypographyProps={{
                    variant: 'body1',
                    sx: { fontWeight: 500 },
                  }}
                />
                <CheckIcon sx={{ color: 'success.main', ml: 2 }} />
              </ListItem>
              {index < steps.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => onNavigate('data-input')}
            sx={{ px: 4, py: 1.5 }}
          >
            Commencer Maintenant
          </Button>
        </Box>
      </Card>
    </Box>
  );
};