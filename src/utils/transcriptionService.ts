
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

// Interface para representar o resultado da transcrição
export interface TranscriptionResult {
  text: string;
  segments?: {
    id: number;
    start: number;
    end: number;
    text: string;
  }[];
}

// Função para extrair o ID do vídeo de uma URL do YouTube
export function extractYoutubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Função para formatar segundos em formato [MM:SS]
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `[${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}]`;
}

// Função para transcrever vídeo do YouTube
export async function transcribeYoutubeVideo(url: string): Promise<TranscriptionResult> {
  try {
    const videoId = extractYoutubeVideoId(url);
    
    if (!videoId) {
      throw new Error('URL inválida do YouTube');
    }
    
    console.log(`Iniciando transcrição do vídeo do YouTube com ID: ${videoId}`);
    
    // Em uma implementação conectada ao Supabase, faríamos uma chamada para uma Edge Function
    // que usaria a API do YouTube para baixar o áudio e depois enviá-lo para a OpenAI
    
    // Por enquanto, vamos manter a simulação para demonstração
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // NOTA: Quando o Supabase estiver totalmente configurado, a linha abaixo seria descomentada
    // e as funções reais seriam implementadas no backend
    /*
    const response = await fetch('/api/transcribe-youtube', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoId }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao transcrever vídeo');
    }
    
    return await response.json();
    */
    
    // Dados simulados para demonstração - seriam substituídos pela resposta real da API
    return {
      text: `
        [00:00] Olá a todos e bem-vindos ao canal!
        [00:05] Hoje vamos falar sobre como criar conteúdo para o YouTube.
        [00:12] Uma das coisas mais importantes é ter um bom roteiro.
        [00:18] Também é essencial usar boas ferramentas de edição.
        [00:25] Não se esqueça de otimizar seu vídeo para SEO.
        [00:32] Use títulos chamativos e descrições bem detalhadas.
        [00:40] Thumbnails atraentes são cruciais para aumentar o CTR.
        [00:48] Interaja com sua audiência nos comentários.
        [00:55] Consistência é chave para crescer no YouTube.
        [01:02] Obrigado por assistir, não se esqueça de se inscrever!
      `,
      segments: [
        { id: 1, start: 0, end: 5, text: "Olá a todos e bem-vindos ao canal!" },
        { id: 2, start: 5, end: 12, text: "Hoje vamos falar sobre como criar conteúdo para o YouTube." },
        // mais segmentos aqui
      ]
    };
  } catch (error) {
    console.error('Erro na transcrição:', error);
    throw new Error('Falha ao transcrever o vídeo do YouTube');
  }
}

// Função para transcrever arquivo de vídeo
export async function transcribeVideoFile(file: File): Promise<TranscriptionResult> {
  try {
    // Verificar se é um arquivo de vídeo ou áudio
    if (!file.type.includes('video/') && !file.type.includes('audio/')) {
      throw new Error('Por favor, selecione um arquivo de vídeo ou áudio válido');
    }
    
    console.log(`Iniciando transcrição do arquivo: ${file.name}`);
    
    // Em uma implementação conectada ao Supabase, faríamos o upload do arquivo para o Storage
    // e depois chamaríamos uma Edge Function para processar o arquivo e enviá-lo para a OpenAI
    
    // Por enquanto, vamos manter a simulação para demonstração
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // NOTA: Quando o Supabase estiver totalmente configurado, a linha abaixo seria descomentada
    // e as funções reais seriam implementadas no backend
    /*
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/transcribe-file', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao transcrever arquivo');
    }
    
    return await response.json();
    */
    
    // Dados simulados para demonstração - seriam substituídos pela resposta real da API
    return {
      text: `
        [00:00] Este é um exemplo de transcrição de arquivo.
        [00:06] A ferramenta funciona tanto para vídeos do YouTube quanto para arquivos.
        [00:13] As transcrições são precisas e incluem marcações de tempo.
        [00:20] Você pode copiar a transcrição e usá-la como quiser.
        [00:27] Esta é uma demonstração do serviço de transcrição.
      `,
      segments: [
        { id: 1, start: 0, end: 6, text: "Este é um exemplo de transcrição de arquivo." },
        { id: 2, start: 6, end: 13, text: "A ferramenta funciona tanto para vídeos do YouTube quanto para arquivos." },
        // mais segmentos aqui
      ]
    };
  } catch (error) {
    console.error('Erro na transcrição:', error);
    throw new Error('Falha ao transcrever o arquivo');
  }
}

// Função para verificar se o usuário tem Tubecoins suficientes
export function verifyUserCredits(durationInMinutes: number): boolean {
  // Em uma implementação real, verificaríamos os créditos do usuário
  // e calcularíamos se ele tem saldo suficiente para transcrever o vídeo/arquivo
  
  // Para demonstração, vamos assumir que cada minuto custa 5 Tubecoins
  const requiredCoins = durationInMinutes * 5;
  
  // Verificar se o usuário está autenticado e tem créditos suficientes
  // Na implementação real, você chamaria uma função que verifica o saldo no backend
  console.log(`Verificando créditos para transcrição de ${durationInMinutes} minutos (${requiredCoins} Tubecoins)`);
  
  // Por ora, vamos sempre retornar true para fins de demonstração
  return true;
}
