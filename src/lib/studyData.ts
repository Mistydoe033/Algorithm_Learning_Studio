import type { PatternKey } from '../data/patterns';

export const USE_CASE_CORRECT: Record<PatternKey, string> = {
  hash_set: 'Use HashSet for duplicate checks and fast membership tests.',
  hash_map: 'Use HashMap for counting/grouping by key (key-value lookups).',
  two_pointers: 'Sorted arrays where two moving indices solve pair/interval problems.',
  sliding_window: 'Contiguous subarray/substring constraints with moving boundaries.',
  stack: 'Nested structure validation and monotonic processing.',
  bfs: 'Shortest path in unweighted graph or level-order traversal.',
  dfs: 'Deep traversal for components, cycles, and backtracking.',
  binary_search: 'Sorted/monotonic search space where half can be discarded each step.',
  dp: 'Overlapping subproblems where cached states avoid repeated work.',
};

export const TIME_CORRECT: Record<PatternKey, string> = {
  hash_set: 'O(n) average',
  hash_map: 'O(n) average',
  two_pointers: 'O(n)',
  sliding_window: 'O(n)',
  stack: 'O(n)',
  bfs: 'O(V + E)',
  dfs: 'O(V + E)',
  binary_search: 'O(log n)',
  dp: 'O(states * transitions)',
};

export const SPACE_CORRECT: Record<PatternKey, string> = {
  hash_set: 'O(n)',
  hash_map: 'O(n)',
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
    plain: 'You process n items, and each one takes about log n work.',
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
    plain: 'The extra memory stays about the same as input grows.',
    deeper: 'Auxiliary memory does not grow with input size.',
  },
  {
    notation: 'O(log n)',
    name: 'Logarithmic extra space',
    plain: 'Extra memory grows slowly; doubling input adds only a little more.',
    deeper: 'Often recursion stack in balanced divide-and-conquer.',
  },
  {
    notation: 'O(n)',
    name: 'Linear extra space',
    plain: 'Extra memory grows in direct proportion to input size.',
    deeper: 'Examples: visited arrays, hash sets, output buffers.',
  },
  {
    notation: 'O(V)',
    name: 'Graph-linear extra space',
    plain: 'For graphs, extra memory grows with the number of vertices.',
    deeper: 'Typical for graph visited sets and traversal queues/stacks.',
  },
  {
    notation: 'O(states)',
    name: 'State-based extra space',
    plain: 'For DP, extra memory grows with how many states you store.',
    deeper: 'Memo/DP table stores each subproblem state once.',
  },
];

export const COMPLEXITY_TERMS: Array<{ term: string; meaning: string }> = [
  { term: 'DP', meaning: 'Dynamic Programming. Break a problem into smaller subproblems and store answers.' },
  { term: 'state', meaning: 'A unique subproblem configuration in DP (example: index, remaining sum).' },
  { term: 'transition', meaning: 'How you move from one state to next states (the recurrence choices).' },
  { term: 'O(states)', meaning: 'Memory grows with number of stored DP states.' },
  { term: 'O(states * transitions)', meaning: 'Time is number of states times work done per state.' },
  { term: 'V', meaning: 'Number of vertices (nodes) in a graph.' },
  { term: 'E', meaning: 'Number of edges (connections) in a graph.' },
  { term: 'O(V + E)', meaning: 'You process each node and edge about once.' },
  { term: 'auxiliary space', meaning: 'Extra memory used by algorithm, not counting the original input.' },
  { term: 'n', meaning: 'Input size (usually number of elements).' },
  { term: 'log n', meaning: 'How many times you can halve n until you reach 1.' },
];
