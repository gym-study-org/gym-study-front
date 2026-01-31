'use client';

import {
  AchievementWithUnlockStatus,
  TIER_BG_COLORS,
  TIER_TEXT_COLORS,
  TIER_COLORS,
} from '@/lib/api/achievements.api';
import {
  Clock,
  BookOpen,
  GraduationCap,
  Crown,
  Gem,
  Flame,
  Zap,
  Target,
  Star,
  Diamond,
  UserPlus,
  Users,
  Award,
  Medal,
  Trophy,
  Crosshair,
  CheckCircle,
  Play,
  BookMarked,
  Swords,
  Sparkles,
  Sunrise,
  Moon,
  Calendar,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Clock,
  BookOpen,
  GraduationCap,
  Crown,
  Gem,
  Flame,
  Zap,
  Target,
  Star,
  Diamond,
  UserPlus,
  Users,
  Award,
  Medal,
  Trophy,
  Crosshair,
  CheckCircle,
  Play,
  BookMarked,
  Swords,
  Sparkles,
  Sunrise,
  Moon,
  Calendar,
};

interface AchievementCardProps {
  achievement: AchievementWithUnlockStatus;
  compact?: boolean;
}

export function AchievementCard({ achievement, compact = false }: AchievementCardProps) {
  const IconComponent = ICON_MAP[achievement.icon] || Star;
  const tierColor = TIER_COLORS[achievement.tier];

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border transition-all',
          achievement.unlocked
            ? TIER_BG_COLORS[achievement.tier]
            : 'bg-muted/50 border-muted opacity-60'
        )}
      >
        <div
          className={cn(
            'p-2 rounded-full',
            achievement.unlocked ? 'bg-background/50' : 'bg-muted'
          )}
          style={{ color: achievement.unlocked ? tierColor : undefined }}
        >
          {achievement.unlocked ? (
            <IconComponent className="h-5 w-5" />
          ) : (
            <Lock className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'font-medium truncate',
              achievement.unlocked ? TIER_TEXT_COLORS[achievement.tier] : 'text-muted-foreground'
            )}
          >
            {achievement.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">{achievement.description}</p>
        </div>
        <div className="text-right">
          <p
            className={cn(
              'text-sm font-bold',
              achievement.unlocked ? TIER_TEXT_COLORS[achievement.tier] : 'text-muted-foreground'
            )}
          >
            +{achievement.points}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex flex-col items-center p-6 rounded-xl border-2 transition-all hover:scale-105',
        achievement.unlocked
          ? TIER_BG_COLORS[achievement.tier]
          : 'bg-muted/30 border-muted opacity-60 grayscale'
      )}
    >
      {/* Tier badge */}
      <span
        className={cn(
          'absolute top-2 right-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full',
          achievement.unlocked ? 'bg-background/50' : 'bg-muted'
        )}
        style={{ color: achievement.unlocked ? tierColor : undefined }}
      >
        {achievement.tier}
      </span>

      {/* Icon */}
      <div
        className={cn(
          'p-4 rounded-full mb-4',
          achievement.unlocked ? 'bg-background/50' : 'bg-muted'
        )}
        style={{ color: achievement.unlocked ? tierColor : undefined }}
      >
        {achievement.unlocked ? (
          <IconComponent className="h-10 w-10" />
        ) : (
          <Lock className="h-10 w-10 text-muted-foreground" />
        )}
      </div>

      {/* Name */}
      <h3
        className={cn(
          'text-lg font-bold text-center mb-2',
          achievement.unlocked ? TIER_TEXT_COLORS[achievement.tier] : 'text-muted-foreground'
        )}
      >
        {achievement.name}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground text-center mb-4 line-clamp-2">
        {achievement.description}
      </p>

      {/* Points */}
      <div
        className={cn(
          'text-2xl font-bold',
          achievement.unlocked ? TIER_TEXT_COLORS[achievement.tier] : 'text-muted-foreground'
        )}
      >
        +{achievement.points}
        <span className="text-sm font-normal ml-1">pts</span>
      </div>

      {/* Unlocked date */}
      {achievement.unlocked && achievement.unlocked_at && (
        <p className="text-xs text-muted-foreground mt-2">
          Desbloqueado em{' '}
          {format(new Date(achievement.unlocked_at), "d 'de' MMM 'de' yyyy", { locale: ptBR })}
        </p>
      )}
    </div>
  );
}
