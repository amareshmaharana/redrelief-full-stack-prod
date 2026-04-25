import { useEffect, useState } from 'react';
import { BrandLoader } from '@/components/ui/BrandLoader';
import { useMinLoader } from '@/hooks/useMinLoader';
import { StatCard } from '@/components/dashboard/StatCard';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { BloodGroupTag } from '@/components/dashboard/BloodGroupTag';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Droplets, Calendar, Heart, ClipboardList, Activity } from 'lucide-react';
import { adminApi, mapDonationRequest, mapBloodRequest, mapStock } from '@/lib/backend-api';
import type { DashboardStats, DonationRequest, BloodRequest, BloodStock } from '@/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [donationReqs, setDonationReqs] = useState<DonationRequest[]>([]);
  const [bloodReqs, setBloodReqs] = useState<BloodRequest[]>([]);
  const [stock, setStock] = useState<BloodStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    async function load(showLoader = false) {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      try {
        const [statsData, requestsData, stockData] = await Promise.all([
          adminApi.dashboardStats(),
          adminApi.requests(),
          adminApi.stock(),
        ]);
        setStats(statsData);
        setDonationReqs(requestsData.donation_requests.map(mapDonationRequest));
        setBloodReqs(requestsData.blood_requests.map((r) => mapBloodRequest(r)));
        setStock(stockData.map(mapStock));
      } catch {
        // fallback: empty
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }

    void load(true);
    const intervalId = window.setInterval(() => {
      void load(false);
    }, 90000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const showLoader = useMinLoader(loading);
  if (showLoader) {
    return <BrandLoader message="Loading dashboard..." fullScreen={false} />;
  }
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back! Here's your blood bank overview.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-red-500/5 border border-red-500/10 px-4 py-2">
          <Activity className="h-4 w-4 text-red-600" />
          <span className="text-sm font-medium text-red-600">Live Status</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Donors" value={stats?.totalDonors?.toLocaleString() ?? '0'} icon={Users} className="border-red-200/60" iconClassName="bg-red-500" />
        <StatCard title="Blood Units" value={stats?.totalBloodUnits?.toLocaleString() ?? '0'} icon={Droplets} className="border-red-200/60" iconClassName="bg-red-500" />
        <StatCard title="Active Camps" value={stats?.totalCamps ?? 0} icon={Calendar} className="border-red-200/60" iconClassName="bg-red-500" />
        <StatCard title="Pending Requests" value={stats?.pendingRequests ?? 0} icon={ClipboardList} className="border-red-200/60" iconClassName="bg-red-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Blood Stock */}
        <Card className="overflow-hidden border-border">
          <CardHeader className="border-b border-border bg-red-50/60 py-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Droplets className="h-5 w-5 text-red-600" /> Blood Stock Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="grid grid-cols-4 gap-2">
              {stock.map((s) => (
                <div key={s.id} className="group rounded-xl border border-border p-3 text-center transition-all hover:border-red-500/30 hover:shadow-sm">
                  <BloodGroupTag group={s.bloodGroup} />
                  <p className="mt-2 text-2xl font-bold text-foreground tracking-tight">{s.units}</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">units</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Overview stats */}
        <Card className="overflow-hidden border-border">
          <CardHeader className="border-b border-border bg-red-50/60 py-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="h-5 w-5 text-red-600" /> Quick Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 grid grid-cols-2 gap-3">
            {[
              { label: 'Recipients', value: stats?.totalRecipients ?? 0 },
              { label: 'Hospitals', value: stats?.totalHospitals ?? 0 },
              { label: 'Pending Donations', value: stats?.pendingDonations ?? 0 },
              { label: 'Fulfilled', value: stats?.fulfilledRequests ?? 0 },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-red-50/40 border border-red-200/50 p-4 text-center">
                <p className="text-2xl font-bold text-foreground tracking-tight">{item.value}</p>
                <p className="text-xs text-muted-foreground font-medium mt-1">{item.label}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Donation Requests */}
      <Card className="overflow-hidden border-border">
        <CardHeader className="border-b border-border bg-red-50/60 py-4">
          <CardTitle className="text-base">Recent Donation Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Donor</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Blood Group</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Camp</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Date</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donationReqs.slice(0, 5).map((r) => (
                  <TableRow key={r.id} className="hover:bg-red-50/40">
                    <TableCell className="font-medium text-foreground">{r.donorName}</TableCell>
                    <TableCell><BloodGroupTag group={r.bloodGroup} /></TableCell>
                    <TableCell className="text-muted-foreground">{r.campName ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{r.requestDate}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Blood Requests */}
      <Card className="overflow-hidden border-border">
        <CardHeader className="border-b border-border bg-red-50/60 py-4">
          <CardTitle className="text-base">Recent Blood Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Requester</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Type</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Blood Group</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Units</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Urgency</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bloodReqs.slice(0, 5).map((r) => (
                  <TableRow key={r.id} className="hover:bg-red-50/40">
                    <TableCell className="font-medium text-foreground">{r.requesterName}</TableCell>
                    <TableCell className="capitalize text-muted-foreground">{r.requesterType}</TableCell>
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
