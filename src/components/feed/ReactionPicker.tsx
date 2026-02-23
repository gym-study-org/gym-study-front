'use client';

import { useState, useRef, useEffect } from 'react';
import { feedApi } from '@/lib/api/feed.api';
import { REACTION_EMOJIS, ReactionType } from '@/types/groups.types';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReactionPickerProps {
  postId: string;
  reactions: Record<string, number>;
  myReactions: string[];
  onReactionChange: (reactions: Record<string, number>, myReactions: string[]) => void;
}

const REACTION_TYPES: ReactionType[] = ['like', 'love', 'clap', 'fire', 'mind_blown', 'rocket'];

export function ReactionPicker({ postId, reactions, myReactions, onReactionChange }: ReactionPickerProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleReact = async (type: ReactionType) => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await feedApi.reactToPost(postId, type);
      const newMyReactions = result.added
        ? [...myReactions.filter(r => r !== type), type]
        : myReactions.filter(r => r !== type);
      onReactionChange(result.reactions, newMyReactions);
      setOpen(false);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const topReactions = Object.entries(reactions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="relative flex items-center gap-1" ref={containerRef}>
      <Button
        variant={myReactions.length > 0 ? 'default' : 'ghost'}
        size="sm"
        className="gap-1.5 h-8"
        onClick={() => setOpen(!open)}
      >
        {myReactions.length > 0 ? (
          <span className="text-sm">{REACTION_EMOJIS[myReactions[0] as ReactionType]}</span>
        ) : (
          <Heart className="h-4 w-4" />
        )}
        {totalReactions > 0 && <span className="text-xs">{totalReactions}</span>}
      </Button>

      {open && (
        <div className="absolute bottom-full left-0 mb-1 z-50 rounded-lg border bg-background p-1.5 shadow-md">
          <div className="flex gap-1">
            {REACTION_TYPES.map(type => (
              <button
                key={type}
                onClick={() => handleReact(type)}
                className={cn(
                  'text-xl hover:scale-125 transition-transform p-1 rounded',
                  myReactions.includes(type) && 'bg-primary/10 ring-1 ring-primary'
                )}
                title={type}
              >
                {REACTION_EMOJIS[type]}
              </button>
            ))}
          </div>
        </div>
      )}

      {topReactions.length > 0 && (
        <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
          {topReactions.map(([type]) => (
            <span key={type} title={`${type}: ${reactions[type]}`}>
              {REACTION_EMOJIS[type as ReactionType]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
