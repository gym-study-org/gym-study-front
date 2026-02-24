'use client';

import { useEffect, useState } from 'react';
import { xpApi } from '@/lib/api/xp.api';
import { XPSummary } from '@/types/xp.types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface XPBarProps {
  compact?: boolean;
  sidebar?: boolean;
  className?: string;
}

export function XPBar({ compact = false, sidebar = false, className }: XPBarProps) {
  const [summary, setSummary] = useState<XPSummary | null>(null);

  const fetchSummary = () => {
    xpApi.getSummary().then(setSummary).catch(() => {});
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  // Re-fetch whenever the user earns XP so the bar updates in real time
  useEffect(() => {
    const handler = () => fetchSummary();
    window.addEventListener('xp:gained', handler);
    return () => window.removeEventListener('xp:gained', handler);
  }, []);

  if (!summary) return null;

  // Sidebar mode: compact progress with level label
  if (sidebar) {
    return (
      <div className={cn('space-y-1.5', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-[#FFC800] fill-[#FFC800]" />
            <span className="text-xs font-bold">Nível {summary.level}</span>
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">
            {summary.xp_to_next_level} XP
          </span>
        </div>
        {/* Gold progress bar */}
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-[#FFC800] transition-all"
            style={{ width: `${summary.level_progress_percent}%` }}
          />
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn('flex items-center gap-1.5 cursor-default', className)}>
              <Star className="h-4 w-4 text-[#FFC800] fill-[#FFC800]" />
              <span className="text-sm font-bold">Nv. {summary.level}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{summary.total_xp} XP total</p>
            <p>{summary.xp_to_next_level} XP para nível {summary.level + 1}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-duo-gold-tint">
            <Star className="h-4 w-4 text-[#FFC800] fill-[#FFC800]" />
          </div>
          <span className="font-extrabold text-lg">Nível {summary.level}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Zap className="h-3.5 w-3.5 text-[#FFC800]" />
          <span className="font-semibold">{summary.total_xp}</span>
        </div>
      </div>
      {/* Gold progress bar */}
      <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-[#FFC800] transition-all shadow-[0_0_8px_rgba(255,200,0,0.4)]"
          style={{ width: `${summary.level_progress_percent}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span className="font-medium">{summary.level_progress_percent}%</span>
        <span>{summary.xp_to_next_level} XP para nível {summary.level + 1}</span>
      </div>
      <div className="text-xs text-muted-foreground">
        <span className="font-semibold text-[#FFC800]">{summary.weekly_xp} XP</span> esta semana
      </div>
    </div>
  );
}
