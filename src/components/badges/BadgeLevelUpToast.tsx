'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import {
  BadgeLevelUpEvent,
  TIER_COLORS,
} from '@/lib/api/badges.api';
import {
  GraduationCap,
  Flame,
  Users,
  Award,
  Target,
  Swords,
  Sparkles,
  Sunrise,
  Moon,
  Calendar,
  ArrowUp,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap,
  Flame,
  Users,
  Award,
  Target,
  Swords,
  Sparkles,
  Sunrise,
  Moon,
  Calendar,
};

// Confetti effect using CSS animations (no external library needed)
function triggerConfetti() {
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
  const confettiCount = 50;

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';
    confetti.style.cssText = `
      position: fixed;
      width: ${Math.random() * 10 + 5}px;
      height: ${Math.random() * 10 + 5}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${Math.random() * 100}vw;
      top: -20px;
      opacity: 1;
      border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
      z-index: 9999;
      pointer-events: none;
      animation: confetti-fall ${Math.random() * 2 + 2}s linear forwards;
    `;
    document.body.appendChild(confetti);

    setTimeout(() => {
      confetti.remove();
    }, 4000);
  }
}

// Add confetti animation styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes confetti-fall {
      0% {
        transform: translateY(0) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) rotate(720deg);
        opacity: 0;
      }
    }

    @keyframes badge-bounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }

    @keyframes glow-pulse {
      0%, 100% { box-shadow: 0 0 20px currentColor; }
      50% { box-shadow: 0 0 40px currentColor, 0 0 60px currentColor; }
    }
  `;
  document.head.appendChild(style);
}

export function showBadgeLevelUpToast(event: BadgeLevelUpEvent) {
  const IconComponent = ICON_MAP[event.badge.icon] || Sparkles;
  const tierColor = TIER_COLORS[event.level_info.tier];

  // Trigger confetti
  triggerConfetti();

  toast.custom(
    (t) => (
      <div
        className="flex items-center gap-4 bg-background border-2 rounded-xl p-4 shadow-2xl animate-in slide-in-from-top-5 zoom-in-95 duration-500"
        style={{ borderColor: tierColor }}
      >
        {/* Badge Icon with Animation */}
        <div
          className="relative p-4 rounded-full"
          style={{
            backgroundColor: `${tierColor}20`,
            animation: 'badge-bounce 0.6s ease-in-out, glow-pulse 1.5s ease-in-out infinite',
            color: tierColor,
          }}
        >
          <IconComponent className="h-10 w-10" />

          {/* Level Badge */}
          <div
            className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: tierColor }}
          >
            Lv.{event.to_level}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <ArrowUp className="h-4 w-4 text-green-500" />
            <p className="text-xs font-semibold uppercase tracking-wider text-green-500">
              Level Up!
            </p>
          </div>

          <p className="text-lg font-bold mt-1" style={{ color: tierColor }}>
            {event.badge.name}
          </p>

          <p className="text-sm text-muted-foreground">
            Nível {event.from_level} → Nível {event.to_level}
          </p>

          <p className="text-sm font-medium mt-1" style={{ color: tierColor }}>
            "{event.level_info.name}"
          </p>

          <div className="flex items-center gap-4 mt-2">
            <p className="text-sm font-bold" style={{ color: tierColor }}>
              +{event.points_earned} pontos
            </p>
            <p className="text-xs text-muted-foreground">
              Total: {event.new_total_points.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    ),
    {
      duration: 6000,
      position: 'top-center',
    }
  );
}

// Hook to listen for badge level-up events from WebSocket
export function useBadgeLevelUpListener() {
  useEffect(() => {
    // This would be connected to your WebSocket/store
    // For now, it's a placeholder showing how to integrate

    const handleBadgeLevelUp = (event: CustomEvent<BadgeLevelUpEvent>) => {
      showBadgeLevelUpToast(event.detail);
    };

    window.addEventListener('badge:levelup' as any, handleBadgeLevelUp);

    return () => {
      window.removeEventListener('badge:levelup' as any, handleBadgeLevelUp);
    };
  }, []);
}

// Utility to manually trigger level-up toast (for testing)
export function triggerTestLevelUp() {
  const testEvent: BadgeLevelUpEvent = {
    badge: {
      id: 'test',
      code: 'estudante',
      name: 'Estudante',
      icon: 'GraduationCap',
      category: 'study_hours',
    },
    from_level: 2,
    to_level: 3,
    level_info: {
      level: 3,
      requirement: 50,
      points: 50,
      name: 'Estudioso',
      tier: 'silver',
    },
    points_earned: 50,
    new_total_points: 85,
    timestamp: new Date().toISOString(),
  };

  showBadgeLevelUpToast(testEvent);
}
