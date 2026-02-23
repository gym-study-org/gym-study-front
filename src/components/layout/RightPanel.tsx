'use client';

import { StreakWidget } from '@/components/streak/StreakWidget';
import { DailyQuestsCard } from '@/components/quests/DailyQuestsCard';
import { GemsBadge } from '@/components/gems/GemsBadge';
import { ProfileViewsWidget } from '@/components/stories/ProfileViewsWidget';

interface PanelSectionProps {
  title: string;
  emoji?: string;
  children: React.ReactNode;
  accentColor?: string;
}

function PanelSection({ title, emoji, children, accentColor = '#58CC02' }: PanelSectionProps) {
  return (
    <div className="rounded-2xl border-2 border-border bg-white shadow-duo-card overflow-hidden">
      {/* Section header with colored left border */}
      <div
        className="px-3 pt-3 pb-2 border-b border-border"
        style={{ borderLeftColor: accentColor }}
      >
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
          {emoji && <span>{emoji}</span>}
          {title}
        </h3>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

export function RightPanel() {
  return (
    <aside className="hidden xl:flex flex-col w-72 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto scrollbar-hide py-4 pl-0 pr-4 gap-3">
      {/* Streak */}
      <PanelSection title="Ofensiva" emoji="🔥" accentColor="#FF9600">
        <StreakWidget />
      </PanelSection>

      {/* Daily Quests */}
      <PanelSection title="Missões de hoje" emoji="⚡" accentColor="#FFC800">
        <DailyQuestsCard compact />
      </PanelSection>

      {/* Gems balance */}
      <GemsBadge panel />

      {/* Profile views */}
      <PanelSection title="Visualizações do perfil" emoji="👁" accentColor="#1CB0F6">
        <ProfileViewsWidget compact />
      </PanelSection>
    </aside>
  );
}
