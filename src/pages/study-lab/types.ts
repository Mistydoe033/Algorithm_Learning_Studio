import type { PatternKey } from '../../data/patterns';
import type { StudySnapshot, StudyUser } from '../../lib/studyApi';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type QuizCategory =
  | 'scenario'
  | 'mechanic'
  | 'time_complexity'
  | 'space_complexity'
  | 'invariant'
  | 'pitfall'
  | 'weak_fit'
  | 'edge_case';

export interface QuizExplanation {
  plain: string[];
  technical: string[];
}

export interface QuizQuestion {
  id: string;
  category: QuizCategory;
  prompt: string;
  options: string[];
  correct: string;
  explanation: QuizExplanation;
}

export interface PatternQuizProfile {
  scenario: string;
  mechanic: string;
  timeComplexity: string;
  spaceComplexity: string;
  invariant: string;
  pitfall: string;
  weakFit: string;
  edgeCase: string;
}

export interface TermHelpItem {
  term: string;
  plain: string;
}

export interface StudyProgress {
  weakStats: Record<string, number>;
  quizAttempts: number;
  totalCorrect: number;
  totalQuestions: number;
  lastPattern: PatternKey;
  lastDifficulty: Difficulty;
}

export type AuthMode = 'login' | 'register';

export type SyncState = 'idle' | 'saving' | 'saved' | 'error';

export interface StudyLabState {
  patternKey: PatternKey;
  difficulty: Difficulty;
  optionOrderSeed: number;
  answers: Record<string, string>;
  checked: boolean;
  showAnswers: boolean;
  followUpCategory: QuizCategory | null;
  followUpAnswer: string;
  followUpChecked: boolean;
  followUpSeed: number;
  weakStats: Record<string, number>;
  quizAttempts: number;
  totalCorrect: number;
  totalQuestions: number;
  token: string;
  user: StudyUser | null;
  authMode: AuthMode;
  username: string;
  password: string;
  authLoading: boolean;
  authError: string;
  authInfo: string;
  studyLoading: boolean;
  readyToSync: boolean;
  syncState: SyncState;
  syncError: string;
}

export interface SnapshotStatePatch {
  weakStats: Record<string, number>;
  quizAttempts: number;
  totalCorrect: number;
  totalQuestions: number;
  patternKey?: PatternKey;
  difficulty?: Difficulty;
}

export interface StudyLabViewModel {
  state: StudyLabState;
  patternName: string;
  patternWhenToUse: string;
  activeMechanic: string;
  activeWeakFit: string;
  questions: QuizQuestion[];
  followUpQuestion: QuizQuestion | null;
  answeredCount: number;
  score: number;
  percent: number;
  grade: string;
  weakAreaRows: Array<{ category: QuizCategory; misses: number }>;
  termHelpRows: TermHelpItem[];
  cumulativeAccuracy: number;
  syncLabel: string;
}

export type SavePayload = Omit<StudySnapshot, 'updatedAt'>;

export interface StudyLabActions {
  setPatternKey: (patternKey: PatternKey) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  toggleShowAnswers: () => void;
  setAnswer: (questionId: string, answer: string) => void;
  checkAnswers: () => void;
  resetQuiz: () => void;
  setFollowUpAnswer: (answer: string) => void;
  checkFollowUp: () => void;
  nextFollowUp: () => void;
  setAuthMode: (mode: AuthMode) => void;
  setUsername: (username: string) => void;
  setPassword: (password: string) => void;
  submitAuth: () => Promise<void>;
  signOut: () => void;
}

export interface StudyLabController {
  viewModel: StudyLabViewModel;
  actions: StudyLabActions;
}
