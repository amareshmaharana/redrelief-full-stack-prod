import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MapPin, Search, ShieldCheck, Users, ArrowRight, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { publicApi, mapCamp } from "@/lib/backend-api";
import { formatCampLocation } from "@/lib/camp-location";
import { formatCampDisplayId, getCampRegistrationCount, getCampRegistrationRecord, isCampRegistered, registerCampLocally, subscribeCampRegistry } from "@/lib/camp-registry";
import { useAuthSession } from "@/lib/auth-session";
import type { BloodCamp } from "@/types";

const statusStyles: Record<string, string> = {
  upcoming: "bg-info/10 text-info border-info/20",
  ongoing: "bg-success/10 text-success border-success/20",
  completed: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function CampDetails() {
  const { campId = "" } = useParams();
  const navigate = useNavigate();
  const session = useAuthSession();
  const [camp, setCamp] = useState<BloodCamp | null>(null);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("A+");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const loadCamp = async () => {
      setLoading(true);
      try {
        const camps = await publicApi.camps();
        const mapped = camps.map(mapCamp);
        const found = mapped.find((item) => item.id === campId) ?? null;
        setCamp(found);
      } catch {
        setCamp(null);
      } finally {
        setLoading(false);
      }
    };

    void loadCamp();
  }, [campId]);

  useEffect(() => {
    const unsubscribe = subscribeCampRegistry(() => setVersion((current) => current + 1));
    return unsubscribe;
  }, []);

  const registrationCount = useMemo(() => {
    void version;
    return camp ? getCampRegistrationCount(camp.id) : 0;
  }, [camp, version]);
  const registered = camp ? isCampRegistered(camp.id) : false;
  const registrationRecord = camp ? getCampRegistrationRecord(camp.id) : null;
  const baseRegistered = camp?.registeredDonors ?? 0;
  const registeredDonors = baseRegistered + registrationCount;
  const spotsLeft = camp ? Math.max(camp.maxDonors - registeredDonors, 0) : 0;
  const fillPercent = camp ? Math.min((registeredDonors / camp.maxDonors) * 100, 100) : 0;
  const displayId = camp ? formatCampDisplayId(camp.id) : "CMP-000";

  const handleRegister = async () => {
    if (!camp) {
      return;
    }

    if (!session) {
      navigate(`/register?role=donor&campId=${camp.id}`);
      return;
    }

    if (session.user.role !== "donor") {
      navigate("/register");
      return;
    }

    if (!session.user.full_name.trim()) {
      toast.error("Unable to detect donor name.");
      return;
    }

    setSubmitting(true);
    try {
      registerCampLocally({
        campId: camp.id,
        donorName: session.user.full_name,
        bloodGroup: selectedBloodGroup,
        message,
      });
      setDone(true);
      toast.success("Camp registration saved.");
    } catch (error) {
      const text = error instanceof Error ? error.message : "Unable to register right now.";
      toast.error(text);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="container mx-auto px-4 py-24">
          <Card className="mx-auto max-w-3xl border-border shadow-card">
            <CardContent className="py-16 text-center text-muted-foreground">Loading camp details...</CardContent>
          </Card>
        </section>
        <Footer />
      </div>
    );
  }

  if (!camp) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="container mx-auto px-4 py-24">
          <Card className="mx-auto max-w-3xl border-border shadow-card">
            <CardContent className="space-y-4 py-16 text-center">
              <p className="text-xl font-bold text-foreground">Camp not found</p>
              <p className="text-sm text-muted-foreground">The camp you are looking for no longer exists.</p>
              <Button asChild>
                <Link to="/camps">Back to camps</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden bg-foreground py-16 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(0_72%_51%/0.18),transparent_58%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/90 to-transparent" />
        <div className="container relative mx-auto px-4">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            <Badge variant="outline" className={`shrink-0 ${statusStyles[camp.status]}`}>
              {camp.status.charAt(0).toUpperCase() + camp.status.slice(1)} Camp
            </Badge>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mt-10 max-w-4xl space-y-6"
          >
            <span className="inline-block rounded-full bg-primary-foreground/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground/90 backdrop-blur-sm">
              Camp details
            </span>
            <h1 className="mt-5 font-display text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
              {camp.name}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
              {camp.description || "This camp brings donors and patients together through a coordinated blood donation drive."}
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-white/55">Status</p>
                <p className="mt-2 text-lg font-bold">{camp.status.charAt(0).toUpperCase() + camp.status.slice(1)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-white/55">Venue</p>
                <p className="mt-2 text-lg font-bold">{camp.city}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-white/55">Camp ID</p>
                <p className="mt-2 text-lg font-bold tracking-[0.18em]">{displayId}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 -mt-8 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <Card className="border-border shadow-elevated">
              <CardContent className="space-y-6 p-6 sm:p-8">
                <div className="rounded-2xl border bg-muted/30 p-4 sm:p-5">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Search className="h-4 w-4 text-primary" />
                    <span>Camp ID</span>
                  </div>
                  <Input readOnly value={displayId} className="mt-3 bg-background font-mono text-base tracking-[0.18em]" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border bg-card p-5">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Location</p>
                    <p className="mt-2 text-base font-semibold text-foreground">{formatCampLocation(camp.address, camp.city, camp.state)}</p>
                  </div>
                  <div className="rounded-2xl border bg-card p-5">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Organizer description</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {camp.description || "Prepared by the admin at camp creation with venue details, timeline, and donation capacity."}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border bg-card p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Date</p>
                    <p className="mt-2 text-base font-semibold text-foreground">{camp.date}</p>
                  </div>
                  <div className="rounded-2xl border bg-card p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Time</p>
                    <p className="mt-2 text-base font-semibold text-foreground">{camp.startTime} - {camp.endTime}</p>
                  </div>
                  <div className="rounded-2xl border bg-card p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Organizer</p>
                    <p className="mt-2 text-base font-semibold text-foreground">{camp.organizer}</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border bg-card p-5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Calendar className="h-4 w-4 text-primary" />
                      Schedule
                    </div>
                    <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2.5"><Clock className="h-4 w-4 text-primary/70" /> {camp.startTime} - {camp.endTime}</div>
                      <div className="flex items-center gap-2.5"><MapPin className="h-4 w-4 text-primary/70" /> {formatCampLocation(camp.address, camp.city, camp.state)}</div>
                    </div>
                  </div>
                  <div className="rounded-2xl border bg-card p-5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Users className="h-4 w-4 text-primary" />
                      Capacity
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{registeredDonors} / {camp.maxDonors} registered</span>
                        <span className={spotsLeft === 0 ? "font-semibold text-destructive" : "font-semibold text-success"}>
                          {spotsLeft > 0 ? `${spotsLeft} spots left` : "Fully booked"}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full gradient-blood transition-all duration-500" style={{ width: `${fillPercent}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border bg-muted/20 p-5">
                  <p className="text-sm font-semibold text-foreground">About this camp</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {camp.description || "A professionally organized donation drive with smooth registration, verified donation support, and live availability tracking."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {registered && registrationRecord ? (
                <Card className="border-emerald-200 bg-emerald-50/70 shadow-card">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-center gap-3 text-emerald-700">
                      <ShieldCheck className="h-6 w-6" />
                      <div>
                        <p className="text-lg font-bold">You are already registered</p>
                        <p className="text-sm text-emerald-700/80">Ready for the donation day to save a life.</p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-emerald-200 bg-white/70 p-4 text-sm">
                      <p className="font-semibold text-emerald-800">Registration summary</p>
                      <p className="mt-2 text-emerald-700">Donor: {registrationRecord.donorName}</p>
                      <p className="text-emerald-700">Blood Group: {registrationRecord.bloodGroup}</p>
                    </div>
                    <Button asChild className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
                      <Link to="/donor/dashboard">Back to dashboard</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : done ? (
                <Card className="border-success/30 bg-success/10 shadow-card">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-center gap-3 text-success">
                      <Heart className="h-6 w-6" />
                      <div>
                        <p className="text-lg font-bold">Registration successful</p>
                        <p className="text-sm text-success/80">Your camp registration has been saved locally.</p>
                      </div>
                    </div>
                    <Button asChild className="w-full bg-success text-success-foreground hover:bg-success/90">
                      <Link to="/donor/dashboard">Back to dashboard</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border shadow-card">
                  <CardContent className="space-y-5 p-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Register now</p>
                      <h2 className="mt-2 text-2xl font-bold text-foreground">Join this camp</h2>
                      <p className="mt-2 text-sm text-muted-foreground">Use the register button below to continue. Public users will be sent to the registration flow first.</p>
                    </div>

                    <div className="space-y-3 rounded-2xl border bg-muted/20 p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant="outline" className={statusStyles[camp.status]}>{camp.status}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Camp ID</span>
                        <span className="font-mono text-xs font-semibold tracking-[0.18em] text-foreground">{displayId}</span>
                      </div>
                    </div>

                    <Button className="w-full" onClick={handleRegister} disabled={submitting}>
                      {session?.user.role === "donor" ? "Register" : "Go to Register"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/login/form">Login</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
