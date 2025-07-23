// supabase/functions/youtube-auth-callback/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');

serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  // O redirecionamento DEVE ser exatamente o mesmo configurado no Google Cloud Console
  // e na chamada do frontend.
  const REDIRECT_URI = `${supabaseUrl}/functions/v1/youtube-auth-callback`;

  if (!code) {
    return new Response('Código de autorização não encontrado.', { status: 400 });
  }

  try {
    // 1. Trocar o código de autorização por tokens de acesso
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.json();
      throw new Error(`Falha ao obter token: ${errorBody.error_description}`);
    }

    const tokens = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokens;

    // 2. Usar o access_token para obter informações do usuário e do canal
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const googleUser = await profileResponse.json();

    const channelResponse = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true', {
        headers: { Authorization: `Bearer ${access_token}` },
    });
    const channelData = await channelResponse.json();
    const channel = channelData.items[0];

    // 3. Criar um cliente Supabase com Service Role para interagir com o DB
    const supabaseAdmin = createClient(supabaseUrl!, serviceRoleKey!);
    
    // Obter o ID do usuário logado no app a partir do cookie de sessão
    const { data: { user } } = await supabaseAdmin.auth.getUser(req.headers.get('Authorization')!.replace('Bearer ', ''));
    if (!user) throw new Error('Usuário não autenticado no Supabase.');

    // 4. Salvar os dados na tabela 'youtube_channels'
    const channelInfo = {
        user_id: user.id,
        channel_id: channel.id,
        channel_name: channel.snippet.title,
        thumbnail_url: channel.snippet.thumbnails.default.url,
        access_token: access_token,
        refresh_token: refresh_token,
        expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
    };

    const { error } = await supabaseAdmin
      .from('youtube_channels')
      .upsert(channelInfo, { onConflict: 'user_id, channel_id' }); // Upsert para atualizar se já existir

    if (error) throw error;
    
    // 5. Redirecionar de volta para a página de dashboard com um parâmetro de sucesso
    const redirectTo = new URL('/analytics', url.origin); // Assumindo que a rota é /analytics
    redirectTo.searchParams.set('connected', 'true');
    return Response.redirect(redirectTo.toString(), 302);

  } catch (error) {
    console.error('Erro no callback de autenticação do YouTube:', error);
    const redirectTo = new URL('/analytics', url.origin);
    redirectTo.searchParams.set('error', encodeURIComponent(error.message));
    return Response.redirect(redirectTo.toString(), 302);
  }
});