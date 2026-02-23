'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { articlesApi } from '@/lib/api/articles.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Send, X } from 'lucide-react';
import { toast } from 'sonner';

export default function WriteArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [articleId, setArticleId] = useState<string | null>(null);

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    if (!title || !content) {
      toast.error('Título e conteúdo são obrigatórios');
      return;
    }
    if (content.length < 50) {
      toast.error('O conteúdo deve ter pelo menos 50 caracteres');
      return;
    }
    setSaving(true);
    try {
      if (articleId) {
        await articlesApi.update(articleId, { title, content, excerpt: excerpt || undefined, tags });
        toast.success('Rascunho atualizado');
      } else {
        const article = await articlesApi.create({ title, content, excerpt: excerpt || undefined, tags });
        setArticleId(article.id);
        toast.success('Rascunho salvo');
      }
    } catch {
      toast.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!articleId) {
      await handleSave();
    }
    if (!articleId && !title) return;

    setSaving(true);
    try {
      let id = articleId;
      if (!id) {
        const article = await articlesApi.create({ title, content, excerpt: excerpt || undefined, tags });
        id = article.id;
        setArticleId(id);
      }
      const published = await articlesApi.publish(id);
      toast.success('Artigo publicado!');
      router.push(`/articles/${published.slug}`);
    } catch {
      toast.error('Erro ao publicar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold flex-1">Escrever Artigo</h1>
        <Button variant="outline" size="sm" className="gap-1" onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4" /> Salvar
        </Button>
        <Button size="sm" className="gap-1" onClick={handlePublish} disabled={saving}>
          <Send className="h-4 w-4" /> Publicar
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4 space-y-4">
          <input
            type="text"
            placeholder="Título do artigo"
            className="w-full text-2xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/50"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />

          <input
            type="text"
            placeholder="Resumo (opcional)"
            className="w-full text-sm bg-transparent border-none outline-none placeholder:text-muted-foreground/50"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            maxLength={500}
          />

          <div className="flex flex-wrap gap-1.5 items-center">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                {tag}
                <button onClick={() => removeTag(tag)}><X className="h-3 w-3" /></button>
              </Badge>
            ))}
            {tags.length < 10 && (
              <input
                type="text"
                placeholder="+ tag"
                className="text-xs bg-transparent border-none outline-none w-16 placeholder:text-muted-foreground/50"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                maxLength={50}
              />
            )}
          </div>

          <textarea
            placeholder="Escreva seu artigo aqui... (Suporta Markdown)"
            className="w-full min-h-[400px] rounded-md border border-input bg-background px-4 py-3 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <p className="text-xs text-muted-foreground text-right">
            ~{Math.max(1, Math.round(content.split(/\s+/).length / 200))} min de leitura
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
