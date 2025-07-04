
import React from 'react';
import ToolCard from './ToolCard';
import { cn } from '@/lib/utils';

interface Tool {
  title: string;
  icon: React.ReactNode;
  gradient?: boolean;
  path?: string;
}

interface ToolSectionProps {
  title: string;
  description?: string;
  tools: Tool[];
  className?: string;
  onToolClick?: (path: string) => void;
}

const ToolSection: React.FC<ToolSectionProps> = ({
  title,
  description,
  tools,
  className,
  onToolClick
}) => {
  return (
    <div className={cn('mb-10', className)}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        {description && (
          <p className="text-white/60 mt-1">{description}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool, idx) => (
          <ToolCard
            key={idx}
            title={tool.title}
            icon={tool.icon}
            gradient={tool.gradient}
            path={tool.path}
            onClick={tool.path ? () => onToolClick && onToolClick(tool.path || '') : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default ToolSection;
