import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Edit as ManualIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { PageType } from '../types';
import useFinancialAnalysis from '../hooks/useFinancialAnalysis';
import { ExcelProcessor } from '../services/excelProcessor';

interface UploadPageProps {
  onNavigate: (page: PageType) => void;
  yearContext?: {
    year: number;
    onComplete: (data: any) => void;
  };
}


const requirements = [
  'Fichier Excel (.xlsx ou .xls) au format OHADA/BCEAO',
  'États financiers complétés avec vos données réelles',
  '⚠️ Ne pas télécharger le modèle vide - remplissez-le d\'abord',
  'Données du bilan, compte de résultat et flux de trésorerie',
  'Taille maximum : 10 MB',
];

export const UploadPage: React.FC<UploadPageProps> = ({ onNavigate, yearContext }) => {
  const { uploadAndAnalyze, analysisState } = useFinancialAnalysis();
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [showYearDialog, setShowYearDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [yearRange, setYearRange] = useState<{ start: number; end: number }>({
    start: new Date().getFullYear() - 2,
    end: new Date().getFullYear()
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setSelectedFile(file);
    setUploadResult(null);
    
    // If year context is provided, process directly
    if (yearContext) {
      await processFile(file, {
        primaryYear: yearContext.year,
        startYear: yearContext.year,
        endYear: yearContext.year
      });
    } else {
      setShowYearDialog(true);
    }
  }, [yearContext]);

  const processFile = async (file: File, yearConfig: { primaryYear: number; startYear: number; endYear: number }) => {
    try {
      const result = await uploadAndAnalyze(file, yearConfig);
      setUploadResult(result);
      
      if (result.success) {
        if (yearContext) {
          // In year context mode, call completion callback
          setTimeout(() => {
            yearContext.onComplete(result.data);
          }, 1500);
        } else {
          // In normal mode, navigate to analysis
          setTimeout(() => {
            onNavigate('analysis');
          }, 1500);
        }
      }
    } catch (error: any) {
      setUploadResult({
        success: false,
        error: error.message || 'Erreur lors du traitement du fichier',
      });
    }
  };

  const handleYearConfirm = async () => {
    if (!selectedFile) return;
    
    setShowYearDialog(false);
    await processFile(selectedFile, {
      primaryYear: selectedYear,
      startYear: yearRange.start,
      endYear: yearRange.end
    });
  };

  const handleYearCancel = () => {
    setShowYearDialog(false);
    setSelectedFile(null);
  };

  // Handle template download
  const handleDownloadTemplate = () => {
    try {
      const blob = ExcelProcessor.createTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'template_analyse_financiere.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement du template:', error);
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Import des Données Excel
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {/* Upload Area */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box
                {...getRootProps()}
                sx={{
                  border: '2px dashed',
                  borderColor: isDragActive ? 'primary.main' : isDragReject ? 'error.main' : 'grey.300',
                  borderRadius: 2,
                  p: 6,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <input {...getInputProps()} />
                
                <UploadIcon 
                  sx={{ 
                    fontSize: 64, 
                    color: isDragActive ? 'primary.main' : 'grey.400',
                    mb: 2,
                  }} 
                />
                
                {isDragActive ? (
                  <Typography variant="h6" color="primary">
                    Déposez le fichier ici...
                  </Typography>
                ) : isDragReject ? (
                  <Typography variant="h6" color="error">
                    Type de fichier non supporté
                  </Typography>
                ) : (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Glissez-déposez votre fichier Excel ici
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      ou
                    </Typography>
                    <Button variant="contained" size="large" sx={{ mt: 2 }}>
                      Sélectionner un fichier
                    </Button>
                  </>
                )}
              </Box>

              {/* Upload Progress */}
              {analysisState.isProcessing && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" gutterBottom>
                    {analysisState.processingStep}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={analysisState.uploadProgress}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {analysisState.uploadProgress}% - Traitement en cours...
                  </Typography>
                </Box>
              )}

              {/* Upload Result */}
              {uploadResult && (
                <Box sx={{ mt: 3 }}>
                  {uploadResult.success ? (
                    <Alert 
                      severity="success" 
                      icon={<CheckIcon />}
                      sx={{ alignItems: 'center' }}
                    >
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Fichier traité avec succès !
                        </Typography>
                        <Typography variant="body2">
                          <strong>{uploadResult.filename}</strong> a été importé et analysé.
                          Redirection vers l'analyse en cours...
                        </Typography>
                      </Box>
                    </Alert>
                  ) : (
                    <Alert 
                      severity="error" 
                      icon={<ErrorIcon />}
                      sx={{ alignItems: 'center' }}
                    >
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Erreur lors du traitement
                        </Typography>
                        <Typography variant="body2">
                          {uploadResult.error}
                        </Typography>
                      </Box>
                    </Alert>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Sample File Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📄 Fichier d'exemple
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Vous pouvez télécharger un fichier d'exemple pour voir le format requis.
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<FileIcon />}
                onClick={handleDownloadTemplate}
                fullWidth
              >
                Télécharger l'exemple
              </Button>
            </CardContent>
          </Card>

          {/* Manual Input Option */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ✏️ Saisie Manuelle
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Vous préférez saisir vos données directement ? 
                Utilisez notre formulaire guidé pour entrer vos états financiers.
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<ManualIcon />}
                onClick={() => onNavigate('manual-input')}
                fullWidth
                color="secondary"
              >
                Saisie Manuelle
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Requirements */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Exigences du fichier
              </Typography>
              <List dense>
                {requirements.map((requirement, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckIcon sx={{ fontSize: 20, color: 'success.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={requirement}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Supported Formats */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Formats supportés
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label=".xlsx" color="primary" variant="outlined" />
                <Chip label=".xls" color="primary" variant="outlined" />
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Les fichiers sont traités de manière sécurisée et ne sont pas stockés sur nos serveurs.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Warnings display */}
      {analysisState.warnings.length > 0 && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Avertissements lors du traitement :
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {analysisState.warnings.map((warning, index) => (
              <li key={index}>
                <Typography variant="body2">{warning}</Typography>
              </li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Year Selection Dialog */}
      <Dialog open={showYearDialog} onClose={handleYearCancel} maxWidth="sm" fullWidth>
        <DialogTitle>
          📅 Sélection de la période d'analyse
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Spécifiez la période des données financières contenues dans votre fichier Excel.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Année de début</InputLabel>
              <Select
                value={yearRange.start}
                label="Année de début"
                onChange={(e: SelectChangeEvent<number>) => 
                  setYearRange(prev => ({ ...prev, start: e.target.value as number }))
                }
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 9 + i).map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Année de fin</InputLabel>
              <Select
                value={yearRange.end}
                label="Année de fin"
                onChange={(e: SelectChangeEvent<number>) => 
                  setYearRange(prev => ({ ...prev, end: e.target.value as number }))
                }
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 9 + i).map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Année principale (la plus récente)</InputLabel>
            <Select
              value={selectedYear}
              label="Année principale (la plus récente)"
              onChange={(e: SelectChangeEvent<number>) => 
                setSelectedYear(e.target.value as number)
              }
            >
              {Array.from({ length: yearRange.end - yearRange.start + 1 }, (_, i) => yearRange.start + i).map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Fichier sélectionné:</strong> {selectedFile?.name}
            </Typography>
            <Typography variant="body2">
              L'année principale sera utilisée comme référence (N) et les autres années seront calculées relativement (N-1, N-2, etc.).
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleYearCancel}>
            Annuler
          </Button>
          <Button 
            onClick={handleYearConfirm} 
            variant="contained"
            disabled={selectedYear < yearRange.start || selectedYear > yearRange.end}
          >
            Analyser le fichier
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};