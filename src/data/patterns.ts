export type PatternKey =
  | 'hash_set'
  | 'hash_map'
  | 'two_pointers'
  | 'sliding_window'
  | 'stack'
  | 'bfs'
  | 'dfs'
  | 'binary_search'
  | 'dp'
  | 'prefix_difference'
  | 'intervals'
  | 'heap'
  | 'monotonic_queue'
  | 'topological_sort'
  | 'union_find'
  | 'backtracking'
  | 'trie'
  | 'greedy'
  | 'dijkstra';

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
    whatItDoes: 'Level-order traversal using a queue (breadth before depth).',
    whenToUse: 'Shortest path by edge count in unweighted graphs, level processing.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    englishLine: 'In unweighted graphs, BFS usually gives shortest path by edges, but can visit more nodes than DFS.',
    invariant: 'Queue contains frontier for the next levels.',
    pitfalls: [
      'Marking visited too late',
      'Using a non-constant-time dequeue operation',
      'Assuming BFS explores fewer nodes than DFS in every target-search case',
    ],
    edgeCases: ['Empty graph/grid', 'Blocked start', 'Disconnected sections'],
  },
  {
    key: 'dfs',
    name: 'DFS',
    whatItDoes: 'Deep traversal before backtracking.',
    whenToUse: 'Components, cycle checks, recursive traversal.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    englishLine: 'DFS is O(V+E) for traversal, but it does not guarantee shortest path in general.',
    invariant: 'Visited nodes are not revisited.',
    pitfalls: ['Stack overflow on deep inputs', 'Assuming first path found is shortest', 'Bad base conditions'],
    edgeCases: ['Disconnected graph', 'Self loops', 'Invalid start'],
  },
  {
    key: 'binary_search',
    name: 'Binary Search',
    whatItDoes: 'Halves sorted search space each step.',
    whenToUse: 'Only when data/predicate is sorted or monotonic.',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    englishLine: 'Binary search is O(log n), but only valid on sorted data or monotonic predicates.',
    invariant: 'Answer remains inside [lo, hi).',
    pitfalls: ['Running on unsorted/non-monotonic input', 'Wrong bounds update', 'Off-by-one returns'],
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
  {
    key: 'prefix_difference',
    name: 'Prefix Sum / Difference Array',
    whatItDoes: 'Uses cumulative sums and range-update deltas for fast interval queries/updates.',
    whenToUse: 'Range sum queries and repeated range increment updates.',
    timeComplexity: 'Build/query: O(n + q). With difference updates: O(n + u + q).',
    spaceComplexity: 'O(n)',
    englishLine: 'Prefix sums answer ranges in O(1) after O(n) build; difference arrays batch range updates efficiently.',
    invariant: 'Prefix[i] stores sum of values up to i, and diff reconstruction preserves each update effect.',
    pitfalls: ['Off-by-one in prefix boundaries', 'Forgetting diff[r+1] subtraction', 'Mixing 0-based and 1-based indexing'],
    edgeCases: ['Empty array', 'Single-element ranges', 'Update touching final index'],
  },
  {
    key: 'intervals',
    name: 'Intervals',
    whatItDoes: 'Sorts and merges overlapping intervals into disjoint coverage.',
    whenToUse: 'Overlap detection, calendar blocks, merge ranges, meeting consolidation.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    englishLine: 'Sort by start, then sweep once to merge: O(n log n) due to sorting.',
    invariant: 'Merged list stays sorted and non-overlapping.',
    pitfalls: ['Not sorting before merge', 'Incorrect overlap condition', 'Losing inclusive endpoints'],
    edgeCases: ['Already disjoint', 'Fully nested intervals', 'Touching boundaries'],
  },
  {
    key: 'heap',
    name: 'Heap / Priority Queue',
    whatItDoes: 'Maintains dynamic min/max priority for fast best-element extraction.',
    whenToUse: 'Top-k, streaming extremes, task scheduling, repeated min/max access.',
    timeComplexity: 'Typical push/pop: O(log n). Top-k with size k heap: O(n log k).',
    spaceComplexity: 'O(k) or O(n), depending on heap size policy.',
    englishLine: 'A heap gives O(log n) updates and O(1) peek, ideal for repeated priority operations.',
    invariant: 'Heap order property holds for every parent/child relation.',
    pitfalls: ['Using wrong heap polarity (min vs max)', 'Forgetting to cap heap size for top-k', 'Invalid comparator semantics'],
    edgeCases: ['k <= 0', 'k > n', 'Many equal priorities'],
  },
  {
    key: 'monotonic_queue',
    name: 'Monotonic Queue (Window Max/Min)',
    whatItDoes: 'Maintains a deque in monotonic order for O(1) window extrema queries.',
    whenToUse: 'Sliding window maximum/minimum in linear time.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(k)',
    englishLine: 'Each index enters and leaves deque at most once, giving O(n) total time.',
    invariant: 'Deque values are monotonic and front always matches current window optimum.',
    pitfalls: ['Not evicting out-of-window indices', 'Using values instead of indices', 'Wrong monotonic direction'],
    edgeCases: ['k = 1', 'k = n', 'All equal values'],
  },
  {
    key: 'topological_sort',
    name: 'Topological Sort (DAG)',
    whatItDoes: 'Orders directed acyclic graph nodes so all edges go forward.',
    whenToUse: 'Dependency scheduling, prerequisite ordering, build pipelines.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    englishLine: 'Kahn or DFS topo processes each node/edge once in O(V+E).',
    invariant: 'Only zero-indegree nodes are emitted at each step.',
    pitfalls: ['Treating graph as undirected', 'Ignoring cycle detection', 'Incorrect indegree updates'],
    edgeCases: ['Multiple valid orders', 'Disconnected DAG', 'Graph with cycle'],
  },
  {
    key: 'union_find',
    name: 'Union-Find (DSU)',
    whatItDoes: 'Tracks connected components with near-constant union/find operations.',
    whenToUse: 'Dynamic connectivity, cycle detection, Kruskal-style grouping.',
    timeComplexity: 'Amortized O((V + E) * alpha(V))',
    spaceComplexity: 'O(V)',
    englishLine: 'With path compression and union by rank, DSU operations are almost constant-time.',
    invariant: 'Each element points to a representative root for its component.',
    pitfalls: ['Skipping path compression', 'Union without rank/size heuristic', 'Using stale root values'],
    edgeCases: ['Self unions', 'Repeated edges', 'Disconnected components'],
  },
  {
    key: 'backtracking',
    name: 'Backtracking',
    whatItDoes: 'Explores decision trees recursively and undoes choices on return.',
    whenToUse: 'Combinatorial search, constraint solving, subset/permutation generation.',
    timeComplexity: 'Often exponential, e.g. O(branch^depth)',
    spaceComplexity: 'O(depth) recursion stack plus output.',
    englishLine: 'Backtracking systematically tries choices and prunes invalid branches.',
    invariant: 'Current path always represents a valid partial solution.',
    pitfalls: ['Forgetting to undo state', 'Weak pruning conditions', 'Mutating shared state incorrectly'],
    edgeCases: ['No valid solution', 'Multiple valid solutions', 'Large branching factor'],
  },
  {
    key: 'trie',
    name: 'Trie',
    whatItDoes: 'Stores strings by prefix tree for fast prefix lookups.',
    whenToUse: 'Autocomplete, dictionary prefix search, word matching.',
    timeComplexity: 'Insert/search prefix: O(L), where L = key length.',
    spaceComplexity: 'O(total characters stored)',
    englishLine: 'Trie operations scale with word length, not number of stored words.',
    invariant: 'Each path from root corresponds to a prefix of inserted words.',
    pitfalls: ['Forgetting end-of-word markers', 'Case/normalization inconsistencies', 'Overallocating sparse children'],
    edgeCases: ['Empty string', 'Prefix exists but not full word', 'Repeated insertions'],
  },
  {
    key: 'greedy',
    name: 'Greedy',
    whatItDoes: 'Makes locally optimal choices that lead to a global optimum when property holds.',
    whenToUse: 'Interval scheduling, minimal selections, canonical optimization rules.',
    timeComplexity: 'Typically O(n log n) when sorting is required.',
    spaceComplexity: 'O(1) to O(n), depending on selected output.',
    englishLine: 'Greedy is fast when an exchange argument proves local choices stay globally optimal.',
    invariant: 'Each accepted choice keeps solution feasible and as good as alternatives so far.',
    pitfalls: ['Using greedy without proof', 'Wrong sorting criterion', 'Missing feasibility checks'],
    edgeCases: ['Tie-heavy inputs', 'No feasible choices', 'Boundary-touching intervals'],
  },
  {
    key: 'dijkstra',
    name: 'Graph Shortest Paths (Dijkstra)',
    whatItDoes: 'Finds single-source shortest paths with non-negative edge weights.',
    whenToUse: 'Weighted routing/cost paths where all weights are >= 0.',
    timeComplexity: 'O((V + E) log V) with binary heap',
    spaceComplexity: 'O(V)',
    englishLine: 'Dijkstra repeatedly finalizes the currently cheapest frontier node.',
    invariant: 'When a node is popped with minimal tentative distance, that distance is final.',
    pitfalls: ['Using negative weights', 'Not skipping stale heap entries', 'Incorrect relax condition'],
    edgeCases: ['Unreachable nodes', 'Multiple equal shortest paths', 'Zero-weight edges'],
  },
];

export const patternByKey = Object.fromEntries(PATTERNS.map((p) => [p.key, p])) as Record<PatternKey, PatternInfo>;
