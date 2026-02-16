import { useState } from 'react';

import { ComplexityDrill } from '../components/ComplexityDrill';
import { ComplexityPlayground } from '../components/ComplexityPlayground';
import { COMPLEXITY_TERMS, SPACE_COMPLEXITY_CARDS, TIME_COMPLEXITY_CARDS } from '../lib/studyData';

export function ComplexityTrainerPage() {
  const [showReference, setShowReference] = useState(false);
  const [showTerms, setShowTerms] = useState(true);

  return (
    <div className="page">
      <header className="hero">
        <h2>Complexity Trainer</h2>
        <p>Standalone page for learning notation fast: simple meaning, deeper meaning, and drills.</p>
      </header>

      <section className="panel">
        <p><strong>Time complexity</strong> describes how runtime grows with input size.</p>
        <p><strong>Space complexity</strong> describes how extra memory (auxiliary space) grows.</p>
        <p className="muted">Example: If asked “O(n) what is this?”, answer: “Linear time.”</p>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Term Help (Plain English)</h3>
          <button className="btn" type="button" onClick={() => setShowTerms((prev) => !prev)}>
            {showTerms ? 'Hide Term Help' : 'Show Term Help'}
          </button>
        </div>

        {!showTerms && <p className="muted">Hidden. Show when you need term definitions.</p>}

        {showTerms && (
          <div className="glossary-grid">
            {COMPLEXITY_TERMS.map((item) => (
              <article className="card glossary-card" key={item.term}>
                <h4>{item.term}</h4>
                <p>{item.meaning}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-head quick-ref-head">
          <h3>Quick Reference</h3>
          <button className="btn" type="button" onClick={() => setShowReference((prev) => !prev)}>
            {showReference ? 'Hide Quick Reference' : 'Show Quick Reference'}
          </button>
        </div>

        {!showReference && <p className="muted">Hidden so you can practice without seeing answers.</p>}

        {showReference && (
          <div className="two-col">
            <article className="card">
              <h4>Time</h4>
              <ul>
                {TIME_COMPLEXITY_CARDS.map((c) => (
                  <li key={c.notation}>
                    <strong>{c.notation}</strong>: {c.name} - {c.plain}
                  </li>
                ))}
              </ul>
            </article>
            <article className="card">
              <h4>Space</h4>
              <ul>
                {SPACE_COMPLEXITY_CARDS.map((c) => (
                  <li key={c.notation}>
                    <strong>{c.notation}</strong>: {c.name} - {c.plain}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="two-col drill-grid">
          <ComplexityDrill title="Time Drill" cards={TIME_COMPLEXITY_CARDS} prefix="time" />
          <ComplexityDrill title="Space Drill" cards={SPACE_COMPLEXITY_CARDS} prefix="space" />
        </div>
      </section>

      <section className="panel">
        <ComplexityPlayground />
      </section>
    </div>
  );
}
