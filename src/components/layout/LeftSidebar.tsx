'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  MessageSquare,
  BookOpen,
  Swords,
  Trophy,
  UsersRound,
  Users,
  FileText,
  Medal,
  ShoppingBag,
  Target,
  UserCircle,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useStore } from '@/store';
import { XPBar } from '@/components/xp/XPBar';
import { LeagueBadge } from '@/components/leagues/LeagueBadge';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/feed', label: 'Feed', icon: MessageSquare },
  { href: '/study', label: 'Estudar', icon: BookOpen },
  { href: '/leagues', label: 'Ligas', icon: Swords },
  { href: '/ranking', label: 'Ranking', icon: Trophy },
  { href: '/groups', label: 'Grupos', icon: UsersRound },
  { href: '/friends', label: 'Amigos', icon: Users },
  { href: '/articles', label: 'Artigos', icon: FileText },
  { href: '/badges', label: 'Badges', icon: Medal },
  { href: '/shop', label: 'Loja', icon: ShoppingBag },
  { href: '/goals', label: 'Metas', icon: Target },
];

export function LeftSidebar() {
  const pathname = usePathname();
  const { user } = useStore();

  const initials = user
    ? (user.full_name || user.username).slice(0, 2).toUpperCase()
    : 'GS';

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto scrollbar-hide border-r bg-card py-4">
      {/* Mini user card */}
      {user && (
        <Link href={`/profile/${user.username}`} className="no-underline">
        <div className="mx-3 mb-4 rounded-2xl border-2 border-border bg-card p-3 shadow-card hover:border-primary/40 transition-colors cursor-pointer">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-10 w-10 ring-2 ring-primary/30">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-white font-bold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold truncate">{user.full_name || user.username}</p>
              <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
            </div>
          </div>
          <div className="mt-3">
            <XPBar compact={false} sidebar />
          </div>
        </div>
        </Link>
      )}

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 px-2">
        {user && (() => {
          const profileHref = `/profile/${user.username}`;
          const isActive = pathname === profileHref || pathname.startsWith(profileHref + '/');
          return (
            <Link
              href={profileHref}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 no-underline',
                isActive
                  ? 'bg-primary/12 text-primary border-l-[3px] border-primary pl-[9px]'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <UserCircle className={cn('h-5 w-5 shrink-0', isActive ? 'text-primary' : '')} />
              Meu Perfil
            </Link>
          );
        })()}
        {NAV_LINKS.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 no-underline',
                isActive
                  ? 'bg-primary/12 text-primary border-l-[3px] border-primary pl-[9px]'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 shrink-0',
                  isActive ? 'text-primary' : ''
                )}
              />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* League badge at bottom */}
      <div className="mt-auto px-3 pt-4">
        <LeagueBadge sidebar />
      </div>
    </aside>
  );
}
