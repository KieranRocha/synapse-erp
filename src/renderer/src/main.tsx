// main.tsx
import './assets/main.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, useRoutes } from 'react-router-dom'
import { routes } from './app/routing/routes'   // <-- updated path
import { AuthProvider } from './shared/contexts/AuthContext'

function AppRoutes() {
  return useRoutes(routes);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  </StrictMode>
);
