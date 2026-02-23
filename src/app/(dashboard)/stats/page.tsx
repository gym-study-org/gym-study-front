'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import { studySessionsApi } from '@/lib/api/study-sessions.api';
import { StudySessionStats } from '@/types/study.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BookOpen, Clock, Target, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

export default function StatsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useStore();
  const [stats, setStats] = useState<StudySessionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadStats();
  }, [isAuthenticated, router]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await studySessionsApi.getStats();
      setStats(data);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao carregar estatísticas');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Carregando estatísticas...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Nenhuma estatística disponível</p>
      </div>
    );
  }

  // Preparar dados para os gráficos
  const subjectsChartData = stats.subjects.map((subject) => ({
    name: subject.subject,
    horas: +(subject.total_minutes / 60).toFixed(1),
    sessões: subject.count,
  }));

  const subjectsPieData = stats.subjects.map((subject) => ({
    name: subject.subject,
    value: subject.total_minutes,
  }));

  return (
    <div className="">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Estatísticas</h1>
            <p className="text-muted-foreground">Acompanhe seu progresso e desempenho</p>
          </div>
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            Voltar ao Dashboard
          </Button>
        </div>

        {/* Cards de Resumo */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Sessões</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_sessions}</div>
              <p className="text-xs text-muted-foreground">sessões registradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Horas</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_hours.toFixed(1)}h</div>
              <p className="text-xs text-muted-foreground">{stats.total_minutes} minutos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média por Sessão</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total_sessions > 0 ? (stats.total_minutes / stats.total_sessions).toFixed(0) : 0} min
              </div>
              <p className="text-xs text-muted-foreground">por sessão</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assuntos Estudados</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.subjects.length}</div>
              <p className="text-xs text-muted-foreground">assuntos diferentes</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        {stats.subjects.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Gráfico de Barras */}
            <Card>
              <CardHeader>
                <CardTitle>Horas por Assunto</CardTitle>
                <CardDescription>Distribuição de horas estudadas por assunto</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subjectsChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="horas" fill="#8884d8" name="Horas" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Pizza */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Assunto</CardTitle>
                <CardDescription>Proporção de tempo dedicado a cada assunto</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={subjectsPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {subjectsPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `${(value / 60).toFixed(1)}h`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabela de Assuntos */}
        {stats.subjects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento por Assunto</CardTitle>
              <CardDescription>Estatísticas detalhadas de cada assunto estudado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 text-left font-semibold">Assunto</th>
                      <th className="pb-3 text-right font-semibold">Sessões</th>
                      <th className="pb-3 text-right font-semibold">Total (min)</th>
                      <th className="pb-3 text-right font-semibold">Total (h)</th>
                      <th className="pb-3 text-right font-semibold">Média/Sessão</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.subjects.map((subject, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-3 font-medium">{subject.subject}</td>
                        <td className="py-3 text-right">{subject.count}</td>
                        <td className="py-3 text-right">{subject.total_minutes} min</td>
                        <td className="py-3 text-right">{(subject.total_minutes / 60).toFixed(1)}h</td>
                        <td className="py-3 text-right">{(subject.total_minutes / subject.count).toFixed(0)} min</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sessões Recentes */}
        {stats.recent_sessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Sessões Recentes</CardTitle>
              <CardDescription>Últimas sessões de estudo registradas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recent_sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold">{session.title}</p>
                      <p className="text-sm text-muted-foreground">{session.subject}</p>
                      {session.description && (
                        <p className="text-xs text-muted-foreground">{session.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{session.duration_minutes} min</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.started_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {stats.total_sessions === 0 && (
          <Card>
            <CardContent className="flex min-h-[200px] flex-col items-center justify-center">
              <p className="text-muted-foreground">Nenhuma sessão de estudo registrada ainda.</p>
              <Button className="mt-4" onClick={() => router.push('/study')}>
                Começar a Estudar
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
