// src/pages/YouTubeDashboard.tsx

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Youtube, Users, Eye, PlayCircle, DollarSign, Activity, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BackButton from '@/components/BackButton';
import { toast } from 'sonner';

// ... (interfaces e outras importações permanecem as mesmas)

const YouTubeDashboard: React.FC = () => {
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [channelData, setChannelData] = useState<any>(null); // Usaremos 'any' por enquanto

    useEffect(() => {
        const handleAuthRedirect = async () => {
            const params = new URLSearchParams(window.location.search);
            const errorDescription = params.get('error');
            const isConnectedSuccess = params.get('connected');

            if (errorDescription) {
                toast.error('Falha na autenticação.', { description: decodeURIComponent(errorDescription) });
            }
            
            if (isConnectedSuccess) {
                toast.success("Canal conectado com sucesso!");
                setIsConnected(true);
            }
            
            // Limpa a URL para evitar re-processamento
            window.history.replaceState(null, '', window.location.pathname);
            
            // Se não veio de um redirect, verifica a conexão no DB
            if (!isConnectedSuccess) {
                await checkDbConnection();
            }
        };

        const checkDbConnection = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            const { data } = await supabase.from('youtube_tokens').select('user_id').eq('user_id', user.id).single();
            if (data) {
                setIsConnected(true);
            } else {
                setLoading(false);
            }
        };

        handleAuthRedirect();

    }, [user]);

    useEffect(() => {
        const fetchChannelData = async () => {
            if (isConnected && user) {
                setLoading(true);
                try {
                    const { data, error } = await supabase.functions.invoke('get-youtube-stats');
                    if (error) throw error;
                    setChannelData(data);
                } catch (err: any) {
                    toast.error("Falha ao buscar dados do YouTube.", { description: err.message });
                    setIsConnected(false);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchChannelData();
    }, [isConnected, user]);

    const connectYouTube = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                scopes: 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly https://www.googleapis.com/auth/yt-analytics-monetary.readonly',
                redirectTo: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/youtube-auth-callback`,
                queryParams: { access_type: 'offline', prompt: 'consent' },
            },
        });
        if (error) {
            toast.error('Falha ao iniciar a conexão.', { description: error.message });
            setLoading(false);
        }
    };
    
    const formatNumber = (num: number): string => {
        if (!num) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full min-h-[60vh]"><Activity className="w-8 h-8 animate-spin text-tubepro-red" /></div>;
    }

    if (!isConnected || !channelData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
              <div
                className="w-full max-w-md rounded-2xl p-8 flex flex-col items-center justify-center text-center"
                style={{ background: 'linear-gradient(145deg, var(--tubepro-brand-start), var(--tubepro-brand-end))' }}
              >
                <h1 className="text-4xl font-bold text-white mb-6">Conectar ao YouTube</h1>
                <div className="bg-white/20 rounded-2xl p-4 mb-8 backdrop-blur-sm">
                  <Youtube className="h-16 w-16 text-white" />
                </div>
                <Button
                  onClick={connectYouTube}
                  disabled={loading}
                  className="w-full h-14 text-lg font-semibold text-white rounded-xl transition-transform hover:scale-105"
                  style={{ background: 'linear-gradient(90deg, #FFB347, #FFCC33)', border: 'none', color: '#4A2A00' }}
                >
                  <Youtube className="w-6 h-6 mr-2" />
                  Conectar com YouTube
                </Button>
              </div>
            </div>
        );
    }

    return (
        // ... O JSX do seu dashboard conectado permanece o mesmo ...
        // Apenas certifique-se de usar `channelData.generalStats` para os KPIs
        <div className="min-h-screen bg-tubepro-dark">
            <div className="container mx-auto px-6 py-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-tubepro-red to-tubepro-yellow rounded-xl flex items-center justify-center"><Youtube className="w-6 h-6 text-white" /></div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">YouTube Analytics</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <p className="text-white/70">{channelData.generalStats.name}</p>
                                <Badge variant="outline" className="border-green-500 text-green-400 bg-green-500/10"><Activity className="w-3 h-3 mr-1" />Conectado</Badge>
                            </div>
                        </div>
                    </div>
                    <BackButton to="/" />
                </div>
                {/* ... resto do dashboard ... */}
            </div>
        </div>
    );
};

export default YouTubeDashboard;