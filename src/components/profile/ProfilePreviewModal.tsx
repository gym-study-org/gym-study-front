'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserAvatar } from './UserAvatar';
import { usersApi, UserProfile } from '@/lib/api/users.api';
import { friendshipsApi } from '@/lib/api/friendships.api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Award,
  Calendar,
  Clock,
  Flame,
  Loader2,
  Trophy,
  UserPlus,
  UserMinus,
  ExternalLink,
} from 'lucide-react';

interface ProfilePreviewModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onFriendshipChange?: () => void;
}

export function ProfilePreviewModal({
  userId,
  isOpen,
  onClose,
  onFriendshipChange,
}: ProfilePreviewModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      loadProfile();
    } else {
      setProfile(null);
    }
  }, [isOpen, userId]);

  const loadProfile = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const data = await usersApi.getPublicProfile(userId);
      setProfile(data);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao carregar perfil');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!userId) return;

    setIsActionLoading(true);
    try {
      await friendshipsApi.sendRequest(userId);
      toast.success('Pedido de amizade enviado!');
      await loadProfile();
      onFriendshipChange?.();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao enviar pedido');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!userId || !confirm('Tem certeza que deseja remover este amigo?')) return;

    setIsActionLoading(true);
    try {
      await friendshipsApi.removeFriend(userId);
      toast.success('Amigo removido');
      await loadProfile();
      onFriendshipChange?.();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao remover amigo');
    } finally {
      setIsActionLoading(false);
    }
  };

  const renderFriendshipButton = () => {
    if (!profile) return null;

    if (profile.friendship_status === 'accepted') {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={handleRemoveFriend}
          disabled={isActionLoading}
        >
          {isActionLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <UserMinus className="mr-2 h-4 w-4" />
          )}
          Remover Amigo
        </Button>
      );
    }

    if (profile.friendship_status === 'pending') {
      return (
        <Button variant="outline" size="sm" disabled>
          <Clock className="mr-2 h-4 w-4" />
          Pedido Pendente
        </Button>
      );
    }

    return (
      <Button size="sm" onClick={handleSendFriendRequest} disabled={isActionLoading}>
        {isActionLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <UserPlus className="mr-2 h-4 w-4" />
        )}
        Adicionar Amigo
      </Button>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : profile ? (
          <>
            <DialogHeader className="items-center text-center">
              <UserAvatar
                src={profile.avatar_url}
                name={profile.full_name || profile.username}
                size="xl"
                className="mb-2"
              />
              <DialogTitle className="text-xl">
                {profile.full_name || profile.username}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
            </DialogHeader>

            {profile.bio && (
              <p className="text-center text-sm text-muted-foreground">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted/50 p-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
                  <Clock className="h-5 w-5" />
                  {profile.total_study_hours.toFixed(0)}
                </div>
                <p className="text-xs text-muted-foreground">Horas Estudadas</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-orange-500">
                  <Flame className="h-5 w-5" />
                  {profile.current_streak}
                </div>
                <p className="text-xs text-muted-foreground">Streak Atual</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-yellow-500">
                  <Trophy className="h-5 w-5" />
                  {profile.longest_streak}
                </div>
                <p className="text-xs text-muted-foreground">Maior Streak</p>
              </div>
            </div>

            {/* Certifications */}
            {profile.certifications.length > 0 && (
              <div className="space-y-2">
                <h4 className="flex items-center gap-2 text-sm font-semibold">
                  <Award className="h-4 w-4" />
                  Certificações ({profile.certifications.length})
                </h4>
                <div className="space-y-2">
                  {profile.certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="flex items-center justify-between rounded-md border bg-card p-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">{cert.name}</p>
                        {cert.provider && (
                          <p className="text-xs text-muted-foreground">{cert.provider}</p>
                        )}
                      </div>
                      {cert.credential_url && (
                        <a
                          href={cert.credential_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Member since */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Membro desde{' '}
              {format(new Date(profile.member_since), "MMMM 'de' yyyy", { locale: ptBR })}
            </div>

            {/* Actions */}
            <div className="flex justify-center">{renderFriendshipButton()}</div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
