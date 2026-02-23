'use client';

import { useEffect, useState } from 'react';
import { gemsApi } from '@/lib/api/gems.api';
import { GemsBalance, ShopItem, GemTransaction, SHOP_CATEGORIES } from '@/types/gems.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Diamond, Shield, Zap, Flame, Star, Crown, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ITEM_ICONS: Record<string, React.ElementType> = {
  shield: Shield,
  zap: Zap,
  flame: Flame,
  star: Star,
  crown: Crown,
  gift: Diamond,
};

export default function ShopPage() {
  const [balance, setBalance] = useState<GemsBalance | null>(null);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [history, setHistory] = useState<GemTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('shop');

  useEffect(() => {
    Promise.all([
      gemsApi.getBalance(),
      gemsApi.getShop(),
      gemsApi.getHistory(20),
    ])
      .then(([balanceData, shopData, historyData]) => {
        setBalance(balanceData);
        setItems(shopData);
        setHistory(historyData.transactions);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePurchase = async (itemCode: string) => {
    setPurchasing(itemCode);
    try {
      const result = await gemsApi.purchase(itemCode);
      toast.success(`${result.item.name_pt} comprado!`);
      setBalance(prev => prev ? { ...prev, balance: result.new_balance } : prev);
      // Refresh shop items
      const updatedItems = await gemsApi.getShop();
      setItems(updatedItems);
      const updatedHistory = await gemsApi.getHistory(20);
      setHistory(updatedHistory.transactions);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Erro ao comprar item');
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Group items by category
  const categories = [...new Set(items.map(i => i.category))];

  return (
    <div className="">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Loja</h1>
          <p className="text-muted-foreground">Gaste suas gemas em itens especiais</p>
        </div>

        {/* Balance card */}
        {balance && (
          <Card className="mb-8">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
                <Diamond className="h-7 w-7 text-emerald-500" />
              </div>
              <div className="flex-1">
                <p className="text-3xl font-bold">{balance.balance}</p>
                <p className="text-sm text-muted-foreground">gemas disponíveis</p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>Total ganho: {balance.total_earned}</p>
                <p>Total gasto: {balance.total_spent}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="shop">Loja</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          {/* Shop Tab */}
          <TabsContent value="shop">
            {categories.map(category => (
              <div key={category} className="mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  {SHOP_CATEGORIES[category] || category}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {items
                    .filter(item => item.category === category)
                    .map(item => {
                      const Icon = ITEM_ICONS[item.icon] || Diamond;
                      const canAfford = (balance?.balance || 0) >= item.gem_cost;

                      return (
                        <Card key={item.id}>
                          <CardContent className="flex items-start gap-3 pt-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shrink-0">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium">{item.name_pt}</p>
                              <p className="text-xs text-muted-foreground">{item.description_pt}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center gap-1">
                                  <Diamond className="h-3 w-3 text-emerald-500" />
                                  <span className="text-sm font-semibold">{item.gem_cost}</span>
                                </div>
                                {item.already_owned ? (
                                  <Badge variant="secondary" className="text-xs gap-1">
                                    <CheckCircle className="h-3 w-3" /> Adquirido
                                  </Badge>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant={canAfford ? 'default' : 'outline'}
                                    disabled={!canAfford || purchasing === item.item_code}
                                    onClick={() => handlePurchase(item.item_code)}
                                  >
                                    {purchasing === item.item_code ? 'Comprando...' : 'Comprar'}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Transações</CardTitle>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma transação ainda.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {history.map(tx => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {tx.description_pt || tx.source}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={cn(
                            'font-semibold',
                            tx.amount > 0 ? 'text-green-600' : 'text-red-500'
                          )}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Saldo: {tx.balance_after}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
