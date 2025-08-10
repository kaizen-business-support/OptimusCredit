import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { AppProvider, useApp } from './contexts/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { HomePage } from './pages/HomePage';
import { UploadPage } from './pages/UploadPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import ManualInputPage from './pages/ManualInputPage';
import DocumentationPage from './pages/DocumentationPage';
import ConfigurationPage from './pages/ConfigurationPage';
import DataInputPage from './pages/DataInputPage';
import { ErrorBoundary } from './components/ErrorBoundary';

// Main App component with context
const AppContent: React.FC = () => {
  const { state, navigateTo, hasAnalysisData, resetSession } = useApp();
  const [sidebarOpen, setSidebarOpen] = React.useState(true); // Start open on desktop
  const [showResetDialog, setShowResetDialog] = React.useState(false);

  const handlePageChange = (page: any) => {
    navigateTo(page);
    // Only close sidebar on mobile after navigation
    if (window.innerWidth < 900) {
      setSidebarOpen(false);
    }
  };

  const handleResetClick = () => {
    setShowResetDialog(true);
  };

  const handleResetConfirm = () => {
    resetSession();
    setShowResetDialog(false);
  };

  const handleResetCancel = () => {
    setShowResetDialog(false);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        currentPage={state.currentPage}
        onReset={handleResetClick}
      />
      
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPage={state.currentPage}
        onPageChange={handlePageChange}
        hasAnalysisData={hasAnalysisData()}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          pt: { xs: 7, sm: 8 },
          pl: { xs: 0, md: sidebarOpen ? '240px' : 0 },
          transition: 'padding-left 0.3s ease',
          height: '100vh',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Container 
          maxWidth="xl" 
          sx={{ 
            py: 3, 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'visible',
          }}
        >
          <ErrorBoundary>
            <Routes>
              <Route 
                path="/" 
                element={<HomePage onNavigate={handlePageChange} />} 
              />
              <Route 
                path="/configuration" 
                element={<ConfigurationPage onNavigate={handlePageChange} />} 
              />
              <Route 
                path="/data-input" 
                element={<DataInputPage onNavigate={handlePageChange} />} 
              />
              <Route 
                path="/upload" 
                element={<UploadPage onNavigate={handlePageChange} />} 
              />
              <Route 
                path="/manual-input" 
                element={<ManualInputPage onNavigate={handlePageChange} />} 
              />
              <Route 
                path="/analysis" 
                element={
                  hasAnalysisData() ? (
                    <AnalysisPage onNavigate={handlePageChange} />
                  ) : (
                    <Navigate to="/upload" replace />
                  )
                } 
              />
              <Route 
                path="/reports" 
                element={
                  hasAnalysisData() ? (
                    <ReportsPage onNavigate={handlePageChange} />
                  ) : (
                    <Navigate to="/upload" replace />
                  )
                } 
              />
              <Route 
                path="/settings" 
                element={<SettingsPage onNavigate={handlePageChange} />} 
              />
              <Route 
                path="/documentation" 
                element={<DocumentationPage onNavigate={handlePageChange} />} 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </Container>
      </Box>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onClose={handleResetCancel}>
        <DialogTitle>Réinitialiser la session</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Êtes-vous sûr de vouloir réinitialiser votre session ?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cette action supprimera toutes les données d'analyse, configurations et fichiers uploadés. 
            Vous serez redirigé vers la page d'accueil.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetCancel}>
            Annuler
          </Button>
          <Button onClick={handleResetConfirm} variant="contained" color="warning">
            Réinitialiser
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;