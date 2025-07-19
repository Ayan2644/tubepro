// src/components/ToolInfoModal.tsx

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

// As propriedades agora são genéricas para aceitar qualquer conteúdo
interface ToolInfoModalProps {
  triggerText: string;
  title: string;
  description: string;
  children: React.ReactNode; // Usamos 'children' para o conteúdo principal do modal
}

const ToolInfoModal: React.FC<ToolInfoModalProps> = ({ 
  triggerText, 
  title, 
  description,
  children 
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-white/70 hover:text-white hover:bg-white/10 text-xs"
        >
          <Info size={14} className="mr-1.5" />
          <span>{triggerText}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-tubepro-darkAccent text-white border-white/10">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-white/70">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// NOVO: Um componente auxiliar para estilizar os blocos de informação dentro do modal
interface InfoBlockProps {
    title: string;
    children: React.ReactNode;
}

export const InfoBlock: React.FC<InfoBlockProps> = ({ title, children }) => (
    <div className="rounded-lg bg-tubepro-dark p-4 border border-white/5">
        <h3 className="font-medium mb-2 text-white/90">{title}</h3>
        <div className="text-white/70 text-sm space-y-2">
            {children}
        </div>
    </div>
);

export default ToolInfoModal;