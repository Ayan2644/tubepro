// src/pages/Roteiro.tsx

import React, { useState, useRef, useEffect } from 'react';
import { FileText, Bot, User, Send, Sparkles, Loader2, ChevronDown, Timer, Copy, Check, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
// MUDANÇA IMPORTANTE: Importamos a instância 'supabase' diretamente
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { marked } from 'marked';
import PageHeader from '@/components/PageHeader';

// --- Tipos e Estruturas de Dados ---
type Stage = 'asking' | 'generating' | 'revealing' | 'finished';
interface ChatMessage { sender: 'ai' | 'user'; text: string; }
interface UserResponses { [key: number]: string; }

// --- Perguntas e Exemplos Estratégicos da IA ---
const STRATEGIC_QUESTIONS: string[] = [
  "Qual é a ideia ou tópico central que você quer abordar neste vídeo?",
  "Excelente. Qual é o objetivo principal deste vídeo?",
  "Entendido. Que emoção ou sentimento principal você quer que sua audiência sinta?",
  "Perfeito. Qual é a transformação que você promete ao espectador?",
  "Por último: escolha a profundidade do roteiro. Isso definirá o tamanho e o detalhamento do conteúdo."
];
const QUESTION_EXAMPLES: string[] = ["Ex: Os 5 maiores erros que editores de vídeo iniciantes cometem.", "Ex: Educar e ajudar novos criadores a fazerem vídeos com mais qualidade.", "Ex: Confiança e alívio, por saberem que podem evitar erros simples.", "Ex: No final, eles saberão exatamente quais erros não cometer e como corrigi-los.", ""];
const DURATION_OPTIONS = [ "Curto (3-5 min)", "Médio (8-12 min)", "Longo (15+ min)" ];

// --- Componente para Renderizar o Roteiro com Markdown ---
const ScriptPart: React.FC<{ content: string }> = ({ content }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(content).then(() => {
            setCopied(true);
            toast.success("Parte do roteiro copiada!");
            setTimeout(() => setCopied(false), 2000);
        });
    };
    const rawMarkup = marked.parse(content.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/,""));

    return (
        <div className="relative group pb-4 mb-4 border-b border-dashed border-white/10">
            <Button size="icon" variant="ghost" onClick={handleCopy} className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-white/70" />}
            </Button>
            <div
                className="prose prose-sm prose-invert max-w-none prose-p:text-white/90 prose-headings:text-tubepro-yellow prose-strong:text-white"
                dangerouslySetInnerHTML={{ __html: rawMarkup }}
            />
        </div>
    );
};

// --- Componente Principal ---
const Roteiro: React.FC = () => {
  const [stage, setStage] = useState<Stage>('asking');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([ { sender: 'ai', text: `Olá! Eu sou seu copiloto de roteiros. Para arquitetar uma obra-prima para seu canal, preciso entender sua visão a fundo. Vamos começar:`}, { sender: 'ai', text: STRATEGIC_QUESTIONS[0] } ]);
  const [userResponses, setUserResponses] = useState<UserResponses>({});
  const [currentUserInput, setCurrentUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scriptParts, setScriptParts] = useState<string[]>([]);
  const [revealedScriptParts, setRevealedScriptParts] = useState(0);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [scriptTitle, setScriptTitle] = useState('');
  const { user } = useAuth();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

  const processAndGenerate = async (finalResponses: UserResponses) => {
    setIsLoading(true); setScriptParts([]); setRevealedScriptParts(0); setStage('generating');
    let accumulatedResponse = '';
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Usuário não autenticado.");
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/roteirista-ia`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}`, 'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY },
          body: JSON.stringify(finalResponses),
      });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || `HTTP error! status: ${response.status}`); }
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Não foi possível ler a resposta do servidor.");
      const decoder = new TextDecoder();
      while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulatedResponse += decoder.decode(value, { stream: true });
      }
      const parts = accumulatedResponse.split('---PART-BREAK---').filter(p => p.trim() !== '');
      setScriptParts(parts);
      setRevealedScriptParts(1);
      setStage('revealing');
      toast.success("O Roteiro Mestre está pronto!");
    } catch (error: any) {
      toast.error("A IA não conseguiu gerar o roteiro.", { description: error.message || "Tente novamente mais tarde." });
      setStage('asking');
    } finally {
      setIsLoading(false);
    }
  }

  const handleResponseSubmit = (response: string) => {
    const isFinal = currentQuestionIndex === STRATEGIC_QUESTIONS.length - 1;
    const newHistory: ChatMessage[] = [...chatHistory, { sender: 'user', text: response }];
    const newResponses = { ...userResponses, [currentQuestionIndex]: response };
    setUserResponses(newResponses);
    setCurrentUserInput('');

    if (isFinal) {
      newHistory.push({ sender: 'ai', text: "Excelente briefing. Com base nas suas respostas, estou arquitetando um roteiro profundo e detalhado..." });
      setChatHistory(newHistory);
      processAndGenerate(newResponses);
    } else {
      const nextQuestionIndex = currentQuestionIndex + 1;
      newHistory.push({ sender: 'ai', text: STRATEGIC_QUESTIONS[nextQuestionIndex] });
      setChatHistory(newHistory);
      setCurrentQuestionIndex(nextQuestionIndex);
    }
  };

  const handleRevealNext = () => {
    if (revealedScriptParts < scriptParts.length) {
      setRevealedScriptParts(p => p + 1);
    }
    if (revealedScriptParts === scriptParts.length - 1) {
        setStage('finished');
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        toast.success("Copiado para a área de transferência!");
    });
  };

  const handleSaveScript = async () => {
    if (!scriptTitle.trim()) {
        toast.error("Por favor, dê um título ao seu roteiro.");
        return;
    }
    if (!user) {
        toast.error("Você precisa estar logado para salvar.");
        return;
    }

    const fullScript = scriptParts.join('\n\n---PART-BREAK---\n\n');

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

  return (
    <>
      <PageHeader
        title={
          <>
            Criador de <span className="text-white font-bold">Roteiros</span>
          </>
        }
        description="Responda um briefing estratégico e receba um roteiro profundo e conversacional, pronto para ser gravado."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-tubepro-darkAccent border-white/10 text-white">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bot className="text-tubepro-yellow"/> Briefing com a IA</CardTitle>
                <CardDescription>Responda as perguntas para gerar seu roteiro.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-96 overflow-y-auto space-y-4 p-4 rounded-md bg-tubepro-dark mb-4">
                    {chatHistory.map((msg, index) => (
                        <div key={index} className={cn("flex items-start gap-3", msg.sender === 'user' && 'justify-end')}>
                            {msg.sender === 'ai' && <Bot className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />}
                            <div className={cn("max-w-md rounded-lg p-3 text-white", msg.sender === 'ai' ? 'bg-white/5' : 'bg-tubepro-red/80')}>
                                <p className="whitespace-pre-line">{msg.text}</p>
                            </div>
                            {msg.sender === 'user' && <User className="h-6 w-6 text-white flex-shrink-0 mt-1" />}
                        </div>
                    ))}
                  <div ref={chatEndRef} />
                </div>
                {stage === 'asking' && (currentQuestionIndex === STRATEGIC_QUESTIONS.length - 1 ? (<div className="space-y-2">{DURATION_OPTIONS.map(opt => <Button key={opt} variant="outline" className="w-full justify-start" onClick={() => handleResponseSubmit(opt)}><Timer className="mr-2 h-4 w-4"/> {opt}</Button>)}</div>) : (<div className="flex items-center gap-2"><Textarea value={currentUserInput} onChange={(e) => setCurrentUserInput(e.target.value)} placeholder={QUESTION_EXAMPLES[currentQuestionIndex]} className="bg-tubepro-dark border-white/10" onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleResponseSubmit(currentUserInput); } }} /><Button onClick={() => handleResponseSubmit(currentUserInput)} className="btn-gradient h-full"><Send className="h-5 w-5" /></Button></div>))}
            </CardContent>
        </Card>
        <Card className="bg-tubepro-darkAccent border-white/10 text-white">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="text-tubepro-yellow"/> Roteiro Gerado</CardTitle>
                <CardDescription>Seu roteiro completo aparecerá aqui.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[28.5rem] overflow-y-auto space-y-4 p-4 rounded-md bg-tubepro-dark">
                    {isLoading && <div className="flex flex-col items-center justify-center h-full text-center text-white/70"><Loader2 className="h-10 w-10 animate-spin text-red-500" /><p className="font-semibold">A IA está escrevendo...</p></div>}
                    {(stage === 'revealing' || stage === 'finished') && scriptParts.slice(0, revealedScriptParts).map((part, index) => <ScriptPart key={index} content={part} />)}
                    {stage === 'asking' && !isLoading && <div className="flex items-center justify-center h-full text-center text-white/50"><p>Seu roteiro aparecerá aqui após o briefing.</p></div>}
                </div>
                {stage === 'revealing' && <div className="text-center mt-4"><Button onClick={handleRevealNext} variant="outline" className="animate-pulse">Devo seguir? (Revelar Parte {revealedScriptParts + 1})<ChevronDown className="ml-2 h-4 w-4" /></Button></div>}
                {stage === 'finished' && <div className="flex items-center justify-center gap-2 mt-4"><Button variant="outline" onClick={() => copyToClipboard(scriptParts.join('\n\n'))}><Copy className="mr-2 h-4 w-4" /> Copiar Tudo</Button><Button className="btn-gradient" onClick={() => setIsSaveDialogOpen(true)}><Save className="mr-2 h-4 w-4"/> Salvar Roteiro</Button></div>}
            </CardContent>
        </Card>
      </div>

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="bg-tubepro-darkAccent border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Salvar Roteiro</DialogTitle>
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

export default Roteiro;