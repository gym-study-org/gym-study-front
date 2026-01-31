'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import {
  achievementsApi,
  AchievementWithUnlockStatus,
  AchievementCategoryStats,
  AchievementCategory,
  CATEGORY_LABELS,
} from '@/lib/api/achievements.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AchievementCard } from '@/components/achievements';
import { toast } from 'sonner';
import {
  Trophy,
  Clock,
  Flame,
  Users,
  Award,
  Target,
  Play,
  Star,
  Sparkles,
} from 'lucide-react';

const CATEGORY_ICONS: Record<AchievementCategory, React.ComponentType<{ className?: string }>> = {
  study_hours: Clock,
  streak: Flame,
  social: Users,
  certifications: Award,
  goals: Target,
  sessions: Play,
  special: Star,
};

export default function AchievementsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useStore();
  const [achievements, setAchievements] = useState<AchievementWithUnlockStatus[]>([]);
  const [categoryStats, setCategoryStats] = useState<AchievementCategoryStats[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadAchievements();
  }, [isAuthenticated, router]);

  const loadAchievements = async () => {
    setIsLoading(true);
    try {
      const [achievementsData, statsData] = await Promise.all([
        achievementsApi.getMine(),
        achievementsApi.getCategoryStats(),
      ]);

      setAchievements(achievementsData.achievements);
      setTotalPoints(achievementsData.total_points);
      setUnlockedCount(achievementsData.unlocked_count);
      setTotalCount(achievementsData.total_count);
      setCategoryStats(statsData);
    } catch (error) {
      console.error('Failed to load achievements:', error);
      toast.error('Erro ao carregar conquistas');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAchievements =
    activeCategory === 'all'
      ? achievements
      : achievements.filter((a) => a.category === activeCategory);

  const unlockedAchievements = filteredAchievements.filter((a) => a.unlocked);
  const lockedAchievements = filteredAchievements.filter((a) => !a.unlocked);

  if (!isAuthenticated || !user) return null;

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Trophy className="h-10 w-10 text-yellow-500" />
              Conquistas
            </h1>
            <p className="text-muted-foreground">
              Acompanhe seu progresso e desbloqueie recompensas
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            Voltar ao Dashboard
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pontos</CardTitle>
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">{totalPoints.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">pontos acumulados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conquistas Desbloqueadas</CardTitle>
              <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {unlockedCount} <span className="text-lg text-muted-foreground">/ {totalCount}</span>
              </div>
              <Progress
                value={(unlockedCount / totalCount) * 100}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progresso Geral</CardTitle>
              <Target className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">das conquistas desbloqueadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Progresso por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categoryStats.map((stat) => {
                const IconComponent = CATEGORY_ICONS[stat.category];
                const percentage =
                  stat.total > 0 ? Math.round((stat.unlocked / stat.total) * 100) : 0;

                return (
                  <div
                    key={stat.category}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      activeCategory === stat.category
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() =>
                      setActiveCategory(
                        activeCategory === stat.category ? 'all' : stat.category
                      )
                    }
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <IconComponent className="h-5 w-5 text-primary" />
                      <span className="font-medium">{stat.label}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">
                        {stat.unlocked} / {stat.total}
                      </span>
                      <span className="font-medium">{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {stat.points_earned.toLocaleString()} / {stat.max_points.toLocaleString()} pts
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 border-b pb-4">
          <Button
            variant={activeCategory === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveCategory('all')}
          >
            Todas ({achievements.length})
          </Button>
          {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
            const count = achievements.filter((a) => a.category === category).length;
            if (count === 0) return null;
            const IconComponent = CATEGORY_ICONS[category as AchievementCategory];

            return (
              <Button
                key={category}
                variant={activeCategory === category ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveCategory(category as AchievementCategory)}
              >
                <IconComponent className="mr-1 h-4 w-4" />
                {label} ({count})
              </Button>
            );
          })}
        </div>

        {/* Achievements Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Unlocked Achievements */}
            {unlockedAchievements.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Desbloqueadas ({unlockedAchievements.length})
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {unlockedAchievements.map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                  ))}
                </div>
              </div>
            )}

            {/* Locked Achievements */}
            {lockedAchievements.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
                  Bloqueadas ({lockedAchievements.length})
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {lockedAchievements.map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                  ))}
                </div>
              </div>
            )}

            {filteredAchievements.length === 0 && (
              <Card>
                <CardContent className="flex min-h-[200px] flex-col items-center justify-center">
                  <Trophy className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhuma conquista nesta categoria.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
