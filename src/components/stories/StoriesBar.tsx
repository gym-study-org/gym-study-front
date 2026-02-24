'use client';

import { useEffect, useRef, useState } from 'react';
import { storiesApi } from '@/lib/api/stories.api';
import { UserStoriesGroup, StoryWithAuthor, StoryMetadata } from '@/types/stories.types';
import { STORY_FILTERS, StoryCreator } from './StoryCreator';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Plus, Eye, ChevronLeft, ChevronRight, X, Volume2, VolumeX } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export function StoriesBar() {
  const [groups, setGroups] = useState<UserStoriesGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [viewingGroup, setViewingGroup] = useState<UserStoriesGroup | null>(null);
  const [viewingIdx, setViewingIdx] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoViewerRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    storiesApi.getFeed()
      .then(setGroups)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreated = async (story: StoryWithAuthor) => {
    // Refresh feed to include new story
    const updated = await storiesApi.getFeed().catch(() => groups);
    setGroups(updated);
  };

  // Reset mute when switching stories
  useEffect(() => {
    if (videoViewerRef.current) {
      videoViewerRef.current.muted = true;
    }
    setIsMuted(true);
  }, [viewingIdx, viewingGroup?.user_id]);

  const toggleMute = () => {
    if (!videoViewerRef.current) return;
    videoViewerRef.current.muted = !videoViewerRef.current.muted;
    setIsMuted(videoViewerRef.current.muted);
  };

  const openStory = (group: UserStoriesGroup) => {
    setViewingGroup(group);
    setViewingIdx(0);
    setIsMuted(true);
    for (const story of group.stories) {
      if (!story.is_viewed_by_me) {
        storiesApi.viewStory(story.id).catch(() => {});
      }
    }
  };

  const nextStory = () => {
    if (!viewingGroup) return;
    if (viewingIdx < viewingGroup.stories.length - 1) {
      setViewingIdx(prev => prev + 1);
    } else {
      setViewingGroup(null);
    }
  };

  const prevStory = () => {
    if (viewingIdx > 0) {
      setViewingIdx(prev => prev - 1);
    }
  };

  if (loading) return null;

  const currentStory = viewingGroup?.stories[viewingIdx];
  const meta: StoryMetadata = (currentStory?.metadata as StoryMetadata) ?? {};
  const filterCss = STORY_FILTERS.find(f => f.key === meta.filter)?.css ?? 'none';

  return (
    <>
      {/* ── Stories horizontal bar ──────────────────────────────────────── */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {/* Create story button */}
        <button
          onClick={() => setShowCreate(true)}
          className="flex flex-col items-center gap-1 shrink-0"
        >
          <div className="h-14 w-14 rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center hover:border-primary transition-colors bg-primary/5">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          <span className="text-[10px] text-muted-foreground">Criar</span>
        </button>

        {/* User story groups */}
        {groups.map(group => (
          <button
            key={group.user_id}
            onClick={() => openStory(group)}
            className="flex flex-col items-center gap-1 shrink-0"
          >
            <div
              className={cn(
                'h-14 w-14 rounded-full overflow-hidden',
                group.has_unviewed
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                  : 'ring-2 ring-muted ring-offset-2 ring-offset-background'
              )}
            >
              {group.avatar_url ? (
                <img
                  src={group.avatar_url}
                  alt={group.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: group.stories[0]?.background_color || '#1a1a2e' }}
                >
                  {group.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground max-w-[56px] truncate">
              {group.username}
            </span>
          </button>
        ))}
      </div>

      {/* ── StoryCreator (Instagram-like editor) ───────────────────────── */}
      <StoryCreator
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreated}
      />

      {/* ── Story viewer fullscreen ─────────────────────────────────────── */}
      <Dialog open={!!viewingGroup} onOpenChange={(open) => { if (!open) setViewingGroup(null); }}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-black border-0 rounded-2xl [&>button]:text-white [&>button]:z-50">
          {currentStory && (
            <div
              className="relative flex flex-col"
              style={{ aspectRatio: '9/16' }}
            >
              {/* Background color (for text stories) */}
              <div
                className="absolute inset-0"
                style={{ backgroundColor: currentStory.background_color ?? '#1a1a2e' }}
              />

              {/* Media: image */}
              {currentStory.media_url && currentStory.content_type === 'image' && (
                <img
                  src={currentStory.media_url}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ filter: filterCss }}
                  draggable={false}
                />
              )}

              {/* Media: video */}
              {currentStory.media_url && currentStory.content_type === 'video' && (
                <video
                  ref={videoViewerRef}
                  key={currentStory.id}
                  src={currentStory.media_url}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ filter: filterCss }}
                  autoPlay
                  playsInline
                  loop
                  muted
                  onLoadedMetadata={(e) => {
                    const vid = e.currentTarget;
                    if (meta.trim_start) vid.currentTime = meta.trim_start;
                  }}
                  onTimeUpdate={(e) => {
                    if (meta.trim_end && e.currentTarget.currentTime >= meta.trim_end) {
                      e.currentTarget.currentTime = meta.trim_start ?? 0;
                    }
                  }}
                />
              )}

              {/* Text content (text-only or overlay) */}
              {!currentStory.media_url && currentStory.content && (
                <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
                  <p className="text-white text-xl font-semibold text-center break-words w-full"
                    style={{ filter: filterCss }}>
                    {currentStory.content}
                  </p>
                </div>
              )}

              {/* Text overlays from metadata */}
              {meta.text_overlays?.map(t => (
                <span
                  key={t.id}
                  className="absolute select-none pointer-events-none"
                  style={{
                    left: `${t.x}%`,
                    top: `${t.y}%`,
                    transform: 'translate(-50%, -50%)',
                    color: t.color,
                    fontSize: t.fontSize,
                    fontWeight: 'bold',
                    textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                    whiteSpace: 'nowrap',
                    zIndex: 10,
                  }}
                >
                  {t.text}
                </span>
              ))}

              {/* Sticker overlays from metadata */}
              {meta.stickers?.map(s => (
                <span
                  key={s.id}
                  className="absolute select-none pointer-events-none"
                  style={{
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: s.size,
                    lineHeight: 1,
                    zIndex: 10,
                  }}
                >
                  {s.emoji}
                </span>
              ))}

              {/* ── Overlay UI ───────────────────────────────────────────── */}

              {/* Progress bars */}
              <div className="absolute top-2 left-2 right-2 flex gap-1 z-20">
                {viewingGroup!.stories.map((_, i) => (
                  <div key={i} className="flex-1 h-0.5 rounded-full bg-white/30">
                    <div
                      className={cn(
                        'h-full rounded-full bg-white',
                        i < viewingIdx ? 'w-full' : i === viewingIdx ? 'w-full' : 'w-0'
                      )}
                    />
                  </div>
                ))}
              </div>

              {/* Header */}
              <div className="absolute top-0 left-0 right-0 pt-6 px-3 pb-3 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent z-20">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 ring-1 ring-white/30">
                    <AvatarImage src={currentStory.author_avatar_url || undefined} />
                    <AvatarFallback className="bg-white/20 text-white text-xs font-bold">
                      {currentStory.author_username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-white">{currentStory.author_username}</p>
                    <p className="text-[10px] text-white/70">
                      {new Date(currentStory.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/80 flex items-center gap-1">
                    <Eye className="h-3 w-3" /> {currentStory.views_count}
                  </span>
                  {/* Mute toggle — only shows for video stories */}
                  {currentStory.content_type === 'video' && (
                    <button
                      onClick={toggleMute}
                      className="text-white/80 hover:text-white transition-colors"
                      title={isMuted ? 'Ativar som' : 'Silenciar'}
                    >
                      {isMuted
                        ? <VolumeX className="h-5 w-5" />
                        : <Volume2 className="h-5 w-5" />
                      }
                    </button>
                  )}
                  <button
                    onClick={() => setViewingGroup(null)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <button
                onClick={prevStory}
                disabled={viewingIdx === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white z-20 disabled:opacity-30 transition-opacity"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextStory}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white z-20 transition-opacity"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
