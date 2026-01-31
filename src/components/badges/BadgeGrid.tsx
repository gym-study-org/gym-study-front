'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  UserBadge,
  BadgeCategory,
  CATEGORY_LABELS,
} from '@/lib/api/badges.api';
import { LeveledBadge } from './LeveledBadge';
import { BadgeProgressCard } from './BadgeProgressCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BadgeGridProps {
  badges: UserBadge[];
  columns?: 3 | 4 | 5 | 6;
  showProgress?: boolean;
  showLocked?: boolean;
  filterCategory?: BadgeCategory | 'all';
  onFilterChange?: (category: BadgeCategory | 'all') => void;
  className?: string;
}

const columnClasses = {
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
};

export function BadgeGrid({
  badges,
  columns = 4,
  showProgress = true,
  showLocked = true,
  filterCategory = 'all',
  onFilterChange,
  className,
}: BadgeGridProps) {
  const [selectedBadge, setSelectedBadge] = useState<UserBadge | null>(null);

  // Filter badges
  const filteredBadges = badges.filter((badge) => {
    if (filterCategory !== 'all' && badge.badge.category !== filterCategory) {
      return false;
    }
    if (!showLocked && badge.current_level === 0) {
      return false;
    }
    return true;
  });

  // Sort: unlocked first (by level desc), then locked
  const sortedBadges = [...filteredBadges].sort((a, b) => {
    if (a.current_level > 0 && b.current_level === 0) return -1;
    if (a.current_level === 0 && b.current_level > 0) return 1;
    if (a.current_level > 0 && b.current_level > 0) {
      return b.current_level - a.current_level;
    }
    return 0;
  });

  // Get unique categories for tabs
  const categories = Array.from(new Set(badges.map((b) => b.badge.category)));

  return (
    <div className={className}>
      {/* Category Filter */}
      {onFilterChange && (
        <Tabs
          value={filterCategory}
          onValueChange={(v) => onFilterChange(v as BadgeCategory | 'all')}
          className="mb-4"
        >
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="all" className="text-xs">
              Todos ({badges.length})
            </TabsTrigger>
            {categories.map((cat) => {
              const count = badges.filter((b) => b.badge.category === cat).length;
              const unlocked = badges.filter(
                (b) => b.badge.category === cat && b.current_level > 0
              ).length;
              return (
                <TabsTrigger key={cat} value={cat} className="text-xs">
                  {CATEGORY_LABELS[cat]} ({unlocked}/{count})
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      )}

      {/* Badge Grid */}
      <div
        className={cn(
          'grid gap-4',
          columnClasses[columns],
          'sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6'
        )}
      >
        {sortedBadges.map((badge) => (
          <div
            key={badge.badge.id}
            className="flex flex-col items-center gap-2"
          >
            <LeveledBadge
              badge={badge}
              size="lg"
              showProgress={showProgress}
              onClick={() => setSelectedBadge(badge)}
            />
            <span
              className={cn(
                'text-xs font-medium text-center truncate max-w-full',
                badge.current_level === 0 && 'text-muted-foreground'
              )}
            >
              {badge.badge.name}
            </span>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {sortedBadges.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum badge encontrado
        </div>
      )}

      {/* Badge Detail Modal */}
      <Dialog open={!!selectedBadge} onOpenChange={() => setSelectedBadge(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Badge</DialogTitle>
          </DialogHeader>
          {selectedBadge && (
            <BadgeProgressCard badge={selectedBadge} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Simplified grid for profile/preview
interface BadgeShowcaseProps {
  badges: UserBadge[];
  maxDisplay?: number;
  onViewAll?: () => void;
}

export function BadgeShowcase({
  badges,
  maxDisplay = 6,
  onViewAll,
}: BadgeShowcaseProps) {
  // Only show unlocked badges, sorted by level
  const unlockedBadges = badges
    .filter((b) => b.current_level > 0)
    .sort((a, b) => b.current_level - a.current_level)
    .slice(0, maxDisplay);

  const totalUnlocked = badges.filter((b) => b.current_level > 0).length;
  const remaining = totalUnlocked - maxDisplay;

  if (unlockedBadges.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        Nenhum badge desbloqueado ainda
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 items-center justify-center">
      {unlockedBadges.map((badge) => (
        <LeveledBadge
          key={badge.badge.id}
          badge={badge}
          size="md"
          showProgress={false}
        />
      ))}
      {remaining > 0 && onViewAll && (
        <button
          onClick={onViewAll}
          className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground hover:bg-muted/80 transition-colors"
        >
          +{remaining}
        </button>
      )}
    </div>
  );
}
