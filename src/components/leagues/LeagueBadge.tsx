'use client';

import { useEffect, useState } from 'react';
import { leaguesApi } from '@/lib/api/leagues.api';
import { CurrentLeagueResponse } from '@/types/leagues.types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, Gem, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface LeagueBadgeProps {
  className?: string;
  sidebar?: boolean;
}

const LEAGUE_ICONS: Record<string, React.ElementType> = {
  shield: Shield,
  gem: Gem,
  crown: Crown,
};

export function LeagueBadge({ className, sidebar = false }: LeagueBadgeProps) {
  const [data, setData] = useState<CurrentLeagueResponse | null>(null);

  useEffect(() => {
    leaguesApi.getCurrent().then(setData).catch(() => {});
  }, []);

  if (!data) return null;

  const Icon = LEAGUE_ICONS[data.league.icon] || Shield;

  if (sidebar) {
    return (
      <Link
        href="/leagues"
        className={cn(
          'flex items-center gap-2.5 rounded-2xl border-2 px-3 py-2.5 transition-all hover:-translate-y-0.5 hover:shadow-card no-underline bg-white',
          className
        )}
        style={{ borderColor: data.league.color + '40' }}
      >
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
          style={{ backgroundColor: data.league.color + '20' }}
        >
          <Icon className="h-5 w-5" style={{ color: data.league.color }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-foreground">{data.league.name_pt}</p>
          {data.my_position && (
            <p className="text-[10px] text-muted-foreground font-medium">
              #{data.my_position} · {data.my_weekly_xp} XP esta semana
            </p>
          )}
        </div>
      </Link>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="/leagues"
            className={cn('flex items-center gap-1.5 cursor-pointer', className)}
          >
            <Icon
              className="h-4 w-4"
              style={{ color: data.league.color }}
            />
            <span className="text-sm font-semibold">{data.league.name_pt}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>Liga {data.league.name_pt}</p>
          {data.my_position && <p>Posição #{data.my_position} de {data.total_members}</p>}
          <p>{data.my_weekly_xp} XP esta semana</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
