// src/pages/Historico.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { getSupabaseClient } from '@/lib/supabase';
import { FileText, Edit, Trash2, Loader2, PlusCircle, Expand } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Script {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const Historico: React.FC = () => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);

  const { user } = useAuth();
  const supabase = getSupabaseClient();

  const fetchScripts = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from('scripts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar roteiros.', { description: error.message });
    } else {
      setScripts(data as Script[]);
    }
    setIsLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchScripts();
  }, [fetchScripts]);

  const handleEditClick = (script: Script) => {
    setSelectedScript(script);
    setEditedTitle(script.title);
    setEditedContent(script.content);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (script: Script) => {
    setSelectedScript(script);
    setIsDeleteModalOpen(true);
  };

  const handleUpdateScript = async () => {
    if (!selectedScript) return;
    const { error } = await supabase
      .from('scripts')
      .update({ title: editedTitle, content: editedContent, updated_at: new Date().toISOString() })
      .eq('id', selectedScript.id);

    if (error) {
      toast.error('Falha ao atualizar o roteiro.', { description: error.message });
    } else {
      toast.success("Roteiro atualizado com sucesso!");
      setIsEditModalOpen(false);
      fetchScripts(); // Recarrega a lista
    }
  };

  const handleDeleteScript = async () => {
    if (!selectedScript) return;
    const { error } = await supabase
        .from('scripts')
        .delete()
        .eq('id', selectedScript.id);

    if (error) {
        toast.error("Falha ao excluir o roteiro.", { description: error.message });
    } else {
        toast.success("Roteiro excluído com sucesso!");
        setIsDeleteModalOpen(false);
        fetchScripts(); // Recarrega a lista
    }
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gradient bg-animate">Histórico de Roteiros</h1>
        <BackButton to="/" />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-tubepro-red" />
        </div>
      ) : scripts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scripts.map(script => (
            <Card key={script.id} className="bg-tubepro-darkAccent border-white/10 text-white flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg text-tubepro-yellow truncate">{script.title}</CardTitle>
                <CardDescription>
                  Criado em {format(new Date(script.created_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-white/70 line-clamp-4">{script.content}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEditClick(script)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(script)} className="text-red-500 hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-4 w-4" /></Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-tubepro-darkAccent rounded-lg border border-dashed border-white/10">
          <FileText className="mx-auto h-12 w-12 text-white/30" />
          <h3 className="mt-4 text-lg font-medium">Nenhum roteiro salvo</h3>
          <p className="mt-1 text-sm text-white/60">Crie seu primeiro roteiro para vê-lo aqui.</p>
        </div>
      )}

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className={cn("bg-tubepro-darkAccent border-white/10 text-white sm:max-w-4xl transition-all duration-300", isFullScreen ? "h-[95vh] w-[95vw] max-w-none" : "h-auto")}>
          <DialogHeader>
            <div className="flex justify-between items-center">
                <DialogTitle>Editar Roteiro</DialogTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsFullScreen(!isFullScreen)}>
                    <Expand className="h-4 w-4" />
                </Button>
            </div>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4 h-[calc(100%-8rem)]">
            <Input value={editedTitle} onChange={e => setEditedTitle(e.target.value)} placeholder="Título do roteiro" />
            <Textarea value={editedContent} onChange={e => setEditedContent(e.target.value)} placeholder="Conteúdo do roteiro..." className="flex-grow resize-none"/>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
            <Button className="btn-gradient" onClick={handleUpdateScript}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Exclusão */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-tubepro-darkAccent border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o roteiro "{selectedScript?.title}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteScript}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Historico;