'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { articlesApi } from '@/lib/api/articles.api';
import { Article } from '@/types/articles.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store';
import { ArrowLeft, Heart, Eye, Clock, Trash2, EyeOff, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useStore();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.slug) {
      articlesApi.getBySlug(params.slug as string)
        .then(setArticle)
        .catch(() => toast.error('Artigo não encontrado'))
        .finally(() => setLoading(false));
    }
  }, [params.slug]);

  const handleLike = async () => {
    if (!article) return;
    try {
      const result = await articlesApi.toggleLike(article.id);
      setArticle({ ...article, is_liked_by_me: result.liked, likes_count: result.likes_count });
    } catch {
      toast.error('Erro ao curtir');
    }
  };

  const handlePublish = async () => {
    if (!article) return;
    try {
      const updated = await articlesApi.publish(article.id);
      setArticle(updated);
      toast.success('Artigo publicado!');
    } catch {
      toast.error('Erro ao publicar');
    }
  };

  const handleUnpublish = async () => {
    if (!article) return;
    try {
      const updated = await articlesApi.unpublish(article.id);
      setArticle(updated);
      toast.success('Artigo despublicado');
    } catch {
      toast.error('Erro');
    }
  };

  const handleDelete = async () => {
    if (!article) return;
    try {
      await articlesApi.delete(article.id);
      toast.success('Artigo removido');
      router.push('/articles');
    } catch {
      toast.error('Erro ao remover');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>;
  }

  if (!article) {
    return <div className="text-center py-12 text-muted-foreground">Artigo não encontrado.</div>;
  }

  const isOwner = user?.id === article.user_id;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Button variant="ghost" size="sm" className="gap-1" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Button>

      <Card>
        <CardContent className="pt-6">
          {article.cover_image_url && (
            <div className="w-full h-48 rounded-lg bg-muted overflow-hidden mb-4">
              <img src={article.cover_image_url} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          {article.status === 'draft' && (
            <Badge variant="secondary" className="mb-2">Rascunho</Badge>
          )}

          <h1 className="text-2xl font-bold mb-2">{article.title}</h1>

          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                {article.author_username.charAt(0).toUpperCase()}
              </div>
              <span>@{article.author_username}</span>
            </div>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {article.reading_time_minutes} min</span>
            <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {article.views_count}</span>
            {article.published_at && (
              <span>{new Date(article.published_at).toLocaleDateString('pt-BR')}</span>
            )}
          </div>

          {article.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mb-4">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}

          <div className="prose prose-sm max-w-none whitespace-pre-wrap">
            {article.content}
          </div>

          <div className="flex items-center gap-2 mt-6 pt-4 border-t">
            <Button
              variant={article.is_liked_by_me ? 'default' : 'outline'}
              size="sm"
              className="gap-1.5"
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${article.is_liked_by_me ? 'fill-current' : ''}`} />
              {article.likes_count}
            </Button>

            {isOwner && (
              <>
                {article.status === 'draft' ? (
                  <Button variant="outline" size="sm" className="gap-1" onClick={handlePublish}>
                    <Send className="h-4 w-4" /> Publicar
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="gap-1" onClick={handleUnpublish}>
                    <EyeOff className="h-4 w-4" /> Despublicar
                  </Button>
                )}
                <Button variant="outline" size="sm" className="gap-1 text-destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" /> Remover
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
