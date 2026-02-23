'use client';

import { useEffect, useState } from 'react';
import { recommendationsApi } from '@/lib/api/recommendations.api';
import { Recommendation, RELATIONSHIP_LABELS, RelationshipType } from '@/types/recommendations.types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquareQuote, EyeOff, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface RecommendationsListProps {
  userId: string;
  isOwner?: boolean;
}

export function RecommendationsList({ userId, isOwner = false }: RecommendationsListProps) {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    recommendationsApi.getForUser(userId).then(setRecs).catch(() => {}).finally(() => setLoading(false));
  }, [userId]);

  const handleToggleVisibility = async (rec: Recommendation) => {
    try {
      const updated = await recommendationsApi.update(rec.id, { is_visible: !rec.is_visible });
      setRecs((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      toast.success(updated.is_visible ? 'Recomendação visível' : 'Recomendação oculta');
    } catch {
      toast.error('Erro ao atualizar');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await recommendationsApi.delete(id);
      setRecs((prev) => prev.filter((r) => r.id !== id));
      toast.success('Recomendação removida');
    } catch {
      toast.error('Erro ao remover');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>;
  }

  if (recs.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-muted-foreground">
        <MessageSquareQuote className="h-8 w-8 mx-auto mb-2 opacity-50" />
        Nenhuma recomendação ainda.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recs.map((rec) => (
        <Card key={rec.id} className={!rec.is_visible ? 'opacity-60' : ''}>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                  {rec.author_username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{rec.author_username}</p>
                  <Badge variant="secondary" className="text-[10px]">
                    {RELATIONSHIP_LABELS[rec.relationship as RelationshipType] || rec.relationship}
                  </Badge>
                </div>
              </div>
              {isOwner && (
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleToggleVisibility(rec)}>
                    <EyeOff className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDelete(rec.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{rec.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
