import { StatCard } from '@/components/dashboard/StatCard';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { BloodGroupTag } from '@/components/dashboard/BloodGroupTag';
import { RequestTracker } from '@/components/dashboard/RequestTracker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrandLoader } from '@/components/ui/BrandLoader';
import { useMinLoader } from '@/hooks/useMinLoader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Droplets, ClipboardList, Heart, Search, Activity } from 'lucide-react';
import { recipientApi, mapStock, mapBloodRequest } from '@/lib/backend-api';
import type { BloodStock, BloodRequest } from '@/types';
import { useEffect, useState } from 'react';

const requestSteps = [
  { label: 'Submitted' },
  { label: 'Reviewed' },
  { label: 'Approved' },
  { label: 'Rejected' },
];

export default function RecipientDashboard() {
  const [stock, setStock] = useState<BloodStock[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async (showLoader = false) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    try {
      await Promise.all([
        recipientApi.stock().then(list => setStock(list.map(mapStock))),
        recipientApi.requests().then(list => setRequests(list.map(r => mapBloodRequest(r, 'recipient')))),
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadDashboard(true);
    const intervalId = window.setInterval(() => {
      void loadDashboard(false);
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const showLoader = useMinLoader(loading);
  if (showLoader) return <BrandLoader message="Loading dashboard..." fullScreen={false} />;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Recipient Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Check availability, track your requests, and get the blood you need.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-indigo-500/5 border border-indigo-500/10 px-4 py-2">
          <Activity className="h-4 w-4 text-indigo-600" />
          <span className="text-sm font-medium text-indigo-600">Care Portal</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <StatCard title="My Requests" value={requests.length} icon={ClipboardList} className="border-indigo-200/60" iconClassName="bg-indigo-500" />
        <StatCard title="Approved" value={requests.filter(r => r.status === 'approved').length} icon={Heart} className="border-indigo-200/60" iconClassName="bg-indigo-500" />
        <StatCard title="Blood Available" value={`${stock.reduce((s, b) => s + b.units, 0)} units`} icon={Droplets} className="border-indigo-200/60" iconClassName="bg-indigo-500" />
      </div>

      {requests.length > 0 && (
        <Card className="overflow-hidden border-border">
          <CardHeader className="border-b border-border bg-indigo-50/60 py-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-5 w-5 text-indigo-600" /> Request Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <RequestTracker steps={requestSteps} currentStep={2} />
          </CardContent>
        </Card>
      )}

      {/* Blood availability */}
      <Card className="overflow-hidden border-border">
          <CardHeader className="border-b border-border bg-indigo-50/60 py-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="h-5 w-5 text-indigo-600" /> Blood Availability
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {stock.map((s) => (
              <div key={s.id} className="group rounded-xl border border-border p-3 text-center transition-all hover:border-indigo-500/30 hover:shadow-sm">
                <BloodGroupTag group={s.bloodGroup} />
                <p className="mt-2 text-2xl font-bold text-foreground tracking-tight">{s.units}</p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">units</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Requests table */}
      <Card className="overflow-hidden border-border">
          <CardHeader className="border-b border-border bg-indigo-50/60 py-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Droplets className="h-5 w-5 text-indigo-600" /> My Blood Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Blood Group</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Units</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Date</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.id} className="hover:bg-indigo-50/40">
                    <TableCell><BloodGroupTag group={r.bloodGroup} /></TableCell>
                    <TableCell className="font-medium">{r.units}</TableCell>
                    <TableCell className="text-muted-foreground">{r.requestDate}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
