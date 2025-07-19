// src/components/ToolStatus.tsx

import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

// Define as variantes de estilo para o indicador de status
const statusIndicatorVariants = cva(
  'w-2 h-2 rounded-full',
  {
    variants: {
      status: {
        active: 'bg-green-500',
        beta: 'bg-yellow-500',
        maintenance: 'bg-orange-500',
        inactive: 'bg-red-500',
      },
    },
    defaultVariants: {
      status: 'active',
    },
  }
);

// Define as propriedades que o componente aceitará
interface ToolStatusProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof statusIndicatorVariants> {
  serviceName: string;
}

const ToolStatus: React.FC<ToolStatusProps> = ({ className, status, serviceName, ...props }) => {
  return (
    <div className={cn('flex items-center gap-2 text-xs text-white/70', className)} {...props}>
      <span className={cn(statusIndicatorVariants({ status }))} />
      <span>{serviceName}</span>
    </div>
  );
};

export default ToolStatus;