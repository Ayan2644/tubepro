// src/pages/Assistente.tsx

import React, { useState } from 'react';
import { Bot, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import { getAssistantResponse } from '@/services/api';
import { marked } from 'marked';
// --- CORREÇÃO APLICADA AQUI ---
// A importação dos componentes de Card foi adicionada.
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    setResponse(''); // Limpa a resposta anterior

    try {
      const stream = await getAssistantResponse(prompt);
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        setResponse((prev) => prev + chunk);
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Converte a resposta em Markdown para HTML
  const formattedResponse = marked.parse(response);

  return (
    <>
      <PageHeader
        title={<>Assistente <span className="text-white font-bold">TubePro</span></>}
        description="Seu copiloto de IA para tirar dúvidas, ter insights e receber orientações personalizadas sobre seu canal."
      />
      
      <div className="bg-tubepro-darkAccent rounded-xl p-6 mb-6">
        <p className="text-white/80 mb-4">
          Pergunte qualquer coisa sobre criação de conteúdo para YouTube. O assistente TubePro pode
          ajudar com ideias, roteiros, SEO, tendências e muito mais.
        </p>

        <div className="flex items-start gap-2">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Me dê 5 dicas para melhorar a retenção dos meus vídeos..."
            className="bg-tubepro-dark border-white/10 min-h-24"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleGenerateResponse();
              }
            }}
          />

          <Button
            onClick={handleGenerateResponse}
            disabled={isLoading}
            className="btn-gradient h-full p-4"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </Button>
        </div>
      </div>

      {(isLoading && !response) && (
        <div className="flex justify-center items-center p-6 bg-tubepro-darkAccent rounded-xl">
            <Loader2 className="h-8 w-8 animate-spin text-tubepro-red" />
            <p className="ml-4 text-white/70">O assistente está pensando...</p>
        </div>
      )}

      {response && (
        <Card className="bg-tubepro-darkAccent border-white/10 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Bot className="text-tubepro-yellow" /> Resposta do Assistente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
                className="prose prose-sm prose-invert max-w-none prose-p:text-white/90 prose-headings:text-white prose-strong:text-white prose-ul:text-white/90"
                dangerouslySetInnerHTML={{ __html: formattedResponse }}
            />
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default Assistente;