import React, { useState, useRef, useEffect } from 'react';
import { FileText, Bot, User, Send, ChevronDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import BackButton from '@/components/BackButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// --- Tipos e Estruturas de Dados ---
type Stage = 'asking' | 'generating' | 'revealing';

interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
}

interface UserResponses {
  [key: number]: string;
}

interface GeneratedContent {
  title: string;
  description: string;
  tags: string[];
  scriptParts: string[];
}

// --- Perguntas Estratégicas da IA ---
const STRATEGIC_QUESTIONS: string[] = [
  "Para começarmos, qual é a ideia, tópico ou pergunta central que você quer abordar neste vídeo?",
  "Excelente. Agora, qual é o objetivo principal deste vídeo? (Ex: Educar, gerar vendas, construir autoridade, etc.)",
  "Entendido. E que emoção central você quer que sua audiência sinta? (Ex: Motivação, confiança, curiosidade, alívio)",
  "Perfeito. Qual é a transformação que você promete? O que o espectador será capaz de fazer ou entender depois de assistir que não conseguia antes?",
  "Por último, mas crucial: qual é a duração ideal que você imagina para este vídeo? (Ex: 5-8 min, 10-15 min, 20+ min). A profundidade do roteiro dependerá disso."
];

// --- Componente Principal ---
const Roteiro: React.FC = () => {
  const [stage, setStage] = useState<Stage>('asking');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { sender: 'ai', text: `Olá! Eu sou o TubePro, seu roteirista. Para arquitetar uma obra-prima para seu canal, preciso entender sua visão a fundo. Vamos começar:` },
    { sender: 'ai', text: STRATEGIC_QUESTIONS[0] }
  ]);
  const [userResponses, setUserResponses] = useState<UserResponses>({});
  const [currentUserInput, setCurrentUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [revealedScriptParts, setRevealedScriptParts] = useState(0);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!currentUserInput.trim()) return;

    const newHistory: ChatMessage[] = [...chatHistory, { sender: 'user', text: currentUserInput }];
    const newResponses = { ...userResponses, [currentQuestionIndex]: currentUserInput };
    
    setUserResponses(newResponses);
    setCurrentUserInput('');

    if (currentQuestionIndex < STRATEGIC_QUESTIONS.length - 1) {
      const nextQuestionIndex = currentQuestionIndex + 1;
      setChatHistory([...newHistory, { sender: 'ai', text: STRATEGIC_QUESTIONS[nextQuestionIndex] }]);
      setCurrentQuestionIndex(nextQuestionIndex);
    } else {
      setChatHistory([...newHistory, { sender: 'ai', text: "Perfeito. Sua visão está clara. Com base em anos de estudo sobre narrativa e o algoritmo do YouTube, vou agora estruturar seu roteiro. Isso pode levar um momento..." }]);
      setStage('generating');
      setIsLoading(true);

      // Simulação da Geração de Conteúdo pela IA
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      const topic = newResponses[0];
      const duration = newResponses[4];
      const scriptLength = duration.includes('20') ? 20000 : duration.includes('10') ? 15000 : 12000;
      
      const simulatedContent: GeneratedContent = {
        title: `A Verdade Sobre ${topic} que Ninguém Te Contou`,
        description: `Esqueça tudo que você achou que sabia sobre ${topic}. Neste vídeo, vamos fundo em um nível de detalhe que você não encontrará em outro lugar. Prepare-se para uma verdadeira transformação na sua maneira de ver este assunto.\n\nCapítulos:\n00:00 - A Ilusão Inicial\n03:15 - O Pilar Esquecido\n...`,
        tags: [topic, `masterclass ${topic}`, `segredos de ${topic}`, `${topic} explicado`, `a verdade sobre ${topic}`],
        scriptParts: Array(5).fill('').map((_, i) => 
          `ROTEIRO - PARTE ${i + 1} de 5\n\n(A resposta aqui seria um texto contínuo, denso e narrativo, com ${scriptLength / 5} caracteres, simulando a profundidade solicitada no prompt. Sem bullets, sem emojis, apenas a voz autêntica do criador, pronta para ser gravada... Esta parte detalharia um aspecto do roteiro, conectando-se fluidamente com a anterior e preparando para a próxima.)`
        )
      };

      setGeneratedContent(simulatedContent);
      setIsLoading(false);
      setStage('revealing');
      setRevealedScriptParts(1); // Revela a primeira parte automaticamente
      toast.success("O Roteiro Mestre está pronto. Vamos revelá-lo.");
    }
  };
  
  const handleRevealNextPart = () => {
    if (revealedScriptParts < (generatedContent?.scriptParts.length || 0)) {
        toast.info(`Revelando parte ${revealedScriptParts + 1}...`);
        setRevealedScriptParts(prev => prev + 1);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="text-tubepro-red w-8 h-8" />
          <h1 className="text-2xl font-bold">Criador de Roteiros</h1>
        </div>
        <BackButton to="/" />
      </div>

      <Card className="bg-tubepro-darkAccent border-white/10 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bot className="text-tubepro-red"/> Consultoria com TubePro - Roteiros</CardTitle>
        </CardHeader>
        <CardContent>
          {stage === 'asking' && (
            <>
              <div className="h-96 overflow-y-auto space-y-4 p-4 rounded-md bg-tubepro-dark">
                {chatHistory.map((msg, index) => (
                  <div key={index} className={cn("flex items-start gap-3", msg.sender === 'user' && 'justify-end')}>
                    {msg.sender === 'ai' && <Bot className="h-6 w-6 text-tubepro-red flex-shrink-0" />}
                    <div className={cn("max-w-md rounded-lg p-3", msg.sender === 'ai' ? 'bg-white/5' : 'bg-tubepro-red/80')}>
                      <p className="text-white whitespace-pre-line">{msg.text}</p>
                    </div>
                    {msg.sender === 'user' && <User className="h-6 w-6 text-white flex-shrink-0" />}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Textarea value={currentUserInput} onChange={(e) => setCurrentUserInput(e.target.value)} placeholder="Sua resposta..." className="bg-tubepro-dark border-white/10" onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} />
                <Button onClick={handleSendMessage} className="btn-gradient h-full"><Send className="h-5 w-5" /></Button>
              </div>
            </>
          )}

          {stage === 'generating' && (
            <div className="text-center py-10 space-y-4">
                <Sparkles className="h-16 w-16 text-tubepro-red mx-auto animate-pulse" />
                <p className="text-xl font-semibold">Arquitetando seu roteiro...</p>
                <p className="text-white/70">Combinando estratégia e criatividade. Aguarde.</p>
            </div>
          )}

          {stage === 'revealing' && generatedContent && (
             <div className="animate-fade-in-up space-y-6">
                <div>
                    <h3 className="font-bold text-lg">Título Magnético:</h3>
                    <p className="text-white/80 text-xl italic">"{generatedContent.title}"</p>
                </div>
                <div>
                    <h3 className="font-bold text-lg">Descrição Estratégica:</h3>
                    <Textarea readOnly value={generatedContent.description} className="min-h-32 bg-tubepro-dark whitespace-pre-line"/>
                </div>
                <div>
                    <h3 className="font-bold text-lg">Tags Eficazes:</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {generatedContent.tags.map((tag, i) => <Badge key={i} variant="secondary">{tag}</Badge>)}
                    </div>
                </div>
                 <h3 className="font-bold text-lg pt-4 border-t border-white/10 mt-6">Roteiro Mestre:</h3>
                 {generatedContent.scriptParts.slice(0, revealedScriptParts).map((part, index) => (
                    <Card key={index} className="bg-tubepro-dark border-white/10 animate-fade-in-up">
                        <CardContent className="p-4">
                            <p className="whitespace-pre-line text-white/90 leading-relaxed">{part}</p>
                        </CardContent>
                    </Card>
                 ))}
                 {revealedScriptParts < generatedContent.scriptParts.length && (
                    <div className="text-center mt-4">
                        <Button onClick={handleRevealNextPart} variant="outline" className="animate-pulse">
                            Entendi, pode continuar
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                 )}
                  {revealedScriptParts === generatedContent.scriptParts.length && (
                     <div className="text-center mt-4 text-green-400 font-semibold">
                         Roteiro completo revelado!
                     </div>
                  )}
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Roteiro;