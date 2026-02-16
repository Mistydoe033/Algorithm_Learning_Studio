import type { PatternKey } from '../data/patterns';
import { benchmarkRunners, defaultSizes } from './algorithms';

export interface BenchmarkRow {
  n: number;
  timeMs: number;
  estimatedSpaceUnits: number;
}

function estimateSpace(pattern: PatternKey, n: number): number {
  switch (pattern) {
    case 'hash_set':
    case 'hash_map':
      return n;
    case 'two_pointers':
      return 1;
    case 'sliding_window':
      return 1;
    case 'stack':
      return n;
    case 'bfs':
      return n;
    case 'dfs':
      return n;
    case 'binary_search':
      return 1;
    case 'dp':
      return n;
    default:
      return 1;
  }
}

export function runBenchmark(pattern: PatternKey, repeats = 3): BenchmarkRow[] {
  const rows: BenchmarkRow[] = [];
  const runner = benchmarkRunners[pattern];

  defaultSizes[pattern].forEach((n) => {
    const times: number[] = [];
    for (let i = 0; i < repeats; i += 1) {
      const t0 = performance.now();
      runner(n);
      const t1 = performance.now();
      times.push(t1 - t0);
    }
    times.sort((a, b) => a - b);
    const median = times[Math.floor(times.length / 2)] ?? 0;
    rows.push({ n, timeMs: Number(median.toFixed(4)), estimatedSpaceUnits: estimateSpace(pattern, n) });
  });

  return rows;
}
