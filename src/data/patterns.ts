export type PatternKey =
  | 'hash_lookup'
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
    key: 'hash_lookup',
    name: 'HashMap / HashSet',
    whatItDoes: 'Fast lookup for duplicates and counting.',
    whenToUse: 'Seen-before checks, frequency counts, grouping.',
    timeComplexity: 'O(n) average, O(n^2) worst-case',
    spaceComplexity: 'O(n)',
    englishLine: 'Average O(n) because each lookup/insert is O(1) on average; O(n) space for stored keys.',
    invariant: "Set/map contains what we have seen so far.",
    pitfalls: ['Assuming hash maps preserve order', 'Forgetting worst-case mention', 'Unnecessary cloning'],
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
    pitfalls: ['Marking visited too late', 'Using array shift for queue', 'Missing bounds checks'],
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
