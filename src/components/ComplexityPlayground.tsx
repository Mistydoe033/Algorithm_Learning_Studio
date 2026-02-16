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
  const [showTradeoffGuide, setShowTradeoffGuide] = useState(true);

  const setNClamped = (value: number) => {
    const clamped = Math.min(10000, Math.max(8, value));
    setN(clamped);
  };

  const handleNumberInput = (raw: string) => {
    const digitsOnly = raw.replace(/\D/g, '');
    if (!digitsOnly) {
      setN(8);
      return;
    }
    setNClamped(Number.parseInt(digitsOnly, 10));
  };

  const timeData = useMemo(() => {
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

  const spaceData = useMemo(() => {
    // Assumptions for visualization:
    // V (vertices) and DP states both scale roughly with n.
    const values = [
      { label: 'O(1)', value: 1 },
      { label: 'O(log n)', value: Math.log2(n) },
      { label: 'O(n)', value: n },
      { label: 'O(V)', value: n },
      { label: 'O(states)', value: n },
    ];
    const normalized = values.map((x) => (scale === 'linear' ? x.value : Math.log10(x.value + 1)));
    const max = Math.max(...normalized, 1);
    return values.map((x, i) => ({ ...x, pct: (normalized[i] / max) * 100 }));
  }, [n, scale]);

  const quadratic = timeData.find((d) => d.label === 'O(n^2)');
  const quadraticSci = quadratic ? quadratic.value.toExponential(2) : '0';
  const [mantissa, exponentRaw] = quadraticSci.split('e');
  const exponent = Number.parseInt(exponentRaw ?? '0', 10);
  const tradeoffs = [
    {
      approach: 'Duplicate check: brute force',
      time: 'O(n^2)',
      space: 'O(1)',
      note: 'No extra memory, but compares many pairs.',
    },
    {
      approach: 'Duplicate check: HashSet',
      time: 'O(n) avg',
      space: 'O(n)',
      note: 'Uses memory to make membership tests fast.',
    },
    {
      approach: 'Sort + scan duplicates',
      time: 'O(n log n)',
      space: 'O(1) to O(n)',
      note: 'Less hash memory, but sorting costs time.',
    },
    {
      approach: 'Fibonacci naive recursion',
      time: 'O(2^n)',
      space: 'O(n)',
      note: 'Tiny memory overhead, huge repeated work.',
    },
    {
      approach: 'Fibonacci with DP memoization',
      time: 'O(n)',
      space: 'O(n)',
      note: 'Stores states to remove repeated work.',
    },
    {
      approach: 'BFS shortest path (unweighted)',
      time: 'O(V + E)',
      space: 'O(V)',
      note: 'Usually shortest by edge count in unweighted graphs, but may visit more nodes than DFS.',
    },
    {
      approach: 'Binary search on sorted data',
      time: 'O(log n)',
      space: 'O(1)',
      note: 'Fast and memory-light when monotonic order exists.',
    },
  ];

  return (
    <div className="playground-root">
      <h4 className="playground-title">Growth Playground</h4>
      <div className="two-col">
        <label className="field">
          Input size n (typeable, numbers only)
          <input
            className="n-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={String(n)}
            onChange={(e) => handleNumberInput(e.target.value)}
          />
        </label>
        <label className="field">
          Slider (8 to 10,000)
          <input type="range" min={8} max={10000} step={1} value={n} onChange={(e) => setNClamped(Number.parseInt(e.target.value, 10))} />
        </label>
      </div>
      <div className="row gap-sm scale-controls">
        <button className={`btn ${scale === 'log' ? 'primary' : ''}`} type="button" onClick={() => setScale('log')}>
          Log Scale
        </button>
        <button className={`btn ${scale === 'linear' ? 'primary' : ''}`} type="button" onClick={() => setScale('linear')}>
          Linear Scale
        </button>
      </div>
      <div className="two-col">
        <div className="playground-graph">
          <h4>Time Complexity Graph</h4>
          <div className="bars-vertical">
            {timeData.map((d) => (
              <div key={`time-${d.label}`} className="bars-item">
                <div className="bars-col" style={{ height: `${d.pct}%` }} />
                <span className="bars-value">{formatValue(d.value)}</span>
                <span>{d.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="playground-graph">
          <h4>Space Complexity Graph</h4>
          <div className="bars-vertical">
            {spaceData.map((d) => (
              <div key={`space-${d.label}`} className="bars-item">
                <div className="bars-col" style={{ height: `${d.pct}%` }} />
                <span className="bars-value">{formatValue(d.value)}</span>
                <span>{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="muted">
        Shows growth trend only. Use <strong>Log Scale</strong> to compare all curves, <strong>Linear Scale</strong> to feel true magnitude gaps.
      </p>
      <div className="playground-section">
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
        <p>
          <strong>Space graph assumptions:</strong> for comparison, this chart treats <code>V</code> and <code>states</code> as scaling with <code>n</code>.
        </p>
        <p>
          <strong>Time vs space relationship:</strong> some solutions trade memory for speed (store/cache more to run faster), while others use less memory but do more repeated work.
        </p>
      </div>
      <div className="panel-head playground-help-head">
        <h4>Time vs Space Tradeoff Guide</h4>
        <button className="btn" type="button" onClick={() => setShowTradeoffGuide((prev) => !prev)}>
          {showTradeoffGuide ? 'Hide Tradeoff Guide' : 'Show Tradeoff Guide'}
        </button>
      </div>
      {showTradeoffGuide && (
        <div className="playground-section">
          <p>
            There is no fixed equation between time and space, but many algorithms move along a tradeoff: faster often needs more memory, and lower memory often needs more work.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Approach</th>
                  <th>Time</th>
                  <th>Space</th>
                  <th>Relationship</th>
                </tr>
              </thead>
              <tbody>
                {tradeoffs.map((row) => (
                  <tr key={row.approach}>
                    <td>{row.approach}</td>
                    <td>{row.time}</td>
                    <td>{row.space}</td>
                    <td>{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted">
            Practical rule: if constraints are tight on memory, accept slower time; if runtime is critical and memory is available, cache/index/precompute.
          </p>
        </div>
      )}
    </div>
  );
}
