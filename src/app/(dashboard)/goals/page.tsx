'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import { goalsApi } from '@/lib/api/goals.api';
import { Goal, GoalTargetType } from '@/types/goals.types';
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
import { Target, Plus, Trash2, CheckCircle } from 'lucide-react';

export default function GoalsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useStore();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    target_type: 'hours' as GoalTargetType,
    target_value: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadGoals();
  }, [isAuthenticated, router]);

  const loadGoals = async () => {
    try {
      const response = await goalsApi.getAll(1, 100);
      setGoals(response.data);
    } catch (error) {
      console.error('Failed to load goals:', error);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.target_value) {
      toast.error('Título e Valor da Meta são obrigatórios');
      return;
    }

    setIsLoading(true);

    try {
      await goalsApi.create({
        title: formData.title,
        description: formData.description || undefined,
        category: formData.category || undefined,
        target_type: formData.target_type,
        target_value: parseFloat(formData.target_value),
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
      });

      toast.success('Meta criada com sucesso!');
      setShowDialog(false);
      setFormData({
        title: '',
        description: '',
        category: '',
        target_type: 'hours',
        target_value: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
      });
      loadGoals();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao criar meta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta meta?')) {
      return;
    }

    try {
      await goalsApi.delete(id);
      toast.success('Meta excluída com sucesso!');
      loadGoals();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao excluir meta');
    }
  };

  const handleCompleteGoal = async (id: string) => {
    try {
      await goalsApi.update(id, { status: 'completed' });
      toast.success('Meta marcada como completa!');
      loadGoals();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao atualizar meta');
    }
  };

  const getTargetTypeLabel = (type: GoalTargetType) => {
    const labels = {
      hours: 'Horas',
      sessions: 'Sessões',
      certifications: 'Certificações',
      custom: 'Customizado',
    };
    return labels[type];
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Metas de Estudo</h1>
            <p className="text-muted-foreground">Defina e acompanhe suas metas de estudo</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Meta
            </Button>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Voltar ao Dashboard
            </Button>
          </div>
        </div>

        {/* Lista de Metas */}
        <div className="grid gap-4 md:grid-cols-2">
          {goals.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex min-h-[200px] flex-col items-center justify-center">
                <Target className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhuma meta registrada ainda.</p>
                <Button className="mt-4" onClick={() => setShowDialog(true)}>
                  Criar Primeira Meta
                </Button>
              </CardContent>
            </Card>
          ) : (
            goals.map((goal) => {
              const progress = getProgressPercentage(goal.current_value, goal.target_value);

              return (
                <Card key={goal.id} className={goal.status === 'completed' ? 'border-green-600' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {goal.status === 'completed' && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                          {goal.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {getTargetTypeLabel(goal.target_type)} • {goal.status}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(goal.id)}
                        className="ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {goal.description && (
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span className="font-medium">
                          {goal.current_value} / {goal.target_value}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-muted-foreground text-right">
                        {progress.toFixed(1)}% completo
                      </p>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>Início:</span>
                      <span>{new Date(goal.start_date).toLocaleDateString('pt-BR')}</span>
                    </div>

                    {goal.end_date && (
                      <div className="flex justify-between text-sm">
                        <span>Fim:</span>
                        <span>{new Date(goal.end_date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}

                    {goal.status === 'active' && progress >= 100 && (
                      <Button
                        className="w-full"
                        size="sm"
                        onClick={() => handleCompleteGoal(goal.id)}
                      >
                        Marcar como Completa
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Dialog para Criar Meta */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Meta de Estudo</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título da Meta *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Estudar 100 horas de Python"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  placeholder="Detalhes sobre a meta"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  placeholder="Ex: Programação"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_type">Tipo de Meta *</Label>
                <select
                  id="target_type"
                  value={formData.target_type}
                  onChange={(e) =>
                    setFormData({ ...formData, target_type: e.target.value as GoalTargetType })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="hours">Horas</option>
                  <option value="sessions">Sessões</option>
                  <option value="certifications">Certificações</option>
                  <option value="custom">Customizado</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_value">Valor da Meta *</Label>
                <Input
                  id="target_value"
                  type="number"
                  placeholder="Ex: 100"
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Data de Início *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">Data de Fim</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={isLoading}>
                {isLoading ? 'Criando...' : 'Criar Meta'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
