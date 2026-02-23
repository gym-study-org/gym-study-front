'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { articlesApi } from '@/lib/api/articles.api';
import { Article } from '@/types/articles.types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PenSquare, Clock, Heart, Eye, Plus } from 'lucide-react';

export default function ArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'published' | 'drafts'>('published');
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);

  const load = async (reset = false) => {
    setLoading(true);
    try {
      const data = tab === 'published'
        ? await articlesApi.listPublished(20, reset ? undefined : cursor)
        : await articlesApi.getDrafts(20, reset ? undefined : cursor);
      if (reset) {
        setArticles(data.articles);
      } else {
        setArticles((prev) => [...prev, ...data.articles]);
      }
      setCursor(data.next_cursor || undefined);
      setHasMore(data.has_more);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCursor(undefined);
    load(true);
  }, [tab]);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Artigos</h1>
        <Button className="gap-1.5" onClick={() => router.push('/articles/write')}>
          <Plus className="h-4 w-4" /> Escrever
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'published' | 'drafts')}>
        <TabsList>
          <TabsTrigger value="published">Publicados</TabsTrigger>
          <TabsTrigger value="drafts">Meus Rascunhos</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading && articles.length === 0 ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          <PenSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
          {tab === 'published' ? 'Nenhum artigo publicado ainda.' : 'Nenhum rascunho.'}
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <Card
              key={article.id}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => router.push(`/articles/${article.slug}`)}
            >
              <CardContent className="pt-4">
                <div className="flex gap-4">
                  {article.cover_image_url && (
                    <div className="w-24 h-24 rounded-md bg-muted overflow-hidden shrink-0">
                      <img src={article.cover_image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm line-clamp-2">{article.title}</h3>
                    {article.excerpt && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{article.excerpt}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>@{article.author_username}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {article.reading_time_minutes} min</span>
                      <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {article.likes_count}</span>
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {article.views_count}</span>
                      {article.status === 'draft' && <Badge variant="secondary" className="text-[10px]">Rascunho</Badge>}
                    </div>
                    {article.tags.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {article.tags.slice(0, 5).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {hasMore && (
            <Button variant="outline" className="w-full" onClick={() => load()} disabled={loading}>
              {loading ? 'Carregando...' : 'Carregar mais'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
