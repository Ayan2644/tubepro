// supabase/functions/youtube-auth-callback/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Função auxiliar para criar um cliente Supabase a partir de um token de acesso
async function createSupabaseClient(accessToken: string): Promise<SupabaseClient> {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );
  // Define a sessão do usuário com o token fornecido
  const { data: { user } } = await supabaseClient.auth.getUser(accessToken);
  await supabaseClient.auth.setSession({
    access_token: accessToken,
    refresh_token: '', // O refresh token não é necessário aqui
    user: user!,
  });
  return supabaseClient;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const SITE_URL = Deno.env.get('SITE_URL');
  if (!SITE_URL) {
      return new Response(JSON.stringify({ error: 'SITE_URL não configurado.' }), { status: 500 });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const accessToken = url.searchParams.get('access_token');

    if (!code && !accessToken) {
      throw new Error('Código de autorização ou token de acesso não encontrado.');
    }

    // Cria um cliente Supabase a partir do token de acesso na URL
    const supabaseClient = await createSupabaseClient(accessToken!);
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('Não foi possível obter a sessão do usuário.');
    }

    // Cria um cliente com permissões de administrador para acessar o banco de dados
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Troca o código pelos tokens de acesso e de atualização
    const tokenResponse = await fetch('https://oauth2.googleapis.com/oauth2/v4/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code!,
        client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
        redirect_uri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/youtube-auth-callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.json();
      throw new Error(`Falha ao trocar o código pelo token: ${errorBody.error_description || 'Erro desconhecido'}`);
    }

    const tokens = await tokenResponse.json();
    const { access_token, refresh_token, expires_in, scope } = tokens;
    const expires_at = new Date(Date.now() + expires_in * 1000);

    // Salva os tokens na tabela 'youtube_tokens'
    const { error: dbError } = await supabaseAdmin.from('youtube_tokens').upsert({
      user_id: user.id,
      access_token: access_token,
      refresh_token: refresh_token,
      expires_at: expires_at.toISOString(),
      scope: scope,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

    if (dbError) {
      throw new Error('Falha ao salvar os tokens no banco de dados.');
    }

    // Redireciona de volta para o dashboard com um parâmetro de sucesso
    return Response.redirect(`${SITE_URL}/youtube-dashboard?connected=true`);

  } catch (error) {
    console.error('Erro na Edge Function youtube-auth-callback:', error.message);
    return Response.redirect(`${SITE_URL}/youtube-dashboard?error=${encodeURIComponent(error.message)}`);
  }
})