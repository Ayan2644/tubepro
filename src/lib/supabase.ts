// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

// Pega as variáveis de ambiente que configuram o Supabase.
// Se elas não existirem, o app vai falhar com uma mensagem clara.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('As variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias.');
}

// Cria a ÚNICA instância do cliente Supabase para todo o app
// e a exporta diretamente. As configurações de `auth` garantem
// que a sessão do usuário seja gerenciada de forma robusta e automática.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});