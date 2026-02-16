import { useEffect, useMemo, useState } from 'react';

import { ComplexityPlayground } from '../components/ComplexityPlayground';
import { COMPLEXITY_TERMS, SPACE_COMPLEXITY_CARDS, TIME_COMPLEXITY_CARDS } from '../lib/studyData';

interface Card {
  notation: string;
  name: string;
  plain: string;
  deeper: string;
}

function ComplexityDrill({ title, cards, prefix }: { title: string; cards: Card[]; prefix: string }) {
  const [notation, setNotation] = useState(cards[0]?.notation ?? '');
  const [nameAnswer, setNameAnswer] = useState('');
  const [plainAnswer, setPlainAnswer] = useState('');
  const [checked, setChecked] = useState(false);

  const selected = useMemo(() => cards.find((x) => x.notation === notation) ?? cards[0], [cards, notation]);
  const plainChoices = useMemo(() => cards.map((c) => c.plain), [cards]);

  const score = (nameAnswer === selected.name ? 1 : 0) + (plainAnswer === selected.plain ? 1 : 0);

  useEffect(() => {
    setNameAnswer('');
    setPlainAnswer('');
    setChecked(false);
  }, [notation]);

  return (
    <article className="card drill-card">
      <h4>{title}</h4>
      <label className="field">
        Pick notation
        <select value={notation} onChange={(e) => setNotation(e.target.value)}>
          {cards.map((c) => (
            <option key={c.notation} value={c.notation}>
              {c.notation}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        What is {selected.notation}?
        <select value={nameAnswer} onChange={(e) => setNameAnswer(e.target.value)}>
          <option value="">Select answer</option>
          {cards.map((c) => (
            <option key={`${prefix}-${c.name}`} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        Which plain-English meaning matches {selected.notation}?
        <select value={plainAnswer} onChange={(e) => setPlainAnswer(e.target.value)}>
          <option value="">Select answer</option>
          {plainChoices.map((c) => (
            <option key={`${prefix}-${c}`} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <div className="drill-actions">
        <button className="btn primary" type="button" onClick={() => setChecked(true)}>
          Check This Drill
        </button>
      </div>

      {checked && (
        <div className="drill-score">
          <p>
            Score: {score}/2
            {' | '}
            {nameAnswer === selected.name ? 'Name correct' : `Name should be: ${selected.name}`}
            {' | '}
            {plainAnswer === selected.plain ? 'Meaning correct' : `Meaning should be: ${selected.plain}`}
          </p>
          <p><strong>Simple:</strong> {selected.notation} means {selected.name}.</p>
          <p><strong>Deeper:</strong> {selected.deeper}</p>
        </div>
      )}
    </article>
  );
}

export function ComplexityTrainerPage() {
  const [showReference, setShowReference] = useState(false);

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
        <h3>Term Help (Plain English)</h3>
        <div className="glossary-grid">
          {COMPLEXITY_TERMS.map((item) => (
            <article className="card glossary-card" key={item.term}>
              <h4>{item.term}</h4>
              <p>{item.meaning}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
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
        <div className="two-col">
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
