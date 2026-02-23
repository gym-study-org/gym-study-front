'use client';

import { useState, ElementType } from 'react';
import { Globe, Users, Lock, ChevronDown, UserCircle, Repeat2, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PostWithAuthor, PostVisibility, PostAudience } from '@/types/feed.types';
import { feedApi } from '@/lib/api/feed.api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const VISIBILITY_OPTIONS: { value: PostVisibility; label: string; icon: ElementType }[] = [
  { value: 'public', label: 'Público', icon: Globe },
  { value: 'friends', label: 'Amigos', icon: Users },
  { value: 'private', label: 'Privado', icon: Lock },
];

interface ShareDialogProps {
  post: PostWithAuthor;
  isOpen: boolean;
  onClose: () => void;
  onShared?: (newPost: PostWithAuthor) => void;
}

export function ShareDialog({ post, isOpen, onClose, onShared }: ShareDialogProps) {
  const [comment, setComment] = useState('');
  const [audience, setAudience] = useState<PostAudience>('global');
  const [visibility, setVisibility] = useState<PostVisibility>('public');
  const [showVisibility, setShowVisibility] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedVisibility = VISIBILITY_OPTIONS.find((o) => o.value === visibility)!;
  const VisibilityIcon = selectedVisibility.icon;

  const originalAuthor = post.author_full_name || post.author_username;
  const originalInitial = originalAuthor[0].toUpperCase();

  const handleShare = async () => {
    setIsSubmitting(true);
    try {
      const newPost = await feedApi.createPost({
        content: comment.trim(),
        post_type: 'shared_post',
        metadata: {
          shared_post_id: post.id,
          shared_author_username: post.author_username,
          shared_author_full_name: post.author_full_name,
          shared_author_avatar_url: post.author_avatar_url,
          shared_content: post.content,
          shared_post_type: post.post_type,
        },
        audience,
        visibility,
      });

      onShared?.(newPost);
      toast.success('Post compartilhado!');
      setComment('');
      setAudience('global');
      setVisibility('public');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao compartilhar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat2 className="h-4 w-4 text-teal-500" />
            Compartilhar post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Optional comment */}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Adicione um comentário (opcional)..."
            className="w-full min-h-[80px] resize-none rounded-lg border bg-muted/30 px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />

          {/* Original post preview */}
          <div className="rounded-xl border bg-muted/20 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={post.author_avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                  {originalInitial}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-semibold">{originalAuthor}</span>
              <span className="text-xs text-muted-foreground">@{post.author_username}</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {post.content || <span className="italic">Post sem texto</span>}
            </p>
          </div>

          {/* Audience toggle */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Publicar em</p>
            <div className="flex items-center gap-1.5 rounded-lg border bg-muted/30 p-1">
              <button
                onClick={() => setAudience('global')}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                  audience === 'global'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Globe className="h-3.5 w-3.5" />
                Feed Global
              </button>
              <button
                onClick={() => setAudience('personal')}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                  audience === 'personal'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <UserCircle className="h-3.5 w-3.5" />
                Meu Perfil
              </button>
            </div>
          </div>

          {/* Visibility + Actions row */}
          <div className="flex items-center justify-between">
            {/* Visibility picker */}
            <div className="relative">
              <button
                onClick={() => setShowVisibility(!showVisibility)}
                className="flex items-center gap-1.5 rounded-lg border bg-muted/30 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <VisibilityIcon className="h-3.5 w-3.5" />
                {selectedVisibility.label}
                <ChevronDown className="h-3 w-3" />
              </button>
              {showVisibility && (
                <div className="absolute bottom-full left-0 mb-1 z-50 rounded-xl border bg-card shadow-lg min-w-[130px] py-1">
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

            {/* Buttons */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onClose} className="text-xs h-8">
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleShare}
                disabled={isSubmitting}
                className="gap-1.5 h-8 text-xs"
              >
                <Send className="h-3.5 w-3.5" />
                {isSubmitting ? 'Compartilhando...' : 'Compartilhar'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
