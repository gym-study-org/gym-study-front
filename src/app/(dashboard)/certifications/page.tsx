'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import { certificationsApi } from '@/lib/api/certifications.api';
import { Certification } from '@/types/certifications.types';
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
import { toast } from 'sonner';
import { Award, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';

export default function CertificationsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useStore();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    category: '',
    description: '',
    score: '',
    max_score: '',
    passed: true,
    obtained_at: new Date().toISOString().split('T')[0],
    credential_id: '',
    credential_url: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadCertifications();
  }, [isAuthenticated, router]);

  const loadCertifications = async () => {
    try {
      const response = await certificationsApi.getAll(1, 100);
      setCertifications(response.data);
    } catch (error) {
      console.error('Failed to load certifications:', error);
    }
  };

  const handleCreate = async () => {
    if (!formData.name) {
      toast.error('Nome da certificação é obrigatório');
      return;
    }

    setIsLoading(true);

    try {
      await certificationsApi.create({
        name: formData.name,
        provider: formData.provider || undefined,
        category: formData.category || undefined,
        description: formData.description || undefined,
        score: formData.score ? parseFloat(formData.score) : undefined,
        max_score: formData.max_score ? parseFloat(formData.max_score) : undefined,
        passed: formData.passed,
        obtained_at: new Date(formData.obtained_at).toISOString(),
        credential_id: formData.credential_id || undefined,
        credential_url: formData.credential_url || undefined,
      });

      toast.success('Certificação adicionada com sucesso!');
      setShowDialog(false);
      setFormData({
        name: '',
        provider: '',
        category: '',
        description: '',
        score: '',
        max_score: '',
        passed: true,
        obtained_at: new Date().toISOString().split('T')[0],
        credential_id: '',
        credential_url: '',
      });
      loadCertifications();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao adicionar certificação');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta certificação?')) {
      return;
    }

    try {
      await certificationsApi.delete(id);
      toast.success('Certificação excluída com sucesso!');
      loadCertifications();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao excluir certificação');
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Certificações</h1>
            <p className="text-muted-foreground">Gerencie suas certificações conquistadas</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Certificação
            </Button>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Voltar ao Dashboard
            </Button>
          </div>
        </div>

        {/* Lista de Certificações */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {certifications.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex min-h-[200px] flex-col items-center justify-center">
                <Award className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhuma certificação registrada ainda.</p>
                <Button className="mt-4" onClick={() => setShowDialog(true)}>
                  Adicionar Primeira Certificação
                </Button>
              </CardContent>
            </Card>
          ) : (
            certifications.map((cert) => (
              <Card key={cert.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {cert.passed ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        {cert.name}
                      </CardTitle>
                      {cert.provider && (
                        <CardDescription className="mt-1">{cert.provider}</CardDescription>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(cert.id)}
                      className="ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {cert.category && (
                    <p className="text-sm">
                      <strong>Categoria:</strong> {cert.category}
                    </p>
                  )}
                  {cert.score !== null && cert.max_score !== null && (
                    <p className="text-sm">
                      <strong>Score:</strong> {cert.score}/{cert.max_score}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {new Date(cert.obtained_at).toLocaleDateString('pt-BR')}
                  </p>
                  {cert.credential_url && (
                    <a
                      href={cert.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Ver Credencial
                    </a>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Dialog para Adicionar Certificação */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Certificação</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Certificação *</Label>
                <Input
                  id="name"
                  placeholder="Ex: AWS Solutions Architect"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Input
                  id="provider"
                  placeholder="Ex: Amazon Web Services"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  placeholder="Ex: Cloud"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  placeholder="Detalhes sobre a certificação"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="score">Nota</Label>
                  <Input
                    id="score"
                    type="number"
                    placeholder="Ex: 850"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_score">Nota Máxima</Label>
                  <Input
                    id="max_score"
                    type="number"
                    placeholder="Ex: 1000"
                    value={formData.max_score}
                    onChange={(e) => setFormData({ ...formData, max_score: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="passed"
                  checked={formData.passed}
                  onChange={(e) => setFormData({ ...formData, passed: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="passed" className="cursor-pointer">
                  Passou na certificação?
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="obtained_at">Data de Obtenção *</Label>
                <Input
                  id="obtained_at"
                  type="date"
                  value={formData.obtained_at}
                  onChange={(e) => setFormData({ ...formData, obtained_at: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="credential_id">ID da Credencial</Label>
                <Input
                  id="credential_id"
                  placeholder="Ex: ABC123XYZ"
                  value={formData.credential_id}
                  onChange={(e) => setFormData({ ...formData, credential_id: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="credential_url">URL da Credencial</Label>
                <Input
                  id="credential_url"
                  type="url"
                  placeholder="https://..."
                  value={formData.credential_url}
                  onChange={(e) => setFormData({ ...formData, credential_url: e.target.value })}
                />
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
                {isLoading ? 'Salvando...' : 'Salvar Certificação'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
