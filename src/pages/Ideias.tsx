
import React, { useState } from 'react';
import { Lightbulb, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import BackButton from '@/components/BackButton';

interface IdeaCard {
  title: string;
  description: string;
}

const Ideias: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('todos');
  const [isLoading, setIsLoading] = useState(false);
  const [ideas, setIdeas] = useState<IdeaCard[]>([]);

  const handleGenerateIdeas = async () => {
    if (!topic.trim()) {
      toast.error('Por favor, informe um tópico para gerar ideias.');
      return;
    }

    setIsLoading(true);
    
    // Simulação de API
    try {
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      // Lista de ideias simuladas baseadas no tópico
      const simulatedIdeas: IdeaCard[] = [
        {
          title: `10 Mitos sobre ${topic} que você acreditava serem verdade`,
          description: `Um vídeo desmistificando concepções comuns sobre ${topic} com fatos e dados comprovados cientificamente.`
        },
        {
          title: `Como ${topic} está mudando em 2025: Tendências e Previsões`,
          description: `Análise das tendências emergentes relacionadas a ${topic} e como elas podem evoluir no próximo ano.`
        },
        {
          title: `O guia definitivo para iniciantes em ${topic}`,
          description: `Um tutorial completo para quem está começando em ${topic}, explicando os fundamentos e dicas práticas.`
        },
        {
          title: `Os 5 erros mais comuns ao trabalhar com ${topic}`,
          description: `Identificação dos equívocos frequentes relacionados a ${topic} e como evitá-los para obter melhores resultados.`
        },
        {
          title: `${topic} vs. Alternativas: Qual a melhor opção?`,
          description: `Uma comparação detalhada entre ${topic} e outras alternativas disponíveis no mercado, analisando prós e contras.`
        }
      ];
      
      setIdeas(simulatedIdeas);
      setIsLoading(false);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Ocorreu um erro ao gerar ideias.');
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Lightbulb className="text-tubepro-red w-8 h-8" />
          <h1 className="text-2xl font-bold">Gerador de Ideias de Vídeos</h1>
        </div>
        <BackButton to="/" />
      </div>
      
      <div className="bg-tubepro-darkAccent rounded-xl p-6 mb-8">
        <div className="mb-4">
          <Label htmlFor="topic">Tópico ou Nicho</Label>
          <Input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ex: Marketing Digital, Tecnologia, Culinária..."
            className="bg-tubepro-dark border-white/10 mt-1"
          />
        </div>
        
        <div className="mb-6">
          <Label>Público-alvo</Label>
          <RadioGroup 
            value={audience} 
            onValueChange={setAudience}
            className="mt-2 flex flex-wrap gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="todos" id="todos" />
              <Label htmlFor="todos">Todos</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="iniciantes" id="iniciantes" />
              <Label htmlFor="iniciantes">Iniciantes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="intermediarios" id="intermediarios" />
              <Label htmlFor="intermediarios">Intermediários</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="avancados" id="avancados" />
              <Label htmlFor="avancados">Avançados</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleGenerateIdeas} 
            disabled={isLoading}
            className="btn-gradient"
          >
            {isLoading ? 'Gerando...' : 'Gerar Ideias'}
            {isLoading ? <RotateCw className="ml-2 h-4 w-4 animate-spin" /> : <Lightbulb className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      {ideas.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Ideias Geradas:</h2>
          
          <div className="space-y-4">
            {ideas.map((idea, idx) => (
              <div 
                key={idx} 
                className="bg-tubepro-darkAccent rounded-lg p-4 border border-white/10 hover:border-tubepro-red/40 transition-colors"
              >
                <h3 className="text-lg font-medium mb-2">{idea.title}</h3>
                <p className="text-white/70">{idea.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Ideias;
