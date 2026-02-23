'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/store';
import { SocketProvider } from '@/components/providers/SocketProvider';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { RightPanel } from '@/components/layout/RightPanel';
import { Home, MessageSquare, BookOpen, Swords, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOBILE_NAV = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/feed', label: 'Feed', icon: MessageSquare },
  { href: '/study', label: 'Estudar', icon: BookOpen },
  { href: '/leagues', label: 'Ligas', icon: Swords },
  { href: '/friends', label: 'Amigos', icon: Users },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useStore();
  const [mounted, setMounted] = useState(false);

  // Wait for Zustand to hydrate from localStorage before checking auth
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, router]);

  // While hydrating, render nothing to avoid flash
  if (!mounted) return null;

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <SocketProvider>
      <div className="min-h-screen bg-background">
        {/* Top Navbar */}
        <TopNavbar />

        {/* 3-column layout */}
        <div className="mx-auto flex max-w-7xl gap-0">
          {/* Left Sidebar */}
          <LeftSidebar />

          {/* Main Content */}
          <main className="flex-1 min-w-0 px-3 py-4 pb-20 lg:pb-4">
            {children}
          </main>

          {/* Right Panel */}
          <RightPanel />
        </div>

        {/* Mobile Bottom Nav */}
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-sm lg:hidden">
          <div className="flex items-center justify-around py-2">
            {MOBILE_NAV.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex flex-col items-center gap-1 px-3 py-1 text-xs font-medium transition-colors no-underline',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </SocketProvider>
  );
}
