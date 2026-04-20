import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Heart, MapPin, Search, ShieldCheck, Users, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

import { CampCard } from '@/components/dashboard/CampCard';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuthSession } from '@/lib/auth-session';
import { donorApi, mapCamp } from '@/lib/backend-api';
import { formatCampDisplayId, getCampRegistrationCount, isCampRegistered, registerCampLocally, useCampRegistrySubscription } from '@/lib/camp-registry';
import type { BloodCamp } from '@/types';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function DonorCamps() {
  const navigate = useNavigate();
  const session = useAuthSession();
  const [search, setSearch] = useState('');
  const [camps, setCamps] = useState<BloodCamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampId, setSelectedCampId] = useState<string | null>(null);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completedCampId, setCompletedCampId] = useState<string | null>(null);
  const [registryVersion, setRegistryVersion] = useState(0);

  useEffect(() => {
    const loadCamps = async () => {
      try {
        const data = await donorApi.camps();
        setCamps(data.map(mapCamp));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load camps.';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    void loadCamps();
    const intervalId = window.setInterval(() => {
      void loadCamps();
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = useCampRegistrySubscription(() => setRegistryVersion((current) => current + 1));
    return unsubscribe;
  }, []);

  const liveCamps = useMemo(() => {
    return camps
      .filter((camp) => camp.status === 'upcoming' || camp.status === 'ongoing')
      .map((camp) => ({
        ...camp,
        registeredDonors: camp.registeredDonors + getCampRegistrationCount(camp.id),
      }));
  }, [camps, registryVersion]);

  const filtered = liveCamps.filter((camp) =>
    camp.name.toLowerCase().includes(search.toLowerCase()) ||
    camp.city.toLowerCase().includes(search.toLowerCase()) ||
    formatCampDisplayId(camp.id).toLowerCase().includes(search.toLowerCase())
  );

  const upcoming = filtered.filter((camp) => camp.status === 'upcoming');
  const ongoing = filtered.filter((camp) => camp.status === 'ongoing');
  const selectedCamp = filtered.find((camp) => camp.id === selectedCampId) ?? null;
  const selectedRegistered = selectedCamp ? isCampRegistered(selectedCamp.id) : false;

  const handleRegister = async (camp: BloodCamp) => {
    if (!session) {
      navigate(`/register?role=donor&campId=${camp.id}`);
      return;
    }

    setSelectedCampId(camp.id);
  };

  const submitRegistration = async () => {
    if (!selectedCamp || !session) {
      return;
    }

    if (!selectedBloodGroup) {
      toast.error('Select blood group.');
      return;
    }

    setSubmitting(true);
    try {
      registerCampLocally({
        campId: selectedCamp.id,
        donorName: session.user.full_name,
        bloodGroup: selectedBloodGroup,
        message: notes,
      });
      setCompletedCampId(selectedCamp.id);
      setSelectedCampId(null);
      setSelectedBloodGroup('');
      setNotes('');
      toast.success('Camp registration saved.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to register right now.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const backToDashboard = () => navigate('/donor/dashboard');

  const renderCampGrid = (items: BloodCamp[], emptyLabel: string) => {
    if (loading) {
      return <Card><CardContent className="py-12 text-center text-muted-foreground">Loading camps...</CardContent></Card>;
    }

    if (items.length === 0) {
      return <Card><CardContent className="py-12 text-center text-muted-foreground">{emptyLabel}</CardContent></Card>;
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((camp) => {
          const registered = isCampRegistered(camp.id);
          return (
            <CampCard
              key={camp.id}
              camp={camp}
              showRegister={!registered}
              showView={registered}
              actionLabel={registered ? 'View' : 'Register'}
              onRegister={() => handleRegister(camp)}
              onView={() => navigate(`/camps/${camp.id}`)}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Donation Camps</h1>
        <p className="text-sm text-muted-foreground">Only live camps are shown here. Register and track your donation workflow in one place.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-success">{ongoing.length}</p>
          <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">Ongoing</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-primary">{upcoming.length}</p>
          <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">Upcoming</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-warning">{filtered.length}</p>
          <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">Visible now</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-xl flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search camps by name, city, or camp ID"
            className="pl-10"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2" onClick={backToDashboard}>
          Back to dashboard <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {selectedCamp && !completedCampId && (
        <Card className="overflow-hidden border-border shadow-elevated">
          <div className="h-1 gradient-blood" />
          <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Register for camp</span>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold tracking-[0.18em] text-muted-foreground">{formatCampDisplayId(selectedCamp.id)}</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground">{selectedCamp.name}</h2>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">{selectedCamp.description || 'This camp is ready for donor registration with live availability tracking.'}</p>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border bg-card p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Date</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{selectedCamp.date}</p>
                </div>
                <div className="rounded-2xl border bg-card p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Time</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{selectedCamp.startTime} - {selectedCamp.endTime}</p>
                </div>
                <div className="rounded-2xl border bg-card p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Place</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{selectedCamp.address}</p>
                </div>
              </div>
            </div>

            <Card className="border-border bg-background shadow-card">
              <CardContent className="space-y-4 p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Donor registration</p>
                  <h3 className="mt-2 text-xl font-bold text-foreground">Fill in the details</h3>
                </div>
                <div className="space-y-2">
                  <Label>Donor Name</Label>
                  <Input value={session?.user.full_name ?? ''} readOnly className="bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <Label>Blood Group</Label>
                  <Select value={selectedBloodGroup} onValueChange={setSelectedBloodGroup}>
                    <SelectTrigger><SelectValue placeholder="Choose blood group" /></SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map((group) => (
                        <SelectItem key={group} value={group}>{group}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Optional message for this camp..."
                    className="min-h-[110px]"
                  />
                </div>
                <Button className="w-full" onClick={submitRegistration} disabled={submitting}>
                  <Heart className="mr-2 h-4 w-4" />
                  {submitting ? 'Registering...' : 'Register'}
                </Button>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}

      {completedCampId && (
        <Card className="border-success/20 bg-success/10 shadow-card">
          <CardContent className="space-y-4 p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success text-success-foreground shadow-lg">
              <CheckCircle className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">Registration successful</p>
              <p className="mt-1 text-sm text-muted-foreground">Your camp registration has been saved. This camp card will now show View instead of Register.</p>
            </div>
            <Button className="w-full sm:w-auto" onClick={backToDashboard}>
              Back to dashboard
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/10 text-success">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Ongoing camps</h2>
            <p className="text-sm text-muted-foreground">Live right now and ready for donor coordination.</p>
          </div>
        </div>
        {renderCampGrid(ongoing, 'No ongoing camps right now.')}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Upcoming camps</h2>
            <p className="text-sm text-muted-foreground">Browse and reserve your spot before the camp fills up.</p>
          </div>
        </div>
        {renderCampGrid(upcoming, 'No upcoming camps available.')}
      </div>
    </div>
  );
}
