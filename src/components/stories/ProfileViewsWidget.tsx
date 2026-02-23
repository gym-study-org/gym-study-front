'use client';

import { useEffect, useState } from 'react';
import { storiesApi } from '@/lib/api/stories.api';
import { ProfileViewStats } from '@/types/stories.types';
import { Card, CardContent } from '@/components/ui/card';
import { Eye } from 'lucide-react';

interface ProfileViewsWidgetProps {
  compact?: boolean;
}

export function ProfileViewsWidget({ compact = false }: ProfileViewsWidgetProps) {
  const [stats, setStats] = useState<ProfileViewStats | null>(null);

  useEffect(() => {
    storiesApi.getProfileViews().then(setStats).catch(() => {});
  }, []);

  if (!stats) return null;

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Visualizações</span>
        </div>
        <div className="flex gap-4">
          <div>
            <p className="text-xl font-bold">{stats.total_views_7d}</p>
            <p className="text-[10px] text-muted-foreground">7 dias</p>
          </div>
          <div>
            <p className="text-xl font-bold">{stats.total_views_30d}</p>
            <p className="text-[10px] text-muted-foreground">30 dias</p>
          </div>
        </div>
        {stats.recent_viewers.length > 0 && (
          <div className="flex -space-x-1.5">
            {stats.recent_viewers.slice(0, 6).map(viewer => (
              <div
                key={viewer.user_id}
                className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold border-2 border-card"
                title={viewer.username}
              >
                {viewer.username.charAt(0).toUpperCase()}
              </div>
            ))}
            {stats.recent_viewers.length > 6 && (
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[9px] border-2 border-card">
                +{stats.recent_viewers.length - 6}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Visualizações do Perfil</h3>
        </div>
        <div className="flex gap-4 mb-3">
          <div>
            <p className="text-2xl font-bold">{stats.total_views_7d}</p>
            <p className="text-xs text-muted-foreground">últimos 7 dias</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.total_views_30d}</p>
            <p className="text-xs text-muted-foreground">últimos 30 dias</p>
          </div>
        </div>
        {stats.recent_viewers.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Visitantes recentes</p>
            <div className="flex -space-x-2">
              {stats.recent_viewers.slice(0, 8).map(viewer => (
                <div
                  key={viewer.user_id}
                  className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold border-2 border-background"
                  title={viewer.username}
                >
                  {viewer.username.charAt(0).toUpperCase()}
                </div>
              ))}
              {stats.recent_viewers.length > 8 && (
                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] border-2 border-background">
                  +{stats.recent_viewers.length - 8}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
