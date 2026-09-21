import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './lib/auth.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PWAUpdatePrompt } from './components/PWAUpdatePrompt';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <ErrorBoundary>
        <PWAUpdatePrompt />
      </ErrorBoundary>
    </AuthProvider>
  </StrictMode>
);
