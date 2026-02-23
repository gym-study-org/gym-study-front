'use client';

import { useEffect, useState } from 'react';
import { leaguesApi } from '@/lib/api/leagues.api';
import { CurrentLeagueResponse, League, LeagueHistoryEntry } from '@/types/leagues.types';
import { useStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Gem, Crown, ChevronUp, ChevronDown, Minus, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const LEAGUE_ICONS: Record<string, React.ElementType> = {
  shield: Shield,
  gem: Gem,
  crown: Crown,
};

export default function LeaguesPage() {
  const { user } = useStore();
  const [current, setCurrent] = useState<CurrentLeagueResponse | null>(null);
  const [allLeagues, setAllLeagues] = useState<League[]>([]);
  const [history, setHistory] = useState<LeagueHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ranking');

  useEffect(() => {
    Promise.all([
      leaguesApi.getCurrent(),
      leaguesApi.getInfo(),
      leaguesApi.getHistory(10),
    ])
      .then(([currentData, leaguesData, historyData]) => {
        setCurrent(currentData);
        setAllLeagues(leaguesData);
        setHistory(historyData.history);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!current) return null;

  const Icon = LEAGUE_ICONS[current.league.icon] || Shield;

  return (
    <div className="">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Ligas</h1>
          <p className="text-muted-foreground">Compete com outros estudantes semanalmente</p>
        </div>

        {/* Current League Header */}
        <Card className="mb-8">
          <CardContent className="flex items-center gap-4 pt-6">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: current.league.color + '20' }}
            >
              <Icon className="h-8 w-8" style={{ color: current.league.color }} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Liga {current.league.name_pt}</h2>
              <p className="text-muted-foreground">
                Semana {current.season_week} &middot; {current.total_members} competidores
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{current.my_weekly_xp} XP</p>
              {current.my_position && (
                <p className="text-sm text-muted-foreground">
                  Posição #{current.my_position}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="ranking">Ranking da Semana</TabsTrigger>
            <TabsTrigger value="leagues">Todas as Ligas</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          {/* Ranking Tab */}
          <TabsContent value="ranking">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Ranking — Liga {current.league.name_pt}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {current.members.map((member) => {
                  const isMe = member.user_id === user?.id;
                  const inPromotionZone = member.position <= current.promotion_zone && current.promotion_zone > 0;
                  const inDemotionZone =
                    member.position > current.total_members - current.demotion_zone &&
                    current.demotion_zone > 0;

                  return (
                    <div
                      key={member.user_id}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                        isMe && 'bg-primary/10 border border-primary/20',
                        inPromotionZone && !isMe && 'bg-green-500/5',
                        inDemotionZone && !isMe && 'bg-red-500/5'
                      )}
                    >
                      {/* Position */}
                      <div className="flex w-8 items-center justify-center">
                        {member.position <= 3 ? (
                          <span className={cn(
                            'text-lg font-bold',
                            member.position === 1 && 'text-yellow-500',
                            member.position === 2 && 'text-gray-400',
                            member.position === 3 && 'text-amber-700'
                          )}>
                            {member.position}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">{member.position}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {member.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* Name + Level */}
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-medium truncate', isMe && 'font-bold')}>
                          {member.username} {isMe && '(você)'}
                        </p>
                        <p className="text-xs text-muted-foreground">Nível {member.level}</p>
                      </div>

                      {/* Zone indicators */}
                      {inPromotionZone && (
                        <ChevronUp className="h-4 w-4 text-green-500" />
                      )}
                      {inDemotionZone && (
                        <ChevronDown className="h-4 w-4 text-red-500" />
                      )}

                      {/* XP */}
                      <div className="text-right">
                        <span className="font-semibold">{member.weekly_xp}</span>
                        <span className="text-xs text-muted-foreground ml-1">XP</span>
                      </div>
                    </div>
                  );
                })}

                {/* Legend */}
                <div className="flex gap-4 pt-4 border-t text-xs text-muted-foreground">
                  {current.promotion_zone > 0 && (
                    <div className="flex items-center gap-1">
                      <ChevronUp className="h-3 w-3 text-green-500" />
                      Zona de promoção (top {current.promotion_zone})
                    </div>
                  )}
                  {current.demotion_zone > 0 && (
                    <div className="flex items-center gap-1">
                      <ChevronDown className="h-3 w-3 text-red-500" />
                      Zona de rebaixamento (últimos {current.demotion_zone})
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Leagues Tab */}
          <TabsContent value="leagues">
            <Card>
              <CardHeader>
                <CardTitle>Todas as Ligas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {allLeagues.map((league) => {
                    const LeagueIcon = LEAGUE_ICONS[league.icon] || Shield;
                    const isCurrent = league.tier === current.league.tier;

                    return (
                      <div
                        key={league.id}
                        className={cn(
                          'flex items-center gap-3 rounded-lg border p-3 transition-colors',
                          isCurrent && 'border-primary bg-primary/5'
                        )}
                      >
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-full"
                          style={{ backgroundColor: league.color + '20' }}
                        >
                          <LeagueIcon className="h-5 w-5" style={{ color: league.color }} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{league.name_pt}</p>
                          <p className="text-xs text-muted-foreground">Tier {league.tier}</p>
                        </div>
                        {isCurrent && (
                          <Badge variant="default">Atual</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Temporadas</CardTitle>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum histórico ainda. Complete sua primeira semana!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {history.map((entry) => (
                      <div
                        key={entry.season_week}
                        className="flex items-center gap-3 rounded-lg border p-3"
                      >
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full"
                          style={{ backgroundColor: entry.league_color + '20' }}
                        >
                          <span className="text-xs font-bold" style={{ color: entry.league_color }}>
                            {entry.league_tier}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{entry.league_name_pt}</p>
                          <p className="text-xs text-muted-foreground">{entry.season_week}</p>
                        </div>
                        <div className="text-right text-sm">
                          <p>#{entry.final_position} — {entry.final_xp} XP</p>
                          {entry.promoted && (
                            <Badge variant="default" className="bg-green-500 text-xs">
                              <ChevronUp className="h-3 w-3 mr-0.5" /> Promovido
                            </Badge>
                          )}
                          {entry.demoted && (
                            <Badge variant="destructive" className="text-xs">
                              <ChevronDown className="h-3 w-3 mr-0.5" /> Rebaixado
                            </Badge>
                          )}
                          {!entry.promoted && !entry.demoted && (
                            <Badge variant="secondary" className="text-xs">
                              <Minus className="h-3 w-3 mr-0.5" /> Manteve
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
