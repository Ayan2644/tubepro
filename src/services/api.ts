// src/services/api.ts

import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { TranscriptionResult } from '@/utils/transcriptionService';

/**
 * Helper: Obtém o token de acesso da sessão atual do Supabase.
 * Lança um erro se o usuário não estiver autenticado.
 */
const getAccessToken = async (): Promise<string> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Usuário não autenticado. Por favor, faça login novamente.");
  }
  return session.access_token;
};

/**
 * Helper: Função genérica para chamar uma Supabase Function e processar a resposta como um stream de texto.
 */
const invokeStreamableFunction = async (functionName: string, body: object): Promise<ReadableStream<Uint8Array>> => {
  try {
    const accessToken = await getAccessToken();
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP Error: ${response.status}`);
    }
    if (!response.body) {
      throw new Error("A resposta da função não contém um corpo (body).");
    }
    return response.body;
  } catch (error: any) {
    toast.error(`Erro na função '${functionName}'.`, { description: error.message });
    throw error;
  }
};

// --- Implementações Reais das Funções de IA ---

export const generateContentPlan = (topic: string, audience: string): Promise<ReadableStream<Uint8Array>> => {
  return invokeStreamableFunction('mestre-de-conteudo', { topic, audience });
};

export const generateScript = (userResponses: { [key: number]: string }): Promise<ReadableStream<Uint8Array>> => {
  return invokeStreamableFunction('roteirista-ia', userResponses);
};

export const getAssistantResponse = (prompt: string): Promise<ReadableStream<Uint8Array>> => {
  return invokeStreamableFunction('assistente-ia', { prompt });
};

/**
 * Chama a Supabase Function 'transcritor-ia' para obter a transcrição de um vídeo do YouTube.
 */
export async function transcribeYoutubeVideo(url: string): Promise<TranscriptionResult> {
    try {
        const accessToken = await getAccessToken();
        const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcritor-ia`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                },
                body: JSON.stringify({ videoURL: url }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        // CORREÇÃO: Retorna o objeto completo (com texto e segmentos) como o tipo TranscriptionResult
        return data as TranscriptionResult;

    } catch (error: any) {
        toast.error('Erro ao transcrever o vídeo.', { description: error.message });
        throw error;
    }
}

/**
 * (PENDENTE) Simula a transcrição de um arquivo de vídeo/áudio.
 */
export async function transcribeVideoFile(file: File): Promise<TranscriptionResult> {
  console.warn(`(MOCK) Chamada para transcrever arquivo: ${file.name}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  toast.info("A transcrição de arquivos ainda não foi implementada.");
  throw new Error("Função de upload de arquivo não implementada.");
}