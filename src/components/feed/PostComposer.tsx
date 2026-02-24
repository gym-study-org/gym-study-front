'use client';

import { useState, useRef, ElementType } from 'react';
import { Globe, Users, Lock, Send, Tag, ChevronDown, UserCircle, ImagePlus, Camera, X, Loader2 } from 'lucide-react';
import { useStore } from '@/store';
import { feedApi } from '@/lib/api/feed.api';
import { uploadApi } from '@/lib/api/upload.api';
import { PostWithAuthor, PostVisibility, PostAudience } from '@/types/feed.types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const VISIBILITY_OPTIONS: { value: PostVisibility; label: string; icon: ElementType }[] = [
  { value: 'public', label: 'Público', icon: Globe },
  { value: 'friends', label: 'Amigos', icon: Users },
  { value: 'private', label: 'Privado', icon: Lock },
];

const MAX_MEDIA = 4;

interface PostComposerProps {
  onPostCreated: (post: PostWithAuthor) => void;
  defaultAudience?: PostAudience;
  lockAudience?: boolean;
}

export function PostComposer({ onPostCreated, defaultAudience = 'global', lockAudience = false }: PostComposerProps) {
  const { user } = useStore();
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<PostVisibility>('public');
  const [audience, setAudience] = useState<PostAudience>(defaultAudience);
  const [tags, setTags] = useState('');
  const [showTags, setShowTags] = useState(false);
  const [showVisibility, setShowVisibility] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Media attachment state
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const selectedVisibility = VISIBILITY_OPTIONS.find((o) => o.value === visibility)!;
  const VisibilityIcon = selectedVisibility.icon;

  const handleExpand = () => {
    setExpanded(true);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = MAX_MEDIA - mediaFiles.length;
    const selected = files.slice(0, remaining);

    const previews = selected.map((f) => URL.createObjectURL(f));
    setMediaFiles((prev) => [...prev, ...selected]);
    setMediaPreviews((prev) => [...prev, ...previews]);

    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const removeMedia = (index: number) => {
    URL.revokeObjectURL(mediaPreviews[index]);
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && mediaFiles.length === 0) return;
    setIsSubmitting(true);
    try {
      // Upload all media files first
      let uploadedUrls: string[] = [];
      if (mediaFiles.length > 0) {
        const results = await Promise.all(mediaFiles.map((f) => uploadApi.uploadMedia(f)));
        uploadedUrls = results.map((r) => r.url);
      }

      const tagsArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const post = await feedApi.createPost({
        content: content.trim(),
        visibility,
        audience,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        media_urls: uploadedUrls.length > 0 ? uploadedUrls : undefined,
      });

      // Revoke blob URLs
      mediaPreviews.forEach((url) => URL.revokeObjectURL(url));

      onPostCreated(post);
      setContent('');
      setTags('');
      setShowTags(false);
      setExpanded(false);
      setMediaFiles([]);
      setMediaPreviews([]);
      toast.success('Post publicado!');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao publicar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const authorName = user?.full_name || user?.username || '?';
  const authorInitial = authorName[0].toUpperCase();

  const canSubmit = (content.trim().length > 0 || mediaFiles.length > 0) && !isSubmitting;

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

              {/* Media previews */}
              {mediaPreviews.length > 0 && (
                <div className={cn(
                  'grid gap-1 rounded-xl overflow-hidden',
                  mediaPreviews.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                )}>
                  {mediaPreviews.map((preview, i) => {
                    const isVideo = mediaFiles[i]?.type.startsWith('video/');
                    return (
                      <div key={i} className="relative group aspect-square">
                        {isVideo ? (
                          <video
                            src={preview}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <img
                            src={preview}
                            alt=""
                            className="w-full h-full object-cover rounded-lg"
                          />
                        )}
                        <button
                          onClick={() => removeMedia(i)}
                          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3.5 w-3.5 text-white" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

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

              {/* Audience toggle */}
              {!lockAudience && (
                <div className="flex items-center gap-1.5 rounded-lg border bg-muted/30 p-1">
                  <button
                    onClick={() => setAudience('global')}
                    className={cn(
                      'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
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
                      'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                      audience === 'personal'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <UserCircle className="h-3.5 w-3.5" />
                    Meu Perfil
                  </button>
                </div>
              )}

              {/* Toolbar */}
              <div className="flex items-center justify-between border-t pt-3">
                <div className="flex items-center gap-1">
                  {/* Inputs de mídia */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*,video/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  {/* Galeria */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={mediaFiles.length >= MAX_MEDIA}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
                      mediaFiles.length > 0
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      mediaFiles.length >= MAX_MEDIA && 'opacity-40 cursor-not-allowed'
                    )}
                    title={mediaFiles.length >= MAX_MEDIA ? `Máximo de ${MAX_MEDIA} arquivos` : 'Adicionar da galeria'}
                  >
                    <ImagePlus className="h-3.5 w-3.5" />
                    {mediaFiles.length > 0 ? `${mediaFiles.length}/${MAX_MEDIA}` : 'Mídia'}
                  </button>
                  {/* Câmera */}
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={mediaFiles.length >= MAX_MEDIA}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
                      'text-muted-foreground hover:bg-muted hover:text-foreground',
                      mediaFiles.length >= MAX_MEDIA && 'opacity-40 cursor-not-allowed'
                    )}
                    title="Tirar foto ou gravar vídeo"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>

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
                      mediaPreviews.forEach((url) => URL.revokeObjectURL(url));
                      setMediaFiles([]);
                      setMediaPreviews([]);
                    }}
                    className="text-xs h-8"
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="gap-1.5 h-8 text-xs"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    {isSubmitting
                      ? mediaFiles.length > 0 ? 'Enviando...' : 'Publicando...'
                      : 'Publicar'}
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
