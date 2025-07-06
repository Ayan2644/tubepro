// src/utils/transcriptionService.ts

export interface TranscriptionResult {
  text: string;
  segments?: Array<{
    id: number;
    start: number;
    end: number;
    text: string;
  }>;
}

export const extractYoutubeVideoId = (url: string): string | null => {
  let videoId: string | null = null;

  // Regex para URLs padrão do YouTube (watch?v=, youtu.be/, embed/, v/)
  const standardRegex = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/;
  const standardMatch = url.match(standardRegex);

  if (standardMatch && standardMatch[1]) {
    videoId = standardMatch[1];
  } else {
    // Regex para URLs do Googleusercontent.com
    const googleusercontentRegex = /(?:https?:\/\/)?googleusercontent\.com\/youtube\.com\/([\w-]{11})(?:\S+)?/;
    const googleusercontentMatch = url.match(googleusercontentRegex);
    if (googleusercontentMatch && googleusercontentMatch[1]) {
      videoId = googleusercontentMatch[1];
    }
  }

  return videoId;
};

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const parts = [];
  if (hours > 0) {
    parts.push(String(hours).padStart(2, '0'));
  }
  parts.push(String(minutes).padStart(2, '0'));
  parts.push(String(remainingSeconds).padStart(2, '0'));

  return parts.join(':');
};