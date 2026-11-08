import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts';
import { clearLegacyLocalStorage } from './services/storage';
import './index.css';
import App from './App.tsx';

// Limpia cualquier residuo de tareas o sesión local previa para garantizar solo persistencia en la nube
clearLegacyLocalStorage();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
