// src/pages/Ideias.tsx

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import BackButton from '@/components/BackButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getSupabaseClient } from '@/lib/supabase';
import { ContentPlanDisplay } from '@/components/ContentPlanDisplay';

interface ContentPlan {
  title: string;
  titles?: string[];
  description: string;
  tags: string[];
  scriptStructure: {
    hook: string;
    introduction: string;
    mainPoints: string[];
    cta: string;
  };
}

const Ideias: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contentPlan, setContentPlan] = useState<ContentPlan | null>(null);

  const handleGeneratePlan = async () => {
    if (!topic.trim()) {
      toast.error('Por favor, descreva a ideia central do seu vídeo.');
      return;
    }

    setIsLoading(true);
    setContentPlan(null);

    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Usuário não autenticado.");

      const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mestre-de-conteudo`,
          {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session.access_token}`,
                  'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
              },
              body: JSON.stringify({ topic, audience }),
          }
      );

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Não foi possível ler a resposta do servidor.");
      
      const decoder = new TextDecoder();
      let accumulatedResponse = '';
      
      while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulatedResponse += decoder.decode(value, { stream: true });
      }
      
      const cleanedResponse = accumulatedResponse.replace(/```json|```/g, '').trim();
      const finalPlan = JSON.parse(cleanedResponse); 
      
      setContentPlan({
          ...finalPlan,
          titles: finalPlan.titles && Array.isArray(finalPlan.titles) ? [finalPlan.title, ...finalPlan.titles] : [finalPlan.title],
      });

      toast.success("Seu plano de conteúdo foi gerado pela IA!");

    } catch (error: any) {
      console.error('Erro ao chamar a IA:', error);
      toast.error("A IA não conseguiu gerar o plano.", {
          description: error.message || "Tente refazer sua pergunta ou aguarde um momento."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-8 w-3/4 mt-6" />
      <Skeleton className="h-32 w-full" />
    </div>
  );

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="text-tubepro-red w-8 h-8" />
          <h1 className="text-2xl font-bold">Mestre de Conteúdo IA</h1>
        </div>
        <BackButton to="/" />
      </div>
      
      <Card className="bg-tubepro-darkAccent border-white/10 text-white mb-8">
        <CardHeader>
          <CardTitle>Gere um Plano de Conteúdo Completo</CardTitle>
          <p className="text-white/60">Forneça os detalhes e deixe a IA criar a estratégia para o seu próximo vídeo de sucesso.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="topic">Qual é a ideia ou tópico central do seu vídeo?</Label>
            <Textarea id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Ex: Como viralizar na internet" className="bg-tubepro-dark border-white/10 mt-1 min-h-20" />
          </div>
          <div>
            <Label htmlFor="audience">Para quem é este vídeo? (Público-alvo)</Label>
            <Input id="audience" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Ex: Criadores de conteúdo iniciantes" className="bg-tubepro-dark border-white/10 mt-1" />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleGeneratePlan} disabled={isLoading} className="btn-gradient">
              <Sparkles className="mr-2 h-4 w-4" />
              {isLoading ? 'Gerando Plano...' : 'Gerar Plano de Conteúdo'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && renderLoadingSkeleton()}
      
      {contentPlan && !isLoading && <ContentPlanDisplay contentPlan={contentPlan} />}
    </div>
  );
};

export default Ideias;