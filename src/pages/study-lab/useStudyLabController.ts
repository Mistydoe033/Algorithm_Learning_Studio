import { useCallback, useEffect, useMemo, useReducer } from 'react';

import { PATTERNS, patternByKey, type PatternKey } from '../../data/patterns';
import {
  fetchStudy,
  isApiError,
  loginUser,
  registerUser,
  saveStudy,
  type StudyUser,
} from '../../lib/studyApi';
import {
  COMMON_TERM_HELP,
  PATTERN_TERM_HELP,
  QUIZ_CATEGORIES,
  QUIZ_PROFILE,
} from './consts';
import {
  buildFollowUpQuestion,
  buildQuizQuestions,
  gradeFromPercent,
  normalizeStudySnapshot,
  toSavePayload,
  weakestCategoryForPattern,
} from './helpers';
import {
  loadLocalProgress,
  loadStoredToken,
  loadStoredUser,
  saveLocalProgress,
  storeToken,
  storeUser,
} from './storage';
import type {
  AuthMode,
  Difficulty,
  QuizCategory,
  SnapshotStatePatch,
  StudyLabActions,
  StudyLabController,
  StudyLabState,
  StudyLabViewModel,
  SyncState,
} from './types';

function randomSeed(): number {
  return Math.floor(Math.random() * 1_000_000);
}

function getInitialState(): StudyLabState {
  const local = loadLocalProgress();
  const token = loadStoredToken();
  const user = loadStoredUser();
  return {
    patternKey: local.lastPattern,
    difficulty: local.lastDifficulty,
    optionOrderSeed: randomSeed(),
    answers: {},
    checked: false,
    showAnswers: false,
    followUpCategory: null,
    followUpAnswer: '',
    followUpChecked: false,
    followUpSeed: 1,
    weakStats: local.weakStats,
    quizAttempts: local.quizAttempts,
    totalCorrect: local.totalCorrect,
    totalQuestions: local.totalQuestions,
    token,
    user,
    authMode: 'login',
    username: '',
    password: '',
    authLoading: false,
    authError: '',
    authInfo: '',
    studyLoading: Boolean(token),
    readyToSync: false,
    syncState: 'idle',
    syncError: '',
  };
}

function resetQuizState(state: StudyLabState): StudyLabState {
  return {
    ...state,
    optionOrderSeed: randomSeed(),
    answers: {},
    checked: false,
    showAnswers: false,
    followUpCategory: null,
    followUpAnswer: '',
    followUpChecked: false,
  };
}

function applySnapshotPatch(state: StudyLabState, snapshot: SnapshotStatePatch): StudyLabState {
  const nextPatternKey = snapshot.patternKey ?? state.patternKey;
  const nextDifficulty = snapshot.difficulty ?? state.difficulty;
  let nextState: StudyLabState = {
    ...state,
    weakStats: snapshot.weakStats,
    quizAttempts: snapshot.quizAttempts,
    totalCorrect: snapshot.totalCorrect,
    totalQuestions: snapshot.totalQuestions,
    patternKey: nextPatternKey,
    difficulty: nextDifficulty,
  };

  if (nextPatternKey !== state.patternKey || nextDifficulty !== state.difficulty) {
    nextState = resetQuizState(nextState);
  }

  return nextState;
}

interface CheckAnswersPayload {
  score: number;
  totalQuestions: number;
  wrongCategories: QuizCategory[];
  fallbackCategory: QuizCategory | null;
}

type StudyLabAction =
  | { type: 'set_pattern'; patternKey: PatternKey }
  | { type: 'set_difficulty'; difficulty: Difficulty }
  | { type: 'set_answer'; questionId: string; answer: string }
  | { type: 'toggle_show_answers' }
  | { type: 'check_answers'; payload: CheckAnswersPayload }
  | { type: 'reset_quiz' }
  | { type: 'set_followup_answer'; answer: string }
  | { type: 'check_followup'; category: QuizCategory; isCorrect: boolean }
  | { type: 'new_followup' }
  | { type: 'set_auth_mode'; mode: AuthMode }
  | { type: 'set_username'; username: string }
  | { type: 'set_password'; password: string }
  | { type: 'auth_start' }
  | { type: 'auth_success'; token: string; user: StudyUser; snapshot: SnapshotStatePatch; info: string }
  | { type: 'auth_error'; error: string }
  | { type: 'fetch_start' }
  | { type: 'fetch_success'; snapshot: SnapshotStatePatch }
  | { type: 'fetch_not_found'; info: string }
  | { type: 'fetch_error'; error: string }
  | { type: 'fetch_done' }
  | { type: 'sync_saving' }
  | { type: 'sync_saved' }
  | { type: 'sync_error'; error: string }
  | { type: 'sign_out'; info: string };

function reducer(state: StudyLabState, action: StudyLabAction): StudyLabState {
  switch (action.type) {
    case 'set_pattern':
      return resetQuizState({ ...state, patternKey: action.patternKey });
    case 'set_difficulty':
      return resetQuizState({ ...state, difficulty: action.difficulty });
    case 'set_answer':
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.answer },
      };
    case 'toggle_show_answers':
      return { ...state, showAnswers: !state.showAnswers };
    case 'check_answers': {
      const nextWeakStats = { ...state.weakStats };
      action.payload.wrongCategories.forEach((category) => {
        const key = `${state.patternKey}:${category}`;
        nextWeakStats[key] = (nextWeakStats[key] ?? 0) + 1;
      });
      return {
        ...state,
        weakStats: nextWeakStats,
        checked: true,
        quizAttempts: state.quizAttempts + 1,
        totalCorrect: state.totalCorrect + action.payload.score,
        totalQuestions: state.totalQuestions + action.payload.totalQuestions,
        followUpCategory: action.payload.wrongCategories[0] ?? action.payload.fallbackCategory,
        followUpSeed: state.followUpSeed + 1,
        followUpAnswer: '',
        followUpChecked: false,
      };
    }
    case 'reset_quiz':
      return resetQuizState(state);
    case 'set_followup_answer':
      return { ...state, followUpAnswer: action.answer };
    case 'check_followup': {
      if (action.isCorrect) return { ...state, followUpChecked: true };
      const key = `${state.patternKey}:${action.category}`;
      return {
        ...state,
        followUpChecked: true,
        weakStats: { ...state.weakStats, [key]: (state.weakStats[key] ?? 0) + 1 },
      };
    }
    case 'new_followup':
      return {
        ...state,
        followUpSeed: state.followUpSeed + 1,
        followUpAnswer: '',
        followUpChecked: false,
      };
    case 'set_auth_mode':
      return { ...state, authMode: action.mode };
    case 'set_username':
      return { ...state, username: action.username };
    case 'set_password':
      return { ...state, password: action.password };
    case 'auth_start':
      return { ...state, authLoading: true, authError: '', authInfo: '' };
    case 'auth_success': {
      const stateWithSnapshot = applySnapshotPatch(state, action.snapshot);
      return {
        ...stateWithSnapshot,
        token: action.token,
        user: action.user,
        readyToSync: true,
        studyLoading: false,
        authLoading: false,
        authError: '',
        authInfo: action.info,
        syncState: 'saved',
        syncError: '',
        username: '',
        password: '',
      };
    }
    case 'auth_error':
      return { ...state, authLoading: false, authError: action.error };
    case 'fetch_start':
      return { ...state, studyLoading: true };
    case 'fetch_success':
      return {
        ...applySnapshotPatch(state, action.snapshot),
        readyToSync: true,
        syncState: 'idle',
        syncError: '',
      };
    case 'fetch_not_found':
      return {
        ...state,
        readyToSync: true,
        syncState: 'idle',
        syncError: '',
        authInfo: action.info,
      };
    case 'fetch_error':
      return { ...state, syncState: 'error', syncError: action.error };
    case 'fetch_done':
      return { ...state, studyLoading: false };
    case 'sync_saving':
      return { ...state, syncState: 'saving' };
    case 'sync_saved':
      return { ...state, syncState: 'saved', syncError: '' };
    case 'sync_error':
      return { ...state, syncState: 'error', syncError: action.error };
    case 'sign_out':
      return {
        ...state,
        token: '',
        user: null,
        readyToSync: false,
        studyLoading: false,
        authLoading: false,
        authError: '',
        authInfo: action.info,
        syncState: 'idle',
        syncError: '',
      };
    default:
      return state;
  }
}

function toSyncLabel(studyLoading: boolean, syncState: SyncState): string {
  if (studyLoading) return 'loading saved study data...';
  if (syncState === 'saving') return 'saving...';
  if (syncState === 'saved') return 'saved';
  if (syncState === 'error') return 'sync error';
  return 'idle';
}

export function useStudyLabController(): StudyLabController {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);

  useEffect(() => {
    saveLocalProgress({
      weakStats: state.weakStats,
      quizAttempts: state.quizAttempts,
      totalCorrect: state.totalCorrect,
      totalQuestions: state.totalQuestions,
      lastPattern: state.patternKey,
      lastDifficulty: state.difficulty,
    });
  }, [
    state.difficulty,
    state.patternKey,
    state.quizAttempts,
    state.totalCorrect,
    state.totalQuestions,
    state.weakStats,
  ]);

  useEffect(() => {
    storeToken(state.token);
  }, [state.token]);

  useEffect(() => {
    storeUser(state.user);
  }, [state.user]);

  useEffect(() => {
    if (!state.token) return;
    let active = true;

    dispatch({ type: 'fetch_start' });
    fetchStudy(state.token)
      .then((snapshot) => {
        if (!active) return;
        dispatch({ type: 'fetch_success', snapshot: normalizeStudySnapshot(snapshot) });
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (isApiError(error) && error.status === 401) {
          dispatch({ type: 'sign_out', info: 'Session expired. Please sign in again.' });
          return;
        }
        if (isApiError(error) && error.status === 404) {
          dispatch({ type: 'fetch_not_found', info: 'No previous study data found. Starting fresh.' });
          return;
        }
        dispatch({ type: 'fetch_error', error: 'Failed to sync study data.' });
      })
      .finally(() => {
        if (!active) return;
        dispatch({ type: 'fetch_done' });
      });

    return () => {
      active = false;
    };
  }, [state.token]);

  useEffect(() => {
    if (!state.token || !state.readyToSync) return;

    const timer = window.setTimeout(() => {
      dispatch({ type: 'sync_saving' });
      const payload = toSavePayload(
        state.weakStats,
        state.quizAttempts,
        state.totalCorrect,
        state.totalQuestions,
        state.patternKey,
        state.difficulty,
      );

      saveStudy(state.token, payload)
        .then(() => dispatch({ type: 'sync_saved' }))
        .catch((error: unknown) => {
          dispatch({ type: 'sync_error', error: 'Failed to sync study data.' });
          if (isApiError(error) && error.status === 401) {
            dispatch({ type: 'sign_out', info: 'Session expired. Please sign in again.' });
          }
        });
    }, 450);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    state.difficulty,
    state.patternKey,
    state.quizAttempts,
    state.readyToSync,
    state.token,
    state.totalCorrect,
    state.totalQuestions,
    state.weakStats,
  ]);

  const pattern = patternByKey[state.patternKey];
  const activeProfile = QUIZ_PROFILE[state.patternKey];
  const patternIndex = PATTERNS.findIndex((entry) => entry.key === state.patternKey);

  const questions = useMemo(
    () => buildQuizQuestions(state.patternKey, state.difficulty, patternIndex, state.optionOrderSeed),
    [state.difficulty, state.optionOrderSeed, state.patternKey, patternIndex],
  );

  const followUpQuestion = useMemo(() => {
    if (!state.followUpCategory) return null;
    return buildFollowUpQuestion(
      state.patternKey,
      pattern.name,
      state.followUpCategory,
      QUIZ_PROFILE,
      state.followUpSeed,
    );
  }, [pattern.name, state.followUpCategory, state.followUpSeed, state.patternKey]);

  const answeredCount = useMemo(
    () => questions.filter((question) => Boolean(state.answers[question.id])).length,
    [questions, state.answers],
  );
  const score = useMemo(
    () => questions.filter((question) => state.answers[question.id] === question.correct).length,
    [questions, state.answers],
  );
  const percent = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const grade = gradeFromPercent(percent);
  const cumulativeAccuracy = state.totalQuestions > 0
    ? Math.round((state.totalCorrect / state.totalQuestions) * 100)
    : 0;
  const weakAreaRows = useMemo(() => {
    return QUIZ_CATEGORIES
      .map((category) => ({ category, misses: state.weakStats[`${state.patternKey}:${category}`] ?? 0 }))
      .sort((a, b) => b.misses - a.misses);
  }, [state.patternKey, state.weakStats]);
  const termHelpRows = useMemo(
    () => [...COMMON_TERM_HELP, ...(PATTERN_TERM_HELP[state.patternKey] ?? [])],
    [state.patternKey],
  );

  const viewModel: StudyLabViewModel = {
    state,
    patternName: pattern.name,
    patternWhenToUse: pattern.whenToUse,
    activeMechanic: activeProfile.mechanic,
    activeWeakFit: activeProfile.weakFit,
    questions,
    followUpQuestion,
    answeredCount,
    score,
    percent,
    grade,
    weakAreaRows,
    termHelpRows,
    cumulativeAccuracy,
    syncLabel: toSyncLabel(state.studyLoading, state.syncState),
  };

  const setPatternKey = useCallback((patternKey: PatternKey) => {
    dispatch({ type: 'set_pattern', patternKey });
  }, []);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    dispatch({ type: 'set_difficulty', difficulty });
  }, []);

  const toggleShowAnswers = useCallback(() => {
    dispatch({ type: 'toggle_show_answers' });
  }, []);

  const setAnswer = useCallback((questionId: string, answer: string) => {
    dispatch({ type: 'set_answer', questionId, answer });
  }, []);

  const checkAnswers = useCallback(() => {
    if (answeredCount < questions.length) return;
    const wrongCategories = questions
      .filter((question) => state.answers[question.id] !== question.correct)
      .map((question) => question.category);
    const fallbackCategory = wrongCategories.length === 0
      ? weakestCategoryForPattern(state.weakStats, state.patternKey)
      : null;
    dispatch({
      type: 'check_answers',
      payload: {
        score,
        totalQuestions: questions.length,
        wrongCategories,
        fallbackCategory,
      },
    });
  }, [answeredCount, questions, score, state.answers, state.patternKey, state.weakStats]);

  const resetQuiz = useCallback(() => {
    dispatch({ type: 'reset_quiz' });
  }, []);

  const setFollowUpAnswer = useCallback((answer: string) => {
    dispatch({ type: 'set_followup_answer', answer });
  }, []);

  const checkFollowUp = useCallback(() => {
    if (!followUpQuestion || !state.followUpAnswer) return;
    dispatch({
      type: 'check_followup',
      category: followUpQuestion.category,
      isCorrect: state.followUpAnswer === followUpQuestion.correct,
    });
  }, [followUpQuestion, state.followUpAnswer]);

  const nextFollowUp = useCallback(() => {
    dispatch({ type: 'new_followup' });
  }, []);

  const setAuthMode = useCallback((mode: AuthMode) => {
    dispatch({ type: 'set_auth_mode', mode });
  }, []);

  const setUsername = useCallback((username: string) => {
    dispatch({ type: 'set_username', username });
  }, []);

  const setPassword = useCallback((password: string) => {
    dispatch({ type: 'set_password', password });
  }, []);

  const submitAuth = useCallback(async () => {
    if (state.authLoading) return;
    if (!state.username.trim() || !state.password) {
      dispatch({ type: 'auth_error', error: 'Enter both username and password.' });
      return;
    }

    dispatch({ type: 'auth_start' });
    try {
      const response = state.authMode === 'login'
        ? await loginUser(state.username.trim(), state.password)
        : await registerUser(state.username.trim(), state.password);
      dispatch({
        type: 'auth_success',
        token: response.token,
        user: response.user,
        snapshot: normalizeStudySnapshot(response.study),
        info: state.authMode === 'login'
          ? 'Signed in and loaded your study data.'
          : 'Account created and study data initialized.',
      });
    } catch (error: unknown) {
      dispatch({
        type: 'auth_error',
        error: isApiError(error) ? error.message : 'Authentication failed.',
      });
    }
  }, [state.authLoading, state.authMode, state.password, state.username]);

  const signOut = useCallback(() => {
    dispatch({ type: 'sign_out', info: 'Signed out. Local progress remains available.' });
  }, []);

  const actions: StudyLabActions = {
    setPatternKey,
    setDifficulty,
    toggleShowAnswers,
    setAnswer,
    checkAnswers,
    resetQuiz,
    setFollowUpAnswer,
    checkFollowUp,
    nextFollowUp,
    setAuthMode,
    setUsername,
    setPassword,
    submitAuth,
    signOut,
  };

  return { viewModel, actions };
}
