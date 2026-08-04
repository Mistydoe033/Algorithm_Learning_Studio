import { useEffect, useMemo, useState } from 'react';

import {
  ALGORITHM_CHALLENGES,
  type AlgorithmChallenge,
  type AlgorithmFamily,
} from '../algorithmChallenges';

interface TestResult {
  label: string;
  pass: boolean;
  actual?: unknown;
  expected?: unknown;
  error?: string;
}

type RunState =
  | { status: 'idle' }
  | { status: 'running' }
  | { status: 'passed' | 'failed'; results: TestResult[] }
  | { status: 'error'; message: string };

const FAMILY_LABELS: Record<AlgorithmFamily, string> = {
  arrays: 'Arrays',
  graphs: 'Graphs',
  strings: 'Strings',
  optimization: 'Optimization',
  'data-structures': 'Data Structures',
  sorting: 'Sorting',
};

const pythonLiteral = (value: unknown): string => {
  if (value === null) return 'None';
  if (value === true) return 'True';
  if (value === false) return 'False';
  if (typeof value === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(pythonLiteral).join(', ')}]`;
  if (typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>).map(([key, entry]) => `${pythonLiteral(key)}: ${pythonLiteral(entry)}`).join(', ')}}`;
  }
  return String(value);
};

async function runChallengeCode(challenge: AlgorithmChallenge, code: string): Promise<RunState> {
  try {
    const response = await fetch('/api/run-python', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, functionName: challenge.functionName, tests: challenge.tests }),
    });
    const payload = await response.json() as { results?: TestResult[]; error?: string };
    if (!response.ok) return { status: 'error', message: payload.error ?? 'The Python runner could not start.' };
    const results = payload.results ?? [];
    return { status: results.every((result) => result.pass) ? 'passed' : 'failed', results };
  } catch {
    return { status: 'error', message: 'Python execution is unavailable. Start the project API server and try again.' };
  }
}

export function AlgorithmChallengeSection() {
  const [selectedId, setSelectedId] = useState(ALGORITHM_CHALLENGES[0]?.id ?? '');
  const [familyFilter, setFamilyFilter] = useState<'all' | AlgorithmFamily>('all');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [code, setCode] = useState(ALGORITHM_CHALLENGES[0]?.starterCode ?? '');
  const [runState, setRunState] = useState<RunState>({ status: 'idle' });
  const [showSolution, setShowSolution] = useState(false);

  const challenge = useMemo(
    () => ALGORITHM_CHALLENGES.find((entry) => entry.id === selectedId) ?? ALGORITHM_CHALLENGES[0],
    [selectedId],
  );
  const visibleChallenges = useMemo(
    () => familyFilter === 'all'
      ? ALGORITHM_CHALLENGES
      : ALGORITHM_CHALLENGES.filter((entry) => entry.family === familyFilter),
    [familyFilter],
  );
  const answeredCount = challenge?.questions.filter((question) => Boolean(answers[question.id])).length ?? 0;
  const quizScore = challenge?.questions.filter((question) => answers[question.id] === question.correct).length ?? 0;

  useEffect(() => {
    if (!challenge) return;
    setCode(challenge.starterCode);
    setAnswers({});
    setShowAnswers(false);
    setRunState({ status: 'idle' });
    setShowSolution(false);
  }, [challenge]);

  if (!challenge) return null;

  const selectChallenge = (id: string) => {
    setSelectedId(id);
  };

  const updateAnswer = (questionId: string, answer: string) => {
    setAnswers((current) => ({ ...current, [questionId]: answer }));
  };

  const runCode = async () => {
    setRunState({ status: 'running' });
    setRunState(await runChallengeCode(challenge, code));
  };

  return (
    <section className="algorithm-lab-section" aria-labelledby="algorithm-lab-title">
      <div className="algorithm-lab-heading">
        <div>
          <p className="eyebrow">Apply the pattern</p>
          <h3 id="algorithm-lab-title">Algorithm Challenge Lab</h3>
          <p className="muted algorithm-lab-intro">
            Learn the idea, answer the algorithm-specific questions, then implement it in a LeetCode-style Python function.
            Your code runs locally in a time-limited Python process.
          </p>
        </div>
        <div className="algorithm-lab-stat"><strong>{ALGORITHM_CHALLENGES.length}</strong><span>challenge tracks</span></div>
      </div>

      <div className="algorithm-library-toolbar">
        <label className="algorithm-filter-label" htmlFor="algorithm-family-filter">Filter library</label>
        <select id="algorithm-family-filter" value={familyFilter} onChange={(event) => setFamilyFilter(event.target.value as 'all' | AlgorithmFamily)}>
          <option value="all">All families</option>
          {Object.entries(FAMILY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <span className="muted">Showing {visibleChallenges.length} tracks</span>
      </div>

      <div className="algorithm-library" role="list" aria-label="Algorithm challenge tracks">
        {visibleChallenges.map((entry) => (
          <button
            key={entry.id}
            className={`algorithm-track ${entry.id === challenge.id ? 'active' : ''}`}
            type="button"
            onClick={() => selectChallenge(entry.id)}
          >
            <span className="algorithm-track-name">{entry.name}</span>
            <span className="algorithm-track-family">{FAMILY_LABELS[entry.family]} · {entry.level}</span>
          </button>
        ))}
      </div>

      <article className="card algorithm-challenge-card">
        <div className="algorithm-challenge-topline">
          <div>
            <span className="algorithm-chip">{FAMILY_LABELS[challenge.family]}</span>
            <span className="algorithm-chip algorithm-chip-level">{challenge.level}</span>
            <h4>{challenge.name}</h4>
          </div>
          <div className="algorithm-complexity">
            <span>Time <strong>{challenge.time}</strong></span>
            <span>Space <strong>{challenge.space}</strong></span>
          </div>
        </div>
        <p>{challenge.summary}</p>
        <div className="algorithm-tags">{challenge.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
      </article>

      <div className="algorithm-quiz-head">
        <div>
          <h4>1. Check your understanding</h4>
          <p className="muted">{answeredCount}/{challenge.questions.length} answered · {quizScore}/{challenge.questions.length} correct so far</p>
        </div>
        <button className="btn" type="button" onClick={() => setShowAnswers((value) => !value)}>
          {showAnswers ? 'Hide explanations' : 'Show explanations'}
        </button>
      </div>

      <div className="algorithm-question-grid">
        {challenge.questions.map((question, index) => {
          const selected = answers[question.id];
          const checked = Boolean(selected);
          return (
            <article className="card algorithm-question-card" key={question.id}>
              <p className="algorithm-question-number">Question {index + 1}</p>
              <h4>{question.prompt}</h4>
              <div className="quiz-option-grid" role="radiogroup" aria-label={question.prompt}>
                {question.options.map((option) => {
                  const isCorrect = checked && option === question.correct;
                  const isWrong = checked && selected === option && option !== question.correct;
                  return (
                    <button
                      key={option}
                      className={`quiz-option-card ${selected === option ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`.trim()}
                      type="button"
                      onClick={() => updateAnswer(question.id, option)}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {showAnswers && <p className={`algorithm-explanation ${selected === question.correct ? 'ok' : ''}`}><strong>{selected === question.correct ? 'Correct.' : 'Why:'}</strong> {question.explanation}</p>}
            </article>
          );
        })}
      </div>

      <article className="card code-challenge-card">
        <div className="code-challenge-heading">
          <div>
            <p className="eyebrow">2. Write the algorithm</p>
            <h4>LeetCode-style implementation</h4>
          </div>
          <span className="function-badge">Python · def {challenge.functionName}(...)</span>
        </div>
        <p className="code-challenge-prompt">{challenge.prompt}</p>
        <div className="test-case-strip">
          {challenge.tests.map((test) => <span key={test.label}><strong>{test.label}</strong> {challenge.functionName}({test.input.map(pythonLiteral).join(', ')}) → {pythonLiteral(test.expected)}</span>)}
        </div>
        <label className="code-editor-label" htmlFor={`code-editor-${challenge.id}`}>Your Python solution</label>
        <textarea
          id={`code-editor-${challenge.id}`}
          className="algorithm-code-editor"
          value={code}
          onChange={(event) => { setCode(event.target.value); setRunState({ status: 'idle' }); }}
          spellCheck={false}
          aria-label={`Code editor for ${challenge.name}`}
        />
        <div className="code-challenge-actions">
          <button className="btn primary" type="button" onClick={() => void runCode()} disabled={runState.status === 'running'}>
            {runState.status === 'running' ? 'Running tests…' : 'Run tests'}
          </button>
          <button className="btn" type="button" onClick={() => { setCode(challenge.starterCode); setRunState({ status: 'idle' }); }}>
            Reset editor
          </button>
          <button className="btn" type="button" onClick={() => setShowSolution((value) => !value)}>
            {showSolution ? 'Hide solution' : 'Reveal solution'}
          </button>
        </div>

        {runState.status === 'passed' || runState.status === 'failed' ? (
          <div className={`code-run-results ${runState.status}`}>
            <strong>{runState.status === 'passed' ? 'All tests passed.' : 'Some tests failed.'}</strong>
            <div className="test-result-grid">
              {runState.results.map((result) => (
                <div className={`test-result ${result.pass ? 'pass' : 'fail'}`} key={result.label}>
                  <span>{result.pass ? '✓' : '×'} {result.label}</span>
                  {!result.pass && <small>{result.error ? result.error : `Expected ${pythonLiteral(result.expected)}, got ${pythonLiteral(result.actual)}`}</small>}
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {runState.status === 'error' && <p className="code-run-error">{runState.message}</p>}

        {showSolution && (
          <div className="solution-block">
            <p className="muted">One correct approach:</p>
            <pre className="code-block"><code>{challenge.solutionCode}</code></pre>
          </div>
        )}

        <details className="challenge-hints">
          <summary>Need a hint?</summary>
          <ol>{challenge.hints.map((hint) => <li key={hint}>{hint}</li>)}</ol>
        </details>
      </article>
    </section>
  );
}
