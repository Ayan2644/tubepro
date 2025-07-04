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
 * Extrai o ID do vídeo de uma URL do YouTube.
 * @param url - A URL do YouTube.
 * @returns O ID do vídeo ou null se não for uma URL válida.
 */
export function extractYoutubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
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