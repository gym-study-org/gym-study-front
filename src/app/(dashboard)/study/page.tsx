'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import { StudyTimer } from '@/components/study/StudyTimer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { studySessionsApi } from '@/lib/api/study-sessions.api';
import { toast } from 'sonner';
import { StudySession } from '@/types/study.types';

export default function StudyPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useStore();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [sessionData, setSessionData] = useState<{
    duration: number;
    startTime: Date;
    endTime: Date;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    is_for_certification: false,
    certification_name: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadSessions();
  }, [isAuthenticated, router]);

  const loadSessions = async () => {
    try {
      const response = await studySessionsApi.getAll(1, 10);
      setSessions(response.data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const handleTimerFinish = (duration: number, startTime: Date, endTime: Date) => {
    setSessionData({ duration, startTime, endTime });
    setShowDialog(true);
  };

  const handleSaveSession = async () => {
    if (!sessionData) return;

    if (!formData.title || !formData.subject) {
      toast.error('Título e Assunto são obrigatórios');
      return;
    }

    setIsLoading(true);

    try {
      await studySessionsApi.create({
        title: formData.title,
        subject: formData.subject,
        description: formData.description,
        duration_minutes: sessionData.duration,
        is_for_certification: formData.is_for_certification,
        certification_name: formData.certification_name || undefined,
        started_at: sessionData.startTime.toISOString(),
        finished_at: sessionData.endTime.toISOString(),
      });

      toast.success('Sessão de estudo salva com sucesso!');
      setShowDialog(false);
      setFormData({
        title: '',
        subject: '',
        description: '',
        is_for_certification: false,
        certification_name: '',
      });
      setSessionData(null);
      loadSessions();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao salvar sessão');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Sessões de Estudo</h1>
        <Button onClick={() => router.push('/dashboard')} variant="outline" size="sm">
          ← Dashboard
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
          {/* Timer */}
          <div>
            <StudyTimer onFinish={handleTimerFinish} />
          </div>

          {/* Recent Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Sessões Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma sessão registrada ainda</p>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-semibold">{session.title}</p>
                        <p className="text-sm text-muted-foreground">{session.subject}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{session.duration_minutes} min</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(session.started_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      {/* Save Session Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Salvar Sessão de Estudo</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Duração: <span className="font-bold">{sessionData?.duration} minutos</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Revisão de Matemática"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Assunto *</Label>
                <Input
                  id="subject"
                  placeholder="Ex: Cálculo I"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input
                  id="description"
                  placeholder="O que você estudou?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="certification"
                  checked={formData.is_for_certification}
                  onChange={(e) =>
                    setFormData({ ...formData, is_for_certification: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="certification" className="cursor-pointer">
                  É para certificação?
                </Label>
              </div>

              {formData.is_for_certification && (
                <div className="space-y-2">
                  <Label htmlFor="cert_name">Nome da Certificação</Label>
                  <Input
                    id="cert_name"
                    placeholder="Ex: AWS Solutions Architect"
                    value={formData.certification_name}
                    onChange={(e) =>
                      setFormData({ ...formData, certification_name: e.target.value })
                    }
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)} disabled={isLoading}>
                Cancelar
              </Button>
              <Button onClick={handleSaveSession} disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar Sessão'}
              </Button>
            </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
