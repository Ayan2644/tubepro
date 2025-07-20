// src/App.tsx

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from 'react';

// Importações de Componentes e Páginas
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./components/Dashboard";
import NotFound from "./pages/NotFound";
import Assistente from "./pages/Assistente";
import Ideias from "./pages/Ideias";
import Roteiro from "./pages/Roteiro";
import Transcricao from "./pages/Transcricao";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import Historico from "./pages/Historico";
import YouTubeDashboard from "./pages/YouTubeDashboard"; // <-- 1. IMPORTAMOS O NOVO COMPONENTE
import { AuthProvider } from "./hooks/useAuth";

// Estilo global para a aplicação
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const AppRoutes = () => {
    return (
        <Routes>
          {/* Rotas públicas que não usam o layout principal */}
          <Route path="/login" element={<Login />} />
          <Route path="/update-password" element={<ResetPassword />} />
          <Route path="/logout" element={<Navigate to="/login" />} />

          {/* Rotas Protegidas que agora usam o Layout como pai */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* A rota "index" renderiza o Dashboard na raiz "/" */}
            <Route index element={<Dashboard />} />
            <Route path="assistente" element={<Assistente />} />
            <Route path="ideias" element={<Ideias />} />
            <Route path="roteiro" element={<Roteiro />} />
            <Route path="transcricao" element={<Transcricao />} />
            <Route path="profile" element={<Profile />} />
            <Route path="historico" element={<Historico />} />
            <Route path="youtube-dashboard" element={<YouTubeDashboard />} /> {/* <-- 2. ADICIONAMOS A NOVA ROTA */}
          </Route>

          {/* Rota de fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
    )
}

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <AppRoutes />
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;