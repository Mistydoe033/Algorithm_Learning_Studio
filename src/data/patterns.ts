export type PatternKey =
  | 'hash_set'
  | 'hash_map'
  | 'two_pointers'
  | 'sliding_window'
  | 'stack'
  | 'bfs'
  | 'dfs'
  | 'binary_search'
  | 'dp';

export interface PatternInfo {
  key: PatternKey;
  name: string;
  whatItDoes: string;
  whenToUse: string;
  timeComplexity: string;
  spaceComplexity: string;
  englishLine: string;
  invariant: string;
  pitfalls: string[];
  edgeCases: string[];
}

export const PATTERNS: PatternInfo[] = [
  {
    key: 'hash_set',
    name: 'HashSet',
    whatItDoes: 'Stores unique values for fast membership and duplicate checks.',
    whenToUse: 'Seen-before checks, deduplication, quick existence tests.',
    timeComplexity:
      'Single set op (insert/contains/remove): O(1) average, O(n) worst-case. Duplicate-check pass over n items: O(n) average.',
    spaceComplexity: 'O(u) where u = number of unique values (worst-case O(n))',
    englishLine: 'HashSet duplicate check is O(n) average for n items, with O(1) average membership checks per step.',
    invariant: 'Set contains unique values seen so far.',
    pitfalls: ['Assuming hash structures are naturally sorted', 'Forgetting worst-case hash behavior', 'Unnecessary cloning'],
    edgeCases: ['Empty input', 'All unique', 'All duplicates'],
  },
  {
    key: 'hash_map',
    name: 'HashMap',
    whatItDoes: 'Stores key-value pairs for counting, grouping, and keyed lookup.',
    whenToUse: 'Frequency counting, aggregations, grouping by key.',
    timeComplexity:
      'Single map op (get/set/update): O(1) average, O(n) worst-case. Frequency/grouping pass over n items: O(n) average.',
    spaceComplexity: 'O(k) where k = number of distinct keys (worst-case O(n))',
    englishLine: 'HashMap counting/grouping is O(n) average for n items, with O(1) average updates per key.',
    invariant: 'Map stores key->value entries (example: value->count).',
    pitfalls: [
      'Assuming hash structures are naturally sorted',
      'Forgetting worst-case hash behavior',
      'Unnecessary cloning',
    ],
    edgeCases: ['Empty input', 'All unique', 'All duplicates'],
  },
  {
    key: 'two_pointers',
    name: 'Two Pointers',
    whatItDoes: 'Moves two indices to reduce search quickly.',
    whenToUse: 'Sorted arrays, pair sums, in-place compaction.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    englishLine: 'O(n) time because each pointer moves across the array at most once.',
    invariant: 'Pointers only move inward and never move back.',
    pitfalls: ['Using unsorted input', 'Index underflow/overflow', 'Off-by-one boundaries'],
    edgeCases: ['Empty array', 'Single element', 'No valid pair'],
  },
  {
    key: 'sliding_window',
    name: 'Sliding Window',
    whatItDoes: 'Maintains and adjusts a valid contiguous window.',
    whenToUse: 'Subarray/substring constraints and best window length.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1) or O(k)',
    englishLine: 'O(n) time because left and right pointers each move forward at most n times.',
    invariant: 'After shrinking, the window satisfies the rule.',
    pitfalls: ['Using positive-only logic with negatives', 'Forgetting shrink loop', 'Wrong window length math'],
    edgeCases: ['k too small', 'All values too big', 'Single-element windows'],
  },
  {
    key: 'stack',
    name: 'Stack',
    whatItDoes: 'LIFO state for nested matching and monotonic constraints.',
    whenToUse: 'Parentheses validation, next greater element, undo.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    englishLine: 'O(n) time with O(n) stack space in the worst case.',
    invariant: 'Stack holds unmatched open symbols.',
    pitfalls: ['Not checking leftovers at end', 'Mismatched pop logic', 'Ignoring invalid symbols policy'],
    edgeCases: ['Empty string', 'Only opens', 'Only closes'],
  },
  {
    key: 'bfs',
    name: 'BFS',
    whatItDoes: 'Level-order traversal using a queue.',
    whenToUse: 'Shortest unweighted path, level processing.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    englishLine: 'O(V+E) because each node and edge is processed at most once.',
    invariant: 'Queue contains frontier for the next levels.',
    pitfalls: ['Marking visited too late', 'Using a non-constant-time dequeue operation', 'Missing bounds checks'],
    edgeCases: ['Empty graph/grid', 'Blocked start', 'Disconnected sections'],
  },
  {
    key: 'dfs',
    name: 'DFS',
    whatItDoes: 'Deep traversal before backtracking.',
    whenToUse: 'Components, cycle checks, recursive traversal.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    englishLine: 'O(V+E) time; O(V) space for visited and recursion/stack depth.',
    invariant: 'Visited nodes are not revisited.',
    pitfalls: ['Stack overflow on deep inputs', 'Marking visited too late', 'Bad base conditions'],
    edgeCases: ['Disconnected graph', 'Self loops', 'Invalid start'],
  },
  {
    key: 'binary_search',
    name: 'Binary Search',
    whatItDoes: 'Halves sorted search space each step.',
    whenToUse: 'Sorted arrays and monotonic conditions.',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    englishLine: 'O(log n) because each step discards about half the candidates.',
    invariant: 'Answer remains inside [lo, hi).',
    pitfalls: ['Wrong bounds update', 'Infinite loop', 'Off-by-one returns'],
    edgeCases: ['Empty array', 'All smaller/larger', 'Many duplicates'],
  },
  {
    key: 'dp',
    name: 'Dynamic Programming',
    whatItDoes: 'Caches subproblem results to avoid recomputation.',
    whenToUse: 'Overlapping subproblems and repeated states.',
    timeComplexity: 'O(states * transitions)',
    spaceComplexity: 'O(states)',
    englishLine: 'Each state is solved once, so runtime scales with state count and transitions.',
    invariant: 'Computed states are cached and reused.',
    pitfalls: ['Missing base cases', 'State definition errors', 'Overusing maps when array works'],
    edgeCases: ['Small base cases', 'Large state count', 'Overflow type limits'],
  },
];

export const patternByKey = Object.fromEntries(PATTERNS.map((p) => [p.key, p])) as Record<PatternKey, PatternInfo>;
