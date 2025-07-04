rt { createClient } from '@supabase/supabase-js';

// Obtém as variáveis de ambiente do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Verifica se as variáveis de ambiente estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are missing. Please check your environment configuration.');
}

// Cria o cliente Supabase apenas se as variáveis estiverem disponíveis
export const supabaseClient = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Função auxiliar para verificar se o cliente está disponível
export const isSupabaseReady = () => {
  return !!supabaseClient;
};

// Função para obter o cliente com verificação de segurança
export const getSupabaseClient = () => {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized. Please check your environment variables.');
  }
  return supabaseClient;
};
