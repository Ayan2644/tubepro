import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Badge } from './ui/badge';

interface SeoCalculatorProps {
  title: string;
  description: string;
  tags: string[];
  script: {
    hook: string;
    cta: string;
  };
}

// Lógica de pontuação (simulada, mas baseada em boas práticas)
const calculateScores = (data: SeoCalculatorProps) => {
  // Força do Título (0-100)
  let titleScore = 0;
  if (data.title.length > 40 && data.title.length < 65) titleScore += 40; else titleScore += 15;
  if (/\d/.test(data.title)) titleScore += 30; // Contém número
  if (/(guia|definitivo|segredo|método|verdade|passo a passo)/i.test(data.title)) titleScore += 30; // Contém palavra de poder
  
  // Otimização da Descrição (0-100)
  const descriptionScore = Math.min(100, (data.description.length / 300) * 100);

  // Qualidade das Tags (0-100)
  const tagScore = Math.min(100, (data.tags.length / 15) * 100);
  
  // Potencial de Retenção (0-100)
  let retentionScore = 0;
  if (data.script.hook.length > 50) retentionScore += 50;
  if (data.script.cta.length > 50) retentionScore += 50;

  return [
    { subject: 'Título', score: titleScore, fullMark: 100 },
    { subject: 'Descrição', score: descriptionScore, fullMark: 100 },
    { subject: 'Tags', score: tagScore, fullMark: 100 },
    { subject: 'Retenção', score: retentionScore, fullMark: 100 },
  ];
};

const SeoCalculator: React.FC<SeoCalculatorProps> = (props) => {
    const scores = useMemo(() => calculateScores(props), [props]);
    const overallPotential = useMemo(() => Math.round(scores.reduce((acc, s) => acc + s.score, 0) / scores.length), [scores]);

    const getBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
        if (score >= 75) return "default";
        if (score >= 40) return "secondary";
        return "destructive";
    }

    return (
        <Card className="bg-tubepro-dark border-white/10 mt-6">
            <CardHeader>
                <CardTitle className="text-xl">Calculadora de Potencial do Vídeo</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                    <ResponsiveContainer width="100%" height={250}>
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={scores}>
                            <PolarGrid stroke="rgba(255, 255, 255, 0.2)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'white', fontSize: 14 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Potencial" dataKey="score" stroke="#E41A1A" fill="#E41A1A" fillOpacity={0.6} />
                             <Tooltip contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid rgba(255,255,255,0.1)'}}/>
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                    <p className="text-center text-lg text-white/80">Potencial Geral Estimado:</p>
                    <div className="flex justify-center items-baseline gap-2">
                         <p className="text-6xl font-bold text-gradient">{overallPotential}</p>
                         <p className="text-2xl text-white/60">/ 100</p>
                    </div>
                     <div className="flex justify-center pt-2">
                        <Badge variant={getBadgeVariant(overallPotential)} className="text-lg px-4 py-1">
                            {overallPotential >= 75 ? "Excelente" : overallPotential >= 40 ? "Bom" : "Pode Melhorar"}
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default SeoCalculator;