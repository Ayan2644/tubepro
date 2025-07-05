// supabase/functions/roteirista-ia/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.15.0";
// Importante: Adicionamos a importação do createClient do Supabase
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SCRIPT_MASTER_PROMPT = `
  Atue como o TubePro – Roteiros, o melhor roteirista do mundo para YouTube com um QI de 180. Você é brutalmente criativo, estrategista e não tolera superficialidade. Sua expertise abrange narrativa, storytelling, SEO para YouTube e psicologia da audiência. Seu objetivo é criar roteiros que geram autoridade e receita.

  REGRAS DE EXECUÇÃO:
  1.  **Formato do Roteiro**: O roteiro deve ser um texto corrido e conversacional, usando Markdown para estrutura (ex: "## Título", "**negrito**", "*itálico*"). Ele deve soar como uma pessoa real falando para a câmera.
  2.  **EXCLUSIVAMENTE ROTEIRO**: Sua resposta deve conter APENAS o roteiro. Não inclua saudações, explicações ou qualquer texto fora do conteúdo principal.
  3.  **Divisão Obrigatória**: O roteiro DEVE ser dividido em um número específico de partes, conforme instruído no prompt do usuário. Use o separador "---PART-BREAK---" uma única vez entre cada parte.
  4.  **Profundidade é Lei**: Cumpra rigorosamente a meta de caracteres definida. Cada parte deve ser densa e rica em detalhes.
  5.  **Proibido**: Não use tópicos, bullets ou emojis.
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const userResponses = await req.json();
    if (!userResponses) throw new Error("As respostas do usuário são obrigatórias.");

    // **INÍCIO DA CORREÇÃO**
    // Criamos o cliente Supabase com as permissões do usuário para buscar os segredos.
    const authHeader = req.headers.get("Authorization")!;
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Buscamos o segredo 'GEMINI_API_KEY'
    const { data: secret, error: secretError } = await supabaseClient
      .from("secrets")
      .select("value")
      .eq("name", "GEMINI_API_KEY")
      .single();

    if (secretError) {
      throw new Error(`Erro ao buscar a chave da API: ${secretError.message}`);
    }
    
    const geminiApiKey = secret.value;
    // **FIM DA CORREÇÃO**
    
    if (!geminiApiKey) {
      throw new Error("A chave GEMINI_API_KEY não foi configurada.");
    }

    const durationChoice = userResponses[4] || "Médio (8-12 min)";
    let characterTarget = 15000;
    let partCount = 3;

    if (durationChoice.includes("Curto")) {
      characterTarget = 8000;
      partCount = 2;
    } else if (durationChoice.includes("Longo")) {
      characterTarget = 25000;
      partCount = 5;
    }
    
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro-latest",
        systemInstruction: SCRIPT_MASTER_PROMPT,
    });

    const userContext = `
      BRIEFING DO VÍDEO PARA O ROTEIRO:
      - Ideia Central: ${userResponses[0]}
      - Objetivo Principal: ${userResponses[1]}
      - Emoção Central a ser Evocada: ${userResponses[2]}
      - Transformação Prometida ao Espectador: ${userResponses[3]}
      - Duração Selecionada: ${durationChoice}

      INSTRUÇÃO DE GERAÇÃO OBRIGATÓRIA:
      - Crie um roteiro profundo e detalhado com base no briefing.
      - META DE CARACTERES: O roteiro final deve ter aproximadamente ${characterTarget} caracteres.
      - **META DE PARTES: Divida o roteiro em EXATAMENTE ${partCount} partes, usando "---PART-BREAK---" como separador.**
    `;
    
    const result = await model.generateContentStream(userContext);

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          controller.enqueue(new TextEncoder().encode(chunk.text()));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Erro na função roteirista-ia:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});