import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnalysisData, PageType, UIState } from '../types';
import { ApiService } from '../services/api';

// State interface
interface AppState {
  // Analysis data
  analysisData: AnalysisData | null;
  analysisId: string | null;
  
  // UI state
  currentPage: PageType;
  isLoading: boolean;
  error: string | null;
  
  // User preferences
  theme: 'light' | 'dark';
  language: 'fr' | 'en';
  sector: string;
  
  // Cache
  bceaoNorms: any | null;
  sectoralNorms: any | null;
  
  // Session management
  sessionId: string | null;
  lastActivity: Date | null;
}

// Action types
type AppAction = 
  | { type: 'SET_ANALYSIS_DATA'; payload: AnalysisData | null }
  | { type: 'SET_ANALYSIS_ID'; payload: string | null }
  | { type: 'SET_CURRENT_PAGE'; payload: PageType }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_LANGUAGE'; payload: 'fr' | 'en' }
  | { type: 'SET_SECTOR'; payload: string }
  | { type: 'SET_BCEAO_NORMS'; payload: any }
  | { type: 'SET_SECTORAL_NORMS'; payload: any }
  | { type: 'SET_SESSION_ID'; payload: string }
  | { type: 'UPDATE_ACTIVITY' }
  | { type: 'CLEAR_SESSION' }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: AppState = {
  analysisData: null,
  analysisId: null,
  currentPage: 'home',
  isLoading: false,
  error: null,
  theme: 'light',
  language: 'fr',
  sector: 'general',
  bceaoNorms: null,
  sectoralNorms: null,
  sessionId: null,
  lastActivity: null,
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_ANALYSIS_DATA':
      return {
        ...state,
        analysisData: action.payload,
        error: null,
        lastActivity: new Date(),
      };
    
    case 'SET_ANALYSIS_ID':
      return {
        ...state,
        analysisId: action.payload,
        lastActivity: new Date(),
      };
    
    case 'SET_CURRENT_PAGE':
      return {
        ...state,
        currentPage: action.payload,
        error: null,
        lastActivity: new Date(),
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };
    
    case 'SET_LANGUAGE':
      return {
        ...state,
        language: action.payload,
      };
    
    case 'SET_SECTOR':
      return {
        ...state,
        sector: action.payload,
      };
    
    case 'SET_BCEAO_NORMS':
      return {
        ...state,
        bceaoNorms: action.payload,
      };
    
    case 'SET_SECTORAL_NORMS':
      return {
        ...state,
        sectoralNorms: action.payload,
      };
    
    case 'SET_SESSION_ID':
      return {
        ...state,
        sessionId: action.payload,
        lastActivity: new Date(),
      };
    
    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        lastActivity: new Date(),
      };
    
    case 'CLEAR_SESSION':
      return {
        ...state,
        analysisData: null,
        analysisId: null,
        sessionId: null,
        lastActivity: null,
        error: null,
      };
    
    case 'RESET_STATE':
      return {
        ...initialState,
        theme: state.theme,
        language: state.language,
        sector: state.sector,
      };
    
    default:
      return state;
  }
};

// Context interface
interface AppContextType {
  state: AppState;
  
  // Analysis actions
  setAnalysisData: (data: AnalysisData | null) => void;
  loadAnalysis: (analysisId: string) => Promise<void>;
  clearAnalysis: () => void;
  
  // Navigation actions
  navigateTo: (page: PageType) => void;
  
  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Settings actions
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'fr' | 'en') => void;
  setSector: (sector: string) => void;
  
  // Data loading actions
  loadBceaoNorms: () => Promise<void>;
  loadSectoralNorms: (sector: string) => Promise<void>;
  
  // Session management
  initializeSession: () => void;
  refreshSession: () => void;
  clearSession: () => void;
  resetSession: () => void;
  
  // Utilities
  hasAnalysisData: () => boolean;
  getAnalysisMetadata: () => any;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const navigate = useNavigate();
  const location = useLocation();

  // Load saved state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('optimus_app_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.theme) dispatch({ type: 'SET_THEME', payload: parsed.theme });
        if (parsed.language) dispatch({ type: 'SET_LANGUAGE', payload: parsed.language });
        if (parsed.sector) dispatch({ type: 'SET_SECTOR', payload: parsed.sector });
        if (parsed.sessionId) dispatch({ type: 'SET_SESSION_ID', payload: parsed.sessionId });
      } catch (error) {
        console.warn('Failed to load saved state:', error);
      }
    }
    
    // Initialize session
    initializeSession();
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    const stateToSave = {
      theme: state.theme,
      language: state.language,
      sector: state.sector,
      sessionId: state.sessionId,
    };
    localStorage.setItem('optimus_app_state', JSON.stringify(stateToSave));
  }, [state.theme, state.language, state.sector, state.sessionId]);

  // Auto-save analysis data
  useEffect(() => {
    if (state.analysisData) {
      localStorage.setItem('optimus_analysis_data', JSON.stringify(state.analysisData));
    } else {
      localStorage.removeItem('optimus_analysis_data');
    }
  }, [state.analysisData]);

  // Session timeout management
  useEffect(() => {
    if (state.lastActivity) {
      const timeout = setTimeout(() => {
        const now = new Date();
        const timeDiff = now.getTime() - state.lastActivity!.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        if (hoursDiff > 2) { // 2 hours timeout
          clearSession();
        }
      }, 60000); // Check every minute

      return () => clearTimeout(timeout);
    }
  }, [state.lastActivity]);

  // Sync current page with URL
  useEffect(() => {
    const pathToPageMap: Record<string, PageType> = {
      '/': 'home',
      '/configuration': 'configuration',
      '/data-input': 'data-input',
      '/upload': 'upload',
      '/manual-input': 'manual-input',
      '/analysis': 'analysis',
      '/reports': 'reports',
      '/settings': 'settings',
      '/documentation': 'documentation'
    };
    
    const currentPageFromUrl = pathToPageMap[location.pathname];
    if (currentPageFromUrl && currentPageFromUrl !== state.currentPage) {
      dispatch({ type: 'SET_CURRENT_PAGE', payload: currentPageFromUrl });
    }
  }, [location.pathname, state.currentPage]);

  // Analysis actions
  const setAnalysisData = (data: AnalysisData | null) => {
    dispatch({ type: 'SET_ANALYSIS_DATA', payload: data });
  };

  const loadAnalysis = async (analysisId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await ApiService.getAnalysis(analysisId);
      if (response.success && response.data) {
        dispatch({ type: 'SET_ANALYSIS_DATA', payload: response.data });
        dispatch({ type: 'SET_ANALYSIS_ID', payload: analysisId });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to load analysis' });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to load analysis' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearAnalysis = () => {
    dispatch({ type: 'SET_ANALYSIS_DATA', payload: null });
    dispatch({ type: 'SET_ANALYSIS_ID', payload: null });
    localStorage.removeItem('optimus_analysis_data');
  };

  // Navigation actions
  const navigateTo = (page: PageType) => {
    dispatch({ type: 'SET_CURRENT_PAGE', payload: page });
    dispatch({ type: 'UPDATE_ACTIVITY' });
    
    // Map page types to routes
    const routeMap: Record<PageType, string> = {
      'home': '/',
      'configuration': '/configuration',
      'data-input': '/data-input',
      'upload': '/upload',
      'manual-input': '/manual-input',
      'analysis': '/analysis',
      'reports': '/reports',
      'settings': '/settings',
      'documentation': '/documentation'
    };
    
    const route = routeMap[page];
    if (route && location.pathname !== route) {
      navigate(route);
    }
  };

  // UI actions
  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  // Settings actions
  const setTheme = (theme: 'light' | 'dark') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const setLanguage = (language: 'fr' | 'en') => {
    dispatch({ type: 'SET_LANGUAGE', payload: language });
  };

  const setSector = (sector: string) => {
    dispatch({ type: 'SET_SECTOR', payload: sector });
    // Clear sectoral norms when sector changes
    dispatch({ type: 'SET_SECTORAL_NORMS', payload: null });
  };

  // Data loading actions
  const loadBceaoNorms = async () => {
    if (state.bceaoNorms) return; // Already loaded

    try {
      const response = await ApiService.getBceaoNorms();
      if (response.success && response.data) {
        dispatch({ type: 'SET_BCEAO_NORMS', payload: response.data });
      }
    } catch (error) {
      console.warn('Failed to load BCEAO norms:', error);
    }
  };

  const loadSectoralNorms = async (sector: string) => {
    if (state.sectoralNorms && state.sector === sector) return; // Already loaded for this sector

    try {
      const response = await ApiService.getSectoralNorms(sector);
      if (response.success && response.data) {
        dispatch({ type: 'SET_SECTORAL_NORMS', payload: response.data });
      }
    } catch (error) {
      console.warn('Failed to load sectoral norms:', error);
    }
  };

  // Session management
  const initializeSession = () => {
    const sessionId = generateSessionId();
    dispatch({ type: 'SET_SESSION_ID', payload: sessionId });
    
    // Try to restore analysis data from localStorage
    const savedAnalysis = localStorage.getItem('optimus_analysis_data');
    if (savedAnalysis) {
      try {
        const parsed = JSON.parse(savedAnalysis);
        dispatch({ type: 'SET_ANALYSIS_DATA', payload: parsed });
      } catch (error) {
        console.warn('Failed to restore analysis data:', error);
        localStorage.removeItem('optimus_analysis_data');
      }
    }
  };

  const refreshSession = () => {
    dispatch({ type: 'UPDATE_ACTIVITY' });
  };

  const clearSession = () => {
    dispatch({ type: 'CLEAR_SESSION' });
    localStorage.removeItem('optimus_analysis_data');
    localStorage.removeItem('optimus_app_state');
  };

  const resetSession = () => {
    // Clear all application data and localStorage
    dispatch({ type: 'RESET_STATE' });
    localStorage.removeItem('optimus_analysis_data');
    localStorage.removeItem('optimus_app_state');
    localStorage.removeItem('optimus_analysis_config');
    localStorage.removeItem('optimus_collected_data');
    
    // Navigate back to home page
    navigateTo('home');
  };

  // Utilities
  const hasAnalysisData = (): boolean => {
    return state.analysisData !== null;
  };

  const getAnalysisMetadata = () => {
    if (!state.analysisData) return null;
    
    const multiyearData = state.analysisData.multiyear_data || state.analysisData.data?.multiyear_data || {};
    const years = Object.values(multiyearData).map((d: any) => d.year).sort();
    
    return {
      years,
      yearCount: years.length,
      latestYear: years[years.length - 1],
      oldestYear: years[0],
      period: years.length > 1 ? `${years[0]}-${years[years.length - 1]}` : years[0]?.toString(),
      sector: state.sector,
      lastUpdated: state.lastActivity,
    };
  };

  // Helper function to generate session ID
  const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const contextValue: AppContextType = {
    state,
    setAnalysisData,
    loadAnalysis,
    clearAnalysis,
    navigateTo,
    setLoading,
    setError,
    clearError,
    setTheme,
    setLanguage,
    setSector,
    loadBceaoNorms,
    loadSectoralNorms,
    initializeSession,
    refreshSession,
    clearSession,
    resetSession,
    hasAnalysisData,
    getAnalysisMetadata,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Export context and types
export { AppContext };
export type { AppState, AppAction, AppContextType };