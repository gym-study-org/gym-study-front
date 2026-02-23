'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import { challengesApi, Challenge, ChallengeType } from '@/lib/api/challenges.api';
import { friendshipsApi, Friend } from '@/lib/api/friendships.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Swords, Plus, Users, Trophy, Clock, Play, X } from 'lucide-react';

export default function ChallengesPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useStore();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [invitations, setInvitations] = useState<Challenge[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'invitations'>('active');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    challenge_type: 'hours' as ChallengeType,
    target_value: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    invited_friends: [] as string[],
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadChallenges();
    loadInvitations();
    loadFriends();
  }, [isAuthenticated, router]);

  const loadChallenges = async () => {
    try {
      const data = await challengesApi.getMyChallenges();
      setChallenges(data);
    } catch (error) {
      console.error('Failed to load challenges:', error);
    }
  };

  const loadInvitations = async () => {
    try {
      const data = await challengesApi.getPendingInvitations();
      setInvitations(data);
    } catch (error) {
      console.error('Failed to load invitations:', error);
    }
  };

  const loadFriends = async () => {
    try {
      const data = await friendshipsApi.getFriends();
      setFriends(data);
    } catch (error) {
      console.error('Failed to load friends:', error);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.target_value || !formData.end_date) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (formData.invited_friends.length === 0) {
      toast.error('Convide pelo menos um amigo para o desafio');
      return;
    }

    setIsLoading(true);
    try {
      await challengesApi.create({
        title: formData.title,
        description: formData.description || undefined,
        challenge_type: formData.challenge_type,
        target_value: parseFloat(formData.target_value),
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        invited_friends: formData.invited_friends,
      });

      toast.success('Desafio criado! Aguardando confirmação dos participantes.');
      setShowDialog(false);
      setFormData({
        title: '',
        description: '',
        challenge_type: 'hours',
        target_value: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        invited_friends: [],
      });
      loadChallenges();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao criar desafio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespondInvitation = async (challengeId: string, status: 'accepted' | 'rejected') => {
    try {
      await challengesApi.respondToInvitation(challengeId, status);
      toast.success(status === 'accepted' ? 'Você entrou no desafio!' : 'Convite recusado');
      loadInvitations();
      loadChallenges();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao responder');
    }
  };

  const handleStartChallenge = async (challengeId: string) => {
    try {
      await challengesApi.startChallenge(challengeId);
      toast.success('Desafio iniciado!');
      loadChallenges();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao iniciar');
    }
  };

  const toggleFriendSelection = (friendId: string) => {
    setFormData((prev) => ({
      ...prev,
      invited_friends: prev.invited_friends.includes(friendId)
        ? prev.invited_friends.filter((id) => id !== friendId)
        : [...prev.invited_friends, friendId],
    }));
  };

  const getChallengeTypeLabel = (type: ChallengeType) => {
    const labels = { hours: 'Horas', sessions: 'Sessões', streak: 'Streak', certifications: 'Certificações' };
    return labels[type];
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Aguardando' },
      active: { color: 'bg-green-100 text-green-800', label: 'Ativo' },
      completed: { color: 'bg-blue-100 text-blue-800', label: 'Finalizado' },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelado' },
    };
    const badge = badges[status] || badges.pending;
    return <span className={`rounded-full px-2 py-1 text-xs font-medium ${badge.color}`}>{badge.label}</span>;
  };

  if (!isAuthenticated || !user) return null;

  return (
    <div className="">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Desafios</h1>
            <p className="text-muted-foreground">Compete com seus amigos!</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Desafio
            </Button>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Voltar
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b pb-2">
          <Button
            variant={activeTab === 'active' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('active')}
          >
            <Swords className="mr-2 h-4 w-4" />
            Meus Desafios ({challenges.length})
          </Button>
          <Button
            variant={activeTab === 'invitations' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('invitations')}
          >
            <Clock className="mr-2 h-4 w-4" />
            Convites ({invitations.length})
          </Button>
        </div>

        {/* Challenges List */}
        {activeTab === 'active' && (
          <div className="space-y-4">
            {challenges.length === 0 ? (
              <Card>
                <CardContent className="flex min-h-[200px] flex-col items-center justify-center">
                  <Swords className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum desafio ainda.</p>
                  <Button className="mt-4" onClick={() => setShowDialog(true)}>
                    Criar Primeiro Desafio
                  </Button>
                </CardContent>
              </Card>
            ) : (
              challenges.map((challenge) => (
                <Card key={challenge.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {challenge.title}
                          {getStatusBadge(challenge.status)}
                        </CardTitle>
                        <CardDescription>
                          {getChallengeTypeLabel(challenge.challenge_type)} • Meta: {challenge.target_value}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {challenge.participants_count}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {challenge.description && (
                      <p className="text-sm text-muted-foreground">{challenge.description}</p>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Seu progresso</span>
                        <span className="font-medium">
                          {challenge.my_progress} / {challenge.target_value}
                        </span>
                      </div>
                      <Progress
                        value={(challenge.my_progress / challenge.target_value) * 100}
                        className="h-2"
                      />
                    </div>

                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>
                        Início: {new Date(challenge.start_date).toLocaleDateString('pt-BR')}
                      </span>
                      <span>
                        Fim: {new Date(challenge.end_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    {challenge.status === 'pending' && challenge.creator_id === user.id && (
                      <Button
                        className="w-full"
                        onClick={() => handleStartChallenge(challenge.id)}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Iniciar Desafio
                      </Button>
                    )}

                    {challenge.status === 'completed' && challenge.winner_id && (
                      <div className="flex items-center justify-center gap-2 rounded-lg bg-yellow-50 p-3 text-yellow-800">
                        <Trophy className="h-5 w-5" />
                        <span className="font-medium">
                          {challenge.winner_id === user.id ? 'Você venceu!' : 'Desafio finalizado'}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Invitations */}
        {activeTab === 'invitations' && (
          <div className="space-y-4">
            {invitations.length === 0 ? (
              <Card>
                <CardContent className="flex min-h-[200px] flex-col items-center justify-center">
                  <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum convite pendente.</p>
                </CardContent>
              </Card>
            ) : (
              invitations.map((challenge) => (
                <Card key={challenge.id}>
                  <CardHeader>
                    <CardTitle>{challenge.title}</CardTitle>
                    <CardDescription>
                      Criado por {challenge.creator_name} • {getChallengeTypeLabel(challenge.challenge_type)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">
                      Meta: <strong>{challenge.target_value}</strong> {getChallengeTypeLabel(challenge.challenge_type).toLowerCase()}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => handleRespondInvitation(challenge.id, 'accepted')}
                      >
                        Participar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleRespondInvitation(challenge.id, 'rejected')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Create Challenge Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Desafio</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  placeholder="Ex: Maratona de estudos"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  placeholder="Descrição do desafio"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <select
                    value={formData.challenge_type}
                    onChange={(e) => setFormData({ ...formData, challenge_type: e.target.value as ChallengeType })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="hours">Horas</option>
                    <option value="sessions">Sessões</option>
                    <option value="streak">Streak (dias)</option>
                    <option value="certifications">Certificações</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Meta *</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 50"
                    value={formData.target_value}
                    onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data de Início *</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data de Fim *</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Convidar Amigos *</Label>
                {friends.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Você precisa ter amigos para criar um desafio.
                  </p>
                ) : (
                  <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-2">
                    {friends.map((friend) => (
                      <label
                        key={friend.friend_id}
                        className="flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-secondary"
                      >
                        <input
                          type="checkbox"
                          checked={formData.invited_friends.includes(friend.friend_id)}
                          onChange={() => toggleFriendSelection(friend.friend_id)}
                          className="h-4 w-4"
                        />
                        <span>{friend.friend_name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)} disabled={isLoading}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={isLoading || friends.length === 0}>
                {isLoading ? 'Criando...' : 'Criar Desafio'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
