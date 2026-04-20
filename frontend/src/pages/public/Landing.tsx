import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Heart,
  Droplets,
  Users,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Shield,
  Clock,
  MapPin,
  Building2,
} from "lucide-react";
import { publicApi, mapCamp, type StockSummaryDTO } from "@/lib/backend-api";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import heroBg from "@/assets/hero-bg.jpg";
import ctaBg from "@/assets/cta-bg.jpg";
import { useState, useEffect, useRef } from "react";

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

const testimonials = [
  {
    name: "Aarav Sen",
    role: "Donor",
    avatar: "https://i.pravatar.cc/160?img=12",
    quote:
      "The camp finder made it simple to discover a nearby donation drive, and the reminders helped me show up on time. It turned a good intention into a real contribution.",
    benefit: "Nearby camp discovery and timely reminders",
    accent: "from-emerald-600 to-teal-500",
  },
  {
    name: "Meera Das",
    role: "Recipient",
    avatar: "https://i.pravatar.cc/160?img=32",
    quote:
      "When we needed blood urgently, the request flow was clear and fast. Seeing the stock availability and request status in one place reduced a huge amount of stress.",
    benefit: "Fast blood request tracking and stock visibility",
    accent: "from-blue-600 to-indigo-500",
  },
  {
    name: "Dr. Imran Khan",
    role: "Hospital",
    avatar: "https://i.pravatar.cc/160?img=18",
    quote:
      "Our team can manage inventory, review requests, and keep stock updated without switching tools. The workflow is organized enough to support real hospital operations.",
    benefit: "Inventory control and request handling in one dashboard",
    accent: "from-amber-500 to-orange-500",
  },
  {
    name: "Nandini Roy",
    role: "Clinic",
    avatar: "https://i.pravatar.cc/160?img=47",
    quote:
      "The platform gives our clinic a clean way to request blood and maintain stock visibility. It feels dependable, especially when every minute matters.",
    benefit: "Dependable request submission and stock management",
    accent: "from-rose-500 to-red-600",
  },
];

const roleCards = [
  {
    role: "Donor",
    title: "Become a Donor",
    description:
      "Register, discover nearby camps, and track your contribution through a smooth donation journey.",
    buttonLabel: "Become a Donor",
    href: "/register",
    accent: "from-emerald-600 via-emerald-500 to-teal-500",
    badge: "bg-white/15 text-white border-white/20",
    glow: "shadow-emerald-500/25",
    icon: Heart,
  },
  {
    role: "Recipient",
    title: "Request for Blood",
    description:
      "Submit a request, monitor its status, and view live blood availability with confidence.",
    buttonLabel: "Request Blood",
    href: "/register",
    accent: "from-blue-600 via-indigo-600 to-violet-500",
    badge: "bg-white/15 text-white border-white/20",
    glow: "shadow-blue-500/25",
    icon: Droplets,
  },
  {
    role: "Hospital",
    title: "Manage Hospital Stock",
    description:
      "Keep inventory organized, update blood units quickly, and process blood requests from one dashboard.",
    buttonLabel: "Hospital Access",
    href: "/register",
    accent: "from-amber-500 via-orange-500 to-red-500",
    badge: "bg-white/15 text-white border-white/20",
    glow: "shadow-amber-500/25",
    icon: Shield,
  },
  {
    role: "Clinic",
    title: "Handle Clinic Requests",
    description:
      "Maintain local stock visibility and submit urgent blood requests through a streamlined process.",
    buttonLabel: "Clinic Access",
    href: "/register",
    accent: "from-rose-500 via-red-500 to-red-600",
    badge: "bg-white/15 text-white border-white/20",
    glow: "shadow-rose-500/25",
    icon: Building2,
  },
];

export default function Landing() {
  const [stockSummary, setStockSummary] = useState<StockSummaryDTO[]>([]);
  const [activeCamps, setActiveCamps] = useState<number>(0);
  const [stockUpdatedAt, setStockUpdatedAt] = useState<Date | null>(null);
  const [stockHealth, setStockHealth] = useState({
    available: 0,
    low: 0,
    expired: 0,
  });
  const testimonialScrollRef = useRef<HTMLDivElement | null>(null);
  const roleScrollRef = useRef<HTMLDivElement | null>(null);

  const scrollRow = (
    ref: React.RefObject<HTMLDivElement | null>,
    direction: "left" | "right",
  ) => {
    const el = ref.current;
    if (!el) {
      return;
    }

    const distance = Math.max(320, Math.floor(el.clientWidth * 0.8));
    el.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const loadStockSummary = async () => {
      try {
        const [summary, health] = await Promise.all([
          publicApi.stockSummary(),
          publicApi.stockHealth(),
        ]);
        setStockSummary(summary);
        setStockHealth({
          available: health.available,
          low: health.low,
          expired: health.expired,
        });
        setStockUpdatedAt(new Date());
      } catch {
        // Ignore stock preview failures on landing.
      }
    };

    void loadStockSummary();
    const intervalId = window.setInterval(() => {
      void loadStockSummary();
    }, 30000);

    publicApi
      .camps()
      .then((camps) => {
        const ongoing = camps
          .map(mapCamp)
          .filter((camp) => camp.status === "ongoing").length;
        setActiveCamps(ongoing);
      })
      .catch(() => setActiveCamps(0));

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const totalUnits = stockSummary.reduce((sum, s) => sum + s.total_units, 0);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="container relative mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/20 px-4 py-1.5 text-sm font-medium text-primary-foreground backdrop-blur-sm">
              <Heart className="h-4 w-4" /> Every Drop Saves a Life
            </span>
            <h1 className="mt-6 font-display text-3xl font-extrabold leading-tight text-primary-foreground sm:text-4xl md:text-6xl lg:text-7xl">
              Your Blood Can
              <br />
              Be Someone's <span className="text-primary">Miracle</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-primary-foreground/80 sm:mt-6 sm:text-base md:text-lg">
              One donation. Three lives saved. Join thousands of everyday heroes
              who are making the difference between life and death.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="text-base font-semibold"
              >
                <Link to="/register">
                  <Heart className="mr-2 h-5 w-5" /> Become a Donor
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/30 bg-white/10 !text-white hover:bg-white/20 text-base"
              >
                <Link to="/camps">
                  Find a Camp <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="-mt-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {[
              { icon: Users, label: "Registered Donors", value: "1,248" },
              {
                icon: Droplets,
                label: "Units Available",
                value: totalUnits.toLocaleString(),
              },
              { icon: Calendar, label: "Active Camps", value: activeCamps },
              { icon: Heart, label: "Lives Saved", value: "3,200+" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl border bg-card p-4 text-center shadow-card sm:p-6"
              >
                <stat.icon className="mx-auto h-6 w-6 text-primary sm:h-8 sm:w-8" />
                <p className="mt-2 text-xl font-bold text-foreground sm:mt-3 sm:text-2xl">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
              Simple Process
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold text-foreground md:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              From registration to saving lives — just four simple steps
            </p>
          </motion.div>

          <div className="relative mt-16">
            {/* Connector line (desktop) */}
            <div className="absolute top-16 left-[12.5%] right-[12.5%] hidden h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 md:block" />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 md:grid-cols-4">
              {[
                {
                  icon: Users,
                  step: "01",
                  title: "Register",
                  desc: "Create your account as a donor, recipient, or hospital in under 2 minutes",
                  color: "from-red-500 to-rose-600",
                },
                {
                  icon: Calendar,
                  step: "02",
                  title: "Find a Camp",
                  desc: "Browse upcoming blood donation camps near your location with real-time availability",
                  color: "from-orange-500 to-red-500",
                },
                {
                  icon: Shield,
                  step: "03",
                  title: "Get Verified",
                  desc: "Quick health screening and eligibility check to ensure safe donation",
                  color: "from-rose-500 to-pink-600",
                },
                {
                  icon: Heart,
                  step: "04",
                  title: "Save Lives",
                  desc: "One donation can save up to 3 lives. Be the hero someone is waiting for",
                  color: "from-pink-500 to-red-600",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="group relative"
                >
                  {/* Step circle */}
                  <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center">
                    <div
                      className={`absolute inset-0 rounded-full bg-gradient-to-br ${item.color} opacity-20 transition-opacity group-hover:opacity-40`}
                    />
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${item.color} shadow-lg transition-transform group-hover:scale-110`}
                    >
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  {/* Card */}
                  <div className="mt-6 rounded-2xl border bg-card p-6 text-center shadow-card transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-elevated">
                    <span className="inline-block text-xs font-bold tracking-widest text-primary/60 uppercase">
                      Step {item.step}
                    </span>
                    <h3 className="mt-2 text-lg font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blood stock preview */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
              <Droplets className="mr-1.5 inline h-4 w-4" />
              Live Inventory
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold text-foreground md:text-4xl">
              Blood Availability
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Real-time stock updated after every donation
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {stockUpdatedAt
                ? `Last updated: ${stockUpdatedAt.toLocaleTimeString()}`
                : "Last updated: --"}
            </p>
          </motion.div>

          <div className="mx-auto mt-14 max-w-4xl overflow-hidden rounded-2xl border bg-card shadow-card">
            <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4 md:grid-cols-8">
              {stockSummary.map((s, index) => {
                const level =
                  s.total_units > 30
                    ? "high"
                    : s.total_units > 15
                      ? "medium"
                      : "low";
                const dotColor =
                  level === "high"
                    ? "bg-emerald-500"
                    : level === "medium"
                      ? "bg-amber-500"
                      : "bg-red-500";

                return (
                  <motion.div
                    key={s.blood_group}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06 }}
                    className="group flex flex-col items-center bg-card px-3 py-6 transition-colors hover:bg-accent/50"
                  >
                    <span className="text-xl font-extrabold text-primary sm:text-2xl">
                      {s.blood_group}
                    </span>
                    <span className="mt-2 text-2xl font-bold text-foreground sm:mt-3 sm:text-3xl">
                      {s.total_units}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-[11px]">
                      units
                    </span>
                    <span className={`mt-3 h-2 w-2 rounded-full ${dotColor}`} />
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="mx-auto mt-6 flex max-w-4xl flex-col items-start gap-3 px-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />{" "}
                Available: {stockHealth.available}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> Low
                Stock: {stockHealth.low}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500" /> Expired:{" "}
                {stockHealth.expired}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-xs text-muted-foreground hover:text-primary"
            >
              <Link to="/blood-stocks">
                View details <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-2xl p-6 text-center sm:p-10 md:p-16">
            <img
              src={ctaBg}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10">
              <Clock className="mx-auto h-12 w-12 text-white/80" />
              <h2 className="mt-4 font-display text-2xl font-bold !text-white sm:text-3xl md:text-4xl">
                Someone Needs Blood Every 2 Seconds
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-white/80">
                Your single donation can save up to three lives. Join our
                community of heroes today.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/register">Register Now</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-white/30 bg-white/10 !text-white hover:bg-white/20"
                >
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl"
            >
              <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                Community Stories
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold text-foreground md:text-4xl">
                Real Impact, Shared by Real People
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted-foreground md:mx-0">
                Testimonials that highlight how the platform improves access,
                trust, and speed for every role in the blood donation ecosystem.
              </p>
            </motion.div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Scroll testimonials left"
                onClick={() => scrollRow(testimonialScrollRef, "left")}
                className="h-10 w-10 rounded-full border-border bg-background shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-110 hover:border-primary/30 hover:bg-primary/5 hover:shadow-lg"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Scroll testimonials right"
                onClick={() => scrollRow(testimonialScrollRef, "right")}
                className="h-10 w-10 rounded-full border-border bg-background shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-110 hover:border-primary/30 hover:bg-primary/5 hover:shadow-lg"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative mt-10 overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-muted/30 to-transparent sm:w-16" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-muted/30 to-transparent sm:w-16" />
            <div
              ref={testimonialScrollRef}
              className="scrollbar-hide overflow-x-auto pb-4 scroll-smooth px-6 sm:px-10"
            >
              <div className="flex min-w-max gap-5 pr-6 sm:pr-10 snap-x snap-mandatory">
                {testimonials.map((item, index) => (
                  <motion.article
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: index * 0.08 }}
                    className="w-[320px] snap-start rounded-3xl border bg-card p-6 shadow-card sm:w-[360px] md:w-[400px]"
                  >
                    <div
                      className={`rounded-2xl bg-gradient-to-br ${item.accent} p-[1px]`}
                    >
                      <div className="rounded-[calc(theme(borderRadius.2xl)-1px)] bg-card p-5">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-14 w-14 ring-2 ring-white shadow-md">
                            <AvatarImage src={item.avatar} alt={item.name} />
                            <AvatarFallback>
                              {item.name
                                .split(" ")
                                .map((part) => part.charAt(0))
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold text-primary">
                              {item.role}
                            </p>
                            <h3 className="text-lg font-bold text-foreground">
                              {item.name}
                            </h3>
                          </div>
                        </div>

                        <p className="mt-5 text-sm leading-7 text-muted-foreground">
                          {item.quote}
                        </p>

                        <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Benefit
                          </p>
                          <p className="mt-1 text-sm font-medium text-foreground">
                            {item.benefit}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Actions */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl"
            >
              <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                Role-Based Journeys
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold text-foreground md:text-4xl">
                Choose the Experience That Fits You
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted-foreground md:mx-0">
                Four color-coded role cards with focused actions designed for
                donors, recipients, hospitals, and clinics.
              </p>
            </motion.div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Scroll roles left"
                onClick={() => scrollRow(roleScrollRef, "left")}
                className="h-10 w-10 rounded-full border-border bg-background shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-110 hover:border-primary/30 hover:bg-primary/5 hover:shadow-lg"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Scroll roles right"
                onClick={() => scrollRow(roleScrollRef, "right")}
                className="h-10 w-10 rounded-full border-border bg-background shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-110 hover:border-primary/30 hover:bg-primary/5 hover:shadow-lg"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative mt-10 overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-background to-transparent sm:w-16" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-background to-transparent sm:w-16" />
            <div
              ref={roleScrollRef}
              className="scrollbar-hide overflow-x-auto pb-4 scroll-smooth px-6 sm:px-10"
            >
              <div className="flex min-w-max gap-5 pr-6 sm:pr-10 snap-x snap-mandatory">
                {roleCards.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={item.role}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.45, delay: index * 0.08 }}
                      className="w-[300px] snap-start sm:w-[330px]"
                    >
                      <div
                        className={`h-full overflow-hidden rounded-3xl bg-gradient-to-br ${item.accent} ${item.glow} p-[1px]`}
                      >
                        <div className="flex h-full flex-col rounded-[calc(theme(borderRadius.3xl)-1px)] bg-transparent p-6 text-white shadow-card backdrop-blur-sm">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${item.badge}`}
                              >
                                {item.role}
                              </span>
                              <h3 className="mt-4 text-2xl font-bold text-white">
                                {item.title}
                              </h3>
                            </div>
                            <div
                              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white shadow-lg backdrop-blur-sm`}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                          </div>

                          <p className="mt-4 text-sm leading-7 text-white/90">
                            {item.description}
                          </p>

                          <Button
                            asChild
                            variant="secondary"
                            className="mt-6 w-full border border-white/20 bg-white text-foreground shadow-lg transition-transform hover:scale-[1.01] hover:bg-white/95"
                          >
                            <Link to={item.href}>{item.buttonLabel}</Link>
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
