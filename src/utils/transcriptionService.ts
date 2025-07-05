// src/utils/transcriptionService.ts

// Interface para representar o resultado da transcrição.
// Mantemos ela aqui pois é um tipo de dado compartilhado.
export interface TranscriptionResult {
  text: string;
  segments?: {
    id: number;
    start: number;
    end: number;
    text: string;
  }[];
}

/**
 * Extrai o ID do vídeo de qualquer formato de URL do YouTube.
 * Esta nova versão é muito mais robusta e flexível.
 * @param url - A URL do YouTube.
 * @returns O ID do vídeo ou null se não for uma URL válida.
 */
export function extractYoutubeVideoId(url: string): string | null {
  let videoId = null;
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    if (hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v');
    } else if (hostname.includes('youtu.be')) {
      videoId = urlObj.pathname.slice(1);
    }

    if (videoId && videoId.length === 11) {
        return videoId;
    }
    return null;

  } catch (error) {
    // Se a URL for inválida, o construtor de URL vai falhar.
    // Também tentamos uma expressão regular como último recurso.
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }
}

/**
 * Formata segundos em formato de timestamp [MM:SS].
 * @param seconds - A quantidade de segundos.
 * @returns A string formatada.
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `[${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}]`;
}