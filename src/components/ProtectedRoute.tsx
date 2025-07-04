import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import AppSkeleton from './AppSkeleton'; // Importamos nosso novo componente

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    if (!isLoading && !user) {
      toast.error('Você precisa estar logado para acessar esta página');
    }
  }, [user, isLoading, location]); // Adicionado `location` ao array de dependências

  // Mostra nosso novo esqueleto de UI enquanto verifica a autenticação
  if (isLoading) {
    return <AppSkeleton />;
  }

  // Redireciona para login se não estiver autenticado
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Renderiza o conteúdo protegido se estiver autenticado
  return <>{children}</>;
};

export default ProtectedRoute;