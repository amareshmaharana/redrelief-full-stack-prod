import { StatCard } from '@/components/dashboard/StatCard';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { BloodGroupTag } from '@/components/dashboard/BloodGroupTag';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BrandLoader } from '@/components/ui/BrandLoader';
import { useMinLoader } from '@/hooks/useMinLoader';
import { Droplets, ClipboardList, Building2, Activity, Heart } from 'lucide-react';
import { hospitalApi, mapStock, mapBloodRequest } from '@/lib/backend-api';
import { useState, useEffect } from 'react';
import type { BloodStock, BloodRequest } from '@/types';

export default function HospitalDashboard() {
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
      const [stockData, reqData] = await Promise.all([hospitalApi.stock(), hospitalApi.requests()]);
      setStock(stockData.map(mapStock));
      setRequests(reqData.map((r) => mapBloodRequest(r, 'hospital')));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadDashboard(true);
    const intervalId = window.setInterval(() => {
      void loadDashboard(false);
    }, 90000);

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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Hospital Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage blood orders, monitor inventory, and ensure patient care.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-amber-500/5 border border-amber-500/10 px-4 py-2">
          <Activity className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-600">Hospital Active</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Blood Requests" value={requests.length} icon={ClipboardList} className="border-amber-200/60" iconClassName="bg-amber-500" />
        <StatCard title="Approved" value={requests.filter((r) => r.status === 'approved').length} icon={Building2} className="border-amber-200/60" iconClassName="bg-amber-500" />
        <StatCard title="Rejected" value={requests.filter((r) => r.status === 'rejected').length} icon={Heart} className="border-amber-200/60" iconClassName="bg-amber-500" />
        <StatCard title="Available Stock" value={`${stock.reduce((s, b) => s + b.units, 0)} units`} icon={Droplets} className="border-amber-200/60" iconClassName="bg-amber-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Blood Inventory */}
        <Card className="overflow-hidden border-border">
          <CardHeader className="border-b border-border bg-amber-50/60 py-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Droplets className="h-5 w-5 text-amber-600" /> Blood Inventory
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="grid grid-cols-4 gap-2">
              {stock.map((s) => (
                <div key={s.id} className="group rounded-xl border border-border p-3 text-center transition-all hover:border-amber-500/30 hover:shadow-sm">
                  <BloodGroupTag group={s.bloodGroup} />
                  <p className="mt-2 text-2xl font-bold text-foreground tracking-tight">{s.units}</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">units</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Overview */}
        <Card className="overflow-hidden border-border">
          <CardHeader className="border-b border-border bg-amber-50/60 py-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-5 w-5 text-amber-600" /> Quick Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 grid grid-cols-2 gap-3">
            {[
              { label: 'Total Requests', value: requests.length },
              { label: 'Pending', value: requests.filter((r) => r.status === 'pending').length },
              { label: 'Approved', value: requests.filter((r) => r.status === 'approved').length },
              { label: 'Rejected', value: requests.filter((r) => r.status === 'rejected').length },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-amber-50/40 border border-amber-200/50 p-4 text-center">
                <p className="text-2xl font-bold text-foreground tracking-tight">{item.value}</p>
                <p className="text-xs text-muted-foreground font-medium mt-1">{item.label}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Requests table */}
      <Card className="overflow-hidden border-border">
        <CardHeader className="border-b border-border bg-amber-50/60 py-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-5 w-5 text-amber-600" /> Our Blood Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Blood Group</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Units</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Urgency</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Reason</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Date</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.id} className="hover:bg-amber-50/40">
                    <TableCell><BloodGroupTag group={r.bloodGroup} /></TableCell>
                    <TableCell className="font-medium">{r.units}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                        r.urgency === 'critical' ? 'bg-destructive/10 text-destructive' :
                        r.urgency === 'urgent' ? 'bg-warning/10 text-warning' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {r.urgency}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{r.reason}</TableCell>
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
