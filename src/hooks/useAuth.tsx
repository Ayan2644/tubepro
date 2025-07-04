import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getSupabaseClient } from '@/lib/supabase'; // Importe o cliente Supabase

// Definir tipos para o usuário
export interface User {
  id: string; // O ID do Supabase é uma string (UUID)
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

  const supabase = getSupabaseClient(); // Obtenha a instância do Supabase

  // Carregar usuário da sessão Supabase ao iniciar
  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();

        if (error) {
          // Tratar AuthSessionMissingError como informação, pois é esperado para usuários deslogados
          if (error.name === 'AuthSessionMissingError') {
            console.info("Nenhuma sessão de autenticação encontrada (esperado para usuários deslogados).");
          } else {
            console.error("Erro ao buscar usuário do Supabase:", error);
            toast.error(error.message || "Erro desconhecido ao buscar usuário.");
          }
          setUser(null);
        } else if (supabaseUser) {
          // Se o usuário estiver logado no Supabase, tente buscar os dados dele no seu banco de dados
          const { data: userData, error: dbError } = await supabase
            .from('profiles') // Assumindo que você terá uma tabela 'profiles' para dados adicionais do usuário
            .select('*')
            .eq('id', supabaseUser.id)
            .single();

          if (dbError && dbError.details?.includes('zero rows')) {
            // Se o perfil não existir, crie um perfil básico
            const initialUser: User = {
              id: supabaseUser.id,
              name: supabaseUser.email?.split('@')[0] || 'Novo Usuário',
              email: supabaseUser.email || '',
              plan: 'free',
              tubecoins: 100, // Bônus inicial de registro
              level: 1,
              experience: 0,
              experienceToNextLevel: calculateExperienceForLevel(1),
              usageHistory: []
            };
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert(initialUser)
              .select()
              .single();

            if (insertError) {
              console.error("Erro ao inserir perfil inicial no fetchUser:", insertError);
              toast.error("Erro ao carregar perfil. Tente novamente.");
            } else {
              setUser(newProfile as User);
              toast.success('Bem-vindo ao TubePro! Você ganhou 100 Tubecoins de bônus!');
            }
          } else if (dbError) {
            console.error("Erro ao buscar perfil do usuário:", dbError);
            toast.error("Erro ao carregar perfil. Tente novamente.");
          } else {
            setUser(userData as User);
          }
        } else {
          setUser(null);
        }
      } catch (e: any) { // Capture como 'any' para acessar 'message' com segurança
        console.error("Erro inesperado no AuthProvider ao carregar usuário:", e);
        toast.error(e.message || "Erro desconhecido ao carregar usuário.");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    // Adiciona um listener para mudanças de estado de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          fetchUser(); // Refetch user data when signed in
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);


  // Função para ganhar Tubecoins
  const earnCoins = (amount: number, reason: string) => {
    if (!user) return;

    // TODO: Implementar atualização no banco de dados Supabase
    const updatedUser = {
      ...user,
      tubecoins: user.tubecoins + amount
    };

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

    // TODO: Implementar atualização no banco de dados Supabase
    const updatedUser = {
      ...user,
      tubecoins: user.tubecoins - amount,
      usageHistory: [
        ...(user.usageHistory || []),
        { date: currentDate, feature, coinsSpent: amount }
      ]
    };

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

    // TODO: Implementar atualização no banco de dados Supabase
    setUser(updatedUser);
  };

  // Função de login com Supabase
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Agora, 'error' é do tipo 'PostgrestError' ou similar, com uma propriedade 'message'
        toast.error(error.message || 'Falha no login. Verifique suas credenciais.');
        throw error;
      }

      // Se o login for bem-sucedido, fetchUser no useEffect cuidará de carregar o perfil
      toast.success('Login realizado com sucesso!');
    } catch (error: any) { // Capture como 'any' para acessar 'message' com segurança
      console.error('Erro no login:', error);
      // Evita duplicidade de toast se o erro já foi exibido acima
      if (!error.message) { // Se não tem uma mensagem específica, é um erro inesperado
        toast.error('Ocorreu um erro inesperado no login. Por favor, tente novamente.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de registro com Supabase
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name, // Supabase user metadata
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          toast.error('Este e-mail já está registrado. Por favor, faça login ou use outro e-mail.');
        } else if (signUpError.message.includes('Password should be at least')) {
          toast.error('A senha é muito fraca. Ela deve ter pelo menos 6 caracteres.');
        } else {
          toast.error(signUpError.message || 'Falha no registro. Tente novamente.');
        }
        return; // Sair da função se houver um erro no signUp
      }

      // Se signUpData.user for nulo, geralmente significa que a confirmação de email é necessária
      // e o usuário não está logado automaticamente após o registro.
      if (!signUpData.user) {
        toast.info('Verifique seu e-mail para confirmar a conta antes de fazer login. Um link de confirmação foi enviado.');
        return; // Sair da função se a confirmação de e-mail for necessária
      }

      // Se chegou aqui, o usuário foi criado no auth.users e logado automaticamente (se a confirmação de email estiver desativada).
      // Agora insere o perfil inicial no seu banco de dados (tabela 'profiles').
      const initialUser: User = {
        id: signUpData.user.id,
        name: name,
        email: email,
        plan: 'free',
        tubecoins: 100, // Bônus inicial de registro
        level: 1,
        experience: 0,
        experienceToNextLevel: calculateExperienceForLevel(1),
        usageHistory: []
      };

      const { error: insertProfileError } = await supabase.from('profiles').insert(initialUser);

      if (insertProfileError) {
        // Se a inserção do perfil falhar (ex: por FK constraint, RLS, etc.)
        console.error('Erro ao inserir perfil do usuário:', insertProfileError);
        toast.error(`Conta criada, mas houve um erro ao configurar seu perfil: ${insertProfileError.message || 'Erro desconhecido'}. Por favor, tente fazer login. Se o problema persistir, entre em contato com o suporte.`);
        return; // Sair da função se a inserção do perfil falhar
      }

      toast.success('Conta criada com sucesso! Você ganhou 100 Tubecoins de bônus!');
      // O fetchUser no useEffect cuidará do carregamento do perfil completo após o login automático.

    } catch (error: any) { // Use 'any' para o erro geral, ou refine o tipo se souber qual é
      // Este catch final é para erros inesperados que não foram pegos acima.
      console.error('Erro inesperado no registro:', error);
      // Não exibe toast aqui para evitar duplicidade, a menos que seja um erro genérico não específico
    } finally {
      setIsLoading(false);
    }
  };

  // Função de recuperação de senha com Supabase
  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`, // URL para onde o usuário será redirecionado
      });

      if (error) {
        toast.error(error.message || 'Falha no envio do link de recuperação. Tente novamente.');
        throw error;
      }

      toast.success(`Link de recuperação enviado para ${email}. Verifique sua caixa de entrada.`);
    } catch (error: any) {
      console.error('Erro na recuperação de senha:', error);
      toast.error(error.message || 'Falha no envio do link de recuperação. Tente novamente.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de logout com Supabase
  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message || 'Falha ao desconectar.');
        throw error;
      }
      setUser(null);
      toast.info('Você foi desconectado');
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      // Evita duplicidade de toast se o erro já foi exibido acima
      if (!error.message) {
        toast.error('Ocorreu um erro inesperado ao fazer logout. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
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