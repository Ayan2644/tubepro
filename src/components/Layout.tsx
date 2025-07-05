// src/components/Layout.tsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarLink, MobileSidebar } from '@/components/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Home, Lightbulb, FilePen, Youtube, Bot, Settings, LogOut, User as UserIcon, LogIn, FolderArchive } from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();

  const menuItems = [
    { label: "Dashboard", icon: Home, path: "/" },
    { label: "Gerador de Ideias", icon: Lightbulb, path: "/ideias" },
    { label: "Criador de Roteiros", icon: FilePen, path: "/roteiro" },
    { label: "Transcrição", icon: Youtube, path: "/transcricao" },
    { label: "Histórico", icon: FolderArchive, path: "/historico"},
    { label: "Assistente IA", icon: Bot, path: "/assistente" },
  ];

  return (
    <div className="flex min-h-screen bg-tubepro-dark text-white">
      {/* A Sidebar agora faz parte do layout principal */}
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

      {/* Container Principal para o conteúdo */}
      <div className="flex-1 flex flex-col w-full overflow-hidden">
          <MobileSidebar /> {/* Mantém o menu mobile para telas menores */}
          
          {/* O <Outlet> é onde cada página (Dashboard, Ideias, etc.) será renderizada */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
              <Outlet />
          </main>
      </div>
    </div>
  );
};

export default Layout;