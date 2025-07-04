import React, { useState, useEffect } from 'react';
import { FileText, Copy, Check, RefreshCcw, Download, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import BackButton from '@/components/BackButton';
import { getSupabaseClient, isSupabaseReady } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

const Roteiro: React.FC = () => {
  const { user } = useAuth();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [duracaoAlvo, setDuracaoAlvo] = useState('5-10');
  const [isLoading, setIsLoading] = useState(false);
  const [scriptGenerated, setScriptGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scriptId, setScriptId] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [supabaseAvailable, setSupabaseAvailable] = useState(false);
  
  const [introducao, setIntroducao] = useState('');
  const [desenvolvimento, setDesenvolvimento] = useState('');
  const [conclusao, setConclusao] = useState('');

  // Verificar se o Supabase está disponível
  useEffect(() => {
    setSupabaseAvailable(isSupabaseReady());
    if (!isSupabaseReady()) {
      console.error('Supabase client is not available. Check your environment configuration.');
      toast.error('Não foi possível conectar ao banco de dados. Por favor, verifique sua configuração.');
    }
  }, []);

  // Função para salvar o roteiro no Supabase e iniciar o monitoramento
  const handleGenerateScript = async () => {
    if (!titulo.trim() || !descricao.trim()) {
      toast.error('Por favor, preencha o título e a descrição do vídeo.');
      return;
    }

    if (!supabaseAvailable) {
      toast.error('O serviço de banco de dados não está disponível no momento. Por favor, tente novamente mais tarde.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Salvar o roteiro no Supabase
      const { data, error } = await getSupabaseClient()
        .from('roteiros')
        .insert({
          titulo,
          descricao,
          duracao: duracaoAlvo,
          status: 'aguardando',
          roteiro: null,
          user_id: user?.id || 'anonimo',
          criado_em: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setScriptId(data.id);
        toast.success('Seu pedido foi recebido! Estamos criando seu roteiro personalizado com inteligência artificial.');
        // Iniciar o monitoramento
        setCheckingStatus(true);
      }
    } catch (error) {
      console.error('Erro ao salvar roteiro:', error);
      toast.error('Ocorreu um erro ao enviar seu pedido de roteiro. Por favor, tente novamente.');
      setIsLoading(false);
    }
  };

  // Função para monitorar o status do roteiro
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (checkingStatus && scriptId && supabaseAvailable) {
      intervalId = setInterval(async () => {
        try {
          const { data, error } = await getSupabaseClient()
            .from('roteiros')
            .select('*')
            .eq('id', scriptId)
            .single();
          
          if (error) throw error;
          
          if (data && data.status === 'concluido' && data.roteiro) {
            // Roteiro está pronto!
            setCheckingStatus(false);
            setIsLoading(false);
            
            try {
              // Parse do JSON do roteiro
              const roteiro = JSON.parse(data.roteiro);
              
              setIntroducao(roteiro.introducao || '');
              setDesenvolvimento(roteiro.desenvolvimento || '');
              setConclusao(roteiro.conclusao || '');
              
              setScriptGenerated(true);
              toast.success('Seu roteiro está pronto!');
            } catch (parseError) {
              console.error('Erro ao processar roteiro:', parseError);
              // Caso o formato não seja JSON, tenta usar como texto
              const texto = data.roteiro.toString();
              // Tenta dividir o texto em seções
              const partes = texto.split(/##\s*|--/);
              
              if (partes.length >= 3) {
                setIntroducao(partes[0] || '');
                setDesenvolvimento(partes[1] || '');
                setConclusao(partes[2] || '');
              } else {
                // Fallback para texto simples
                setIntroducao('');
                setDesenvolvimento(data.roteiro || '');
                setConclusao('');
              }
              
              setScriptGenerated(true);
              toast.success('Seu roteiro está pronto!');
            }
          } else if (data && data.status === 'erro') {
            // Roteiro encontrou um erro
            setCheckingStatus(false);
            setIsLoading(false);
            toast.error('Houve um erro ao gerar seu roteiro. Por favor, tente novamente.');
          }
        } catch (checkError) {
          console.error('Erro ao verificar status:', checkError);
        }
      }, 3000); // Verificar a cada 3 segundos
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [checkingStatus, scriptId, supabaseAvailable]);

  const copyToClipboard = () => {
    const fullScript = `# ${titulo.toUpperCase()}\n\n## INTRODUÇÃO\n${introducao}\n\n## DESENVOLVIMENTO\n${desenvolvimento}\n\n## CONCLUSÃO\n${conclusao}`;
    
    navigator.clipboard.writeText(fullScript)
      .then(() => {
        setCopied(true);
        toast.success('Roteiro copiado para a área de transferência!');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast.error('Erro ao copiar roteiro.');
      });
  };

  const downloadTxt = () => {
    const fullScript = `# ${titulo.toUpperCase()}\n\n## INTRODUÇÃO\n${introducao}\n\n## DESENVOLVIMENTO\n${desenvolvimento}\n\n## CONCLUSÃO\n${conclusao}`;
    const blob = new Blob([fullScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roteiro-${titulo.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Roteiro baixado com sucesso!');
  };

  const resetForm = () => {
    setScriptGenerated(false);
    setTitulo('');
    setDescricao('');
    setDuracaoAlvo('5-10');
    setIntroducao('');
    setDesenvolvimento('');
    setConclusao('');
    setScriptId(null);
    setIsLoading(false);
    setCheckingStatus(false);
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

      {!supabaseAvailable && (
        <div className="bg-amber-800/20 border border-amber-500/50 rounded-lg p-4 mb-6">
          <p className="text-amber-200">
            O serviço de banco de dados não está disponível no momento. Verifique se o Supabase está configurado corretamente.
          </p>
        </div>
      )}

      {!scriptGenerated ? (
        <div className="bg-tubepro-darkAccent rounded-xl p-6">
          {!isLoading ? (
            <>
              <div className="mb-4">
                <Label htmlFor="titulo">Título do Vídeo</Label>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Como Aumentar suas Visualizações no YouTube"
                  className="bg-tubepro-dark border-white/10 mt-1"
                />
              </div>
              
              <div className="mb-4">
                <Label htmlFor="descricao">Descrição ou Objetivo do Vídeo</Label>
                <Textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva o que você deseja abordar neste vídeo e qual o objetivo principal..."
                  className="bg-tubepro-dark border-white/10 min-h-24 mt-1"
                />
              </div>
              
              <div className="mb-6">
                <Label>Duração Alvo do Vídeo</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <Button
                    type="button"
                    variant={duracaoAlvo === "3-5" ? "default" : "outline"}
                    className={duracaoAlvo === "3-5" ? "bg-tubepro-red hover:bg-tubepro-red/90" : ""}
                    onClick={() => setDuracaoAlvo("3-5")}
                  >
                    3-5 minutos
                  </Button>
                  <Button
                    type="button"
                    variant={duracaoAlvo === "5-10" ? "default" : "outline"}
                    className={duracaoAlvo === "5-10" ? "bg-tubepro-red hover:bg-tubepro-red/90" : ""}
                    onClick={() => setDuracaoAlvo("5-10")}
                  >
                    5-10 minutos
                  </Button>
                  <Button
                    type="button"
                    variant={duracaoAlvo === "10-15" ? "default" : "outline"}
                    className={duracaoAlvo === "10-15" ? "bg-tubepro-red hover:bg-tubepro-red/90" : ""}
                    onClick={() => setDuracaoAlvo("10-15")}
                  >
                    10-15 minutos
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleGenerateScript} 
                  disabled={isLoading}
                  className="btn-gradient"
                >
                  {isLoading ? 'Gerando Roteiro...' : 'Gerar Roteiro'}
                </Button>
              </div>
            </>
          ) : (
            <div className="py-10 flex flex-col items-center justify-center space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-tubepro-dark p-4 rounded-full">
                  <Loader className="w-10 h-10 text-tubepro-red animate-spin" />
                </div>
                <h3 className="text-xl font-medium">Seu roteiro está sendo criado</h3>
                <p className="text-white/70 max-w-md">
                  Estamos usando inteligência artificial para criar seu roteiro personalizado. 
                  Isso pode levar alguns instantes.
                </p>
              </div>

              <div className="w-full max-w-md">
                <Progress 
                  value={45} 
                  className="h-2 bg-tubepro-dark/50" 
                  indicatorClassName="bg-tubepro-red"
                />
                <p className="text-xs text-white/50 mt-2 text-center">
                  O roteiro chegará em instantes. Por favor, aguarde.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Roteiro para: {titulo}</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex items-center gap-2" 
                onClick={copyToClipboard}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copiado!' : 'Copiar Roteiro'}
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={downloadTxt}
              >
                <Download size={16} />
                Baixar TXT
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="introducao" className="mb-6">
            <TabsList className="mb-2 bg-tubepro-darkAccent">
              <TabsTrigger value="introducao">Introdução</TabsTrigger>
              <TabsTrigger value="desenvolvimento">Desenvolvimento</TabsTrigger>
              <TabsTrigger value="conclusao">Conclusão</TabsTrigger>
            </TabsList>
            <TabsContent value="introducao" className="bg-tubepro-darkAccent rounded-xl p-6">
              <h3 className="font-medium mb-2">INTRODUÇÃO</h3>
              <div className="whitespace-pre-line text-white/80">{introducao}</div>
            </TabsContent>
            <TabsContent value="desenvolvimento" className="bg-tubepro-darkAccent rounded-xl p-6">
              <h3 className="font-medium mb-2">DESENVOLVIMENTO</h3>
              <div className="whitespace-pre-line text-white/80">{desenvolvimento}</div>
            </TabsContent>
            <TabsContent value="conclusao" className="bg-tubepro-darkAccent rounded-xl p-6">
              <h3 className="font-medium mb-2">CONCLUSÃO</h3>
              <div className="whitespace-pre-line text-white/80">{conclusao}</div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={resetForm}
            >
              <RefreshCcw size={16} />
              Criar Novo Roteiro
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roteiro;
