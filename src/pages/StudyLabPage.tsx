import { useEffect, useMemo, useState, type FormEvent } from 'react';

import { PatternPicker } from '../components/PatternPicker';
import { PATTERNS, patternByKey, type PatternKey } from '../data/patterns';
import { fetchStudy, isApiError, loginUser, registerUser, saveStudy, type StudySnapshot, type StudyUser } from '../lib/studyApi';

type Difficulty = 'easy' | 'medium' | 'hard';
type QuizCategory = 'scenario' | 'mechanic' | 'complexity' | 'invariant' | 'pitfall' | 'weak_fit' | 'edge_case';

interface QuizQuestion {
  id: string;
  category: QuizCategory;
  prompt: string;
  options: string[];
  correct: string;
  explanation: string;
}

interface PatternQuizProfile {
  scenario: string;
  mechanic: string;
  complexityPair: string;
  invariant: string;
  pitfall: string;
  weakFit: string;
  edgeCase: string;
}

const QUIZ_PROFILE: Record<PatternKey, PatternQuizProfile> = {
  hash_set: {
    scenario: 'Detect whether any value appears more than once in one pass.',
    mechanic: 'Track seen values in a uniqueness structure and stop on repeat.',
    complexityPair: 'Time: O(n) average, Space: O(n)',
    invariant: 'All unique values seen so far are recorded.',
    pitfall: 'Assuming hash iteration is naturally sorted.',
    weakFit: 'You need sorted/range queries rather than membership checks.',
    edgeCase: 'Empty input should return no duplicate immediately.',
  },
  hash_map: {
    scenario: 'Count occurrences for every distinct value.',
    mechanic: 'Update key -> count for each element as you scan.',
    complexityPair: 'Time: O(n) average, Space: O(n)',
    invariant: 'Stored count per key matches processed occurrences.',
    pitfall: 'Forgetting missing keys should start from zero.',
    weakFit: 'You only need yes/no membership with no payload per key.',
    edgeCase: 'All values identical should produce a single key with count n.',
  },
  two_pointers: {
    scenario: 'Find target pair efficiently in sorted array.',
    mechanic: 'Move left/right pointer based on sum comparison.',
    complexityPair: 'Time: O(n), Space: O(1)',
    invariant: 'Candidate interval shrinks monotonically.',
    pitfall: 'Applying directly on unsorted data.',
    weakFit: 'Data is unsorted and cannot be sorted/preprocessed.',
    edgeCase: 'No pair exists and pointers cross.',
  },
  sliding_window: {
    scenario: 'Optimize over contiguous subarrays under a validity rule.',
    mechanic: 'Expand right and shrink left while restoring validity.',
    complexityPair: 'Time: O(n), Space: O(1) or O(k)',
    invariant: 'Window satisfies constraint after each shrink phase.',
    pitfall: 'Using positive-only shrinking logic with negatives.',
    weakFit: 'Problem needs non-contiguous selection rather than windows.',
    edgeCase: 'k too small so many windows collapse to length 0/1.',
  },
  stack: {
    scenario: 'Validate nested structure ordering.',
    mechanic: 'Push open state and pop on matching close.',
    complexityPair: 'Time: O(n), Space: O(n)',
    invariant: 'Top of stack is latest unresolved opener/state.',
    pitfall: 'Not checking leftover stack items at end.',
    weakFit: 'Task requires random access updates, not LIFO order.',
    edgeCase: 'Input contains only closing symbols.',
  },
  bfs: {
    scenario: 'Shortest path by edge count in unweighted graph.',
    mechanic: 'Process frontier level-by-level with FIFO queue.',
    complexityPair: 'Time: O(V + E), Space: O(V)',
    invariant: 'First visit gives minimum unweighted distance.',
    pitfall: 'Assuming BFS always visits fewer nodes than DFS for target checks.',
    weakFit: 'Edges have varying positive weights.',
    edgeCase: 'Start node/cell is blocked or missing.',
  },
  dfs: {
    scenario: 'Explore connected components deeply with backtracking.',
    mechanic: 'Recurse/stack deep before exploring siblings.',
    complexityPair: 'Time: O(V + E), Space: O(V)',
    invariant: 'Visited nodes are never re-entered.',
    pitfall: 'Assuming the first path found is shortest.',
    weakFit: 'Need guaranteed shortest unweighted path.',
    edgeCase: 'Graph is disconnected from chosen start.',
  },
  binary_search: {
    scenario: 'Locate boundary/index in sorted or monotonic space.',
    mechanic: 'Check midpoint and discard half each step.',
    complexityPair: 'Time: O(log n), Space: O(1)',
    invariant: 'Answer stays inside [lo, hi).',
    pitfall: 'Applying binary search on unsorted/non-monotonic input.',
    weakFit: 'No ordering/monotonic property exists.',
    edgeCase: 'Target absent but insertion index is required.',
  },
  dp: {
    scenario: 'Solve overlapping subproblems with cached states.',
    mechanic: 'Define state/transition and compute each state once.',
    complexityPair: 'Time: O(states * transitions), Space: O(states)',
    invariant: 'Cached state values are reused, not recomputed.',
    pitfall: 'Wrong state definition or missing base case.',
    weakFit: 'Subproblems are independent with no overlap.',
    edgeCase: 'Very small base case (n=0 or n=1).',
  },
  prefix_difference: {
    scenario: 'Answer many range sums and range increment updates efficiently.',
    mechanic: 'Use prefix sums and diff boundaries to batch range updates.',
    complexityPair: 'Time: O(n + u + q), Space: O(n)',
    invariant: 'Prefix and diff reconstruction remain index-consistent.',
    pitfall: 'Off-by-one at r+1 in difference array.',
    weakFit: 'You only need one query and no repeated ranges.',
    edgeCase: 'Update touches final index boundary.',
  },
  intervals: {
    scenario: 'Merge overlapping time/range blocks.',
    mechanic: 'Sort by start then sweep and merge overlaps.',
    complexityPair: 'Time: O(n log n), Space: O(n)',
    invariant: 'Merged list remains sorted and non-overlapping.',
    pitfall: 'Skipping initial sort before merge sweep.',
    weakFit: 'Data has no interval semantics to merge.',
    edgeCase: 'Intervals touch at boundaries.',
  },
  heap: {
    scenario: 'Maintain dynamic top-k values in stream.',
    mechanic: 'Push each value and pop smallest when size exceeds k.',
    complexityPair: 'Time: O(n log k), Space: O(k)',
    invariant: 'Heap root is current smallest among kept top-k candidates.',
    pitfall: 'Using wrong heap polarity (min vs max).',
    weakFit: 'Need full sorted order each step, not just best element(s).',
    edgeCase: 'k <= 0 or k > n.',
  },
  monotonic_queue: {
    scenario: 'Compute sliding window maximum/minimum in linear time.',
    mechanic: 'Maintain deque indices in monotonic value order.',
    complexityPair: 'Time: O(n), Space: O(k)',
    invariant: 'Deque front is valid optimum index for current window.',
    pitfall: 'Not evicting indices that fall out of window.',
    weakFit: 'Query windows are random/non-sequential rather than sliding.',
    edgeCase: 'Window size k equals array length.',
  },
  topological_sort: {
    scenario: 'Produce dependency-respecting order in DAG.',
    mechanic: 'Kahn process: pop zero-indegree and reduce outgoing indegrees.',
    complexityPair: 'Time: O(V + E), Space: O(V)',
    invariant: 'Only zero-indegree nodes are output next.',
    pitfall: 'Ignoring cycle when order length < node count.',
    weakFit: 'Graph is undirected or not dependency-oriented.',
    edgeCase: 'Multiple valid topological orders exist.',
  },
  union_find: {
    scenario: 'Answer repeated connectivity queries as edges are added.',
    mechanic: 'Union component roots and find representative roots quickly.',
    complexityPair: 'Time: O((V + E) * alpha(V)), Space: O(V)',
    invariant: 'Each node maps to a stable component root.',
    pitfall: 'Skipping path compression/rank heuristics.',
    weakFit: 'Need explicit shortest paths, not connectivity only.',
    edgeCase: 'Redundant edges between already connected nodes.',
  },
  backtracking: {
    scenario: 'Search combinatorial solution space with constraints.',
    mechanic: 'Choose, recurse, and undo; prune invalid branches.',
    complexityPair: 'Time: O(branch^depth), Space: O(depth)',
    invariant: 'Current path is valid partial solution before deeper recursion.',
    pitfall: 'Forgetting to undo state when backtracking.',
    weakFit: 'Problem has direct greedy or DP structure with no tree search need.',
    edgeCase: 'No valid solution exists.',
  },
  trie: {
    scenario: 'Fast prefix lookup over dictionary of words.',
    mechanic: 'Traverse/create nodes per character from root to depth L.',
    complexityPair: 'Time: O(L), Space: O(total characters)',
    invariant: 'Each root-to-node path represents a stored prefix.',
    pitfall: 'Missing end-of-word marker for complete-word checks.',
    weakFit: 'Dataset is tiny and linear search is simpler/cheaper.',
    edgeCase: 'Prefix exists but complete word does not.',
  },
  greedy: {
    scenario: 'Maximize non-overlapping interval selections quickly.',
    mechanic: 'Sort by earliest finish and accept compatible interval greedily.',
    complexityPair: 'Time: O(n log n), Space: O(1) to O(n)',
    invariant: 'Chosen set remains feasible after every selection.',
    pitfall: 'Choosing wrong sort criterion without proof.',
    weakFit: 'Local optimum does not imply global optimum.',
    edgeCase: 'Many ties with same end time.',
  },
  dijkstra: {
    scenario: 'Find minimum distances from one source in weighted graph.',
    mechanic: 'Pop smallest tentative distance and relax outgoing edges.',
    complexityPair: 'Time: O((V + E) log V), Space: O(V)',
    invariant: 'Popped node with minimal tentative distance is finalized.',
    pitfall: 'Applying algorithm with negative edge weights.',
    weakFit: 'Graph contains negative-weight edges.',
    edgeCase: 'Unreachable nodes should remain infinite/unset distance.',
  },
};

const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard'];

function buildOptions(correct: string, pool: string[], seed: number): string[] {
  const uniquePool = Array.from(new Set(pool.filter((x) => x !== correct)));
  if (uniquePool.length === 0) return [correct];

  const start = Math.abs(seed) % uniquePool.length;
  const rotated = [...uniquePool.slice(start), ...uniquePool.slice(0, start)];
  const distractors = rotated.slice(0, 3);
  const options = [correct, ...distractors];

  const shift = (seed * 5 + 1) % options.length;
  return options.map((_, i) => options[(i + shift) % options.length] as string);
}

function gradeFromPercent(percent: number): string {
  if (percent >= 90) return 'A';
  if (percent >= 80) return 'B';
  if (percent >= 70) return 'C';
  if (percent >= 60) return 'D';
  return 'F';
}

function weakestCategoryForPattern(stats: Record<string, number>, pattern: PatternKey): QuizCategory | null {
  const categories: QuizCategory[] = ['scenario', 'mechanic', 'complexity', 'invariant', 'pitfall', 'weak_fit', 'edge_case'];
  let best: QuizCategory | null = null;
  let maxScore = -1;
  categories.forEach((category) => {
    const key = `${pattern}:${category}`;
    const score = stats[key] ?? 0;
    if (score > maxScore) {
      maxScore = score;
      best = category;
    }
  });
  return maxScore > 0 ? best : null;
}

function buildFollowUpQuestion(
  patternKey: PatternKey,
  patternName: string,
  category: QuizCategory,
  profiles: Record<PatternKey, PatternQuizProfile>,
  seed: number,
): QuizQuestion {
  const profile = profiles[patternKey];
  const others = Object.entries(profiles)
    .filter(([k]) => k !== patternKey)
    .map(([, value]) => value);

  const categoryMap: Record<QuizCategory, { prompt: string; correct: string; explanation: string; pool: string[] }> = {
    scenario: {
      prompt: `Follow-up (${patternName}): choose the best-fit scenario.`,
      correct: profile.scenario,
      explanation: `Use case refresher: ${profile.scenario}`,
      pool: others.map((x) => x.scenario),
    },
    mechanic: {
      prompt: `Follow-up (${patternName}): identify the core mechanic.`,
      correct: profile.mechanic,
      explanation: `Mechanic refresher: ${profile.mechanic}`,
      pool: others.map((x) => x.mechanic),
    },
    complexity: {
      prompt: `Follow-up (${patternName}): pick the right complexity pair.`,
      correct: profile.complexityPair,
      explanation: `Complexity refresher: ${profile.complexityPair}`,
      pool: others.map((x) => x.complexityPair),
    },
    invariant: {
      prompt: `Follow-up (${patternName}): which invariant must stay true?`,
      correct: profile.invariant,
      explanation: `Invariant refresher: ${profile.invariant}`,
      pool: others.map((x) => x.invariant),
    },
    pitfall: {
      prompt: `Follow-up (${patternName}): which bug is most likely?`,
      correct: profile.pitfall,
      explanation: `Pitfall refresher: ${profile.pitfall}`,
      pool: others.map((x) => x.pitfall),
    },
    weak_fit: {
      prompt: `Follow-up (${patternName}): when is this pattern a weak choice?`,
      correct: profile.weakFit,
      explanation: `Weak-fit refresher: ${profile.weakFit}`,
      pool: others.map((x) => x.weakFit),
    },
    edge_case: {
      prompt: `Follow-up (${patternName}): which edge case should be tested first?`,
      correct: profile.edgeCase,
      explanation: `Edge-case refresher: ${profile.edgeCase}`,
      pool: others.map((x) => x.edgeCase),
    },
  };

  const current = categoryMap[category];
  return {
    id: `follow_up_${category}_${seed}`,
    category,
    prompt: current.prompt,
    options: buildOptions(current.correct, current.pool, seed + 101),
    correct: current.correct,
    explanation: current.explanation,
  };
}

const LOCAL_STUDY_KEY = 'study_lab_local_progress_v2';
const AUTH_TOKEN_KEY = 'study_lab_auth_token_v1';
const AUTH_USER_KEY = 'study_lab_auth_user_v1';

interface StudyProgress {
  weakStats: Record<string, number>;
  quizAttempts: number;
  totalCorrect: number;
  totalQuestions: number;
  lastPattern: PatternKey;
  lastDifficulty: Difficulty;
}

const DEFAULT_PROGRESS: StudyProgress = {
  weakStats: {},
  quizAttempts: 0,
  totalCorrect: 0,
  totalQuestions: 0,
  lastPattern: 'hash_set',
  lastDifficulty: 'medium',
};

function isPatternKey(value: string): value is PatternKey {
  return value in patternByKey;
}

function isDifficulty(value: string): value is Difficulty {
  return value === 'easy' || value === 'medium' || value === 'hard';
}

function loadLocalProgress(): StudyProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = window.localStorage.getItem(LOCAL_STUDY_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<StudyProgress>;

    const pattern = typeof parsed.lastPattern === 'string' && isPatternKey(parsed.lastPattern)
      ? parsed.lastPattern
      : DEFAULT_PROGRESS.lastPattern;
    const difficulty = typeof parsed.lastDifficulty === 'string' && isDifficulty(parsed.lastDifficulty)
      ? parsed.lastDifficulty
      : DEFAULT_PROGRESS.lastDifficulty;

    return {
      weakStats: parsed.weakStats && typeof parsed.weakStats === 'object' ? parsed.weakStats : {},
      quizAttempts: Number.isFinite(parsed.quizAttempts) ? Math.max(0, Math.floor(parsed.quizAttempts as number)) : 0,
      totalCorrect: Number.isFinite(parsed.totalCorrect) ? Math.max(0, Math.floor(parsed.totalCorrect as number)) : 0,
      totalQuestions: Number.isFinite(parsed.totalQuestions) ? Math.max(0, Math.floor(parsed.totalQuestions as number)) : 0,
      lastPattern: pattern,
      lastDifficulty: difficulty,
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

function loadStoredToken(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(AUTH_TOKEN_KEY) ?? '';
}

function loadStoredUser(): StudyUser | null {
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

function toSavePayload(
  weakStats: Record<string, number>,
  quizAttempts: number,
  totalCorrect: number,
  totalQuestions: number,
  patternKey: PatternKey,
  difficulty: Difficulty,
): Omit<StudySnapshot, 'updatedAt'> {
  return {
    weakStats,
    quizAttempts,
    totalCorrect,
    totalQuestions,
    lastPattern: patternKey,
    lastDifficulty: difficulty,
  };
}

export function StudyLabPage() {
  const initial = useMemo(loadLocalProgress, []);

  const [patternKey, setPatternKey] = useState<PatternKey>(initial.lastPattern);
  const [difficulty, setDifficulty] = useState<Difficulty>(initial.lastDifficulty);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [followUpCategory, setFollowUpCategory] = useState<QuizCategory | null>(null);
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [followUpChecked, setFollowUpChecked] = useState(false);
  const [followUpSeed, setFollowUpSeed] = useState(1);
  const [weakStats, setWeakStats] = useState<Record<string, number>>(initial.weakStats);
  const [quizAttempts, setQuizAttempts] = useState(initial.quizAttempts);
  const [totalCorrect, setTotalCorrect] = useState(initial.totalCorrect);
  const [totalQuestions, setTotalQuestions] = useState(initial.totalQuestions);

  const [token, setToken] = useState(loadStoredToken);
  const [user, setUser] = useState<StudyUser | null>(loadStoredUser);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authInfo, setAuthInfo] = useState('');
  const [studyLoading, setStudyLoading] = useState(Boolean(token));
  const [readyToSync, setReadyToSync] = useState(false);
  const [syncState, setSyncState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [syncError, setSyncError] = useState('');

  const clearAuth = (message: string) => {
    setToken('');
    setUser(null);
    setReadyToSync(false);
    setStudyLoading(false);
    setSyncState('idle');
    setSyncError('');
    setAuthError('');
    setAuthInfo(message);
  };

  const applySnapshot = (snapshot: StudySnapshot) => {
    setWeakStats(snapshot.weakStats ?? {});
    setQuizAttempts(snapshot.quizAttempts ?? 0);
    setTotalCorrect(snapshot.totalCorrect ?? 0);
    setTotalQuestions(snapshot.totalQuestions ?? 0);
    if (typeof snapshot.lastPattern === 'string' && isPatternKey(snapshot.lastPattern)) {
      setPatternKey(snapshot.lastPattern);
    }
    if (typeof snapshot.lastDifficulty === 'string' && isDifficulty(snapshot.lastDifficulty)) {
      setDifficulty(snapshot.lastDifficulty);
    }
  };

  const pattern = patternByKey[patternKey];
  const patternIndex = PATTERNS.findIndex((p) => p.key === patternKey);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const payload = toSavePayload(weakStats, quizAttempts, totalCorrect, totalQuestions, patternKey, difficulty);
    window.localStorage.setItem(LOCAL_STUDY_KEY, JSON.stringify(payload));
  }, [difficulty, patternKey, quizAttempts, totalCorrect, totalQuestions, weakStats]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (token) window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    else window.localStorage.removeItem(AUTH_TOKEN_KEY);
  }, [token]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (user) window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(AUTH_USER_KEY);
  }, [user]);

  useEffect(() => {
    if (!token) return;

    let active = true;
    setStudyLoading(true);

    fetchStudy(token)
      .then((snapshot) => {
        if (!active) return;
        applySnapshot(snapshot);
        setReadyToSync(true);
        setSyncState('idle');
        setSyncError('');
      })
      .catch((error: unknown) => {
        if (!active) return;
        const message = isApiError(error) ? error.message : 'Failed to load saved study data.';
        setSyncState('error');
        setSyncError(message);
        if (isApiError(error) && error.status === 401) {
          clearAuth('Session expired. Please sign in again.');
        }
      })
      .finally(() => {
        if (!active) return;
        setStudyLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (!token || !readyToSync) return;

    const timer = window.setTimeout(() => {
      const payload = toSavePayload(weakStats, quizAttempts, totalCorrect, totalQuestions, patternKey, difficulty);
      setSyncState('saving');

      saveStudy(token, payload)
        .then(() => {
          setSyncState('saved');
          setSyncError('');
        })
        .catch((error: unknown) => {
          const message = isApiError(error) ? error.message : 'Failed to sync study data.';
          setSyncState('error');
          setSyncError(message);
          if (isApiError(error) && error.status === 401) {
            clearAuth('Session expired. Please sign in again.');
          }
        });
    }, 450);

    return () => {
      window.clearTimeout(timer);
    };
  }, [difficulty, patternKey, quizAttempts, readyToSync, token, totalCorrect, totalQuestions, weakStats]);

  const questions = useMemo<QuizQuestion[]>(() => {
    const profile = QUIZ_PROFILE[patternKey];
    const others = PATTERNS.filter((p) => p.key !== patternKey).map((p) => QUIZ_PROFILE[p.key]);

    const all: QuizQuestion[] = [
      {
        id: 'scenario',
        category: 'scenario',
        prompt: 'Which task is the best fit?',
        options: buildOptions(profile.scenario, others.map((x) => x.scenario), patternIndex + 11),
        correct: profile.scenario,
        explanation: `Use this pattern when: ${pattern.whenToUse}`,
      },
      {
        id: 'mechanic',
        category: 'mechanic',
        prompt: 'What core process drives this pattern?',
        options: buildOptions(profile.mechanic, others.map((x) => x.mechanic), patternIndex + 13),
        correct: profile.mechanic,
        explanation: `Core behavior: ${profile.mechanic}`,
      },
      {
        id: 'complexity',
        category: 'complexity',
        prompt: 'Pick the most accurate typical complexity pair.',
        options: buildOptions(profile.complexityPair, others.map((x) => x.complexityPair), patternIndex + 17),
        correct: profile.complexityPair,
        explanation: `${pattern.timeComplexity}; ${pattern.spaceComplexity}.`,
      },
      {
        id: 'invariant',
        category: 'invariant',
        prompt: 'Which invariant should stay true while running it?',
        options: buildOptions(profile.invariant, others.map((x) => x.invariant), patternIndex + 19),
        correct: profile.invariant,
        explanation: `Invariant reminder: ${profile.invariant}`,
      },
      {
        id: 'pitfall',
        category: 'pitfall',
        prompt: 'Which bug is most characteristic for this pattern?',
        options: buildOptions(profile.pitfall, others.map((x) => x.pitfall), patternIndex + 23),
        correct: profile.pitfall,
        explanation: `Pitfall reminder: ${profile.pitfall}`,
      },
      {
        id: 'weak_fit',
        category: 'weak_fit',
        prompt: 'When is this pattern usually a poor fit?',
        options: buildOptions(profile.weakFit, others.map((x) => x.weakFit), patternIndex + 29),
        correct: profile.weakFit,
        explanation: `Use caution when: ${profile.weakFit}`,
      },
      {
        id: 'edge_case',
        category: 'edge_case',
        prompt: 'Which edge case should you test first?',
        options: buildOptions(profile.edgeCase, others.map((x) => x.edgeCase), patternIndex + 31),
        correct: profile.edgeCase,
        explanation: `Edge-case reminder: ${profile.edgeCase}`,
      },
    ];

    if (difficulty === 'easy') return all.slice(0, 4);
    if (difficulty === 'medium') return all.slice(0, 6);
    return all;
  }, [difficulty, pattern, patternIndex, patternKey]);

  const followUpQuestion = useMemo(() => {
    if (!followUpCategory) return null;
    return buildFollowUpQuestion(patternKey, pattern.name, followUpCategory, QUIZ_PROFILE, followUpSeed);
  }, [followUpCategory, followUpSeed, pattern.name, patternKey]);

  useEffect(() => {
    setAnswers({});
    setChecked(false);
    setFollowUpCategory(null);
    setFollowUpAnswer('');
    setFollowUpChecked(false);
  }, [patternKey, difficulty]);

  const answeredCount = questions.filter((q) => Boolean(answers[q.id])).length;
  const score = questions.filter((q) => answers[q.id] === q.correct).length;
  const percent = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const grade = gradeFromPercent(percent);

  const weakAreaRows = useMemo(() => {
    const categories: QuizCategory[] = ['scenario', 'mechanic', 'complexity', 'invariant', 'pitfall', 'weak_fit', 'edge_case'];
    return categories
      .map((c) => ({ category: c, misses: weakStats[`${patternKey}:${c}`] ?? 0 }))
      .sort((a, b) => b.misses - a.misses);
  }, [patternKey, weakStats]);

  const cumulativeAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const syncLabel = studyLoading
    ? 'loading saved study data...'
    : syncState === 'saving'
      ? 'saving...'
      : syncState === 'saved'
        ? 'saved'
        : syncState === 'error'
          ? 'sync error'
          : 'idle';

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (authLoading) return;
    if (!username.trim() || !password) {
      setAuthError('Enter both username and password.');
      return;
    }

    setAuthLoading(true);
    setAuthError('');
    setAuthInfo('');

    try {
      const response =
        authMode === 'login'
          ? await loginUser(username.trim(), password)
          : await registerUser(username.trim(), password);

      setToken(response.token);
      setUser(response.user);
      applySnapshot(response.study);
      setReadyToSync(true);
      setStudyLoading(false);
      setSyncState('saved');
      setSyncError('');
      setUsername('');
      setPassword('');
      setAuthInfo(authMode === 'login' ? 'Signed in and loaded your study data.' : 'Account created and study data initialized.');
    } catch (error: unknown) {
      setAuthError(isApiError(error) ? error.message : 'Authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCheckAnswers = () => {
    if (answeredCount < questions.length) return;
    setChecked(true);
    setQuizAttempts((prev) => prev + 1);
    setTotalCorrect((prev) => prev + score);
    setTotalQuestions((prev) => prev + questions.length);

    const wrong = questions.filter((q) => answers[q.id] !== q.correct);
    if (wrong.length > 0) {
      setWeakStats((prev) => {
        const next = { ...prev };
        wrong.forEach((q) => {
          const key = `${patternKey}:${q.category}`;
          next[key] = (next[key] ?? 0) + 1;
        });
        return next;
      });
      setFollowUpCategory(wrong[0]!.category);
    } else {
      setFollowUpCategory(weakestCategoryForPattern(weakStats, patternKey));
    }

    setFollowUpSeed((x) => x + 1);
    setFollowUpAnswer('');
    setFollowUpChecked(false);
  };

  const handleCheckFollowUp = () => {
    if (!followUpQuestion || !followUpAnswer) return;
    setFollowUpChecked(true);
    if (followUpAnswer !== followUpQuestion.correct) {
      setWeakStats((prev) => {
        const next = { ...prev };
        const key = `${patternKey}:${followUpQuestion.category}`;
        next[key] = (next[key] ?? 0) + 1;
        return next;
      });
    }
  };

  return (
    <div className="page">
      <header className="hero">
        <h2>Study Lab</h2>
        <p>Pattern summary + quiz mode. Use this page to test recognition and explanation speed.</p>
      </header>

      <section className="panel study-auth-panel">
        <div className="panel-head">
          <h3>Study Account</h3>
          {user ? <span className="quiz-pattern-tag">Signed in: {user.username}</span> : <span className="muted">Sign in to sync your progress</span>}
        </div>

        {!user && (
          <form className="auth-form" onSubmit={handleAuthSubmit}>
            <div className="row gap-sm auth-mode-row">
              <button
                className={`btn ${authMode === 'login' ? 'primary' : ''}`}
                type="button"
                onClick={() => setAuthMode('login')}
              >
                Login
              </button>
              <button
                className={`btn ${authMode === 'register' ? 'primary' : ''}`}
                type="button"
                onClick={() => setAuthMode('register')}
              >
                Create Account
              </button>
            </div>

            <div className="form-grid">
              <label className="field">
                Username
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="letters, numbers, underscore"
                  autoComplete="username"
                />
              </label>
              <label className="field">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="minimum 8 characters"
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                />
              </label>
            </div>

            <div className="row gap-sm study-quiz-actions">
              <button className="btn primary" type="submit" disabled={authLoading}>
                {authLoading ? 'Working...' : authMode === 'login' ? 'Sign In' : 'Register'}
              </button>
            </div>

            <p className="muted">Progress sync status: {syncLabel}</p>
            {authError && <p className="quiz-feedback bad">{authError}</p>}
            {authInfo && <p className="quiz-feedback ok">{authInfo}</p>}
            {syncError && <p className="quiz-feedback bad">{syncError}</p>}
          </form>
        )}

        {user && (
          <div className="auth-session">
            <p className="muted">Progress sync status: {syncLabel}</p>
            <p>
              <strong>Lifetime quiz attempts:</strong> {quizAttempts}
            </p>
            <p>
              <strong>Cumulative accuracy:</strong> {cumulativeAccuracy}% ({totalCorrect}/{totalQuestions || 0})
            </p>
            <div className="row gap-sm study-quiz-actions">
              <button className="btn" type="button" onClick={() => clearAuth('Signed out. Local progress remains available.')}>
                Sign Out
              </button>
            </div>
            {authInfo && <p className="quiz-feedback ok">{authInfo}</p>}
            {syncError && <p className="quiz-feedback bad">{syncError}</p>}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Pattern Focus</h3>
          <PatternPicker value={patternKey} onChange={setPatternKey} />
        </div>

        <p><strong>What it does:</strong> {pattern.whatItDoes}</p>
        <p><strong>When to use:</strong> {pattern.whenToUse}</p>
        <p><strong>Time:</strong> {pattern.timeComplexity}</p>
        <p><strong>Space:</strong> {pattern.spaceComplexity}</p>
        <p><strong>Interview phrasing:</strong> {pattern.englishLine}</p>

        <article className="card">
          <h4>Pattern Core</h4>
          <p><strong>Invariant:</strong> {pattern.invariant}</p>
          <p><strong>Pitfalls:</strong> {pattern.pitfalls.join(', ')}</p>
          <p><strong>Edge cases:</strong> {pattern.edgeCases.join(', ')}</p>
        </article>
      </section>

      <section className="panel panel-spacious study-quiz-panel">
        <div className="panel-head study-quiz-head">
          <h3>Interactive Quiz</h3>
          <span className="quiz-pattern-tag">Pattern: {pattern.name}</span>
        </div>

        <div className="row gap-sm study-difficulty-row">
          {DIFFICULTY_ORDER.map((d) => (
            <button
              key={d}
              className={`btn ${difficulty === d ? 'primary' : ''}`}
              type="button"
              onClick={() => setDifficulty(d)}
            >
              {d[0]?.toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>

        <p className="muted quiz-progress">
          Difficulty: <strong>{difficulty}</strong> | Answered {answeredCount}/{questions.length} | Lifetime attempts: {quizAttempts} | Cumulative accuracy: {cumulativeAccuracy}%.
        </p>

        {questions.map((question, idx) => {
          const selected = answers[question.id] ?? '';
          const isCorrect = selected === question.correct;
          return (
            <article key={question.id} className="card quiz-question-card">
              <h4 className="quiz-question-title">{idx + 1}) {question.prompt}</h4>
              <p className="muted quiz-question-meta">Category: {question.category.replace('_', ' ')}</p>
              <div className="quiz-option-grid" role="radiogroup" aria-label={question.prompt}>
                {question.options.map((option) => {
                  const selectedClass = selected === option ? 'selected' : '';
                  const gradedClass =
                    checked && option === question.correct
                      ? 'correct'
                      : checked && selected === option && option !== question.correct
                        ? 'wrong'
                        : '';
                  return (
                    <button
                      key={option}
                      className={`quiz-option-card ${selectedClass} ${gradedClass}`.trim()}
                      type="button"
                      onClick={() => {
                        setAnswers((prev) => ({ ...prev, [question.id]: option }));
                      }}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {checked && (
                <p className={`quiz-feedback ${isCorrect ? 'ok' : 'bad'}`}>
                  {isCorrect ? 'Correct.' : `Correct answer: ${question.correct}.`} {question.explanation}
                </p>
              )}
            </article>
          );
        })}

        <div className="row gap-sm study-quiz-actions">
          <button className="btn primary" type="button" disabled={answeredCount < questions.length} onClick={handleCheckAnswers}>
            Check Answers
          </button>
          <button
            className="btn"
            type="button"
            onClick={() => {
              setAnswers({});
              setChecked(false);
              setFollowUpCategory(null);
              setFollowUpAnswer('');
              setFollowUpChecked(false);
            }}
          >
            Reset
          </button>
        </div>

        {answeredCount < questions.length && <p className="muted">Complete all questions to enable scoring.</p>}

        {checked && (
          <article className="card study-quiz-result">
            <h4>
              Score: {score}/{questions.length} ({percent}%)
            </h4>
            <p><strong>Grade:</strong> {grade}</p>
            <p><strong>Pattern:</strong> {pattern.name}</p>
            <p><strong>Cumulative Accuracy:</strong> {cumulativeAccuracy}%</p>
          </article>
        )}

        <article className="card study-weak-card">
          <h4>Weak Area Tracker</h4>
          <p className="muted">Miss counts are tracked per pattern/category and used for follow-up practice.</p>
          <ul>
            {weakAreaRows.map((row) => (
              <li key={row.category}>
                <strong>{row.category.replace('_', ' ')}</strong>: {row.misses}
              </li>
            ))}
          </ul>
        </article>

        {checked && followUpQuestion && (
          <article className="card study-followup-card">
            <h4>Targeted Follow-up: {followUpQuestion.category.replace('_', ' ')}</h4>
            <p className="quiz-followup-prompt">{followUpQuestion.prompt}</p>
            <div className="quiz-option-grid" role="radiogroup" aria-label="Targeted Follow-up">
              {followUpQuestion.options.map((option) => {
                const selectedClass = followUpAnswer === option ? 'selected' : '';
                const gradedClass =
                  followUpChecked && option === followUpQuestion.correct
                    ? 'correct'
                    : followUpChecked && followUpAnswer === option && option !== followUpQuestion.correct
                      ? 'wrong'
                      : '';
                return (
                  <button
                    key={option}
                    className={`quiz-option-card ${selectedClass} ${gradedClass}`.trim()}
                    type="button"
                    onClick={() => setFollowUpAnswer(option)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            <div className="row gap-sm study-quiz-actions">
              <button className="btn primary" type="button" disabled={!followUpAnswer} onClick={handleCheckFollowUp}>
                Check Follow-up
              </button>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  setFollowUpSeed((x) => x + 1);
                  setFollowUpAnswer('');
                  setFollowUpChecked(false);
                }}
              >
                New Follow-up
              </button>
            </div>
            {followUpChecked && (
              <p className={`quiz-feedback ${followUpAnswer === followUpQuestion.correct ? 'ok' : 'bad'}`}>
                {followUpAnswer === followUpQuestion.correct ? 'Correct.' : `Correct answer: ${followUpQuestion.correct}.`} {followUpQuestion.explanation}
              </p>
            )}
          </article>
        )}
      </section>
    </div>
  );
}
