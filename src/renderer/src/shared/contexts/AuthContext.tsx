import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

  useEffect(() => {
    checkExistingAuth();
  }, []);

  const checkExistingAuth = () => {
    try {
      const storedUser = localStorage.getItem('auth-user');
      const storedToken = localStorage.getItem('auth-token');
      
      if (storedUser && storedToken) {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });
        
        // Notifica o processo principal que o usuário está logado
        window.electronAPI?.notifyAuthState?.(true);
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
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
      
      // Simulação de autenticação (substituir por API real)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock de validação simples
      if (email && password.length >= 6) {
        const user: User = {
          id: '1',
          name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
          email,
          role: 'admin'
        };

        const token = `mock-token-${Date.now()}`;
        
        // Salva no localStorage
        localStorage.setItem('auth-user', JSON.stringify(user));
        localStorage.setItem('auth-token', token);
        
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });

        // Notifica o processo principal sobre o login
        window.electronAPI?.notifyAuthState?.(true);
        
      } else {
        throw new Error('Credenciais inválidas');
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = () => {
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
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
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