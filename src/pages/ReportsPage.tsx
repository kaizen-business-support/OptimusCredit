import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Alert,
  Divider,
  Chip,
  LinearProgress,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { PageType } from '../types';
import { useApp } from '../contexts/AppContext';
import useFinancialAnalysis from '../hooks/useFinancialAnalysis';

interface ReportsPageProps {
  onNavigate: (page: PageType) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ onNavigate }) => {
  const { state } = useApp();
  const { exportAnalysis } = useFinancialAnalysis();
  const [reportFormat, setReportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [reportPreview, setReportPreview] = useState<string | null>(null);

  const handleGeneratePreview = async () => {
    if (!state.analysisData) return;

    setIsGenerating(true);
    setGenerationProgress(0);
    setShowPreview(false);

    try {
      // Simulate progress steps
      const steps = [
        'Analyse des données financières...',
        'Génération des tableaux...',
        'Création des graphiques...',
        'Compilation du rapport...',
        'Finalisation...',
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setGenerationProgress(((i + 1) / steps.length) * 100);
      }

      // Generate report preview content
      const preview = generateReportPreview();
      setReportPreview(preview);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating report preview:', error);
      alert('Erreur lors de la génération de l\'aperçu du rapport');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!state.analysisData || !reportPreview) return;

    try {
      // Use the export hook for actual download
      await exportAnalysis(reportFormat, {
        includeCharts,
        includeRecommendations,
      });

      const fileName = `rapport_analyse_financiere_${Date.now()}.${reportFormat}`;
      setGeneratedReport(fileName);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Erreur lors du téléchargement du rapport');
    }
  };

  const generateFinancialTable = (fields: Array<{ key: string; label: string }>) => {
    const tableMultiyearData = multiyearData;
    const sortedKeys = Object.keys(tableMultiyearData).sort((a, b) => {
      const aYear = tableMultiyearData[a].year;
      const bYear = tableMultiyearData[b].year;
      return aYear - bYear;
    });

    return `
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 12px;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: 600;">Libellé</th>
            ${sortedKeys.map(key => `<th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: 600;">${key}</th>`).join('')}
            ${sortedKeys.length > 1 ? '<th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: 600; color: #2c5aa0;">Évolution</th>' : ''}
          </tr>
        </thead>
        <tbody>
          ${fields.map(field => {
            const values = sortedKeys.map(key => {
              const data = tableMultiyearData[key]?.data || {};
              return Number((data as any)[field.key]) || 0;
            });
            const lastValue = values[values.length - 1];
            const firstValue = values[0];
            const evolution = values.length > 1 && firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
            
            return `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px; font-weight: 500;">${field.label}</td>
                ${values.map(value => `<td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${value.toLocaleString()} FCFA</td>`).join('')}
                ${values.length > 1 ? `<td style="border: 1px solid #ddd; padding: 8px; text-align: center; color: ${evolution >= 0 ? '#28a745' : '#dc3545'}; font-weight: 600;">${evolution >= 0 ? '+' : ''}${evolution.toFixed(1)}%</td>` : ''}
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  };

  const generateBalanceSheetInterpretation = () => {
    const sortedKeys = Object.keys(multiyearData).sort((a, b) => {
      const aYear = multiyearData[a].year;
      const bYear = multiyearData[b].year;
      return aYear - bYear;
    });
    
    if (sortedKeys.length < 2) return "Analyse sur une seule période - évolution non disponible.";
    
    const firstYear = multiyearData[sortedKeys[0]]?.data || {};
    const lastYear = multiyearData[sortedKeys[sortedKeys.length - 1]]?.data || {};
    
    const totalActifEvolution = (firstYear as any).total_actif ? (((lastYear as any).total_actif - (firstYear as any).total_actif) / (firstYear as any).total_actif) * 100 : 0;
    const capitauxPropresEvolution = (firstYear as any).capitaux_propres ? (((lastYear as any).capitaux_propres - (firstYear as any).capitaux_propres) / (firstYear as any).capitaux_propres) * 100 : 0;
    
    return `L'évolution du bilan montre ${totalActifEvolution >= 0 ? 'une croissance' : 'une diminution'} de ${Math.abs(totalActifEvolution).toFixed(1)}% des actifs totaux. 
    Les capitaux propres ont ${capitauxPropresEvolution >= 0 ? 'progressé' : 'diminué'} de ${Math.abs(capitauxPropresEvolution).toFixed(1)}%, 
    ${capitauxPropresEvolution >= 10 ? 'indiquant un renforcement notable de la structure financière.' : capitauxPropresEvolution >= 0 ? 'montrant une stabilité de la structure financière.' : 'nécessitant une attention particulière pour le renforcement des fonds propres.'}`;
  };

  const generateIncomeStatementInterpretation = () => {
    const sortedKeys = Object.keys(multiyearData).sort((a, b) => {
      const aYear = multiyearData[a].year;
      const bYear = multiyearData[b].year;
      return aYear - bYear;
    });
    
    if (sortedKeys.length < 2) return "Analyse sur une seule période - évolution non disponible.";
    
    const firstYear = multiyearData[sortedKeys[0]]?.data || {};
    const lastYear = multiyearData[sortedKeys[sortedKeys.length - 1]]?.data || {};
    
    const caEvolution = (firstYear as any).chiffre_affaires ? (((lastYear as any).chiffre_affaires - (firstYear as any).chiffre_affaires) / (firstYear as any).chiffre_affaires) * 100 : 0;
    const resultatNetEvolution = (firstYear as any).resultat_net ? (((lastYear as any).resultat_net - (firstYear as any).resultat_net) / (firstYear as any).resultat_net) * 100 : 0;
    
    return `Le chiffre d'affaires a ${caEvolution >= 0 ? 'progressé' : 'diminué'} de ${Math.abs(caEvolution).toFixed(1)}% sur la période. 
    Le résultat net affiche ${resultatNetEvolution >= 0 ? 'une amélioration' : 'une dégradation'} de ${Math.abs(resultatNetEvolution).toFixed(1)}%, 
    ${resultatNetEvolution >= 15 ? 'témoignant d\'une excellente performance opérationnelle.' : resultatNetEvolution >= 0 ? 'indiquant une gestion maîtrisée des coûts.' : 'nécessitant une optimisation de la structure de coûts.'}`;
  };

  const generateCashFlowInterpretation = () => {
    const sortedKeys = Object.keys(multiyearData).sort((a, b) => {
      const aYear = multiyearData[a].year;
      const bYear = multiyearData[b].year;
      return aYear - bYear;
    });
    
    if (sortedKeys.length < 2) return "Analyse sur une seule période - évolution non disponible.";
    
    const lastYear = multiyearData[sortedKeys[sortedKeys.length - 1]]?.data || {};
    const fluxOp = (lastYear as any).flux_tresorerie_activites_operationnelles || 0;
    const variation = (lastYear as any).variation_tresorerie || 0;
    
    return `Les flux de trésorerie opérationnels ${fluxOp >= 0 ? 'positifs' : 'négatifs'} de ${Math.abs(fluxOp).toLocaleString()} FCFA 
    ${fluxOp >= 0 ? 'démontrent la capacité de l\'entreprise à générer de la liquidité par son activité.' : 'indiquent des difficultés dans la génération de liquidités opérationnelles.'} 
    La variation globale de trésorerie de ${variation.toLocaleString()} FCFA ${variation >= 0 ? 'renforce la position de liquidité.' : 'nécessite une surveillance accrue de la gestion financière.'}`;
  };

  const generateRatiosAnalysis = () => {
    const sortedKeys = Object.keys(multiyearData).sort((a, b) => {
      const aYear = multiyearData[a].year;
      const bYear = multiyearData[b].year;
      return aYear - bYear;
    });

    const ratiosData = [
      {
        name: 'Rentabilité des Capitaux Propres (ROE)',
        formula: 'Résultat Net / Capitaux Propres × 100',
        norm: '≥ 15% (BCEAO)',
        unit: '%',
        key: 'roe',
        calculate: (data: any) => {
          const resultatNet = data.resultat_net || 0;
          const capitauxPropres = data.capitaux_propres || 1;
          return (resultatNet / capitauxPropres) * 100;
        }
      },
      {
        name: 'Rentabilité des Actifs (ROA)', 
        formula: 'Résultat Net / Total Actif × 100',
        norm: '≥ 5% (Sectoriel)',
        unit: '%',
        key: 'roa',
        calculate: (data: any) => {
          const resultatNet = data.resultat_net || 0;
          const totalActif = data.total_actif || 1;
          return (resultatNet / totalActif) * 100;
        }
      },
      {
        name: 'Ratio de Liquidité Générale',
        formula: 'Actif Circulant / Passif Circulant',
        norm: '≥ 1.2 (OHADA)',
        unit: '',
        key: 'ratio_liquidite_generale',
        calculate: (data: any) => {
          const actifCirculant = data.total_actif_circulant || 0;
          const passifCirculant = data.total_dettes || 1;
          return actifCirculant / passifCirculant;
        }
      },
      {
        name: 'Ratio d\'Autonomie Financière',
        formula: 'Capitaux Propres / Total Actif × 100',
        norm: '≥ 30% (Optimal)',
        unit: '%',
        key: 'ratio_autonomie_financiere',
        calculate: (data: any) => {
          const capitauxPropres = data.capitaux_propres || 0;
          const totalActif = data.total_actif || 1;
          return (capitauxPropres / totalActif) * 100;
        }
      },
      {
        name: 'Ratio d\'Endettement',
        formula: 'Total Dettes / Total Actif × 100',
        norm: '≤ 60% (BCEAO)',
        unit: '%',
        key: 'ratio_endettement',
        calculate: (data: any) => {
          const totalDettes = (data.dettes_financieres || 0) + (data.total_dettes || 0);
          const totalActif = data.total_actif || 1;
          return (totalDettes / totalActif) * 100;
        }
      }
    ];

    return `
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 11px;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="border: 1px solid #ddd; padding: 6px; text-align: left; font-weight: 600; width: 20%;">Ratio</th>
            <th style="border: 1px solid #ddd; padding: 6px; text-align: center; font-weight: 600; width: 25%;">Formule</th>
            <th style="border: 1px solid #ddd; padding: 6px; text-align: center; font-weight: 600; width: 12%;">Norme</th>
            ${sortedKeys.map(key => `<th style="border: 1px solid #ddd; padding: 6px; text-align: center; font-weight: 600; width: ${Math.floor(30/sortedKeys.length)}%;">${key}</th>`).join('')}
            ${sortedKeys.length > 1 ? '<th style="border: 1px solid #ddd; padding: 6px; text-align: center; font-weight: 600; width: 13%; color: #2c5aa0;">Évolution</th>' : ''}
          </tr>
        </thead>
        <tbody>
          ${ratiosData.map(ratio => {
            const values = sortedKeys.map(key => {
              const data = multiyearData[key]?.data || {};
              return ratio.calculate(data);
            });
            const lastValue = values[values.length - 1];
            const firstValue = values[0];
            const evolution = values.length > 1 && firstValue !== 0 ? lastValue - firstValue : 0;
            
            return `
              <tr>
                <td style="border: 1px solid #ddd; padding: 6px; font-weight: 500; font-size: 10px;">${ratio.name}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-style: italic; font-size: 10px;">${ratio.formula}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-weight: 600; color: #2c5aa0; font-size: 10px;">${ratio.norm}</td>
                ${values.map(value => {
                  const formattedValue = ratio.unit === '%' ? `${value.toFixed(1)}%` : value.toFixed(2);
                  const color = ratio.key === 'roe' && value >= 15 ? '#28a745' : 
                               ratio.key === 'roa' && value >= 5 ? '#28a745' :
                               ratio.key === 'ratio_liquidite_generale' && value >= 1.2 ? '#28a745' :
                               ratio.key === 'ratio_autonomie_financiere' && value >= 30 ? '#28a745' :
                               ratio.key === 'ratio_endettement' && value <= 60 ? '#28a745' : '#dc3545';
                  return `<td style="border: 1px solid #ddd; padding: 6px; text-align: center; color: ${color}; font-weight: 600; font-size: 10px;">${formattedValue}</td>`;
                }).join('')}
                ${values.length > 1 ? `<td style="border: 1px solid #ddd; padding: 6px; text-align: center; color: ${evolution >= 0 ? '#28a745' : '#dc3545'}; font-weight: 600; font-size: 10px;">${evolution >= 0 ? '+' : ''}${evolution.toFixed(1)}${ratio.unit === '%' ? 'pts' : ''}</td>` : ''}
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  };

  const generateYearOnYearAnalysis = () => {
    const multiyearData = state.analysisData?.multiyear_data || state.analysisData?.data?.multiyear_data || {};
    const sortedKeys = Object.keys(multiyearData).sort((a, b) => {
      const aYear = multiyearData[a].year;
      const bYear = multiyearData[b].year;
      return aYear - bYear;
    });
    
    if (sortedKeys.length < 2) {
      return '<p style="text-align: center; color: #666; font-style: italic;">Analyse d\'évolution nécessite au moins deux périodes.</p>';
    }
    
    const keyFields = [
      { key: 'chiffre_affaires', label: 'Chiffre d\'Affaires', format: 'currency' },
      { key: 'resultat_net', label: 'Résultat Net', format: 'currency' },
      { key: 'total_actif', label: 'Total Actif', format: 'currency' },
      { key: 'capitaux_propres', label: 'Capitaux Propres', format: 'currency' },
      { key: 'flux_tresorerie_activites_operationnelles', label: 'Flux Opérationnels', format: 'currency' }
    ];
    
    let analysisHtml = `
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 12px;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: 600;">Indicateur</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: 600;">Évolution</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: 600;">Variation (%)</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: 600;">Tendance</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    keyFields.forEach(field => {
      const firstYearData = multiyearData[sortedKeys[0]]?.data || {};
      const lastYearData = multiyearData[sortedKeys[sortedKeys.length - 1]]?.data || {};
      
      const firstValue = Number((firstYearData as any)[field.key]) || 0;
      const lastValue = Number((lastYearData as any)[field.key]) || 0;
      
      const variation = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
      const evolutionText = lastValue > firstValue ? 'Hausse' : lastValue < firstValue ? 'Baisse' : 'Stable';
      const trendIcon = variation > 5 ? '📈' : variation < -5 ? '📉' : '➡️';
      const trendColor = variation > 5 ? '#28a745' : variation < -5 ? '#dc3545' : '#6c757d';
      
      analysisHtml += `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px; font-weight: 500;">${field.label}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${evolutionText}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center; color: ${trendColor}; font-weight: 600;">
            ${variation >= 0 ? '+' : ''}${variation.toFixed(1)}%
          </td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-size: 16px;">${trendIcon}</td>
        </tr>
      `;
    });
    
    analysisHtml += `
        </tbody>
      </table>
    `;
    
    return analysisHtml;
  };

  const generateYearOnYearInterpretation = () => {
    const sortedKeys = Object.keys(multiyearData).sort((a, b) => {
      const aYear = multiyearData[a].year;
      const bYear = multiyearData[b].year;
      return aYear - bYear;
    });
    
    if (sortedKeys.length < 2) return "Analyse d'évolution nécessite au moins deux périodes.";
    
    const firstYearData = multiyearData[sortedKeys[0]]?.data || {};
    const lastYearData = multiyearData[sortedKeys[sortedKeys.length - 1]]?.data || {};
    
    const caEvolution = (firstYearData as any).chiffre_affaires ? 
      (((lastYearData as any).chiffre_affaires - (firstYearData as any).chiffre_affaires) / (firstYearData as any).chiffre_affaires) * 100 : 0;
    
    const resultatEvolution = (firstYearData as any).resultat_net ? 
      (((lastYearData as any).resultat_net - (firstYearData as any).resultat_net) / (firstYearData as any).resultat_net) * 100 : 0;
    
    const actifEvolution = (firstYearData as any).total_actif ? 
      (((lastYearData as any).total_actif - (firstYearData as any).total_actif) / (firstYearData as any).total_actif) * 100 : 0;
    
    return `L'analyse d'évolution sur la période révèle une ${caEvolution >= 0 ? 'croissance' : 'diminution'} du chiffre d'affaires de ${Math.abs(caEvolution).toFixed(1)}%. 
    Le résultat net affiche ${resultatEvolution >= 0 ? 'une progression' : 'une régression'} de ${Math.abs(resultatEvolution).toFixed(1)}%, 
    ${resultatEvolution >= 10 ? 'témoignant d\'une excellente performance.' : resultatEvolution >= 0 ? 'indiquant une stabilité.' : 'nécessitant des mesures correctives.'} 
    L'évolution des actifs totaux (${actifEvolution >= 0 ? '+' : ''}${actifEvolution.toFixed(1)}%) ${actifEvolution >= 5 ? 'démontre une expansion soutenue de l\'activité.' : 'reflète une consolidation des positions.'}`;
  };

  const generateRatiosInterpretation = () => {
    const sortedKeys = Object.keys(multiyearData).sort((a, b) => {
      const aYear = multiyearData[a].year;
      const bYear = multiyearData[b].year;
      return aYear - bYear;
    });
    
    if (sortedKeys.length < 2) return "Analyse sur une seule période - évolution des ratios non disponible.";
    
    const lastYear = multiyearData[sortedKeys[sortedKeys.length - 1]]?.data || {};
    const roe = (lastYear as any).resultat_net && (lastYear as any).capitaux_propres ? ((lastYear as any).resultat_net / (lastYear as any).capitaux_propres) * 100 : 0;
    const liquidite = (lastYear as any).total_actif_circulant && (lastYear as any).total_dettes ? (lastYear as any).total_actif_circulant / (lastYear as any).total_dettes : 0;
    const autonomie = (lastYear as any).capitaux_propres && (lastYear as any).total_actif ? ((lastYear as any).capitaux_propres / (lastYear as any).total_actif) * 100 : 0;
    
    return `L'analyse des ratios révèle une rentabilité des capitaux propres (ROE) de ${roe.toFixed(1)}% ${roe >= 15 ? 'conforme aux standards BCEAO' : 'inférieure aux recommandationsstandards'}. 
    Le ratio de liquidité de ${liquidite.toFixed(2)} ${liquidite >= 1.2 ? 'assure une couverture satisfaisante des dettes à court terme' : 'nécessite un renforcement de la position de liquidité'}. 
    L'autonomie financière de ${autonomie.toFixed(1)}% ${autonomie >= 30 ? 'démontre une structure financière équilibrée' : 'suggère une dépendance excessive aux financements externes'}, 
    conforme aux pratiques du secteur UEMOA.`;
  };

  const generateReportPreview = (): string => {
    // Use the same data source as the main component (not state.analysisData directly)
    const previewMultiyearData = multiyearData;
    
    console.log('ReportsPage - generateReportPreview - Using consistent multiyearData:', previewMultiyearData);
    
    // Get years from the data structure with proper filtering
    const years = Object.values(previewMultiyearData).map((d: any) => d.year).filter(year => year && !isNaN(year)).sort((a, b) => a - b);
    console.log('ReportsPage - generateReportPreview - Extracted years:', years);
    
    // Create proper period text
    const periodText = years.length > 1 ? `${years[0]} - ${years[years.length - 1]}` : years[0]?.toString() || 'Période non définie';
    console.log('ReportsPage - generateReportPreview - Period text:', periodText);
    
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #1f4e79 0%, #2c5aa0 100%); color: white; border-radius: 8px;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Rapport d'Analyse Financière</h1>
          <h2 style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">OptimusCredit - Analyse Professionnelle</h2>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Période d'analyse: ${periodText}</p>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="color: #1f4e79; border-bottom: 2px solid #2c5aa0; padding-bottom: 8px;">📊 Résumé Exécutif</h3>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #2c5aa0;">
            <p><strong>Analyse complète des états financiers</strong> selon les normes OHADA/BCEAO</p>
            <p>• <strong>Période:</strong> ${periodText} (${years.length} année${years.length > 1 ? 's' : ''})</p>
            <p>• <strong>Type d'analyse:</strong> Analyse multi-critères avec benchmarking sectoriel</p>
            <p>• <strong>Conformité:</strong> Standards UEMOA et recommandations BCEAO</p>
          </div>
        </div>

        <!-- Balance Sheet Analysis -->
        <div style="margin-bottom: 30px;">
          <h3 style="color: #1f4e79; border-bottom: 2px solid #2c5aa0; padding-bottom: 8px;">📊 Bilan - Actifs et Passifs</h3>
          ${generateFinancialTable([
            { key: 'total_actif', label: 'Total Actif' },
            { key: 'total_actif_immobilise', label: 'Actif Immobilisé' },
            { key: 'total_actif_circulant', label: 'Actif Circulant' },
            { key: 'tresorerie_actif', label: 'Trésorerie Actif' },
            { key: 'capitaux_propres', label: 'Capitaux Propres' },
            { key: 'dettes_financieres', label: 'Dettes Financières' },
            { key: 'total_dettes', label: 'Passif Circulant' }
          ])}
          <div style="background: #e8f5e8; padding: 12px; margin-top: 15px; border-radius: 6px; border-left: 4px solid #28a745;">
            <h5 style="margin: 0 0 8px 0; color: #155724;">💡 Interprétation - Structure Financière</h5>
            <p style="margin: 0; font-size: 14px;">
              ${generateBalanceSheetInterpretation()}
            </p>
          </div>
        </div>

        <!-- Income Statement Analysis -->
        <div style="margin-bottom: 30px;">
          <h3 style="color: #1f4e79; border-bottom: 2px solid #2c5aa0; padding-bottom: 8px;">📈 Compte de Résultat</h3>
          ${generateFinancialTable([
            { key: 'chiffre_affaires', label: 'Chiffre d\'Affaires' },
            { key: 'total_produits_exploitation', label: 'Total Produits d\'Exploitation' },
            { key: 'total_charges_exploitation', label: 'Total Charges d\'Exploitation' },
            { key: 'resultat_exploitation', label: 'Résultat d\'Exploitation' },
            { key: 'resultat_financier', label: 'Résultat Financier' },
            { key: 'resultat_courant', label: 'Résultat Courant' },
            { key: 'resultat_net', label: 'Résultat Net' }
          ])}
          <div style="background: #e8f5e8; padding: 12px; margin-top: 15px; border-radius: 6px; border-left: 4px solid #28a745;">
            <h5 style="margin: 0 0 8px 0; color: #155724;">💡 Interprétation - Performance</h5>
            <p style="margin: 0; font-size: 14px;">
              ${generateIncomeStatementInterpretation()}
            </p>
          </div>
        </div>

        <!-- Cash Flow Analysis -->
        <div style="margin-bottom: 30px;">
          <h3 style="color: #1f4e79; border-bottom: 2px solid #2c5aa0; padding-bottom: 8px;">💧 Tableau de Flux de Trésorerie</h3>
          ${generateFinancialTable([
            { key: 'flux_tresorerie_activites_operationnelles', label: 'Flux - Activités Opérationnelles' },
            { key: 'flux_tresorerie_activites_investissement', label: 'Flux - Activités d\'Investissement' },
            { key: 'flux_tresorerie_activites_financement', label: 'Flux - Activités de Financement' },
            { key: 'variation_tresorerie', label: 'Variation de Trésorerie' },
            { key: 'tresorerie_debut_periode', label: 'Trésorerie Début Période' },
            { key: 'tresorerie_fin_periode', label: 'Trésorerie Fin Période' }
          ])}
          <div style="background: #e8f5e8; padding: 12px; margin-top: 15px; border-radius: 6px; border-left: 4px solid #28a745;">
            <h5 style="margin: 0 0 8px 0; color: #155724;">💡 Interprétation - Flux de Trésorerie</h5>
            <p style="margin: 0; font-size: 14px;">
              ${generateCashFlowInterpretation()}
            </p>
          </div>
        </div>

        <!-- Detailed Ratios Analysis -->
        <div style="margin-bottom: 30px;">
          <h3 style="color: #1f4e79; border-bottom: 2px solid #2c5aa0; padding-bottom: 8px;">📊 Analyse Détaillée des Ratios Financiers</h3>
          ${generateRatiosAnalysis()}
          <div style="background: #e8f5e8; padding: 12px; margin-top: 15px; border-radius: 6px; border-left: 4px solid #28a745;">
            <h5 style="margin: 0 0 8px 0; color: #155724;">💡 Interprétation - Ratios Financiers</h5>
            <p style="margin: 0; font-size: 14px;">
              ${generateRatiosInterpretation()}
            </p>
          </div>
        </div>

        <!-- Year on Year Analysis -->
        <div style="margin-bottom: 30px;">
          <h3 style="color: #1f4e79; border-bottom: 2px solid #2c5aa0; padding-bottom: 8px;">📈 Analyse d'Évolution Annuelle</h3>
          ${generateYearOnYearAnalysis()}
          <div style="background: #e3f2fd; padding: 12px; margin-top: 15px; border-radius: 6px; border-left: 4px solid #2196f3;">
            <h5 style="margin: 0 0 8px 0; color: #0d47a1;">💡 Interprétation - Évolution des Performances</h5>
            <p style="margin: 0; font-size: 14px;">
              ${generateYearOnYearInterpretation()}
            </p>
          </div>
        </div>

        ${includeRecommendations ? `
        <div style="margin-bottom: 25px;">
          <h3 style="color: #1f4e79; border-bottom: 2px solid #2c5aa0; padding-bottom: 8px;">💡 Recommandations Stratégiques</h3>
          <div style="background: #e8f5e8; padding: 15px; border-radius: 6px; border-left: 4px solid #28a745;">
            <h4 style="margin: 0 0 10px 0; color: #155724;">Points Forts Identifiés</h4>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Structure financière équilibrée selon les normes OHADA</li>
              <li>Respect des ratios prudentiels BCEAO</li>
              <li>Évolution positive des indicateurs de performance</li>
            </ul>
          </div>
          <div style="background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin-top: 10px;">
            <h4 style="margin: 0 0 10px 0; color: #856404;">Axes d'Amélioration</h4>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Optimisation de la gestion de trésorerie</li>
              <li>Renforcement de la structure de financement</li>
              <li>Amélioration de l'efficacité opérationnelle</li>
            </ul>
          </div>
        </div>
        ` : ''}

        <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 6px;">
          <p style="margin: 0; font-size: 12px; color: #666;">
            Rapport généré par <strong>OptimusCredit</strong> - Solution d'analyse financière conforme aux standards OHADA/BCEAO
          </p>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">
            © ${new Date().getFullYear()} - Analyse professionnelle pour la région UEMOA
          </p>
        </div>
      </div>
    `;
  };

  const handleDownload = () => {
    if (generatedReport) {
      alert(`Téléchargement de ${generatedReport} en cours...`);
    }
  };

  // Use the same comprehensive data loading logic as AnalysisPage
  let analysisData = state.analysisData;
  let multiyearData: any = {};
  
  // Try to load from the new workflow data first (same as AnalysisPage)
  const collectedDataStr = localStorage.getItem('optimus_collected_data');
  console.log('ReportsPage - collectedDataStr:', collectedDataStr);
  
  if (collectedDataStr) {
    const collectedData = JSON.parse(collectedDataStr);
    console.log('ReportsPage - parsed collectedData:', collectedData);
    
    // Use the pre-transformed multiyear_data if available
    if (collectedData.multiyear_data) {
      multiyearData = collectedData.multiyear_data;
      console.log('ReportsPage - using pre-transformed multiyear_data:', multiyearData);
    }
    
    // Create analysis data structure with calculated data
    analysisData = {
      multiyear_data: multiyearData,
      score: collectedData.score,
      insights: collectedData.insights || [],
      recommendations: collectedData.recommendations || []
    };
  }
  
  // Fallback to old data structure
  if (!analysisData || Object.keys(multiyearData).length === 0) {
    if (state.analysisData) {
      analysisData = state.analysisData;
      multiyearData = analysisData.multiyear_data || analysisData.data?.multiyear_data || {};
    }
  }

  if (!analysisData || Object.keys(multiyearData).length === 0) {
    return <Typography>Aucune donnée disponible pour générer un rapport</Typography>;
  }
  
  // Debug the period calculation for the sidebar
  console.log('ReportsPage - Sidebar - Final multiyearData:', multiyearData);
  console.log('ReportsPage - Sidebar - MultiyearData keys:', Object.keys(multiyearData));
  console.log('ReportsPage - Sidebar - MultiyearData structure:', JSON.stringify(multiyearData, null, 2));
  
  const years = Object.values(multiyearData).map((d: any) => d.year).filter(year => year && !isNaN(year)).sort((a, b) => a - b);
  console.log('ReportsPage - Sidebar - Extracted years:', years);
  
  const periodText = years.length > 1 ? `${years[0]} - ${years[years.length - 1]}` : years[0]?.toString() || 'Période non définie';
  console.log('ReportsPage - Sidebar - Final period text:', periodText);

  return (
    <Box>
      {/* Header with Navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Génération de Rapports
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => onNavigate('analysis')}
          sx={{ 
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.50',
              borderColor: 'primary.main',
            }
          }}
        >
          Retour à l'Analyse
        </Button>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {/* Report Configuration */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <SettingsIcon sx={{ mr: 1 }} />
                Configuration du Rapport
              </Typography>
              
              <Grid container spacing={3}>
                {/* Format Selection */}
                <Grid item xs={12} sm={6}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
                      Format du rapport
                    </FormLabel>
                    <RadioGroup
                      value={reportFormat}
                      onChange={(e) => setReportFormat(e.target.value as 'pdf' | 'excel')}
                    >
                      <FormControlLabel
                        value="pdf"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PdfIcon sx={{ mr: 1, color: 'error.main' }} />
                            Rapport PDF
                          </Box>
                        }
                      />
                      <FormControlLabel
                        value="excel"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ExcelIcon sx={{ mr: 1, color: 'success.main' }} />
                            Export Excel
                          </Box>
                        }
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>


                {/* Options */}
                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
                      Contenu du rapport
                    </FormLabel>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={includeCharts}
                            onChange={(e) => setIncludeCharts(e.target.checked)}
                          />
                        }
                        label="Inclure les graphiques et visualisations"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={includeRecommendations}
                            onChange={(e) => setIncludeRecommendations(e.target.checked)}
                          />
                        }
                        label="Inclure les recommandations stratégiques"
                      />
                    </FormGroup>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Generation Progress */}
          {isGenerating && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Génération en cours...
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={generationProgress}
                  sx={{ height: 8, borderRadius: 4, mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {generationProgress.toFixed(0)}% - Préparation du rapport {reportFormat.toUpperCase()}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Generated Report */}
          {generatedReport && !isGenerating && (
            <Alert
              severity="success"
              icon={<CheckIcon />}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={handleDownload}
                  startIcon={<DownloadIcon />}
                >
                  Télécharger
                </Button>
              }
              sx={{ mb: 4 }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Rapport généré avec succès !
              </Typography>
              <Typography variant="body2">
                <strong>{generatedReport}</strong> est prêt à être téléchargé.
              </Typography>
            </Alert>
          )}

          {/* Generate Preview Button */}
          {!showPreview && (
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleGeneratePreview}
                disabled={isGenerating}
                sx={{ px: 4, py: 1.5 }}
                startIcon={isGenerating ? <CircularProgress size={20} /> : <VisibilityIcon />}
              >
                {isGenerating
                  ? 'Génération en cours...'
                  : 'Prévisualiser le Rapport'
                }
              </Button>
            </Box>
          )}
          
          {/* Modify/Download Buttons for Preview */}
          {showPreview && (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => { setShowPreview(false); setReportPreview(null); }}
                startIcon={<EditIcon />}
                sx={{ px: 4, py: 1.5 }}
              >
                Modifier
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={handleDownloadReport}
                disabled={isGenerating}
                startIcon={isGenerating ? <CircularProgress size={20} /> : <DownloadIcon />}
                sx={{ px: 4, py: 1.5 }}
              >
                {isGenerating ? 'Téléchargement...' : `Télécharger ${reportFormat.toUpperCase()}`}
              </Button>
            </Box>
          )}

          {/* Report Preview */}
          {showPreview && reportPreview && (
            <Card sx={{ mt: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VisibilityIcon />
                  Prévisualisation du Rapport
                </Typography>
                
                <Paper 
                  elevation={0} 
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    maxHeight: '600px',
                    overflow: 'auto',
                    bgcolor: '#fafafa',
                    p: 3
                  }}
                >
                  <div dangerouslySetInnerHTML={{ __html: reportPreview }} />
                </Paper>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Report Preview */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📋 Aperçu du Rapport
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Période d'analyse
                </Typography>
                <Chip label={periodText} color="primary" variant="outlined" />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Sections incluses :
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  ✅ Résumé Exécutif
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  ✅ Analyse du Bilan
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  ✅ Compte de Résultat
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  ✅ Ratios Détaillés
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  ✅ Analyse d'Évolution Annuelle
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  ✅ Comparaison Sectorielle
                </Typography>
                {includeRecommendations && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    ✅ Recommandations
                  </Typography>
                )}
                {includeCharts && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    ✅ Graphiques & Visualisations
                  </Typography>
                )}
                <Typography variant="body2" sx={{ mb: 1 }}>
                  ✅ Conclusion
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Report Types */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Types de Rapports
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PdfIcon sx={{ color: 'error.main', mr: 1 }} />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Rapport PDF
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Rapport complet avec mise en page professionnelle, 
                  graphiques intégrés et recommandations détaillées.
                </Typography>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ExcelIcon sx={{ color: 'success.main', mr: 1 }} />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Export Excel
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Données structurées en feuilles de calcul pour 
                  analyse personnalisée et manipulation des données.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};