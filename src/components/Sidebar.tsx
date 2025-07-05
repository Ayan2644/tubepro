// src/components/Sidebar.tsx

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  ChevronLeft, Home, Lightbulb, FilePen, Youtube, Bot, Settings, LogOut, User as UserIcon, Menu, LogIn, FolderArchive
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { Button, buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useNavigate, useLocation } from "react-router-dom"

// Verifique se estes caminhos estão corretos e os arquivos existem.
import TubeProLogoFull from '../assets/logo-white.png';
import TubeProLogoIcon from '../assets/logo-icon.png';

const sidebarVariants = cva("flex flex-col h-full bg-tubepro-darkAccent border-r border-white/10 text-white transition-all duration-300", {
  variants: {
    collapsed: {
      true: "w-16",
      false: "w-64",
    },
  },
  defaultVariants: {
    collapsed: false,
  },
});

const SidebarContext = React.createContext<{ collapsed: boolean; setCollapsed: React.Dispatch<React.SetStateAction<boolean>>; }>({
  collapsed: false,
  setCollapsed: () => {},
});

const useSidebar = () => React.useContext(SidebarContext);

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof sidebarVariants> {
    collapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ className, ...props }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(props.collapsed ?? false);

  return (
    <SidebarContext.Provider value={{ collapsed: isCollapsed, setCollapsed: setIsCollapsed }}>
        <aside className={cn(sidebarVariants({ collapsed: isCollapsed }), className, "hidden md:flex")} {...props} />
    </SidebarContext.Provider>
  )
}

const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
    const { collapsed, setCollapsed } = useSidebar();
    const navigate = useNavigate();

    return(
        <div 
          ref={ref} 
          className={cn(
            "flex items-center p-4 h-24 shrink-0", 
            collapsed ? "flex-col justify-start pt-2 gap-4" : "flex-row justify-between", // A linha modificada
            className
          )} 
          {...props}
        >
             {/* Logo Completa (visível quando expandido) */}
             <img
                src={TubeProLogoFull}
                alt="TubePro Logo"
                onClick={() => navigate('/')}
                className={cn(
                    "h-16 object-contain cursor-pointer",
                    collapsed && "hidden" // Esconde quando recolhido
                )}
            />
            
            {/* Ícone da Logo (visível quando recolhido) */}
            <img
                src={TubeProLogoIcon}
                alt="TubePro Icon"
                onClick={() => setCollapsed(false)} // Clicar no ícone expande
                className={cn(
                    "h-10 w-10 object-contain cursor-pointer",
                    !collapsed && "hidden" // Esconde quando expandido
                )}
            />
            
            {/* Botão de recolher/expandir */}
            <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="shrink-0">
                <ChevronLeft className={cn("transition-transform duration-300", collapsed && "rotate-180")} />
            </Button>
        </div>
    )
});
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex-1 overflow-y-auto px-2", className)} {...props} />
));
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-2 mt-auto shrink-0", className)} {...props} />
));
SidebarFooter.displayName = "SidebarFooter"

interface SidebarLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    icon: React.ElementType;
    label: string;
    path: string;
    action?: () => void;
}

const SidebarLink = React.forwardRef<HTMLAnchorElement, SidebarLinkProps>(({ icon: Icon, label, path, action, ...props }, ref) => {
    const { collapsed } = useSidebar();
    const location = useLocation();
    const navigate = useNavigate();
    const isActive = location.pathname === path;

    const linkContent = (
      <a
        ref={ref}
        href={path}
        onClick={(e) => { e.preventDefault(); action ? action() : navigate(path); }}
        className={cn(
          buttonVariants({ variant: "ghost", size: "default" }),
          "w-full justify-start gap-3",
          isActive && "btn-gradient text-white",
          collapsed && "w-10 h-10 p-0 justify-center"
        )}
        {...props}
      >
        <Icon className="h-5 w-5" />
        <span className={cn("font-medium", collapsed && "hidden")}>{label}</span>
      </a>
    );

    if (collapsed) {
        return (
            <TooltipProvider>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    return linkContent;
});
SidebarLink.displayName = "SidebarLink"


const MobileSidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
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
        <Sheet>
            <SheetTrigger asChild><Button variant="ghost" size="icon" className="md:hidden"><Menu /></Button></SheetTrigger>
            <SheetContent side="left" className="w-64 bg-tubepro-darkAccent border-r border-white/10 text-white p-4 flex flex-col">
                <img src={TubeProLogoFull} alt="TubePro Logo" onClick={() => navigate('/')} className="h-12 object-contain cursor-pointer mb-8" />
                <nav className="flex flex-col gap-2">
                    {menuItems.map(item => (
                        <Button key={item.label} variant={location.pathname === item.path ? "default" : "ghost"} className={cn("justify-start gap-3", location.pathname === item.path && "btn-gradient")} onClick={() => navigate(item.path)}>
                            <item.icon className="h-5 w-5" /> {item.label}
                        </Button>
                    ))}
                </nav>
                <div className="mt-auto pt-4 border-t border-white/20">
                    {user ? (
                        <>
                            <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => navigate('/profile')}><UserIcon className="h-5 w-5" /> Perfil</Button>
                            <Button variant="ghost" className="w-full justify-start gap-3" onClick={logout}><LogOut className="h-5 w-5" /> Sair</Button>
                        </>
                    ) : (
                        <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => navigate('/login')}><LogIn className="h-5 w-5" /> Entrar</Button>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}

export { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarLink, MobileSidebar };