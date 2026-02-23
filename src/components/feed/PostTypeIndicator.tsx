'use client';

import { PostType } from '@/types/feed.types';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Award, Trophy, Milestone, Code, MessageSquareText, BarChart2, Repeat2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ElementType } from 'react';

const POST_TYPE_CONFIG: Record<PostType, { label: string; icon: ElementType; className: string }> = {
  text: { label: 'Texto', icon: MessageSquareText, className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  study_output: { label: 'Sessão de Estudo', icon: BookOpen, className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  certification_share: { label: 'Certificação', icon: Award, className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
  achievement_share: { label: 'Conquista', icon: Trophy, className: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  challenge_complete: { label: 'Desafio', icon: Trophy, className: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
  milestone: { label: 'Marco', icon: Milestone, className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  code_snippet: { label: 'Código', icon: Code, className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
  poll: { label: 'Enquete', icon: BarChart2, className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' },
  shared_post: { label: 'Compartilhou', icon: Repeat2, className: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300' },
};

interface PostTypeIndicatorProps {
  type: PostType;
}

export function PostTypeIndicator({ type }: PostTypeIndicatorProps) {
  if (type === 'text' || type === 'shared_post') return null;

  const config = POST_TYPE_CONFIG[type];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn('gap-1 border-0 text-[10px]', config.className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
