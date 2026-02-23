'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { groupsApi } from '@/lib/api/groups.api';
import { StudyGroup, StudyGroupMessage, StudyGroupMember } from '@/types/groups.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Send, Crown, Shield, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.id as string;
  const router = useRouter();

  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [messages, setMessages] = useState<StudyGroupMessage[]>([]);
  const [members, setMembers] = useState<StudyGroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(async () => {
    try {
      const [g, m, mem] = await Promise.all([
        groupsApi.get(groupId),
        groupsApi.getMessages(groupId),
        groupsApi.getMembers(groupId),
      ]);
      setGroup(g);
      setMessages(m.messages.reverse());
      setMembers(mem);
    } catch {
      toast.error('Erro ao carregar grupo');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for WebSocket group messages
  useEffect(() => {
    const handleGroupMessage = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.message?.group_id === groupId) {
        setMessages(prev => [...prev, detail.message]);
      }
    };

    window.addEventListener('group:message', handleGroupMessage);
    return () => window.removeEventListener('group:message', handleGroupMessage);
  }, [groupId]);

  const handleSend = async () => {
    if (!messageInput.trim() || sending) return;
    setSending(true);
    try {
      const msg = await groupsApi.sendMessage(groupId, messageInput.trim());
      setMessages(prev => [...prev, msg]);
      setMessageInput('');
    } catch {
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  const handleLeave = async () => {
    try {
      await groupsApi.leave(groupId);
      toast.success('Você saiu do grupo');
      router.push('/groups');
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Erro ao sair do grupo');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground">
        Grupo não encontrado
      </div>
    );
  }

  const isMember = group.my_role !== null;
  const isOwner = group.my_role === 'owner';

  return (
    <div className="">
      <div className="mx-auto max-w-4xl">
        {/* Group header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{group.name}</h1>
            {group.subject && <Badge variant="secondary" className="mt-1">{group.subject}</Badge>}
            {group.description && (
              <p className="text-muted-foreground mt-2">{group.description}</p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              {group.members_count} membros - Criado por {group.owner_username}
            </p>
          </div>
          {isMember && !isOwner && (
            <Button variant="outline" size="sm" onClick={handleLeave} className="gap-1">
              <LogOut className="h-4 w-4" /> Sair
            </Button>
          )}
        </div>

        {!isMember ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">
                Você não é membro deste grupo.
              </p>
              {group.is_public && (
                <Button onClick={async () => {
                  await groupsApi.join(groupId);
                  toast.success('Você entrou no grupo!');
                  loadData();
                }}>
                  Entrar no Grupo
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="members">Membros ({members.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="chat">
              <Card className="flex flex-col" style={{ height: '60vh' }}>
                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma mensagem ainda. Inicie a conversa!
                    </p>
                  )}
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex gap-2',
                        msg.message_type === 'system' && 'justify-center'
                      )}
                    >
                      {msg.message_type === 'system' ? (
                        <p className="text-xs text-muted-foreground italic">{msg.content}</p>
                      ) : (
                        <>
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-bold">
                            {msg.author_username?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-muted-foreground">
                              {msg.author_username}
                              <span className="ml-2 font-normal">
                                {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </p>
                            <p className="text-sm break-words">{msg.content}</p>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Input */}
                <div className="border-t p-3 flex gap-2">
                  <Input
                    placeholder="Digite uma mensagem..."
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  />
                  <Button onClick={handleSend} disabled={sending || !messageInput.trim()} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="members">
              <Card>
                <CardHeader>
                  <CardTitle>Membros</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {members.map(member => (
                    <div key={member.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                          {member.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{member.username}</p>
                          {member.full_name && (
                            <p className="text-xs text-muted-foreground">{member.full_name}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.role === 'owner' && (
                          <Badge variant="default" className="gap-1">
                            <Crown className="h-3 w-3" /> Dono
                          </Badge>
                        )}
                        {member.role === 'admin' && (
                          <Badge variant="secondary" className="gap-1">
                            <Shield className="h-3 w-3" /> Admin
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
