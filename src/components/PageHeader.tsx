// src/components/PageHeader.tsx

import React from 'react';
// Certifique-se de que a logo-icon.png está em src/assets/
import TubeProLogoIcon from '../assets/logo-icon.png';

interface PageHeaderProps {
  title: React.ReactNode;
  description: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description }) => {
  return (
    <div className="mb-12 text-center">
      <img
        src={TubeProLogoIcon}
        alt="TubePro Icon"
        className="mx-auto h-16 w-16 mb-6 icon-glow" // Aplica a animação de brilho
      />
      <h1 className="text-4xl md:text-5xl font-extrabold text-gradient title-animate bg-clip-text text-transparent">
        {title}
      </h1>
      <p className="text-lg text-white/70 mt-4 max-w-2xl mx-auto">
        {description}
      </p>
    </div>
  );
};

export default PageHeader;