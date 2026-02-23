'use client';

import Link from 'next/link';
import { Dumbbell, Search, LogOut, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { useStore } from '@/store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function TopNavbar() {
  const { user, logout } = useStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success('Até logo!');
    router.push('/');
  };

  const initials = user
    ? (user.full_name || user.username).slice(0, 2).toUpperCase()
    : 'GS';

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center border-b-2 border-border bg-card shadow-sm">
      <div className="flex w-full items-center gap-3 px-4">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 no-underline hover:no-underline shrink-0"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-duo-green-sm">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <span className="hidden text-base font-black tracking-tight text-primary sm:block">
            GYM<span className="text-foreground">STUDY</span>
          </span>
        </Link>

        {/* Search bar */}
        <div className="relative mx-auto flex max-w-sm flex-1 items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar usuários, artigos..."
            className="h-9 w-full rounded-full border-2 border-border bg-background pl-9 pr-4 text-sm outline-none transition-colors focus:border-primary focus:bg-background focus:ring-0"
          />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <ModeToggle />
          <NotificationBell />

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 hover:bg-muted">
                <Avatar className="h-8 w-8 ring-2 ring-primary/30">
                  <AvatarImage src={user?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-white text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-2xl border-2">
              {user && (
                <>
                  <div className="px-3 py-2">
                    <p className="text-sm font-bold">{user.full_name || user.username}</p>
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="gap-2 no-underline font-semibold">
                  <User className="h-4 w-4" />
                  Meu Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="gap-2 text-destructive focus:text-destructive font-semibold"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
