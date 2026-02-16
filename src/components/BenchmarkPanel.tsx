import { useMemo, useState } from 'react';

import type { PatternKey } from '../data/patterns';
import { runBenchmark } from '../lib/benchmark';

interface Props {
  pattern: PatternKey;
}

function SparkBars({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className="spark-row">
      {values.map((v, i) => (
        <div key={String(i)} className="spark-bar" style={{ height: `${(v / max) * 100}%`, background: color }} />
      ))}
    </div>
  );
}

export function BenchmarkPanel({ pattern }: Props) {
  const [repeats, setRepeats] = useState(3);
  const [nonce, setNonce] = useState(0);

  const rows = useMemo(() => runBenchmark(pattern, repeats), [pattern, repeats, nonce]);

  return (
    <section className="panel panel-spacious benchmark-panel">
      <div className="panel-head">
        <h3>Measured Complexity (Local)</h3>
        <div className="row gap-sm">
          <label className="label-inline" htmlFor="repeats">
            Repeats
          </label>
          <input
            id="repeats"
            type="number"
            min={1}
            max={10}
            value={repeats}
            onChange={(e) => setRepeats(Number.parseInt(e.target.value, 10) || 1)}
          />
          <button className="btn" type="button" onClick={() => setNonce((x) => x + 1)}>
            Re-run
          </button>
        </div>
      </div>

      <div className="two-col">
        <article className="card">
          <h4>Runtime Trend (ms)</h4>
          <SparkBars values={rows.map((r) => r.timeMs)} color="#39ff14" />
          <p className="muted">Bars are relative to max runtime in this run.</p>
        </article>
        <article className="card">
          <h4>Estimated Space Trend (units)</h4>
          <SparkBars values={rows.map((r) => r.estimatedSpaceUnits)} color="#b517ff" />
          <p className="muted">Space units are theoretical growth buckets (not exact memory bytes).</p>
        </article>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>n</th>
              <th>time_ms</th>
              <th>estimated_space_units</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={String(r.n)}>
                <td>{r.n}</td>
                <td>{r.timeMs}</td>
                <td>{r.estimatedSpaceUnits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
