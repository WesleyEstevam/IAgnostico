export type AuthSession = {
  authenticated: true;
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified: boolean;
    role: "admin" | "player";
  };
  shifts: { current: number; max: number };
};

let snapshot: AuthSession | null | undefined;
let activeRequest: Promise<void> | undefined;
const listeners = new Set<() => void>();

export function getAuthSnapshot() {
  return snapshot;
}

export function getServerAuthSnapshot() {
  return undefined;
}

export function subscribeToAuth(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function refreshAuthSession() {
  activeRequest ??= fetch("/api/auth/session", { cache: "no-store" })
    .then(async (response) => {
      snapshot = response.ok ? ((await response.json()) as AuthSession) : null;
      listeners.forEach((listener) => listener());
    })
    .catch(() => {
      snapshot = null;
      listeners.forEach((listener) => listener());
    })
    .finally(() => { activeRequest = undefined; });
  return activeRequest;
}

export function clearAuthSession() {
  snapshot = null;
  listeners.forEach((listener) => listener());
}
