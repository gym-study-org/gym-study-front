'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { BookOpen, Target, Award, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const features = [
    {
      title: 'Sessões de Estudo',
      description: 'Registre suas sessões com timer integrado',
      icon: BookOpen,
      href: '/study',
      color: 'text-blue-600',
    },
    {
      title: 'Metas',
      description: 'Defina e acompanhe suas metas de estudo',
      icon: Target,
      href: '/goals',
      color: 'text-green-600',
      disabled: false,
    },
    {
      title: 'Certificações',
      description: 'Registre suas certificações conquistadas',
      icon: Award,
      href: '/certifications',
      color: 'text-yellow-600',
      disabled: false,
    },
    {
      title: 'Estatísticas',
      description: 'Veja seu progresso e estatísticas',
      icon: TrendingUp,
      href: '/stats',
      color: 'text-purple-600',
      disabled: false,
    },
  ];

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Bem-vindo, {user.username}!</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        {/* User Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Meu Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            {user.full_name && (
              <p>
                <strong>Nome:</strong> {user.full_name}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold">Features</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className={feature.disabled ? 'opacity-50' : 'hover:shadow-lg transition-shadow'}
                >
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className={`rounded-lg bg-muted p-3 ${feature.color}`}>
                        <Icon className="h-8 w-8" />
                      </div>
                      <div>
                        <CardTitle>{feature.title}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {feature.disabled ? (
                      <Button disabled className="w-full">
                        Em Breve
                      </Button>
                    ) : (
                      <Link href={feature.href}>
                        <Button className="w-full">Acessar</Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
