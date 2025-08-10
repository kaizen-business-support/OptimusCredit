import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Gavel as ComplianceIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { MultiyearData } from '../../types';
import { FinancialCalculator, BceaoCompliance } from '../../services/financialCalculator';
import numeral from 'numeral';

interface BceaoCompliancePanelProps {
  multiyearData: MultiyearData;
  sector: string;
}

interface ComplianceCategory {
  name: string;
  ratios: BceaoCompliance[];
  description: string;
  weight: number;
}

export const BceaoCompliancePanel: React.FC<BceaoCompliancePanelProps> = ({
  multiyearData,
  sector
}) => {
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState<BceaoCompliance | null>(null);

  // Get latest year data for compliance check
  const getLatestYearData = () => {
    const years = Object.entries(multiyearData).sort(([,a], [,b]) => b.year - a.year);
    return years[0] ? years[0][1] : null;
  };

  const latestYearData = getLatestYearData();
  
  // Calculate compliance if data is available
  const compliance = latestYearData ? 
    FinancialCalculator.checkBceaoCompliance(
      FinancialCalculator.calculateRatios(latestYearData.data), 
      sector
    ) : [];

  // Group compliance results by category
  const groupComplianceByCategory = (): ComplianceCategory[] => {
    const categories: Record<string, ComplianceCategory> = {
      liquidity: {
        name: 'Liquidité',
        ratios: [],
        description: 'Capacité à honorer les engagements à court terme',
        weight: 30,
      },
      solvency: {
        name: 'Solvabilité',
        ratios: [],
        description: 'Structure financière et autonomie',
        weight: 25,
      },
      profitability: {
        name: 'Rentabilité',
        ratios: [],
        description: 'Performance et génération de bénéfices',
        weight: 25,
      },
      activity: {
        name: 'Activité',
        ratios: [],
        description: 'Efficacité dans l\'utilisation des actifs',
        weight: 20,
      },
    };

    // Categorize ratios
    compliance.forEach(item => {
      if (item.ratioName.includes('liquidite')) {
        categories.liquidity.ratios.push(item);
      } else if (item.ratioName.includes('autonomie') || item.ratioName.includes('endettement')) {
        categories.solvency.ratios.push(item);
      } else if (item.ratioName.includes('roe') || item.ratioName.includes('roa') || item.ratioName.includes('marge')) {
        categories.profitability.ratios.push(item);
      } else if (item.ratioName.includes('rotation')) {
        categories.activity.ratios.push(item);
      } else {
        // Default to solvency for other ratios
        categories.solvency.ratios.push(item);
      }
    });

    return Object.values(categories).filter(cat => cat.ratios.length > 0);
  };

  const categorizedCompliance = groupComplianceByCategory();

  // Calculate overall compliance score
  const calculateComplianceScore = (): { score: number; compliantCount: number; totalCount: number } => {
    if (compliance.length === 0) return { score: 0, compliantCount: 0, totalCount: 0 };

    const compliantCount = compliance.filter(item => item.isCompliant).length;
    const score = (compliantCount / compliance.length) * 100;

    return { score, compliantCount, totalCount: compliance.length };
  };

  const { score: complianceScore, compliantCount, totalCount } = calculateComplianceScore();

  // Get status color based on compliance status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'success';
      case 'good': return 'success';
      case 'acceptable': return 'warning';
      case 'poor': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'good':
        return <CheckIcon sx={{ color: 'success.main' }} />;
      case 'acceptable':
        return <WarningIcon sx={{ color: 'warning.main' }} />;
      case 'poor':
      case 'critical':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      default:
        return <InfoIcon sx={{ color: 'info.main' }} />;
    }
  };

  // Format ratio name for display
  const formatRatioName = (ratioName: string): string => {
    const nameMap: Record<string, string> = {
      'ratio_liquidite_generale': 'Ratio de Liquidité Générale',
      'ratio_liquidite_reduite': 'Ratio de Liquidité Réduite',
      'ratio_liquidite_immediate': 'Ratio de Liquidité Immédiate',
      'ratio_autonomie_financiere': 'Ratio d\'Autonomie Financière',
      'ratio_endettement': 'Ratio d\'Endettement',
      'ratio_couverture_dettes': 'Ratio de Couverture des Dettes',
      'roe': 'Rentabilité des Capitaux Propres (ROE)',
      'roa': 'Rentabilité de l\'Actif (ROA)',
      'marge_nette': 'Marge Nette',
      'rotation_actif': 'Rotation de l\'Actif',
    };
    
    return nameMap[ratioName] || ratioName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Format value for display
  const formatValue = (value: number, ratioName: string): string => {
    if (ratioName.includes('ratio') && !ratioName.includes('endettement') && !ratioName.includes('autonomie')) {
      return value.toFixed(2);
    } else if (ratioName.includes('endettement') || ratioName.includes('autonomie') || ratioName.includes('marge')) {
      return `${value.toFixed(1)}%`;
    } else {
      return `${value.toFixed(1)}%`;
    }
  };

  // Handle ratio click for detailed view
  const handleRatioClick = (ratio: BceaoCompliance) => {
    setSelectedRatio(ratio);
    setHelpDialogOpen(true);
  };

  if (!latestYearData) {
    return (
      <Alert severity="warning">
        Aucune donnée disponible pour l'analyse de conformité BCEAO.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <ComplianceIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h5" component="h2" fontWeight={600}>
          Conformité BCEAO
        </Typography>
        <Tooltip title="Aide sur les normes BCEAO">
          <IconButton 
            onClick={() => setHelpDialogOpen(true)} 
            sx={{ ml: 1 }}
          >
            <HelpIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Overall Score */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #1f4e79 0%, #2c5aa0 100%)', color: 'white' }}>
        <CardContent>
          <Grid container alignItems="center" spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" fontWeight={700}>
                  {complianceScore.toFixed(0)}%
                </Typography>
                <Typography variant="h6">
                  Score de Conformité
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Analyse de Conformité - Exercice {latestYearData.year}
              </Typography>
              <Typography variant="body1" paragraph>
                {compliantCount} sur {totalCount} ratios sont conformes aux normes BCEAO
              </Typography>
              <LinearProgress
                variant="determinate"
                value={complianceScore}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'rgba(255,255,255,0.3)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: complianceScore >= 80 ? '#27ae60' : complianceScore >= 60 ? '#f39c12' : '#e74c3c',
                  },
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2">Critique</Typography>
                <Typography variant="body2">Excellent</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Compliance by Category */}
      {categorizedCompliance.map((category, index) => (
        <Accordion key={index} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
                {category.name}
              </Typography>
              <Chip
                label={`${category.ratios.filter(r => r.isCompliant).length}/${category.ratios.length}`}
                color={category.ratios.every(r => r.isCompliant) ? 'success' : 'warning'}
                size="small"
                sx={{ mr: 2 }}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary" paragraph>
              {category.description}
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Ratio</strong></TableCell>
                    <TableCell align="center"><strong>Valeur</strong></TableCell>
                    <TableCell align="center"><strong>Norme</strong></TableCell>
                    <TableCell align="center"><strong>Statut</strong></TableCell>
                    <TableCell align="center"><strong>Action</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {category.ratios.map((ratio, ratioIndex) => (
                    <TableRow 
                      key={ratioIndex}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleRatioClick(ratio)}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {formatRatioName(ratio.ratioName)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {formatValue(ratio.value, ratio.ratioName)}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: '0.875rem' }}>
                        {ratio.norm.min !== undefined && `Min: ${ratio.norm.min}`}
                        {ratio.norm.max !== undefined && `Max: ${ratio.norm.max}`}
                        {ratio.norm.optimal !== undefined && ` (Opt: ${ratio.norm.optimal})`}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {getStatusIcon(ratio.status)}
                          <Chip
                            label={ratio.status}
                            color={getStatusColor(ratio.status) as any}
                            size="small"
                            sx={{ ml: 1, textTransform: 'capitalize' }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={(e) => {
                          e.stopPropagation();
                          handleRatioClick(ratio);
                        }}>
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Recommendations */}
      {compliance.some(item => !item.isCompliant) && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Recommandations Prioritaires
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {compliance
              .filter(item => !item.isCompliant && item.recommendation)
              .slice(0, 3)
              .map((item, index) => (
                <li key={index}>
                  <Typography variant="body2">
                    <strong>{formatRatioName(item.ratioName)}:</strong> {item.recommendation}
                  </Typography>
                </li>
              ))}
          </ul>
        </Alert>
      )}

      {/* Help Dialog */}
      <Dialog
        open={helpDialogOpen}
        onClose={() => setHelpDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedRatio ? 
            `Détails - ${formatRatioName(selectedRatio.ratioName)}` : 
            'Normes BCEAO'
          }
        </DialogTitle>
        <DialogContent dividers>
          {selectedRatio ? (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Valeur Actuelle
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {formatValue(selectedRatio.value, selectedRatio.ratioName)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Statut
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getStatusIcon(selectedRatio.status)}
                    <Typography variant="h6" sx={{ ml: 1, textTransform: 'capitalize' }}>
                      {selectedRatio.status}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {selectedRatio.norm && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Normes BCEAO
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedRatio.norm.min !== undefined && (
                      <Grid item xs={4}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            Minimum
                          </Typography>
                          <Typography variant="h6">
                            {selectedRatio.norm.min}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                    {selectedRatio.norm.max !== undefined && (
                      <Grid item xs={4}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            Maximum
                          </Typography>
                          <Typography variant="h6">
                            {selectedRatio.norm.max}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                    {selectedRatio.norm.optimal !== undefined && (
                      <Grid item xs={4}>
                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
                          <Typography variant="body2" color="text.secondary">
                            Optimal
                          </Typography>
                          <Typography variant="h6">
                            {selectedRatio.norm.optimal}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}

              {selectedRatio.recommendation && (
                <Alert severity="info">
                  <Typography variant="subtitle2" gutterBottom>
                    Recommandation
                  </Typography>
                  <Typography variant="body2">
                    {selectedRatio.recommendation}
                  </Typography>
                </Alert>
              )}
            </Box>
          ) : (
            <Box>
              <Typography variant="body1" paragraph>
                Les normes de la Banque Centrale des États de l'Afrique de l'Ouest (BCEAO) 
                définissent les seuils prudentiels pour l'évaluation de la santé financière 
                des entreprises dans la zone UEMOA.
              </Typography>
              
              <Typography variant="h6" gutterBottom>
                Catégories d'Évaluation
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      🟢 Excellent/Bon
                    </Typography>
                    <Typography variant="body2">
                      Conforme aux normes, situation financière saine
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      🟡 Acceptable
                    </Typography>
                    <Typography variant="body2">
                      Légèrement en dessous des normes, surveillance nécessaire
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      🟠 Insuffisant
                    </Typography>
                    <Typography variant="body2">
                      En dessous des normes, actions correctives requises
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      🔴 Critique
                    </Typography>
                    <Typography variant="body2">
                      Très en dessous des normes, intervention urgente
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setHelpDialogOpen(false);
            setSelectedRatio(null);
          }}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BceaoCompliancePanel;