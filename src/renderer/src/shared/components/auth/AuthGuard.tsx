import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2Icon } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          <Loader2Icon className='w-6 h-6 animate-spin' />
        </div>
      </div>
    );
  }

  // Se não autenticado, redirecionar para login
  if (!isAuthenticated) {
    return fallback ? <>{fallback}</> : <Navigate to="/auth/login" replace />;
  }

  // Se autenticado, renderizar children
  return <>{children}</>;
}

// Componente para proteger rotas que precisam estar deslogadas (como login)
export function GuestGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          <Loader2Icon className='w-6 h-6 animate-spin' />
        </div>
      </div>
    );
  }

  // Se já autenticado, redirecionar para dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Se não autenticado, renderizar children (página de login)
  return <>{children}</>;
}