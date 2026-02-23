'use client';

import { useEffect, useState } from 'react';
import { gemsApi } from '@/lib/api/gems.api';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Diamond } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface GemsBadgeProps {
  className?: string;
  panel?: boolean;
}

export function GemsBadge({ className, panel = false }: GemsBadgeProps) {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    gemsApi.getBalance().then(data => setBalance(data.balance)).catch(() => {});

    const handleGems = () => {
      gemsApi.getBalance().then(data => setBalance(data.balance)).catch(() => {});
    };
    window.addEventListener('gems:earned', handleGems);
    window.addEventListener('gems:spent', handleGems);
    return () => {
      window.removeEventListener('gems:earned', handleGems);
      window.removeEventListener('gems:spent', handleGems);
    };
  }, []);

  if (balance === null) return null;

  if (panel) {
    return (
      <Link
        href="/shop"
        className={cn(
          'flex items-center justify-between rounded-2xl border-2 border-[#1CB0F6]/30 bg-duo-blue-tint px-3 py-2.5 transition-all hover:-translate-y-0.5 hover:shadow-card no-underline',
          className
        )}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1CB0F6]/20">
            <Diamond className="h-4 w-4 text-[#1CB0F6]" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-foreground uppercase tracking-wider">Gemas</p>
            <p className="text-sm font-black text-[#1CB0F6]">{balance}</p>
          </div>
        </div>
        <span className="text-xs font-bold text-[#1CB0F6] bg-card rounded-lg px-2 py-1">
          Loja →
        </span>
      </Link>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="/shop"
            className={cn('flex items-center gap-1.5 cursor-pointer', className)}
          >
            <Diamond className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-semibold">{balance}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>{balance} gemas</p>
          <p className="text-xs">Clique para abrir a loja</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
