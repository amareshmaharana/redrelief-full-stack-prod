import type { UserRole } from "@/types";
import { useEffect, useState } from "react";

const AUTH_STORAGE_KEY = "bdms_auth_session";
const AUTH_CHANGE_EVENT = "bdms-auth-change";

export interface BackendUser {
  id: number;
  full_name: string;
  mobile: string;
  email?: string | null;
  role: UserRole;
}

export interface AuthSession {
  access: string;
  refresh: string;
  user: BackendUser;
}

export function getAuthSession(): AuthSession | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function setAuthSession(session: AuthSession) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function getAccessToken(): string | null {
  return getAuthSession()?.access ?? null;
}

export function useAuthSession() {
  const [session, setSession] = useState<AuthSession | null>(() =>
    getAuthSession(),
  );

  useEffect(() => {
    const refresh = () => setSession(getAuthSession());
    window.addEventListener(AUTH_CHANGE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return session;
}
