import React, { useState, useMemo } from 'react';
import { Lightbulb, Copy, Check, Sparkles, PencilRuler, Tags, FileText, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import BackButton from '@/components/BackButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import SeoCalculator from '@/components/SeoCalculator';
import { getSupabaseClient } from '@/lib/supabase';

// --- Tipos e Estruturas de Dados ---
type SectionType = 'titles' | 'description' | 'tags' | 'scriptStructure';

interface ContentPlan {
  title: string;
  titles?: string[]; // Marcado como opcional
  description: string;
  tags: string[];
  scriptStructure: {
    hook: string;
    introduction: string;
    mainPoints: string[];
    cta: string;
  };
}

// --- Componentes Auxiliares ---
const CopyableListItem: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success("Copiado!");
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <li className="flex items-center justify-between group py-1">
      <span className="text-white/90">{text}</span>
      <Button size="icon" variant="ghost" onClick={handleCopy} className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8">
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </Button>
    </li>
  );
};

// --- Componente Principal da Página ---
const Ideias: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contentPlan, setContentPlan] = useState<ContentPlan | null>(null);
  const [regeneratingSection, setRegeneratingSection] = useState<SectionType | null>(null);

  const handleGeneratePlan = async () => {
    if (!topic.trim()) {
      toast.error('Por favor, descreva a ideia central do seu vídeo.');
      return;
    }

    setIsLoading(true);
    setContentPlan(null);

    try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.functions.invoke('mestre-de-conteudo', {
            body: { topic, audience },
        });

        if (error) throw error;
        
        // --- CORREÇÃO DEFINITIVA APLICADA AQUI ---
        // Agora o código verifica se 'data.titles' existe. Se não, ele cria uma lista
        // que contém apenas o 'data.title' principal. Isso resolve o erro "not iterable".
        const finalPlan = {
          ...data,
          titles: data.titles && Array.isArray(data.titles) ? [data.title, ...data.titles] : [data.title],
        };

        setContentPlan(finalPlan as ContentPlan);
        toast.success("Seu plano de conteúdo foi gerado pela IA!");

    } catch (error: any) {
        console.error('Erro ao chamar a IA:', error);
        toast.error("A IA não conseguiu gerar o plano.", {
            description: error.data?.error || error.message || "Tente refazer sua pergunta ou aguarde um momento."
        });
    } finally {
        setIsLoading(false);
        setRegeneratingSection(null);
    }
  };

  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-8 w-3/4 mt-6" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
  
  const AccordionTriggerWithRegen: React.FC<{ section: SectionType; children: React.ReactNode; icon: React.ReactNode }> = ({ section, children, icon }) => (
    <div className="flex w-full items-center justify-between">
      <AccordionTrigger className="flex-1 text-left">
        <div className="flex items-center">
            {regeneratingSection === section 
              ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> 
              : React.cloneElement(icon as React.ReactElement, { className: "mr-2 h-5 w-5" })}
            {children}
        </div>
      </AccordionTrigger>
      {/* A lógica de regeneração de seção pode ser implementada no futuro */}
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

      {contentPlan && (
        <div className="animate-fade-in-up space-y-4">
          <SeoCalculator
            title={contentPlan.title}
            description={contentPlan.description}
            tags={contentPlan.tags}
            script={contentPlan.scriptStructure}
          />
          <Card className="bg-tubepro-darkAccent border-white/10 text-white mt-6">
            <CardHeader>
              <CardTitle className="text-xl">Seu Plano de Conteúdo Detalhado</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTriggerWithRegen section="titles" icon={<PencilRuler/>}>Títulos Sugeridos</AccordionTriggerWithRegen>
                  <AccordionContent>
                    <ul className="space-y-2 list-disc list-inside">
                      {contentPlan.titles?.map((title, i) => <CopyableListItem key={i} text={title} />)}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTriggerWithRegen section="description" icon={<FileText/>}>Descrição Otimizada</AccordionTriggerWithRegen>
                  <AccordionContent>
                    <Textarea readOnly value={contentPlan.description} className="min-h-48 bg-tubepro-dark whitespace-pre-line"/>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTriggerWithRegen section="tags" icon={<Tags/>}>Tags Estratégicas</AccordionTriggerWithRegen>
                  <AccordionContent>
                    <div className="flex flex-wrap gap-2">
                      {contentPlan.tags.map((tag, i) => <Badge key={i} variant="secondary">{tag}</Badge>)}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTriggerWithRegen section="scriptStructure" icon={<Lightbulb/>}>Estrutura do Roteiro</AccordionTriggerWithRegen>
                  <AccordionContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold">Gancho (Hook)</h4>
                      <p className="text-white/70 italic">"{contentPlan.scriptStructure.hook}"</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Introdução</h4>
                      <p className="text-white/70">{contentPlan.scriptStructure.introduction}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Pontos Principais</h4>
                      <ul className="list-disc list-inside text-white/70 space-y-1">
                        {contentPlan.scriptStructure.mainPoints.map((point, i) => <li key={i}>{point}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold">Chamada para Ação (CTA)</h4>
                      <p className="text-white/70">{contentPlan.scriptStructure.cta}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem