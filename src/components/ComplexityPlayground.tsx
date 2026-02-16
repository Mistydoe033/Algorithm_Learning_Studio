import { useMemo, useState } from 'react';

function formatValue(value: number): string {
  if (value >= 1_000_000) return value.toExponential(2);
  if (value >= 10_000) return Math.round(value).toLocaleString();
  if (value >= 100) return value.toFixed(0);
  if (value >= 10) return value.toFixed(1);
  return value.toFixed(2);
}

function formatExpanded(value: number): string {
  return Math.round(value).toLocaleString();
}

export function ComplexityPlayground() {
  const [n, setN] = useState(256);
  const [scale, setScale] = useState<'log' | 'linear'>('log');
  const data = useMemo(() => {
    const values = [
      { label: 'O(1)', value: 1 },
      { label: 'O(log n)', value: Math.log2(n) },
      { label: 'O(n)', value: n },
      { label: 'O(n log n)', value: n * Math.log2(n) },
      { label: 'O(n^2)', value: n * n },
    ];
    const normalized = values.map((x) => (scale === 'linear' ? x.value : Math.log10(x.value + 1)));
    const max = Math.max(...normalized, 1);
    return values.map((x, i) => ({ ...x, pct: (normalized[i] / max) * 100 }));
  }, [n, scale]);

  const quadratic = data.find((d) => d.label === 'O(n^2)');
  const quadraticSci = quadratic ? quadratic.value.toExponential(2) : '0';
  const [mantissa, exponentRaw] = quadraticSci.split('e');
  const exponent = Number.parseInt(exponentRaw ?? '0', 10);

  return (
    <article className="card">
      <h4>Growth Playground</h4>
      <label className="field">
        Input size n: {n}
        <input type="range" min={8} max={10000} step={8} value={n} onChange={(e) => setN(Number.parseInt(e.target.value, 10))} />
      </label>
      <div className="row gap-sm">
        <button className={`btn ${scale === 'log' ? 'primary' : ''}`} type="button" onClick={() => setScale('log')}>
          Log Scale
        </button>
        <button className={`btn ${scale === 'linear' ? 'primary' : ''}`} type="button" onClick={() => setScale('linear')}>
          Linear Scale
        </button>
      </div>
      <div className="bars-vertical">
        {data.map((d) => (
          <div key={d.label} className="bars-item">
            <div className="bars-col" style={{ height: `${d.pct}%` }} />
            <span className="bars-value">{formatValue(d.value)}</span>
            <span>{d.label}</span>
          </div>
        ))}
      </div>
      <p className="muted">
        Shows growth trend only. Use <strong>Log Scale</strong> to compare all curves, <strong>Linear Scale</strong> to feel true magnitude gaps.
      </p>
      <article className="card">
        <h4>How To Read This</h4>
        <p>
          <strong>Numbers under bars:</strong> these are estimated work units for the selected input size <strong>n={n}</strong>, not seconds.
        </p>
        <p>
          <strong>Linear Scale:</strong> bar height uses raw values. Big complexities dominate, so small ones can look flat.
        </p>
        <p>
          <strong>Log Scale:</strong> bar height uses a log transform so all complexities stay visible and comparable.
        </p>
        <p>
          <strong>Scientific notation:</strong> <code>{quadraticSci}</code> means <code>{mantissa} x 10^{exponent}</code>, which is about{' '}
          <code>{formatExpanded(quadratic?.value ?? 0)}</code>.
        </p>
      </article>
    </article>
  );
}
