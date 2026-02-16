import { useMemo, useState } from 'react';

export function ComplexityPlayground() {
  const [n, setN] = useState(256);
  const data = useMemo(() => {
    const values = [
      { label: 'O(1)', value: 1 },
      { label: 'O(log n)', value: Math.log2(n) },
      { label: 'O(n)', value: n },
      { label: 'O(n log n)', value: n * Math.log2(n) },
      { label: 'O(n^2)', value: n * n },
    ];
    const max = Math.max(...values.map((x) => x.value), 1);
    return values.map((x) => ({ ...x, pct: (x.value / max) * 100 }));
  }, [n]);

  return (
    <article className="card">
      <h4>Growth Playground</h4>
      <label className="field">
        Input size n: {n}
        <input type="range" min={8} max={10000} step={8} value={n} onChange={(e) => setN(Number.parseInt(e.target.value, 10))} />
      </label>
      <div className="bars-vertical">
        {data.map((d) => (
          <div key={d.label} className="bars-item">
            <div className="bars-col" style={{ height: `${d.pct}%` }} />
            <span>{d.label}</span>
          </div>
        ))}
      </div>
      <p className="muted">Shows growth trend only. Actual runtime depends on constants and implementation details.</p>
    </article>
  );
}
