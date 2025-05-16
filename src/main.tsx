import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize theme based on system preference or saved preference
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(theme);
  localStorage.setItem('theme', theme);
};

initializeTheme();

createRoot(document.getElementById("root")!).render(<App />);
