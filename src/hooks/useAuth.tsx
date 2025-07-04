
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

// Definir tipos para o usuário
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'business';
  tubecoins: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  usageHistory: {
    date: string;
    feature: string;
    coinsSpent: number;
  }[];
}

// Definir tipo para o contexto de autenticação
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  isLoading: boolean;
  earnCoins: (amount: number, reason: string) => void;
  spendCoins: (amount: number, feature: string) => boolean;
  earnExperience: (amount: number) => void;
}

// Criar contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Calcular experiência necessária para o próximo nível
const calculateExperienceForLevel = (level: number) => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Provedor do contexto
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('tubepro_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Função para ganhar Tubecoins
  const earnCoins = (amount: number, reason: string) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      tubecoins: user.tubecoins + amount
    };

    localStorage.setItem('tubepro_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    toast.success(`+${amount} Tubecoins: ${reason}`);
  };

  // Função para gastar Tubecoins
  const spendCoins = (amount: number, feature: string): boolean => {
    if (!user) return false;
    
    if (user.tubecoins < amount) {
      toast.error(`Tubecoins insuficientes para usar ${feature}`);
      return false;
    }

    const currentDate = new Date().toISOString();
    
    const updatedUser = {
      ...user,
      tubecoins: user.tubecoins - amount,
      usageHistory: [
        ...(user.usageHistory || []),
        { date: currentDate, feature, coinsSpent: amount }
      ]
    };

    localStorage.setItem('tubepro_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    toast.info(`-${amount} Tubecoins: ${feature}`);
    
    // Ganha experiência ao usar recursos
    earnExperience(Math.floor(amount / 2));
    
    return true;
  };

  // Função para ganhar experiência
  const earnExperience = (amount: number) => {
    if (!user) return;

    let updatedUser = { ...user };
    updatedUser.experience += amount;

    // Verifica se subiu de nível
    while (updatedUser.experience >= updatedUser.experienceToNextLevel) {
      updatedUser.experience -= updatedUser.experienceToNextLevel;
      updatedUser.level += 1;
      updatedUser.experienceToNextLevel = calculateExperienceForLevel(updatedUser.level);
      
      // Bônus ao subir de nível
      updatedUser.tubecoins += updatedUser.level * 10;
      toast.success(`🎉 Nível ${updatedUser.level} alcançado! +${updatedUser.level * 10} Tubecoins de bônus!`);
    }

    localStorage.setItem('tubepro_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // Função de login simulada
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificação básica - em um app real isso seria feito no backend
      if (email === 'demo@tubepro.com' && password === 'password') {
        const mockUser: User = {
          id: 1,
          name: 'Usuário Demo',
          email: 'demo@tubepro.com',
          plan: 'pro',
          tubecoins: 500,
          level: 3,
          experience: 75,
          experienceToNextLevel: calculateExperienceForLevel(3),
          usageHistory: [
            { date: '2023-05-01T10:30:00Z', feature: 'Geração de Ideias', coinsSpent: 10 },
            { date: '2023-05-02T14:45:00Z', feature: 'Escrita de Roteiro', coinsSpent: 25 },
            { date: '2023-05-05T09:15:00Z', feature: 'Assistente AI', coinsSpent: 15 }
          ]
        };
        
        // Salvar usuário no localStorage
        localStorage.setItem('tubepro_user', JSON.stringify(mockUser));
        setUser(mockUser);
        toast.success('Login realizado com sucesso!');
      } else {
        throw new Error('Credenciais inválidas');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Falha no login. Verifique suas credenciais.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de registro simulada
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular registro - em um app real isso seria feito no backend
      const mockUser: User = {
        id: Math.floor(Math.random() * 1000),
        name,
        email,
        plan: 'free',
        tubecoins: 100, // Bônus inicial de registro
        level: 1,
        experience: 0,
        experienceToNextLevel: calculateExperienceForLevel(1),
        usageHistory: []
      };
      
      // Salvar usuário no localStorage
      localStorage.setItem('tubepro_user', JSON.stringify(mockUser));
      setUser(mockUser);
      toast.success('Conta criada com sucesso! Você ganhou 100 Tubecoins de bônus!');
    } catch (error) {
      console.error('Erro no registro:', error);
      toast.error('Falha no registro. Tente novamente.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de recuperação de senha simulada
  const resetPassword = async (email: string) => {
    setIsLoading(true);
    
    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular recuperação - em um app real isso enviaria um e-mail
      toast.success(`Link de recuperação enviado para ${email}. Verifique sua caixa de entrada.`);
    } catch (error) {
      console.error('Erro na recuperação de senha:', error);
      toast.error('Falha no envio do link de recuperação. Tente novamente.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem('tubepro_user');
    setUser(null);
    toast.info('Você foi desconectado');
  };

  const value = {
    user,
    login,
    register,
    logout,
    resetPassword,
    isLoading,
    earnCoins,
    spendCoins,
    earnExperience
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
