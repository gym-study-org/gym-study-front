'use client';

import { cn } from '@/lib/utils';
import {
  UserBadge,
  TIER_COLORS,
  TIER_BG_COLORS,
  getTierFromLevel,
  formatRequirement,
} from '@/lib/api/badges.api';
import { LeveledBadge } from './LeveledBadge';
import { Progress } from '@/components/ui/progress';
import { Check, Lock, ChevronRight } from 'lucide-react';

interface BadgeProgressCardProps {
  badge: UserBadge;
  compact?: boolean;
  onClick?: () => void;
  className?: string;
}

export function BadgeProgressCard({
  badge,
  compact = false,
  onClick,
  className,
}: BadgeProgressCardProps) {
  const isLocked = badge.current_level === 0;
  const tier = getTierFromLevel(badge);
  const tierColor = TIER_COLORS[tier];
  const bgClass = TIER_BG_COLORS[tier];

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border transition-all',
          isLocked ? 'bg-muted/30 border-muted' : bgClass,
          onClick && 'cursor-pointer hover:scale-[1.02]',
          className
        )}
        onClick={onClick}
      >
        <LeveledBadge badge={badge} size="sm" showProgress={false} showTooltip={false} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4
              className={cn(
                'font-semibold truncate',
                isLocked ? 'text-muted-foreground' : ''
              )}
              style={{ color: isLocked ? undefined : tierColor }}
            >
              {badge.badge.name}
            </h4>
            {!isLocked && (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${tierColor}30`, color: tierColor }}>
                Lv.{badge.current_level}
              </span>
            )}
          </div>

          {!isLocked && !badge.is_max_level && badge.next_level && (
            <div className="mt-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>
                  {badge.current_value.toFixed(0)} / {badge.next_level.requirement}
                </span>
                <span>{badge.progress_percentage.toFixed(0)}%</span>
              </div>
              <Progress
                value={badge.progress_percentage}
                className="h-1.5"
                style={{ '--progress-color': tierColor } as React.CSSProperties}
              />
            </div>
          )}

          {badge.is_max_level && (
            <p className="text-xs text-yellow-500 font-medium mt-1">
              Nível Máximo!
            </p>
          )}

          {isLocked && badge.next_level && (
            <p className="text-xs text-muted-foreground mt-1">
              Precisa: {formatRequirement(badge.next_level.requirement, badge.badge.category)}
            </p>
          )}
        </div>

        {onClick && (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    );
  }

  // Full card mode
  return (
    <div
      className={cn(
        'rounded-xl border-2 p-4 transition-all',
        isLocked ? 'bg-muted/20 border-muted' : bgClass,
        onClick && 'cursor-pointer hover:scale-[1.02]',
        className
      )}
      style={{ borderColor: isLocked ? undefined : tierColor }}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <LeveledBadge badge={badge} size="lg" showProgress showTooltip={false} />

        <div className="flex-1">
          <h3
            className={cn('text-lg font-bold', isLocked && 'text-muted-foreground')}
            style={{ color: isLocked ? undefined : tierColor }}
          >
            {badge.badge.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {badge.badge.description}
          </p>

          {!isLocked && badge.current_level_info && (
            <p className="text-sm font-medium mt-2" style={{ color: tierColor }}>
              "{badge.current_level_info.name}"
            </p>
          )}
        </div>
      </div>

      {/* Progress Section */}
      {!isLocked && !badge.is_max_level && badge.next_level && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              Progresso para Nível {badge.current_level + 1}
            </span>
            <span className="font-bold" style={{ color: tierColor }}>
              {badge.progress_percentage.toFixed(0)}%
            </span>
          </div>
          <Progress
            value={badge.progress_percentage}
            className="h-2"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
            <span>{badge.current_value.toFixed(1)}</span>
            <span>{formatRequirement(badge.next_level.requirement, badge.badge.category)}</span>
          </div>
        </div>
      )}

      {/* Level Milestones */}
      <div className="mt-4">
        <div className="flex flex-wrap gap-1">
          {badge.badge.levels.map((level) => {
            const isAchieved = badge.current_level >= level.level;
            const isCurrent = badge.current_level === level.level;
            const levelTierColor = TIER_COLORS[level.tier];

            return (
              <div
                key={level.level}
                className={cn(
                  'flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all',
                  isAchieved
                    ? 'text-white'
                    : 'bg-muted text-muted-foreground',
                  isCurrent && 'ring-2 ring-offset-2 ring-offset-background'
                )}
                style={{
                  backgroundColor: isAchieved ? levelTierColor : undefined,
                  '--tw-ring-color': isCurrent ? levelTierColor : undefined,
                } as React.CSSProperties}
                title={`${level.name} - ${formatRequirement(level.requirement, badge.badge.category)}`}
              >
                {isAchieved ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  level.level
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Points */}
      {!isLocked && (
        <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Pontos ganhos</span>
          <span className="font-bold" style={{ color: tierColor }}>
            +{badge.total_points_earned}
          </span>
        </div>
      )}

      {/* Locked State */}
      {isLocked && (
        <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-center gap-2 text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span className="text-sm">
            {formatRequirement(badge.badge.levels[0].requirement, badge.badge.category)} para desbloquear
          </span>
        </div>
      )}
    </div>
  );
}
