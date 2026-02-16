import { PATTERNS, patternByKey, type PatternKey } from '../../data/patterns';
import { type StudySnapshot } from '../../lib/studyApi';
import {
  DEFAULT_PROGRESS,
  QUIZ_CATEGORIES,
  QUIZ_PROFILE,
  SPACE_COMPLEXITY_CARD_OPTIONS,
  TIME_COMPLEXITY_CARD_OPTIONS,
} from './consts';
import type {
  Difficulty,
  PatternQuizProfile,
  QuizCategory,
  QuizQuestion,
  SavePayload,
  SnapshotStatePatch,
  StudyProgress,
} from './types';

export function categoryToLabel(category: QuizCategory): string {
  return category.replace(/_/g, ' ');
}

function detailedWhySections(
  category: QuizCategory,
  patternKey: PatternKey,
  profile: PatternQuizProfile,
): { plain: string[]; technical: string[] } {
  const pattern = patternByKey[patternKey];
  switch (category) {
    case 'scenario':
      return {
        plain: [
          'This task needs state that updates while you scan, instead of a second full pass.',
          `Pattern fit: ${pattern.whatItDoes}`,
          'That gives a direct path from each input step to the final answer.',
        ],
        technical: [
          `Execution model: ${profile.mechanic}`,
          `Invariant maintained: ${profile.invariant}`,
          `Complexity alignment: ${pattern.timeComplexity}`,
        ],
      };
    case 'mechanic':
      return {
        plain: [
          'Each step updates exactly the state you need for the next step.',
          'The algorithm carries forward validated state instead of recomputing from scratch.',
          'When that state stays consistent, the final output is reliable.',
        ],
        technical: [
          `Transition rule: ${profile.mechanic}`,
          `State guarantee: ${profile.invariant}`,
          'Correctness structure: establish invariant, maintain it per step, conclude at termination.',
        ],
      };
    case 'time_complexity':
      return {
        plain: [
          'This time card matches how total work grows as input grows.',
          `Plain-English runtime note: ${pattern.englishLine}`,
          'Bigger inputs increase work by this growth pattern, not by a fixed amount.',
        ],
        technical: [
          `Asymptotic runtime model: ${pattern.timeComplexity}`,
          `Operational basis: ${profile.mechanic}`,
          'Language/runtime constants can change speed, but not the dominant Big-O growth class.',
        ],
      };
    case 'space_complexity':
      return {
        plain: [
          'This space card matches how extra memory grows beyond the input itself.',
          'Most extra memory comes from the algorithm state it must keep during execution.',
          `Memory note: ${pattern.spaceComplexity}`,
        ],
        technical: [
          `Asymptotic auxiliary-space model: ${pattern.spaceComplexity}`,
          `State tracked during execution: ${profile.invariant}`,
          'Auxiliary structure size (set/map/queue/cache) is usually the dominant memory term.',
        ],
      };
    case 'invariant':
      return {
        plain: [
          'An invariant is a safety rule that must stay true while the algorithm runs.',
          'Keeping that rule true prevents state drift and silent logic bugs.',
          'If the rule breaks at any step, later results are built on bad state.',
        ],
        technical: [
          `Invariant statement: ${profile.invariant}`,
          'Proof obligation: show base case, maintenance, and termination under this invariant.',
          'Use invariant checks while debugging to catch logic drift early.',
        ],
      };
    case 'pitfall':
      return {
        plain: [
          'This is a common trap because it often appears to work on easy examples.',
          'The failure usually shows up first on boundary or adversarial inputs.',
          'Avoiding this trap removes a high-probability source of wrong answers.',
        ],
        technical: [
          `Failure mode: ${profile.pitfall}`,
          `Related invariant/assumption: ${profile.invariant}`,
          `Fast detection test: ${profile.edgeCase}`,
        ],
      };
    case 'weak_fit':
      return {
        plain: [
          'This is where the pattern starts fighting the problem instead of helping.',
          'You can still force it, but code and reasoning usually get messier.',
          'Switching to a better-fit pattern usually lowers bug risk and complexity.',
        ],
        technical: [
          `Weak-fit condition: ${profile.weakFit}`,
          `Current mechanism: ${profile.mechanic}`,
          'Constraint mismatch usually harms either asymptotic efficiency or proof simplicity.',
        ],
      };
    case 'edge_case':
      return {
        plain: [
          'This boundary test is a fast way to catch hidden logic bugs.',
          'Edge cases validate setup, stop conditions, and boundary handling.',
          'Passing this early improves confidence before broad random testing.',
        ],
        technical: [
          `Priority edge test: ${profile.edgeCase}`,
          `Invariant to verify on this test: ${profile.invariant}`,
          `Typical failure trigger: ${profile.pitfall}`,
        ],
      };
    default:
      return {
        plain: ['This option best matches the pattern behavior and constraints.'],
        technical: ['Best fit under the given constraints and invariant model.'],
      };
  }
}

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

export function gradeFromPercent(percent: number): string {
  if (percent >= 90) return 'A';
  if (percent >= 80) return 'B';
  if (percent >= 70) return 'C';
  if (percent >= 60) return 'D';
  return 'F';
}

export function weakestCategoryForPattern(stats: Record<string, number>, pattern: PatternKey): QuizCategory | null {
  let best: QuizCategory | null = null;
  let maxScore = -1;
  QUIZ_CATEGORIES.forEach((category) => {
    const key = `${pattern}:${category}`;
    const score = stats[key] ?? 0;
    if (score > maxScore) {
      maxScore = score;
      best = category;
    }
  });
  return maxScore > 0 ? best : null;
}

export function buildFollowUpQuestion(
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

  const categoryMap: Record<
    QuizCategory,
    { prompt: string; correct: string; explanation: { plain: string[]; technical: string[] }; pool: string[] }
  > = {
    scenario: {
      prompt: `Follow-up (${patternName}): choose the best-fit scenario.`,
      correct: profile.scenario,
      explanation: detailedWhySections('scenario', patternKey, profile),
      pool: others.map((x) => x.scenario),
    },
    mechanic: {
      prompt: `Follow-up (${patternName}): identify the core mechanic.`,
      correct: profile.mechanic,
      explanation: detailedWhySections('mechanic', patternKey, profile),
      pool: others.map((x) => x.mechanic),
    },
    time_complexity: {
      prompt: `Follow-up (${patternName}): choose the best matching time-complexity card.`,
      correct: profile.timeComplexity,
      explanation: detailedWhySections('time_complexity', patternKey, profile),
      pool: TIME_COMPLEXITY_CARD_OPTIONS.filter((x) => x !== profile.timeComplexity),
    },
    space_complexity: {
      prompt: `Follow-up (${patternName}): choose the best matching space-complexity card.`,
      correct: profile.spaceComplexity,
      explanation: detailedWhySections('space_complexity', patternKey, profile),
      pool: SPACE_COMPLEXITY_CARD_OPTIONS.filter((x) => x !== profile.spaceComplexity),
    },
    invariant: {
      prompt: `Follow-up (${patternName}): which invariant must stay true?`,
      correct: profile.invariant,
      explanation: detailedWhySections('invariant', patternKey, profile),
      pool: others.map((x) => x.invariant),
    },
    pitfall: {
      prompt: `Follow-up (${patternName}): which bug is most likely?`,
      correct: profile.pitfall,
      explanation: detailedWhySections('pitfall', patternKey, profile),
      pool: others.map((x) => x.pitfall),
    },
    weak_fit: {
      prompt: `Follow-up (${patternName}): when is this pattern a weak choice?`,
      correct: profile.weakFit,
      explanation: detailedWhySections('weak_fit', patternKey, profile),
      pool: others.map((x) => x.weakFit),
    },
    edge_case: {
      prompt: `Follow-up (${patternName}): which edge case should be tested first?`,
      correct: profile.edgeCase,
      explanation: detailedWhySections('edge_case', patternKey, profile),
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

export function buildQuizQuestions(
  patternKey: PatternKey,
  difficulty: Difficulty,
  patternIndex: number,
  optionOrderSeed: number,
): QuizQuestion[] {
  const profile = QUIZ_PROFILE[patternKey];
  const others = PATTERNS.filter((p) => p.key !== patternKey).map((p) => QUIZ_PROFILE[p.key]);

  const all: QuizQuestion[] = [
    {
      id: 'scenario',
      category: 'scenario',
      prompt: 'Which task is the best fit?',
      options: buildOptions(profile.scenario, others.map((x) => x.scenario), patternIndex + 11 + optionOrderSeed),
      correct: profile.scenario,
      explanation: detailedWhySections('scenario', patternKey, profile),
    },
    {
      id: 'mechanic',
      category: 'mechanic',
      prompt: 'What core process drives this pattern?',
      options: buildOptions(profile.mechanic, others.map((x) => x.mechanic), patternIndex + 13 + optionOrderSeed),
      correct: profile.mechanic,
      explanation: detailedWhySections('mechanic', patternKey, profile),
    },
    {
      id: 'time_complexity',
      category: 'time_complexity',
      prompt: 'Pick the best matching Time card.',
      options: buildOptions(
        profile.timeComplexity,
        TIME_COMPLEXITY_CARD_OPTIONS.filter((x) => x !== profile.timeComplexity),
        patternIndex + 17 + optionOrderSeed,
      ),
      correct: profile.timeComplexity,
      explanation: detailedWhySections('time_complexity', patternKey, profile),
    },
    {
      id: 'space_complexity',
      category: 'space_complexity',
      prompt: 'Pick the best matching Space card.',
      options: buildOptions(
        profile.spaceComplexity,
        SPACE_COMPLEXITY_CARD_OPTIONS.filter((x) => x !== profile.spaceComplexity),
        patternIndex + 18 + optionOrderSeed,
      ),
      correct: profile.spaceComplexity,
      explanation: detailedWhySections('space_complexity', patternKey, profile),
    },
    {
      id: 'invariant',
      category: 'invariant',
      prompt: 'Which invariant should stay true while running it?',
      options: buildOptions(profile.invariant, others.map((x) => x.invariant), patternIndex + 19 + optionOrderSeed),
      correct: profile.invariant,
      explanation: detailedWhySections('invariant', patternKey, profile),
    },
    {
      id: 'pitfall',
      category: 'pitfall',
      prompt: 'Which bug is most characteristic for this pattern?',
      options: buildOptions(profile.pitfall, others.map((x) => x.pitfall), patternIndex + 23 + optionOrderSeed),
      correct: profile.pitfall,
      explanation: detailedWhySections('pitfall', patternKey, profile),
    },
    {
      id: 'weak_fit',
      category: 'weak_fit',
      prompt: 'When is this pattern usually a poor fit?',
      options: buildOptions(profile.weakFit, others.map((x) => x.weakFit), patternIndex + 29 + optionOrderSeed),
      correct: profile.weakFit,
      explanation: detailedWhySections('weak_fit', patternKey, profile),
    },
    {
      id: 'edge_case',
      category: 'edge_case',
      prompt: 'Which edge case should you test first?',
      options: buildOptions(profile.edgeCase, others.map((x) => x.edgeCase), patternIndex + 31 + optionOrderSeed),
      correct: profile.edgeCase,
      explanation: detailedWhySections('edge_case', patternKey, profile),
    },
  ];

  if (difficulty === 'easy') return all.slice(0, 5);
  if (difficulty === 'medium') return all.slice(0, 7);
  return all;
}

export function isPatternKey(value: string): value is PatternKey {
  return value in patternByKey;
}

export function isDifficulty(value: string): value is Difficulty {
  return value === 'easy' || value === 'medium' || value === 'hard';
}

function toNonNegativeInt(value: unknown): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value as number));
}

export function sanitizeStudyProgress(source: Partial<StudyProgress> | null | undefined): StudyProgress {
  const parsed = source ?? {};
  const pattern = typeof parsed.lastPattern === 'string' && isPatternKey(parsed.lastPattern)
    ? parsed.lastPattern
    : DEFAULT_PROGRESS.lastPattern;
  const difficulty = typeof parsed.lastDifficulty === 'string' && isDifficulty(parsed.lastDifficulty)
    ? parsed.lastDifficulty
    : DEFAULT_PROGRESS.lastDifficulty;

  return {
    weakStats: parsed.weakStats && typeof parsed.weakStats === 'object' ? parsed.weakStats : {},
    quizAttempts: toNonNegativeInt(parsed.quizAttempts),
    totalCorrect: toNonNegativeInt(parsed.totalCorrect),
    totalQuestions: toNonNegativeInt(parsed.totalQuestions),
    lastPattern: pattern,
    lastDifficulty: difficulty,
  };
}

export function normalizeStudySnapshot(snapshot: StudySnapshot): SnapshotStatePatch {
  return {
    weakStats: snapshot.weakStats ?? {},
    quizAttempts: toNonNegativeInt(snapshot.quizAttempts),
    totalCorrect: toNonNegativeInt(snapshot.totalCorrect),
    totalQuestions: toNonNegativeInt(snapshot.totalQuestions),
    patternKey: typeof snapshot.lastPattern === 'string' && isPatternKey(snapshot.lastPattern)
      ? snapshot.lastPattern
      : undefined,
    difficulty: typeof snapshot.lastDifficulty === 'string' && isDifficulty(snapshot.lastDifficulty)
      ? snapshot.lastDifficulty
      : undefined,
  };
}

export function toSavePayload(
  weakStats: Record<string, number>,
  quizAttempts: number,
  totalCorrect: number,
  totalQuestions: number,
  patternKey: PatternKey,
  difficulty: Difficulty,
): SavePayload {
  return {
    weakStats,
    quizAttempts,
    totalCorrect,
    totalQuestions,
    lastPattern: patternKey,
    lastDifficulty: difficulty,
  };
}
