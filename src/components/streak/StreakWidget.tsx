'use client';

import { useEffect, useState } from 'react';
import { streakApi } from '@/lib/api/streak.api';
import { StreakStatus } from '@/types/streak.types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Flame, Shield, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakWidgetProps {
  compact?: boolean;
  className?: string;
}

export function StreakWidget({ compact = false, className }: StreakWidgetProps) {
  const [status, setStatus] = useState<StreakStatus | null>(null);

  useEffect(() => {
    streakApi.getStatus().then(setStatus).catch(() => {});
  }, []);

  if (!status) return null;

  const isActive = status.current_streak > 0;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn('flex items-center gap-1.5 cursor-default', className)}>
              <Flame
                className={cn('h-4 w-4', isActive ? 'text-[#FF9600] fill-[#FF9600]' : 'text-muted-foreground')}
              />
              <span className="text-sm font-bold">{status.current_streak}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Ofensiva: {status.current_streak} dias</p>
            <p>Recorde: {status.longest_streak} dias</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const milestoneProgress = status.next_milestone
    ? Math.round(
        ((status.next_milestone.days - status.next_milestone.days_remaining) /
          status.next_milestone.days) *
          100
      )
    : 100;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Main streak display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl',
              isActive ? 'bg-duo-orange-tint' : 'bg-muted'
            )}
          >
            <Flame
              className={cn(
                'h-6 w-6',
                isActive ? 'text-[#FF9600] fill-[#FF9600]' : 'text-muted-foreground'
              )}
            />
          </div>
          <div>
            <span className="text-3xl font-black text-[#FF9600] leading-none">
              {status.current_streak}
            </span>
            <span className="text-sm text-muted-foreground ml-1.5">dias</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-lg px-2 py-1">
          <Trophy className="h-3.5 w-3.5" />
          <span className="font-semibold">{status.longest_streak}</span>
        </div>
      </div>

      {/* Freeze shields */}
      <div className="flex items-center gap-2">
        {[0, 1].map((i) => (
          <TooltipProvider key={i}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-lg cursor-default',
                    i < status.streak_freezes_available
                      ? 'bg-duo-blue-tint'
                      : 'bg-muted'
                  )}
                >
                  <Shield
                    className={cn(
                      'h-4 w-4',
                      i < status.streak_freezes_available
                        ? 'text-[#1CB0F6] fill-[#1CB0F6]/20'
                        : 'text-muted-foreground/40'
                    )}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {i < status.streak_freezes_available
                  ? 'Freeze disponível — protege sua ofensiva por 1 dia'
                  : 'Freeze indisponível — compre na loja'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        <span className="text-xs text-muted-foreground">
          {status.streak_freezes_available}/2 freezes
        </span>
        {status.streak_freeze_used_today && (
          <span className="text-xs text-[#1CB0F6] font-semibold">(usado hoje)</span>
        )}
      </div>

      {/* Next milestone progress */}
      {status.next_milestone && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Próximo marco: <span className="font-semibold text-foreground">{status.next_milestone.days} dias</span></span>
            <span>{status.next_milestone.days_remaining} restantes</span>
          </div>
          {/* Custom orange progress bar */}
          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-[#FF9600] transition-all"
              style={{ width: `${milestoneProgress}%` }}
            />
          </div>
          {status.next_milestone.xp_reward > 0 && (
            <p className="text-xs text-muted-foreground">
              +{status.next_milestone.xp_reward} XP ao atingir
            </p>
          )}
        </div>
      )}

      {/* Milestones achieved */}
      {status.milestones_achieved.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {status.milestones_achieved.map((m) => (
            <span
              key={m}
              className="inline-flex items-center rounded-full bg-duo-orange-tint border border-[#FF9600]/30 px-2 py-0.5 text-xs font-bold text-[#FF9600]"
            >
              🔥 {m}d
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
