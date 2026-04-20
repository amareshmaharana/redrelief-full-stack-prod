import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Calendar, MapPin, Clock, Users, Filter, Tent, Droplets, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatCampLocation } from '@/lib/camp-location';
import { publicApi, mapCamp, type StockSummaryDTO } from '@/lib/backend-api';
import { formatCampDisplayId, getCampRegistrationCount, useCampRegistrySubscription } from '@/lib/camp-registry';
import type { BloodCamp } from '@/types';

const statusStyles: Record<string, string> = {
  upcoming: 'bg-info/10 text-info border-info/20',
  ongoing: 'bg-success/10 text-success border-success/20',
  completed: 'bg-muted text-muted-foreground border-border',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

const statusFilters = ['all', 'upcoming', 'ongoing', 'completed'] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

export default function CampSchedule() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [camps, setCamps] = useState<BloodCamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockSummary, setStockSummary] = useState<StockSummaryDTO[]>([]);
  const [registryVersion, setRegistryVersion] = useState(0);

  useEffect(() => {
    publicApi.camps()
      .then((data) => setCamps(data.map(mapCamp)))
      .catch(() => {})
      .finally(() => setLoading(false));
    publicApi.stockSummary().then(setStockSummary).catch(() => {});
  }, []);

  useEffect(() => {
    const unsubscribe = useCampRegistrySubscription(() => setRegistryVersion((current) => current + 1));
    return unsubscribe;
  }, []);

  const filtered = camps.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase());
    const matchStatus = activeFilter === 'all' || c.status === activeFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-foreground py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(0_72%_51%/0.15),transparent_60%)]" />
        <div className="container relative mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              Camp Schedule
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl font-display text-3xl font-bold leading-tight text-primary-foreground sm:text-4xl md:text-5xl">
              Find a Blood Donation<br />
              <span className="text-primary">Camp Near You</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-primary-foreground/60">
              Browse upcoming camps, check availability, and register to donate. Every donation saves lives.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="relative z-10 -mt-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {[
              { label: 'Upcoming Camps', value: camps.filter((c) => c.status === 'upcoming').length, icon: Calendar },
              { label: 'Cities Covered', value: new Set(camps.map((c) => c.city)).size, icon: MapPin },
              { label: 'Total Capacity', value: camps.reduce((a, c) => a + c.maxDonors, 0), icon: Users },
            ].map((stat, i) => (
              <motion.div key={stat.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Card className="border-none bg-card shadow-elevated text-center">
                  <CardContent className="flex items-center justify-center gap-3 p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blood Stock */}
      {stockSummary.length > 0 && (
        <section className="py-14 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-sm font-semibold text-primary">
                <Activity className="h-4 w-4 animate-pulse" />
                Live Inventory
              </span>
              <h2 className="mt-5 font-display text-2xl font-bold text-foreground md:text-3xl">
                Blood Availability
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{stockSummary.reduce((s, i) => s + i.total_units, 0).toLocaleString()}</span> total units across all blood groups
              </p>
            </motion.div>

            <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl border bg-card shadow-lg">
              <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4 md:grid-cols-8">
                {stockSummary.map((s, index) => {
                  const level = s.total_units > 30 ? 'high' : s.total_units > 15 ? 'medium' : 'low';
                  const dotColor = level === 'high' ? 'bg-emerald-500' : level === 'medium' ? 'bg-amber-500' : 'bg-red-500';
                  const textColor = level === 'high' ? 'text-emerald-600' : level === 'medium' ? 'text-amber-600' : 'text-red-600';

                  return (
                    <motion.div
                      key={s.blood_group}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.04 }}
                      className="group flex flex-col items-center bg-card px-3 py-6 transition-colors hover:bg-accent/50"
                    >
                      <span className="text-lg font-extrabold text-primary sm:text-xl">{s.blood_group}</span>
                      <span className={`mt-1.5 text-2xl font-bold ${textColor}`}>{s.total_units}</span>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">units</span>
                      <span className={`mt-2.5 h-2 w-2 rounded-full ${dotColor} transition-transform group-hover:scale-150`} />
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="mx-auto mt-5 flex max-w-3xl flex-col items-start gap-3 px-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Sufficient (&gt;30)</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Moderate (15-30)</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /> Low (&lt;15)</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Search & Filter */}
      <section className="pt-12 pb-4">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
          >
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by camp name or city..."
                className="pl-10 rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {statusFilters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-xs font-medium transition-colors capitalize',
                    activeFilter === f
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Camp Cards */}
      <section className="py-8 pb-20">
        <div className="container mx-auto px-4">
          {filtered.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((camp, i) => {
                const registeredDonors = camp.registeredDonors + getCampRegistrationCount(camp.id);
                const spotsLeft = Math.max(camp.maxDonors - registeredDonors, 0);
                const fillPercent = (registeredDonors / camp.maxDonors) * 100;

                return (
                  <motion.div key={camp.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                    <Card className="group h-full overflow-hidden border transition-all duration-300 hover:border-primary/30 hover:shadow-elevated">
                      {/* Top accent */}
                      <div className="h-1.5 gradient-blood" />
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                            <Tent className="h-5 w-5 text-primary" />
                          </div>
                          <Badge variant="outline" className={cn('text-[11px] shrink-0', statusStyles[camp.status])}>
                            {camp.status.charAt(0).toUpperCase() + camp.status.slice(1)}
                          </Badge>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <h3 className="text-lg font-semibold text-foreground">{camp.name}</h3>
                          <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground">
                            {formatCampDisplayId(camp.id)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{camp.organizer}</p>

                        <div className="mt-5 space-y-3">
                          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 text-primary/70" />
                            <span>{camp.date}</span>
                          </div>
                          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 text-primary/70" />
                            <span>{camp.startTime} - {camp.endTime}</span>
                          </div>
                          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 text-primary/70" />
                            <span>{formatCampLocation(camp.address, camp.city, camp.state)}</span>
                          </div>
                        </div>

                        {/* Capacity bar */}
                        <div className="mt-5">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                            <span>{camp.registeredDonors} / {camp.maxDonors} donors</span>
                            <span className={cn(
                              'font-semibold',
                              spotsLeft === 0 ? 'text-destructive' : spotsLeft < 20 ? 'text-warning' : 'text-success'
                            )}>
                              {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Fully booked'}
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full gradient-blood transition-all duration-500"
                              style={{ width: `${fillPercent}%` }}
                            />
                          </div>
                        </div>

                        {camp.status !== 'completed' && (
                          <Button className="mt-5 w-full rounded-xl" size="sm" onClick={() => navigate(`/camps/${camp.id}`)}>
                            View
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <Search className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="mt-4 text-lg font-semibold text-foreground">No camps found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
