import { CampCard } from '@/components/dashboard/CampCard';
import { BrandLoader } from '@/components/ui/BrandLoader';
import { useMinLoader } from '@/hooks/useMinLoader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminApi, mapCamp } from '@/lib/backend-api';
import { AddCampDialog } from '@/components/dialogs/AddCampDialog';
import { EditCampDialog } from '@/components/dialogs/EditCampDialog';
import type { BloodCamp } from '@/types';
import { Plus, Calendar, MapPin, Users, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ManageCamps() {
  const [camps, setCamps] = useState<BloodCamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingCamp, setEditingCamp] = useState<BloodCamp | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadCamps = async (showLoader = false) => {
    if (showLoader) {
      setLoading(true);
    }
    try {
      const list = await adminApi.camps();
      setCamps(list.map(mapCamp));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCamps(true);
    const intervalId = window.setInterval(() => {
      void loadCamps(false);
    }, 90000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const deleteCamp = async (campId: string) => {
    try {
      await adminApi.deleteCamp(Number(campId));
      toast.success('Camp deleted.');
      void loadCamps(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete camp.';
      toast.error(message);
    }
  };

  const openEditCampDialog = (camp: BloodCamp) => {
    setEditingCamp(camp);
    setEditOpen(true);
  };

  const submitEditCamp = async (payload: { camp_name: string; location: string; date: string; description: string }) => {
    if (!editingCamp) {
      return;
    }

    await adminApi.updateCamp(Number(editingCamp.id), payload);
    toast.success('Camp updated.');
    await loadCamps(false);
    setEditingCamp(null);
  };

  const filtered = camps.filter((c) => {
    const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.address.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const showLoader = useMinLoader(loading);
  if (showLoader) return <BrandLoader message="Loading camps..." fullScreen={false} />;

  const upcoming = camps.filter(c => c.status === 'upcoming').length;
  const ongoing = camps.filter(c => c.status === 'ongoing').length;
  const totalRegistered = camps.reduce((a, c) => a + c.registeredDonors, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Blood Camps</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and schedule blood donation camps</p>
        </div>
        <Button className="gap-2 self-start" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" /> Add Camp
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Calendar, label: 'Total Camps', value: camps.length, color: 'text-primary bg-primary/10' },
          { icon: Calendar, label: 'Upcoming', value: upcoming, color: 'text-info bg-info/10' },
          { icon: MapPin, label: 'Ongoing', value: ongoing, color: 'text-success bg-success/10' },
          { icon: Users, label: 'Registered', value: totalRegistered, color: 'text-warning bg-warning/10' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className={`rounded-lg p-2 ${stat.color.split(' ')[1]}`}>
              <stat.icon className={`h-5 w-5 ${stat.color.split(' ')[0]}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search camps by name or location..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['all', 'upcoming', 'ongoing', 'completed'].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className="capitalize"
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground py-10">No camps found.</p>
        ) : (
          filtered.map((camp) => (
            <div key={camp.id} className="space-y-2">
              <CampCard camp={camp} />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEditCampDialog(camp)}>
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => { void deleteCamp(camp.id); }}>
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <AddCampDialog open={addOpen} onOpenChange={setAddOpen} onCreated={() => { void loadCamps(false); }} />
      <EditCampDialog
        open={editOpen}
        camp={editingCamp}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) {
            setEditingCamp(null);
          }
        }}
        onSubmit={submitEditCamp}
      />
    </div>
  );
}
