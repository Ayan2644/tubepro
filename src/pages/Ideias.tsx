// src/pages/Ideias.tsx

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getSupabaseClient } from '@/lib/supabase';
import { ContentPlanDisplay } from '@/components/ContentPlanDisplay';
import PageHeader from '@/components/PageHeader';
import { Save, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';

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
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [scriptTitle, setScriptTitle] = useState('');
  const { user } = useAuth();

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

  const handleSaveScript = async () => {
    if (!scriptTitle.trim()) {
      toast.error("Por favor, dê um título ao seu roteiro.");
      return;
    }
    if (!user || !contentPlan) {
      toast.error("Você precisa estar logado e ter um plano de conteúdo para salvar.");
      return;
    }

    const fullScript = `
# Título
${contentPlan.title}

## Descrição
${contentPlan.description}

## Tags
${contentPlan.tags.join(', ')}

## Estrutura do Roteiro

### Gancho (Hook)
${contentPlan.scriptStructure.hook}

### Introdução
${contentPlan.scriptStructure.introduction}

### Pontos Principais
${contentPlan.scriptStructure.mainPoints.join('\n\n')}

### Chamada para Ação (CTA)
${contentPlan.scriptStructure.cta}
`;

    const supabase = getSupabaseClient();

    const { error } = await supabase.from('scripts').insert({
        user_id: user.id,
        title: scriptTitle,
        content: fullScript
    });

    if (error) {
        toast.error("Falha ao salvar o roteiro.", { description: error.message });
    } else {
        toast.success(`Roteiro "${scriptTitle}" salvo com sucesso!`);
        setIsSaveDialogOpen(false);
        setScriptTitle('');
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
    <>
      <PageHeader
        title="Mestre de Conteúdo IA"
        description="Transforme uma simples ideia em um plano de conteúdo completo, com títulos, descrições, tags e uma estrutura de roteiro otimizada para engajamento."
      />
      
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
      
      {contentPlan && !isLoading && (
        <>
          <ContentPlanDisplay contentPlan={contentPlan} />
          <div className="flex justify-center mt-4">
            <Button onClick={() => setIsSaveDialogOpen(true)} className="btn-gradient">
              <Save className="mr-2 h-4 w-4" />
              Salvar como Roteiro
            </Button>
          </div>
        </>
      )}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>{/* ...código do dialog... */}</Dialog>
    </>
  );
};

export default Ideias;