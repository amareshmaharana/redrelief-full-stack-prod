import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { publicApi, type StockSummaryDTO } from '@/lib/backend-api';
import { Droplets, AlertTriangle, CheckCircle, TrendingDown, Activity, Heart, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import ctaBg from '@/assets/cta-bg.jpg';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

export default function BloodStocks() {
  const [stockSummary, setStockSummary] = useState<StockSummaryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stockUpdatedAt, setStockUpdatedAt] = useState<Date | null>(null);
  const [stockHealth, setStockHealth] = useState({ available: 0, low: 0, expired: 0, total_units: 0 });

  const loadStockSummary = async (showLoader = false) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const [summary, health] = await Promise.all([publicApi.stockSummary(), publicApi.stockHealth()]);
      setStockSummary(summary);
      setStockHealth(health);
      setStockUpdatedAt(new Date());
    } catch {
      // Keep existing values if background refresh fails.
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadStockSummary(true);
    const intervalId = window.setInterval(() => {
      void loadStockSummary(false);
    }, 90000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const totalUnits = stockSummary.reduce((sum, s) => sum + s.total_units, 0);
  const sufficient = stockSummary.filter(s => s.total_units > 30);
  const moderate = stockSummary.filter(s => s.total_units > 15 && s.total_units <= 30);
  const low = stockSummary.filter(s => s.total_units <= 15);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-foreground py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(0_72%_51%/0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(0_72%_51%/0.1),transparent_50%)]" />
        <div className="container relative mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <Activity className="mr-1.5 inline h-3.5 w-3.5 animate-pulse" />
              Live Inventory
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl font-display text-3xl font-bold leading-tight text-primary-foreground sm:text-4xl md:text-5xl">
              Blood Stock<br />
              <span className="text-primary">Availability</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-primary-foreground/60">
              Real-time blood inventory updated after every donation and request.
              Check availability across all blood groups instantly.
            </p>
            <p className="mt-3 text-xs text-primary-foreground/70">
              {stockUpdatedAt
                ? `Last updated: ${stockUpdatedAt.toLocaleTimeString()}`
                : "Last updated: --"}
            </p>
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                className="border-white/30 bg-white/10 !text-white hover:bg-white/20"
                disabled={refreshing}
                onClick={() => {
                  void loadStockSummary(false);
                }}
              >
                {refreshing ? "Refreshing..." : "Refresh Live Data"}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Overlapping Stats */}
      <section className="relative z-10 -mt-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 max-w-4xl mx-auto">
            {[
              { label: 'Total Units', value: stockHealth.total_units || totalUnits, icon: Droplets, color: 'text-primary' },
              { label: 'Available', value: stockHealth.available, icon: CheckCircle, color: 'text-emerald-600' },
              { label: 'Low Stock', value: stockHealth.low, icon: TrendingDown, color: 'text-amber-600' },
              { label: 'Expired', value: stockHealth.expired, icon: AlertTriangle, color: 'text-red-600' },
            ].map((stat, i) => (
              <motion.div key={stat.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Card className="border-none bg-card shadow-elevated text-center">
                  <CardContent className="flex items-center justify-center gap-3 p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div className="text-left">
                      <p className={`text-2xl font-bold ${stat.color}`}>
                        {loading ? '—' : stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blood Group Grid */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
              <Droplets className="mr-1.5 inline h-4 w-4" />
              All Blood Groups
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold text-foreground md:text-4xl">
              Detailed Inventory
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Current stock levels for every blood group at a glance
            </p>
          </motion.div>

          {/* Legend */}
          <div className="mx-auto mt-10 flex flex-wrap items-center justify-center gap-5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Sufficient (&gt;30 units)</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Moderate (16–30 units)</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Low (≤15 units)</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : stockSummary.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <Droplets className="mx-auto h-14 w-14 mb-4 opacity-30" />
              <p className="text-lg font-semibold">No stock data available</p>
              <p className="text-sm mt-1">Stock information will appear once blood inventory is updated.</p>
            </div>
          ) : (
            <div className="mx-auto mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5 max-w-4xl">
              {stockSummary.map((s, index) => {
                const level = s.total_units > 30 ? 'sufficient' : s.total_units > 15 ? 'moderate' : 'low';
                const config = {
                  sufficient: {
                    border: 'border-emerald-200 hover:border-emerald-300',
                    glow: 'shadow-emerald-500/5 hover:shadow-emerald-500/10',
                    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    icon: CheckCircle,
                    iconColor: 'text-emerald-500',
                    label: 'Sufficient',
                    unitColor: 'text-emerald-600',
                  },
                  moderate: {
                    border: 'border-amber-200 hover:border-amber-300',
                    glow: 'shadow-amber-500/5 hover:shadow-amber-500/10',
                    badge: 'bg-amber-50 text-amber-700 border-amber-200',
                    icon: TrendingDown,
                    iconColor: 'text-amber-500',
                    label: 'Moderate',
                    unitColor: 'text-amber-600',
                  },
                  low: {
                    border: 'border-red-200 hover:border-red-300',
                    glow: 'shadow-red-500/5 hover:shadow-red-500/10',
                    badge: 'bg-red-50 text-red-700 border-red-200',
                    icon: AlertTriangle,
                    iconColor: 'text-red-500',
                    label: 'Low',
                    unitColor: 'text-red-600',
                  },
                }[level];

                const StatusIcon = config.icon;

                return (
                  <motion.div
                    key={s.blood_group}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06, duration: 0.4 }}
                    className={`group relative overflow-hidden rounded-2xl border bg-card p-6 text-center shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${config.border} ${config.glow}`}
                  >
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-muted/20 opacity-0 transition-opacity group-hover:opacity-100" />

                    <div className="relative z-10">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/20 transition-transform group-hover:scale-105">
                        <span className="text-base font-extrabold text-white">{s.blood_group}</span>
                      </div>

                      <p className={`mt-4 text-4xl font-extrabold tracking-tight ${config.unitColor}`}>
                        {s.total_units}
                      </p>
                      <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mt-1">
                        units available
                      </p>

                      <div className={`mt-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${config.badge}`}>
                        <StatusIcon className={`h-3.5 w-3.5 ${config.iconColor}`} />
                        {config.label}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-2xl p-6 text-center sm:p-10 md:p-16">
            <img src={ctaBg} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10">
              <Heart className="mx-auto h-12 w-12 text-white/80" />
              <h2 className="mt-4 font-display text-2xl font-bold !text-white sm:text-3xl md:text-4xl">
                Every Unit Counts
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-white/80">
                See low stock? Your single donation can replenish supply and save up to three lives.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/register"><Heart className="mr-2 h-5 w-5" /> Become a Donor</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-white/30 bg-white/10 !text-white hover:bg-white/20">
                  <Link to="/camps">Find a Camp <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
