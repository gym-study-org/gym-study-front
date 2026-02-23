'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  badgesApi,
  UserBadge,
  BadgeCategoryStats,
  BadgeCategory,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  TIER_COLORS,
} from '@/lib/api/badges.api';
import {
  BadgeProgressCard,
  triggerTestLevelUp,
} from '@/components/badges';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Sparkles,
  Trophy,
  TrendingUp,
  Loader2,
  GraduationCap,
  Flame,
  Users,
  Award,
  Target,
  Swords,
} from 'lucide-react';

const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap,
  Flame,
  Users,
  Award,
  Target,
  Swords,
  Sparkles,
};

export default function BadgesPage() {
  const router = useRouter();
  const { isAuthenticated } = useStore();
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [categoryStats, setCategoryStats] = useState<BadgeCategoryStats[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [totalLevels, setTotalLevels] = useState(0);
  const [maxLevels, setMaxLevels] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadBadges();
  }, [isAuthenticated, router]);

  const loadBadges = async () => {
    setIsLoading(true);
    try {
      const [badgesData, statsData] = await Promise.all([
        badgesApi.getMine(),
        badgesApi.getCategoryStats(),
      ]);
      setBadges(badgesData.badges);
      setTotalPoints(badgesData.total_points);
      setTotalLevels(badgesData.total_levels_unlocked);
      setMaxLevels(badgesData.max_possible_levels);
      setCategoryStats(statsData);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao carregar badges');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter badges by category
  const filteredBadges =
    selectedCategory === 'all'
      ? badges
      : badges.filter((b) => b.badge.category === selectedCategory);

  // Separate unlocked and locked badges
  const unlockedBadges = filteredBadges
    .filter((b) => b.current_level > 0)
    .sort((a, b) => b.current_level - a.current_level);
  const lockedBadges = filteredBadges.filter((b) => b.current_level === 0);

  const progressPercentage = maxLevels > 0 ? (totalLevels / maxLevels) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Badges</h1>
            <p className="text-muted-foreground">
              Suba de nível e colecione todos os badges!
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {/* Total Points */}
          <Card className="border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-yellow-500/20 p-3">
                <Sparkles className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pontos Totais</p>
                <p className="text-3xl font-bold text-yellow-500">
                  {totalPoints.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Total Levels */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-primary/20 p-3">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Níveis Desbloqueados</p>
                <p className="text-3xl font-bold text-primary">
                  {totalLevels} <span className="text-lg text-muted-foreground">/ {maxLevels}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Progress */}
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-green-500/20 p-3">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Progresso Geral</p>
                <p className="text-3xl font-bold text-green-500">
                  {progressPercentage.toFixed(0)}%
                </p>
                <Progress value={progressPercentage} className="mt-2 h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Stats */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Progresso por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categoryStats.map((stat) => {
                const IconComponent = CATEGORY_ICON_MAP[stat.icon] || Sparkles;
                const progress = stat.total_levels > 0
                  ? (stat.unlocked_levels / stat.total_levels) * 100
                  : 0;

                return (
                  <button
                    key={stat.category}
                    className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-all hover:bg-muted/50 ${
                      selectedCategory === stat.category ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() =>
                      setSelectedCategory(
                        selectedCategory === stat.category ? 'all' : stat.category
                      )
                    }
                  >
                    <div className="rounded-full bg-muted p-2">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{stat.label}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>
                          {stat.unlocked_levels}/{stat.total_levels} níveis
                        </span>
                        <span>•</span>
                        <span>{stat.points_earned} pts</span>
                      </div>
                      <Progress value={progress} className="mt-2 h-1.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Category Filter Tabs */}
        <Tabs
          value={selectedCategory}
          onValueChange={(v) => setSelectedCategory(v as BadgeCategory | 'all')}
          className="mb-6"
        >
          <TabsList className="flex-wrap h-auto gap-1 bg-transparent">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Todos ({badges.length})
            </TabsTrigger>
            {categoryStats.map((stat) => (
              <TabsTrigger
                key={stat.category}
                value={stat.category}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {stat.label} ({stat.badges.length})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Unlocked Badges */}
        {unlockedBadges.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Desbloqueados ({unlockedBadges.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {unlockedBadges.map((badge) => (
                <BadgeProgressCard key={badge.badge.id} badge={badge} />
              ))}
            </div>
          </div>
        )}

        {/* Locked Badges */}
        {lockedBadges.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-muted-foreground">
              Bloqueados ({lockedBadges.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lockedBadges.map((badge) => (
                <BadgeProgressCard key={badge.badge.id} badge={badge} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredBadges.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum badge encontrado nesta categoria</p>
          </div>
        )}

        {/* Test Button (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4">
            <Button onClick={triggerTestLevelUp} size="sm" variant="outline">
              Test Level Up
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
