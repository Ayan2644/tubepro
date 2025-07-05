// src/components/ContentPlanDisplay.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Lightbulb, PencilRuler, Tags, FileText, Copy, Check } from 'lucide-react';
import SeoCalculator from '@/components/SeoCalculator';
import { toast } from 'sonner';

// Tipagem para o plano de conteúdo
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

// Componente para um item da lista que pode ser copiado
const CopyableListItem: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = React.useState(false);
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

interface ContentPlanDisplayProps {
  contentPlan: ContentPlan;
}

export const ContentPlanDisplay: React.FC<ContentPlanDisplayProps> = ({ contentPlan }) => {
  if (!contentPlan) {
    return null;
  }

  return (
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
              <AccordionTrigger>
                <div className="flex items-center">
                  <PencilRuler className="mr-2 h-5 w-5" />
                  Títulos Sugeridos
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 list-disc list-inside">
                  {contentPlan.titles?.map((title, i) => <CopyableListItem key={i} text={title} />)}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>
                <div className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Descrição Otimizada
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Textarea readOnly value={contentPlan.description} className="min-h-48 bg-tubepro-dark whitespace-pre-line"/>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>
                <div className="flex items-center">
                  <Tags className="mr-2 h-5 w-5" />
                  Tags Estratégicas
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-wrap gap-2">
                  {contentPlan.tags.map((tag, i) => <Badge key={i} variant="secondary">{tag}</Badge>)}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>
                <div className="flex items-center">
                  <Lightbulb className="mr-2 h-5 w-5" />
                  Estrutura do Roteiro
                </div>
              </AccordionTrigger>
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
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};