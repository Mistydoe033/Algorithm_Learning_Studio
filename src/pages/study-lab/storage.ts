import type { StudyUser } from '../../lib/studyApi';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, LOCAL_STUDY_KEY } from './consts';
import { sanitizeStudyProgress } from './helpers';
import type { StudyProgress } from './types';

export function loadLocalProgress(): StudyProgress {
  if (typeof window === 'undefined') return sanitizeStudyProgress(undefined);
  try {
    const raw = window.localStorage.getItem(LOCAL_STUDY_KEY);
    if (!raw) return sanitizeStudyProgress(undefined);
    return sanitizeStudyProgress(JSON.parse(raw) as Partial<StudyProgress>);
  } catch {
    return sanitizeStudyProgress(undefined);
  }
}

export function saveLocalProgress(progress: StudyProgress): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_STUDY_KEY, JSON.stringify(progress));
}

export function loadStoredToken(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(AUTH_TOKEN_KEY) ?? '';
}

export function storeToken(token: string): void {
  if (typeof window === 'undefined') return;
  if (token) window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  else window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function loadStoredUser(): StudyUser | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StudyUser>;
    if (typeof parsed.id !== 'number' || typeof parsed.username !== 'string') return null;
    return { id: parsed.id, username: parsed.username };
  } catch {
    return null;
  }
}

export function storeUser(user: StudyUser | null): void {
  if (typeof window === 'undefined') return;
  if (user) window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(AUTH_USER_KEY);
}
