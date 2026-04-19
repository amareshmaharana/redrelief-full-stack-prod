import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BrandLoader } from '@/components/ui/BrandLoader';
import { useMinLoader } from '@/hooks/useMinLoader';
import { adminApi } from '@/lib/backend-api';
import { ViewUserDialog } from '@/components/dialogs/ViewUserDialog';
import type { BackendUser } from '@/lib/auth-session';
import { Search, Heart, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ManageRecipients() {
  const [search, setSearch] = useState('');
  const [recipients, setRecipients] = useState<(BackendUser & { is_active?: boolean; is_verified?: boolean; date_joined?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [viewUser, setViewUser] = useState<(typeof recipients)[number] | null>(null);

  const loadRecipients = async (showLoader = false) => {
    if (showLoader) {
      setLoading(true);
    }
    try {
      const data = await adminApi.users('recipient');
      setRecipients(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRecipients(true);
    const intervalId = window.setInterval(() => {
      void loadRecipients(false);
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const filtered = recipients.filter((r) => {
    const matchesSearch = r.full_name.toLowerCase().includes(search.toLowerCase()) || r.mobile.includes(search);
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'verified' ? r.is_verified : !r.is_verified);
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    const headers = ['Name', 'Mobile', 'Email', 'Status'];
    const rows = filtered.map((r) => [r.full_name, r.mobile, r.email ?? '', r.is_verified ? 'Verified' : 'Pending']);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recipients.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Recipients exported successfully');
  };

  const toggleVerification = async (userId: number, currentValue: boolean) => {
    await adminApi.updateUserVerification(userId, !currentValue);
    await loadRecipients(false);
  };

  const showLoader = useMinLoader(loading);
  if (showLoader) return <BrandLoader message="Loading recipients..." fullScreen={false} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Manage Recipients</h1>
          <p className="text-sm text-muted-foreground mt-1">{recipients.length} registered recipients</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 self-start" onClick={handleExport}>
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total Recipients', value: recipients.length, color: 'text-primary' },
          { label: 'Verified', value: recipients.filter(r => r.is_verified).length, color: 'text-success' },
          { label: 'Active', value: recipients.filter(r => r.is_active).length, color: 'text-info' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4 text-center">
            <p className={`text-2xl font-bold tracking-tight ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground font-medium mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <Card className="overflow-hidden border-border">
        <CardHeader className="border-b border-border bg-muted/30 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" /> Recipient Directory
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search by name or mobile..." className="pl-10 h-9 bg-background" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Button variant={statusFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('all')}>All</Button>
              <Button variant={statusFilter === 'verified' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('verified')}>Verified</Button>
              <Button variant={statusFilter === 'pending' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('pending')}>Pending</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Name</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Mobile</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Email</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No recipients found.</TableCell></TableRow>
                ) : filtered.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-info/10 flex items-center justify-center text-xs font-bold text-info">
                          {r.full_name[0]}
                        </div>
                        <p className="font-medium text-foreground">{r.full_name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{r.mobile}</TableCell>
                    <TableCell className="text-muted-foreground">{r.email ?? '—'}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${r.is_verified ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                        {r.is_verified ? 'Verified' : 'Pending'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setViewUser(r)}>View</Button>
                        <Button
                          variant={r.is_verified ? 'outline' : 'default'}
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => {
                            void toggleVerification(r.id, Boolean(r.is_verified));
                          }}
                        >
                          {r.is_verified ? 'Mark Pending' : 'Verify'}
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

      <ViewUserDialog open={!!viewUser} onOpenChange={(open) => !open && setViewUser(null)} user={viewUser} />
    </div>
  );
}
