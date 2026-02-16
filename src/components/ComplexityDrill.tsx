import { useEffect, useMemo, useState } from 'react';

import type { ComplexityDrillProps } from './complexity-drill.types';

export function ComplexityDrill({ title, cards, prefix }: ComplexityDrillProps) {
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
    <article className="drill-card drill-surface">
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
