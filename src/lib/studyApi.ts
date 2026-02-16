export type Difficulty = 'easy' | 'medium' | 'hard';

export interface StudySnapshot {
  weakStats: Record<string, number>;
  quizAttempts: number;
  totalCorrect: number;
  totalQuestions: number;
  lastPattern: string;
  lastDifficulty: Difficulty;
  updatedAt?: string | null;
}

export interface StudyUser {
  id: number;
  username: string;
}

export interface AuthResponse {
  token: string;
  user: StudyUser;
  study: StudySnapshot;
}

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const apiBaseRaw = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ?? '';
// Default to same-origin so frontend + API can live in one deploy.
const API_BASE = apiBaseRaw;

function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
}

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  const text = await response.text();
  let data: Record<string, unknown> = {};
  if (text) {
    try {
      data = JSON.parse(text) as Record<string, unknown>;
    } catch {
      data = { error: text };
    }
  }

  if (!response.ok) {
    const errorMessage = typeof data.error === 'string' ? data.error : `Request failed with status ${response.status}`;
    throw new ApiError(errorMessage, response.status);
  }

  return data as T;
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export async function registerUser(username: string, password: string): Promise<AuthResponse> {
  return requestJson<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function loginUser(username: string, password: string): Promise<AuthResponse> {
  return requestJson<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function fetchStudy(token: string): Promise<StudySnapshot> {
  const result = await requestJson<{ study: StudySnapshot }>('/api/study', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  return result.study;
}

export async function saveStudy(token: string, study: Omit<StudySnapshot, 'updatedAt'>): Promise<StudySnapshot> {
  const result = await requestJson<{ study: StudySnapshot }>('/api/study', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(study),
  });
  return result.study;
}
