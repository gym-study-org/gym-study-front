'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Heart, Reply, Send, Trash2 } from 'lucide-react';
import { CommentWithAuthor } from '@/types/feed.types';
import { feedApi } from '@/lib/api/feed.api';
import { useStore } from '@/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CommentSectionProps {
  postId: string;
  comments: CommentWithAuthor[];
  onCommentAdded: (comment: CommentWithAuthor) => void;
  onCommentDeleted: (commentId: string) => void;
}

export function CommentSection({ postId, comments, onCommentAdded, onCommentDeleted }: CommentSectionProps) {
  const { user } = useStore();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async (parentId?: string) => {
    const content = parentId ? replyContent : newComment;
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const comment = await feedApi.addComment(postId, {
        content: content.trim(),
        parent_id: parentId,
      });
      onCommentAdded(comment);
      if (parentId) {
        setReplyContent('');
        setReplyingTo(null);
      } else {
        setNewComment('');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao comentar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await feedApi.deleteComment(postId, commentId);
      onCommentDeleted(commentId);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao deletar comentário');
    }
  };

  const handleToggleLike = async (commentId: string, index: number, isReply?: boolean) => {
    try {
      await feedApi.toggleCommentLike(postId, commentId);
    } catch {
      // Silent fail for like toggle
    }
  };

  const renderComment = (comment: CommentWithAuthor, isReply = false) => (
    <div key={comment.id} className={cn('flex gap-3', isReply && 'ml-10')}>
      <Avatar className="h-7 w-7 shrink-0">
        <AvatarImage src={comment.author_avatar_url || undefined} />
        <AvatarFallback className="text-[10px]">
          {comment.author_username[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="rounded-lg bg-muted/50 px-3 py-2">
          <p className="text-xs font-semibold">@{comment.author_username}</p>
          <p className="text-sm">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            {formatDistanceToNow(new Date(comment.created_at), {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>
          <button
            className="flex items-center gap-1 hover:text-red-500"
            onClick={() => handleToggleLike(comment.id, 0, isReply)}
          >
            <Heart className={cn('h-3 w-3', comment.is_liked_by_me && 'fill-red-500 text-red-500')} />
            {comment.likes_count > 0 && comment.likes_count}
          </button>
          {!isReply && (
            <button
              className="flex items-center gap-1 hover:text-primary"
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            >
              <Reply className="h-3 w-3" />
              Responder
            </button>
          )}
          {user?.id === comment.user_id && (
            <button
              className="flex items-center gap-1 hover:text-red-500"
              onClick={() => handleDeleteComment(comment.id)}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Reply input */}
        {replyingTo === comment.id && (
          <div className="mt-2 flex gap-2">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Escreva uma resposta..."
              className="min-h-[60px] text-sm"
            />
            <Button
              size="icon"
              onClick={() => handleSubmitComment(comment.id)}
              disabled={!replyContent.trim() || isSubmitting}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 space-y-3">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 border-t pt-4">
      {/* Existing comments */}
      <div className="space-y-3">
        {comments.map((comment) => renderComment(comment))}
      </div>

      {/* New comment input */}
      <div className="flex gap-2">
        <Avatar className="h-7 w-7 shrink-0">
          <AvatarImage src={user?.avatar_url || undefined} />
          <AvatarFallback className="text-[10px]">
            {(user?.username || '?')[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-1 gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escreva um comentário..."
            className="min-h-[60px] text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmitComment();
              }
            }}
          />
          <Button
            size="icon"
            onClick={() => handleSubmitComment()}
            disabled={!newComment.trim() || isSubmitting}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
