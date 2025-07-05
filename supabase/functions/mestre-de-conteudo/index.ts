// supabase/functions/mestre-de-conteudo/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.15.0";
// Importante: Adicionamos a importação do createClient do Supabase
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // **A GRANDE MUDANÇA ESTÁ AQUI**
    // Para acessar os segredos, precisamos usar um cliente Supabase com as permissões do usuário.
    const authHeader = req.headers.get("Authorization")!;
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Agora buscamos o segredo 'GEMINI_API_KEY' que você salvou no painel do Supabase.
    // Esta forma é mais segura.
    const { data: secret, error: secretError } = await supabaseClient
      .from("secrets")
      .select("value")
      .eq("name", "GEMINI_API_KEY")
      .single();

    if (secretError) {
      throw new Error(`Erro ao buscar a chave da API: ${secretError.message}`);
    }

    const geminiApiKey = secret.value;
    // **FIM DA MUDANÇA**

    if (!geminiApiKey) {
      throw new Error("A chave GEMINI_API_KEY não foi encontrada.");
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: MASTER_PROMPT,
    });

    const userPrompt = `Tópico do vídeo: "${topic}". Público-alvo: "${audience || 'Geral'}".`;
    
    const result = await model.generateContentStream(userPrompt);

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