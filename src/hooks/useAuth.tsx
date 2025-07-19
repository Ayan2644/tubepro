// src/hooks/useAuth.tsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import type { AuthUser } from '@supabase/supabase-js';

// Interface do Usuário permanece a mesma
export interface User {
  id: string;
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

// NOVO: Tipagem para o estado de uma ação assíncrona
type AuthActionStatus = 'idle' | 'loading' | 'error' | 'success';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isLoading: boolean; // Mantido para o carregamento inicial da sessão
  actionStatus: AuthActionStatus; // NOVO: Estado para ações específicas (login, registro)
  spendCoins: (amount: number, feature: string) => Promise<boolean>;
  earnCoins: (amount: number, reason: string) => Promise<void>;
  earnExperience: (amount: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

const calculateExperienceForLevel = (level: number) => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Apenas para o carregamento inicial
  const [actionStatus, setActionStatus] = useState<AuthActionStatus>('idle'); // Estado para ações
  const navigate = useNavigate();

  const fetchUserProfile = useCallback(async (supabaseUser: AuthUser | null) => {
    if (!supabaseUser) {
      setUser(null);
      return null;
    }
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', supabaseUser.id).single();
      
      // Se o perfil não existe, criamos um
      if (error && error.code === 'PGRST116') {
        const newUserProfile = { 
            id: supabaseUser.id, 
            name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Novo Usuário', 
            email: supabaseUser.email 
        };
        const { data: createdProfile, error: insertError } = await supabase.from('profiles').insert(newUserProfile).select().single();
        if (insertError) throw insertError;
        setUser(createdProfile as User);
        return createdProfile as User;
      }

      if (error) throw error;
      
      if (data) {
        setUser(data as User);
        return data as User;
      }
    } catch (error: any) {
      toast.error("Erro ao carregar o perfil.", { description: error.message });
      await supabase.auth.signOut();
      setUser(null);
    }
    return null;
  }, []);

  useEffect(() => {
    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            await fetchUserProfile(session.user);
        }
        setIsLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        fetchUserProfile(session?.user);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [fetchUserProfile]);


  // Otimização das Funções de Ação (login, register, etc.)
  const handleAuthAction = async (action: () => Promise<any>, successMessage: string) => {
    setActionStatus('loading');
    try {
        await action();
        toast.success(successMessage);
        setActionStatus('success');
    } catch (error: any) {
        toast.error(error.message || 'Ocorreu uma falha na autenticação.');
        setActionStatus('error');
        throw error; // Propaga o erro para o componente que chamou
    } finally {
        // Delay para resetar o status, permitindo que a UI reaja
        setTimeout(() => setActionStatus('idle'), 1500);
    }
  };

  const login = async (email: string, password: string) => {
    await handleAuthAction(
      () => supabase.auth.signInWithPassword({ email, password }).then(({ error }) => { if (error) throw error; }),
      'Login realizado com sucesso!'
    );
    navigate('/');
  };

  const register = async (name: string, email: string, password: string) => {
    await handleAuthAction(
      () => supabase.auth.signUp({ email, password, options: { data: { full_name: name } } }).then(({ error }) => { if (error) throw error; }),
      'Verifique seu e-mail para confirmar a conta.'
    );
  };
  
  // Otimização da função de logout
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/login'); // Usa o hook do react-router-dom para navegação
  };

  const resetPassword = async (email:string) => {
    await handleAuthAction(
      () => supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/update-password` }),
      'Link para recuperação de senha enviado.'
    );
  };

  // Funções de gamificação (permanecem iguais, mas poderiam ser movidas para um hook próprio no futuro)
  const earnCoins = async (amount: number, reason: string) => {
    if (!user) return;
    const newTotal = user.tubecoins + amount;
    const { error } = await supabase.from('profiles').update({ tubecoins: newTotal }).eq('id', user.id);
    if(error) { toast.error("Erro ao creditar Tubecoins."); return; }
    setUser(prev => prev ? { ...prev, tubecoins: newTotal } : null);
    toast.success(`+${amount} Tubecoins: ${reason}`);
  };

  const earnExperience = async (amount: number) => {
    if (!user) return;
    let tempUser = { ...user };
    tempUser.experience += amount;
    while (tempUser.experience >= tempUser.experienceToNextLevel) {
        tempUser.experience -= tempUser.experienceToNextLevel;
        tempUser.level += 1;
        tempUser.experienceToNextLevel = calculateExperienceForLevel(tempUser.level);
        tempUser.tubecoins += tempUser.level * 10;
        toast.success(`🎉 Nível ${tempUser.level} alcançado! +${tempUser.level * 10} Tubecoins!`);
    }
    const { error } = await supabase.from('profiles').update({ experience: tempUser.experience, level: tempUser.level, experienceToNextLevel: tempUser.experienceToNextLevel, tubecoins: tempUser.tubecoins }).eq('id', user.id);
    if(error) { toast.error("Erro ao salvar progresso."); }
    setUser(tempUser);
  };

  const spendCoins = async (amount: number, feature: string): Promise<boolean> => {
    if (!user) {
      toast.error("Sua sessão expirou. Por favor, faça login novamente.");
      return false;
    }
    if (user.tubecoins < amount) {
      toast.error(`Tubecoins insuficientes para usar ${feature}.`, { description: `Você tem ${user.tubecoins}, mas precisa de ${amount}.` });
      return false;
    }

    const newTubecoins = user.tubecoins - amount;
    const newUsageHistory = [...(user.usageHistory || []), { date: new Date().toISOString(), feature, coinsSpent: amount }];

    const { error } = await supabase.from('profiles').update({ tubecoins: newTubecoins, usageHistory: newUsageHistory }).eq('id', user.id);
    if (error) {
      toast.error("Ocorreu um erro ao debitar os Tubecoins.", { description: error.message });
      return false;
    }

    setUser(prev => prev ? { ...prev, tubecoins: newTubecoins, usageHistory: newUsageHistory } : null);
    toast.info(`-${amount} Tubecoins: ${feature}`);
    await earnExperience(Math.floor(amount / 2));
    return true;
  };

  const value = { user, login, register, logout, resetPassword, isLoading, actionStatus, spendCoins, earnCoins, earnExperience };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};