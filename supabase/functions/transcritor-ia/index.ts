// supabase/functions/transcritor-ia/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { YoutubeTranscript } from "https://esm.sh/youtube-transcript@1.0.6";

// Definimos uma interface para clareza
interface TranscriptSegment {
  text: string;
  duration: number;
  offset: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { videoURL } = await req.json();
    if (!videoURL) {
      throw new Error("A URL do vídeo é obrigatória.");
    }

    let transcriptParts: TranscriptSegment[];
    try {
      transcriptParts = await YoutubeTranscript.fetchTranscript(videoURL, { lang: 'pt' });
    } catch (e) {
      console.warn("Legenda em PT não encontrada, tentando em EN como fallback.");
      try {
        transcriptParts = await YoutubeTranscript.fetchTranscript(videoURL, { lang: 'en' });
      } catch (finalError) {
        throw new Error("Este vídeo não possui legendas disponíveis ou elas foram desativadas.");
      }
    }

    if (!transcriptParts || transcriptParts.length === 0) {
      throw new Error("As legendas para este vídeo foram encontradas, mas estão vazias.");
    }

    // --- MUDANÇA PRINCIPAL ---
    // Em vez de juntar o texto, formatamos os dados para a estrutura que o frontend precisa.
    const fullText = transcriptParts.map(part => part.text).join(" ");
    const segments = transcriptParts.map((part, index) => ({
      id: index + 1,
      start: part.offset / 1000, // Converte milissegundos para segundos
      end: (part.offset + part.duration) / 1000, // Calcula o tempo final em segundos
      text: part.text,
    }));

    // Retornamos o objeto completo
    return new Response(JSON.stringify({ text: fullText, segments: segments }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Erro na função transcritor-ia:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});