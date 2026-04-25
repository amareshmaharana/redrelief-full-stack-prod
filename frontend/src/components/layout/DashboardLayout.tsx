import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  LogOut,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  AlertTriangle,
  CheckCircle,
  Info,
  AlertCircle,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import type { UserRole } from "@/types";
import { toast } from "sonner";
import { clearAuthSession, getAccessToken } from "@/lib/auth-session";
import { notificationApi, type NotificationDTO } from "@/lib/backend-api";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DashboardLayoutProps {
  role: UserRole;
  userName: string;
  navItems: NavItem[];
}

function isBackendConnectionError(message: string) {
  return message.toLowerCase().includes("cannot connect to backend");
}

export function DashboardLayout({
  role,
  userName,
  navItems,
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifList, setNotifList] = useState<
    Array<{
      id: number;
      title: string;
      message: string;
      type: "info" | "success" | "warning" | "error";
      read: boolean;
      createdAt: string;
    }>
  >([]);
  const location = useLocation();

  useEffect(() => {
    let disposed = false;
    let retryTimer: ReturnType<typeof setInterval> | null = null;
    let retryAttempts = 0;
    const MAX_RETRY_ATTEMPTS = 6;

    const clearRetryTimer = () => {
      if (retryTimer) {
        clearInterval(retryTimer);
        retryTimer = null;
      }
    };

    const loadNotifications = async () => {
      try {
        const data = await notificationApi.list();
        if (disposed) {
          return;
        }
        setNotifList(
          data.map((item: NotificationDTO) => ({
            id: item.id,
            title: item.title,
            message: item.message,
            type: item.type,
            read: item.is_read,
            createdAt: item.created_at,
          })),
        );
        retryAttempts = 0;
        clearRetryTimer();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load notifications.";
        if (isBackendConnectionError(message)) {
          if (
            !retryTimer &&
            retryAttempts < MAX_RETRY_ATTEMPTS &&
            document.visibilityState === "visible"
          ) {
            retryTimer = setInterval(() => {
              retryAttempts += 1;
              if (retryAttempts >= MAX_RETRY_ATTEMPTS) {
                clearRetryTimer();
                return;
              }
              void loadNotifications();
            }, 30000);
          }
          return;
        }

        if (!disposed) {
          toast.error(message);
        }
      }
    };
    void loadNotifications();

    return () => {
      disposed = true;
      clearRetryTimer();
    };
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      return;
    }

    const socket = io(notificationApi.socketBaseUrl(), {
      transports: ["websocket"],
      auth: {
        token,
      },
    });

    socket.on("notification:new", (payload: {
      title: string;
      message: string;
      type: "info" | "success" | "warning" | "error";
      created_at?: string;
      timestamp?: string;
    }) => {
      try {
        setNotifList((prev) => [
          {
            id: Date.now(),
            title: payload.title,
            message: payload.message,
            type: payload.type ?? "info",
            read: false,
            createdAt: payload.created_at ?? payload.timestamp ?? new Date().toISOString(),
          },
          ...prev,
        ]);
        toast(payload.title, { description: payload.message });
      } catch {
        // Ignore malformed socket events.
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const unreadCount = notifList.filter((n) => !n.read).length;

  const markAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifList((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to mark notifications.";
      toast.error(message);
    }
  };

  const markOneRead = async (id: number) => {
    try {
      await notificationApi.markRead([id]);
      setNotifList((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to mark notification.";
      toast.error(message);
    }
  };

  const signOut = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  const notifIcons: Record<string, React.ReactNode> = {
    warning: <AlertTriangle className="h-4 w-4 text-warning shrink-0" />,
    success: <CheckCircle className="h-4 w-4 text-success shrink-0" />,
    info: <Info className="h-4 w-4 text-info shrink-0" />,
    error: <AlertCircle className="h-4 w-4 text-destructive shrink-0" />,
  };

  const roleColors: Record<UserRole, string> = {
    admin: "bg-primary text-primary-foreground",
    donor: "bg-success text-success-foreground",
    recipient: "bg-info text-info-foreground",
    hospital: "bg-warning text-warning-foreground",
    clinic: "bg-warning text-warning-foreground",
  };

  const sidebarTheme: Record<UserRole, { active: string; hover: string; avatar: string; accent: string; badge: string }> = {
    admin: { active: "bg-red-600 text-white shadow-sm shadow-red-500/25", hover: "hover:bg-red-50 hover:text-red-700", avatar: "bg-red-600", accent: "bg-red-600", badge: "bg-red-600" },
    donor: { active: "bg-emerald-600 text-white shadow-sm shadow-emerald-500/25", hover: "hover:bg-emerald-50 hover:text-emerald-700", avatar: "bg-emerald-600", accent: "bg-emerald-600", badge: "bg-emerald-600" },
    recipient: { active: "bg-indigo-600 text-white shadow-sm shadow-indigo-500/25", hover: "hover:bg-indigo-50 hover:text-indigo-700", avatar: "bg-indigo-600", accent: "bg-indigo-600", badge: "bg-indigo-600" },
    hospital: { active: "bg-amber-500 text-white shadow-sm shadow-amber-500/25", hover: "hover:bg-amber-50 hover:text-amber-700", avatar: "bg-amber-500", accent: "bg-amber-500", badge: "bg-amber-500" },
    clinic: { active: "bg-amber-500 text-white shadow-sm shadow-amber-500/25", hover: "hover:bg-amber-50 hover:text-amber-700", avatar: "bg-amber-500", accent: "bg-amber-500", badge: "bg-amber-500" },
  };

  const notifTheme: Record<UserRole, { headerBg: string; bell: string; badge: string; dot: string; unreadBg: string; accent: string; markAll: string }> = {
    admin: { headerBg: "bg-red-50/60", bell: "text-red-600", badge: "bg-red-600 text-white", dot: "bg-red-600", unreadBg: "bg-red-50/40", accent: "text-red-600 hover:text-red-700", markAll: "hover:text-red-600" },
    donor: { headerBg: "bg-emerald-50/60", bell: "text-emerald-600", badge: "bg-emerald-600 text-white", dot: "bg-emerald-600", unreadBg: "bg-emerald-50/40", accent: "text-emerald-600 hover:text-emerald-700", markAll: "hover:text-emerald-600" },
    recipient: { headerBg: "bg-indigo-50/60", bell: "text-indigo-600", badge: "bg-indigo-600 text-white", dot: "bg-indigo-600", unreadBg: "bg-indigo-50/40", accent: "text-indigo-600 hover:text-indigo-700", markAll: "hover:text-indigo-600" },
    hospital: { headerBg: "bg-amber-50/60", bell: "text-amber-500", badge: "bg-amber-500 text-white", dot: "bg-amber-500", unreadBg: "bg-amber-50/40", accent: "text-amber-600 hover:text-amber-700", markAll: "hover:text-amber-600" },
    clinic: { headerBg: "bg-amber-50/60", bell: "text-amber-500", badge: "bg-amber-500 text-white", dot: "bg-amber-500", unreadBg: "bg-amber-50/40", accent: "text-amber-600 hover:text-amber-700", markAll: "hover:text-amber-600" },
  };

  const theme = sidebarTheme[role];
  const nTheme = notifTheme[role];

  const currentPage =
    navItems.find((i) => i.path === location.pathname)?.label ?? "Dashboard";

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
        {(!collapsed || mobileOpen) && (
          <Link to={`/${role}`} className="flex items-center gap-2.5">
            <img src="/bdms-logo.png" alt="RedRelief" className="h-8 w-9.5" />
            <span className="text-2xl font-bold">
              Red<span className="text-red-600">Relief</span>
            </span>
          </Link>
        )}
        {collapsed && !mobileOpen && (
          <Link to={`/${role}`} className="mx-auto">
            <img src="/bdms-logo.png" alt="RedRelief" className="h-8 w-9.5" />
          </Link>
        )}
        {mobileOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="px-3 pt-4 pb-2">
        {(!collapsed || mobileOpen) && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 mb-2">
            Navigation
          </p>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              title={item.label}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? theme.active
                  : `text-muted-foreground ${theme.hover}`
              } ${collapsed && !mobileOpen ? "justify-center" : ""}`}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {(!collapsed || mobileOpen) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User section at bottom */}
      <div className="border-t border-border/50 p-3 space-y-2">
        {(!collapsed || mobileOpen) && (
          <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
            <div className={`h-9 w-9 rounded-full ${theme.avatar} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
              {userName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {userName}
              </p>
              <Badge
                className={`${roleColors[role]} text-[10px] px-1.5 py-0 mt-0.5`}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Badge>
            </div>
          </div>
        )}
        <div className="flex gap-1">
          {(!collapsed || mobileOpen) && (
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-start text-muted-foreground hover:text-foreground"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          )}
          {collapsed && !mobileOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="mx-auto text-muted-foreground"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center text-muted-foreground hidden lg:flex"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </>
  );

  return (
    <div className={`role-theme-${role} flex h-screen overflow-hidden bg-muted/30`}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-card border-r border-border shadow-xl transition-transform duration-300 lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300 ${collapsed ? "w-[72px]" : "w-64"}`}
      >
        <SidebarContent />
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                {currentPage}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground"
              onClick={() => setNotifOpen(true)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className={`absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full ${theme.badge} text-[10px] font-bold text-white`}>
                  {unreadCount}
                </span>
              )}
            </Button>
            <div className="hidden sm:flex items-center gap-2 ml-2 rounded-xl bg-muted/50 px-3 py-1.5">
              <div className={`h-7 w-7 rounded-full ${theme.avatar} flex items-center justify-center text-xs font-bold text-white`}>
                {userName[0]}
              </div>
              <span className="text-sm font-medium text-foreground">
                {userName}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
      {/* Notification Dialog */}
      <Dialog open={notifOpen} onOpenChange={setNotifOpen}>
        <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)] rounded-2xl p-0 gap-0 overflow-hidden [&>button]:h-8 [&>button]:w-8 [&>button]:rounded-full [&>button]:border [&>button]:border-border [&>button]:bg-card [&>button]:shadow-sm [&>button]:hover:bg-destructive/10 [&>button]:hover:border-destructive/30 [&>button]:hover:text-destructive [&>button]:transition-all [&>button]:duration-200 [&>button]:flex [&>button]:items-center [&>button]:justify-center">
          <DialogHeader className={`border-b border-border ${nTheme.headerBg} px-6 py-4`}>
            <DialogTitle className="flex items-center justify-between pr-6">
              <span className="flex items-center gap-2 text-base">
                <Bell className={`h-5 w-5 ${nTheme.bell}`} /> Notifications
              </span>
              {unreadCount > 0 && (
                <Badge className={`${nTheme.badge} text-[10px]`}>
                  {unreadCount} new
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            <div className="divide-y divide-border">
              {notifList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <Bell className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">
                    You don't have any notifications
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    We'll notify you when something important happens.
                  </p>
                </div>
              ) : (
                notifList.map((n) => (
                  <div
                    key={n.id}
                    className={`group flex items-start gap-3 px-6 py-4 transition-colors hover:bg-muted/30 ${
                      !n.read ? nTheme.unreadBg : ""
                    }`}
                  >
                    <div className="mt-0.5">{notifIcons[n.type]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm ${!n.read ? "font-semibold text-foreground" : "font-medium text-muted-foreground"}`}
                        >
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className={`h-2 w-2 rounded-full ${nTheme.dot} shrink-0`} />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {n.message}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-[10px] text-muted-foreground/60">
                          {new Date(n.createdAt).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                        {!n.read && (
                          <button
                            onClick={() => markOneRead(n.id)}
                            className={`opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-medium ${nTheme.accent} flex items-center gap-1`}
                          >
                            <Check className="h-3 w-3" /> Mark read
                          </button>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => markOneRead(n.id)}
                      className="mt-0.5 shrink-0 h-6 w-6 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-all duration-200 opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          <div className="border-t border-border px-6 py-3 bg-muted/20">
            <Button
              variant="ghost"
              size="sm"
              className={`w-full text-xs text-muted-foreground ${nTheme.markAll} gap-1.5`}
              onClick={markAllRead}
              disabled={unreadCount === 0}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              {unreadCount > 0
                ? `Mark all as read (${unreadCount})`
                : "All caught up!"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
