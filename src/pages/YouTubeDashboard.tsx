// src/pages/YouTubeDashboard.tsx

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Youtube, Zap, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/PageHeader';
import { toast } from 'sonner';

const YouTubeDashboard: React.FC = () => {
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Este useEffect irá lidar com o redirecionamento do Google e checar a conexão
    useEffect(() => {
        const handleAuthRedirectAndCheck = async () => {
            const queryParams = new URLSearchParams(window.location.search);
            const errorDescription = queryParams.get('error');
            const isConnectedSuccess = queryParams.get('connected');

            if (errorDescription) {
                toast.error('Falha na autenticação.', { description: decodeURIComponent(errorDescription) });
            }
            
            if (isConnectedSuccess === 'true') {
                toast.success("Canal conectado com sucesso!");
                setIsConnected(true);
            }
            
            // Limpa a URL para uma aparência mais limpa
            window.history.replaceState(null, '', window.location.pathname);
            
            if (user) {
                const { data, error } = await supabase
                    .from('youtube_channels')
                    .select('channel_id')
                    .eq('user_id', user.id)
                    .single();

                if (data && !error) {
                    setIsConnected(true);
                }
            }
            setLoading(false);
        };

        handleAuthRedirectAndCheck();
    }, [user]);

    const connectYouTube = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                scopes: 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly https://www.googleapis.com/auth/yt-analytics-monetary.readonly',
                redirectTo: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/youtube-auth-callback`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });

        if (error) {
            toast.error('Falha ao iniciar a conexão com o Google.', { description: error.message });
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full min-h-[60vh]"><Activity className="w-8 h-8 animate-spin text-tubepro-red" /></div>;
    }

    if (!isConnected) {
        return (
             <>
                <PageHeader
                    title={<>Analytics <span className="text-white font-bold">Profissional</span></>}
                    description="Conecte seu canal do YouTube para desbloquear métricas avançadas e insights que impulsionam o crescimento."
                />
                <div className="flex justify-center items-center">
                    <Card className="w-full max-w-lg bg-tubepro-darkAccent border-white/10 text-white shadow-lg shadow-black/30">
                        <CardHeader className="items-center text-center p-6 sm:p-8">
                            <div className="w-20 h-20 mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br from-tubepro-red to-tubepro-yellow">
                                <Youtube className="w-10 h-10 text-white" />
                            </div>
                            <CardTitle className="text-3xl font-bold">Conectar ao YouTube</CardTitle>
                            {/* A LINHA ABAIXO FOI A CORRIGIDA */}
                            <CardDescription className="text-white/70 pt-2 max-w-sm">
                                Conecte sua conta do YouTube para acessar analytics profissionais e insights detalhados do seu canal.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-6 sm:px-8 pb-8">
                            <div className="space-y-4 mb-8">
                                <h3 className="text-lg font-semibold flex items-center text-left">
                                    <Zap className="w-5 h-5 mr-2 text-tubepro-yellow" />
                                    Analytics Profissionais
                                </h3>
                                <ul className="space-y-2 text-white/80 pl-2">
                                    <li className="flex items-start">
                                        <span className="text-tubepro-red mr-3 mt-1 font-bold text-lg leading-none">•</span>
                                        Métricas em tempo real e relatórios avançados
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-tubepro-red mr-3 mt-1 font-bold text-lg leading-none">•</span>
                                        Análise detalhada de audiência e demografia
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-tubepro-red mr-3 mt-1 font-bold text-lg leading-none">•</span>
                                        Performance individual de vídeos e CTR
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-tubepro-red mr-3 mt-1 font-bold text-lg leading-none">•</span>
                                        Fontes de tráfego e retenção de audiência
                                    </li>
                                </ul>
                            </div>
                            <Button
                                onClick={connectYouTube}
                                disabled={loading}
                                className="w-full h-12 text-lg font-bold btn-gradient transition-transform hover:scale-105"
                            >
                                <Youtube className="w-6 h-6 mr-2" />
                                Conectar com YouTube
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }

    // Futuro Dashboard de Analytics
    return (
        <div>
            <h1 className="text-2xl font-bold">Dashboard do YouTube Conectado</h1>
            <p>Em breve, seus dados aparecerão aqui!</p>
        </div>
    );
};

export default YouTubeDashboard;