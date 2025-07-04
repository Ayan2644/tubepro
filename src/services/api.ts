import type { TranscriptionResult } from '@/utils/transcriptionService';

/**
 * Simula a transcrição de um vídeo do YouTube.
 * Em uma implementação real, esta função faria uma chamada para o seu backend.
 * @param url - A URL do vídeo do YouTube.
 */
export async function transcribeYoutubeVideo(url: string): Promise<TranscriptionResult> {
  console.log(`Iniciando transcrição da URL: ${url}`);

  // Simulação de delay da API
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Simulação de possíveis erros
  if (url.includes('error')) {
    throw new Error('Falha ao transcrever: Vídeo indisponível ou com restrições.');
  }

  // Dados simulados para demonstração
  return {
    text: `[00:00] Olá a todos e bem-vindos ao canal!\n[00:05] Hoje vamos falar sobre como criar conteúdo para o YouTube.\n[00:12] Uma das coisas mais importantes é ter um bom roteiro.\n[00:18] Também é essencial usar boas ferramentas de edição.\n[00:25] Não se esqueça de otimizar seu vídeo para SEO.\n[00:32] Use títulos chamativos e descrições bem detalhadas.\n[00:40] Thumbnails atraentes são cruciais para aumentar o CTR.\n[00:48] Interaja com sua audiência nos comentários.\n[00:55] Consistência é chave para crescer no YouTube.\n[01:02] Obrigado por assistir, não se esqueça de se inscrever!`,
    segments: [
      { id: 1, start: 0, end: 5, text: "Olá a todos e bem-vindos ao canal!" },
      { id: 2, start: 5, end: 12, text: "Hoje vamos falar sobre como criar conteúdo para o YouTube." },
    ]
  };
}

/**
 * Simula a transcrição de um arquivo de vídeo/áudio.
 * @param file - O arquivo a ser transcrito.
 */
export async function transcribeVideoFile(file: File): Promise<TranscriptionResult> {
  console.log(`Iniciando transcrição do arquivo: ${file.name}`);

  // Simulação de delay da API
  await new Promise(resolve => setTimeout(resolve, 2500));

  if (file.name.includes('error')) {
    throw new Error('Falha ao transcrever: Formato de arquivo não suportado.');
  }

  // Dados simulados para demonstração
  return {
    text: `[00:00] Este é um exemplo de transcrição de arquivo.\n[00:06] A ferramenta funciona tanto para vídeos do YouTube quanto para arquivos.\n[00:13] As transcrições são precisas e incluem marcações de tempo.\n[00:20] Você pode copiar a transcrição e usá-la como quiser.\n[00:27] Esta é uma demonstração do serviço de transcrição.`,
    segments: [
      { id: 1, start: 0, end: 6, text: "Este é um exemplo de transcrição de arquivo." },
      { id: 2, start: 6, end: 13, text: "A ferramenta funciona tanto para vídeos do YouTube quanto para arquivos." },
    ]
  };
}

/**
 * Simula a obtenção de uma resposta do assistente de IA.
 * @param prompt - A pergunta ou solicitação do usuário.
 */
export async function getAssistantResponse(prompt: string): Promise<string> {
    console.log(`Enviando prompt para o assistente: ${prompt}`);
    
    // Simulação de delay da API
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulação de possíveis erros
    if (prompt.toLowerCase().includes('quebrar')) {
        throw new Error("Não foi possível processar sua solicitação no momento.");
    }

    // Respostas simuladas baseadas em palavras-chave
    if (prompt.toLowerCase().includes('ideia')) {
        return 'Aqui estão algumas ideias para vídeos:\n\n1. "10 Dicas para Melhorar a Qualidade do Áudio"\n2. "Como Crescer no YouTube em 2025"\n3. "Tutorial: Edição Avançada com DaVinci Resolve"\n4. "Tendências de Conteúdo que Estão Bombando"\n5. "Guia Completo de Iluminação para Vídeos Profissionais"';
    } 
    if (prompt.toLowerCase().includes('roteiro')) {
        return 'Para criar um roteiro eficaz, siga esta estrutura:\n\n1. Introdução cativante (10-15 segundos)\n2. Apresentação do problema ou tema\n3. Desenvolvimento principal com 3-5 pontos chave\n4. Demonstração ou exemplos práticos\n5. Conclusão e call-to-action\n\nLembre-se de manter uma linguagem clara e direta. Foque no benefício que o espectador terá ao assistir seu vídeo até o final.';
    }
    if (prompt.toLowerCase().includes('seo') || prompt.toLowerCase().includes('algoritmo')) {
        return 'Dicas de SEO para YouTube:\n\n• Use palavras-chave relevantes no título, descrição e tags\n• Crie thumbnails com alto CTR (taxa de cliques)\n• Aumente o tempo de visualização com conteúdo envolvente\n• Incentive interações (likes, comentários, compartilhamentos)\n• Publique consistentemente\n• Utilize hashtags estratégicas\n• Crie playlists temáticas\n• Otimize os primeiros 100 caracteres da descrição';
    }
    
    return 'Como posso ajudar você a criar conteúdo melhor para o YouTube? Posso fornecer dicas sobre roteiros, ideias de vídeo, estratégias de SEO, edição, ou qualquer outro aspecto de produção de conteúdo.';
}