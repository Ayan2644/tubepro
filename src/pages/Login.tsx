// src/pages/Login.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Key, LogIn, UserPlus, Loader2 } from 'lucide-react'; // Importamos o ícone de Loader
import BackButton from '@/components/BackButton';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  
  // MUDANÇA 1: Desestruturamos 'actionStatus' e renomeamos 'isLoading' para 'isAuthLoading'
  const { login, register, resetPassword, isLoading: isAuthLoading, actionStatus, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isLogin) {
        await login(email, password);
        // A navegação já é tratada dentro do hook de auth
      } else {
        if (name.trim() === '') {
          toast.error('Por favor, insira seu nome');
          return;
        }
        await register(name, email, password);
      }
    } catch (error: any) {
      // A notificação de erro já é tratada pelo hook,
      // mas mantemos o catch para evitar que a aplicação quebre.
      console.error('Falha na autenticação:', error.message);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetEmail.trim() === '') {
      toast.error('Por favor, insira seu email');
      return;
    }

    try {
      await resetPassword(resetEmail);
      setIsResetPasswordOpen(false);
      setResetEmail('');
    } catch (error: any) {
      console.error('Erro na recuperação de senha:', error.message);
      // O toast de erro já é mostrado pelo hook
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  // MUDANÇA 2: Criamos uma variável para controlar o estado de carregamento da ação
  const isActionLoading = actionStatus === 'loading';

  return (
    <div className="min-h-screen flex items-center justify-center bg-tubepro-dark p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2">TubePro</h1>
          <p className="text-white/60">Sua plataforma para crescer no YouTube</p>
        </div>

        <Card className="bg-tubepro-darkAccent border-white/10 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{isLogin ? 'Entrar' : 'Criar Conta'}</CardTitle>
              {isLogin ? <LogIn className="text-tubepro-red" size={24} /> : <UserPlus className="text-tubepro-yellow" size={24} />}
            </div>
            <CardDescription className="text-white/60">
              {isLogin
                ? 'Entre com suas credenciais para acessar sua conta'
                : 'Preencha os campos abaixo para criar sua conta'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nome
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Digite seu nome"
                    className="bg-tubepro-dark border-white/10"
                    required={!isLogin}
                    autoComplete="name"
                    disabled={isActionLoading} // Desabilita durante a ação
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu email"
                  className="bg-tubepro-dark border-white/10"
                  required
                  autoComplete="email"
                  disabled={isActionLoading} // Desabilita durante a ação
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="bg-tubepro-dark border-white/10"
                  required
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  disabled={isActionLoading} // Desabilita durante a ação
                />
              </div>

              <Button
                type="submit"
                className="w-full btn-gradient hover:opacity-90"
                disabled={isActionLoading || isAuthLoading} // MUDANÇA 3: Desabilita no carregamento da ação
              >
                {isActionLoading ? (
                  <><Loader2 className="animate-spin" /> Processando...</>
                ) : (
                  isLogin ? 'Entrar' : 'Criar Conta'
                )}
              </Button>

              {isLogin && (
                <div className="text-sm text-center mt-2">
                  <button
                    type="button"
                    onClick={() => setIsResetPasswordOpen(true)}
                    className="text-tubepro-red hover:underline inline-flex items-center gap-1"
                  >
                    <Key size={14} />
                    Esqueceu sua senha?
                  </button>
                </div>
              )}
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              variant="ghost"
              onClick={toggleAuthMode}
              className="text-white/70 hover:text-white w-full"
              disabled={isActionLoading}
            >
              {isLogin
                ? 'Não tem uma conta? Registre-se'
                : 'Já tem uma conta? Faça login'}
            </Button>

            <BackButton to="/" className="w-full justify-center" />
          </CardFooter>
        </Card>

        <div className="mt-6 text-center text-sm text-white/40">
          <p>
            Ao continuar, você concorda com os{' '}
            <a href="#" className="text-tubepro-red hover:underline">
              Termos de Serviço
            </a>{' '}
            e{' '}
            <a href="#" className="text-tubepro-red hover:underline">
              Política de Privacidade
            </a>
          </p>
        </div>
      </div>

      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent className="bg-tubepro-darkAccent border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Recuperar senha</DialogTitle>
            <DialogDescription className="text-white/60">
              Insira seu email para receber um link de recuperação de senha.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Digite seu email de registro"
                className="bg-tubepro-dark border-white/10"
                required
                autoComplete="email"
                disabled={isActionLoading}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-white/10"
                onClick={() => setIsResetPasswordOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="btn-gradient" disabled={isActionLoading}>
                {isActionLoading ? "Enviando..." : "Enviar link"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;