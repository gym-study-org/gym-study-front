'use client';

import { Achievement, TIER_COLORS, TIER_BG_COLORS } from '@/lib/api/achievements.api';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export function AchievementBadge({
  achievement,
  size = 'md',
  showTooltip = true,
}: AchievementBadgeProps) {
  const IconComponent = ICON_MAP[achievement.icon] || Star;
  const tierColor = TIER_COLORS[achievement.tier];

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const badge = (
    <div
      className={cn(
        'flex items-center justify-center rounded-full border-2',
        TIER_BG_COLORS[achievement.tier],
        sizeClasses[size]
      )}
      style={{ borderColor: tierColor }}
    >
      <span style={{ color: tierColor }}>
        <IconComponent className={iconSizeClasses[size]} />
      </span>
    </div>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px]">
          <p className="font-semibold" style={{ color: tierColor }}>
            {achievement.name}
          </p>
          <p className="text-xs text-muted-foreground">{achievement.description}</p>
          <p className="text-xs font-medium mt-1" style={{ color: tierColor }}>
            +{achievement.points} pts
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface AchievementBadgeListProps {
  achievements: Achievement[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function AchievementBadgeList({
  achievements,
  maxDisplay = 5,
  size = 'md',
}: AchievementBadgeListProps) {
  const displayedAchievements = achievements.slice(0, maxDisplay);
  const remainingCount = achievements.length - maxDisplay;

  return (
    <div className="flex items-center gap-1">
      {displayedAchievements.map((achievement) => (
        <AchievementBadge key={achievement.id} achievement={achievement} size={size} />
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-muted text-muted-foreground font-medium text-xs',
            size === 'sm' ? 'h-8 w-8' : size === 'md' ? 'h-10 w-10' : 'h-12 w-12'
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
