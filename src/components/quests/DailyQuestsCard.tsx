'use client';

import { useEffect, useState } from 'react';
import { questsApi } from '@/lib/api/quests.api';
import { UserDailyQuest, TIER_LABELS, TIER_COLORS } from '@/types/quests.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Gift, Star } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DailyQuestsCardProps {
  compact?: boolean;
}

export function DailyQuestsCard({ compact = false }: DailyQuestsCardProps) {
  const [quests, setQuests] = useState<UserDailyQuest[]>([]);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    questsApi.getDaily().then(setQuests).catch(() => {});

    // Listen for quest completed events
    const handleCompleted = () => {
      questsApi.getDaily().then(setQuests).catch(() => {});
    };
    window.addEventListener('quest:completed', handleCompleted);
    return () => window.removeEventListener('quest:completed', handleCompleted);
  }, []);

  const handleClaim = async (questId: string) => {
    setClaiming(questId);
    try {
      const result = await questsApi.claim(questId);
      toast.success(`+${result.xp_awarded} XP resgatados!`);
      // Refresh quests
      const updated = await questsApi.getDaily();
      setQuests(updated);
    } catch {
      toast.error('Erro ao resgatar XP');
    } finally {
      setClaiming(null);
    }
  };

  if (quests.length === 0) return null;

  const displayedQuests = compact ? quests.slice(0, 2) : quests;

  return (
    <div className="space-y-3">
      {displayedQuests.map((quest) => {
        const progress = Math.min(100, Math.round((quest.current_progress / quest.target_value) * 100));

        return (
          <div
            key={quest.id}
            className={cn(
              'rounded-lg border p-3 space-y-2 transition-colors',
              quest.xp_claimed && 'opacity-60'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={cn('text-xs', TIER_COLORS[quest.tier])}>
                  {TIER_LABELS[quest.tier]}
                </Badge>
                <span className="text-sm font-medium">{quest.title_pt}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 text-yellow-500" />
                {quest.xp_reward} XP
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground">{quest.description_pt}</p>

            {/* Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">{quest.current_progress}/{quest.target_value}</span>
                <span className="text-[#FFC800] font-bold">{progress}%</span>
              </div>
              {/* Gold progress bar */}
              <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: quest.xp_claimed ? '#58CC02' : '#FFC800',
                  }}
                />
              </div>
            </div>

            {/* Claim button */}
            {quest.is_completed && !quest.xp_claimed && (
              <Button
                size="sm"
                className="w-full gap-1 font-bold shadow-duo-green-sm hover:brightness-105 active:translate-y-0.5 active:shadow-none"
                onClick={() => handleClaim(quest.id)}
                disabled={claiming === quest.id}
              >
                <Gift className="h-4 w-4" />
                {claiming === quest.id ? 'Resgatando...' : 'Resgatar XP'}
              </Button>
            )}

            {/* Already claimed */}
            {quest.xp_claimed && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-[#58CC02] font-bold">
                <CheckCircle className="h-3.5 w-3.5" />
                Resgatado
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
