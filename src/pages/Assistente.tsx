// src/pages/Assistente.tsx

import React, { useState } from 'react';
import { Bot, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader'; // IMPORTANDO O NOVO CABEÇALHO

const Assistente: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateResponse = async () => {
    if (!prompt.trim()) {
      toast.error('Por favor, digite uma pergunta ou solicitação.');
      return;
    }

    setIsLoading(true);

    // Simulação de API
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      let simulatedResponse = '';

      if (prompt.toLowerCase().includes('ideia')) {
        simulatedResponse = 'Aqui estão algumas ideias para vídeos:\n\n1. "10 Dicas para Melhorar a Qualidade do Áudio"\n2. "Como Crescer no YouTube em 2025"\n3. "Tutorial: Edição Avançada com DaVinci Resolve"\n4. "Tendências de Conteúdo que Estão Bombando"\n5. "Guia Completo de Iluminação para Vídeos Profissionais"';
      } else if (prompt.toLowerCase().includes('roteiro')) {
        simulatedResponse = 'Para criar um roteiro eficaz, siga esta estrutura:\n\n1. Introdução cativante (10-15 segundos)\n2. Apresentação do problema ou tema\n3. Desenvolvimento principal com 3-5 pontos chave\n4. Demonstração ou exemplos práticos\n5. Conclusão e call-to-action\n\nLembre-se de manter uma linguagem clara e direta. Foque no benefício que o espectador terá ao assistir seu vídeo até o final.';
      } else if (prompt.toLowerCase().includes('seo') || prompt.toLowerCase().includes('algoritmo')) {
        simulatedResponse = 'Dicas de SEO para YouTube:\n\n• Use palavras-chave relevantes no título, descrição e tags\n• Crie thumbnails com alto CTR (taxa de cliques)\n• Aumente o tempo de visualização com conteúdo envolvente\n• Incentive interações (likes, comentários, compartilhamentos)\n• Publique consistentemente\n• Utilize hashtags estratégicas\n• Crie playlists temáticas\n• Otimize os primeiros 100 caracteres da descrição';
      } else {
        simulatedResponse = 'Como posso ajudar você a criar conteúdo melhor para o YouTube? Posso fornecer dicas sobre roteiros, ideias de vídeo, estratégias de SEO, edição, ou qualquer outro aspecto de produção de conteúdo.';
      }

      setResponse(simulatedResponse);
      setIsLoading(false);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Ocorreu um erro ao processar sua solicitação.');
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* NOVO CABEÇALHO APLICADO AQUI */}
      <PageHeader
        title={<>Assistente <span className="text-white font-bold">TubePro</span></>}
        description="Seu copiloto de IA para tirar dúvidas, ter insights e receber orientações personalizadas sobre seu canal."
      />
      
      {/* O RESTANTE DO CONTEÚDO DA PÁGINA PERMANECE IGUAL */}
      <div className="bg-tubepro-darkAccent rounded-xl p-6 mb-6">
        <p className="text-white/80 mb-4">
          Pergunte qualquer coisa sobre criação de conteúdo para YouTube. O assistente TubePro pode
          ajudar com ideias, roteiros, SEO, tendências e muito mais.
        </p>

        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ex: Me dê 5 dicas para melhorar a retenção dos meus vídeos..."
          className="bg-tubepro-dark border-white/10 min-h-24 mb-4"
        />

        <div className="flex justify-end">
          <Button
            onClick={handleGenerateResponse}
            disabled={isLoading}
            className="btn-gradient"
          >
            {isLoading ? 'Gerando...' : 'Gerar resposta'}
            {!isLoading && <Send size={16} />}
          </Button>
        </div>
      </div>

      {response && (
        <div className="bg-tubepro-darkAccent rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-3">Resposta:</h2>
          <div className="whitespace-pre-line text-white/80">
            {response}
          </div>
        </div>
      )}
    </>
  );
};

export default Assistente;