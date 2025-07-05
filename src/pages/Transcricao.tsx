// src/pages/Transcricao.tsx

import React, { useState } from 'react';
import { Youtube, UploadCloud, Copy, Check, Save, Loader2, FileAudio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { TranscriptionResult, extractYoutubeVideoId } from '@/utils/transcriptionService';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import PageHeader from '@/components/PageHeader';

const Transcricao: React.FC = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [scriptTitle, setScriptTitle] = useState('');

  const { user, spendCoins, isLoading: isAuthLoading } = useAuth();

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
    }, 150);
    return () => clearInterval(interval);
  };

  const handleYoutubeTranscription = async () => {
    if (isAuthLoading) {
      toast.info("Aguarde, autenticando sua sessão...");
      return;
    }
    if (!user) {
      toast.error("Você precisa estar logado para usar esta ferramenta.");
      return;
    }
    if (!extractYoutubeVideoId(youtubeUrl)) {
      toast.error('Por favor, insira uma URL válida do YouTube.');
      return;
    }

    setIsProcessing(true);

    const hasSpentCoins = await spendCoins(5, 'Transcrição de Vídeo');
    if (!hasSpentCoins) {
      setIsProcessing(false);
      return;
    }

    const clearProgressInterval = simulateProgress();
    try {
      const { data, error } = await supabase.functions.invoke('transcritor-ia', {
        body: JSON.stringify({ videoURL: youtubeUrl }),
      });
      
      if (error) throw error;

      if (data.error) throw new Error(data.error);
      
      setTranscription({ text: data.transcription });
      setProgress(100);
      toast.success('Transcrição concluída!');

    } catch (error: any) {
      toast.error('Erro ao transcrever.', { description: error.message || 'Tente novamente.' });
    } finally {
      clearProgressInterval();
      setIsProcessing(false);
    }
  };
  
  const copyToClipboard = () => {
    if (!transcription) return;
    navigator.clipboard.writeText(transcription.text).then(() => {
      setCopied(true);
      toast.success('Copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const resetTranscription = () => {
    setTranscription(null);
    setYoutubeUrl('');
    setProgress(0);
  };

  const handleSaveScript = async () => {
    if (!scriptTitle.trim()) {
      toast.error("Por favor, dê um título ao seu roteiro.");
      return;
    }
    if (!user || !transcription) return;
    const { error } = await supabase.from('scripts').insert({
      user_id: user.id,
      title: scriptTitle,
      content: transcription.text
    });
    if (error) {
      toast.error("Falha ao salvar o roteiro.", { description: error.message });
    } else {
      toast.success(`Roteiro "${scriptTitle}" salvo com sucesso!`);
      setIsSaveDialogOpen(false);
      setScriptTitle('');
    }
  };

  const isButtonDisabled = isAuthLoading || isProcessing;

  return (
    <>
      <PageHeader
        title={<>Transcrição de <span className="text-white font-bold">Vídeos</span></>}
        description="Extraia o texto de qualquer vídeo do YouTube e transforme-o em conteúdo valioso para seu canal."
      />
      
      {transcription ? (
        <div className="bg-tubepro-darkAccent rounded-xl p-6 animate-fade-in-up">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Transcrição do Vídeo</h2>
            <Button variant="outline" className="flex items-center gap-2" onClick={copyToClipboard}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copiado!' : 'Copiar'}
            </Button>
          </div>
          <Textarea
            value={transcription.text}
            readOnly
            className="min-h-[400px] bg-tubepro-dark border-white/10 whitespace-pre-line"
          />
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={resetTranscription}>Nova Transcrição</Button>
            <Button onClick={() => setIsSaveDialogOpen(true)} className="btn-gradient">
              <Save className="mr-2 h-4 w-4"/>
              Salvar Roteiro
            </Button>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="youtube" className="mb-6">
          <TabsList className="mb-4 bg-tubepro-darkAccent">
            <TabsTrigger value="youtube">URL do YouTube</TabsTrigger>
            <TabsTrigger value="upload" disabled>Upload de Arquivo (Em breve)</TabsTrigger>
          </TabsList>
          <TabsContent value="youtube" className="bg-tubepro-darkAccent rounded-xl p-6">
            <div className="mb-6">
              <label htmlFor="youtube-url" className="block mb-2 font-medium">Insira a URL do vídeo do YouTube</label>
              <Input id="youtube-url" placeholder="https://www.youtube.com/watch?v=..." value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} className="bg-tubepro-dark border-white/10" disabled={isButtonDisabled} />
            </div>
            <Button onClick={handleYoutubeTranscription} disabled={isButtonDisabled} className="btn-gradient w-full">
              {isAuthLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Autenticando...</> : isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Transcrevendo...</> : 'Transcrever Vídeo'}
            </Button>
            {isProcessing && (
              <div className="mt-4">
                <p className="text-sm text-center text-white/70 mb-2">Buscando e processando legendas... Isso pode levar um momento.</p>
                <Progress value={progress} className="h-2" indicatorClassName="bg-gradient-to-r from-tubepro-red to-tubepro-yellow" />
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
      
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="bg-tubepro-darkAccent border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Salvar Transcrição</DialogTitle>
            <DialogDescription>Dê um nome a esta transcrição para salvá-la em seu histórico.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input placeholder="Ex: Transcrição sobre Google Ads" value={scriptTitle} onChange={(e) => setScriptTitle(e.target.value)} />
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

export default Transcricao;