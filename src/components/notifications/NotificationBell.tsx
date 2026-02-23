'use client';

import { useEffect, useState } from 'react';
import { Bell, Heart, MessageCircle, UserPlus, UserCheck, Trophy, Award, Swords, Star, AlertTriangle, Mail } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useStore } from '@/store';
import { notificationsApi } from '@/lib/api/notifications.api';
import { NotificationType, NotificationWithActor } from '@/types/notification.types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const NOTIFICATION_ICONS: Record<NotificationType, React.ElementType> = {
  friendship_request: UserPlus,
  friendship_accepted: UserCheck,
  post_liked: Heart,
  post_commented: MessageCircle,
  badge_level_up: Award,
  achievement_unlocked: Trophy,
  challenge_invite: Swords,
  challenge_completed: Swords,
  endorsement_received: Star,
  streak_warning: AlertTriangle,
  weekly_summary: Mail,
};

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  friendship_request: 'text-blue-500',
  friendship_accepted: 'text-green-500',
  post_liked: 'text-red-500',
  post_commented: 'text-cyan-500',
  badge_level_up: 'text-amber-500',
  achievement_unlocked: 'text-yellow-500',
  challenge_invite: 'text-orange-500',
  challenge_completed: 'text-green-500',
  endorsement_received: 'text-purple-500',
  streak_warning: 'text-red-600',
  weekly_summary: 'text-blue-400',
};

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    setNotifications,
    setUnreadCount,
    markAsRead,
    markAllAsRead,
  } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadNotifications = async () => {
    if (hasLoaded) return;
    setIsLoading(true);
    try {
      const response = await notificationsApi.getNotifications({ limit: 15 });
      setNotifications(response.notifications);
      setHasLoaded(true);
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notification: NotificationWithActor) => {
    if (notification.is_read) return;
    markAsRead(notification.id);
    notificationsApi.markAsRead(notification.id).catch(() => {});
  };

  const handleMarkAllAsRead = async () => {
    markAllAsRead();
    notificationsApi.markAllAsRead().then(() => {
      setUnreadCount(0);
    }).catch(() => {});
  };

  return (
    <DropdownMenu onOpenChange={(open) => { if (open) loadNotifications(); }}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notificações</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs"
              onClick={handleMarkAllAsRead}
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="max-h-80">
          {isLoading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Carregando...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma notificação
            </div>
          ) : (
            notifications.slice(0, 15).map((notification) => {
              const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
              const iconColor = NOTIFICATION_COLORS[notification.type] || 'text-muted-foreground';

              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    'flex items-start gap-3 p-3 cursor-pointer',
                    !notification.is_read && 'bg-accent/50'
                  )}
                  onClick={() => handleMarkAsRead(notification)}
                >
                  {notification.actor_avatar_url ? (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={notification.actor_avatar_url} />
                      <AvatarFallback>
                        {notification.actor_username?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className={cn('mt-0.5 shrink-0', iconColor)}>
                      <Icon className="h-5 w-5" />
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-tight">
                      {notification.title}
                    </p>
                    {notification.body && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.body}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                  )}
                </DropdownMenuItem>
              );
            })
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
