'use client';

import { useEffect, useState } from 'react';
import { groupsApi } from '@/lib/api/groups.api';
import { StudyGroup, CreateGroupInput } from '@/types/groups.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Users, Plus, Globe, Lock, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function GroupsPage() {
  const [myGroups, setMyGroups] = useState<StudyGroup[]>([]);
  const [publicGroups, setPublicGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateGroupInput>({ name: '', description: '', subject: '', is_public: true });
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      groupsApi.list('my'),
      groupsApi.list('public'),
    ])
      .then(([my, pub]) => {
        setMyGroups(my.groups);
        setPublicGroups(pub.groups);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const group = await groupsApi.create(form);
      toast.success('Grupo criado!');
      setShowCreate(false);
      setForm({ name: '', description: '', subject: '', is_public: true });
      setMyGroups(prev => [group, ...prev]);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Erro ao criar grupo');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (groupId: string) => {
    try {
      await groupsApi.join(groupId);
      toast.success('Você entrou no grupo!');
      const [my, pub] = await Promise.all([groupsApi.list('my'), groupsApi.list('public')]);
      setMyGroups(my.groups);
      setPublicGroups(pub.groups);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Erro ao entrar no grupo');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const GroupCard = ({ group, showJoin = false }: { group: StudyGroup; showJoin?: boolean }) => (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={() => router.push(`/groups/${group.id}`)}
    >
      <CardContent className="flex items-start gap-3 pt-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shrink-0">
          <Users className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{group.name}</p>
            {group.is_public ? (
              <Globe className="h-3 w-3 text-muted-foreground shrink-0" />
            ) : (
              <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
            )}
          </div>
          {group.subject && (
            <Badge variant="secondary" className="text-xs mt-1">{group.subject}</Badge>
          )}
          {group.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{group.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" /> {group.members_count}/{group.max_members}
            </span>
            {group.my_role && (
              <Badge variant="outline" className="text-xs gap-1">
                {group.my_role === 'owner' && <Crown className="h-3 w-3" />}
                {group.my_role}
              </Badge>
            )}
          </div>
        </div>
        {showJoin && !group.my_role && (
          <Button
            size="sm"
            onClick={(e) => { e.stopPropagation(); handleJoin(group.id); }}
          >
            Entrar
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">Grupos de Estudo</h1>
            <p className="text-muted-foreground">Estude junto com outros membros</p>
          </div>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Criar Grupo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Grupo de Estudo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <Input
                  placeholder="Nome do grupo"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  placeholder="Assunto (ex: JavaScript, Python)"
                  value={form.subject || ''}
                  onChange={e => setForm(prev => ({ ...prev, subject: e.target.value }))}
                />
                <Input
                  placeholder="Descrição (opcional)"
                  value={form.description || ''}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={form.is_public}
                    onChange={e => setForm(prev => ({ ...prev, is_public: e.target.checked }))}
                  />
                  <label htmlFor="is_public" className="text-sm">Grupo público</label>
                </div>
                <Button onClick={handleCreate} disabled={creating || !form.name.trim()} className="w-full">
                  {creating ? 'Criando...' : 'Criar Grupo'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="my">Meus Grupos ({myGroups.length})</TabsTrigger>
            <TabsTrigger value="public">Explorar</TabsTrigger>
          </TabsList>

          <TabsContent value="my">
            {myGroups.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Você não participa de nenhum grupo ainda.</p>
                  <p className="text-sm mt-1">Crie um ou explore grupos públicos!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {myGroups.map(group => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="public">
            {publicGroups.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12 text-muted-foreground">
                  <p>Nenhum grupo público encontrado.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {publicGroups.map(group => (
                  <GroupCard key={group.id} group={group} showJoin />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
