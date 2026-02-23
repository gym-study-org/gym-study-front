'use client';

import { useEffect, useState } from 'react';
import { storiesApi } from '@/lib/api/stories.api';
import { ProgressCardData } from '@/types/stories.types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flame, Trophy, Star, Clock, Zap, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export function ProgressCard() {
  const [data, setData] = useState<ProgressCardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeType, setActiveType] = useState<'weekly' | 'monthly' | 'streak' | 'overview'>('weekly');

  const loadCard = async (type: 'weekly' | 'monthly' | 'streak' | 'overview') => {
    setLoading(true);
    try {
      const result = await storiesApi.getProgressCard(type);
      setData(result);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCard(activeType);
  }, [activeType]);

  const handleShare = async () => {
    if (!data) return;
    try {
      const text = buildShareText(data);
      await navigator.clipboard.writeText(text);
      toast.success('Copiado! Cole no seu story ou post.');
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Card de Progresso</h3>
          <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={handleShare}>
            <Share2 className="h-3 w-3" /> Compartilhar
          </Button>
        </div>

        <Tabs value={activeType} onValueChange={(v) => setActiveType(v as any)}>
          <TabsList className="grid w-full grid-cols-4 h-8">
            <TabsTrigger value="weekly" className="text-xs">Semana</TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs">Mês</TabsTrigger>
            <TabsTrigger value="streak" className="text-xs">Streak</TabsTrigger>
            <TabsTrigger value="overview" className="text-xs">Geral</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading || !data ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="mt-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-4">
            <p className="text-xs text-muted-foreground mb-2">@{data.username}</p>
            <div className="grid grid-cols-2 gap-3">
              {data.level != null && (
                <StatItem icon={Star} label="Nível" value={String(data.level)} />
              )}
              {data.weekly_xp != null && (
                <StatItem icon={Zap} label="XP Semana" value={String(data.weekly_xp)} />
              )}
              {data.total_xp != null && activeType !== 'weekly' && (
                <StatItem icon={Zap} label="XP Total" value={String(data.total_xp)} />
              )}
              {data.streak != null && (
                <StatItem icon={Flame} label="Streak" value={`${data.streak} dias`} />
              )}
              {data.current_streak != null && (
                <StatItem icon={Flame} label="Streak Atual" value={`${data.current_streak} dias`} />
              )}
              {data.sessions != null && (
                <StatItem icon={Trophy} label="Sessões" value={String(data.sessions)} />
              )}
              {data.study_minutes != null && (
                <StatItem icon={Clock} label="Minutos" value={String(data.study_minutes)} />
              )}
              {data.total_study_hours != null && (
                <StatItem icon={Clock} label="Horas Total" value={`${data.total_study_hours}h`} />
              )}
              {data.league != null && (
                <StatItem icon={Trophy} label="Liga" value={String(data.league)} />
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function buildShareText(data: ProgressCardData): string {
  const lines = [`📊 GYM-STUDY — @${data.username}`];
  if (data.type === 'weekly') {
    lines.push(`⚡ ${data.weekly_xp} XP esta semana`);
    if (data.sessions) lines.push(`📚 ${data.sessions} sessões`);
    if (data.study_minutes) lines.push(`⏱️ ${data.study_minutes} minutos estudados`);
  } else if (data.type === 'streak') {
    lines.push(`🔥 ${data.current_streak} dias de streak`);
    lines.push(`🏆 Recorde: ${data.longest_streak} dias`);
  } else {
    if (data.total_xp) lines.push(`⚡ ${data.total_xp} XP total`);
    if (data.streak) lines.push(`🔥 ${data.streak} dias de streak`);
  }
  if (data.level) lines.push(`⭐ Nível ${data.level}`);
  if (data.league) lines.push(`🏅 Liga ${data.league}`);
  return lines.join('\n');
}
