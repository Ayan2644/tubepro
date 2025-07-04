import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import { cn } from '@/lib/utils';
import { Home, Menu } from 'lucide-react'; // Importamos o ícone Menu para o hambúrguer
import { useIsMobile } from '@/hooks/use-mobile'; // Importamos o hook para detectar mobile
import { Button } from '@/components/ui/button'; // Importamos Button para o ícone de hambúrguer

const Index: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Estado para desktop (colapsado/expandido)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false); // Novo estado para mobile (aberto/fechado)
  const isMobile = useIsMobile(); // Hook para saber se estamos em mobile

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-tubepro-dark text-white">
      {/* Passamos os novos estados para o componente Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        toggleCollapsed={toggleSidebar}
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
      />
      <main
        className={cn(
          'transition-all duration-300 min-h-screen',
          // Em mobile, não há margem fixa à esquerda (o menu será off-canvas)
          // Em desktop, a margem depende do estado colapsado da sidebar
          isMobile ? 'ml-0' : (sidebarCollapsed ? 'ml-16' : 'ml-64')
        )}
      >
        <div className="container px-6 py-8">
          {/* Cabeçalho da página principal: inclui o botão de hambúrguer para mobile */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Home className="text-tubepro-red w-8 h-8" />
              <h1 className="text-2xl font-bold">Dashboard</h1>
            </div>
            {isMobile && ( // Mostra o botão de hambúrguer apenas em mobile (esconde em telas md e maiores)
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white/70 hover:text-white hover:bg-white/10"
                onClick={() => setMobileSidebarOpen(true)} // Abre a sidebar móvel
              >
                <Menu size={24} />
              </Button>
            )}
          </div>
          <Dashboard />
        </div>
      </main>
    </div>
  );
};

export default Index;