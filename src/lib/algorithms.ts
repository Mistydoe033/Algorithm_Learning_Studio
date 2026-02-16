import type { PatternKey } from '../data/patterns';

export type Step = Record<string, unknown>;

export interface SimulationResult {
  steps: Step[];
  result: unknown;
}

export function parseIntList(text: string): number[] {
  if (!text.trim()) return [];
  return text
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => Number.parseInt(x, 10));
}

export function parseEdges(text: string): Array<[number, number]> {
  if (!text.trim()) return [];
  return text
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
    .map((part) => {
      const [a, b] = part.split('-').map((x) => Number.parseInt(x.trim(), 10));
      return [a, b] as [number, number];
    });
}

export function parseCells(text: string): Set<string> {
  const out = new Set<string>();
  if (!text.trim()) return out;
  text
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
    .forEach((part) => {
      const [r, c] = part.split('-').map((x) => Number.parseInt(x.trim(), 10));
      out.add(`${r},${c}`);
    });
  return out;
}

export function keyCell(r: number, c: number): string {
  return `${r},${c}`;
}

export function simulateHashDuplicate(nums: number[]): SimulationResult {
  const seen = new Set<number>();
  const steps: Step[] = [];

  for (let i = 0; i < nums.length; i += 1) {
    const value = nums[i];
    if (seen.has(value)) {
      steps.push({ step: steps.length, index: i, value, action: 'duplicate found -> stop', seen: [...seen].sort((a, b) => a - b) });
      return { steps, result: value };
    }
    seen.add(value);
    steps.push({ step: steps.length, index: i, value, action: 'insert into set', seen: [...seen].sort((a, b) => a - b) });
  }

  steps.push({ step: steps.length, action: 'finished: no duplicates', seen: [...seen].sort((a, b) => a - b) });
  return { steps, result: null };
}

export function simulateHashFrequency(nums: number[]): SimulationResult {
  const freq = new Map<number, number>();
  const steps: Step[] = [];

  for (let i = 0; i < nums.length; i += 1) {
    const value = nums[i];
    const nextCount = (freq.get(value) ?? 0) + 1;
    freq.set(value, nextCount);

    const obj = Object.fromEntries([...freq.entries()].sort((a, b) => a[0] - b[0]));
    steps.push({ step: steps.length, index: i, value, countAfter: nextCount, map: obj, action: 'update frequency' });
  }

  return { steps, result: Object.fromEntries(freq.entries()) };
}

export function simulateTwoPointers(nums: number[], target: number): SimulationResult {
  const steps: Step[] = [];
  let left = 0;
  let right = nums.length - 1;

  if (nums.length === 0) return { steps: [{ step: 0, action: 'empty input' }], result: false };

  while (left < right) {
    const sum = nums[left] + nums[right];
    let action = 'sum == target -> found';
    if (sum < target) action = 'sum < target -> move left right';
    if (sum > target) action = 'sum > target -> move right left';

    steps.push({
      step: steps.length,
      left,
      right,
      leftValue: nums[left],
      rightValue: nums[right],
      sum,
      target,
      action,
    });

    if (sum === target) return { steps, result: true };
    if (sum < target) left += 1;
    else right -= 1;
  }

  steps.push({ step: steps.length, action: 'pointers crossed -> not found' });
  return { steps, result: false };
}

export function simulateSlidingWindow(nums: number[], k: number): SimulationResult {
  const steps: Step[] = [];
  let left = 0;
  let sum = 0;
  let best = 0;

  for (let right = 0; right < nums.length; right += 1) {
    sum += nums[right];
    steps.push({ step: steps.length, phase: 'expand', left, right, sum, best, action: `add nums[${right}]` });

    while (sum > k && left <= right) {
      const removed = nums[left];
      sum -= removed;
      left += 1;
      steps.push({ step: steps.length, phase: 'shrink', left, right, sum, best, action: `remove ${removed}` });
    }

    if (left <= right) {
      best = Math.max(best, right - left + 1);
    }

    steps.push({ step: steps.length, phase: 'update', left, right, sum, best, action: 'update best window' });
  }

  return { steps, result: best };
}

export function simulateStackParens(text: string): SimulationResult {
  const steps: Step[] = [];
  const stack: string[] = [];
  const match: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  const opens = new Set(Object.values(match));

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];

    if (opens.has(ch)) {
      stack.push(ch);
      steps.push({ step: steps.length, index: i, char: ch, stack: stack.join(''), action: 'push open bracket' });
      continue;
    }

    if (ch in match) {
      const top = stack.pop();
      const ok = top === match[ch];
      steps.push({ step: steps.length, index: i, char: ch, stack: stack.join(''), action: ok ? 'pop and compare' : 'mismatch -> invalid' });
      if (!ok) return { steps, result: false };
      continue;
    }

    steps.push({ step: steps.length, index: i, char: ch, stack: stack.join(''), action: 'ignore non-bracket' });
  }

  const valid = stack.length === 0;
  steps.push({ step: steps.length, action: valid ? 'valid' : 'unfinished opens -> invalid', stack: stack.join('') });
  return { steps, result: valid };
}

export interface GridInput {
  rows: number;
  cols: number;
  blocked: Set<string>;
  start: [number, number];
}

export function simulateBfsGrid(input: GridInput): SimulationResult {
  const { rows, cols, blocked, start } = input;
  const steps: Step[] = [];
  const startKey = keyCell(start[0], start[1]);

  if (rows <= 0 || cols <= 0) return { steps: [{ step: 0, action: 'empty grid' }], result: 0 };
  if (blocked.has(startKey)) return { steps: [{ step: 0, action: 'start blocked' }], result: 0 };

  const queue: Array<[number, number]> = [start];
  const visited = new Set<string>([startKey]);
  const dirs: Array<[number, number]> = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  while (queue.length > 0) {
    const [r, c] = queue.shift() as [number, number];
    steps.push({
      step: steps.length,
      node: [r, c],
      action: 'dequeue',
      queueSize: queue.length,
      visited: [...visited],
      frontier: queue.map((x) => keyCell(x[0], x[1])),
    });

    dirs.forEach(([dr, dc]) => {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return;

      const cell = keyCell(nr, nc);
      if (blocked.has(cell) || visited.has(cell)) return;

      visited.add(cell);
      queue.push([nr, nc]);
      steps.push({
        step: steps.length,
        node: [nr, nc],
        action: 'enqueue neighbor',
        queueSize: queue.length,
        visited: [...visited],
        frontier: queue.map((x) => keyCell(x[0], x[1])),
      });
    });
  }

  return { steps, result: visited.size };
}

export interface GraphInput {
  nodeCount: number;
  edges: Array<[number, number]>;
  start: number;
}

export function simulateDfsGraph(input: GraphInput): SimulationResult {
  const { nodeCount, edges, start } = input;
  const adj: number[][] = Array.from({ length: nodeCount }, () => []);
  edges.forEach(([u, v]) => {
    if (u >= 0 && u < nodeCount && v >= 0 && v < nodeCount) {
      adj[u].push(v);
      adj[v].push(u);
    }
  });
  adj.forEach((row) => row.sort((a, b) => a - b));

  const seen = new Set<number>();
  const steps: Step[] = [];

  const dfs = (u: number, depth: number) => {
    seen.add(u);
    steps.push({ step: steps.length, node: u, depth, action: 'enter node', seen: [...seen].sort((a, b) => a - b) });
    adj[u].forEach((v) => {
      if (!seen.has(v)) {
        steps.push({ step: steps.length, node: u, depth, action: `go to neighbor ${v}`, seen: [...seen].sort((a, b) => a - b) });
        dfs(v, depth + 1);
      }
    });
    steps.push({ step: steps.length, node: u, depth, action: 'backtrack', seen: [...seen].sort((a, b) => a - b) });
  };

  if (start < 0 || start >= nodeCount) return { steps: [{ step: 0, action: 'invalid start node' }], result: 0 };
  dfs(start, 0);
  return { steps, result: seen.size };
}

export function simulateBinarySearch(nums: number[], target: number): SimulationResult {
  let lo = 0;
  let hi = nums.length;
  const steps: Step[] = [];

  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const value = nums[mid];

    if (value < target) {
      lo = mid + 1;
      steps.push({ step: steps.length, lo, hi, mid, midValue: value, target, action: 'value < target -> move lo right' });
    } else {
      hi = mid;
      steps.push({ step: steps.length, lo, hi, mid, midValue: value, target, action: 'value >= target -> move hi left' });
    }
  }

  steps.push({ step: steps.length, action: 'done', lowerBound: lo, target });
  return { steps, result: lo };
}

export function simulateFibMemo(n: number): SimulationResult {
  const memo = new Map<number, number>();
  const steps: Step[] = [];

  if (n < 0) return { steps: [{ step: 0, action: 'invalid n: must be >= 0' }], result: -1 };

  const fib = (x: number): number => {
    steps.push({ step: steps.length, n: x, action: 'call', memoSize: memo.size });
    if (x <= 1) {
      steps.push({ step: steps.length, n: x, action: 'base case', memoSize: memo.size });
      return x;
    }

    if (memo.has(x)) {
      steps.push({ step: steps.length, n: x, action: 'memo hit', memoSize: memo.size });
      return memo.get(x) as number;
    }

    const value = fib(x - 1) + fib(x - 2);
    memo.set(x, value);
    steps.push({ step: steps.length, n: x, action: `store memo[${x}]`, memoSize: memo.size, value });
    return value;
  };

  const result = fib(n);
  steps.push({ step: steps.length, n, action: 'done', result, memoSize: memo.size });
  return { steps, result };
}

// Fast runners for benchmark mode
export const benchmarkRunners: Record<PatternKey, (n: number) => void> = {
  hash_lookup: (n) => {
    const nums = [...Array(n).keys(), Math.floor(n / 2)];
    const seen = new Set<number>();
    for (const x of nums) {
      if (seen.has(x)) break;
      seen.add(x);
    }
  },
  two_pointers: (n) => {
    const nums = [...Array(n).keys()];
    let left = 0;
    let right = nums.length - 1;
    const target = n - 1;
    while (left < right) {
      const sum = nums[left] + nums[right];
      if (sum === target) break;
      if (sum < target) left += 1;
      else right -= 1;
    }
  },
  sliding_window: (n) => {
    const nums = Array.from({ length: n }, () => 1);
    const k = Math.max(1, Math.floor(n / 3));
    let left = 0;
    let sum = 0;
    for (let right = 0; right < nums.length; right += 1) {
      sum += nums[right];
      while (sum > k && left <= right) {
        sum -= nums[left];
        left += 1;
      }
    }
  },
  stack: (n) => {
    const text = '('.repeat(Math.floor(n / 2)) + ')'.repeat(Math.floor(n / 2));
    const st: string[] = [];
    for (const ch of text) {
      if (ch === '(') st.push(ch);
      else st.pop();
    }
  },
  bfs: (n) => {
    const side = Math.max(1, Math.floor(Math.sqrt(n)));
    const rows = side;
    const cols = side;
    const queue: Array<[number, number]> = [[0, 0]];
    const seen = new Set<string>(['0,0']);
    const dirs: Array<[number, number]> = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    while (queue.length > 0) {
      const [r, c] = queue.shift() as [number, number];
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        const key = `${nr},${nc}`;
        if (seen.has(key)) continue;
        seen.add(key);
        queue.push([nr, nc]);
      }
    }
  },
  dfs: (n) => {
    const size = Math.max(1, n);
    const adj: number[][] = Array.from({ length: size }, () => []);
    for (let i = 0; i < size - 1; i += 1) {
      adj[i].push(i + 1);
      adj[i + 1].push(i);
    }
    const seen = new Array(size).fill(false);
    const dfs = (u: number) => {
      seen[u] = true;
      adj[u].forEach((v) => {
        if (!seen[v]) dfs(v);
      });
    };
    dfs(0);
  },
  binary_search: (n) => {
    const nums = [...Array(n).keys()];
    let lo = 0;
    let hi = nums.length;
    const target = Math.floor(n / 2);
    while (lo < hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      if (nums[mid] < target) lo = mid + 1;
      else hi = mid;
    }
  },
  dp: (n) => {
    const capped = Math.min(1200, Math.max(1, n));
    const memo = new Map<number, number>([
      [0, 0],
      [1, 1],
    ]);
    const fib = (x: number): number => {
      if (memo.has(x)) return memo.get(x) as number;
      const value = fib(x - 1) + fib(x - 2);
      memo.set(x, value);
      return value;
    };
    fib(capped);
  },
};

export const defaultSizes: Record<PatternKey, number[]> = {
  hash_lookup: [10, 100, 500, 1000, 2000, 5000],
  two_pointers: [10, 100, 500, 1000, 2000, 5000, 10000],
  sliding_window: [10, 100, 500, 1000, 2000, 5000, 10000],
  stack: [10, 100, 500, 1000, 2000, 5000, 10000],
  bfs: [16, 64, 256, 1024, 4096],
  dfs: [10, 100, 500, 1000, 2000, 5000],
  binary_search: [10, 100, 500, 1000, 5000, 10000, 100000],
  dp: [5, 10, 20, 30, 50, 100, 200, 400, 800],
};
