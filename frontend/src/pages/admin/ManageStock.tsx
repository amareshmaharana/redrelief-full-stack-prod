import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BloodGroupTag } from '@/components/dashboard/BloodGroupTag';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BrandLoader } from '@/components/ui/BrandLoader';
import { useMinLoader } from '@/hooks/useMinLoader';
import { adminApi, mapStock } from '@/lib/backend-api';
import { AddStockDialog } from '@/components/dialogs/AddStockDialog';
import { EditStockDialog } from '@/components/dialogs/EditStockDialog';
import type { BloodStock } from '@/types';
import { Droplets, AlertTriangle, Plus, CheckCircle, Clock, Package, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

export default function ManageStock() {
  const [stock, setStock] = useState<BloodStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<BloodStock | null>(null);
  const [filter, setFilter] = useState<'all' | 'available' | 'low' | 'expired'>('all');

  const loadStock = async (showLoader = false) => {
    if (showLoader) {
      setLoading(true);
    }
    try {
      const list = await adminApi.stock();
      setStock(list.map(mapStock));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStock(true);
    const intervalId = window.setInterval(() => {
      void loadStock(false);
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const openEditStockDialog = (item: BloodStock) => {
    setEditingStock(item);
    setEditOpen(true);
  };

  const submitEditStock = async (payload: { blood_group: string; units: number; expiry_date: string }) => {
    if (!editingStock) {
      return;
    }

    await adminApi.updateStock(Number(editingStock.id), payload);
    toast.success('Stock updated.');
    await loadStock(false);
    setEditingStock(null);
  };

  const removeStock = async (stockId: string) => {
    try {
      await adminApi.deleteStock(Number(stockId));
      toast.success('Stock deleted.');
      void loadStock(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete stock.';
      toast.error(message);
    }
  };

  const available = stock.filter(s => s.status !== 'expired' && s.units >= 10);
  const lowStock = stock.filter(s => s.units > 0 && s.units < 10 && s.status !== 'expired');
  const expired = stock.filter(s => s.status === 'expired');
  const totalUnits = stock.filter(s => s.status !== 'expired').reduce((a, s) => a + s.units, 0);

  const bloodGroupAgg = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of stock) {
      if (s.status === 'expired') continue;
      map.set(s.bloodGroup, (map.get(s.bloodGroup) || 0) + s.units);
    }
    return Array.from(map.entries())
      .map(([group, units]) => ({ group, units }))
      .sort((a, b) => a.group.localeCompare(b.group));
  }, [stock]);

  const filtered = stock.filter((s) => {
    if (filter === 'all') return true;
    if (filter === 'low') return s.units > 0 && s.units < 10 && s.status !== 'expired';
    if (filter === 'expired') return s.status === 'expired';
    return s.status !== 'expired' && s.units >= 10;
  });

  const showLoader = useMinLoader(loading);
  if (showLoader) return <BrandLoader message="Loading stock..." fullScreen={false} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Blood Stock</h1>
          <p className="text-sm text-muted-foreground mt-1">RedRelief Central Blood Bank &middot; {totalUnits} total available units</p>
        </div>
        <Button className="gap-2" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" /> Add Stock
        </Button>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{totalUnits}</p>
              <p className="text-xs text-muted-foreground">Total Units</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/50">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{available.length}</p>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/30">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/50">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{lowStock.length}</p>
              <p className="text-xs text-muted-foreground">Low Stock</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/30">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/50">
              <Clock className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{expired.length}</p>
              <p className="text-xs text-muted-foreground">Expired</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blood group aggregated cards */}
      {bloodGroupAgg.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {bloodGroupAgg.map((bg) => {
            const isLow = bg.units > 0 && bg.units < 10;
            const isEmpty = bg.units === 0;
            return (
              <div
                key={bg.group}
                className={`group relative overflow-hidden rounded-2xl border p-4 text-center transition-all hover:shadow-md ${
                  isEmpty ? 'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/30' :
                  isLow ? 'border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/30' :
                  'border-border bg-card'
                }`}
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full gradient-blood text-sm font-bold text-primary-foreground">
                  {bg.group}
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground tracking-tight">{bg.units}</p>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">units</p>
                {isLow && (
                  <span className="mt-2 inline-block text-[10px] font-bold text-amber-600 uppercase">Low Stock</span>
                )}
                {isEmpty && (
                  <span className="mt-2 inline-block text-[10px] font-bold text-red-600 uppercase">No Stock</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'available', 'low', 'expired'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className={
              filter === f
                ? f === 'expired' ? 'bg-red-600 hover:bg-red-700' :
                  f === 'low' ? 'bg-amber-600 hover:bg-amber-700' :
                  f === 'available' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  ''
                : ''
            }
          >
            {f === 'low' ? `Low Stock (${lowStock.length})` :
             f === 'expired' ? `Expired (${expired.length})` :
             f === 'available' ? `Available (${available.length})` :
             `All (${stock.length})`}
          </Button>
        ))}
      </div>

      <Card className="overflow-hidden border-border">
        <CardHeader className="border-b border-border bg-muted/30 py-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Droplets className="h-5 w-5 text-primary" /> Stock Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Blood Group</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Units</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Collected</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Expiry</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No stock entries found.</TableCell></TableRow>
                ) : filtered.map((s) => (
                  <TableRow key={s.id} className={`hover:bg-muted/30 ${s.status === 'expired' ? 'opacity-60' : ''}`}>
                    <TableCell><BloodGroupTag group={s.bloodGroup} /></TableCell>
                    <TableCell className="font-bold text-foreground">{s.units}</TableCell>
                    <TableCell className="text-muted-foreground">{s.collectedDate}</TableCell>
                    <TableCell className="text-muted-foreground">{s.expiryDate}</TableCell>
                    <TableCell>
                      <Badge
                        variant={s.status === 'expired' ? 'destructive' : s.units < 10 ? 'outline' : 'default'}
                        className={`text-[11px] ${
                          s.status === 'expired' ? '' :
                          s.units < 10 ? 'border-amber-300 text-amber-700 bg-amber-50' :
                          'bg-emerald-600'
                        }`}
                      >
                        {s.status === 'expired' ? 'Expired' : s.units < 10 ? 'Low Stock' : 'Available'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditStockDialog(s)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => { void removeStock(s.id); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AddStockDialog open={addOpen} onOpenChange={setAddOpen} onCreated={() => { void loadStock(false); }} />
      <EditStockDialog
        open={editOpen}
        stock={editingStock}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) {
            setEditingStock(null);
          }
        }}
        onSubmit={submitEditStock}
      />
    </div>
  );
}
