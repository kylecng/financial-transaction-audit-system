import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios'; // Import axios
import './globals.css'; // Import Tailwind's base styles
import App from './App.tsx';

// Set the base URL for all axios requests
axios.defaults.baseURL = 'http://localhost:3001';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
