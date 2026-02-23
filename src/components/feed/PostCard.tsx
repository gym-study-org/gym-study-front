'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  Send,
  Share2,
} from 'lucide-react';
import { PostWithAuthor, CommentWithAuthor } from '@/types/feed.types';
import { feedApi } from '@/lib/api/feed.api';
import { useStore } from '@/store';
import { PostTypeIndicator } from './PostTypeIndicator';
import { CommentSection } from './CommentSection';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: PostWithAuthor;
  onPostUpdated?: (post: PostWithAuthor) => void;
  onPostDeleted?: (postId: string) => void;
}

export function PostCard({ post, onPostUpdated, onPostDeleted }: PostCardProps) {
  const { user } = useStore();
  const [liked, setLiked] = useState(post.is_liked_by_me);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const isOwner = user?.id === post.user_id;

  const handleToggleLike = async () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    try {
      const result = await feedApi.toggleLike(post.id);
      setLiked(result.liked);
      setLikesCount(result.likes_count);
    } catch {
      setLiked(liked);
      setLikesCount(likesCount);
    }
  };

  const handleToggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setIsLoadingComments(true);
      try {
        const postData = await feedApi.getPost(post.id);
        setComments(postData.comments);
      } catch {
        toast.error('Erro ao carregar comentários');
      } finally {
        setIsLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleCommentAdded = (comment: CommentWithAuthor) => {
    if (comment.parent_id) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === comment.parent_id
            ? { ...c, replies: [...(c.replies || []), comment] }
            : c
        )
      );
    } else {
      setComments((prev) => [...prev, comment]);
    }
    setCommentsCount((c) => c + 1);
  };

  const handleCommentDeleted = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setCommentsCount((c) => Math.max(0, c - 1));
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    try {
      const updated = await feedApi.updatePost(post.id, { content: editContent.trim() });
      onPostUpdated?.(updated);
      setIsEditing(false);
      toast.success('Post atualizado');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao atualizar');
    }
  };

  const handleDelete = async () => {
    try {
      await feedApi.deletePost(post.id);
      onPostDeleted?.(post.id);
      toast.success('Post deletado');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao deletar');
    }
  };

  const authorName = post.author_full_name || post.author_username;
  const authorInitial = authorName[0].toUpperCase();

  return (
    <article className="rounded-xl border bg-card shadow-card hover:shadow-card-hover transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-primary/10">
            <AvatarImage src={post.author_avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
              {authorInitial}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold leading-none">{authorName}</span>
              <PostTypeIndicator type={post.post_type} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              @{post.author_username} ·{' '}
              {formatDistanceToNow(new Date(post.created_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </p>
          </div>
        </div>

        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)} className="gap-2">
                <Pencil className="h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="gap-2 text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Deletar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Body */}
      <div className="px-4 pb-3">
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[80px] resize-none"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleEdit} className="gap-1.5">
                <Send className="h-3.5 w-3.5" />
                Salvar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => { setIsEditing(false); setEditContent(post.content); }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
            {post.content}
          </p>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Reaction count summary */}
      {(likesCount > 0 || commentsCount > 0) && (
        <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground border-t">
          <div className="flex items-center gap-1">
            {likesCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">♥</span>
                {likesCount}
              </span>
            )}
          </div>
          {commentsCount > 0 && (
            <button
              onClick={handleToggleComments}
              className="hover:underline hover:text-foreground transition-colors"
            >
              {commentsCount} {commentsCount === 1 ? 'comentário' : 'comentários'}
            </button>
          )}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center gap-0 border-t px-2 py-1">
        <button
          onClick={handleToggleLike}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            liked
              ? 'text-primary hover:bg-primary/5'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
          <span>Curtir</span>
        </button>

        <button
          onClick={handleToggleComments}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Comentar</span>
        </button>

        <button className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Share2 className="h-4 w-4" />
          <span>Compartilhar</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t px-4 py-3">
          {isLoadingComments ? (
            <p className="py-3 text-center text-sm text-muted-foreground">
              Carregando comentários...
            </p>
          ) : (
            <CommentSection
              postId={post.id}
              comments={comments}
              onCommentAdded={handleCommentAdded}
              onCommentDeleted={handleCommentDeleted}
            />
          )}
        </div>
      )}
    </article>
  );
}
