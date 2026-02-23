'use client';

import { useState, useRef } from 'react';
import { Globe, Users, Lock, Send, Tag, ChevronDown } from 'lucide-react';
import { useStore } from '@/store';
import { feedApi } from '@/lib/api/feed.api';
import { PostWithAuthor, PostVisibility } from '@/types/feed.types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const VISIBILITY_OPTIONS: { value: PostVisibility; label: string; icon: React.ElementType }[] = [
  { value: 'public', label: 'Público', icon: Globe },
  { value: 'friends', label: 'Amigos', icon: Users },
  { value: 'private', label: 'Privado', icon: Lock },
];

interface PostComposerProps {
  onPostCreated: (post: PostWithAuthor) => void;
}

export function PostComposer({ onPostCreated }: PostComposerProps) {
  const { user } = useStore();
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<PostVisibility>('public');
  const [tags, setTags] = useState('');
  const [showTags, setShowTags] = useState(false);
  const [showVisibility, setShowVisibility] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedVisibility = VISIBILITY_OPTIONS.find((o) => o.value === visibility)!;
  const VisibilityIcon = selectedVisibility.icon;

  const handleExpand = () => {
    setExpanded(true);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      const tagsArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const post = await feedApi.createPost({
        content: content.trim(),
        visibility,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
      });

      onPostCreated(post);
      setContent('');
      setTags('');
      setShowTags(false);
      setExpanded(false);
      toast.success('Post publicado!');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao publicar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const authorName = user?.full_name || user?.username || '?';
  const authorInitial = authorName[0].toUpperCase();

  return (
    <div className="rounded-xl border bg-card shadow-card">
      <div className="flex gap-3 p-4">
        {/* Avatar */}
        <Avatar className="h-10 w-10 shrink-0 ring-2 ring-primary/10">
          <AvatarImage src={user?.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
            {authorInitial}
          </AvatarFallback>
        </Avatar>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          {!expanded ? (
            <button
              onClick={handleExpand}
              className="w-full rounded-full border bg-muted/40 px-4 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              Compartilhe seu progresso de hoje...
            </button>
          ) : (
            <div className="space-y-3">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Compartilhe seu progresso de hoje..."
                className="w-full min-h-[100px] resize-none rounded-lg bg-transparent p-0 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
                }}
              />

              {/* Tags input */}
              {showTags && (
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Tags separadas por vírgula (ex: javascript, react)"
                  className="w-full rounded-lg border bg-muted/30 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              )}

              {/* Toolbar */}
              <div className="flex items-center justify-between border-t pt-3">
                <div className="flex items-center gap-1">
                  {/* Tags toggle */}
                  <button
                    onClick={() => setShowTags(!showTags)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
                      showTags
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Tag className="h-3.5 w-3.5" />
                    Tags
                  </button>

                  {/* Visibility picker */}
                  <div className="relative">
                    <button
                      onClick={() => setShowVisibility(!showVisibility)}
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <VisibilityIcon className="h-3.5 w-3.5" />
                      {selectedVisibility.label}
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    {showVisibility && (
                      <div className="absolute bottom-full left-0 mb-1 z-50 rounded-xl border bg-card shadow-card-hover min-w-[130px] py-1">
                        {VISIBILITY_OPTIONS.map((opt) => {
                          const Icon = opt.icon;
                          return (
                            <button
                              key={opt.value}
                              onClick={() => { setVisibility(opt.value); setShowVisibility(false); }}
                              className={cn(
                                'flex w-full items-center gap-2 px-3 py-2 text-xs font-medium transition-colors',
                                visibility === opt.value
                                  ? 'text-primary bg-primary/5'
                                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                              )}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setExpanded(false);
                      setContent('');
                      setTags('');
                      setShowTags(false);
                    }}
                    className="text-xs h-8"
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={!content.trim() || isSubmitting}
                    className="gap-1.5 h-8 text-xs"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {isSubmitting ? 'Publicando...' : 'Publicar'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
