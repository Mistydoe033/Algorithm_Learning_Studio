import type { PatternKey } from '../data/patterns';

export const USE_CASE_CORRECT: Record<PatternKey, string> = {
  hash_lookup: 'Fast duplicate checks and counting seen items.',
  two_pointers: 'Sorted arrays where two moving indices solve pair/interval problems.',
  sliding_window: 'Contiguous subarray/substring constraints with moving boundaries.',
  stack: 'Nested structure validation and monotonic processing.',
  bfs: 'Shortest path in unweighted graph or level-order traversal.',
  dfs: 'Deep traversal for components, cycles, and backtracking.',
  binary_search: 'Sorted/monotonic search space where half can be discarded each step.',
  dp: 'Overlapping subproblems where cached states avoid repeated work.',
};

export const TIME_CORRECT: Record<PatternKey, string> = {
  hash_lookup: 'O(n) average',
  two_pointers: 'O(n)',
  sliding_window: 'O(n)',
  stack: 'O(n)',
  bfs: 'O(V + E)',
  dfs: 'O(V + E)',
  binary_search: 'O(log n)',
  dp: 'O(states * transitions)',
};

export const SPACE_CORRECT: Record<PatternKey, string> = {
  hash_lookup: 'O(n)',
  two_pointers: 'O(1)',
  sliding_window: 'O(1) or O(k)',
  stack: 'O(n)',
  bfs: 'O(V)',
  dfs: 'O(V)',
  binary_search: 'O(1)',
  dp: 'O(states)',
};

export const TIME_COMPLEXITY_CARDS: Array<{ notation: string; name: string; plain: string; deeper: string }> = [
  {
    notation: 'O(1)',
    name: 'Constant time',
    plain: 'Runtime stays about the same as input grows.',
    deeper: 'Work does not scale with n (ignoring constant factors).',
  },
  {
    notation: 'O(log n)',
    name: 'Logarithmic time',
    plain: 'Each step cuts the problem size down a lot.',
    deeper: 'Often from halving search space, like binary search.',
  },
  {
    notation: 'O(n)',
    name: 'Linear time',
    plain: 'One full pass over the input.',
    deeper: 'Work grows proportionally with n.',
  },
  {
    notation: 'O(n log n)',
    name: 'Linearithmic time',
    plain: 'A bit more than linear, often sorting.',
    deeper: 'Typical of divide-and-conquer sorts like mergesort.',
  },
  {
    notation: 'O(n^2)',
    name: 'Quadratic time',
    plain: 'Nested loops over the input.',
    deeper: 'Work grows with pairwise combinations of n elements.',
  },
];

export const SPACE_COMPLEXITY_CARDS: Array<{ notation: string; name: string; plain: string; deeper: string }> = [
  {
    notation: 'O(1)',
    name: 'Constant extra space',
    plain: 'Uses only a few extra variables.',
    deeper: 'Auxiliary memory does not grow with input size.',
  },
  {
    notation: 'O(log n)',
    name: 'Logarithmic extra space',
    plain: 'Extra memory grows slowly with n.',
    deeper: 'Often recursion stack in balanced divide-and-conquer.',
  },
  {
    notation: 'O(n)',
    name: 'Linear extra space',
    plain: 'Stores roughly one extra value per input item.',
    deeper: 'Examples: visited arrays, hash sets, output buffers.',
  },
  {
    notation: 'O(V)',
    name: 'Graph-linear extra space',
    plain: 'Memory grows with number of vertices.',
    deeper: 'Typical for graph visited sets and traversal queues/stacks.',
  },
  {
    notation: 'O(states)',
    name: 'State-based extra space',
    plain: 'Memory grows with number of DP states.',
    deeper: 'Memo/DP table stores each subproblem state once.',
  },
];
