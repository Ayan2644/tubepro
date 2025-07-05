// supabase/functions/transcritor-ia/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { YoutubeTranscript } from "https://esm.sh/youtube-transcript@1.0.6";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // MUDANÇA CRUCIAL: Lendo a URL a partir dos parâmetros do endereço da requisição.
    const url = new URL(req.url);
    const videoURL = url.searchParams.get("videoURL");

    if (!videoURL) {
      throw new Error("A URL do vídeo é obrigatória e não foi fornecida.");
    }

    // A lógica de busca de legendas continua a mesma, que já é robusta.
    let transcriptParts;
    try {
      transcriptParts = await YoutubeTranscript.fetchTranscript(videoURL, { lang: 'pt' });
    } catch (e) {
      console.warn("Legenda em PT não encontrada, tentando em EN.");
      try {
        transcriptParts = await YoutubeTranscript.fetchTranscript(videoURL, { lang: 'en' });
      } catch (finalError) {
        throw new Error("Este vídeo não possui legendas disponíveis ou elas foram desativadas.");
      }
    }

    if (!transcriptParts || transcriptParts.length === 0) {
      throw new Error("As legendas para este vídeo foram encontradas, mas estão vazias.");
    }

    const fullTranscript = transcriptParts.map(part => part.text).join("\n");

    return new Response(JSON.stringify({ transcription: fullTranscript }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Erro na função transcritor-ia:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});