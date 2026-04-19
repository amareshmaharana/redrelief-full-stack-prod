import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Search, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="relative overflow-hidden py-20 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(0_72%_51%/0.12),transparent_55%)]" />
        <div className="container relative mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-4xl"
          >
            <Card className="overflow-hidden border-border shadow-elevated">
              <div className="h-1 gradient-blood" />
              <CardContent className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:p-10">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-destructive">
                    <ShieldAlert className="h-4 w-4" /> Route not found
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">404</p>
                    <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                      This page does not exist.
                    </h1>
                    <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                      The route <span className="font-mono text-foreground">{location.pathname}</span> is not available in this platform.
                      Use the navigation below to go back to the main experience.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button asChild className="gap-2 sm:flex-1">
                      <Link to="/">
                        <ArrowLeft className="h-4 w-4" />
                        Back to home
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="gap-2 sm:flex-1">
                      <Link to="/camps">
                        <Search className="h-4 w-4" />
                        Browse camps
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-3xl border bg-foreground p-8 text-white shadow-2xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(0_72%_51%/0.35),transparent_55%)]" />
                  <div className="relative space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
                        RedRelief
                      </span>
                      <span className="text-xs uppercase tracking-[0.2em] text-white/50">Error 404</span>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                      <p className="text-sm font-semibold text-white/80">System note</p>
                      <p className="mt-2 text-lg font-bold">The requested route is not registered.</p>
                      <p className="mt-2 text-sm leading-6 text-white/70">
                        The platform has redirected you to a branded error screen so the experience still feels intentional.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/50">Current path</p>
                        <p className="mt-2 font-mono text-sm text-white/90 break-all">{location.pathname}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/50">Recovery</p>
                        <p className="mt-2 text-sm text-white/80">Return home or open the camps page from the buttons on the left.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
