'use client';

import { useState, useEffect } from 'react';
import { feedApi } from '@/lib/api/feed.api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BarChart3, Clock } from 'lucide-react';

interface PollCardProps {
  postId: string;
  metadata: {
    question?: string;
    options?: string[];
    ends_at?: string;
    multiple_choice?: boolean;
  };
}

export function PollCard({ postId, metadata }: PollCardProps) {
  const [votes, setVotes] = useState<Record<number, number>>({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [myVote, setMyVote] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const options = metadata.options || [];
  const isExpired = metadata.ends_at ? new Date(metadata.ends_at) < new Date() : false;
  const hasVoted = myVote !== null;

  useEffect(() => {
    feedApi.getPollResults(postId).then((data) => {
      setVotes(data.votes);
      setTotalVotes(data.total_votes);
      setMyVote(data.my_vote);
    }).catch(() => {});
  }, [postId]);

  const handleVote = async (index: number) => {
    if (loading || isExpired) return;
    setLoading(true);
    try {
      const result = await feedApi.votePoll(postId, index);
      setVotes(result.votes);
      setTotalVotes(result.total_votes);
      setMyVote(result.my_vote);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 space-y-2">
      {metadata.question && (
        <p className="font-medium text-sm flex items-center gap-1.5">
          <BarChart3 className="h-4 w-4 text-primary" />
          {metadata.question}
        </p>
      )}

      <div className="space-y-1.5">
        {options.map((option, index) => {
          const count = votes[index] || 0;
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const isMyVote = myVote === index;

          return (
            <button
              key={index}
              onClick={() => handleVote(index)}
              disabled={loading || isExpired}
              className={cn(
                'relative w-full text-left rounded-md border px-3 py-2 text-sm transition-colors',
                isMyVote ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
                (isExpired || hasVoted) && 'cursor-default'
              )}
            >
              {(hasVoted || isExpired) && (
                <div
                  className="absolute inset-0 rounded-md bg-primary/10 transition-all"
                  style={{ width: `${pct}%` }}
                />
              )}
              <div className="relative flex items-center justify-between">
                <span className={cn(isMyVote && 'font-semibold')}>{option}</span>
                {(hasVoted || isExpired) && (
                  <span className="text-xs text-muted-foreground ml-2">{pct}%</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{totalVotes} voto{totalVotes !== 1 ? 's' : ''}</span>
        {metadata.ends_at && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {isExpired ? 'Encerrada' : `Encerra ${new Date(metadata.ends_at).toLocaleDateString('pt-BR')}`}
          </span>
        )}
      </div>
    </div>
  );
}
