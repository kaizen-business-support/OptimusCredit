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
  Grid,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { ocrService } from '../services/ocrService';

interface OcrUploadProps {
  onDataExtracted: (data: any, year?: number) => void;
  targetYear?: number;
}

interface ExtractedData {
  confidence?: number;
  data: any;
  originalText?: string;
}

export const OcrUpload: React.FC<OcrUploadProps> = ({ onDataExtracted, targetYear }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Seuls les fichiers PDF sont acceptés pour l\'OCR.');
      return;
    }

    setUploadedFile(file);
    setError(null);
    await processFile(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setProcessingProgress(10);
    setProgressText('Initialisation de l\'OCR...');

    try {
      // Step 1: Initialize OCR
      await ocrService.initializeOcr();
      setProcessingProgress(20);
      setProgressText('Extraction du texte du PDF...');

      // Step 2: Extract text from all pages of the PDF
      const extractedTexts = await ocrService.extractTextFromPdf(file, {
        language: 'fra'
      });
      
      setProcessingProgress(60);
      setProgressText('Analyse du texte extrait...');

      // Combine extracted text for preview
      const combinedText = extractedTexts.join('\n\n--- PAGE BREAK ---\n\n');
      setExtractedText(combinedText);

      // Step 3: Extract financial data from all pages
      const financialData = await ocrService.extractFinancialData(file, {
        language: 'fra'
      });

      setProcessingProgress(80);
      setProgressText('Conversion au format OptimusCredit...');

      // Step 4: Convert to OptimusCredit format
      const optimusData = ocrService.convertToOptimusFormat(financialData);

      setProcessingProgress(100);
      setProgressText('Traitement terminé !');

      setExtractedData({
        confidence: financialData.confidence || 0,
        data: optimusData,
        originalText: combinedText
      });

      console.log('OCR extraction completed:', {
        originalData: financialData,
        convertedData: optimusData,
        confidence: financialData.confidence
      });

    } catch (error) {
      console.error('OCR processing error:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors du traitement OCR');
    } finally {
      setIsProcessing(false);
      await ocrService.cleanup();
    }
  };

  const handleConfirmData = () => {
    if (extractedData) {
      onDataExtracted(extractedData.data, targetYear);
    }
  };

  const handleRetry = () => {
    if (uploadedFile) {
      setExtractedData(null);
      setError(null);
      processFile(uploadedFile);
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setExtractedData(null);
    setError(null);
    setProcessingProgress(0);
    setProgressText('');
    setExtractedText('');
  };

  const getFieldCount = (data: any): number => {
    return Object.keys(data || {}).filter(key => 
      data[key] !== null && 
      data[key] !== undefined && 
      data[key] !== 0
    ).length;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'success';
    if (confidence >= 60) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        📸 Reconnaissance OCR de Documents PDF
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Importez un document PDF contenant des états financiers au format OHADA. 
        L'OCR analysera automatiquement toutes les pages pour extraire les données financières.
      </Typography>

      {/* Upload Area */}
      {!uploadedFile && (
        <Card
          {...getRootProps()}
          sx={{
            p: 4,
            textAlign: 'center',
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            bgcolor: isDragActive ? 'primary.50' : 'grey.50',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'primary.50',
            },
          }}
        >
          <input {...getInputProps()} />
          <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {isDragActive ? 'Déposez le fichier PDF ici' : 'Cliquez ou glissez un fichier PDF'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Formats acceptés: PDF uniquement • Taille max: 10MB
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1, fontStyle: 'italic' }}>
            L'OCR analysera toutes les pages du document pour trouver les états financiers
          </Typography>
        </Card>
      )}

      {/* File Processing */}
      {uploadedFile && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FileIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {uploadedFile.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                </Typography>
              </Box>
              <Button
                onClick={resetUpload}
                size="small"
                color="secondary"
                disabled={isProcessing}
              >
                Changer de fichier
              </Button>
            </Box>

            {/* Progress */}
            {isProcessing && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    {progressText}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {processingProgress}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={processingProgress} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            )}

            {/* Error */}
            {error && !isProcessing && (
              <Alert 
                severity="error" 
                sx={{ mb: 2 }}
                action={
                  <IconButton onClick={handleRetry} size="small" color="inherit">
                    <RefreshIcon />
                  </IconButton>
                }
              >
                {error}
              </Alert>
            )}

            {/* Success with extracted data */}
            {extractedData && !isProcessing && !error && (
              <>
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    ✅ Extraction OCR terminée avec succès !
                  </Typography>
                  <Typography variant="body2">
                    {getFieldCount(extractedData.data)} champs extraits • 
                    Confiance: {extractedData.confidence}% • 
                    Année cible: {targetYear}
                  </Typography>
                </Alert>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={4}>
                    <Chip
                      icon={<CheckIcon />}
                      label={`${getFieldCount(extractedData.data)} champs extraits`}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Chip
                      label={`Confiance: ${extractedData.confidence}%`}
                      color={getConfidenceColor(extractedData.confidence || 0)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Chip
                      label={`Année: ${targetYear}`}
                      color="default"
                      size="small"
                    />
                  </Grid>
                </Grid>

                {/* Extracted Fields Preview */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Champs extraits:
                  </Typography>
                  <List dense sx={{ maxHeight: 200, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    {Object.entries(extractedData.data).map(([key, value]) => (
                      <ListItem key={key} sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          secondary={typeof value === 'number' ? 
                            new Intl.NumberFormat('fr-FR').format(value) : 
                            String(value)
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    startIcon={<ViewIcon />}
                    onClick={() => setShowPreview(true)}
                  >
                    Voir le texte extrait
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleRetry}
                  >
                    Retraiter
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<CheckIcon />}
                    onClick={handleConfirmData}
                    sx={{ fontWeight: 600 }}
                  >
                    Utiliser ces données
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Text Preview Dialog */}
      <Dialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Texte extrait par OCR
        </DialogTitle>
        <DialogContent>
          <Typography
            component="pre"
            variant="body2"
            sx={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              maxHeight: '60vh',
              overflow: 'auto',
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
            }}
          >
            {extractedText}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Instructions */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          📋 Instructions pour de meilleurs résultats:
        </Typography>
        <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
          <li>Assurez-vous que le document PDF est de bonne qualité</li>
          <li>Les états financiers doivent être au format OHADA standard</li>
          <li>L'OCR fonctionne mieux avec des documents scannés à haute résolution</li>
          <li>Vérifiez les données extraites avant de les utiliser</li>
        </ul>
      </Alert>
    </Box>
  );
};