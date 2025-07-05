// src/pages/Index.tsx

import React from 'react';
// A MUDANÇA ESTÁ NESSA LINHA DE IMPORTAÇÃO ABAIXO
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarLink, MobileSidebar } from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import { useAuth } from '@/hooks/useAuth';
import { Home, Lightbulb, FilePen, Youtube, Bot, Settings, LogOut, User as UserIcon, LogIn, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { label: "Dashboard", icon: Home, path: "/" },
    { label: "Gerador de Ideias", icon: Lightbulb, path: "/ideias" },
    { label: "Criador de Roteiros", icon: FilePen, path: "/roteiro" },
    { label: "Transcrição de Vídeo", icon: Youtube, path: "/transcricao" },
    { label: "Assistente IA", icon: Bot, path: "/assistente" },
  ];
  
  return (
    <div className="flex min-h-screen bg-tubepro-dark text-white">
      <Sidebar>
        <SidebarHeader />
        <SidebarContent>
          <nav className="flex flex-col gap-2">
            {menuItems.map(item => (
              <SidebarLink key={item.label} {...item} />
            ))}
          </nav>
        </SidebarContent>
        <SidebarFooter>
            {user ? (
                <>
                    <SidebarLink label="Perfil" icon={UserIcon} path="/profile" />
                    <SidebarLink label="Sair" icon={LogOut} path="#" action={logout} />
                </>
            ) : (
                <SidebarLink label="Entrar" icon={LogIn} path="/login" />
            )}
            <SidebarLink label="Configurações" icon={Settings} path="#" />
        </SidebarFooter>
      </Sidebar>

      <div className="flex-1 flex flex-col">
          <header className="flex items-center justify-between md:hidden p-2 border-b border-white/10">
              <span onClick={() => navigate('/')} className="text-xl font-bold text-gradient cursor-pointer">TubePro</span>
              <MobileSidebar />
          </header>
          <main className="flex-1 p-4 md:p-6">
              <Dashboard />
          </main>
      </div>
    </div>
  );
};

export default Index;