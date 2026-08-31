const AUTH_STORAGE_KEY = "iagnostico:authenticated";
const AUTH_CHANGED_EVENT = "iagnostico:auth-changed";

export function getAuthSnapshot() {
  return window.localStorage.getItem(AUTH_STORAGE_KEY) === "true";
}

export function getServerAuthSnapshot() {
  return false;
}

export function subscribeToAuth(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(AUTH_CHANGED_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(AUTH_CHANGED_EVENT, callback);
  };
}

export function authenticate() {
  window.localStorage.setItem(AUTH_STORAGE_KEY, "true");
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}
