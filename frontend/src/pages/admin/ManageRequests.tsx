import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { BloodGroupTag } from '@/components/dashboard/BloodGroupTag';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { BrandLoader } from '@/components/ui/BrandLoader';
import { useMinLoader } from '@/hooks/useMinLoader';
import { adminApi, mapDonationRequest, mapBloodRequest } from '@/lib/backend-api';
import type { DonationRequest, BloodRequest } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, Heart, Droplets } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ManageRequests() {
  const [donationRequests, setDonationRequests] = useState<DonationRequest[]>([]);
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = () => {
    setLoading(true);
    adminApi.requests().then(data => {
      setDonationRequests(data.donation_requests.map(mapDonationRequest));
      setBloodRequests(data.blood_requests.map((r) => mapBloodRequest(r)));
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
    const intervalId = window.setInterval(() => {
      fetchRequests();
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const handleReviewDonation = (id: string, status: 'approved' | 'rejected') => {
    adminApi.reviewDonationRequest(Number(id), status).then(() => {
      toast.success(`Donation request ${status}`);
      fetchRequests();
    }).catch(() => toast.error('Action failed'));
  };

  const handleReviewBlood = (id: string, status: 'approved' | 'rejected') => {
    adminApi.reviewBloodRequest(Number(id), status).then(() => {
      toast.success(`Blood request ${status}`);
      fetchRequests();
    }).catch(() => toast.error('Action failed'));
  };

  const showLoader = useMinLoader(loading);
  if (showLoader) return <BrandLoader message="Loading requests..." fullScreen={false} />;

  const pendingDonations = donationRequests.filter(r => r.status === 'pending').length;
  const pendingBlood = bloodRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Manage Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">Review and manage donation & blood requests</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-warning/5 border border-warning/20 px-3 py-2">
            <ClipboardList className="h-4 w-4 text-warning" />
            <span className="text-sm font-medium text-warning">{pendingDonations + pendingBlood} pending</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="donations" className="space-y-4">
        <TabsList className="bg-muted/50 p-1 h-11">
          <TabsTrigger value="donations" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Heart className="h-4 w-4" /> Donation Requests
          </TabsTrigger>
          <TabsTrigger value="blood" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Droplets className="h-4 w-4" /> Blood Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="donations">
          <Card className="overflow-hidden border-border">
            <CardHeader className="border-b border-border bg-muted/30 py-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" /> Donation Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Donor</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Blood Group</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Date</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donationRequests.map((r) => (
                      <TableRow key={r.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full gradient-blood flex items-center justify-center text-xs font-bold text-primary-foreground">
                              {r.donorName[0]}
                            </div>
                            <span className="font-medium text-foreground">{r.donorName}</span>
                          </div>
                        </TableCell>
                        <TableCell><BloodGroupTag group={r.bloodGroup} /></TableCell>
                        <TableCell className="text-muted-foreground">{r.requestDate}</TableCell>
                        <TableCell><StatusBadge status={r.status} /></TableCell>
                        <TableCell>
                          {r.status === 'pending' ? (
                            <div className="flex gap-2">
                              <Button size="sm" className="h-8 text-xs" onClick={() => handleReviewDonation(r.id, 'approved')}>Approve</Button>
                              <Button size="sm" variant="outline" className="h-8 text-xs text-destructive hover:bg-destructive/10" onClick={() => handleReviewDonation(r.id, 'rejected')}>Reject</Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blood">
          <Card className="overflow-hidden border-border">
            <CardHeader className="border-b border-border bg-muted/30 py-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Droplets className="h-5 w-5 text-primary" /> Blood Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Requester</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Blood Group</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Units</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Urgency</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bloodRequests.map((r) => (
                      <TableRow key={r.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center text-xs font-bold text-foreground">
                              {r.requesterName[0]}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{r.requesterName}</p>
                              <p className="text-[11px] text-muted-foreground capitalize">{r.requesterType}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><BloodGroupTag group={r.bloodGroup} /></TableCell>
                        <TableCell className="font-semibold">{r.units}</TableCell>
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
                        <TableCell>
                          {r.status === 'pending' ? (
                            <div className="flex gap-2">
                              <Button size="sm" className="h-8 text-xs" onClick={() => handleReviewBlood(r.id, 'approved')}>Approve</Button>
                              <Button size="sm" variant="outline" className="h-8 text-xs text-destructive hover:bg-destructive/10" onClick={() => handleReviewBlood(r.id, 'rejected')}>Reject</Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
