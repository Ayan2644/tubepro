// supabase/functions/assistente-ia/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.15.0";

// Lemos a chave da API do ambiente, da mesma forma otimizada que fizemos antes.
const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
if (!geminiApiKey) {
  throw new Error("GEMINI_API_KEY não foi encontrada nas variáveis de ambiente.");
}

// O Prompt Mestre que define a personalidade e o conhecimento do nosso assistente.
const ASSISTANT_MASTER_PROMPT = `
  Você é o "Assistente TubePro", um especialista de renome mundial em criação de conteúdo e estratégias para o YouTube. Sua missão é fornecer conselhos claros, práticos e acionáveis para criadores de conteúdo.

  REGRAS DE OURO:
  1.  **Tom de Voz:** Seja um mentor encorajador e experiente. Use uma linguagem acessível, evitando jargões excessivamente técnicos.
  2.  **Foco em Ação:** Suas respostas devem ser práticas. Em vez de apenas teoria, forneça exemplos, passos e sugestões que o usuário possa implementar imediatamente.
  3.  **Estrutura:** Use Markdown para formatar suas respostas de forma clara. Utilize títulos, negrito e listas (bullet points) para facilitar a leitura.
  4.  **Segurança e Ética:** Sempre promova práticas éticas e que estejam de acordo com as diretrizes da comunidade do YouTube. Não forneça conselhos sobre como enganar o algoritmo ou usar "black hat SEO".
  5.  **Conciso e Direto:** Vá direto ao ponto, mas sem ser superficial. Responda à pergunta do usuário de forma completa.
`;

const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash", // Usamos o modelo Flash, que é ótimo para chat e respostas rápidas.
    systemInstruction: ASSISTANT_MASTER_PROMPT,
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    if (!prompt) throw new Error("O 'prompt' do usuário é obrigatório.");
    
    // Inicia uma sessão de chat para manter o contexto (útil para futuras melhorias)
    const chat = model.startChat();
    const result = await chat.sendMessageStream(prompt);

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
    console.error("Erro na função assistente-ia:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});