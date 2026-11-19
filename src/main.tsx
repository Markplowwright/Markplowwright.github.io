import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { startLinkTracking } from './os/track';
import './styles/base.css';
import './styles/desktop.css';
import './styles/apps.css';

startLinkTracking();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
