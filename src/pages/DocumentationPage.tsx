import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link,
} from '@mui/material';
import {
  Description as DocumentIcon,
  Assessment as AnalysisIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as BankIcon,
  CheckCircle as CheckIcon,
  Calculate as CalculateIcon,
  Source as SourceIcon,
  Gavel as ComplianceIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { PageType } from '../types';

interface DocumentationPageProps {
  onNavigate: (page: PageType) => void;
}

// Ratio calculation formulas and explanations
const liquidityRatios = [
  {
    name: "Liquidité Générale",
    formula: "(Actif Circulant + Trésorerie Actif) / Total Dettes",
    interpretation: "Capacité à honorer les dettes à court terme. Norme BCEAO : ≥ 1,2",
    excellent: "> 2,0",
    good: "1,5 - 2,0",
    acceptable: "1,2 - 1,5",
    poor: "1,0 - 1,2",
    critical: "< 1,0"
  },
  {
    name: "Liquidité Immédiate",
    formula: "Trésorerie Actif / Total Dettes",
    interpretation: "Capacité à honorer immédiatement les dettes. Norme BCEAO : ≥ 0,3",
    excellent: "> 0,8",
    good: "0,5 - 0,8",
    acceptable: "0,3 - 0,5",
    poor: "0,2 - 0,3",
    critical: "< 0,2"
  },
  {
    name: "BFR en jours de CA",
    formula: "(BFR / Chiffre d'Affaires) × 365",
    interpretation: "Nombre de jours de CA nécessaires pour financer le BFR. Objectif : < 60 jours",
    excellent: "< 30 jours",
    good: "30 - 45 jours",
    acceptable: "45 - 60 jours",
    poor: "60 - 90 jours",
    critical: "> 90 jours"
  }
];

const solvabilityRatios = [
  {
    name: "Autonomie Financière",
    formula: "(Capitaux Propres / Total Actif) × 100",
    interpretation: "Indépendance financière de l'entreprise. Norme BCEAO : ≥ 20%",
    excellent: "> 40%",
    good: "30% - 40%",
    acceptable: "20% - 30%",
    poor: "10% - 20%",
    critical: "< 10%"
  },
  {
    name: "Endettement Global",
    formula: "(Total Dettes / Total Actif) × 100",
    interpretation: "Niveau d'endettement global. Norme BCEAO : ≤ 70%",
    excellent: "< 40%",
    good: "40% - 50%",
    acceptable: "50% - 70%",
    poor: "70% - 85%",
    critical: "> 85%"
  }
];

const profitabilityRatios = [
  {
    name: "ROE (Return on Equity)",
    formula: "(Résultat Net / Capitaux Propres) × 100",
    interpretation: "Rentabilité des capitaux propres. Norme BCEAO : ≥ 10%",
    excellent: "> 20%",
    good: "15% - 20%",
    acceptable: "10% - 15%",
    poor: "5% - 10%",
    critical: "< 5%"
  },
  {
    name: "ROA (Return on Assets)",
    formula: "(Résultat Net / Total Actif) × 100",
    interpretation: "Rentabilité économique des actifs. Norme BCEAO : ≥ 5%",
    excellent: "> 10%",
    good: "7% - 10%",
    acceptable: "5% - 7%",
    poor: "2% - 5%",
    critical: "< 2%"
  },
  {
    name: "Marge Nette",
    formula: "(Résultat Net / Chiffre d'Affaires) × 100",
    interpretation: "Rentabilité commerciale. Norme BCEAO : ≥ 3%",
    excellent: "> 8%",
    good: "5% - 8%",
    acceptable: "3% - 5%",
    poor: "1% - 3%",
    critical: "< 1%"
  }
];

const sectoralReferences = [
  {
    sector: "Commerce",
    source: "BCEAO - Rapport Conditions de Banque UEMOA 2023",
    link: "https://www.bceao.int/fr/publications/rapport-sur-les-conditions-de-banque-dans-luemoa-2023",
    downloadLink: "/optimus/docs/bceao-rapport-conditions-banque-2023.pdf",
    liquidite_generale: "1,0 - 1,5",
    autonomie_financiere: "20% - 35%",
    roe: "12% - 20%",
    rotation_actif: "1,2 - 2,0"
  },
  {
    sector: "Industrie",
    source: "BCEAO - Commission Bancaire UMOA 2023",
    link: "https://www.bceao.int/fr/publications/rapport-annuel-de-la-commission-bancaire-de-lumoa-2023",
    downloadLink: "/optimus/docs/bceao-commission-bancaire-2023.pdf",
    liquidite_generale: "1,2 - 1,8",
    autonomie_financiere: "25% - 45%",
    roe: "8% - 15%",
    rotation_actif: "0,8 - 1,2"
  },
  {
    sector: "Services",
    source: "FMI - Indicateurs de Solidité Financière",
    link: "https://www.imf.org/en/Data/Statistics/FSI-guide",
    downloadLink: "/optimus/docs/imf-financial-soundness-indicators.pdf",
    liquidite_generale: "1,5 - 2,5",
    autonomie_financiere: "30% - 60%",
    roe: "15% - 25%",
    rotation_actif: "1,0 - 1,8"
  },
  {
    sector: "Agriculture",
    source: "Banque Mondiale - Enquêtes Entreprises",
    link: "https://www.enterprisesurveys.org/en/data",
    downloadLink: "/optimus/docs/world-bank-enterprise-surveys-methodology.pdf",
    liquidite_generale: "1,3 - 2,0",
    autonomie_financiere: "35% - 55%",
    roe: "10% - 18%",
    rotation_actif: "0,6 - 1,0"
  }
];

const soldesIntermediaires = [
  {
    name: "Marge Commerciale",
    formula: "Ventes de marchandises - Coût d'achat des marchandises vendues",
    description: "La marge commerciale représente le bénéfice réalisé uniquement sur l'activité de revente de marchandises, sans aucune transformation. Elle indique combien l'entreprise gagne en achetant des produits finis pour les revendre en l'état.",
    example: "Une épicerie achète des boîtes de conserve à 100 FCFA et les revend 150 FCFA. Si elle en vend 1000 par mois, sa marge commerciale sera : (150 x 1000) - (100 x 1000) = 50 000 FCFA. Cette marge doit couvrir les frais de magasin, salaires, et générer un bénéfice."
  },
  {
    name: "Production de l'exercice",
    formula: "Production vendue + Production stockée + Production immobilisée",
    description: "Cet indicateur mesure la valeur totale de ce que l'entreprise a produit pendant l'année, qu'elle l'ait vendu immédiatement, stocké pour vendre plus tard, ou gardé pour ses propres besoins. Il reflète l'activité productive réelle de l'entreprise.",
    example: "Une boulangerie fabrique du pain pour 2 000 000 FCFA/mois qu'elle vend, stocke 200 000 FCFA de pâtisseries pour les fêtes, et fabrique ses propres étagères pour 100 000 FCFA. Sa production totale = 2 300 000 FCFA/mois. Cela montre sa capacité productive réelle."
  },
  {
    name: "Valeur Ajoutée",
    formula: "Marge commerciale + Production - Consommations intermédiaires",
    description: "La valeur ajoutée représente la richesse nouvelle créée par l'entreprise grâce à son activité. C'est la différence entre ce qu'elle produit/vend et ce qu'elle achète à d'autres entreprises. Plus la valeur ajoutée est élevée, plus l'entreprise apporte de valeur à l'économie.",
    example: "Un menuisier vend des tables à 100 000 FCFA. Il achète le bois à 30 000 FCFA, la quincaillerie à 10 000 FCFA. Sa valeur ajoutée par table = 100 000 - (30 000 + 10 000) = 60 000 FCFA. Ces 60 000 FCFA représentent la valeur de son savoir-faire, son travail et ses outils."
  },
  {
    name: "Excédent Brut d'Exploitation (EBE)",
    formula: "Valeur ajoutée - Charges de personnel - Impôts et taxes",
    description: "L'EBE mesure ce que l'entreprise génère comme excédent après avoir payé ses employés et les impôts, mais avant de rembourser ses emprunts ou amortir ses équipements. C'est l'indicateur clé de la rentabilité opérationnelle pure de l'entreprise.",
    example: "Un garage automobile génère 5 000 000 FCFA de valeur ajoutée. Il paie 2 000 000 FCFA de salaires et 300 000 FCFA d'impôts. Son EBE = 5 000 000 - 2 000 000 - 300 000 = 2 700 000 FCFA. Cette somme servira à rembourser les emprunts, renouveler les équipements et dégager un bénéfice."
  },
  {
    name: "Résultat d'Exploitation",
    formula: "EBE - Dotations aux amortissements et provisions",
    description: "Le résultat d'exploitation indique le bénéfice généré par l'activité principale de l'entreprise, après avoir pris en compte l'usure et la dépréciation des équipements. Il montre si le cœur de métier de l'entreprise est rentable, indépendamment du financement ou des éléments exceptionnels.",
    example: "Une imprimerie a un EBE de 1 500 000 FCFA. Ses machines s'usent et perdent 400 000 FCFA de valeur par an (amortissement). Son résultat d'exploitation = 1 500 000 - 400 000 = 1 100 000 FCFA. Ce montant montre que son activité d'impression est rentable même après usure des machines."
  },
  {
    name: "Résultat Courant",
    formula: "Résultat d'exploitation + Résultat financier",
    description: "Le résultat courant combine la performance opérationnelle de l'entreprise avec sa politique financière (emprunts, placements). Il représente le bénéfice des activités normales et récurrentes, excluant les événements exceptionnels. C'est un indicateur de la rentabilité globale habituelle.",
    example: "Un hôtel a un résultat d'exploitation de 2 000 000 FCFA. Il paie 300 000 FCFA d'intérêts sur ses emprunts et reçoit 50 000 FCFA d'intérêts sur ses placements. Résultat financier = 50 000 - 300 000 = -250 000 FCFA. Résultat courant = 2 000 000 - 250 000 = 1 750 000 FCFA."
  },
  {
    name: "Résultat Net",
    formula: "Résultat courant + Résultat exceptionnel - Impôts sur bénéfices",
    description: "Le résultat net est le bénéfice final qui revient aux propriétaires de l'entreprise après tous les coûts, impôts et événements exceptionnels. C'est l'indicateur ultime de la rentabilité : ce qui reste réellement dans les poches des actionnaires ou pour autofinancer l'entreprise.",
    example: "Un restaurant a un résultat courant de 800 000 FCFA. Il vend un ancien four pour un bénéfice exceptionnel de 100 000 FCFA et paie 180 000 FCFA d'impôts sur les bénéfices. Son résultat net = 800 000 + 100 000 - 180 000 = 720 000 FCFA. Cette somme peut être distribuée aux associés ou réinvestie."
  }
];

const bceaoNorms = [
  {
    category: "Institutions de Microfinance",
    ratios: [
      { name: "Ratio de solvabilité", norme: "≥ 15%", description: "Fonds propres / Total bilan" },
      { name: "Ratio de liquidité", norme: "≥ 15%", description: "Actifs liquides / Passifs exigibles" },
      { name: "Coefficient de rentabilité", norme: "≥ 2%", description: "Résultat net / Total bilan" },
      { name: "Ratio d'endettement", norme: "≤ 9", description: "Total dettes / Fonds propres" }
    ],
    source: "Instruction n°008-05-2010 relative aux normes de gestion applicables aux institutions de microfinance"
  },
  {
    category: "Établissements Bancaires",
    ratios: [
      { name: "Ratio de solvabilité (Bâle)", norme: "≥ 10%", description: "Fonds propres / Actifs pondérés" },
      { name: "Ratio de liquidité", norme: "≥ 75%", description: "Actifs liquides / Passifs exigibles" },
      { name: "Coefficient de division des risques", norme: "≤ 45%", description: "Plus gros risque / Fonds propres" },
      { name: "Coefficient de couverture", norme: "≥ 60%", description: "Fonds propres permanents / Immobilisations" }
    ],
    source: "Dispositif prudentiel applicable aux banques et établissements financiers de l'UMOA"
  }
];

// PDF Preview Component
const PDFPreview: React.FC<{ pdfUrl: string; isOpen: boolean; sector: string }> = ({ pdfUrl, isOpen, sector }) => {
  const [loadError, setLoadError] = useState(false);

  if (!isOpen) return null;

  const handleIframeError = () => {
    setLoadError(true);
    console.warn(`Failed to load PDF preview for ${sector}`);
  };

  return (
    <Box sx={{ mt: 2, mb: 2, mx: 2, border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
      <Box sx={{ p: 2, bgcolor: 'grey.100', borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PdfIcon color="primary" />
          Prévisualisation PDF - {sector}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Document de référence sectorielle • Cliquez sur "Télécharger PDF" pour ouvrir dans un nouvel onglet
        </Typography>
      </Box>
      <Box sx={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {loadError ? (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <PdfIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Impossible de charger la prévisualisation PDF
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Utilisez le lien "Télécharger PDF" ci-dessus pour accéder au document
            </Typography>
          </Box>
        ) : (
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            title={`PDF Preview - ${sector}`}
            onError={handleIframeError}
            onLoad={() => setLoadError(false)}
          />
        )}
      </Box>
    </Box>
  );
};

export const DocumentationPage: React.FC<DocumentationPageProps> = ({ onNavigate }) => {
  const [expandedSectors, setExpandedSectors] = useState<Record<string, boolean>>({});

  const toggleSectorExpansion = useCallback((sector: string) => {
    setExpandedSectors(prev => ({
      ...prev,
      [sector]: !prev[sector]
    }));
  }, []);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          <DocumentIcon sx={{ mr: 2, color: 'primary.main' }} />
          Documentation Technique OptimusCredit
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Guide complet des ratios financiers, normes BCEAO et références sectorielles
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* User Guide */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <DocumentIcon sx={{ mr: 1, color: 'primary.main' }} />
                Guide d'Utilisation
              </Typography>
              
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    1. Import du Template Excel OHADA/BCEAO
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" paragraph>
                    OptimusCredit utilise le format standardisé OHADA avec 3 feuilles principales :
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Bilan : Actifs et Passifs (Colonne E = Année N, Colonne F = Année N-1)" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                      <ListItemText primary="CR : Compte de Résultat (Produits et Charges)" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                      <ListItemText primary="TFT : Tableau des Flux de Trésorerie" />
                    </ListItem>
                  </List>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Téléchargez le template standard depuis l'interface et remplissez les colonnes E (année N) et F (année N-1) avec vos données financières.
                  </Alert>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    2. Configuration et Analyse
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Sélectionnez l'année de référence et le nombre d'années à analyser" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Choisissez le secteur d'activité pour les références sectorielles" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Importez le fichier Excel ou utilisez la saisie manuelle" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Consultez l'analyse complète avec ratios, tendances et conformité BCEAO" />
                    </ListItem>
                  </List>
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>
        </Grid>

        {/* Liquidity Ratios */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <CalculateIcon sx={{ mr: 1, color: 'primary.main' }} />
                Ratios de Liquidité
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Ratio</strong></TableCell>
                      <TableCell><strong>Formule</strong></TableCell>
                      <TableCell><strong>Interprétation</strong></TableCell>
                      <TableCell><strong>Excellent</strong></TableCell>
                      <TableCell><strong>Bon</strong></TableCell>
                      <TableCell><strong>Acceptable</strong></TableCell>
                      <TableCell><strong>Critique</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {liquidityRatios.map((ratio, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ fontWeight: 600 }}>{ratio.name}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{ratio.formula}</TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>{ratio.interpretation}</TableCell>
                        <TableCell sx={{ color: 'success.main', fontWeight: 600 }}>{ratio.excellent}</TableCell>
                        <TableCell sx={{ color: 'info.main', fontWeight: 600 }}>{ratio.good}</TableCell>
                        <TableCell sx={{ color: 'warning.main', fontWeight: 600 }}>{ratio.acceptable}</TableCell>
                        <TableCell sx={{ color: 'error.main', fontWeight: 600 }}>{ratio.critical}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Solvability Ratios */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <BankIcon sx={{ mr: 1, color: 'primary.main' }} />
                Ratios de Solvabilité
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Ratio</strong></TableCell>
                      <TableCell><strong>Formule</strong></TableCell>
                      <TableCell><strong>Interprétation</strong></TableCell>
                      <TableCell><strong>Excellent</strong></TableCell>
                      <TableCell><strong>Bon</strong></TableCell>
                      <TableCell><strong>Acceptable</strong></TableCell>
                      <TableCell><strong>Critique</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {solvabilityRatios.map((ratio, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ fontWeight: 600 }}>{ratio.name}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{ratio.formula}</TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>{ratio.interpretation}</TableCell>
                        <TableCell sx={{ color: 'success.main', fontWeight: 600 }}>{ratio.excellent}</TableCell>
                        <TableCell sx={{ color: 'info.main', fontWeight: 600 }}>{ratio.good}</TableCell>
                        <TableCell sx={{ color: 'warning.main', fontWeight: 600 }}>{ratio.acceptable}</TableCell>
                        <TableCell sx={{ color: 'error.main', fontWeight: 600 }}>{ratio.critical}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Profitability Ratios */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                Ratios de Rentabilité
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Ratio</strong></TableCell>
                      <TableCell><strong>Formule</strong></TableCell>
                      <TableCell><strong>Interprétation</strong></TableCell>
                      <TableCell><strong>Excellent</strong></TableCell>
                      <TableCell><strong>Bon</strong></TableCell>
                      <TableCell><strong>Acceptable</strong></TableCell>
                      <TableCell><strong>Critique</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {profitabilityRatios.map((ratio, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ fontWeight: 600 }}>{ratio.name}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{ratio.formula}</TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>{ratio.interpretation}</TableCell>
                        <TableCell sx={{ color: 'success.main', fontWeight: 600 }}>{ratio.excellent}</TableCell>
                        <TableCell sx={{ color: 'info.main', fontWeight: 600 }}>{ratio.good}</TableCell>
                        <TableCell sx={{ color: 'warning.main', fontWeight: 600 }}>{ratio.acceptable}</TableCell>
                        <TableCell sx={{ color: 'error.main', fontWeight: 600 }}>{ratio.critical}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Sectoral References */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SourceIcon sx={{ mr: 1, color: 'primary.main' }} />
                Références Sectorielles
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Secteur</strong></TableCell>
                      <TableCell><strong>Liquidité Générale</strong></TableCell>
                      <TableCell><strong>Autonomie Financière</strong></TableCell>
                      <TableCell><strong>ROE</strong></TableCell>
                      <TableCell><strong>Rotation Actif</strong></TableCell>
                      <TableCell><strong>Source</strong></TableCell>
                      <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sectoralReferences.map((ref, index) => (
                      <React.Fragment key={index}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>{ref.sector}</TableCell>
                          <TableCell>{ref.liquidite_generale}</TableCell>
                          <TableCell>{ref.autonomie_financiere}</TableCell>
                          <TableCell>{ref.roe}</TableCell>
                          <TableCell>{ref.rotation_actif}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Link href={ref.link} target="_blank" rel="noopener noreferrer" sx={{ fontSize: '0.875rem' }}>
                                {ref.source}
                              </Link>
                              {ref.downloadLink && (
                                <Link 
                                  href={ref.downloadLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  sx={{ fontSize: '0.75rem', color: 'primary.main', textDecoration: 'underline' }}
                                >
                                  <PdfIcon sx={{ fontSize: '0.8rem', mr: 0.5 }} />
                                  Télécharger PDF
                                </Link>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {ref.downloadLink && (
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Typography
                                  component="button"
                                  variant="body2"
                                  onClick={() => toggleSectorExpansion(ref.sector)}
                                  sx={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'primary.main',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    fontSize: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    '&:hover': { color: 'primary.dark' }
                                  }}
                                >
                                  {expandedSectors[ref.sector] ? (
                                    <>
                                      <ExpandLessIcon sx={{ fontSize: '0.9rem' }} />
                                      Masquer PDF
                                    </>
                                  ) : (
                                    <>
                                      <ExpandMoreIcon sx={{ fontSize: '0.9rem' }} />
                                      Prévisualiser PDF
                                    </>
                                  )}
                                </Typography>
                              </Box>
                            )}
                          </TableCell>
                        </TableRow>
                        {expandedSectors[ref.sector] && ref.downloadLink && (
                          <TableRow>
                            <TableCell colSpan={7} sx={{ p: 0, border: 'none' }}>
                              <PDFPreview 
                                pdfUrl={ref.downloadLink} 
                                isOpen={expandedSectors[ref.sector]}
                                sector={ref.sector}
                              />
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Sources Complémentaires Recommandées
                </Typography>
                <Typography variant="body2" component="div">
                  • <Link href="https://www.bceao.int/fr/publications/rapport-annuel-de-la-bceao-2023" target="_blank" rel="noopener">
                    BCEAO - Rapport Annuel 2023
                  </Link> - Analyses macro-économiques et sectorielles<br/>
                  • <Link href="https://www.imf.org/en/Data/Statistics/FSI-guide" target="_blank" rel="noopener">
                    FMI - Guide des Indicateurs de Solidité Financière
                  </Link> - Méthodologie standardisée<br/>
                  • <Link href="https://www.enterprisesurveys.org/en/data" target="_blank" rel="noopener">
                    Banque Mondiale - Enquêtes Entreprises
                  </Link> - Données sectorielles comparatives<br/>
                  • <Link href="https://www.bceao.int/fr/publications/rapport-sur-la-politique-monetaire-de-lumoa-juin-2023" target="_blank" rel="noopener">
                    BCEAO - Politique Monétaire UMOA 2023
                  </Link> - Contexte économique régional
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Soldes Intermédiaires de Gestion */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AnalysisIcon sx={{ mr: 1, color: 'primary.main' }} />
                Soldes Intermédiaires de Gestion (SIG)
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Les Soldes Intermédiaires de Gestion permettent d'analyser la formation du résultat de l'entreprise étape par étape :
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ minWidth: 150 }}><strong>Solde</strong></TableCell>
                      <TableCell sx={{ minWidth: 200 }}><strong>Formule de Calcul</strong></TableCell>
                      <TableCell sx={{ minWidth: 300 }}><strong>Signification Économique</strong></TableCell>
                      <TableCell sx={{ minWidth: 300 }}><strong>Exemple Concret</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {soldesIntermediaires.map((solde, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ fontWeight: 600, verticalAlign: 'top' }}>{solde.name}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem', verticalAlign: 'top' }}>{solde.formula}</TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', verticalAlign: 'top', lineHeight: 1.5 }}>{solde.description}</TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', verticalAlign: 'top', lineHeight: 1.5, fontStyle: 'italic', bgcolor: 'grey.50' }}>
                          {solde.example}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Alert severity="success" sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Analyse en Cascade
                </Typography>
                <Typography variant="body2">
                  L'analyse des SIG permet d'identifier précisément les sources de performance ou de défaillance : 
                  commerciale (Marge), productive (Valeur Ajoutée), opérationnelle (EBE), financière (Résultat Courant).
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* BCEAO Norms */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <ComplianceIcon sx={{ mr: 1, color: 'primary.main' }} />
                Normes BCEAO pour les Institutions Financières
              </Typography>
              
              {bceaoNorms.map((norm, index) => (
                <Box key={index} sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {norm.category}
                  </Typography>
                  
                  <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Ratio Prudentiel</strong></TableCell>
                          <TableCell><strong>Norme BCEAO</strong></TableCell>
                          <TableCell><strong>Mode de Calcul</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {norm.ratios.map((ratio, ratioIndex) => (
                          <TableRow key={ratioIndex}>
                            <TableCell sx={{ fontWeight: 600 }}>{ratio.name}</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>{ratio.norme}</TableCell>
                            <TableCell sx={{ fontSize: '0.875rem' }}>{ratio.description}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <Typography variant="caption" color="text.secondary">
                    <strong>Référence légale :</strong> {norm.source}
                  </Typography>
                </Box>
              ))}
              
              <Alert severity="warning" sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Application des Normes
                </Typography>
                <Typography variant="body2">
                  Ces normes s'appliquent spécifiquement aux institutions financières agréées par la BCEAO. 
                  Pour les entreprises commerciales et industrielles, OptimusCredit utilise les ratios d'analyse financière standards 
                  avec les seuils d'interprétation adaptés au contexte économique de l'UEMOA.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Reference */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <CheckIcon sx={{ mr: 1 }} />
                Aide-Mémoire Rapide
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Liquidité
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    • Générale ≥ 1,2<br/>
                    • Immédiate ≥ 0,3<br/>
                    • BFR &lt; 60 jours CA
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Solvabilité
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    • Autonomie ≥ 20%<br/>
                    • Endettement ≤ 70%<br/>
                    • Couverture ≥ 3x
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Rentabilité
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    • ROE ≥ 10%<br/>
                    • ROA ≥ 5%<br/>
                    • Marge Nette ≥ 3%
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DocumentationPage;