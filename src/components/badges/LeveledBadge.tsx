'use client';

import { cn } from '@/lib/utils';
import {
  UserBadge,
  TIER_COLORS,
  TIER_GLOW_COLORS,
  getTierFromLevel,
} from '@/lib/api/badges.api';
import {
  GraduationCap,
  Flame,
  Users,
  Award,
  Target,
  Swords,
  Sparkles,
  Sunrise,
  Moon,
  Calendar,
  Lock,
  Crown,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap,
  Flame,
  Users,
  Award,
  Target,
  Swords,
  Sparkles,
  Sunrise,
  Moon,
  Calendar,
};

interface LeveledBadgeProps {
  badge: UserBadge;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showProgress?: boolean;
  showLevel?: boolean;
  showTooltip?: boolean;
  onClick?: () => void;
  className?: string;
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-20 h-20',
  xl: 'w-28 h-28',
};

const iconSizeClasses = {
  sm: 'h-5 w-5',
  md: 'h-7 w-7',
  lg: 'h-9 w-9',
  xl: 'h-12 w-12',
};

const levelTextSizes = {
  sm: 'text-[8px]',
  md: 'text-[10px]',
  lg: 'text-xs',
  xl: 'text-sm',
};

export function LeveledBadge({
  badge,
  size = 'md',
  showProgress = true,
  showLevel = true,
  showTooltip = true,
  onClick,
  className,
}: LeveledBadgeProps) {
  const isLocked = badge.current_level === 0;
  const isMaxLevel = badge.is_max_level;
  const tier = getTierFromLevel(badge);
  const tierColor = TIER_COLORS[tier];
  const glowClass = TIER_GLOW_COLORS[tier];
  const IconComponent = ICON_MAP[badge.badge.icon] || Sparkles;

  // Calculate progress ring
  const progressPercentage = badge.progress_percentage;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  const badgeContent = (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full transition-all duration-300',
        sizeClasses[size],
        isLocked
          ? 'bg-muted/50 border-2 border-muted-foreground/30'
          : `border-2 shadow-lg ${glowClass}`,
        !isLocked && 'hover:scale-105 cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      style={{
        borderColor: isLocked ? undefined : tierColor,
        background: isLocked
          ? undefined
          : `radial-gradient(circle at 30% 30%, ${tierColor}40, ${tierColor}10)`,
      }}
      onClick={onClick}
    >
      {/* Progress Ring (SVG) */}
      {showProgress && !isLocked && !isMaxLevel && (
        <svg
          className="absolute inset-0 -rotate-90"
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-muted/30"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={tierColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500"
          />
        </svg>
      )}

      {/* Max Level Ring Effect */}
      {isMaxLevel && (
        <div
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            boxShadow: `0 0 20px ${tierColor}80, 0 0 40px ${tierColor}40`,
          }}
        />
      )}

      {/* Icon */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {isLocked ? (
          <Lock className={cn(iconSizeClasses[size], 'text-muted-foreground/50')} />
        ) : (
          <span style={{ color: tierColor }}>
            <IconComponent className={cn(iconSizeClasses[size])} />
          </span>
        )}

        {/* Level indicator */}
        {showLevel && !isLocked && (
          <div
            className={cn(
              'absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full font-bold',
              levelTextSizes[size]
            )}
            style={{
              backgroundColor: tierColor,
              color: tier === 'platinum' || tier === 'diamond' ? '#1a1a1a' : '#fff',
            }}
          >
            {isMaxLevel ? (
              <Crown className="h-3 w-3" />
            ) : (
              `Lv.${badge.current_level}`
            )}
          </div>
        )}
      </div>

      {/* Max Level Crown Overlay */}
      {isMaxLevel && (
        <div
          className="absolute -top-2 -right-1 z-20"
          style={{ color: tierColor }}
        >
          <Crown className="h-4 w-4 fill-current" />
        </div>
      )}
    </div>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-bold" style={{ color: isLocked ? undefined : tierColor }}>
              {badge.badge.name}
              {!isLocked && ` - Nível ${badge.current_level}`}
            </p>
            <p className="text-sm text-muted-foreground">{badge.badge.description}</p>
            {!isLocked && badge.current_level_info && (
              <p className="text-xs font-medium" style={{ color: tierColor }}>
                "{badge.current_level_info.name}"
              </p>
            )}
            {!isLocked && !isMaxLevel && badge.next_level && (
              <p className="text-xs text-muted-foreground">
                Próximo: {badge.next_level.requirement} ({progressPercentage.toFixed(0)}%)
              </p>
            )}
            {!isLocked && (
              <p className="text-xs font-bold" style={{ color: tierColor }}>
                +{badge.total_points_earned} pontos
              </p>
            )}
            {isMaxLevel && (
              <p className="text-xs font-bold text-yellow-500">
                Nível Máximo Alcançado!
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Badge list component
interface LeveledBadgeListProps {
  badges: UserBadge[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  onBadgeClick?: (badge: UserBadge) => void;
}

export function LeveledBadgeList({
  badges,
  maxDisplay = 6,
  size = 'md',
  showProgress = false,
  onBadgeClick,
}: LeveledBadgeListProps) {
  const displayBadges = badges.slice(0, maxDisplay);
  const remainingCount = badges.length - maxDisplay;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {displayBadges.map((badge) => (
        <LeveledBadge
          key={badge.badge.id}
          badge={badge}
          size={size}
          showProgress={showProgress}
          onClick={onBadgeClick ? () => onBadgeClick(badge) : undefined}
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-muted text-muted-foreground font-bold',
            sizeClasses[size]
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
