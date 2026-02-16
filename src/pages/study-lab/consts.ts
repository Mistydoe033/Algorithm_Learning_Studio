import type { PatternKey } from '../../data/patterns';
import type { Difficulty, PatternQuizProfile, QuizCategory, StudyProgress, TermHelpItem } from './types';

export const TIME_COMPLEXITY_CARD_OPTIONS = [
  'O(1): Constant time - Runtime stays about the same as input grows.',
  'O(log n): Logarithmic time - Each step cuts the problem size down a lot.',
  'O(n): Linear time - One full pass over the input.',
  'O(n log n): Linearithmic time - You process n items, and each one takes about log n work.',
  'O(n^2): Quadratic time - Nested loops over the input.',
] as const;

export const SPACE_COMPLEXITY_CARD_OPTIONS = [
  'O(1): Constant extra space - The extra memory stays about the same as input grows.',
  'O(log n): Logarithmic extra space - Extra memory grows slowly; doubling input adds only a little more.',
  'O(n): Linear extra space - Extra memory grows in direct proportion to input size.',
  'O(V): Graph-linear extra space - For graphs, extra memory grows with the number of vertices.',
  'O(states): State-based extra space - For DP, extra memory grows with how many states you store.',
] as const;

const TIME_CARD = {
  O1: TIME_COMPLEXITY_CARD_OPTIONS[0],
  OLOGN: TIME_COMPLEXITY_CARD_OPTIONS[1],
  ON: TIME_COMPLEXITY_CARD_OPTIONS[2],
  ONLOGN: TIME_COMPLEXITY_CARD_OPTIONS[3],
  ON2: TIME_COMPLEXITY_CARD_OPTIONS[4],
} as const;

const SPACE_CARD = {
  O1: SPACE_COMPLEXITY_CARD_OPTIONS[0],
  OLOGN: SPACE_COMPLEXITY_CARD_OPTIONS[1],
  ON: SPACE_COMPLEXITY_CARD_OPTIONS[2],
  OV: SPACE_COMPLEXITY_CARD_OPTIONS[3],
  OSTATES: SPACE_COMPLEXITY_CARD_OPTIONS[4],
} as const;

export const QUIZ_PROFILE: Record<PatternKey, PatternQuizProfile> = {
  hash_set: {
    scenario: 'Detect whether any value appears more than once in one pass.',
    mechanic: 'Track seen values in a uniqueness structure and stop on repeat.',
    timeComplexity: TIME_CARD.O1,
    spaceComplexity: SPACE_CARD.ON,
    invariant: 'All unique values seen so far are recorded.',
    pitfall: 'Assuming hash iteration is naturally sorted.',
    weakFit: 'You need sorted/range queries rather than membership checks.',
    edgeCase: 'Empty input should return no duplicate immediately.',
  },
  hash_map: {
    scenario: 'Count occurrences for every distinct value.',
    mechanic: 'Update key -> count for each element as you scan.',
    timeComplexity: TIME_CARD.O1,
    spaceComplexity: SPACE_CARD.ON,
    invariant: 'Stored count per key matches processed occurrences.',
    pitfall: 'Forgetting missing keys should start from zero.',
    weakFit: 'You only need yes/no membership with no payload per key.',
    edgeCase: 'All values identical should produce a single key with count n.',
  },
  two_pointers: {
    scenario: 'Find target pair efficiently in sorted array.',
    mechanic: 'Move left/right pointer based on sum comparison.',
    timeComplexity: TIME_CARD.ON,
    spaceComplexity: SPACE_CARD.O1,
    invariant: 'Candidate interval shrinks monotonically.',
    pitfall: 'Applying directly on unsorted data.',
    weakFit: 'Data is unsorted and cannot be sorted/preprocessed.',
    edgeCase: 'No pair exists and pointers cross.',
  },
  sliding_window: {
    scenario: 'Optimize over contiguous subarrays under a validity rule.',
    mechanic: 'Expand right and shrink left while restoring validity.',
    timeComplexity: TIME_CARD.ON,
    spaceComplexity: SPACE_CARD.O1,
    invariant: 'Window satisfies constraint after each shrink phase.',
    pitfall: 'Using positive-only shrinking logic with negatives.',
    weakFit: 'Problem needs non-contiguous selection rather than windows.',
    edgeCase: 'k too small so many windows collapse to length 0/1.',
  },
  stack: {
    scenario: 'Validate nested structure ordering.',
    mechanic: 'Push open state and pop on matching close.',
    timeComplexity: TIME_CARD.ON,
    spaceComplexity: SPACE_CARD.ON,
    invariant: 'Top of stack is latest unresolved opener/state.',
    pitfall: 'Not checking leftover stack items at end.',
    weakFit: 'Task requires random access updates, not LIFO order.',
    edgeCase: 'Input contains only closing symbols.',
  },
  bfs: {
    scenario: 'Shortest path by edge count in unweighted graph.',
    mechanic: 'Process frontier level-by-level with FIFO queue.',
    timeComplexity: TIME_CARD.ON,
    spaceComplexity: SPACE_CARD.OV,
    invariant: 'First visit gives minimum unweighted distance.',
    pitfall: 'Assuming BFS always visits fewer nodes than DFS for target checks.',
    weakFit: 'Edges have varying positive weights.',
    edgeCase: 'Start node/cell is blocked or missing.',
  },
  dfs: {
    scenario: 'Explore connected components deeply with backtracking.',
    mechanic: 'Recurse/stack deep before exploring siblings.',
    timeComplexity: TIME_CARD.ON,
    spaceComplexity: SPACE_CARD.OV,
    invariant: 'Visited nodes are never re-entered.',
    pitfall: 'Assuming the first path found is shortest.',
    weakFit: 'Need guaranteed shortest unweighted path.',
    edgeCase: 'Graph is disconnected from chosen start.',
  },
  binary_search: {
    scenario: 'Locate boundary/index in sorted or monotonic space.',
    mechanic: 'Check midpoint and discard half each step.',
    timeComplexity: TIME_CARD.OLOGN,
    spaceComplexity: SPACE_CARD.O1,
    invariant: 'Answer stays inside [lo, hi).',
    pitfall: 'Applying binary search on unsorted/non-monotonic input.',
    weakFit: 'No ordering/monotonic property exists.',
    edgeCase: 'Target absent but insertion index is required.',
  },
  dp: {
    scenario: 'Solve overlapping subproblems with cached states.',
    mechanic: 'Define state/transition and compute each state once.',
    timeComplexity: TIME_CARD.ON2,
    spaceComplexity: SPACE_CARD.OSTATES,
    invariant: 'Cached state values are reused, not recomputed.',
    pitfall: 'Wrong state definition or missing base case.',
    weakFit: 'Subproblems are independent with no overlap.',
    edgeCase: 'Very small base case (n=0 or n=1).',
  },
  prefix_difference: {
    scenario: 'Answer many range sums and range increment updates efficiently.',
    mechanic: 'Use prefix sums and diff boundaries to batch range updates.',
    timeComplexity: TIME_CARD.ON,
    spaceComplexity: SPACE_CARD.ON,
    invariant: 'Prefix and diff reconstruction remain index-consistent.',
    pitfall: 'Off-by-one at r+1 in difference array.',
    weakFit: 'You only need one query and no repeated ranges.',
    edgeCase: 'Update touches final index boundary.',
  },
  intervals: {
    scenario: 'Merge overlapping time/range blocks.',
    mechanic: 'Sort by start then sweep and merge overlaps.',
    timeComplexity: TIME_CARD.ONLOGN,
    spaceComplexity: SPACE_CARD.ON,
    invariant: 'Merged list remains sorted and non-overlapping.',
    pitfall: 'Skipping initial sort before merge sweep.',
    weakFit: 'Data has no interval semantics to merge.',
    edgeCase: 'Intervals touch at boundaries.',
  },
  heap: {
    scenario: 'Maintain dynamic top-k values in stream.',
    mechanic: 'Push each value and pop smallest when size exceeds k.',
    timeComplexity: TIME_CARD.ONLOGN,
    spaceComplexity: SPACE_CARD.ON,
    invariant: 'Heap root is current smallest among kept top-k candidates.',
    pitfall: 'Using wrong heap polarity (min vs max).',
    weakFit: 'Need full sorted order each step, not just best element(s).',
    edgeCase: 'k <= 0 or k > n.',
  },
  monotonic_queue: {
    scenario: 'Compute sliding window maximum/minimum in linear time.',
    mechanic: 'Maintain deque indices in monotonic value order.',
    timeComplexity: TIME_CARD.ON,
    spaceComplexity: SPACE_CARD.ON,
    invariant: 'Deque front is valid optimum index for current window.',
    pitfall: 'Not evicting indices that fall out of window.',
    weakFit: 'Query windows are random/non-sequential rather than sliding.',
    edgeCase: 'Window size k equals array length.',
  },
  topological_sort: {
    scenario: 'Produce dependency-respecting order in a directed acyclic graph (DAG).',
    mechanic: 'Kahn process: pop zero-indegree and reduce outgoing indegrees.',
    timeComplexity: TIME_CARD.ON,
    spaceComplexity: SPACE_CARD.OV,
    invariant: 'Only zero-indegree nodes are output next.',
    pitfall: 'Ignoring cycle when order length < node count.',
    weakFit: 'Graph is undirected or not dependency-oriented.',
    edgeCase: 'Multiple valid topological orders exist.',
  },
  union_find: {
    scenario: 'Answer repeated connectivity queries as edges are added.',
    mechanic: 'Union component roots and find representative roots quickly.',
    timeComplexity: TIME_CARD.ON,
    spaceComplexity: SPACE_CARD.OV,
    invariant: 'Each node maps to a stable component root.',
    pitfall: 'Skipping path compression/rank heuristics.',
    weakFit: 'Need explicit shortest paths, not connectivity only.',
    edgeCase: 'Redundant edges between already connected nodes.',
  },
  backtracking: {
    scenario: 'Search combinatorial solution space with constraints.',
    mechanic: 'Choose, recurse, and undo; prune invalid branches.',
    timeComplexity: TIME_CARD.ON2,
    spaceComplexity: SPACE_CARD.ON,
    invariant: 'Current path is valid partial solution before deeper recursion.',
    pitfall: 'Forgetting to undo state when backtracking.',
    weakFit: 'Problem has direct greedy or DP structure with no tree search need.',
    edgeCase: 'No valid solution exists.',
  },
  trie: {
    scenario: 'Fast prefix lookup over dictionary of words.',
    mechanic: 'Traverse/create nodes per character from root to depth L.',
    timeComplexity: TIME_CARD.ON,
    spaceComplexity: SPACE_CARD.ON,
    invariant: 'Each root-to-node path represents a stored prefix.',
    pitfall: 'Missing end-of-word marker for complete-word checks.',
    weakFit: 'Dataset is tiny and linear search is simpler/cheaper.',
    edgeCase: 'Prefix exists but complete word does not.',
  },
  greedy: {
    scenario: 'Maximize non-overlapping interval selections quickly.',
    mechanic: 'Sort by earliest finish and accept compatible interval greedily.',
    timeComplexity: TIME_CARD.ONLOGN,
    spaceComplexity: SPACE_CARD.O1,
    invariant: 'Chosen set remains feasible after every selection.',
    pitfall: 'Choosing wrong sort criterion without proof.',
    weakFit: 'Local optimum does not imply global optimum.',
    edgeCase: 'Many ties with same end time.',
  },
  dijkstra: {
    scenario: 'Find minimum distances from one source in weighted graph.',
    mechanic: 'Pop smallest tentative distance and relax outgoing edges.',
    timeComplexity: TIME_CARD.ONLOGN,
    spaceComplexity: SPACE_CARD.OV,
    invariant: 'Popped node with minimal tentative distance is finalized.',
    pitfall: 'Applying algorithm with negative edge weights.',
    weakFit: 'Graph contains negative-weight edges.',
    edgeCase: 'Unreachable nodes should remain infinite/unset distance.',
  },
};

export const COMMON_TERM_HELP: TermHelpItem[] = [
  { term: 'Invariant', plain: 'A rule that must stay true at every step of an algorithm.' },
  { term: 'Edge Case', plain: 'A boundary input like empty data, one item, or extreme values.' },
];

export const PATTERN_TERM_HELP: Partial<Record<PatternKey, TermHelpItem[]>> = {
  bfs: [
    { term: 'Unweighted Graph', plain: 'A graph where every edge has the same cost (or no weights).' },
    { term: 'Frontier', plain: 'The current boundary of nodes to process next.' },
  ],
  dfs: [
    { term: 'Backtracking', plain: 'Going deeper, then returning when a branch is finished.' },
  ],
  binary_search: [
    { term: 'Monotonic', plain: 'A condition that moves in one direction (for example false...false...true...true).' },
  ],
  prefix_difference: [
    { term: 'Prefix Sum', plain: 'Running total from start to current index.' },
    { term: 'Difference Array', plain: 'Store range updates at boundaries, then rebuild the final values once.' },
  ],
  monotonic_queue: [
    { term: 'Deque', plain: 'A double-ended queue where you can push/pop from both ends.' },
  ],
  topological_sort: [
    { term: 'DAG', plain: 'Directed acyclic graph: arrows have direction and there are no cycles.' },
    { term: 'Indegree', plain: 'How many incoming edges point into a node.' },
  ],
  union_find: [
    { term: 'DSU', plain: 'Disjoint Set Union: a structure that tracks connected groups efficiently.' },
    { term: 'alpha(V)', plain: 'A very slowly growing factor; in practice DSU operations are almost constant time.' },
  ],
  trie: [
    { term: 'Trie', plain: 'A tree of characters used for fast prefix lookup.' },
    { term: 'L', plain: 'The length of the word or prefix being searched.' },
  ],
  dijkstra: [
    { term: 'Relax Edge', plain: 'Try improving a node distance using a newly found cheaper route.' },
  ],
};

export const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard'];
export const QUIZ_CATEGORIES: QuizCategory[] = [
  'scenario',
  'mechanic',
  'time_complexity',
  'space_complexity',
  'invariant',
  'pitfall',
  'weak_fit',
  'edge_case',
];

export const LOCAL_STUDY_KEY = 'study_lab_local_progress_v2';
export const AUTH_TOKEN_KEY = 'study_lab_auth_token_v1';
export const AUTH_USER_KEY = 'study_lab_auth_user_v1';

export const DEFAULT_PROGRESS: StudyProgress = {
  weakStats: {},
  quizAttempts: 0,
  totalCorrect: 0,
  totalQuestions: 0,
  lastPattern: 'hash_set',
  lastDifficulty: 'medium',
};
