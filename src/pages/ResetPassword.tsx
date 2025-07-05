// src/pages/ResetPassword.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
// MUDANÇA IMPORTANTE: Importamos a instância 'supabase' diretamente
import { supabase } from '@/lib/supabase';
import { Key } from 'lucide-react';
import BackButton from '@/components/BackButton';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          setIsTokenValid(true);
          toast.info('Por favor, defina sua nova senha.');
        } else {
          setErrorMessage('Link de redefinição de senha inválido ou expirado.');
          toast.error('Link de redefinição de senha inválido ou expirado. Por favor, solicite um novo link.');
        }
      } catch (e: any) {
        console.error('Erro ao verificar sessão do token:', e);
        setErrorMessage(e.message || 'Erro ao verificar o link de redefinição. Tente solicitar um novo.');
        toast.error(e.message || 'Erro ao verificar o link de redefinição. Tente solicitar um novo.');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isTokenValid) {
      toast.error('Token de redefinição inválido. Por favor, solicite um novo link.');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      toast.success('Sua senha foi redefinida com sucesso! Você já pode fazer login.');
      navigate('/login');
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error);
      toast.error(error.message || 'Ocorreu um erro ao redefinir sua senha.');
      setErrorMessage(error.message || 'Erro ao redefinir senha.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tubepro-dark">
        <div className="p-4 rounded-lg bg-white/5 text-white">
          <div className="animate-spin w-8 h-8 border-4 border-white/20 border-t-tubepro-red rounded-full mx-auto mb-2"></div>
          <p className="text-white/70">Verificando link...</p>
        </div>
      </div>
    );
  }

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
              <CardTitle className="text-2xl">Redefinir Senha</CardTitle>
              <Key className="text-tubepro-red" size={24} />
            </div>
            <CardDescription className="text-white/60">
              {errorMessage ? errorMessage : "Insira e confirme sua nova senha."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isTokenValid ? (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nova Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua nova senha"
                    className="bg-tubepro-dark border-white/10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme sua nova senha"
                    className="bg-tubepro-dark border-white/10"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full btn-gradient hover:opacity-90"
                  disabled={isLoading}
                >
                  {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
                </Button>
              </form>
            ) : (
              <div className="text-center p-4 text-white/70">
                <p>{errorMessage || "Link de redefinição inválido ou expirado."}</p>
                <div className="mt-4">
                  <BackButton to="/login" className="w-full justify-center" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;