
import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import { cn } from '@/lib/utils';
import { Home } from 'lucide-react';

const Index: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-tubepro-dark text-white">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        toggleCollapsed={toggleSidebar}
      />
      <main 
        className={cn(
          'transition-all duration-300 min-h-screen',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        <div className="container px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <Home className="text-tubepro-red w-8 h-8" />
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
          <Dashboard />
        </div>
      </main>
    </div>
  );
};

export default Index;
