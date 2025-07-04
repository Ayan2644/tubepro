
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  to?: string;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ to = '/', className }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant="ghost"
      size="sm"
      className={cn(
        "flex items-center gap-1 text-white/70 hover:text-white hover:bg-white/10 transition-colors rounded-lg",
        className
      )}
    >
      <ArrowLeft size={16} />
      <span className="font-medium">Voltar</span>
    </Button>
  );
};

export default BackButton;
