'use client';

import { useEffect, useState, useCallback } from 'react';
import { PostWithAuthor } from '@/types/feed.types';
import { feedApi } from '@/lib/api/feed.api';
import { PostComposer } from '@/components/feed/PostComposer';
import { PostCard } from '@/components/feed/PostCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Compass } from 'lucide-react';
import { toast } from 'sonner';
import { StoriesBar } from '@/components/stories/StoriesBar';

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [explorePosts, setExplorePosts] = useState<PostWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [exploreCursor, setExploreCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [exploreHasMore, setExploreHasMore] = useState(true);

  const LIMIT = 10;

  const loadFeed = useCallback(async (loadMore = false) => {
    if (loadMore) setIsLoadingMore(true);
    else setIsLoading(true);

    try {
      const data = await feedApi.getFeed({
        limit: LIMIT,
        cursor: loadMore && cursor ? cursor : undefined,
      });

      if (loadMore) {
        setPosts((prev) => [...prev, ...data.posts]);
      } else {
        setPosts(data.posts);
      }

      setCursor(data.next_cursor);
      setHasMore(data.has_more);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao carregar feed');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [cursor]);

  const loadExplore = useCallback(async (loadMore = false) => {
    if (loadMore) setIsLoadingMore(true);
    else setIsLoading(true);

    try {
      const data = await feedApi.getExploreFeed({
        limit: LIMIT,
        cursor: loadMore && exploreCursor ? exploreCursor : undefined,
      });

      if (loadMore) {
        setExplorePosts((prev) => [...prev, ...data.posts]);
      } else {
        setExplorePosts(data.posts);
      }

      setExploreCursor(data.next_cursor);
      setExploreHasMore(data.has_more);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao carregar explorar');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [exploreCursor]);

  useEffect(() => {
    loadFeed();
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'explore' && explorePosts.length === 0) {
      loadExplore();
    }
  };

  const handlePostCreated = (post: PostWithAuthor) => {
    setPosts((prev) => [post, ...prev]);
  };

  const handlePostUpdated = (updated: PostWithAuthor) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const currentPosts = activeTab === 'feed' ? posts : explorePosts;
  const currentHasMore = activeTab === 'feed' ? hasMore : exploreHasMore;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h2 className="text-lg font-bold">Feed</h2>

      <StoriesBar />

        <PostComposer onPostCreated={handlePostCreated} />

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="w-full">
            <TabsTrigger value="feed" className="flex-1 gap-2">
              <MessageSquare className="h-4 w-4" />
              Meu Feed
            </TabsTrigger>
            <TabsTrigger value="explore" className="flex-1 gap-2">
              <Compass className="h-4 w-4" />
              Explorar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-4 space-y-4">
            {isLoading ? (
              <FeedSkeleton />
            ) : posts.length === 0 ? (
              <EmptyFeed message="Nenhum post ainda. Seja o primeiro a publicar!" />
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostUpdated={handlePostUpdated}
                  onPostDeleted={handlePostDeleted}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="explore" className="mt-4 space-y-4">
            {isLoading ? (
              <FeedSkeleton />
            ) : explorePosts.length === 0 ? (
              <EmptyFeed message="Nenhum post público encontrado." />
            ) : (
              explorePosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            )}
          </TabsContent>
        </Tabs>

        {!isLoading && currentPosts.length > 0 && currentHasMore && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => activeTab === 'feed' ? loadFeed(true) : loadExplore(true)}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? 'Carregando...' : 'Carregar mais'}
            </Button>
          </div>
        )}
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border p-6 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-16 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyFeed({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
      <MessageSquare className="mb-3 h-12 w-12 text-muted-foreground/50" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
