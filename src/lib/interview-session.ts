import type { ChatMessage, Report, RoleId } from "./interview-data";

const KEY = "interviewpilot.session";

export type SessionData = {
  roleId: RoleId;
  transcript: ChatMessage[];
  report?: Report;
  finishedAt: number;
};

export function saveSession(data: SessionData) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(KEY, JSON.stringify(data));
}

export function loadSession(): SessionData | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(KEY);
}
