import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.15.0";
import { corsHeaders } from '../_shared/cors.ts';

// Função auxiliar para converter o áudio (Blob) para o formato base64, que o Gemini aceita
async function blobToBase64(blob: Blob): Promise<string> {
  const reader = new FileReader();
  const promise = new Promise<string>((resolve, reject) => {
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
  reader.readAsDataURL(blob);
  return promise;
}

serve(async (req) => {
  // Tratamento da requisição OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { videoURL } = await req.json();
    if (!videoURL) {
      throw new Error('A URL do vídeo é obrigatória.');
    }

    // Pega a chave da API do Gemini dos segredos do projeto
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('A chave GEMINI_API_KEY não foi configurada nos segredos.');
    }

    // 1. Extrai o áudio do vídeo do YouTube usando yt-dlp
    const command = new Deno.Command('yt-dlp', {
      args: [
        '-x', // Extrair áudio
        '--audio-format', 'mp3',
        '-o', '-', // Envia o resultado para a saída padrão (stdout)
        videoURL,
      ],
    });

    const { code, stdout, stderr } = await command.output();
    if (code !== 0) {
      throw new Error(`yt-dlp falhou: ${new TextDecoder().decode(stderr)}`);
    }

    const audioBlob = new Blob([stdout], { type: 'audio/mp3' });

    // 2. Prepara e envia o áudio para a API do Gemini 1.5 Pro
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const audioBase64 = await blobToBase64(audioBlob);

    const audioPart = {
      inlineData: {
        data: audioBase64,
        mimeType: 'audio/mp3',
      },
    };

    const prompt = "Transcreva este áudio na íntegra. Retorne APENAS o texto transcrito, sem nenhuma introdução, formatação especial ou comentários adicionais.";

    const result = await model.generateContent([prompt, audioPart]);
    const response = await result.response;
    const transcriptionText = response.text();

    // 3. Retorna a transcrição para o nosso aplicativo
    return new Response(JSON.stringify({ transcription: transcriptionText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro na função transcribe-youtube (Gemini):', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});