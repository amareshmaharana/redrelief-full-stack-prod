import { useState } from "react";
import { toast } from "sonner";
import {
  Droplets,
  Heart,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EligibilityGuideDialog } from "@/components/dialogs/EligibilityGuideDialog";
import { DonationProcessDialog } from "@/components/dialogs/DonationProcessDialog";
import { FAQsDialog } from "@/components/dialogs/FAQsDialog";
import { publicApi } from "@/lib/backend-api";

export function Footer() {
  const [eligibilityOpen, setEligibilityOpen] = useState(false);
  const [donationOpen, setDonationOpen] = useState(false);
  const [faqsOpen, setFaqsOpen] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    publicApi
      .subscribeNewsletter(email)
      .then((response) => {
        toast.success(response.message ?? `Welcome email sent to ${email}.`);
        setEmail("");
      })
      .catch((error) => {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to subscribe right now.";
        toast.error(message);
      });
  };

  return (
    <>
      <EligibilityGuideDialog
        open={eligibilityOpen}
        onOpenChange={setEligibilityOpen}
      />
      <DonationProcessDialog
        open={donationOpen}
        onOpenChange={setDonationOpen}
      />
      <FAQsDialog open={faqsOpen} onOpenChange={setFaqsOpen} />

      <footer className="relative overflow-hidden bg-foreground text-white">
        {/* Decorative top wave */}
        <div className="absolute top-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 60L48 52C96 44 192 28 288 22C384 16 480 20 576 28C672 36 768 48 864 48C960 48 1056 36 1152 28C1248 20 1344 16 1392 14L1440 12V0H1392C1344 0 1248 0 1152 0C1056 0 960 0 864 0C768 0 672 0 576 0C480 0 384 0 288 0C192 0 96 0 48 0H0V60Z"
              fill="hsl(var(--background))"
            />
          </svg>
        </div>

        {/* Newsletter section */}
        <div className="container mx-auto px-4 pt-20 pb-12">
          <div className="mb-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-8 md:p-10">
            <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
              <div>
                <h3 className="text-xl font-bold">Stay Updated</h3>
                <p className="mt-1 text-sm text-white/70">
                  Get notified about upcoming blood camps & urgent requests
                </p>
              </div>
              <div className="flex w-full max-w-md gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-white/30"
                />
                <Button
                  variant="secondary"
                  className="shrink-0"
                  onClick={handleSubscribe}
                >
                  Subscribe <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main footer grid */}
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link
                to="/"
                className="inline-flex items-center gap-2 font-display text-2xl font-bold"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-200">
                  <img src="/bdms-logo.png" className="h-5 w-6" />
                </div>
                <span className="text-2xl font-extrabold">
                  Red<span className="text-red-800">Relief</span>
                </span>
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-white/60">
                Connecting donors with those in need. Our mission is to ensure
                no life is lost due to blood shortage.
              </p>
              <div className="mt-6 flex gap-3">
                {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                  <span
                    key={i}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-primary cursor-default"
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
                Quick Links
              </h4>
              <div className="flex flex-col gap-3">
                {[
                  { to: "/about", label: "About Us" },
                  { to: "/camps", label: "Blood Camps" },
                  { to: "/contact", label: "Contact" },
                  { to: "/register", label: "Become a Donor" },
                  { to: "/login", label: "Sign In" },
                ].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="group flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
                Resources
              </h4>
              <div className="flex flex-col gap-3">
                {[
                  {
                    label: "Eligibility Guide",
                    action: () => setEligibilityOpen(true),
                  },
                  {
                    label: "Donation Process",
                    action: () => setDonationOpen(true),
                  },
                  { label: "FAQs", action: () => setFaqsOpen(true) },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="group flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white text-left"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                    {item.label}
                  </button>
                ))}
                {[
                  { to: "/privacy-policy", label: "Privacy Policy" },
                  { to: "/terms-of-service", label: "Terms of Service" },
                ].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="group flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
                Contact Us
              </h4>
              <div className="flex flex-col gap-4 text-sm text-white/60">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>123 Healthcare Avenue, Mumbai, Maharashtra 400001</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 shrink-0 text-primary" />
                  <span>support@redrelief.org</span>
                </div>
                <div className="mt-2 rounded-xl bg-primary/20 border border-primary/30 p-4">
                  <p className="text-xs font-medium text-white/40 uppercase tracking-wider">
                    24/7 Blood Helpline
                  </p>
                  <p className="mt-1 text-xl font-bold text-primary">
                    1800-XXX-XXXX
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
            <p className="text-sm text-white/40">
              &copy; {new Date().getFullYear()}{" "}
              <span className="font-semibold text-white/60">Red</span>
              <span className="font-semibold bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
                Relief
              </span>
              . All rights reserved.
            </p>
            <p className="text-sm text-white/60 text-center">
              Save lives, one drop at a time. <br /> Join the RedRelief
              community today.
            </p>
            <div className="flex items-center gap-1 text-sm text-white/40">
              Made with{" "}
              <Heart
                className="h-4 w-4 text-primary mx-1"
                fill="currentColor"
              />{" "}
              for saving lives
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
