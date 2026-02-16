import { useMemo, useState } from 'react';

import { ComplexityPlayground } from '../components/ComplexityPlayground';
import { SPACE_COMPLEXITY_CARDS, TIME_COMPLEXITY_CARDS } from '../lib/studyData';

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
  const plainChoices = useMemo(() => {
    const distractors = cards.filter((c) => c.notation !== notation).slice(0, 3).map((c) => c.plain);
    return [...distractors, selected.plain];
  }, [cards, notation, selected.plain]);

  const score = (nameAnswer === selected.name ? 1 : 0) + (plainAnswer === selected.plain ? 1 : 0);

  return (
    <article className="card">
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

      <p><strong>Simple:</strong> {selected.notation} means {selected.name}.</p>
      <p><strong>Deeper:</strong> {selected.deeper}</p>

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

      <button className="btn primary" type="button" onClick={() => setChecked(true)}>
        Check This Drill
      </button>

      {checked && (
        <p>
          Score: {score}/2
          {' | '}
          {nameAnswer === selected.name ? 'Name correct' : `Name should be: ${selected.name}`}
          {' | '}
          {plainAnswer === selected.plain ? 'Meaning correct' : `Meaning should be: ${selected.plain}`}
        </p>
      )}
    </article>
  );
}

export function ComplexityTrainerPage() {
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
        <h3>Quick Reference</h3>
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
