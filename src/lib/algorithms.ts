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

export function parseWords(text: string): string[] {
  if (!text.trim()) return [];
  return text
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
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

export function parseWeightedEdges(text: string): Array<[number, number, number]> {
  if (!text.trim()) return [];
  return text
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
    .map((part) => {
      const [a, b, w] = part.split('-').map((x) => Number.parseInt(x.trim(), 10));
      return [a, b, w] as [number, number, number];
    });
}

export function parseIntervals(text: string): Array<[number, number]> {
  return parseEdges(text)
    .filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b))
    .map(([a, b]) => (a <= b ? [a, b] : [b, a]));
}

export function parseRangeUpdates(text: string): Array<[number, number, number]> {
  return parseWeightedEdges(text)
    .filter(([l, r, d]) => Number.isFinite(l) && Number.isFinite(r) && Number.isFinite(d))
    .map(([l, r, d]) => (l <= r ? [l, r, d] : [r, l, d]));
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

function clampIndex(x: number, n: number): number {
  if (n <= 0) return 0;
  return Math.max(0, Math.min(n - 1, x));
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
  let head = 0;
  const visited = new Set<string>([startKey]);
  const dirs: Array<[number, number]> = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  while (head < queue.length) {
    const [r, c] = queue[head] as [number, number];
    head += 1;
    steps.push({
      step: steps.length,
      node: [r, c],
      action: 'dequeue',
      queueSize: queue.length - head,
      visited: [...visited],
      frontier: queue.slice(head).map((x) => keyCell(x[0], x[1])),
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
        queueSize: queue.length - head,
        visited: [...visited],
        frontier: queue.slice(head).map((x) => keyCell(x[0], x[1])),
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

export function simulatePrefixDifference(nums: number[], updates: Array<[number, number, number]>, queryL: number, queryR: number): SimulationResult {
  const steps: Step[] = [];
  const n = nums.length;
  if (n === 0) return { steps: [{ step: 0, action: 'empty input' }], result: 0 };

  const diff = new Array(n + 1).fill(0);
  updates.forEach(([rawL, rawR, delta], i) => {
    const l = clampIndex(rawL, n);
    const r = clampIndex(rawR, n);
    const left = Math.min(l, r);
    const right = Math.max(l, r);
    diff[left] += delta;
    if (right + 1 < diff.length) diff[right + 1] -= delta;
    steps.push({
      step: steps.length,
      action: 'apply diff update',
      updateIndex: i,
      update: [left, right, delta],
      diff: [...diff.slice(0, n)],
    });
  });

  const adjusted = new Array(n).fill(0);
  let runningDelta = 0;
  for (let i = 0; i < n; i += 1) {
    runningDelta += diff[i];
    adjusted[i] = nums[i] + runningDelta;
    steps.push({ step: steps.length, index: i, action: 'rebuild value from diff', runningDelta, adjusted: [...adjusted] });
  }

  const prefix = new Array(n).fill(0);
  for (let i = 0; i < n; i += 1) {
    prefix[i] = adjusted[i] + (i > 0 ? prefix[i - 1] : 0);
    steps.push({ step: steps.length, index: i, action: 'build prefix', prefix: [...prefix] });
  }

  const l = clampIndex(Math.min(queryL, queryR), n);
  const r = clampIndex(Math.max(queryL, queryR), n);
  const rangeSum = prefix[r] - (l > 0 ? prefix[l - 1] : 0);
  steps.push({ step: steps.length, action: 'answer range query', query: [l, r], rangeSum });

  return { steps, result: { adjusted, prefix, query: [l, r], rangeSum } };
}

export function simulateIntervalsMerge(intervals: Array<[number, number]>): SimulationResult {
  const steps: Step[] = [];
  if (intervals.length === 0) return { steps: [{ step: 0, action: 'empty intervals' }], result: [] };

  const sorted = [...intervals].sort((a, b) => (a[0] - b[0]) || (a[1] - b[1]));
  steps.push({ step: 0, action: 'sort intervals', sorted });

  const merged: Array<[number, number]> = [];
  for (let i = 0; i < sorted.length; i += 1) {
    const [s, e] = sorted[i] as [number, number];
    if (merged.length === 0 || merged[merged.length - 1]![1] < s) {
      merged.push([s, e]);
      steps.push({ step: steps.length, action: 'start new interval', current: [s, e], merged: [...merged] });
    } else {
      merged[merged.length - 1]![1] = Math.max(merged[merged.length - 1]![1], e);
      steps.push({ step: steps.length, action: 'merge overlap', current: [s, e], merged: [...merged] });
    }
  }

  return { steps, result: merged };
}

function heapPushMin(heap: number[], value: number) {
  heap.push(value);
  let i = heap.length - 1;
  while (i > 0) {
    const p = Math.floor((i - 1) / 2);
    if (heap[p]! <= heap[i]!) break;
    [heap[p], heap[i]] = [heap[i] as number, heap[p] as number];
    i = p;
  }
}

function heapPopMin(heap: number[]): number | null {
  if (heap.length === 0) return null;
  const root = heap[0] as number;
  const last = heap.pop() as number;
  if (heap.length > 0) {
    heap[0] = last;
    let i = 0;
    while (true) {
      const left = i * 2 + 1;
      const right = i * 2 + 2;
      let smallest = i;
      if (left < heap.length && heap[left]! < heap[smallest]!) smallest = left;
      if (right < heap.length && heap[right]! < heap[smallest]!) smallest = right;
      if (smallest === i) break;
      [heap[i], heap[smallest]] = [heap[smallest] as number, heap[i] as number];
      i = smallest;
    }
  }
  return root;
}

export function simulateHeapTopK(nums: number[], k: number): SimulationResult {
  const steps: Step[] = [];
  if (k <= 0) return { steps: [{ step: 0, action: 'invalid k: must be > 0' }], result: [] };
  const heap: number[] = [];

  nums.forEach((x, i) => {
    heapPushMin(heap, x);
    steps.push({ step: steps.length, index: i, value: x, action: 'push into min-heap', heap: [...heap] });
    if (heap.length > k) {
      const removed = heapPopMin(heap);
      steps.push({ step: steps.length, index: i, action: 'heap size > k -> pop smallest', removed, heap: [...heap] });
    }
  });

  const topKDescending = [...heap].sort((a, b) => b - a);
  steps.push({ step: steps.length, action: 'done', topKDescending });
  return { steps, result: topKDescending };
}

export function simulateMonotonicWindowMax(nums: number[], k: number): SimulationResult {
  const steps: Step[] = [];
  if (k <= 0) return { steps: [{ step: 0, action: 'invalid k: must be > 0' }], result: [] };
  if (nums.length === 0) return { steps: [{ step: 0, action: 'empty input' }], result: [] };

  const deque: number[] = [];
  const out: number[] = [];

  for (let i = 0; i < nums.length; i += 1) {
    while (deque.length > 0 && deque[0]! <= i - k) {
      const removed = deque.shift() as number;
      steps.push({ step: steps.length, index: i, action: 'evict out-of-window index', removedIndex: removed, deque: [...deque] });
    }

    while (deque.length > 0 && nums[deque[deque.length - 1] as number]! <= nums[i]!) {
      const removed = deque.pop() as number;
      steps.push({ step: steps.length, index: i, action: 'pop smaller tail index', removedIndex: removed, deque: [...deque] });
    }

    deque.push(i);
    steps.push({ step: steps.length, index: i, action: 'push current index', deque: [...deque], dequeValues: deque.map((x) => nums[x]) });

    if (i >= k - 1) {
      const maxValue = nums[deque[0] as number] as number;
      out.push(maxValue);
      steps.push({ step: steps.length, index: i, action: 'emit window max', windowEnd: i, maxValue, output: [...out] });
    }
  }

  return { steps, result: out };
}

export function simulateTopologicalSort(nodeCount: number, edges: Array<[number, number]>): SimulationResult {
  const steps: Step[] = [];
  if (nodeCount <= 0) return { steps: [{ step: 0, action: 'empty graph' }], result: [] };

  const adj: number[][] = Array.from({ length: nodeCount }, () => []);
  const inDeg = new Array(nodeCount).fill(0);

  edges.forEach(([u, v]) => {
    if (u >= 0 && u < nodeCount && v >= 0 && v < nodeCount) {
      adj[u].push(v);
      inDeg[v] += 1;
    }
  });

  const queue: number[] = [];
  for (let i = 0; i < nodeCount; i += 1) if (inDeg[i] === 0) queue.push(i);
  let head = 0;
  const order: number[] = [];

  steps.push({ step: steps.length, action: 'initialize indegree and queue', inDeg: [...inDeg], queue: [...queue] });

  while (head < queue.length) {
    const u = queue[head] as number;
    head += 1;
    order.push(u);
    steps.push({ step: steps.length, action: 'pop zero-indegree node', node: u, order: [...order], queue: queue.slice(head) });

    adj[u].forEach((v) => {
      inDeg[v] -= 1;
      steps.push({ step: steps.length, action: 'decrement indegree', from: u, to: v, inDeg: [...inDeg] });
      if (inDeg[v] === 0) {
        queue.push(v);
        steps.push({ step: steps.length, action: 'enqueue new zero-indegree node', node: v, queue: queue.slice(head) });
      }
    });
  }

  if (order.length !== nodeCount) {
    steps.push({ step: steps.length, action: 'cycle detected: topo order incomplete', order });
    return { steps, result: { order, hasCycle: true } };
  }

  return { steps, result: { order, hasCycle: false } };
}

export function simulateUnionFind(nodeCount: number, edges: Array<[number, number]>, queryA: number, queryB: number): SimulationResult {
  const steps: Step[] = [];
  if (nodeCount <= 0) return { steps: [{ step: 0, action: 'empty node set' }], result: false };

  const parent = Array.from({ length: nodeCount }, (_, i) => i);
  const rank = new Array(nodeCount).fill(0);

  const find = (x: number): number => {
    let cur = x;
    while (parent[cur] !== cur) {
      parent[cur] = parent[parent[cur] as number] as number;
      cur = parent[cur] as number;
    }
    return cur;
  };

  const union = (a: number, b: number) => {
    let ra = find(a);
    let rb = find(b);
    if (ra === rb) return false;
    if (rank[ra]! < rank[rb]!) [ra, rb] = [rb, ra];
    parent[rb] = ra;
    if (rank[ra] === rank[rb]) rank[ra] += 1;
    return true;
  };

  edges.forEach(([u, v], i) => {
    if (u < 0 || u >= nodeCount || v < 0 || v >= nodeCount) return;
    const merged = union(u, v);
    steps.push({ step: steps.length, edgeIndex: i, edge: [u, v], action: merged ? 'union components' : 'already connected', parent: [...parent], rank: [...rank] });
  });

  if (queryA < 0 || queryA >= nodeCount || queryB < 0 || queryB >= nodeCount) {
    steps.push({ step: steps.length, action: 'invalid query nodes', query: [queryA, queryB] });
    return { steps, result: false };
  }

  const connected = find(queryA) === find(queryB);
  steps.push({ step: steps.length, action: 'connectivity query', query: [queryA, queryB], connected, parent: [...parent] });
  return { steps, result: connected };
}

export function simulateBacktrackingSubsetSum(nums: number[], target: number): SimulationResult {
  const steps: Step[] = [];
  const path: number[] = [];
  let found: number[] | null = null;
  let abort = false;
  const STEP_CAP = 700;

  const dfs = (idx: number, sum: number) => {
    if (abort || found) return;
    steps.push({ step: steps.length, action: 'visit state', idx, sum, path: [...path] });
    if (steps.length >= STEP_CAP) {
      abort = true;
      steps.push({ step: steps.length, action: 'step cap reached -> stop search' });
      return;
    }

    if (sum === target) {
      found = [...path];
      steps.push({ step: steps.length, action: 'target reached', target, path: [...path] });
      return;
    }

    if (idx >= nums.length || sum > target) {
      steps.push({ step: steps.length, action: 'dead end', idx, sum });
      return;
    }

    path.push(nums[idx] as number);
    steps.push({ step: steps.length, action: 'choose value', value: nums[idx], idx, path: [...path] });
    dfs(idx + 1, sum + nums[idx]!);
    path.pop();

    if (found || abort) return;
    steps.push({ step: steps.length, action: 'skip value', value: nums[idx], idx, path: [...path] });
    dfs(idx + 1, sum);
  };

  dfs(0, 0);
  return { steps, result: found };
}

interface TrieNode {
  children: Map<string, TrieNode>;
  end: boolean;
}

function makeTrieNode(): TrieNode {
  return { children: new Map<string, TrieNode>(), end: false };
}

export function simulateTriePrefix(words: string[], prefix: string): SimulationResult {
  const steps: Step[] = [];
  const root = makeTrieNode();

  words.forEach((word, wi) => {
    let node = root;
    for (let i = 0; i < word.length; i += 1) {
      const ch = word[i] as string;
      if (!node.children.has(ch)) {
        node.children.set(ch, makeTrieNode());
        steps.push({ step: steps.length, action: 'create trie node', wordIndex: wi, word, char: ch, depth: i + 1 });
      }
      node = node.children.get(ch) as TrieNode;
    }
    node.end = true;
    steps.push({ step: steps.length, action: 'mark end of word', wordIndex: wi, word });
  });

  let node = root;
  for (let i = 0; i < prefix.length; i += 1) {
    const ch = prefix[i] as string;
    if (!node.children.has(ch)) {
      steps.push({ step: steps.length, action: 'prefix char missing', char: ch, depth: i + 1 });
      return { steps, result: false };
    }
    node = node.children.get(ch) as TrieNode;
    steps.push({ step: steps.length, action: 'prefix char matched', char: ch, depth: i + 1 });
  }

  steps.push({ step: steps.length, action: 'prefix exists', prefix });
  return { steps, result: true };
}

export function simulateGreedyIntervalScheduling(intervals: Array<[number, number]>): SimulationResult {
  const steps: Step[] = [];
  if (intervals.length === 0) return { steps: [{ step: 0, action: 'empty intervals' }], result: [] };

  const sorted = [...intervals].sort((a, b) => (a[1] - b[1]) || (a[0] - b[0]));
  steps.push({ step: steps.length, action: 'sort by end time', sorted });

  const selected: Array<[number, number]> = [];
  let lastEnd = Number.NEGATIVE_INFINITY;

  sorted.forEach(([s, e]) => {
    if (s >= lastEnd) {
      selected.push([s, e]);
      lastEnd = e;
      steps.push({ step: steps.length, action: 'select interval', current: [s, e], selected: [...selected] });
    } else {
      steps.push({ step: steps.length, action: 'skip overlapping interval', current: [s, e], lastEnd });
    }
  });

  return { steps, result: selected };
}

type MinPair = [number, number];

function heapPushPair(heap: MinPair[], pair: MinPair) {
  heap.push(pair);
  let i = heap.length - 1;
  while (i > 0) {
    const p = Math.floor((i - 1) / 2);
    if (heap[p]![0] <= heap[i]![0]) break;
    [heap[p], heap[i]] = [heap[i] as MinPair, heap[p] as MinPair];
    i = p;
  }
}

function heapPopPair(heap: MinPair[]): MinPair | null {
  if (heap.length === 0) return null;
  const root = heap[0] as MinPair;
  const last = heap.pop() as MinPair;
  if (heap.length > 0) {
    heap[0] = last;
    let i = 0;
    while (true) {
      const left = i * 2 + 1;
      const right = i * 2 + 2;
      let smallest = i;
      if (left < heap.length && heap[left]![0] < heap[smallest]![0]) smallest = left;
      if (right < heap.length && heap[right]![0] < heap[smallest]![0]) smallest = right;
      if (smallest === i) break;
      [heap[i], heap[smallest]] = [heap[smallest] as MinPair, heap[i] as MinPair];
      i = smallest;
    }
  }
  return root;
}

export function simulateDijkstra(nodeCount: number, edges: Array<[number, number, number]>, start: number): SimulationResult {
  const steps: Step[] = [];
  if (nodeCount <= 0) return { steps: [{ step: 0, action: 'empty graph' }], result: [] };
  if (start < 0 || start >= nodeCount) return { steps: [{ step: 0, action: 'invalid start node' }], result: [] };

  const adj: Array<Array<[number, number]>> = Array.from({ length: nodeCount }, () => []);
  edges.forEach(([u, v, w]) => {
    if (u >= 0 && u < nodeCount && v >= 0 && v < nodeCount && w >= 0) {
      adj[u].push([v, w]);
      adj[v].push([u, w]);
    }
  });

  const dist = new Array(nodeCount).fill(Number.POSITIVE_INFINITY);
  dist[start] = 0;
  const heap: MinPair[] = [[0, start]];

  while (heap.length > 0) {
    const top = heapPopPair(heap) as MinPair;
    const [d, u] = top;
    if (d !== dist[u]) {
      steps.push({ step: steps.length, action: 'skip stale heap entry', node: u, poppedDist: d, currentDist: dist[u] });
      continue;
    }

    steps.push({ step: steps.length, action: 'finalize node', node: u, dist: [...dist] });

    adj[u]!.forEach(([v, w]) => {
      const next = d + w;
      if (next < dist[v]!) {
        dist[v] = next;
        heapPushPair(heap, [next, v]);
        steps.push({ step: steps.length, action: 'relax edge', from: u, to: v, weight: w, newDist: next, dist: [...dist] });
      }
    });
  }

  const normalized = dist.map((x) => (Number.isFinite(x) ? x : null));
  return { steps, result: normalized };
}

// Fast runners for benchmark mode
export const benchmarkRunners: Record<PatternKey, (n: number) => void> = {
  hash_set: (n) => {
    const nums = [...Array(n).keys(), Math.floor(n / 2)];
    const seen = new Set<number>();
    for (const x of nums) {
      if (seen.has(x)) break;
      seen.add(x);
    }
  },
  hash_map: (n) => {
    const nums = [...Array(n).keys(), ...Array(n).keys()];
    const freq = new Map<number, number>();
    for (const x of nums) {
      freq.set(x, (freq.get(x) ?? 0) + 1);
    }
  },
  two_pointers: (n) => {
    const nums = [...Array(n).keys()];
    let left = 0;
    let right = nums.length - 1;
    const target = n - 1;
    while (left < right) {
      const sum = nums[left]! + nums[right]!;
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
      sum += nums[right] as number;
      while (sum > k && left <= right) {
        sum -= nums[left] as number;
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
    let head = 0;
    const seen = new Set<string>(['0,0']);
    const dirs: Array<[number, number]> = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    while (head < queue.length) {
      const [r, c] = queue[head] as [number, number];
      head += 1;
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
      adj[i]!.push(i + 1);
      adj[i + 1]!.push(i);
    }
    const seen = new Array(size).fill(false);
    const dfs = (u: number) => {
      seen[u] = true;
      adj[u]!.forEach((v) => {
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
      if ((nums[mid] as number) < target) lo = mid + 1;
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
  prefix_difference: (n) => {
    const size = Math.max(1, n);
    const nums = new Array(size).fill(1);
    const diff = new Array(size + 1).fill(0);
    for (let i = 0; i < Math.floor(size / 4); i += 1) {
      const l = i;
      const r = Math.min(size - 1, i + 3);
      diff[l] += 1;
      if (r + 1 < diff.length) diff[r + 1] -= 1;
    }
    let run = 0;
    for (let i = 0; i < size; i += 1) {
      run += diff[i] as number;
      nums[i] = (nums[i] as number) + run;
    }
    const prefix = new Array(size).fill(0);
    for (let i = 0; i < size; i += 1) prefix[i] = (nums[i] as number) + (i > 0 ? (prefix[i - 1] as number) : 0);
    void prefix;
  },
  intervals: (n) => {
    const intervals = Array.from({ length: n }, (_, i) => [i, i + (i % 3) + 1] as [number, number]);
    intervals.sort((a, b) => (a[0] - b[0]) || (a[1] - b[1]));
    const merged: Array<[number, number]> = [];
    intervals.forEach(([s, e]) => {
      if (merged.length === 0 || merged[merged.length - 1]![1] < s) merged.push([s, e]);
      else merged[merged.length - 1]![1] = Math.max(merged[merged.length - 1]![1], e);
    });
  },
  heap: (n) => {
    const k = Math.max(1, Math.floor(Math.sqrt(n)));
    const heap: number[] = [];
    for (let i = 0; i < n; i += 1) {
      heapPushMin(heap, i % (k * 3 + 1));
      if (heap.length > k) heapPopMin(heap);
    }
  },
  monotonic_queue: (n) => {
    const nums = Array.from({ length: n }, (_, i) => (i * 17) % 101);
    const k = Math.max(2, Math.floor(Math.sqrt(n)));
    const deque: number[] = [];
    for (let i = 0; i < nums.length; i += 1) {
      while (deque.length > 0 && deque[0]! <= i - k) deque.shift();
      while (deque.length > 0 && (nums[deque[deque.length - 1] as number] as number) <= (nums[i] as number)) deque.pop();
      deque.push(i);
    }
  },
  topological_sort: (n) => {
    const size = Math.max(2, n);
    const adj: number[][] = Array.from({ length: size }, () => []);
    const inDeg = new Array(size).fill(0);
    for (let i = 0; i < size - 1; i += 1) {
      adj[i]!.push(i + 1);
      inDeg[i + 1] += 1;
    }
    const queue: number[] = [];
    for (let i = 0; i < size; i += 1) if (inDeg[i] === 0) queue.push(i);
    let head = 0;
    while (head < queue.length) {
      const u = queue[head] as number;
      head += 1;
      adj[u]!.forEach((v) => {
        inDeg[v] -= 1;
        if (inDeg[v] === 0) queue.push(v);
      });
    }
  },
  union_find: (n) => {
    const size = Math.max(2, n);
    const parent = Array.from({ length: size }, (_, i) => i);
    const rank = new Array(size).fill(0);
    const find = (x: number): number => {
      let cur = x;
      while (parent[cur] !== cur) {
        parent[cur] = parent[parent[cur] as number] as number;
        cur = parent[cur] as number;
      }
      return cur;
    };
    const union = (a: number, b: number) => {
      let ra = find(a);
      let rb = find(b);
      if (ra === rb) return;
      if (rank[ra]! < rank[rb]!) [ra, rb] = [rb, ra];
      parent[rb] = ra;
      if (rank[ra] === rank[rb]) rank[ra] += 1;
    };
    for (let i = 0; i < size - 1; i += 1) union(i, i + 1);
    void parent;
  },
  backtracking: (n) => {
    const size = Math.min(20, Math.max(1, n));
    const nums = Array.from({ length: size }, (_, i) => (i % 5) + 1);
    const target = Math.floor(size / 2) + 3;
    let found = false;
    const dfs = (idx: number, sum: number) => {
      if (found) return;
      if (sum === target) {
        found = true;
        return;
      }
      if (idx >= nums.length || sum > target) return;
      dfs(idx + 1, sum + (nums[idx] as number));
      dfs(idx + 1, sum);
    };
    dfs(0, 0);
  },
  trie: (n) => {
    const size = Math.max(1, Math.min(5000, n));
    const root = makeTrieNode();
    for (let i = 0; i < size; i += 1) {
      const word = `w${i}x`;
      let node = root;
      for (let j = 0; j < word.length; j += 1) {
        const ch = word[j] as string;
        if (!node.children.has(ch)) node.children.set(ch, makeTrieNode());
        node = node.children.get(ch) as TrieNode;
      }
      node.end = true;
    }
  },
  greedy: (n) => {
    const intervals = Array.from({ length: n }, (_, i) => [i, i + (i % 4) + 1] as [number, number]);
    intervals.sort((a, b) => (a[1] - b[1]) || (a[0] - b[0]));
    let lastEnd = Number.NEGATIVE_INFINITY;
    const selected: Array<[number, number]> = [];
    intervals.forEach(([s, e]) => {
      if (s >= lastEnd) {
        selected.push([s, e]);
        lastEnd = e;
      }
    });
  },
  dijkstra: (n) => {
    const size = Math.max(2, n);
    const adj: Array<Array<[number, number]>> = Array.from({ length: size }, () => []);
    for (let i = 0; i < size - 1; i += 1) {
      const w = (i % 7) + 1;
      adj[i]!.push([i + 1, w]);
      adj[i + 1]!.push([i, w]);
    }
    const dist = new Array(size).fill(Number.POSITIVE_INFINITY);
    dist[0] = 0;
    const heap: MinPair[] = [[0, 0]];
    while (heap.length > 0) {
      const [d, u] = heapPopPair(heap) as MinPair;
      if (d !== dist[u]) continue;
      adj[u]!.forEach(([v, w]) => {
        const nd = d + w;
        if (nd < dist[v]!) {
          dist[v] = nd;
          heapPushPair(heap, [nd, v]);
        }
      });
    }
  },
};

export const defaultSizes: Record<PatternKey, number[]> = {
  hash_set: [10, 100, 500, 1000, 2000, 5000],
  hash_map: [10, 100, 500, 1000, 2000, 5000],
  two_pointers: [10, 100, 500, 1000, 2000, 5000, 10000],
  sliding_window: [10, 100, 500, 1000, 2000, 5000, 10000],
  stack: [10, 100, 500, 1000, 2000, 5000, 10000],
  bfs: [16, 64, 256, 1024, 4096],
  dfs: [10, 100, 500, 1000, 2000, 5000],
  binary_search: [10, 100, 500, 1000, 5000, 10000, 100000],
  dp: [5, 10, 20, 30, 50, 100, 200, 400, 800],
  prefix_difference: [16, 64, 256, 1024, 4096],
  intervals: [10, 100, 500, 1000, 2000, 5000],
  heap: [10, 100, 500, 1000, 2000, 5000],
  monotonic_queue: [10, 100, 500, 1000, 2000, 5000],
  topological_sort: [10, 100, 500, 1000, 2000, 5000],
  union_find: [10, 100, 500, 1000, 2000, 5000],
  backtracking: [5, 8, 10, 12, 14, 16, 18],
  trie: [10, 100, 500, 1000, 2000, 5000],
  greedy: [10, 100, 500, 1000, 2000, 5000],
  dijkstra: [10, 100, 500, 1000, 2000, 5000],
};
