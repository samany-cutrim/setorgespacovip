import { useState, createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  user: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    if (email === 'admin@setorgespacovip.com.br' && password === 'Jully021431') {
      setUser(email);
      setIsAdmin(true);
      setIsLoading(false);
      return { error: null };
    } else {
      setIsLoading(false);
      return { error: new Error('Email ou senha incorretos') };
    }
  };

  const signOut = async () => {
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
