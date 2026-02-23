'use client';

import { useEffect, useState } from 'react';
import { storiesApi } from '@/lib/api/stories.api';
import { UserStoriesGroup, CreateStoryInput, STORY_BG_COLORS } from '@/types/stories.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, X, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function StoriesBar() {
  const [groups, setGroups] = useState<UserStoriesGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [viewingGroup, setViewingGroup] = useState<UserStoriesGroup | null>(null);
  const [viewingIdx, setViewingIdx] = useState(0);
  const [createContent, setCreateContent] = useState('');
  const [createBg, setCreateBg] = useState(STORY_BG_COLORS[0]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    storiesApi.getFeed()
      .then(setGroups)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!createContent.trim()) return;
    setCreating(true);
    try {
      await storiesApi.create({
        content_type: 'text',
        content: createContent.trim(),
        background_color: createBg,
      });
      toast.success('Story criado!');
      setShowCreate(false);
      setCreateContent('');
      const updated = await storiesApi.getFeed();
      setGroups(updated);
    } catch {
      toast.error('Erro ao criar story');
    } finally {
      setCreating(false);
    }
  };

  const openStory = async (group: UserStoriesGroup) => {
    setViewingGroup(group);
    setViewingIdx(0);
    // Mark as viewed
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

  return (
    <>
      {/* Stories horizontal bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {/* Create story button */}
        <button
          onClick={() => setShowCreate(true)}
          className="flex flex-col items-center gap-1 shrink-0"
        >
          <div className="h-14 w-14 rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center hover:border-primary transition-colors">
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
                'h-14 w-14 rounded-full flex items-center justify-center text-white font-bold text-sm',
                group.has_unviewed
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                  : 'ring-2 ring-muted ring-offset-2 ring-offset-background'
              )}
              style={{ backgroundColor: group.stories[0]?.background_color || '#1a1a2e' }}
            >
              {group.username.charAt(0).toUpperCase()}
            </div>
            <span className="text-[10px] text-muted-foreground max-w-[56px] truncate">
              {group.username}
            </span>
          </button>
        ))}
      </div>

      {/* Create story dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Story</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Preview */}
            <div
              className="rounded-lg p-6 min-h-[200px] flex items-center justify-center text-white text-center text-lg font-medium"
              style={{ backgroundColor: createBg }}
            >
              {createContent || 'Seu texto aqui...'}
            </div>
            <Input
              placeholder="O que você está estudando?"
              value={createContent}
              onChange={e => setCreateContent(e.target.value)}
              maxLength={500}
            />
            {/* Color picker */}
            <div className="flex gap-2">
              {STORY_BG_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setCreateBg(color)}
                  className={cn(
                    'h-8 w-8 rounded-full transition-transform',
                    createBg === color && 'ring-2 ring-primary ring-offset-2 scale-110'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <Button
              onClick={handleCreate}
              disabled={creating || !createContent.trim()}
              className="w-full"
            >
              {creating ? 'Publicando...' : 'Publicar Story'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Story viewer fullscreen dialog */}
      <Dialog open={!!viewingGroup} onOpenChange={(open) => { if (!open) setViewingGroup(null); }}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          {currentStory && (
            <div
              className="relative min-h-[400px] flex flex-col items-center justify-center p-8 text-white"
              style={{ backgroundColor: currentStory.background_color }}
            >
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/30 to-transparent">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                    {currentStory.author_username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{currentStory.author_username}</p>
                    <p className="text-[10px] opacity-75">
                      {new Date(currentStory.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs flex items-center gap-1">
                    <Eye className="h-3 w-3" /> {currentStory.views_count}
                  </span>
                  <button onClick={() => setViewingGroup(null)}>
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="absolute top-1 left-2 right-2 flex gap-1">
                {viewingGroup!.stories.map((_, i) => (
                  <div key={i} className="flex-1 h-0.5 rounded-full bg-white/30">
                    <div
                      className={cn(
                        'h-full rounded-full bg-white transition-all',
                        i < viewingIdx ? 'w-full' : i === viewingIdx ? 'w-full' : 'w-0'
                      )}
                    />
                  </div>
                ))}
              </div>

              {/* Content */}
              <p className="text-xl font-medium text-center">{currentStory.content}</p>

              {/* Navigation */}
              <button
                onClick={prevStory}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/20 hover:bg-black/40"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextStory}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/20 hover:bg-black/40"
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
