import { parseCells } from '../../lib/algorithms';
import { formatArrayViz, renderGrid } from './helpers';
import type { PatternVisualRenderInput } from './types';

export function renderPatternStepVisual(input: PatternVisualRenderInput): JSX.Element | null {
  const { patternKey, step, parsedNums, blockedInput, rows, cols, startR, startC } = input;

  if (patternKey === 'two_pointers') {
    const markers: Record<number, string> = {};
    if (typeof step.left === 'number') markers[step.left] = 'L';
    if (typeof step.right === 'number') markers[step.right] = 'R';
    return <pre className="code-block">{formatArrayViz(parsedNums, markers)}</pre>;
  }

  if (patternKey === 'sliding_window' || patternKey === 'monotonic_queue') {
    const markers: Record<number, string> = {};
    const left = Number(step.left ?? -1);
    const right = Number(step.right ?? -1);
    for (let i = left; i <= right; i += 1) if (i >= 0 && i < parsedNums.length) markers[i] = 'W';
    if (left >= 0 && left < parsedNums.length) markers[left] = 'L';
    if (right >= 0 && right < parsedNums.length) markers[right] = 'R';
    return <pre className="code-block">{formatArrayViz(parsedNums, markers)}</pre>;
  }

  if (patternKey === 'binary_search') {
    const markers: Record<number, string> = {};
    if (typeof step.lo === 'number' && step.lo < parsedNums.length) markers[step.lo] = 'L';
    if (typeof step.hi === 'number' && step.hi < parsedNums.length) markers[step.hi] = 'H';
    if (typeof step.mid === 'number' && step.mid < parsedNums.length) markers[step.mid] = 'M';
    return <pre className="code-block">{formatArrayViz(parsedNums, markers)}</pre>;
  }

  if (patternKey === 'stack') {
    const stack = String(step.stack ?? '');
    if (!stack) return <pre className="code-block">(empty stack)</pre>;
    return <pre className="code-block">{['top ->', ...stack.split('').reverse().map((c) => `  ${c}`)].join('\n')}</pre>;
  }

  if (patternKey === 'dfs') {
    const seen = Array.isArray(step.seen) ? (step.seen as number[]) : [];
    return <pre className="code-block">Visited: {seen.join(', ') || '(none yet)'}</pre>;
  }

  if (patternKey === 'bfs') {
    const blocked = parseCells(blockedInput);
    const visited = Array.isArray(step.visited) ? (step.visited as string[]) : [];
    const frontier = Array.isArray(step.frontier) ? (step.frontier as string[]) : [];
    const node = Array.isArray(step.node) ? (step.node as number[]) : null;
    const current = node ? ([node[0], node[1]] as [number, number]) : null;
    return (
      <>
        <pre className="code-block">{renderGrid(rows, cols, blocked, visited, frontier, [startR, startC], current)}</pre>
        <p className="muted">Legend: C=current, Q=queued, V=visited, S=start, #=blocked.</p>
      </>
    );
  }

  if (patternKey === 'hash_set') {
    const seen = Array.isArray(step.seen) ? step.seen.join(', ') : '(n/a)';
    return <p>Seen: {seen}</p>;
  }

  if (patternKey === 'hash_map') {
    const freq = typeof step.map === 'object' && step.map !== null ? JSON.stringify(step.map, null, 2) : '(n/a)';
    return <pre className="code-block">Frequency Map:{'\n'}{freq}</pre>;
  }

  if (patternKey === 'prefix_difference') {
    return <pre className="code-block">{JSON.stringify(step, null, 2)}</pre>;
  }

  if (patternKey === 'intervals' || patternKey === 'greedy') {
    const merged = Array.isArray(step.merged) ? step.merged : [];
    const selected = Array.isArray(step.selected) ? step.selected : [];
    return <pre className="code-block">merged={JSON.stringify(merged)} selected={JSON.stringify(selected)}</pre>;
  }

  if (patternKey === 'heap') {
    const heap = Array.isArray(step.heap) ? step.heap : [];
    return <pre className="code-block">Heap: {JSON.stringify(heap)}</pre>;
  }

  if (patternKey === 'topological_sort') {
    const order = Array.isArray(step.order) ? step.order : [];
    return <pre className="code-block">Order: {JSON.stringify(order)}</pre>;
  }

  if (patternKey === 'union_find') {
    const parent = Array.isArray(step.parent) ? step.parent : [];
    return <pre className="code-block">Parent: {JSON.stringify(parent)}</pre>;
  }

  if (patternKey === 'backtracking') {
    const path = Array.isArray(step.path) ? step.path : [];
    return <pre className="code-block">Path: {JSON.stringify(path)} | Sum: {String(step.sum ?? '')}</pre>;
  }

  if (patternKey === 'trie') {
    return <pre className="code-block">{JSON.stringify(step, null, 2)}</pre>;
  }

  if (patternKey === 'dijkstra') {
    const dist = Array.isArray(step.dist) ? step.dist : [];
    return <pre className="code-block">Dist: {JSON.stringify(dist)}</pre>;
  }

  return null;
}
