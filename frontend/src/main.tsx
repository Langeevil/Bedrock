import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import {
  applyTheme,
  getStoredThemePreference,
  subscribeToSystemThemeChanges,
} from "./shared/theme";

applyTheme(getStoredThemePreference());
subscribeToSystemThemeChanges(() => {
  applyTheme(getStoredThemePreference());
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
