// supabase/functions/get-youtube-stats/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { format } from "https://deno.land/std@0.208.0/datetime/mod.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("Usuário não encontrado.");

    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('youtube_tokens')
      .select('access_token')
      .eq('user_id', user.id)
      .single();

    if (tokenError) throw new Error("Token do YouTube não encontrado para este usuário.");
    const accessToken = tokenData.access_token;

    // --- CHAMADA 1: ESTATÍSTICAS GERAIS (como antes) ---
    const channelsResponse = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!channelsResponse.ok) throw new Error('Falha ao buscar estatísticas do canal.');
    const channelData = await channelsResponse.json();
    const channel = channelData.items[0];

    // --- NOVA CHAMADA 2: RELATÓRIO ANALÍTICO MENSAL ---
    const today = new Date();
    const startDate = format(new Date(today.getFullYear(), today.getMonth() - 6, 1), "yyyy-MM-dd");
    const endDate = format(today, "yyyy-MM-dd");

    const analyticsQuery = new URLSearchParams({
        ids: 'channel==MINE',
        startDate: startDate,
        endDate: endDate,
        metrics: 'views,subscribersGained',
        dimensions: 'month',
        sort: 'month'
    });

    const analyticsResponse = await fetch(`https://youtubeanalytics.googleapis.com/v2/reports?${analyticsQuery.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!analyticsResponse.ok) {
        const errorBody = await analyticsResponse.json();
        console.error('Erro na API de Analytics do YouTube:', errorBody);
        throw new Error(`Erro ao buscar dados analíticos: ${errorBody.error.message}`);
    }
    const analyticsData = await analyticsResponse.json();
    
    // Formata os dados mensais para o gráfico
    const monthlyData = analyticsData.rows.map((row: [string, number, number]) => ({
        month: format(new Date(row[0]), "MMM", { locale: "pt-BR" }), // Formata '2024-01' para 'Jan'
        views: row[1],
        subscribers: row[2]
    }));

    // --- COMBINA TODOS OS DADOS PARA ENVIAR DE VOLTA ---
    const responsePayload = {
      generalStats: {
        name: channel.snippet.title,
        subscribers: parseInt(channel.statistics.subscriberCount, 10),
        totalViews: parseInt(channel.statistics.viewCount, 10),
        totalVideos: parseInt(channel.statistics.videoCount, 10),
      },
      monthlyPerformance: monthlyData
    };

    return new Response(JSON.stringify(responsePayload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro na Edge Function get-youtube-stats:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})