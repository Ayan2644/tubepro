import React, { useState, useEffect } from 'react';
import { Youtube, UploadCloud, Copy, Check, FileAudio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import BackButton from '@/components/BackButton';
import { Textarea } from '@/components/ui/textarea';
import ApiKeyInstructions from '@/components/ApiKeyInstructions';
import { transcribeYoutubeVideo, transcribeVideoFile } from '@/services/api'; // MUDANÇA AQUI
import { TranscriptionResult, extractYoutubeVideoId } from '@/utils/transcriptionService';
import { useAuth } from '@/hooks/useAuth';

const Transcricao: React.FC = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const { user, spendCoins } = useAuth();

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 300);

    return () => clearInterval(interval);
  };

  const handleYoutubeTranscription = async () => {
    if (!extractYoutubeVideoId(youtubeUrl)) {
      toast.error('Por favor, insira uma URL válida do YouTube');
      return;
    }

    if (!spendCoins(25, 'Transcrição de Vídeo')) {
      toast.error('Tubecoins insuficientes para realizar a transcrição');
      return;
    }

    setIsLoading(true);
    const clearProgressInterval = simulateProgress();

    try {
      const result = await transcribeYoutubeVideo(youtubeUrl); // Usa a função do novo serviço
      setTranscription(result);
      setProgress(100);
      toast.success('Transcrição concluída com sucesso!');
    } catch (error: any) {
      console.error('Erro na transcrição:', error);
      toast.error('Erro ao transcrever o vídeo.', {
        description: error.message || 'Tente novamente mais tarde.',
      });
    } finally {
      clearProgressInterval();
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.includes('video/') && !file.type.includes('audio/')) {
      toast.error('Por favor, selecione um arquivo de vídeo ou áudio válido');
      return;
    }

    const estimatedCost = Math.ceil(file.size / (10 * 1024 * 1024)) * 10;

    if (!spendCoins(estimatedCost, 'Transcrição de Arquivo')) {
      toast.error('Tubecoins insuficientes para realizar a transcrição');
      return;
    }

    setIsLoading(true);
    const clearProgressInterval = simulateProgress();

    try {
      const result = await transcribeVideoFile(file); // Usa a função do novo serviço
      setTranscription(result);
      setProgress(100);
      toast.success('Arquivo transcrito com sucesso!');
    } catch (error: any) {
      console.error('Erro na transcrição:', error);
      toast.error('Erro ao transcrever o arquivo.', {
        description: error.message || 'Tente novamente mais tarde.',
      });
    } finally {
      clearProgressInterval();
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!transcription) return;

    navigator.clipboard.writeText(transcription.text)
      .then(() => {
        setCopied(true);
        toast.success('Transcrição copiada para a área de transferência!');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast.error('Erro ao copiar transcrição.');
      });
  };

  const resetTranscription = () => {
    setTranscription(null);
    setYoutubeUrl('');
    setProgress(0);
  };

  const renderServiceInfo = () => (
    <div className="mb-4 flex justify-between items-center">
      <div className="flex items-center">
        <span className={`w-3 h-3 rounded-full mr-2 bg-green-500`}></span>
        <span className="text-sm">
          Serviço de transcrição ativo
        </span>
      </div>
      <ApiKeyInstructions service="OpenAI" />
    </div>
  );

  const renderTranscriptionForm = () => (
    <Tabs defaultValue="youtube" className="mb-6">
      <TabsList className="mb-4 bg-tubepro-darkAccent">
        <TabsTrigger value="youtube">URL do YouTube</TabsTrigger>
        <TabsTrigger value="upload">Upload de Arquivo</TabsTrigger>
      </TabsList>

      <TabsContent value="youtube" className="bg-tubepro-darkAccent rounded-xl p-6">
        <div className="mb-6">
          <label htmlFor="youtube-url" className="block mb-2 font-medium">
            Insira o URL do vídeo do YouTube
          </label>
          <Input
            id="youtube-url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="bg-tubepro-dark border-white/10"
          />
        </div>

        <Button
          onClick={handleYoutubeTranscription}
          disabled={isLoading}
          className="btn-gradient w-full"
        >
          {isLoading ? 'Transcrevendo...' : 'Transcrever Vídeo'}
        </Button>

        {isLoading && (
          <div className="mt-4">
            <p className="text-sm text-white/70 mb-2">Extraindo áudio e transcrevendo...</p>
            <Progress value={progress} className="h-2" indicatorClassName="bg-gradient-to-r from-tubepro-red to-tubepro-yellow" />
          </div>
        )}
      </TabsContent>

      <TabsContent value="upload" className="bg-tubepro-darkAccent rounded-xl p-6">
        <div className="mb-6">
          <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
            <UploadCloud className="mx-auto mb-4 text-white/60 w-12 h-12" />
            <p className="mb-2">Arraste e solte um arquivo de vídeo ou áudio, ou</p>
            <div className="relative">
              <input
                type="file"
                accept="video/*,audio/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isLoading}
              />
              <Button variant="outline" className="mx-auto" disabled={isLoading}>
                Selecione um arquivo
              </Button>
            </div>
            <p className="mt-2 text-sm text-white/40">
              Formatos suportados: MP4, MOV, AVI, WMV, MP3, WAV (máx. 500MB)
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="mt-4">
            <p className="text-sm text-white/70 mb-2">Processando arquivo e transcrevendo...</p>
            <Progress value={progress} className="h-2" indicatorClassName="bg-gradient-to-r from-tubepro-red to-tubepro-yellow" />
          </div>
        )}
      </TabsContent>
    </Tabs>
  );

  const renderTranscriptionResult = () => (
    <div className="bg-tubepro-darkAccent rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Transcrição do Vídeo</h2>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={copyToClipboard}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copiado!' : 'Copiar Transcrição'}
        </Button>
      </div>

      <Textarea
        value={transcription?.text || ''}
        readOnly
        className="min-h-[300px] bg-tubepro-dark border-white/10 whitespace-pre-line"
      />

      <div className="flex justify-between mt-6">
        <div className="flex items-center text-white/70">
          <FileAudio size={16} className="mr-2" />
          <span className="text-sm">Transcrição gerada por IA</span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={resetTranscription}
          >
            Nova Transcrição
          </Button>
          <Button className="btn-gradient">
            Gerar Roteiro a partir da Transcrição
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Youtube className="text-tubepro-red w-8 h-8" />
          <h1 className="text-2xl font-bold">Transcrição de Vídeos</h1>
        </div>
        <BackButton to="/" />
      </div>

      {renderServiceInfo()}

      {transcription ? renderTranscriptionResult() : renderTranscriptionForm()}
    </div>
  );
};

export default Transcricao;