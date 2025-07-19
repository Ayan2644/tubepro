// src/pages/Ideias.tsx

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
// NOVO: Importamos a função diretamente do nosso serviço de API
import { generateContentPlan } from '@/services/api';
import { supabase } from '@/lib/supabase';
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
      // MUDANÇA SIGNIFICATIVA: A lógica complexa de 'fetch' foi substituída
      // por uma única chamada de função ao nosso novo serviço.
      const stream = await generateContentPlan(topic, audience);
      
      const reader = stream.getReader();
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
      console.error('Erro ao gerar plano de conteúdo:', error);
      // O toast de erro já é tratado pelo apiService, então não precisamos de outro aqui.
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
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="bg-tubepro-darkAccent border-white/10 text-white">
            <DialogHeader>
                <DialogTitle>Salvar Plano como Roteiro</DialogTitle>
                <DialogDescription>Dê um nome ao seu roteiro para encontrá-lo facilmente no seu histórico.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Input
                    placeholder="Ex: Roteiro sobre Marketing Digital V1"
                    value={scriptTitle}
                    onChange={(e) => setScriptTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveScript(); }}
                />
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsSaveDialogOpen(false)}>Cancelar</Button>
                <Button className="btn-gradient" onClick={handleSaveScript}>Salvar</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Ideias;