import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Heart,
  Menu,
  X,
  ArrowRight,
  User,
  LogOut,
  Settings,
  LayoutDashboard,
  ChevronDown,
  Shield,
  Stethoscope,
  HandHeart,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthSession, clearAuthSession } from "@/lib/auth-session";

function getNavItems(role?: string) {
  switch (role) {
    case "admin":
      return [
        { label: "Home", path: "/admin" },
        { label: "Dashboard", path: "/admin/dashboard" },
        { label: "Blood Stock", path: "/admin/stock" },
        { label: "Camps", path: "/admin/camps" },
      ];
    case "donor":
      return [
        { label: "Home", path: "/donor" },
        { label: "Find Camps", path: "/donor/camps" },
        { label: "Donate", path: "/donor/request-donation" },
        { label: "Dashboard", path: "/donor/dashboard" },
      ];
    case "recipient":
      return [
        { label: "Home", path: "/recipient" },
        { label: "Request Blood", path: "/recipient/request-blood" },
        { label: "Blood Stock", path: "/recipient/blood-stock" },
        { label: "Dashboard", path: "/recipient/dashboard" },
      ];
    case "hospital":
      return [
        { label: "Home", path: "/hospital" },
        { label: "Order Blood", path: "/hospital/request-blood" },
        { label: "Inventory", path: "/hospital/blood-stock" },
        { label: "Dashboard", path: "/hospital/dashboard" },
      ];
    case "clinic":
      return [
        { label: "Home", path: "/clinic" },
        { label: "Order Blood", path: "/clinic/request-blood" },
        { label: "Inventory", path: "/clinic/blood-stock" },
        { label: "Dashboard", path: "/clinic/dashboard" },
      ];
    default:
      return [
        { label: "Home", path: "/" },
        { label: "About", path: "/about" },
        { label: "Camps", path: "/camps" },
        { label: "Contact", path: "/contact" },
      ];
  }
}

const roleThemes: Record<
  string,
  {
    badge: string;
    avatar: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    accent: string;
  }
> = {
  admin: {
    badge:
      "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-red-500/25",
    avatar: "bg-gradient-to-br from-red-500 to-rose-600 text-white",
    icon: Shield,
    label: "Admin",
    accent: "text-red-600",
  },
  donor: {
    badge:
      "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/25",
    avatar: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white",
    icon: HandHeart,
    label: "Donor",
    accent: "text-emerald-600",
  },
  recipient: {
    badge:
      "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25",
    avatar: "bg-gradient-to-br from-blue-500 to-indigo-600 text-white",
    icon: Stethoscope,
    label: "Recipient",
    accent: "text-blue-600",
  },
  hospital: {
    badge:
      "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/25",
    avatar: "bg-gradient-to-br from-amber-500 to-orange-600 text-white",
    icon: Building2,
    label: "Hospital",
    accent: "text-amber-600",
  },
  clinic: {
    badge:
      "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/25",
    avatar: "bg-gradient-to-br from-amber-500 to-orange-600 text-white",
    icon: Building2,
    label: "Clinic",
    accent: "text-amber-600",
  },
};

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const session = useAuthSession();

  // Lock body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Track scroll to toggle navbar link colors on role homepages
  useEffect(() => {
    const handleScroll = () => setScrolledPastHero(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = getNavItems(session?.user.role);
  const homeLink = session ? `/${session.user.role}` : "/";
  const isRoleHome = session && location.pathname === `/${session.user.role}`;
  const isPublicHome = !session && location.pathname === "/";
  const useWhiteLinks = (isRoleHome || isPublicHome) && !scrolledPastHero;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-3 pointer-events-none">
        <nav className="pointer-events-auto mx-auto max-w-6xl rounded-2xl border border-gray-400/50 bg-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.08)] ring-1 ring-gray-400/20 backdrop-blur-3xl backdrop-saturate-150 dark:bg-black/30 dark:border-gray-500/50 dark:ring-gray-500/20">
          <div className="flex h-14 items-center justify-between px-5">
            <Link
              to={homeLink}
              className="flex items-center gap-2 font-display text-xl font-bold text-primary"
            >
              <img src="/bdms-logo.png" alt="BDMS Logo" className="h-7 w-8.5" />
              <span className="text-black dark:text-white text-xl">
                Red<span className="text-red-600">Relief</span>
              </span>
            </Link>

            {/* Desktop */}
            <div className="hidden items-center gap-0.5 md:flex">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`rounded-xl px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200 ${
                      isActive
                        ? useWhiteLinks
                          ? "bg-white/20 text-white"
                          : "bg-black/8 text-foreground dark:bg-white/15"
                        : useWhiteLinks
                          ? "text-white/80 hover:text-white hover:bg-white/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="hidden items-center gap-2.5 md:flex">
              {session ? (
                (() => {
                  const theme =
                    roleThemes[session.user.role] ?? roleThemes.donor;
                  const RoleIcon = theme.icon;
                  return (
                    <>
                      <Link
                        to={`/${session.user.role}`}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all hover:scale-105 hover:shadow-md ${theme.badge}`}
                      >
                        <RoleIcon className="h-3 w-3" />
                        {theme.label}
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center gap-2 rounded-full border border-border/40 bg-white/60 dark:bg-white/10 px-2.5 py-1 text-sm font-medium text-foreground shadow-sm transition-all hover:shadow-md hover:bg-white/80 dark:hover:bg-white/20 outline-none backdrop-blur-sm">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${theme.avatar}`}
                            >
                              {session.user.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-left hidden lg:block">
                              <p className="text-sm font-semibold leading-none">
                                {session.user.full_name}
                              </p>
                              <p
                                className={`text-[10px] font-medium mt-0.5 ${theme.accent}`}
                              >
                                {theme.label} Account
                              </p>
                            </div>
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-52 rounded-xl p-1.5"
                        >
                          <div className="px-3 py-2 mb-1">
                            <p className="text-sm font-semibold text-foreground">
                              {session.user.full_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {session.user.mobile}
                            </p>
                          </div>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            asChild
                            className="gap-2.5 rounded-lg cursor-pointer mt-1"
                          >
                            <Link to={`/${session.user.role}/dashboard`}>
                              <LayoutDashboard className="h-4 w-4" /> Dashboard
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            asChild
                            className="gap-2.5 rounded-lg cursor-pointer"
                          >
                            <Link to={`/${session.user.role}/profile`}>
                              <Settings className="h-4 w-4" /> Profile Settings
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="gap-2.5 rounded-lg cursor-pointer text-destructive focus:text-destructive"
                            onClick={() => {
                              clearAuthSession();
                              navigate("/");
                            }}
                          >
                            <LogOut className="h-4 w-4" /> Sign Out
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  );
                })()
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="rounded-xl text-[13px] font-medium"
                  >
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button
                    size="sm"
                    asChild
                    className="rounded-xl text-[13px] font-medium shadow-md"
                  >
                    <Link to="/register">
                      <Heart className="mr-1 h-3.5 w-3.5" /> Donate Now
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              className="relative z-[60] flex h-9 w-9 items-center justify-center rounded-xl md:hidden"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {open ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6 text-primary-foreground" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-5 w-5 text-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </nav>
      </div>

      {/* Full-screen mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[55] flex flex-col bg-foreground md:hidden"
          >
            {/* Header with logo and close button */}
            <div className="flex h-16 shrink-0 items-center justify-between px-8">
              <Link
                to={homeLink}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 font-display text-xl font-bold text-primary"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-200">
                  <img src="/bdms-logo.png" className="h-5 w-6" />
                </div>
                <span className="text-2xl">
                  Red<span className="text-red-800">Relief</span>
                </span>
              </Link>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20"
              >
                <X className="h-5 w-5 text-primary-foreground" />
              </button>
            </div>

            {/* Navigation links */}
            <div className="flex flex-1 flex-col justify-center px-8">
              <nav className="space-y-2">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setOpen(false)}
                      className={`group flex items-center justify-between rounded-2xl px-5 py-4 text-2xl font-semibold transition-colors ${
                        location.pathname === item.path
                          ? "bg-primary/20 text-primary"
                          : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                      }`}
                    >
                      {item.label}
                      <ArrowRight className="h-5 w-5 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* CTA buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.4 }}
                className="mt-10 space-y-3"
              >
                {session ? (
                  (() => {
                    const theme =
                      roleThemes[session.user.role] ?? roleThemes.donor;
                    const RoleIcon = theme.icon;
                    return (
                      <>
                        <div className="flex items-center gap-3 rounded-2xl bg-primary-foreground/5 p-4 mb-2">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-full text-base font-bold ${theme.avatar}`}
                          >
                            {session.user.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-semibold text-primary-foreground truncate">
                              {session.user.full_name}
                            </p>
                            <p className="text-xs text-primary-foreground/50 flex items-center gap-1 mt-0.5">
                              <RoleIcon className="h-3 w-3" /> {theme.label}{" "}
                              Account
                            </p>
                          </div>
                        </div>
                        <Button
                          asChild
                          className={`h-13 w-full rounded-2xl px-4 text-base font-bold shadow-md transition-all hover:scale-[1.02] ${theme.badge}`}
                        >
                          <Link
                            to={`/${session.user.role}/dashboard`}
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-center gap-2"
                          >
                            <LayoutDashboard className="h-5 w-5" /> Go to
                            Dashboard
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-13 w-full rounded-2xl border-primary-foreground/20 bg-primary-foreground/10 text-base text-primary-foreground hover:bg-primary-foreground/20"
                          onClick={() => {
                            clearAuthSession();
                            navigate("/");
                            setOpen(false);
                          }}
                        >
                          <LogOut className="mr-2 h-5 w-5" /> Sign Out
                        </Button>
                      </>
                    );
                  })()
                ) : (
                  <>
                    <Button
                      variant="outline"
                      asChild
                      className="h-13 w-full rounded-2xl border-primary-foreground/20 bg-primary-foreground/10 text-base text-primary-foreground hover:bg-primary-foreground/20"
                    >
                      <Link to="/login" onClick={() => setOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="h-13 w-full rounded-2xl text-base"
                    >
                      <Link to="/register" onClick={() => setOpen(false)}>
                        <Heart className="mr-2 h-5 w-5" /> Donate Now
                      </Link>
                    </Button>
                  </>
                )}
              </motion.div>
            </div>

            {/* Bottom decorative */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="px-8 pb-8 text-center"
            >
              <p className="text-xs text-primary-foreground/30">
                Save lives, one drop at a time. <br /> Join the RedRelief community today.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
