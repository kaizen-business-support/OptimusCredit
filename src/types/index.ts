// Financial Analysis Types
export interface FinancialData {
  [key: string]: number | string;
}

export interface YearData {
  year: number;
  period: string;
  data: FinancialData;
}

export interface MultiyearData {
  [yearKey: string]: {
    year: number;
    data: FinancialData;
    ratios?: FinancialRatios;
  };
}

export interface FinancialRatios {
  // Profitability ratios
  roe?: number; // Return on Equity
  roa?: number; // Return on Assets
  net_profit_margin?: number;
  gross_profit_margin?: number;
  
  // Liquidity ratios
  ratio_liquidite_generale?: number;
  ratio_liquidite_reduite?: number;
  ratio_liquidite_immediate?: number;
  
  // Leverage ratios
  ratio_endettement?: number;
  ratio_autonomie_financiere?: number;
  ratio_couverture_dettes?: number;
  
  // Efficiency ratios
  rotation_actif?: number;
  rotation_stocks?: number;
  delai_recouvrement?: number;
  
  // Additional ratios
  [key: string]: number | undefined;
}

export interface AnalysisData {
  multiyear_data?: MultiyearData;
  data?: {
    multiyear_data?: MultiyearData;
  };
  score?: AnalysisScore;
  insights?: AnalysisInsight[];
  recommendations?: Recommendation[];
}

export interface AnalysisScore {
  overall: number;
  profitability: number;
  liquidity: number;
  leverage: number;
  efficiency: number;
  trend: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

export interface AnalysisInsight {
  category: 'profitability' | 'liquidity' | 'leverage' | 'efficiency' | 'trend';
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  recommendation?: string;
}

export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  expected_impact: string;
  timeframe: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
}

// Table and Display Types
export interface FinancialTableRow {
  label: string;
  [year: string]: string | number;
}

export interface ChartData {
  name: string;
  value: number;
  year?: string | number;
  category?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// File Upload Types
export interface FileUploadResult {
  success: boolean;
  data?: AnalysisData;
  error?: string;
  filename?: string;
}

// Navigation Types
export type PageType = 'home' | 'configuration' | 'data-input' | 'upload' | 'manual-input' | 'analysis' | 'reports' | 'settings' | 'documentation';

// Report Types
export interface ReportData {
  analysis: AnalysisData;
  period: string;
  generated_at: string;
  type: 'pdf' | 'excel';
}

// BCEAO Norms Types
export interface BceaoNorms {
  [ratioKey: string]: {
    min?: number;
    max?: number;
    optimal?: number;
    unit: string;
    description: string;
  };
}

// Sectoral Norms Types
export interface SectoralNorms {
  [sector: string]: {
    [ratioKey: string]: {
      median: number;
      q1: number;
      q3: number;
      unit: string;
    };
  };
}

// UI State Types
export interface UIState {
  currentPage: PageType;
  isLoading: boolean;
  error: string | null;
  theme: 'light' | 'dark';
}

// Form Types
export interface ManualInputForm {
  year: number;
  period: string;
  data: FinancialData;
}

// Export Types
export interface ExportOptions {
  format: 'pdf' | 'excel';
  includeCharts: boolean;
  includeRecommendations: boolean;
  language: 'fr' | 'en';
}