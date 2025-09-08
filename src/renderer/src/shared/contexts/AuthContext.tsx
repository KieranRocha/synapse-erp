import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fromUnknown, emitToastForError } from '../errors/adapter';
import { useToast } from '../hooks/useToast';

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });
  
  const toast = useToast();

  useEffect(() => {
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      const storedToken = localStorage.getItem('auth-token');
      
      if (storedToken && window.electronAPI?.validate) {
        // Valida o token no backend
        const user = await window.electronAPI.validate(storedToken);
        
        if (user) {
          const formattedUser: User = {
            id: user.id,
            name: user.nome,
            email: user.email,
            role: user.cargo || 'user'
          };

          localStorage.setItem('auth-user', JSON.stringify(formattedUser));
          
          setAuthState({
            user: formattedUser,
            isLoading: false,
            isAuthenticated: true,
          });
          
          // Notifica o processo principal que o usuário está logado
          window.electronAPI?.notifyAuthState?.(true);
        } else {
          // Token inválido, limpa storage
          localStorage.removeItem('auth-user');
          localStorage.removeItem('auth-token');
          
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      
      // Trata erro de forma centralizada
      const appError = fromUnknown(error);
      if (appError.severity === 'error') {
        emitToastForError(toast, appError);
      }
      
      // Em caso de erro, limpa storage
      localStorage.removeItem('auth-user');
      localStorage.removeItem('auth-token');
      
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Verifica se a API de autenticação está disponível
      if (!window.electronAPI?.login) {
        const apiError = new Error('AUTH_API_UNAVAILABLE');
        apiError.name = 'AUTH_API_UNAVAILABLE';
        throw apiError;
      }

      const result = await window.electronAPI.login(email, password);
      
      const user: User = {
        id: result.user.id,
        name: result.user.nome,
        email: result.user.email,
        role: result.user.cargo || 'user'
      };

      // Salva no localStorage
      localStorage.setItem('auth-user', JSON.stringify(user));
      localStorage.setItem('auth-token', result.token);
      
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });

      // Notifica o processo principal sobre o login
      window.electronAPI?.notifyAuthState?.(true);
        
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      // Processa e relança o erro para que o componente possa lidar com ele
      const appError = fromUnknown(error);
      console.error('Login failed:', appError);
      
      // Rejeita com o erro processado para manter compatibilidade
      throw appError;
    }
  };

  const logout = async () => {
    try {
      // Chama a API de logout se disponível
      if (window.electronAPI?.logout) {
        await window.electronAPI.logout();
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Remove do localStorage
      localStorage.removeItem('auth-user');
      localStorage.removeItem('auth-token');
      localStorage.removeItem('erp-auth-email'); // Remove também o email salvo
      
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });

      // Notifica o processo principal sobre o logout
      window.electronAPI?.notifyAuthState?.(false);
    }
  };

  const getToken = (): string | null => {
    return localStorage.getItem('auth-token');
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      getToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}