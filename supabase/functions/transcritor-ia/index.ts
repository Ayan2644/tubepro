// supabase/functions/transcritor-ia/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { YoutubeTranscript } from "https://esm.sh/youtube-transcript@1.0.6";

serve(async (req) => {
  // Se for uma requisição OPTIONS (pre-flight), apenas retorne 'ok' com os headers CORS.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ---- MUDANÇA PRINCIPAL AQUI ----
    // Estamos lendo o corpo (body) da requisição para obter a URL do vídeo.
    const body = await req.json();
    const videoURL = body.videoURL;
    // ---------------------------------

    if (!videoURL) {
      throw new Error("A URL do vídeo é obrigatória e não foi fornecida.");
    }

    // A lógica de busca de legendas continua a mesma, que já é robusta.
    let transcriptParts;
    try {
      // Tenta buscar em Português primeiro
      transcriptParts = await YoutubeTranscript.fetchTranscript(videoURL, { lang: 'pt' });
    } catch (e) {
      console.warn("Legenda em PT não encontrada, tentando em EN.");
      // Se falhar, tenta em Inglês como fallback
      try {
        transcriptParts = await YoutubeTranscript.fetchTranscript(videoURL, { lang: 'en' });
      } catch (finalError) {
        // Se ambos falharem, lança um erro claro.
        throw new Error("Este vídeo não possui legendas disponíveis ou elas foram desativadas.");
      }
    }

    if (!transcriptParts || transcriptParts.length === 0) {
      throw new Error("As legendas para este vídeo foram encontradas, mas estão vazias.");
    }

    // Junta todas as partes da legenda em um único texto.
    const fullTranscript = transcriptParts.map(part => part.text).join(" ");

    // Retorna a transcrição completa como um objeto JSON.
    return new Response(JSON.stringify({ transcription: fullTranscript }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Erro na função transcritor-ia:", error.message);
    // Em caso de erro, retorna uma mensagem de erro clara.
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});