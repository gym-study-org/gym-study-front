'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/store';
import { usersApi, UserProfile } from '@/lib/api/users.api';
import { feedApi } from '@/lib/api/feed.api';
import { badgesApi, UserBadgesResponse, TIER_COLORS } from '@/lib/api/badges.api';
import { friendshipsApi } from '@/lib/api/friendships.api';
import { PostCard } from '@/components/feed/PostCard';
import { PostComposer } from '@/components/feed/PostComposer';
import { ProfileEditModal } from '@/components/profile/ProfileEditModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PostWithAuthor } from '@/types/feed.types';
import { toast } from 'sonner';
import {
  Clock,
  Flame,
  BookOpen,
  UserPlus,
  UserMinus,
  Pencil,
  ArrowLeft,
  Trophy,
  Calendar,
  Globe,
  UserCircle,
  MessageSquare,
} from 'lucide-react';


export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const router = useRouter();
  const { user: currentUser } = useStore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [badges, setBadges] = useState<UserBadgesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [friendshipLoading, setFriendshipLoading] = useState(false);

  // "Pensamentos" tabs state
  const [pensamentosTab, setPensamentosTab] = useState<'personal' | 'global' | 'all'>('personal');

  const [personalPosts, setPersonalPosts] = useState<PostWithAuthor[]>([]);
  const [personalCursor, setPersonalCursor] = useState<string | null>(null);
  const [personalHasMore, setPersonalHasMore] = useState(false);
  const [isLoadingPersonal, setIsLoadingPersonal] = useState(false);

  const [globalPosts, setGlobalPosts] = useState<PostWithAuthor[]>([]);
  const [globalCursor, setGlobalCursor] = useState<string | null>(null);
  const [globalHasMore, setGlobalHasMore] = useState(false);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);

  const [allPosts, setAllPosts] = useState<PostWithAuthor[]>([]);
  const [allCursor, setAllCursor] = useState<string | null>(null);
  const [allHasMore, setAllHasMore] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await usersApi.getProfileByUsername(username);
      setProfile(data);

      // Load badges + all audience feeds in parallel
      const [badgesData, personalData, globalData, allData] = await Promise.all([
        badgesApi.getUserBadges(data.id),
        feedApi.getUserFeed(data.id, 10, undefined, 'personal'),
        feedApi.getUserFeed(data.id, 10, undefined, 'global'),
        feedApi.getUserFeed(data.id, 10, undefined),
      ]);

      setBadges(badgesData);
      setPersonalPosts(personalData.posts);
      setPersonalHasMore(personalData.has_more);
      setPersonalCursor(personalData.next_cursor);
      setGlobalPosts(globalData.posts);
      setGlobalHasMore(globalData.has_more);
      setGlobalCursor(globalData.next_cursor);
      setAllPosts(allData.posts);
      setAllHasMore(allData.has_more);
      setAllCursor(allData.next_cursor);
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Usuário não encontrado');
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [username, router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const loadMorePersonal = async () => {
    if (!profile || isLoadingPersonal || !personalHasMore) return;
    setIsLoadingPersonal(true);
    try {
      const data = await feedApi.getUserFeed(profile.id, 10, personalCursor ?? undefined, 'personal');
      setPersonalPosts((prev) => [...prev, ...data.posts]);
      setPersonalHasMore(data.has_more);
      setPersonalCursor(data.next_cursor);
    } finally {
      setIsLoadingPersonal(false);
    }
  };

  const loadMoreGlobal = async () => {
    if (!profile || isLoadingGlobal || !globalHasMore) return;
    setIsLoadingGlobal(true);
    try {
      const data = await feedApi.getUserFeed(profile.id, 10, globalCursor ?? undefined, 'global');
      setGlobalPosts((prev) => [...prev, ...data.posts]);
      setGlobalHasMore(data.has_more);
      setGlobalCursor(data.next_cursor);
    } finally {
      setIsLoadingGlobal(false);
    }
  };

  const loadMoreAll = async () => {
    if (!profile || isLoadingAll || !allHasMore) return;
    setIsLoadingAll(true);
    try {
      const data = await feedApi.getUserFeed(profile.id, 10, allCursor ?? undefined);
      setAllPosts((prev) => [...prev, ...data.posts]);
      setAllHasMore(data.has_more);
      setAllCursor(data.next_cursor);
    } finally {
      setIsLoadingAll(false);
    }
  };

  const handlePersonalPostCreated = (post: PostWithAuthor) => {
    setPersonalPosts((prev) => [post, ...prev]);
    setAllPosts((prev) => [post, ...prev]);
  };

  const handleGlobalPostCreated = (post: PostWithAuthor) => {
    setGlobalPosts((prev) => [post, ...prev]);
    setAllPosts((prev) => [post, ...prev]);
  };

  const handleAllPostCreated = (post: PostWithAuthor) => {
    setAllPosts((prev) => [post, ...prev]);
    if (post.audience === 'personal') {
      setPersonalPosts((prev) => [post, ...prev]);
    } else {
      setGlobalPosts((prev) => [post, ...prev]);
    }
  };

  const handleAddFriend = async () => {
    if (!profile) return;
    setFriendshipLoading(true);
    try {
      await friendshipsApi.sendRequest(profile.id);
      setProfile((p) => p ? { ...p, friendship_status: 'pending' } : p);
      toast.success('Pedido de amizade enviado!');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Erro ao enviar pedido');
    } finally {
      setFriendshipLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!profile) return;
    if (!confirm('Tem certeza que deseja remover este amigo?')) return;
    setFriendshipLoading(true);
    try {
      await friendshipsApi.removeFriend(profile.id);
      setProfile((p) => p ? { ...p, friendship_status: 'none', is_friend: false } : p);
      toast.success('Amigo removido');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Erro ao remover amigo');
    } finally {
      setFriendshipLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground text-sm">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const displayName = profile.full_name || profile.username;
  const initials = displayName.slice(0, 2).toUpperCase();
  const memberYear = new Date(profile.member_since).getFullYear();

  // Badges desbloqueados (nível > 0)
  const unlockedBadges = badges?.badges.filter((b) => b.current_level > 0) ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-0 pb-10">
      {/* Back button */}
      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
      </div>

      {/* ── HEADER CARD ── */}
      <div className="rounded-2xl border-2 border-border bg-card overflow-hidden shadow-card">
        {/* Cover gradient */}
        <div className="h-28 bg-gradient-to-br from-primary/30 via-primary/10 to-background" />

        {/* Avatar + info */}
        <div className="px-5 pb-5">
          <div className="flex items-end justify-between -mt-12 mb-4">
            <Avatar className="h-24 w-24 ring-4 ring-card border-2 border-primary/30">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-white text-2xl font-black">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Action button */}
            <div className="mt-14">
              {isOwnProfile ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Pencil className="h-4 w-4" />
                  Editar Perfil
                </Button>
              ) : profile.friendship_status === 'accepted' ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5"
                  onClick={handleRemoveFriend}
                  disabled={friendshipLoading}
                >
                  <UserMinus className="h-4 w-4" />
                  Remover Amigo
                </Button>
              ) : profile.friendship_status === 'pending' ? (
                <Button variant="outline" size="sm" disabled className="gap-1.5">
                  <Clock className="h-4 w-4" />
                  Pedido Enviado
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={handleAddFriend}
                  disabled={friendshipLoading}
                >
                  <UserPlus className="h-4 w-4" />
                  Adicionar Amigo
                </Button>
              )}
            </div>
          </div>

          {/* Name + username */}
          <h1 className="text-xl font-black leading-tight">{displayName}</h1>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>

          {/* Meta */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Membro desde {memberYear}
            </span>
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-3 gap-3 mt-3">
        <div className="rounded-2xl border-2 border-border bg-card p-4 text-center shadow-card">
          <BookOpen className="h-5 w-5 mx-auto mb-1 text-primary" />
          <p className="text-2xl font-black text-primary">
            {Number(profile.total_study_hours).toFixed(0)}h
          </p>
          <p className="text-xs text-muted-foreground">Estudadas</p>
        </div>
        <div className="rounded-2xl border-2 border-border bg-card p-4 text-center shadow-card">
          <Flame className="h-5 w-5 mx-auto mb-1 text-orange-500" />
          <p className="text-2xl font-black text-orange-500">{profile.current_streak}</p>
          <p className="text-xs text-muted-foreground">Dias seguidos</p>
        </div>
        <div className="rounded-2xl border-2 border-border bg-card p-4 text-center shadow-card">
          <Trophy className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
          <p className="text-2xl font-black text-yellow-500">{profile.longest_streak}</p>
          <p className="text-xs text-muted-foreground">Recorde</p>
        </div>
      </div>

      {/* ── SOBRE MIM ── */}
      <div className="rounded-2xl border-2 border-border bg-card p-5 shadow-card mt-3">
        <h2 className="text-base font-bold mb-2">Sobre mim</h2>
        {profile.bio ? (
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {profile.bio}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            {isOwnProfile
              ? 'Você ainda não tem uma bio. Clique em "Editar Perfil" para adicionar!'
              : 'Este usuário ainda não tem uma bio.'}
          </p>
        )}
      </div>

      {/* ── BADGES & SKILLS ── */}
      {unlockedBadges.length > 0 && (
        <div className="rounded-2xl border-2 border-border bg-card p-5 shadow-card mt-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold">Badges & Skills</h2>
            {isOwnProfile && (
              <Link
                href="/badges"
                className="text-xs text-primary hover:underline no-underline"
              >
                Ver todos
              </Link>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {unlockedBadges.slice(0, 12).map((b) => {
              const tier = b.current_level_info?.tier ?? 'bronze';
              const color = TIER_COLORS[tier];
              return (
                <div
                  key={b.id}
                  className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
                  style={{ borderColor: color + '60', color }}
                  title={`${b.badge.name} — Nível ${b.current_level}`}
                >
                  <span>{b.badge.icon}</span>
                  <span>{b.badge.name}</span>
                  <span className="opacity-60">Lv.{b.current_level}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── CERTIFICAÇÕES ── */}
      {profile.certifications.length > 0 && (
        <div className="rounded-2xl border-2 border-border bg-card p-5 shadow-card mt-3">
          <h2 className="text-base font-bold mb-3">Certificações</h2>
          <div className="space-y-2">
            {profile.certifications.map((cert) => (
              <div key={cert.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{cert.name}</p>
                  {cert.provider && (
                    <p className="text-xs text-muted-foreground">{cert.provider}</p>
                  )}
                </div>
                {cert.credential_url && (
                  <a
                    href={cert.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    Ver credencial
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PENSAMENTOS ── */}
      <div className="mt-3 rounded-2xl border-2 border-border bg-card shadow-card overflow-hidden">
        {/* Header + Mini stats */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold">Pensamentos</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border bg-muted/30 p-3 text-center">
              <p className="text-xl font-black text-primary">
                {globalHasMore ? `${globalPosts.length}+` : globalPosts.length}
              </p>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                <Globe className="h-3 w-3" />
                Globais
              </p>
            </div>
            <div className="rounded-xl border bg-muted/30 p-3 text-center">
              <p className="text-xl font-black text-primary">
                {personalHasMore ? `${personalPosts.length}+` : personalPosts.length}
              </p>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                <UserCircle className="h-3 w-3" />
                Pessoal
              </p>
            </div>
            <div className="rounded-xl border bg-muted/30 p-3 text-center">
              <p className="text-xl font-black text-primary">
                {allHasMore ? `${allPosts.length}+` : allPosts.length}
              </p>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                Total
              </p>
            </div>
          </div>
        </div>

        {/* Tab selector */}
        <div className="flex border-t">
          <button
            onClick={() => setPensamentosTab('personal')}
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
              pensamentosTab === 'personal'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserCircle className="h-4 w-4" />
            Pessoal
          </button>
          <button
            onClick={() => setPensamentosTab('global')}
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
              pensamentosTab === 'global'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Globe className="h-4 w-4" />
            Globais
          </button>
          <button
            onClick={() => setPensamentosTab('all')}
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
              pensamentosTab === 'all'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Todos
          </button>
        </div>

        {/* Tab content */}
        <div className="px-4 py-4 space-y-3">
          {/* PostComposer embedded for own profile */}
          {isOwnProfile && pensamentosTab === 'personal' && (
            <PostComposer
              onPostCreated={handlePersonalPostCreated}
              defaultAudience="personal"
              lockAudience
            />
          )}
          {isOwnProfile && pensamentosTab === 'global' && (
            <PostComposer
              onPostCreated={handleGlobalPostCreated}
              defaultAudience="global"
              lockAudience
            />
          )}
          {isOwnProfile && pensamentosTab === 'all' && (
            <PostComposer
              onPostCreated={handleAllPostCreated}
              defaultAudience="global"
            />
          )}

          {/* Personal posts */}
          {pensamentosTab === 'personal' && (
            <>
              {personalPosts.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    {isOwnProfile
                      ? 'Nenhum pensamento ainda. Compartilhe algo só para o seu perfil!'
                      : 'Nenhum post pessoal ainda.'}
                  </p>
                </div>
              ) : (
                personalPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onPostUpdated={(updated) =>
                      setPersonalPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
                    }
                    onPostDeleted={(id) => setPersonalPosts((prev) => prev.filter((p) => p.id !== id))}
                  />
                ))
              )}
              {personalHasMore && (
                <div className="flex justify-center pt-2">
                  <Button variant="outline" onClick={loadMorePersonal} disabled={isLoadingPersonal} className="rounded-xl">
                    {isLoadingPersonal ? 'Carregando...' : 'Carregar mais'}
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Global posts */}
          {pensamentosTab === 'global' && (
            <>
              {globalPosts.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    {isOwnProfile
                      ? 'Nenhum post no feed global ainda.'
                      : 'Nenhum post global ainda.'}
                  </p>
                </div>
              ) : (
                globalPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onPostUpdated={(updated) =>
                      setGlobalPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
                    }
                    onPostDeleted={(id) => setGlobalPosts((prev) => prev.filter((p) => p.id !== id))}
                  />
                ))
              )}
              {globalHasMore && (
                <div className="flex justify-center pt-2">
                  <Button variant="outline" onClick={loadMoreGlobal} disabled={isLoadingGlobal} className="rounded-xl">
                    {isLoadingGlobal ? 'Carregando...' : 'Carregar mais'}
                  </Button>
                </div>
              )}
            </>
          )}

          {/* All posts */}
          {pensamentosTab === 'all' && (
            <>
              {allPosts.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    {isOwnProfile
                      ? 'Nenhum post ainda. Compartilhe algo!'
                      : 'Nenhum post ainda.'}
                  </p>
                </div>
              ) : (
                allPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onPostUpdated={(updated) =>
                      setAllPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
                    }
                    onPostDeleted={(id) => setAllPosts((prev) => prev.filter((p) => p.id !== id))}
                  />
                ))
              )}
              {allHasMore && (
                <div className="flex justify-center pt-2">
                  <Button variant="outline" onClick={loadMoreAll} disabled={isLoadingAll} className="rounded-xl">
                    {isLoadingAll ? 'Carregando...' : 'Carregar mais'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit modal (only for own profile) */}
      {isOwnProfile && (
        <ProfileEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            loadProfile(); // refresh after edit
          }}
        />
      )}
    </div>
  );
}
