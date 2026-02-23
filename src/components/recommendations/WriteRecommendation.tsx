'use client';

import { useState } from 'react';
import { recommendationsApi } from '@/lib/api/recommendations.api';
import { RelationshipType, RELATIONSHIP_LABELS } from '@/types/recommendations.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { MessageSquareQuote } from 'lucide-react';

interface WriteRecommendationProps {
  recipientId: string;
  recipientUsername: string;
  onSuccess?: () => void;
}

export function WriteRecommendation({ recipientId, recipientUsername, onSuccess }: WriteRecommendationProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [relationship, setRelationship] = useState<RelationshipType>('study_partner');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (content.length < 10) {
      toast.error('Mínimo de 10 caracteres');
      return;
    }
    setLoading(true);
    try {
      await recommendationsApi.create({ recipient_id: recipientId, relationship, content });
      toast.success('Recomendação enviada!');
      setContent('');
      setOpen(false);
      onSuccess?.();
    } catch {
      toast.error('Erro ao enviar recomendação');
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <MessageSquareQuote className="h-4 w-4" />
        Recomendar {recipientUsername}
      </Button>
    );
  }

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <p className="text-sm font-medium">Escrever recomendação para @{recipientUsername}</p>

        <div className="flex gap-2">
          {(Object.keys(RELATIONSHIP_LABELS) as RelationshipType[]).map((key) => (
            <Button
              key={key}
              size="sm"
              variant={relationship === key ? 'default' : 'outline'}
              className="text-xs h-7"
              onClick={() => setRelationship(key)}
            >
              {RELATIONSHIP_LABELS[key]}
            </Button>
          ))}
        </div>

        <textarea
          className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Descreva sua experiência com esta pessoa..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={2000}
        />

        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button size="sm" onClick={handleSubmit} disabled={loading || content.length < 10}>
            {loading ? 'Enviando...' : 'Enviar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
