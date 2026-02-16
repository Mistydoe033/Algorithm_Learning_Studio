import type { PatternKey } from '../data/patterns';
import type { Step } from './algorithms';

export function changedFields(prev: Step | null, current: Step): string[] {
  if (!prev) return [];
  const out: string[] = [];
  Object.entries(current).forEach(([key, value]) => {
    if (key === 'step') return;
    if (prev[key] !== value) out.push(`${key}: ${String(prev[key])} -> ${String(value)}`);
  });
  return out;
}

export function explainSimple(key: PatternKey, step: Step): { what: string; why: string } {
  const action = String(step.action ?? '');
  switch (key) {
    case 'hash_set':
      if (action.includes('duplicate')) return { what: 'Found a repeated value.', why: 'Repeat means duplicate exists, so we can stop.' };
      return { what: 'Saved this value in the set.', why: 'So we can check future repeats quickly.' };
    case 'hash_map':
      return { what: 'Updated this value count in the map.', why: 'Map stores each key with its running frequency.' };
    case 'two_pointers':
      return { what: 'Compared left and right values.', why: 'Sorted order tells which pointer to move.' };
    case 'sliding_window':
      if (String(step.phase) === 'shrink') return { what: 'Shrank window from left.', why: 'Sum exceeded limit, so remove old values.' };
      if (String(step.phase) === 'expand') return { what: 'Expanded window to include new value.', why: 'Larger valid windows may improve answer.' };
      return { what: 'Updated best window length.', why: 'Current valid window is a candidate answer.' };
    case 'stack':
      if (action.includes('mismatch')) return { what: 'Bracket mismatch happened.', why: 'Closer must match latest opener.' };
      if (action.includes('push')) return { what: 'Pushed opener on stack.', why: 'We match it later with a closer.' };
      if (action.includes('pop')) return { what: 'Popped and matched closer.', why: 'Stack enforces correct nesting.' };
      return { what: 'Finished validation step.', why: 'Empty stack at end means valid.' };
    case 'bfs':
      if (action.includes('enqueue')) return { what: 'Queued a new neighbor.', why: 'BFS explores by layers with FIFO queue.' };
      return { what: 'Dequeued current node.', why: 'Next frontier node is processed now.' };
    case 'dfs':
      if (action.includes('backtrack')) return { what: 'Backtracked to previous node.', why: 'All neighbors were explored.' };
      if (action.includes('neighbor')) return { what: 'Recursing into unvisited neighbor.', why: 'DFS goes deep before siblings.' };
      return { what: 'Entered a node.', why: 'Mark visited so we do not revisit it.' };
    case 'binary_search':
      if (action === 'done') return { what: 'Search converged to lower bound.', why: 'lo and hi met at first valid index.' };
      return { what: 'Checked middle value.', why: 'One comparison discards half the range.' };
    case 'dp':
      if (action.includes('memo hit')) return { what: 'Used cached answer.', why: 'Memo avoids repeated work.' };
      if (action.includes('base case')) return { what: 'Reached base case.', why: 'Stops recursion and anchors recurrence.' };
      if (action.includes('store')) return { what: 'Stored computed state.', why: 'Future calls reuse this value.' };
      return { what: 'Called subproblem.', why: 'Break bigger problem into smaller states.' };
    default:
      return { what: 'Processed one step.', why: 'Algorithm state moves toward answer.' };
  }
}

export function explainDeep(key: PatternKey, step: Step): { what: string; why: string } {
  const simple = explainSimple(key, step);
  const action = String(step.action ?? '');
  if (key === 'two_pointers') {
    return {
      what: `${simple.what} sum=${String(step.sum)} target=${String(step.target)} (${action}).`,
      why: 'Pointer movement is monotonic, giving linear total moves.',
    };
  }
  if (key === 'binary_search') {
    return {
      what: `${simple.what} lo=${String(step.lo)} hi=${String(step.hi)} mid=${String(step.mid)}.`,
      why: 'Invariant keeps answer inside half-open interval [lo, hi).',
    };
  }
  return {
    what: `${simple.what} action=${action}.`,
    why: simple.why,
  };
}
