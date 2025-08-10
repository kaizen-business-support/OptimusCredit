import axios, { AxiosResponse } from 'axios';
import { AnalysisData, FileUploadResult, ApiResponse } from '../types';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Service Methods
export class ApiService {
  // File Upload and Processing
  static async uploadExcelFile(file: File): Promise<FileUploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response: AxiosResponse<ApiResponse<AnalysisData>> = await api.post(
        '/upload/excel',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return {
        success: response.data.success,
        data: response.data.data,
        filename: file.name,
        error: response.data.error,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du téléchargement du fichier',
      };
    }
  }

  // Manual Data Processing
  static async processManualData(data: any): Promise<ApiResponse<AnalysisData>> {
    try {
      const response: AxiosResponse<ApiResponse<AnalysisData>> = await api.post(
        '/analysis/manual',
        data
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du traitement des données',
      };
    }
  }

  // Get Analysis Results
  static async getAnalysis(analysisId: string): Promise<ApiResponse<AnalysisData>> {
    try {
      const response: AxiosResponse<ApiResponse<AnalysisData>> = await api.get(
        `/analysis/${analysisId}`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la récupération de l\'analyse',
      };
    }
  }

  // Generate Reports
  static async generateReport(
    analysisData: AnalysisData,
    options: {
      format: 'pdf' | 'excel';
      includeCharts: boolean;
      includeRecommendations: boolean;
      language: 'fr' | 'en';
    }
  ): Promise<ApiResponse<{ downloadUrl: string; filename: string }>> {
    try {
      const response = await api.post('/reports/generate', {
        analysisData,
        options,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la génération du rapport',
      };
    }
  }

  // Download Report
  static async downloadReport(downloadUrl: string): Promise<Blob> {
    try {
      const response = await api.get(downloadUrl, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      throw new Error('Erreur lors du téléchargement du rapport');
    }
  }

  // Get BCEAO Norms
  static async getBceaoNorms(): Promise<ApiResponse<any>> {
    try {
      const response = await api.get('/norms/bceao');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la récupération des normes BCEAO',
      };
    }
  }

  // Get Sectoral Norms
  static async getSectoralNorms(sector: string): Promise<ApiResponse<any>> {
    try {
      const response = await api.get(`/norms/sectoral/${sector}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la récupération des normes sectorielles',
      };
    }
  }

  // Validate Financial Data
  static async validateData(data: any): Promise<ApiResponse<{ isValid: boolean; errors: string[] }>> {
    try {
      const response = await api.post('/validation/financial', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la validation des données',
      };
    }
  }

  // Get Template File
  static async getTemplateFile(): Promise<Blob> {
    try {
      const response = await api.get('/templates/excel', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      throw new Error('Erreur lors du téléchargement du template');
    }
  }

  // Health Check
  static async healthCheck(): Promise<ApiResponse<{ status: string; version: string }>> {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: 'Service indisponible',
      };
    }
  }
}

// Utility function to handle API errors
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error status
    return error.response.data?.message || `Erreur serveur: ${error.response.status}`;
  } else if (error.request) {
    // Request made but no response received
    return 'Erreur de connexion au serveur';
  } else {
    // Something else happened
    return error.message || 'Erreur inconnue';
  }
};

export default api;