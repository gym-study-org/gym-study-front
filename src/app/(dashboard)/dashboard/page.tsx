'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/store';
import {
  BookOpen,
  Flame,
  Star,
  Trophy,
  ChevronRight,
  Users,
  Medal,
  Target,
  Edit,
  TrendingUp,
  Swords,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAvatar, ProfileEditModal } from '@/components/profile';
import { XPGainListener } from '@/components/xp/XPGainToast';
import { PostComposer } from '@/components/feed/PostComposer';
import { xpApi } from '@/lib/api/xp.api';
import { streakApi } from '@/lib/api/streak.api';
import { XPSummary } from '@/types/xp.types';
import { StreakStatus } from '@/types/streak.types';
import { PostWithAuthor } from '@/types/feed.types';
import { cn } from '@/lib/utils';

const QUICK_LINKS = [
  {
    href: '/study',
    label: 'Estudar',
    icon: BookOpen,
    bg: 'bg-duo-green-tint',
    iconColor: 'text-[#58CC02]',
    borderColor: 'border-[#58CC02]/30',
  },
  {
    href: '/feed',
    label: 'Feed',
    icon: Users,
    bg: 'bg-duo-blue-tint',
    iconColor: 'text-[#1CB0F6]',
    borderColor: 'border-[#1CB0F6]/30',
  },
  {
    href: '/ranking',
    label: 'Ranking',
    icon: Trophy,
    bg: 'bg-duo-gold-tint',
    iconColor: 'text-[#FFC800]',
    borderColor: 'border-[#FFC800]/30',
  },
  {
    href: '/badges',
    label: 'Badges',
    icon: Medal,
    bg: 'bg-duo-purple-tint',
    iconColor: 'text-[#CE82FF]',
    borderColor: 'border-[#CE82FF]/30',
  },
  {
    href: '/goals',
    label: 'Metas',
    icon: Target,
    bg: 'bg-duo-red-tint',
    iconColor: 'text-[#FF4B4B]',
    borderColor: 'border-[#FF4B4B]/30',
  },
  {
    href: '/leagues',
    label: 'Ligas',
    icon: Swords,
    bg: 'bg-duo-green-tint',
    iconColor: 'text-[#58CC02]',
    borderColor: 'border-[#58CC02]/30',
  },
  {
    href: '/friends',
    label: 'Amigos',
    icon: Users,
    bg: 'bg-duo-blue-tint',
    iconColor: 'text-[#1CB0F6]',
    borderColor: 'border-[#1CB0F6]/30',
  },
  {
    href: '/articles',
    label: 'Artigos',
    icon: FileText,
    bg: 'bg-duo-gold-tint',
    iconColor: 'text-[#FFC800]',
    borderColor: 'border-[#FFC800]/30',
  },
];

export default function DashboardPage() {
  const { user } = useStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [xpData, setXpData] = useState<XPSummary | null>(null);
  const [streakData, setStreakData] = useState<StreakStatus | null>(null);
  const [recentPosts, setRecentPosts] = useState<PostWithAuthor[]>([]);

  useEffect(() => {
    xpApi.getSummary().then(setXpData).catch(() => {});
    streakApi.getStatus().then(setStreakData).catch(() => {});
  }, []);

  if (!user) return null;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const stats = [
    {
      label: 'Ofensiva',
      value: streakData?.current_streak ?? 0,
      suffix: 'dias',
      icon: Flame,
      iconBg: 'bg-duo-orange-tint',
      iconColor: 'text-[#FF9600]',
      valueColor: 'text-[#FF9600]',
      borderColor: 'border-[#FF9600]/20',
    },
    {
      label: 'XP semanal',
      value: xpData ? xpData.weekly_xp : 0,
      suffix: 'XP',
      icon: Star,
      iconBg: 'bg-duo-gold-tint',
      iconColor: 'text-[#FFC800]',
      valueColor: 'text-[#D4A800]',
      borderColor: 'border-[#FFC800]/20',
    },
    {
      label: 'Nível',
      value: xpData?.level ?? 1,
      suffix: '',
      icon: TrendingUp,
      iconBg: 'bg-duo-green-tint',
      iconColor: 'text-[#58CC02]',
      valueColor: 'text-[#58CC02]',
      borderColor: 'border-[#58CC02]/20',
    },
    {
      label: 'Total XP',
      value: xpData
        ? xpData.total_xp >= 1000
          ? (xpData.total_xp / 1000).toFixed(1) + 'k'
          : xpData.total_xp
        : 0,
      suffix: '',
      icon: Trophy,
      iconBg: 'bg-duo-purple-tint',
      iconColor: 'text-[#CE82FF]',
      valueColor: 'text-[#CE82FF]',
      borderColor: 'border-[#CE82FF]/20',
    },
  ];

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsEditModalOpen(true)} className="shrink-0">
            <UserAvatar
              src={user.avatar_url}
              name={user.full_name || user.username}
              size="md"
              editable={false}
              onAvatarChange={() => {}}
            />
          </button>
          <div>
            <h1 className="text-lg font-extrabold leading-tight">
              {greeting()}, {user.full_name?.split(' ')[0] || user.username}!
            </h1>
            <p className="text-xs text-muted-foreground">
              {streakData?.current_streak
                ? `🔥 Ofensiva de ${streakData.current_streak} ${streakData.current_streak === 1 ? 'dia' : 'dias'}`
                : 'Pronto para estudar hoje?'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={() => setIsEditModalOpen(true)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick stats — Duolingo style */}
      <div className="grid grid-cols-4 gap-2">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={cn(
                'rounded-2xl border-2 bg-card p-3 text-center shadow-duo-card transition-transform hover:-translate-y-0.5',
                stat.borderColor
              )}
            >
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl mx-auto mb-1.5',
                  stat.iconBg
                )}
              >
                <Icon className={cn('h-5 w-5', stat.iconColor)} />
              </div>
              <p className={cn('text-xl font-black leading-none tabular-nums', stat.valueColor)}>
                {stat.value}
              </p>
              {stat.suffix && (
                <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">{stat.suffix}</p>
              )}
              <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* CTA: Start Studying — Duolingo 3D button style */}
      <Link href="/study" className="no-underline block group">
        <div
          className="rounded-2xl bg-primary p-4 text-white transition-all duration-75 cursor-pointer shadow-duo-green active:shadow-none active:translate-y-1 hover:brightness-105"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-extrabold text-sm">Começar uma sessão</p>
                <p className="text-xs text-white/80">
                  Use o timer para registrar seu progresso
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-white/80 shrink-0" />
          </div>
        </div>
      </Link>

      {/* Post Composer */}
      <PostComposer onPostCreated={(post) => setRecentPosts((p) => [post, ...p])} />

      {/* Quick links grid */}
      <div>
        <h2 className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">
          Explorar
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 transition-all hover:-translate-y-0.5 hover:shadow-card no-underline',
                  link.bg,
                  link.borderColor
                )}
              >
                <Icon className={cn('h-6 w-6', link.iconColor)} />
                <span className="text-xs font-bold text-foreground">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <XPGainListener />

      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}
