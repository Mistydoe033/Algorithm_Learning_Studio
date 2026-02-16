import { useState } from 'react';

import { PATTERNS, patternByKey, type PatternKey } from '../data/patterns';
import { SPACE_CORRECT, TIME_CORRECT, USE_CASE_CORRECT } from '../lib/studyData';

export function StudyLabPage() {
  const [patternKey, setPatternKey] = useState<PatternKey>('hash_set');
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');
  const [q3, setQ3] = useState('');
  const [q4, setQ4] = useState('');
  const [checked, setChecked] = useState(false);

  const pattern = patternByKey[patternKey];
  const invariantChoices = [
    pattern.invariant,
    ...PATTERNS.filter((p) => p.key !== patternKey)
      .slice(0, 3)
      .map((p) => p.invariant),
  ];

  const useCaseChoices = [
    USE_CASE_CORRECT[patternKey],
    'Try every permutation and check all answers.',
    'Always sort no matter what.',
    'Use only recursion depth as a heuristic.',
  ];

  const score =
    (q1 === USE_CASE_CORRECT[patternKey] ? 1 : 0) +
    (q2 === TIME_CORRECT[patternKey] ? 1 : 0) +
    (q3 === SPACE_CORRECT[patternKey] ? 1 : 0) +
    (q4 === pattern.invariant ? 1 : 0);

  return (
    <div className="page">
      <header className="hero">
        <h2>Study Lab</h2>
        <p>Pattern summary + quiz mode. Use this page to test recognition and explanation speed.</p>
      </header>

      <section className="panel">
        <div className="panel-head">
          <h3>Pattern Focus</h3>
          <select value={patternKey} onChange={(e) => setPatternKey(e.target.value as PatternKey)}>
            {PATTERNS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.name}
              </option>
            ))}
          </select>
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
        <h3>Interactive Quiz</h3>
        <label className="field">
          1) Best use case
          <select value={q1} onChange={(e) => setQ1(e.target.value)}>
            <option value="">Select answer</option>
            {useCaseChoices.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          2) Typical time complexity
          <select value={q2} onChange={(e) => setQ2(e.target.value)}>
            <option value="">Select answer</option>
            <option>O(1)</option>
            <option>O(log n)</option>
            <option>O(n)</option>
            <option>O(n log n)</option>
            <option>O(V + E)</option>
            <option>O(states * transitions)</option>
            <option>O(n^2)</option>
            <option>O(n) average</option>
          </select>
        </label>

        <label className="field">
          3) Typical space complexity
          <select value={q3} onChange={(e) => setQ3(e.target.value)}>
            <option value="">Select answer</option>
            <option>O(1)</option>
            <option>O(n)</option>
            <option>O(V)</option>
            <option>O(states)</option>
            <option>O(1) or O(k)</option>
          </select>
        </label>

        <label className="field">
          4) Correct invariant
          <select value={q4} onChange={(e) => setQ4(e.target.value)}>
            <option value="">Select answer</option>
            {invariantChoices.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </label>

        <div className="row gap-sm study-quiz-actions">
          <button className="btn primary" type="button" onClick={() => setChecked(true)}>
            Check Answers
          </button>
          <button
            className="btn"
            type="button"
            onClick={() => {
              setQ1('');
              setQ2('');
              setQ3('');
              setQ4('');
              setChecked(false);
            }}
          >
            Reset
          </button>
        </div>

        {checked && (
          <article className="card">
            <h4>Score: {score}/4</h4>
            <p>Q1 correct: {String(q1 === USE_CASE_CORRECT[patternKey])}</p>
            <p>Q2 correct: {String(q2 === TIME_CORRECT[patternKey])}</p>
            <p>Q3 correct: {String(q3 === SPACE_CORRECT[patternKey])}</p>
            <p>Q4 correct: {String(q4 === pattern.invariant)}</p>
          </article>
        )}
      </section>
    </div>
  );
}
