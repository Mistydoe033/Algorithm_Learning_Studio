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
      return { what: 'Dequeued current node.', why: 'Layer order supports shortest-path-by-edges in unweighted graphs.' };
    case 'dfs':
      if (action.includes('backtrack')) return { what: 'Backtracked to previous node.', why: 'All neighbors were explored.' };
      if (action.includes('neighbor')) return { what: 'Recursing into unvisited neighbor.', why: 'DFS goes deep before siblings and does not ensure shortest path.' };
      return { what: 'Entered a node.', why: 'Mark visited so we do not revisit it.' };
    case 'binary_search':
      if (action === 'done') return { what: 'Search converged to lower bound.', why: 'lo and hi met at first valid index.' };
      return { what: 'Checked middle value.', why: 'One comparison discards half the range.' };
    case 'dp':
      if (action.includes('memo hit')) return { what: 'Used cached answer.', why: 'Memo avoids repeated work.' };
      if (action.includes('base case')) return { what: 'Reached base case.', why: 'Stops recursion and anchors recurrence.' };
      if (action.includes('store')) return { what: 'Stored computed state.', why: 'Future calls reuse this value.' };
      return { what: 'Called subproblem.', why: 'Break bigger problem into smaller states.' };
    case 'prefix_difference':
      if (action.includes('diff update')) return { what: 'Applied a range update marker.', why: 'Difference array batches range changes cheaply.' };
      if (action.includes('prefix')) return { what: 'Built cumulative sum.', why: 'Prefix lets range query be answered in O(1).' };
      return { what: 'Reconstructed updated value.', why: 'Running diff recovers the actual array.' };
    case 'intervals':
      if (action.includes('merge')) return { what: 'Merged overlapping ranges.', why: 'Overlap means both intervals belong to one span.' };
      if (action.includes('start new')) return { what: 'Started a new merged block.', why: 'No overlap with previous interval.' };
      return { what: 'Processed interval order.', why: 'Sorting is required before a linear merge sweep.' };
    case 'heap':
      if (action.includes('pop')) return { what: 'Removed smallest heap value.', why: 'Keeping heap at size k preserves top-k candidates.' };
      return { what: 'Inserted value into heap.', why: 'Heap maintains priority order incrementally.' };
    case 'monotonic_queue':
      if (action.includes('evict')) return { what: 'Evicted stale index.', why: 'Index fell out of current window.' };
      if (action.includes('smaller tail')) return { what: 'Dropped dominated tail value.', why: 'It can never become future maximum.' };
      if (action.includes('emit')) return { what: 'Recorded window optimum.', why: 'Deque front stores best candidate.' };
      return { what: 'Updated deque state.', why: 'Monotonic order keeps optimal candidate in front.' };
    case 'topological_sort':
      if (action.includes('cycle')) return { what: 'Detected unresolved cycle.', why: 'No zero-indegree node remains for some vertices.' };
      if (action.includes('zero-indegree')) return { what: 'Selected next dependency-safe node.', why: 'All prerequisites are already processed.' };
      return { what: 'Updated indegree counts.', why: 'Removing outgoing edges unlocks downstream nodes.' };
    case 'union_find':
      if (action.includes('query')) return { what: 'Checked component connectivity.', why: 'Nodes are connected if they share a root.' };
      if (action.includes('union')) return { what: 'Merged two components.', why: 'Union links component roots together.' };
      return { what: 'Skipped redundant merge.', why: 'Both nodes were already in one component.' };
    case 'backtracking':
      if (action.includes('target reached')) return { what: 'Found a valid solution path.', why: 'Path sum satisfied target.' };
      if (action.includes('dead end')) return { what: 'Pruned a branch.', why: 'Branch cannot produce a valid solution.' };
      if (action.includes('choose')) return { what: 'Tried including a choice.', why: 'Backtracking explores decision branches.' };
      if (action.includes('skip')) return { what: 'Tried excluding a choice.', why: 'Alternative branch must also be explored.' };
      return { what: 'Visited search state.', why: 'State captures current depth and partial result.' };
    case 'trie':
      if (action.includes('create trie node')) return { what: 'Created a new prefix node.', why: 'This character path did not exist yet.' };
      if (action.includes('prefix char matched')) return { what: 'Matched next prefix character.', why: 'Traversal continues down trie edges.' };
      if (action.includes('prefix exists')) return { what: 'Confirmed prefix availability.', why: 'All query characters were found in order.' };
      return { what: 'Marked word ending.', why: 'End marker distinguishes full word from prefix only.' };
    case 'greedy':
      if (action.includes('select')) return { what: 'Selected a locally optimal interval.', why: 'Earliest finishing compatible choice preserves future options.' };
      if (action.includes('skip')) return { what: 'Skipped conflicting interval.', why: 'Choosing it would break feasibility.' };
      return { what: 'Prepared greedy order.', why: 'Sorting by criterion is required for correctness.' };
    case 'dijkstra':
      if (action.includes('relax')) return { what: 'Improved tentative shortest distance.', why: 'Found cheaper path through current node.' };
      if (action.includes('stale')) return { what: 'Ignored outdated heap entry.', why: 'A better distance was already finalized.' };
      return { what: 'Finalized nearest frontier node.', why: 'Its shortest distance is now fixed.' };
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
