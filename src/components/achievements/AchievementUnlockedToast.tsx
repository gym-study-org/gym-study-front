'use client';

import { Achievement, TIER_COLORS, TIER_TEXT_COLORS } from '@/lib/api/achievements.api';
import {
  Clock,
  BookOpen,
  GraduationCap,
  Crown,
  Gem,
  Flame,
  Zap,
  Target,
  Star,
  Diamond,
  UserPlus,
  Users,
  Award,
  Medal,
  Trophy,
  Crosshair,
  CheckCircle,
  Play,
  BookMarked,
  Swords,
  Sparkles,
  Sunrise,
  Moon,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Clock,
  BookOpen,
  GraduationCap,
  Crown,
  Gem,
  Flame,
  Zap,
  Target,
  Star,
  Diamond,
  UserPlus,
  Users,
  Award,
  Medal,
  Trophy,
  Crosshair,
  CheckCircle,
  Play,
  BookMarked,
  Swords,
  Sparkles,
  Sunrise,
  Moon,
  Calendar,
};

export function showAchievementUnlockedToast(achievement: Achievement) {
  const IconComponent = ICON_MAP[achievement.icon] || Star;
  const tierColor = TIER_COLORS[achievement.tier];

  toast.custom(
    () => (
      <div className="flex items-center gap-4 bg-background border-2 rounded-lg p-4 shadow-lg animate-in slide-in-from-top-5 duration-300"
        style={{ borderColor: tierColor }}
      >
        <div
          className="p-3 rounded-full"
          style={{ backgroundColor: `${tierColor}20`, color: tierColor }}
        >
          <IconComponent className="h-8 w-8" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Conquista Desbloqueada!
          </p>
          <p className={`text-lg font-bold ${TIER_TEXT_COLORS[achievement.tier]}`}>
            {achievement.name}
          </p>
          <p className="text-sm text-muted-foreground">{achievement.description}</p>
          <p className="text-sm font-bold mt-1" style={{ color: tierColor }}>
            +{achievement.points} pontos
          </p>
        </div>
      </div>
    ),
    {
      duration: 5000,
      position: 'top-center',
    }
  );
}
