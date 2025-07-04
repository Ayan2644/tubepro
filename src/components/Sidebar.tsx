import React from 'react';
import { 
  Lightbulb, 
  FilePen, 
  Youtube, 
  Settings, 
  Users, 
  DollarSign,
  BarChart, 
  Menu,
  Bot,
  LogIn,
  User,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

type SidebarProps = {
  collapsed: boolean;
  toggleCollapsed: () => void;
};

// Define proper interfaces for our menu items
interface BaseMenuItem {
  title: string;
  icon: React.ReactNode | null;
}

interface HeadingItem extends BaseMenuItem {
  isHeading: true;
}

interface NavItem extends BaseMenuItem {
  isHeading?: false;
  isActive: boolean;
  path: string;
  action?: () => void;
}

type MenuItem = HeadingItem | NavItem;

const Sidebar: React.FC<SidebarProps> = ({ collapsed, toggleCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // Itens do menu que exigem autenticação
  const authenticatedItems: MenuItem[] = [
    {
      title: 'AI Tools',
      icon: null,
      isHeading: true
    },
    {
      title: 'Ideation',
      icon: <Lightbulb size={22} />,
      isActive: location.pathname === '/ideias',
      path: '/ideias'
    },
    {
      title: 'Scripting',
      icon: <FilePen size={22} />,
      isActive: location.pathname === '/roteiro',
      path: '/roteiro'
    },
    {
      title: 'Transcrição',
      icon: <Youtube size={22} />,
      isActive: location.pathname === '/transcricao',
      path: '/transcricao'
    },
    {
      title: 'Analytics',
      icon: <BarChart size={22} />,
      isActive: false,
      path: '/analytics'
    },
    {
      title: 'Platform',
      icon: null,
      isHeading: true
    },
    {
      title: 'Assistente GPT',
      icon: <Bot size={22} />,
      isActive: location.pathname === '/assistente',
      path: '/assistente'
    },
    {
      title: 'Settings',
      icon: <Settings size={22} />,
      isActive: false,
      path: '/settings'
    },
    {
      title: 'Community',
      icon: <Users size={22} />,
      isActive: false,
      path: '/community'
    },
    {
      title: 'Billing',
      icon: <DollarSign size={22} />,
      isActive: false,
      path: '/billing'
    }
  ];
  
  // Itens do menu relacionados à conta
  const accountItems: MenuItem[] = [
    {
      title: 'Account',
      icon: null,
      isHeading: true
    }
  ];
  
  // Adiciona os itens com base no estado de autenticação
  if (user) {
    accountItems.push({
      title: 'Profile',
      icon: <User size={22} />,
      isActive: location.pathname === '/profile',
      path: '/profile'
    });
    accountItems.push({
      title: 'Logout',
      icon: <LogOut size={22} />,
      isActive: false,
      path: '/logout',
      action: () => {
        logout();
        navigate('/login');
      }
    });
  } else {
    accountItems.push({
      title: 'Login',
      icon: <LogIn size={22} />,
      isActive: location.pathname === '/login',
      path: '/login'
    });
  }

  const handleItemClick = (item: MenuItem) => {
    if ('isHeading' in item && item.isHeading) {
      return; // Headings aren't clickable
    }
    
    const navItem = item as NavItem;
    if (navItem.action) {
      navItem.action();
    } else {
      navigate(navItem.path);
    }
  };

  // Filtra os itens de menu com base no estado de autenticação
  const sidebarItems = user ? [...authenticatedItems, ...accountItems] : accountItems;

  return (
    <div 
      className={cn(
        'fixed top-0 left-0 h-full bg-tubepro-darkAccent border-r border-white/10 transition-all duration-300 z-20',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between p-4">
        <div className={cn(
          'flex items-center space-x-3 transition-all duration-300',
          collapsed && 'opacity-0 invisible'
        )}>
          <span className="text-xl font-bold text-gradient" onClick={() => navigate('/')}>TubePro</span>
        </div>
        <button 
          className="p-2 rounded-lg hover:bg-white/10 transition-colors" 
          onClick={toggleCollapsed}
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="mt-6 px-2 pb-6">
        {sidebarItems.map((item, idx) => (
          'isHeading' in item && item.isHeading ? (
            <div 
              key={idx} 
              className={cn(
                'px-4 pt-6 pb-2 text-xs uppercase font-semibold text-white/40 tracking-wider',
                collapsed && 'hidden'
              )}
            >
              {item.title}
            </div>
          ) : (
            <div 
              key={idx} 
              className={cn(
                'flex items-center space-x-3 px-3 py-3 mb-1 rounded-lg cursor-pointer transition-colors',
                'isActive' in item && item.isActive ? 'bg-gradient-to-r from-tubepro-red to-tubepro-yellow text-white' : 'hover:bg-white/10'
              )}
              onClick={() => handleItemClick(item)}
            >
              <div className={cn(
                'flex items-center justify-center',
                !('isActive' in item && item.isActive) && 'text-white/70'
              )}>
                {item.icon}
              </div>
              <span className={cn(
                'font-medium transition-all duration-300',
                collapsed && 'opacity-0 invisible'
              )}>
                {item.title}
              </span>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
