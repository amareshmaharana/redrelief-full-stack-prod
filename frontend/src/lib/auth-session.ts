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

function readSessionStorage() {
  return sessionStorage.getItem(AUTH_STORAGE_KEY);
}

export function getAuthSession(): AuthSession | null {
  const raw = readSessionStorage();
  if (!raw) {
    // Clear any legacy persisted session to avoid exposing stale auth state.
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function setAuthSession(session: AuthSession) {
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function clearAuthSession() {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
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
