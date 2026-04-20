import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Link } from 'react-router-dom';
import { useAuthSession } from '@/lib/auth-session';
import { publicApi, type StockSummaryDTO } from '@/lib/backend-api';
import { motion } from 'framer-motion';
import {
  Heart,
  Droplets,
  Users,
  Calendar,
  ClipboardList,
  Building2,
  ArrowRight,
  LayoutDashboard,
  Search,
  Activity,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Zap,
  Globe,
  HelpCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const roleConfig = {
  admin: {
    greeting: 'Command Center',
    tagline: 'You\'re the backbone of this system.',
    headline: 'Every life saved starts\nwith your decisions.',
    subtitle: 'Oversee operations, manage the blood bank ecosystem, and ensure no request goes unanswered. Your dashboard awaits.',
    gradient: 'from-gray-900 via-rose-800 to-red-500',
    glowColor: 'shadow-red-500/20',
    dotPattern: 'bg-red-400',
    faqAccent: 'text-red-600',
    faqBadge: 'bg-red-50 text-red-600',
    faqBorder: 'border-red-200',
    faqHover: 'hover:bg-red-50/50',
    actions: [
      { label: 'Manage Donors', desc: 'View, verify & manage donor accounts', icon: Users, path: '/admin/donors' },
      { label: 'Manage Recipients', desc: 'Oversee recipient activity & requests', icon: Heart, path: '/admin/recipients' },
      { label: 'Manage Hospitals', desc: 'Hospital registrations & blood orders', icon: Building2, path: '/admin/hospitals' },
      { label: 'Blood Stock', desc: 'Real-time inventory management', icon: Droplets, path: '/admin/stock' },
      { label: 'Donation Camps', desc: 'Create & schedule donation drives', icon: Calendar, path: '/admin/camps' },
      { label: 'All Requests', desc: 'Review & process all blood requests', icon: ClipboardList, path: '/admin/requests' },
    ],
    faqs: [
      { q: 'How do I add new blood stock?', a: 'Go to Blood Stock from your dashboard, click "Add Stock", select the blood group, quantity, and expiry date.' },
      { q: 'Can I manage donor accounts?', a: 'Yes — navigate to Manage Donors to view, verify, or deactivate donor profiles.' },
      { q: 'How do I create a blood donation camp?', a: 'Go to Donation Camps, click "Create Camp", fill in the details like date, location, and capacity.' },
      { q: 'How are blood requests processed?', a: 'Blood requests appear in All Requests. You can approve, reject, or assign them to available stock.' },
      { q: 'Can I see system-wide analytics?', a: 'Your dashboard shows real-time stats including total donors, stock levels, pending requests, and camp activity.' },
    ],
  },
  donor: {
    greeting: 'Hero Dashboard',
    tagline: 'You have the power to save lives.',
    headline: 'One donation.\nThree lives saved.',
    subtitle: 'Find a nearby camp, schedule your next donation, and track every drop that makes a difference. The world needs heroes like you.',
    gradient: 'from-teal-900 via-emerald-600 to-lime-400',
    glowColor: 'shadow-emerald-500/20',
    dotPattern: 'bg-emerald-400',
    faqAccent: 'text-emerald-600',
    faqBadge: 'bg-emerald-50 text-emerald-600',
    faqBorder: 'border-emerald-200',
    faqHover: 'hover:bg-emerald-50/50',
    actions: [
      { label: 'Find Camps', desc: 'Discover blood donation camps near you', icon: Calendar, path: '/donor/camps' },
      { label: 'Donate Now', desc: 'Submit a new donation request today', icon: Heart, path: '/donor/request-donation' },
      { label: 'My Dashboard', desc: 'Track donations & request history', icon: LayoutDashboard, path: '/donor/dashboard' },
      { label: 'My Profile', desc: 'Keep your details up to date', icon: Users, path: '/donor/profile' },
    ],
    faqs: [
      { q: 'How often can I donate blood?', a: 'You can donate whole blood every 56 days (about 8 weeks). Platelet donations can be done more frequently.' },
      { q: 'What should I do before donating?', a: 'Stay hydrated, eat a healthy meal, and avoid alcohol 24 hours before. Bring a valid ID to the camp.' },
      { q: 'How do I find a camp near me?', a: 'Click "Find Camps" to browse upcoming blood donation camps by city and date.' },
      { q: 'Can I track my donation history?', a: 'Yes — your Dashboard shows all past and upcoming donations with dates and status.' },
      { q: 'Is blood donation safe?', a: 'Absolutely. All equipment is sterile and single-use. The process is supervised by trained medical professionals.' },
    ],
  },
  recipient: {
    greeting: 'Care Portal',
    tagline: 'Help is always within reach.',
    headline: 'The blood you need,\nwhen you need it.',
    subtitle: 'Check real-time availability, submit requests instantly, and track fulfillment — all from one place. We\'re here for you.',
    gradient: 'from-slate-900 via-indigo-700 to-cyan-400',
    glowColor: 'shadow-indigo-500/20',
    dotPattern: 'bg-blue-400',
    faqAccent: 'text-indigo-600',
    faqBadge: 'bg-indigo-50 text-indigo-600',
    faqBorder: 'border-indigo-200',
    faqHover: 'hover:bg-indigo-50/50',
    actions: [
      { label: 'Request Blood', desc: 'Submit a new blood request instantly', icon: Droplets, path: '/recipient/request-blood' },
      { label: 'Blood Stock', desc: 'Check live blood availability', icon: Search, path: '/recipient/blood-stock' },
      { label: 'My Dashboard', desc: 'View your requests & fulfillment status', icon: LayoutDashboard, path: '/recipient/dashboard' },
      { label: 'My Profile', desc: 'Update your personal details', icon: Users, path: '/recipient/profile' },
    ],
    faqs: [
      { q: 'How do I request blood?', a: 'Click "Request Blood", select the blood group, quantity, and urgency level. Your request will be processed immediately.' },
      { q: 'How long does it take to get blood?', a: 'Urgent requests are prioritized and typically fulfilled within hours. Standard requests may take 1-2 days.' },
      { q: 'Can I check blood availability before requesting?', a: 'Yes — visit "Blood Stock" to see real-time availability of all blood groups.' },
      { q: 'How do I track my request status?', a: 'Your Dashboard shows all submitted requests with live status updates from pending to fulfilled.' },
      { q: 'What if my blood group is unavailable?', a: 'Your request will be queued and you\'ll be notified as soon as matching stock becomes available.' },
    ],
  },
  hospital: {
    greeting: 'Hospital Portal',
    tagline: 'Reliable blood supply for every patient.',
    headline: 'Critical supplies,\ndelivered on time.',
    subtitle: 'Place orders, monitor inventory, and ensure your hospital never runs short. We prioritize your patients\' needs.',
    gradient: 'from-amber-800 via-orange-500 to-yellow-300',
    glowColor: 'shadow-orange-500/20',
    dotPattern: 'bg-amber-400',
    faqAccent: 'text-amber-600',
    faqBadge: 'bg-amber-50 text-amber-600',
    faqBorder: 'border-amber-200',
    faqHover: 'hover:bg-amber-50/50',
    actions: [
      { label: 'Order Blood', desc: 'Place a blood supply request', icon: Droplets, path: '/hospital/request-blood' },
      { label: 'Blood Stock', desc: 'View current blood inventory levels', icon: Search, path: '/hospital/blood-stock' },
      { label: 'My Dashboard', desc: 'Track orders & delivery status', icon: LayoutDashboard, path: '/hospital/dashboard' },
      { label: 'Hospital Profile', desc: 'Manage hospital information', icon: Building2, path: '/hospital/profile' },
    ],
    faqs: [
      { q: 'How do I place a blood order?', a: 'Click "Order Blood", select the required blood groups and quantities. Emergency orders are fast-tracked.' },
      { q: 'Can I order blood for multiple patients?', a: 'Yes — you can place multiple orders with different blood groups and quantities in a single session.' },
      { q: 'How do I track delivery status?', a: 'Your Dashboard displays all orders with real-time status from placed to delivered.' },
      { q: 'What if I need blood urgently?', a: 'Mark your order as "Emergency" and it will be prioritized above standard requests.' },
      { q: 'How do I update hospital information?', a: 'Go to Hospital Profile to update address, contact person, registration number, and other details.' },
    ],
  },
  clinic: {
    greeting: 'Clinic Portal',
    tagline: 'Reliable blood support for every case.',
    headline: 'Critical supplies,\nwhen your clinic needs them.',
    subtitle: 'Place orders, monitor inventory, and keep your clinic prepared for urgent patient needs.',
    gradient: 'from-amber-800 via-orange-500 to-yellow-300',
    glowColor: 'shadow-orange-500/20',
    dotPattern: 'bg-amber-400',
    faqAccent: 'text-amber-600',
    faqBadge: 'bg-amber-50 text-amber-600',
    faqBorder: 'border-amber-200',
    faqHover: 'hover:bg-amber-50/50',
    actions: [
      { label: 'Order Blood', desc: 'Place a blood supply request', icon: Droplets, path: '/clinic/request-blood' },
      { label: 'Blood Stock', desc: 'View current blood inventory levels', icon: Search, path: '/clinic/blood-stock' },
      { label: 'My Dashboard', desc: 'Track orders & delivery status', icon: LayoutDashboard, path: '/clinic/dashboard' },
      { label: 'Clinic Profile', desc: 'Manage clinic information', icon: Building2, path: '/clinic/profile' },
    ],
    faqs: [
      { q: 'How do I place a blood order?', a: 'Click "Order Blood", select required blood groups and quantities, then submit for review.' },
      { q: 'Can clinics place urgent requests?', a: 'Yes. Add urgent clinical details while requesting so your case can be prioritized.' },
      { q: 'How do I track request status?', a: 'Open your dashboard to see each request status from pending to approved.' },
      { q: 'Can I check stock before requesting?', a: 'Yes, the Blood Stock page shows current available units by blood group.' },
      { q: 'How do I update clinic information?', a: 'Use Clinic Profile to update your clinic name, address, and contact details.' },
    ],
  },
} as const;

export default function AuthenticatedHome() {
  const session = useAuthSession();
  const [stockSummary, setStockSummary] = useState<StockSummaryDTO[]>([]);

  useEffect(() => {
    publicApi.stockSummary().then(setStockSummary).catch(() => {});
  }, []);

  if (!session) return null;

  const { user } = session;
  const config = roleConfig[user.role] ?? roleConfig.donor;
  const totalUnits = stockSummary.reduce((sum, s) => sum + s.total_units, 0);
  const firstName = user.full_name.split(' ')[0];

  return (
    <div className={`role-theme-${session.user.role} min-h-screen bg-background`}>
      <Navbar />

      {/* Hero Banner */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${config.gradient} py-20 md:py-28`}>
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-white/[0.07] blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-black/[0.08] blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-white/[0.03] blur-3xl" />
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="container relative mx-auto px-4">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="flex items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm border border-white/10">
                <Sparkles className="h-3.5 w-3.5" />
                {config.greeting}
              </span>
            </motion.div>

            <motion.p variants={fadeUp} className="text-sm font-medium text-white/60 uppercase tracking-widest mb-3">
              Welcome back, {firstName}
            </motion.p>

            <motion.h1 variants={fadeUp} className="font-display text-4xl font-extrabold leading-[1.1] text-white sm:text-5xl md:text-6xl lg:text-7xl whitespace-pre-line">
              {config.headline}
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-4 text-sm font-semibold text-white/80 md:text-base uppercase tracking-wider">
              {config.tagline}
            </motion.p>

            <motion.p variants={fadeUp} className="mt-3 max-w-xl text-white/60 text-sm md:text-base leading-relaxed">
              {config.subtitle}
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild className="bg-white text-foreground hover:bg-white/90 font-bold shadow-xl shadow-black/10 px-6">
                <Link to={`/${user.role}/dashboard`}>
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Open Dashboard
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/25 bg-white/10 !text-white hover:bg-white/20 backdrop-blur-sm font-semibold px-6">
                <Link to={`/${user.role}${user.role === 'admin' ? '/camps' : user.role === 'donor' ? '/camps' : '/blood-stock'}`}>
                  <Calendar className="mr-2 h-4 w-4" /> {user.role === 'recipient' || user.role === 'hospital' || user.role === 'clinic' ? 'Blood Stock' : 'Explore Camps'}
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="-mt-10 relative z-10 pb-16">
        <div className="container mx-auto px-4">
          <div className={`grid gap-4 ${config.actions.length > 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
            {config.actions.map((action, i) => (
              <motion.div
                key={action.path}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.06, type: 'spring', stiffness: 200, damping: 20 }}
              >
                <Link to={action.path} className="block h-full">
                  <Card className={`group h-full border bg-card shadow-lg ${config.glowColor} transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/20`}>
                    <CardContent className="flex items-start gap-4 p-5">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${config.gradient} text-white shadow-md transition-transform group-hover:scale-110`}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          {action.label}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{action.desc}</p>
                      </div>
                      <ArrowRight className="mt-1.5 h-4 w-4 shrink-0 text-muted-foreground/30 transition-all duration-300 group-hover:text-primary group-hover:translate-x-1" />
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blood Availability */}
      {stockSummary.length > 0 && (
        <section className="py-16 bg-muted/30">
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
                <span className="font-semibold text-foreground">{totalUnits.toLocaleString()}</span> total units across all blood groups — updated in real-time
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

      {/* Feature Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              Why RedRelief?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Built for trust, speed, and saving lives
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: 'Safe & Verified', desc: 'Every donation undergoes rigorous screening. Your safety and the recipient\'s well-being are non-negotiable.', delay: 0 },
              { icon: Zap, title: 'Instant Tracking', desc: 'From request to fulfillment — real-time status updates so you always know where things stand.', delay: 0.1 },
              { icon: Globe, title: 'Community Driven', desc: 'Join thousands of everyday heroes. Every drop donated is a life saved, a family reunited, a future preserved.', delay: 0.2 },
            ].map((card) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: card.delay }}
              >
                <Card className="group h-full border-border shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
                  <CardContent className="flex flex-col items-center p-8 text-center">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${config.gradient} text-white shadow-lg transition-transform group-hover:scale-110`}>
                      <card.icon className="h-7 w-7" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-foreground">{card.title}</h3>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold ${config.faqBadge}`}>
              <HelpCircle className="h-4 w-4" />
              FAQs
            </span>
            <h2 className="mt-5 font-display text-2xl font-bold text-foreground md:text-3xl">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Quick answers to common questions for your role
            </p>
          </motion.div>

          <div className="mx-auto max-w-2xl">
            <Accordion type="single" collapsible className="space-y-3">
              {config.faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <AccordionItem
                    value={`faq-${i}`}
                    className={`rounded-xl border ${config.faqBorder} bg-card px-5 shadow-sm transition-colors ${config.faqHover}`}
                  >
                    <AccordionTrigger className={`text-sm font-semibold text-foreground hover:no-underline [&[data-state=open]]:${config.faqAccent}`}>
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
