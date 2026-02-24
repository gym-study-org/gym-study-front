'use client';

import { useState, ElementType } from 'react';
import Link from 'next/link';
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
  Globe,
  Users,
  Lock,
  ChevronDown,
} from 'lucide-react';
import { PostWithAuthor, CommentWithAuthor, PostVisibility } from '@/types/feed.types';
import { feedApi } from '@/lib/api/feed.api';
import { useStore } from '@/store';
import { PostTypeIndicator } from './PostTypeIndicator';
import { CommentSection } from './CommentSection';
import { ShareDialog } from './ShareDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const VISIBILITY_OPTIONS: { value: PostVisibility; label: string; icon: ElementType }[] = [
  { value: 'public', label: 'Público', icon: Globe },
  { value: 'friends', label: 'Amigos', icon: Users },
  { value: 'private', label: 'Privado', icon: Lock },
];

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
  const [editVisibility, setEditVisibility] = useState<PostVisibility>(post.visibility);
  const [showEditVisibility, setShowEditVisibility] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const isOwner = user?.id === post.user_id;

  const isVideoUrl = (url: string) => /\.(mp4|webm|mov)(\?|$)/i.test(url);

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
      const updated = await feedApi.updatePost(post.id, {
        content: editContent.trim(),
        visibility: editVisibility,
      });
      onPostUpdated?.(updated);
      setIsEditing(false);
      setShowEditVisibility(false);
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
          <Link href={`/profile/${post.author_username}`} className="no-underline">
            <Avatar className="h-10 w-10 ring-2 ring-primary/10 hover:ring-primary/40 transition-all">
              <AvatarImage src={post.author_avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                {authorInitial}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/profile/${post.author_username}`}
                className="text-sm font-semibold leading-none no-underline hover:text-primary transition-colors"
              >
                {authorName}
              </Link>
              <PostTypeIndicator type={post.post_type} />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-xs text-muted-foreground">
                @{post.author_username} ·{' '}
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </p>
              {isOwner && post.visibility === 'friends' && (
                <span className="flex items-center gap-0.5 text-[10px] text-blue-500 font-medium">
                  <Users className="h-3 w-3" />
                  Amigos
                </span>
              )}
              {isOwner && post.visibility === 'private' && (
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground font-medium">
                  <Lock className="h-3 w-3" />
                  Privado
                </span>
              )}
            </div>
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
            {/* Visibility picker */}
            <div className="relative inline-block">
              {(() => {
                const selected = VISIBILITY_OPTIONS.find((o) => o.value === editVisibility)!;
                const Icon = selected.icon;
                return (
                  <button
                    onClick={() => setShowEditVisibility(!showEditVisibility)}
                    className="flex items-center gap-1.5 rounded-lg border bg-muted/30 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {selected.label}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                );
              })()}
              {showEditVisibility && (
                <div className="absolute top-full left-0 mt-1 z-50 rounded-xl border bg-card shadow-card-hover min-w-[130px] py-1">
                  {VISIBILITY_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => { setEditVisibility(opt.value); setShowEditVisibility(false); }}
                        className={cn(
                          'flex w-full items-center gap-2 px-3 py-2 text-xs font-medium transition-colors',
                          editVisibility === opt.value
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
            <div className="flex gap-2">
              <Button size="sm" onClick={handleEdit} className="gap-1.5">
                <Send className="h-3.5 w-3.5" />
                Salvar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(post.content);
                  setEditVisibility(post.visibility);
                  setShowEditVisibility(false);
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <>
            {post.content && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                {post.content}
              </p>
            )}
            {/* Shared post embed */}
            {post.post_type === 'shared_post' && post.metadata?.shared_post_id && (
              <div className={cn('rounded-xl border bg-muted/20 p-3 space-y-2', post.content ? 'mt-3' : '')}>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={(post.metadata.shared_author_avatar_url as string) || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                      {((post.metadata.shared_author_full_name as string) || (post.metadata.shared_author_username as string) || '?')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Link
                    href={`/profile/${post.metadata.shared_author_username as string}`}
                    className="text-xs font-semibold hover:text-primary transition-colors no-underline"
                  >
                    {(post.metadata.shared_author_full_name as string) || (post.metadata.shared_author_username as string)}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    @{post.metadata.shared_author_username as string}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed whitespace-pre-wrap">
                  {(post.metadata.shared_content as string) || <span className="italic">Post sem texto</span>}
                </p>
              </div>
            )}
          </>
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

        {/* Media Gallery */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div
            className={cn(
              'mt-3 grid gap-1 rounded-xl overflow-hidden',
              post.media_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
            )}
          >
            {post.media_urls.map((url, i) => {
              const isVid = isVideoUrl(url);
              const isThirdOfThree = post.media_urls.length === 3 && i === 0;
              return (
                <div
                  key={i}
                  className={cn('relative aspect-square', isThirdOfThree && 'col-span-2 aspect-video')}
                >
                  {isVid ? (
                    <video
                      src={url}
                      controls
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => setLightboxUrl(url)}
                    />
                  )}
                </div>
              );
            })}
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

        <button
          onClick={() => setShowShareDialog(true)}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
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

      {/* Share Dialog */}
      {showShareDialog && (
        <ShareDialog
          post={post}
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
        />
      )}

      {/* Lightbox */}
      <Dialog open={!!lightboxUrl} onOpenChange={(open) => { if (!open) setLightboxUrl(null); }}>
        <DialogContent className="max-w-4xl p-1 bg-black border-0">
          {lightboxUrl && (
            <img
              src={lightboxUrl}
              alt=""
              className="w-full h-full object-contain max-h-[85vh]"
            />
          )}
        </DialogContent>
      </Dialog>
    </article>
  );
}
