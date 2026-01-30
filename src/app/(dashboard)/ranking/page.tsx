'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import { rankingApi, RankingEntry, UserPosition } from '@/lib/api/ranking.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Trophy, Medal, Users, TrendingUp, Calendar, CalendarDays } from 'lucide-react';

export default function RankingPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useStore();
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [activeTab, setActiveTab] = useState<'global' | 'friends' | 'monthly' | 'weekly'>('global');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadRanking();
    loadUserPosition();
  }, [isAuthenticated, router, activeTab]);

  const loadRanking = async () => {
    setIsLoading(true);
    try {
      let data: RankingEntry[];
      switch (activeTab) {
        case 'friends':
          data = await rankingApi.getFriendsRanking();
          break;
        case 'monthly':
          data = await rankingApi.getMonthlyRanking();
          break;
        case 'weekly':
          data = await rankingApi.getWeeklyRanking();
          break;
        default:
          data = await rankingApi.getGlobalRanking();
      }
      setRanking(data);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao carregar ranking');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserPosition = async () => {
    try {
      const data = await rankingApi.getUserPosition();
      setUserPosition(data);
    } catch (error) {
      console.error('Failed to load user position:', error);
    }
  };

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (position === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (position === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{position}</span>;
  };

  if (!isAuthenticated || !user) return null;

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Ranking</h1>
            <p className="text-muted-foreground">Veja quem está estudando mais!</p>
          </div>
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            Voltar ao Dashboard
          </Button>
        </div>

        {/* User Position Cards */}
        {userPosition && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Posição Global</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">#{userPosition.global_position}</div>
                <p className="text-xs text-muted-foreground">
                  de {userPosition.total_users} usuários
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Entre Amigos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">#{userPosition.friends_position}</div>
                <p className="text-xs text-muted-foreground">
                  de {userPosition.total_friends} amigos
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b pb-2">
          <Button
            variant={activeTab === 'global' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('global')}
          >
            <Trophy className="mr-2 h-4 w-4" />
            Global
          </Button>
          <Button
            variant={activeTab === 'friends' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('friends')}
          >
            <Users className="mr-2 h-4 w-4" />
            Amigos
          </Button>
          <Button
            variant={activeTab === 'monthly' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('monthly')}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Mensal
          </Button>
          <Button
            variant={activeTab === 'weekly' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('weekly')}
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            Semanal
          </Button>
        </div>

        {/* Ranking List */}
        <div className="space-y-2">
          {isLoading ? (
            <Card>
              <CardContent className="flex min-h-[200px] items-center justify-center">
                <p className="text-muted-foreground">Carregando ranking...</p>
              </CardContent>
            </Card>
          ) : ranking.length === 0 ? (
            <Card>
              <CardContent className="flex min-h-[200px] flex-col items-center justify-center">
                <Trophy className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum dado de ranking ainda.</p>
              </CardContent>
            </Card>
          ) : (
            ranking.map((entry) => (
              <Card
                key={entry.user_id}
                className={`transition-colors ${
                  entry.is_current_user
                    ? 'border-primary bg-primary/5'
                    : entry.is_friend
                    ? 'border-blue-200 bg-blue-50/50'
                    : ''
                }`}
              >
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex w-12 items-center justify-center">
                      {getPositionIcon(entry.position)}
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-lg font-bold">
                      {entry.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {entry.username}
                        {entry.is_current_user && (
                          <span className="ml-2 text-xs text-primary">(Você)</span>
                        )}
                        {entry.is_friend && !entry.is_current_user && (
                          <span className="ml-2 text-xs text-blue-600">(Amigo)</span>
                        )}
                      </p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{entry.total_sessions} sessões</span>
                        <span>{entry.total_certifications} certs</span>
                        {entry.current_streak > 0 && (
                          <span className="text-orange-500">🔥 {entry.current_streak} dias</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {Number(entry.total_study_hours).toFixed(1)}h
                    </p>
                    <p className="text-xs text-muted-foreground">estudadas</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
