import { StatCard } from '@/components/dashboard/StatCard';
import { CampCard } from '@/components/dashboard/CampCard';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { BloodGroupTag } from '@/components/dashboard/BloodGroupTag';
import { RequestTracker } from '@/components/dashboard/RequestTracker';
import { BrandLoader } from '@/components/ui/BrandLoader';
import { useMinLoader } from '@/hooks/useMinLoader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Heart, Calendar, ClipboardList, Award, Activity } from 'lucide-react';
import { donorApi, mapCamp, mapDonationRequest } from '@/lib/backend-api';
import type { BloodCamp, DonationRequest } from '@/types';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const donorSteps = [
  { label: 'Submitted' },
  { label: 'Reviewed' },
  { label: 'Approved' },
  { label: 'Donated' },
];

export default function DonorDashboard() {
  const navigate = useNavigate();
  const [camps, setCamps] = useState<BloodCamp[]>([]);
  const [requests, setRequests] = useState<DonationRequest[]>([]);
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
        donorApi.camps().then(list => setCamps(list.map(mapCamp))),
        donorApi.requests().then(list => setRequests(list.map(mapDonationRequest))),
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
    }, 90000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const showLoader = useMinLoader(loading);
  if (showLoader) return <BrandLoader message="Loading dashboard..." fullScreen={false} />;

  const upcomingCamps = camps.filter((c) => c.status === 'upcoming');

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Donor Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your donations, find camps, and save lives.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 px-4 py-2">
          <Activity className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-600">Hero Active</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="My Requests" value={requests.length} icon={Heart} className="border-emerald-200/60" iconClassName="bg-emerald-500" />
        <StatCard title="Upcoming Camps" value={upcomingCamps.length} icon={Calendar} className="border-emerald-200/60" iconClassName="bg-emerald-500" />
        <StatCard title="Pending Requests" value={requests.filter((r) => r.status === 'pending').length} icon={ClipboardList} className="border-emerald-200/60" iconClassName="bg-emerald-500" />
        <StatCard title="Approved" value={requests.filter(r => r.status === 'approved').length} icon={Award} className="border-emerald-200/60" iconClassName="bg-emerald-500" />
      </div>

      {/* Request tracker */}
      {requests.length > 0 && (
        <Card className="overflow-hidden border-border">
          <CardHeader className="border-b border-border bg-emerald-50/60 py-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-5 w-5 text-emerald-600" /> Latest Request Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <RequestTracker steps={donorSteps} currentStep={0} />
          </CardContent>
        </Card>
      )}

      {/* Upcoming camps */}
      {upcomingCamps.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-foreground">Upcoming Camps</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingCamps.map((camp) => (
              <CampCard key={camp.id} camp={camp} showRegister onRegister={(id) => navigate(`/donor/request-donation?camp=${id}`)} />
            ))}
          </div>
        </div>
      )}

      {/* Donation history */}
      <Card className="overflow-hidden border-border">
          <CardHeader className="border-b border-border bg-emerald-50/60 py-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="h-5 w-5 text-emerald-600" /> My Donation Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Blood Group</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Camp</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Date</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.id} className="hover:bg-emerald-50/40">
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
    </div>
  );
}
