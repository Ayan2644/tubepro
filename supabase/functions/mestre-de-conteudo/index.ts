// supabase/functions/mestre-de-conteudo/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.15.0";

const MASTER_PROMPT = `
  VOCÊ É O TubePro, um especialista mundial em SEO e roteiros para o YouTube. Sua tarefa é gerar um plano de conteúdo completo.
  A RESPOSTA DEVE SER APENAS O OBJETO JSON, sem nenhum texto adicional, markdown ou explicações.
  Siga esta estrutura JSON à risca:
  {
    "title": "O título mais magnético e otimizado para CTR",
    "titles": ["Uma lista com 4 outras excelentes opções de títulos"],
    "description": "Uma descrição para o YouTube com no mínimo 200 palavras, otimizada para SEO, com parágrafos e 3-5 hashtags relevantes.",
    "tags": ["uma", "lista", "de", "exatamente", "15", "tags", "relevantes", "e", "específicas", "para", "o", "tópico"],
    "scriptStructure": {
      "hook": "Um gancho de 10-15 segundos para prender a atenção do espectador imediatamente.",
      "introduction": "Uma introdução que apresenta o problema, a promessa do vídeo e gera conexão com o público-alvo.",
      "mainPoints": ["Ponto principal 1, detalhado.", "Ponto principal 2, detalhado.", "Ponto principal 3, detalhado."],
      "cta": "Uma chamada para ação (Call to Action) final, incentivando engajamento (like, comentário) e inscrição no canal."
    }
  }
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { topic, audience } = await req.json();
    if (!topic) throw new Error("O tópico do vídeo é obrigatório.");

    // Obtenha a chave da API do Gemini das variáveis de ambiente
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      throw new Error("A chave GEMINI_API_KEY não foi configurada nas variáveis de ambiente do Supabase.");
    }

    // Inicialize o cliente do Google Generative AI
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash", // Modelo rápido e eficiente
        systemInstruction: MASTER_PROMPT,
    });

    const userPrompt = `Tópico do vídeo: "${topic}". Público-alvo: "${audience || 'Geral'}".`;
    
    // Gere o conteúdo com streaming
    const result = await model.generateContentStream(userPrompt);

    // Crie um ReadableStream para enviar a resposta ao cliente
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          controller.enqueue(new TextEncoder().encode(chunkText));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
    });

  } catch (error) {
    console.error("Erro na função mestre-de-conteudo (Gemini):", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});