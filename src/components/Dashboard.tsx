import React from 'react';
import ToolSection from './ToolSection';
import {
  Lightbulb,
  Search,
  Users as UsersIcon,
  FileText,
  Film,
  FolderArchive,
  Zap,
  FileEdit,
  Tags,
  Image,
  Bot,
  BarChart,
  Youtube
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const ideationTools = [
    {
      title: 'Ideias de Vídeos',
      icon: <Lightbulb />,
      gradient: true,
      path: '/ideias',
      description: 'Gere ideias inovadoras para seus próximos vídeos do YouTube'
    },
    {
      title: 'Pesquisa de Vídeos em Alta',
      icon: <Search />,
      path: '/pesquisa',
      description: 'Descubra os temas mais populares no momento'
    },
    {
      title: 'Brainstorm em Grupo com IA',
      icon: <UsersIcon />,
      path: '/brainstorm',
      description: 'Colabore com IAs para ampliar suas ideias'
    }
  ];

  const scriptingTools = [
    {
      title: 'Criar Roteiro',
      icon: <FileText />,
      gradient: true,
      path: '/roteiro',
      description: 'Desenvolva roteiros completos para seus vídeos'
    },
    {
      title: 'Estrutura Narrativa',
      icon: <Film />,
      path: '/estrutura',
      description: 'Melhore o storytelling dos seus vídeos'
    },
    {
      title: 'Histórico de Roteiros',
      icon: <FolderArchive />,
      path: '/historico',
      description: 'Acesse e edite seus roteiros anteriores'
    }
  ];

  const transcriptionTools = [
    {
      title: 'Transcrição de Vídeo',
      icon: <Youtube />,
      gradient: true,
      path: '/transcricao',
      description: 'Transcreva áudio de vídeos do YouTube ou arquivos de vídeo'
    },
    {
      title: 'Gerador de Títulos, Descrição e Tags',
      icon: <FileEdit />,
      path: '/metadata',
      description: 'Crie metadados otimizados para SEO'
    },
    {
      title: 'Editor SEO Inteligente',
      icon: <Tags />,
      path: '/seo',
      description: 'Otimize seu conteúdo para os algoritmos do YouTube'
    }
  ];

  const otherTools = [
    {
      title: 'Gerador de Thumbnails',
      icon: <Image />,
      gradient: true,
      path: '/thumbnails',
      description: 'Crie thumbnails atraentes que aumentam o CTR'
    },
    {
      title: 'Assistente GPT',
      icon: <Bot />,
      path: '/assistente',
      description: 'Tire dúvidas e receba orientações personalizadas'
    },
    {
      title: 'Análise de Performance',
      icon: <BarChart />,
      path: '/analytics',
      description: 'Acompanhe e analise o desempenho dos seus vídeos'
    }
  ];

  const handleToolClick = (path: string) => {
    // ATUALIZADO PARA INCLUIR A NOVA ROTA
    const availablePaths = ['/ideias', '/roteiro', '/assistente', '/transcricao', '/historico'];
    if (availablePaths.includes(path)) {
      navigate(path);
    } else {
      toast.info("Esta funcionalidade estará disponível em breve!");
    }
  };

  return (
    <div className="py-6">
      <div className="mb-10">
        <div className="p-6 rounded-xl bg-tubepro-darkAccent border border-white/10 mb-8">
          <h1 className="text-4xl font-bold mb-2">Bem-vindo ao TubePro</h1>
          <p className="text-xl font-light text-gradient">
            Crescer no YouTube Agora Ficou Fácil!
          </p>
          <p className="mt-4 text-white/70">
            Use nossas ferramentas de IA para criar conteúdo de alta qualidade, otimizar seus vídeos
            e aumentar seu alcance no YouTube.
          </p>
        </div>
      </div>

      <ToolSection
        title="Ideation"
        description="Gere ideias inovadoras para seus próximos vídeos"
        tools={ideationTools}
        onToolClick={handleToolClick}
      />

      <ToolSection
        title="Scripting"
        description="Crie roteiros envolventes com assistência de IA"
        tools={scriptingTools}
        onToolClick={handleToolClick}
      />

      <ToolSection
        title="Transcrição"
        description="Transcreva e otimize conteúdo de vídeos"
        tools={transcriptionTools}
        onToolClick={handleToolClick}
      />

      <ToolSection
        title="Outras Ferramentas"
        description="Recursos adicionais para impulsionar seu canal"
        tools={otherTools}
        onToolClick={handleToolClick}
      />
    </div>
  );
};

export default Dashboard;