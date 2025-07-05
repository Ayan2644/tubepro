import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Assistente from "./pages/Assistente";
import Ideias from "./pages/Ideias";
import Roteiro from "./pages/Roteiro";
import Transcricao from "./pages/Transcricao";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import { AuthProvider } from "./hooks/useAuth";
import React from 'react';
import ProtectedRoute from "./components/ProtectedRoute";
import ResetPassword from "./pages/ResetPassword";
import Historico from "./pages/Historico"; // <-- 1. IMPORTAR A NOVA PÁGINA

// Estilo global para a aplicação
import './index.css';

// Criar o queryClient fora do componente para evitar recriação a cada renderização
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minuto
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Rotas públicas */}
                <Route path="/login" element={<Login />} />
                <Route path="/update-password" element={<ResetPassword />} />

                {/* Rota de logout para redirecionamento */}
                <Route path="/logout" element={<Navigate to="/login" />} />

                {/* Rotas protegidas */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/assistente" element={
                  <ProtectedRoute>
                    <Assistente />
                  </ProtectedRoute>
                } />
                <Route path="/ideias" element={
                  <ProtectedRoute>
                    <Ideias />
                  </ProtectedRoute>
                } />
                <Route path="/roteiro" element={
                  <ProtectedRoute>
                    <Roteiro />
                  </ProtectedRoute>
                } />
                <Route path="/transcricao" element={
                  <ProtectedRoute>
                    <Transcricao />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                
                {/* 2. ADICIONAR A NOVA ROTA PARA O HISTÓRICO */}
                <Route path="/historico" element={
                  <ProtectedRoute>
                    <Historico />
                  </ProtectedRoute>
                } />

                {/* Rota de fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
