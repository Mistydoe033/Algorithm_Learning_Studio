import { useEffect, useMemo, useState } from 'react';

import type { PatternKey } from '../data/patterns';
import { changedFields, explainDeep, explainSimple } from '../lib/explanations';
import type { Step } from '../lib/algorithms';

interface StepPlayerProps {
  pattern: PatternKey;
  steps: Step[];
  renderVisual?: (step: Step) => JSX.Element | null;
}

export function StepPlayer({ pattern, steps, renderVisual }: StepPlayerProps) {
  const [index, setIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [speedMs, setSpeedMs] = useState(500);
  const [showRaw, setShowRaw] = useState(false);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    setIndex(0);
    setAutoPlay(false);
  }, [steps]);

  useEffect(() => {
    if (!autoPlay || steps.length === 0) return;
    if (index >= steps.length - 1) {
      setAutoPlay(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setIndex((prev) => Math.min(prev + 1, steps.length - 1));
    }, speedMs);

    return () => window.clearTimeout(timer);
  }, [autoPlay, speedMs, index, steps]);

  const step = steps[index] ?? null;
  const prev = index > 0 ? steps[index - 1] : null;
  const simple = useMemo(() => (step ? explainSimple(pattern, step) : null), [pattern, step]);
  const deep = useMemo(() => (step ? explainDeep(pattern, step) : null), [pattern, step]);
  const changes = useMemo(() => (step ? changedFields(prev, step) : []), [prev, step]);

  if (!step) return <p className="muted">No steps available.</p>;

  return (
    <section className="panel">
      <div className="panel-head">
        <h3>Step Player</h3>
        <div className="row gap-sm">
          <button className="btn" type="button" onClick={() => setIndex((x) => Math.max(0, x - 1))}>
            Prev
          </button>
          <button className="btn" type="button" onClick={() => setIndex((x) => Math.min(steps.length - 1, x + 1))}>
            Next
          </button>
          <button className="btn primary" type="button" onClick={() => setAutoPlay((x) => !x)}>
            {autoPlay ? 'Pause' : 'Auto Play'}
          </button>
        </div>
      </div>

      <label className="label" htmlFor="step-slider">
        Step {index + 1} / {steps.length}
      </label>
      <input
        id="step-slider"
        type="range"
        min={0}
        max={Math.max(0, steps.length - 1)}
        value={index}
        onChange={(e) => setIndex(Number.parseInt(e.target.value, 10))}
      />

      <label className="label" htmlFor="speed-slider">
        Auto Play Speed: {speedMs} ms
      </label>
      <input
        id="speed-slider"
        type="range"
        min={120}
        max={1400}
        step={40}
        value={speedMs}
        onChange={(e) => setSpeedMs(Number.parseInt(e.target.value, 10))}
      />

      <div className="two-col">
        <article className="card">
          <h4>Simple Explanation</h4>
          <p><strong>What:</strong> {simple?.what}</p>
          <p><strong>Why:</strong> {simple?.why}</p>
        </article>
        <article className="card">
          <h4>Deeper Explanation</h4>
          <p><strong>What:</strong> {deep?.what}</p>
          <p><strong>Why:</strong> {deep?.why}</p>
        </article>
      </div>

      {changes.length > 0 && (
        <article className="card">
          <h4>State Changes</h4>
          <ul>
            {changes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      )}

      {renderVisual && <article className="card">{renderVisual(step)}</article>}

      <div className="row gap-sm">
        <button className="btn" type="button" onClick={() => setShowRaw((x) => !x)}>
          {showRaw ? 'Hide Raw Step' : 'Show Raw Step'}
        </button>
        <button className="btn" type="button" onClick={() => setShowTable((x) => !x)}>
          {showTable ? 'Hide Step Table' : 'Show Step Table'}
        </button>
      </div>

      {showRaw && <pre className="code-block">{JSON.stringify(step, null, 2)}</pre>}

      {showTable && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {Object.keys(steps[0] ?? {}).map((k) => (
                  <th key={k}>{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {steps.map((row, i) => (
                <tr key={String(i)}>
                  {Object.keys(steps[0] ?? {}).map((k) => (
                    <td key={k}>{String(row[k] ?? '')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
