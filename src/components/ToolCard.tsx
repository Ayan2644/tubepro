import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Coins } from 'lucide-react';
import { toast } from 'sonner';

interface ToolCardProps {
  title: string;
  icon: React.ReactNode;
  gradient?: boolean;
  onClick?: () => void;
  path?: string;
  className?: string;
  description?: string;
  coinCost?: number;
  feature?: string;
}

const ToolCard: React.FC<ToolCardProps> = ({
  title,
  icon,
  gradient = false,
  onClick,
  path,
  className,
  description,
  coinCost,
  feature
}) => {
  const navigate = useNavigate();
  const { user, spendCoins } = useAuth();
  
  const handleClick = () => {
    if (!user) {
      toast.error('Você precisa estar logado para usar esta funcionalidade');
      navigate('/login');
      return;
    }
    
    if (coinCost && feature) {
      const canUseFeature = spendCoins(coinCost, feature);
      
      if (!canUseFeature) {
        return;
      }
    }
    
    if (onClick) {
      onClick();
    } else if (path) {
      navigate(path);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={cn(
        'flex flex-col items-center justify-center p-5 rounded-xl cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.03] hover:-translate-y-1 relative',
        gradient 
          ? 'btn-gradient text-white shadow-md hover:shadow-lg hover:shadow-tubepro-red/30' 
          : 'bg-tubepro-darkAccent text-white/90 border border-white/10 hover:border-tubepro-red/50',
        className
      )}
    >
      {coinCost && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full text-xs">
          <Coins size={12} className="text-tubepro-yellow" />
          <span>{coinCost}</span>
        </div>
      )}
      <div className="text-3xl mb-3">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-center mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-white/60 text-center">{description}</p>
      )}
    </div>
  );
};

export default ToolCard;