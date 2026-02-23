'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import { friendshipsApi, Friend, FriendRequest, SearchedUser } from '@/lib/api/friendships.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Users, UserPlus, Search, Check, X, Clock, Trash2 } from 'lucide-react';
import { ProfilePreviewModal, UserAvatar } from '@/components/profile';

export default function FriendsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useStore();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const openProfile = (userId: string) => {
    setSelectedUserId(userId);
    setIsProfileModalOpen(true);
  };

  const closeProfile = () => {
    setIsProfileModalOpen(false);
    setSelectedUserId(null);
  };

  const handleFriendshipChange = () => {
    loadFriends();
    loadPendingRequests();
    if (searchQuery) handleSearch();
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadFriends();
    loadPendingRequests();
  }, [isAuthenticated, router]);

  const loadFriends = async () => {
    try {
      const data = await friendshipsApi.getFriends();
      setFriends(data);
    } catch (error) {
      console.error('Failed to load friends:', error);
    }
  };

  const loadPendingRequests = async () => {
    try {
      const data = await friendshipsApi.getPendingRequests();
      setPendingRequests(data);
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const data = await friendshipsApi.searchUsers(searchQuery);
      setSearchResults(data);
      setActiveTab('search');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao buscar usuários');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    try {
      await friendshipsApi.sendRequest(userId);
      toast.success('Pedido de amizade enviado!');
      handleSearch(); // Refresh search results
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao enviar pedido');
    }
  };

  const handleRespondRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      await friendshipsApi.respondToRequest(requestId, status);
      toast.success(status === 'accepted' ? 'Amizade aceita!' : 'Pedido rejeitado');
      loadPendingRequests();
      loadFriends();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao responder pedido');
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!confirm('Tem certeza que deseja remover este amigo?')) return;

    try {
      await friendshipsApi.removeFriend(friendId);
      toast.success('Amigo removido');
      loadFriends();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao remover amigo');
    }
  };

  if (!isAuthenticated || !user) return null;

  return (
    <div className="">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Amigos</h1>
            <p className="text-muted-foreground">Gerencie seus amigos e conexões</p>
          </div>
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            Voltar ao Dashboard
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                placeholder="Buscar usuários por nome ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 border-b pb-2">
          <Button
            variant={activeTab === 'friends' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('friends')}
          >
            <Users className="mr-2 h-4 w-4" />
            Amigos ({friends.length})
          </Button>
          <Button
            variant={activeTab === 'requests' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('requests')}
          >
            <Clock className="mr-2 h-4 w-4" />
            Pedidos ({pendingRequests.length})
          </Button>
          {searchResults.length > 0 && (
            <Button
              variant={activeTab === 'search' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('search')}
            >
              <Search className="mr-2 h-4 w-4" />
              Resultados ({searchResults.length})
            </Button>
          )}
        </div>

        {/* Friends List */}
        {activeTab === 'friends' && (
          <div className="space-y-3">
            {friends.length === 0 ? (
              <Card>
                <CardContent className="flex min-h-[150px] flex-col items-center justify-center">
                  <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">Você ainda não tem amigos.</p>
                  <p className="text-sm text-muted-foreground">Use a busca para encontrar pessoas!</p>
                </CardContent>
              </Card>
            ) : (
              friends.map((friend) => (
                <Card key={friend.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div
                      className="flex cursor-pointer items-center gap-4"
                      onClick={() => openProfile(friend.friend_id)}
                    >
                      <UserAvatar
                        src={friend.friend_avatar_url}
                        name={friend.friend_name}
                        size="lg"
                      />
                      <div>
                        <p className="font-semibold hover:text-primary">{friend.friend_name}</p>
                        <p className="text-sm text-muted-foreground">{friend.friend_email}</p>
                        <p className="text-sm text-blue-600">
                          {Number(friend.friend_total_study_hours).toFixed(1)}h estudadas
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFriend(friend.friend_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Pending Requests */}
        {activeTab === 'requests' && (
          <div className="space-y-3">
            {pendingRequests.length === 0 ? (
              <Card>
                <CardContent className="flex min-h-[150px] flex-col items-center justify-center">
                  <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum pedido de amizade pendente.</p>
                </CardContent>
              </Card>
            ) : (
              pendingRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div
                      className="flex cursor-pointer items-center gap-4"
                      onClick={() => openProfile(request.requester_id)}
                    >
                      <UserAvatar
                        src={request.requester_avatar_url}
                        name={request.requester_name}
                        size="lg"
                      />
                      <div>
                        <p className="font-semibold hover:text-primary">{request.requester_name}</p>
                        <p className="text-sm text-muted-foreground">{request.requester_email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleRespondRequest(request.id, 'accepted')}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Aceitar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRespondRequest(request.id, 'rejected')}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Rejeitar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Search Results */}
        {activeTab === 'search' && (
          <div className="space-y-3">
            {searchResults.length === 0 ? (
              <Card>
                <CardContent className="flex min-h-[150px] flex-col items-center justify-center">
                  <Search className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
                </CardContent>
              </Card>
            ) : (
              searchResults.map((searchedUser) => (
                <Card key={searchedUser.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div
                      className="flex cursor-pointer items-center gap-4"
                      onClick={() => openProfile(searchedUser.id)}
                    >
                      <UserAvatar
                        src={searchedUser.avatar_url}
                        name={searchedUser.full_name || searchedUser.username}
                        size="lg"
                      />
                      <div>
                        <p className="font-semibold hover:text-primary">{searchedUser.full_name || searchedUser.username}</p>
                        <p className="text-sm text-muted-foreground">@{searchedUser.username}</p>
                        <p className="text-sm text-blue-600">
                          {Number(searchedUser.total_study_hours).toFixed(1)}h estudadas
                        </p>
                      </div>
                    </div>
                    {searchedUser.friendship_status === 'accepted' ? (
                      <span className="text-sm text-green-600">Amigos</span>
                    ) : searchedUser.friendship_status === 'pending' ? (
                      <span className="text-sm text-yellow-600">
                        {searchedUser.request_direction === 'sent' ? 'Pedido enviado' : 'Pedido recebido'}
                      </span>
                    ) : (
                      <Button size="sm" onClick={() => handleSendRequest(searchedUser.id)}>
                        <UserPlus className="mr-1 h-4 w-4" />
                        Adicionar
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Profile Preview Modal */}
      <ProfilePreviewModal
        userId={selectedUserId}
        isOpen={isProfileModalOpen}
        onClose={closeProfile}
        onFriendshipChange={handleFriendshipChange}
      />
    </div>
  );
}
