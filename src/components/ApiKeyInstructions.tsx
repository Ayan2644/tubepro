
import React from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ApiKeyInstructionsProps {
  service: string;
}

const ApiKeyInstructions: React.FC<ApiKeyInstructionsProps> = ({ service }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <Info size={16} className="mr-1" />
          <span>Sobre o serviço de transcrição</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-tubepro-darkAccent text-white">
        <DialogHeader>
          <DialogTitle>Serviço de Transcrição {service}</DialogTitle>
          <DialogDescription className="text-white/70">
            Informações sobre o serviço de transcrição integrado ao TubePro.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div className="rounded-lg bg-tubepro-dark p-4">
            <h3 className="font-medium mb-2">Como funciona o serviço</h3>
            <p className="text-white/70 text-sm mb-2">
              Nossa ferramenta de transcrição utiliza inteligência artificial avançada para converter áudio em texto de forma rápida e precisa.
            </p>
            <p className="text-white/70 text-sm mb-2">
              Você pode transcrever tanto vídeos do YouTube quanto arquivos de áudio/vídeo enviados diretamente.
            </p>
          </div>
          
          <div className="rounded-lg bg-tubepro-dark p-4">
            <h3 className="font-medium mb-2">Limites e custos</h3>
            <p className="text-white/70 text-sm mb-2">
              O serviço de transcrição consome Tubecoins baseado na duração do conteúdo transcrito.
            </p>
            <p className="text-white/70 text-sm mb-2">
              Usuários com plano Pro têm acesso a transcrições mais longas e com maior precisão.
            </p>
          </div>
          
          <div className="rounded-lg bg-tubepro-dark p-4">
            <h3 className="font-medium mb-2">Idiomas suportados</h3>
            <p className="text-white/70 text-sm">
              Nossa tecnologia suporta mais de 30 idiomas, com precisão especial para português e inglês.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyInstructions;
