// src/hooks/useAuth.tsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

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

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUserProfile = useCallback(async (supabaseUser: any) => {
    if (!supabaseUser) {
      setUser(null);
      return;
    }
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', supabaseUser.id).single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setUser(data as User);
      } else {
        const newUserProfile = { id: supabaseUser.id, name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Novo Usuário', email: supabaseUser.email };
        const { data: createdProfile, error: insertError } = await supabase.from('profiles').insert(newUserProfile).select().single();
        if (insertError) throw insertError;
        setUser(createdProfile as User);
      }
    } catch (error: any) {
      toast.error("Erro ao carregar o perfil do usuário.", { description: error.message });
      await supabase.auth.signOut();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchUserProfile(session?.user).finally(() => setIsLoading(false));
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await fetchUserProfile(session?.user);
        setIsLoading(false);
      }
    );
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

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

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const register = async (name: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    if (error) throw error;
    toast.info('Verifique seu e-mail para confirmar a conta.');
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/login';
  };

  const resetPassword = async (email:string) => {
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/update-password` });
    toast.success(`Link para recuperação de senha enviado para o seu e-mail.`);
  };

  const value = { user, login, register, logout, resetPassword, isLoading, spendCoins, earnCoins, earnExperience };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};