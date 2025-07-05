// src/pages/Profile.tsx

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { User, Settings, CreditCard, BarChart, FileText, Coins, Award, Bot, Lightbulb, Edit, Check, X } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BackButton from '@/components/BackButton';

const Profile: React.FC = () => {
  const { user, logout, earnCoins } = useAuth();
  const navigate = useNavigate();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedCoins, setSelectedCoins] = useState(100);

  const coinPackages = [
    { amount: 100, price: 'R$ 9,90', savings: '0%' },
    { amount: 500, price: 'R$ 39,90', savings: '20%' },
    { amount: 1000, price: 'R$ 69,90', savings: '30%' },
    { amount: 5000, price: 'R$ 279,90', savings: '43%' }
  ];

  if (!user) {
    navigate('/login');
    return null;
  }

  const progressPercentage = Math.floor((user.experience / user.experienceToNextLevel) * 100);

  const handleStartEditing = () => {
    setEditedName(user.name);
    setIsEditingProfile(true);
  };

  const handleSaveProfile = () => {
    if (editedName.trim() === '') {
      toast.error('O nome não pode ficar em branco');
      return;
    }
    
    toast.success('Perfil atualizado com sucesso!');
    setIsEditingProfile(false);
  };

  const handlePurchaseCoins = () => {
    earnCoins(selectedCoins, 'Compra de pacote');
    setPurchaseDialogOpen(false);
    toast.success(`Você comprou ${selectedCoins} Tubecoins com sucesso!`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton to="/" />
          <div>
            <h1 className="text-3xl font-bold mb-2">Meu Perfil</h1>
            <p className="text-white/60">Gerencie sua conta e preferências</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-sm">Bem-vindo, {user.name}</span>
          <div className="flex items-center gap-1 bg-gradient-to-r from-tubepro-red to-tubepro-yellow p-1 px-2 rounded-full">
            <Coins size={14} />
            <span className="font-bold text-sm">{user.tubecoins}</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-tubepro-darkAccent border-b border-white/10 w-full justify-start mb-6">
          <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-tubepro-red data-[state=active]:to-tubepro-yellow">
            Perfil
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-tubepro-red data-[state=active]:to-tubepro-yellow">
            Estatísticas
          </TabsTrigger>
          <TabsTrigger value="rewards" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-tubepro-red data-[state=active]:to-tubepro-yellow">
            Conquistas
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-tubepro-red data-[state=active]:to-tubepro-yellow">
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card className="bg-tubepro-darkAccent border-white/10 text-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-r from-tubepro-red to-tubepro-yellow rounded-full p-6 w-16 h-16 flex items-center justify-center">
                        <User size={24} />
                      </div>
                      {isEditingProfile ? (
                        <Input 
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="bg-tubepro-dark border-white/10 max-w-[200px]"
                        />
                      ) : (
                        <div>
                          <CardTitle>{user.name}</CardTitle>
                          <CardDescription className="text-white/60">{user.email}</CardDescription>
                        </div>
                      )}
                    </div>
                    {isEditingProfile ? (
                      <div className="flex gap-2">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={handleSaveProfile}
                          className="text-green-500 hover:bg-green-500/20"
                        >
                          <Check size={18} />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => setIsEditingProfile(false)}
                          className="text-red-500 hover:bg-red-500/20"
                        >
                          <X size={18} />
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={handleStartEditing}
                        className="text-white/70 hover:bg-white/10"
                      >
                        <Edit size={18} />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mt-2">
                    <div className="flex items-center justify-between py-2 border-b border-white/10">
                      <span className="text-white/70">Plano</span>
                      <span className="font-semibold capitalize">{user.plan === 'pro' ? 'Pro' : user.plan === 'business' ? 'Business' : 'Free'}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-white/10">
                      <span className="text-white/70">Nível</span>
                      <div className="flex items-center gap-2">
                        <span className="bg-gradient-to-r from-tubepro-red to-tubepro-yellow text-white font-bold px-2 py-1 rounded-md">
                          {user.level}
                        </span>
                      </div>
                    </div>
                    <div className="py-3 border-b border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/70">Progresso</span>
                        <span className="text-xs text-white/60">{user.experience}/{user.experienceToNextLevel} XP</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2 bg-white/10" indicatorClassName="bg-gradient-to-r from-tubepro-red to-tubepro-yellow" />
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-white/10">
                      <span className="text-white/70">Tubecoins</span>
                      <div className="flex items-center gap-1">
                        <Coins size={16} className="text-tubepro-yellow" />
                        <span className="font-bold">{user.tubecoins}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-white/70">ID da conta</span>
                      <span className="font-mono text-xs text-white/60">#{user.id}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button 
                    className="w-full btn-gradient" 
                    onClick={() => setPurchaseDialogOpen(true)}
                  >
                    <Coins size={16} className="mr-2" />
                    Comprar Tubecoins
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="outline" 
                    onClick={logout}
                  >
                    Sair da conta
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card className="bg-tubepro-darkAccent border-white/10 text-white h-full">
                <CardHeader>
                  <CardTitle className="text-2xl">Informações da Conta</CardTitle>
                  <CardDescription className="text-white/60">
                    Gerencie suas preferências e informações de conta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <User size={18} />
                      Detalhes do Perfil
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm text-white/70">Nome</label>
                        <Input value={user.name} readOnly className="bg-tubepro-dark border-white/10" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-white/70">Email</label>
                        <Input value={user.email} readOnly className="bg-tubepro-dark border-white/10" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Coins size={18} className="text-tubepro-yellow" />
                      Tubecoins e Recursos
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-tubepro-dark border-white/5">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb size={18} className="text-tubepro-yellow" />
                            <h4 className="font-medium">Geração de Ideias</h4>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-white/60 text-sm">Custo</span>
                            <div className="flex items-center gap-1">
                              <Coins size={14} className="text-tubepro-yellow" />
                              <span>10</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-tubepro-dark border-white/5">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText size={18} className="text-tubepro-red" />
                            <h4 className="font-medium">Escrita de Roteiro</h4>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-white/60 text-sm">Custo</span>
                            <div className="flex items-center gap-1">
                              <Coins size={14} className="text-tubepro-yellow" />
                              <span>25</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-tubepro-dark border-white/5">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Bot size={18} className="text-tubepro-yellow" />
                            <h4 className="font-medium">Assistente AI</h4>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-white/60 text-sm">Custo</span>
                            <div className="flex items-center gap-1">
                              <Coins size={14} className="text-tubepro-yellow" />
                              <span>15</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Award size={18} className="text-tubepro-yellow" />
                      Nível e Experiência
                    </h3>
                    <div className="bg-tubepro-dark p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span>Nível atual: {user.level}</span>
                        <span>Próximo nível: {user.level + 1}</span>
                      </div>
                      <Progress value={progressPercentage} className="h-3 bg-white/5" indicatorClassName="bg-gradient-to-r from-tubepro-red to-tubepro-yellow" />
                      <div className="flex justify-end mt-2">
                        <span className="text-sm text-white/60">{user.experience}/{user.experienceToNextLevel} XP</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-tubepro-darkAccent border-white/10 text-white">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <BarChart className="w-5 h-5 text-tubepro-red" />
                  <CardTitle className="text-lg">Estatísticas</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/60 text-sm">Vídeos Criados</p>
                    <p className="text-2xl font-bold">{user.usageHistory.length}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Roteiros</p>
                    <p className="text-2xl font-bold">
                      {user.usageHistory.filter(item => item.feature.includes('Roteiro')).length}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Ideias Geradas</p>
                    <p className="text-2xl font-bold">
                      {user.usageHistory.filter(item => item.feature.includes('Ideia')).length}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Tubecoins Gastos</p>
                    <p className="text-2xl font-bold">
                      {user.usageHistory.reduce((total, item) => total + item.coinsSpent, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gráfico de uso (simulado) */}
            <Card className="bg-tubepro-darkAccent border-white/10 text-white">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <BarChart className="w-5 h-5 text-tubepro-yellow" />
                  <CardTitle className="text-lg">Uso no Tempo</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-end justify-between gap-2">
                  {[25, 40, 30, 70, 90, 60, 50].map((height, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="w-8 bg-gradient-to-t from-tubepro-red to-tubepro-yellow rounded-t-sm" 
                        style={{ height: `${height}%` }}
                      ></div>
                      <span className="text-xs mt-2 text-white/60">D{index + 1}</span>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-4 text-white/60 text-sm">
                  Atividade dos últimos 7 dias
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rewards">
          <Card className="bg-tubepro-darkAccent border-white/10 text-white">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-tubepro-yellow" />
                <CardTitle>Conquistas</CardTitle>
              </div>
              <CardDescription className="text-white/60">
                Acompanhe seu progresso e desbloqueie recompensas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10">
                    <div className={`rounded-full p-2 ${user.level >= 1 ? 'bg-gradient-to-r from-tubepro-red to-tubepro-yellow' : 'bg-white/10'}`}>
                      <Award size={16} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Iniciante</p>
                      <p className="text-white/60 text-xs">Alcance o nível 1</p>
                    </div>
                    {user.level >= 1 ? (
                      <div className="flex items-center gap-1 text-green-400">
                        <Check size={16} />
                        <span className="text-xs">+50 coins</span>
                      </div>
                    ) : (
                      <div className="text-white/40 text-xs">Pendente</div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10">
                    <div className={`rounded-full p-2 ${user.level >= 5 ? 'bg-gradient-to-r from-tubepro-red to-tubepro-yellow' : 'bg-white/10'}`}>
                      <Award size={16} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Criador Experiente</p>
                      <p className="text-white/60 text-xs">Alcance o nível 5</p>
                    </div>
                    {user.level >= 5 ? (
                      <div className="flex items-center gap-1 text-green-400">
                        <Check size={16} />
                        <span className="text-xs">+200 coins</span>
                      </div>
                    ) : (
                      <div className="text-white/40 text-xs">Pendente</div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10">
                    <div className={`rounded-full p-2 ${user.level >= 10 ? 'bg-gradient-to-r from-tubepro-red to-tubepro-yellow' : 'bg-white/10'}`}>
                      <Award size={16} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Mestre do YouTube</p>
                      <p className="text-white/60 text-xs">Alcance o nível 10</p>
                    </div>
                    {user.level >= 10 ? (
                      <div className="flex items-center gap-1 text-green-400">
                        <Check size={16} />
                        <span className="text-xs">+500 coins</span>
                      </div>
                    ) : (
                      <div className="text-white/40 text-xs">Pendente</div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10">
                    <div className={`rounded-full p-2 ${user.usageHistory.filter(item => item.feature.includes('Roteiro')).length >= 5 ? 'bg-gradient-to-r from-tubepro-red to-tubepro-yellow' : 'bg-white/10'}`}>
                      <FileText size={16} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Roteirista</p>
                      <p className="text-white/60 text-xs">Crie 5 roteiros</p>
                    </div>
                    {user.usageHistory.filter(item => item.feature.includes('Roteiro')).length >= 5 ? (
                      <div className="flex items-center gap-1 text-green-400">
                        <Check size={16} />
                        <span className="text-xs">+100 coins</span>
                      </div>
                    ) : (
                      <div className="text-white/40 text-xs">
                        {user.usageHistory.filter(item => item.feature.includes('Roteiro')).length}/5
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10">
                    <div className={`rounded-full p-2 ${user.usageHistory.filter(item => item.feature.includes('Ideia')).length >= 10 ? 'bg-gradient-to-r from-tubepro-red to-tubepro-yellow' : 'bg-white/10'}`}>
                      <Lightbulb size={16} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Idealizador</p>
                      <p className="text-white/60 text-xs">Gere 10 ideias de vídeo</p>
                    </div>
                    {user.usageHistory.filter(item => item.feature.includes('Ideia')).length >= 10 ? (
                      <div className="flex items-center gap-1 text-green-400">
                        <Check size={16} />
                        <span className="text-xs">+150 coins</span>
                      </div>
                    ) : (
                      <div className="text-white/40 text-xs">
                        {user.usageHistory.filter(item => item.feature.includes('Ideia')).length}/10
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10">
                    <div className={`rounded-full p-2 ${user.usageHistory.length >= 20 ? 'bg-gradient-to-r from-tubepro-red to-tubepro-yellow' : 'bg-white/10'}`}>
                      <Bot size={16} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Super Usuário</p>
                      <p className="text-white/60 text-xs">Use 20 recursos da plataforma</p>
                    </div>
                    {user.usageHistory.length >= 20 ? (
                      <div className="flex items-center gap-1 text-green-400">
                        <Check size={16} />
                        <span className="text-xs">+300 coins</span>
                      </div>
                    ) : (
                      <div className="text-white/40 text-xs">
                        {user.usageHistory.length}/20
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="bg-tubepro-darkAccent border-white/10 text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Histórico de Atividades</CardTitle>
                <BarChart className="w-5 h-5 text-white/60" />
              </div>
              <CardDescription className="text-white/60">
                Suas atividades recentes na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.usageHistory.length > 0 ? (
                  user.usageHistory
                    .slice()
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((activity, index) => {
                      const date = new Date(activity.date);
                      const formattedDate = date.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                      
                      return (
                        <div key={index} className="flex items-center p-3 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                          <div className="bg-white/5 rounded-full p-2 mr-4">
                            {activity.feature.includes('Ideia') && <Lightbulb className="text-tubepro-yellow" size={18} />}
                            {activity.feature.includes('Roteiro') && <FileText className="text-tubepro-red" size={18} />}
                            {activity.feature.includes('Assistente') && <Bot className="text-tubepro-yellow" size={18} />}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{activity.feature}</p>
                            <p className="text-xs text-white/60">{formattedDate}</p>
                          </div>
                          <div className="flex items-center gap-1 text-white/80">
                            <Coins size={14} className="text-tubepro-yellow" />
                            <span>{activity.coinsSpent}</span>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="text-center py-6 text-white/60">
                    <p>Nenhuma atividade registrada ainda.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo de compra de Tubecoins */}
      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent className="bg-tubepro-darkAccent border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Coins className="text-tubepro-yellow" />
              Comprar Tubecoins
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Escolha um pacote para adicionar mais Tubecoins à sua conta
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {coinPackages.map((pkg) => (
              <div 
                key={pkg.amount}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedCoins === pkg.amount 
                    ? 'border-tubepro-yellow bg-gradient-to-br from-tubepro-red/10 to-tubepro-yellow/10' 
                    : 'border-white/10 hover:border-white/30'
                }`}
                onClick={() => setSelectedCoins(pkg.amount)}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold flex items-center gap-1">
                    <Coins size={16} className="text-tubepro-yellow" />
                    {pkg.amount}
                  </span>
                  {pkg.savings !== '0%' && (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                      {pkg.savings} OFF
                    </span>
                  )}
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold">{pkg.price}</span>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPurchaseDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="btn-gradient" onClick={handlePurchaseCoins}>
              Comprar {selectedCoins} Tubecoins
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;