export type AlgorithmFamily = 'arrays' | 'graphs' | 'strings' | 'optimization' | 'data-structures' | 'sorting';

export interface AlgorithmQuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correct: string;
  explanation: string;
}

export interface AlgorithmTestCase {
  label: string;
  input: unknown[];
  expected: unknown;
}

export interface AlgorithmChallenge {
  id: string;
  name: string;
  family: AlgorithmFamily;
  level: 'easy' | 'medium' | 'hard';
  summary: string;
  prompt: string;
  time: string;
  space: string;
  tags: string[];
  questions: AlgorithmQuizQuestion[];
  functionName: string;
  starterCode: string;
  solutionCode: string;
  tests: AlgorithmTestCase[];
  hints: string[];
}

const q = (
  id: string,
  prompt: string,
  options: string[],
  correct: string,
  explanation: string,
): AlgorithmQuizQuestion => ({ id, prompt, options, correct, explanation });

const RAW_ALGORITHM_CHALLENGES: AlgorithmChallenge[] = [
  {
    id: 'hash_set', name: 'Hash Set', family: 'data-structures', level: 'easy',
    summary: 'Detect duplicates with constant-average-time membership checks.',
    prompt: 'Return true when an integer array contains a repeated value.', time: 'O(n) average', space: 'O(n)', tags: ['lookup', 'duplicates'],
    questions: [
      q('purpose', 'Why is a Set the right structure here?', ['It stores unique values and supports fast membership checks.', 'It keeps values sorted automatically.', 'It always uses O(1) worst-case memory.', 'It can only store strings.'], 'It stores unique values and supports fast membership checks.', 'The set remembers values already seen, so a repeat can be detected during one pass.'),
      q('invariant', 'What should be true before processing each new value?', ['The set contains every unique value seen so far.', 'The set contains only duplicate values.', 'The set contains values in input order.', 'The set contains the final answer.'], 'The set contains every unique value seen so far.', 'That invariant makes has(value) a complete test for whether the current item is a repeat.'),
      q('edge', 'What should an empty array return?', ['false', 'true', 'null', 'Throw an error'], 'false', 'An empty input has no pair of equal values.'),
    ],
    functionName: 'containsDuplicate', starterCode: 'function containsDuplicate(nums) {\n  // Return true if any value appears more than once.\n}',
    solutionCode: 'function containsDuplicate(nums) {\n  const seen = new Set();\n  for (const value of nums) {\n    if (seen.has(value)) return true;\n    seen.add(value);\n  }\n  return false;\n}',
    tests: [{ label: 'has duplicate', input: [[1, 2, 3, 1]], expected: true }, { label: 'all unique', input: [[1, 2, 3, 4]], expected: false }, { label: 'empty', input: [[]], expected: false }],
    hints: ['Keep a Set called seen.', 'Check before adding the current value.'],
  },
  {
    id: 'hash_map', name: 'Hash Map', family: 'data-structures', level: 'easy',
    summary: 'Build frequency tables and key-value state in one pass.',
    prompt: 'Return an object containing the frequency of every number.', time: 'O(n) average', space: 'O(n)', tags: ['counting', 'frequency'],
    questions: [
      q('state', 'What does the map value represent?', ['How many times the key has appeared.', 'The index of the smallest key.', 'The key sorted alphabetically.', 'Whether the key is negative.'], 'How many times the key has appeared.', 'A frequency map turns each key into the accumulated count for that key.'),
      q('missing', 'How should a key be updated the first time it appears?', ['Use (count[key] || 0) + 1.', 'Delete the key.', 'Set it to -1.', 'Only update it if it already exists.'], 'Use (count[key] || 0) + 1.', 'Missing keys start at zero, then the current occurrence adds one.'),
      q('complexity', 'Why is the algorithm linear on average?', ['Each item performs one average-constant-time map update.', 'It sorts the array twice.', 'It recursively explores every subset.', 'It compares every pair of items.'], 'Each item performs one average-constant-time map update.', 'There is one map operation per input value.'),
    ],
    functionName: 'countFrequencies', starterCode: 'function countFrequencies(nums) {\n  // Return an object like { "2": 3 }.\n}',
    solutionCode: 'function countFrequencies(nums) {\n  const counts = {};\n  for (const value of nums) counts[value] = (counts[value] || 0) + 1;\n  return counts;\n}',
    tests: [{ label: 'repeated values', input: [[2, 2, 3, 2, 3]], expected: { 2: 3, 3: 2 } }, { label: 'empty', input: [[]], expected: {} }],
    hints: ['Use an object or Map.', 'The old count is zero when a key has not been seen.'],
  },
  {
    id: 'two_pointers', name: 'Two Pointers', family: 'arrays', level: 'easy',
    summary: 'Shrink a sorted search space from both ends.',
    prompt: 'Return the two 1-based indices whose sorted values add to target.', time: 'O(n)', space: 'O(1)', tags: ['sorted', 'pair'],
    questions: [
      q('move', 'If the current sum is too small, which pointer moves?', ['left moves right.', 'right moves right.', 'both move left.', 'The array is shuffled.'], 'left moves right.', 'In sorted order, increasing the left value is the only way to increase the sum.'),
      q('assumption', 'What must be true before the scan starts?', ['The array is sorted in ascending order.', 'The array contains no negative values.', 'The target is the largest value.', 'All values are unique.'], 'The array is sorted in ascending order.', 'The pointer movement proof depends on sorted order.'),
      q('stop', 'When should the loop stop?', ['When left is no longer less than right.', 'After checking only the first pair.', 'When left equals target.', 'After n squared comparisons.'], 'When left is no longer less than right.', 'Crossed pointers mean every remaining candidate has been eliminated.'),
    ],
    functionName: 'twoSumSorted', starterCode: 'function twoSumSorted(numbers, target) {\n  // Return 1-based indices, or [] when no pair exists.\n}',
    solutionCode: 'function twoSumSorted(numbers, target) {\n  let left = 0;\n  let right = numbers.length - 1;\n  while (left < right) {\n    const sum = numbers[left] + numbers[right];\n    if (sum === target) return [left + 1, right + 1];\n    if (sum < target) left += 1;\n    else right -= 1;\n  }\n  return [];\n}',
    tests: [{ label: 'pair exists', input: [[2, 7, 11, 15], 9], expected: [1, 2] }, { label: 'no pair', input: [[1, 2, 4], 8], expected: [] }],
    hints: ['Start one pointer at each end.', 'A smaller sum needs a larger left value.'],
  },
  {
    id: 'sliding_window', name: 'Sliding Window', family: 'arrays', level: 'medium',
    summary: 'Maintain a contiguous range while expanding and shrinking its boundaries.',
    prompt: 'Return the length of the longest substring without repeated characters.', time: 'O(n)', space: 'O(k)', tags: ['substring', 'window'],
    questions: [
      q('expand', 'What does the right pointer do?', ['It expands the window one character at a time.', 'It always jumps to the start.', 'It sorts the string.', 'It removes the left character.'], 'It expands the window one character at a time.', 'The right boundary explores new input while the left boundary restores validity.'),
      q('shrink', 'When a duplicate enters the window, what happens?', ['Move left until the duplicate is outside.', 'Restart the entire scan.', 'Move right backwards.', 'Remove every character from the string.'], 'Move left until the duplicate is outside.', 'The window must be valid before its length can update the best answer.'),
      q('invariant', 'What is true after the shrink phase?', ['The current window contains no repeated characters.', 'The current window is always the longest possible.', 'The window is sorted.', 'The window is empty.'], 'The current window contains no repeated characters.', 'That validity invariant supports the one-pass maximum calculation.'),
    ],
    functionName: 'lengthOfLongestSubstring', starterCode: 'function lengthOfLongestSubstring(s) {\n  // Return the longest length with no repeated character.\n}',
    solutionCode: 'function lengthOfLongestSubstring(s) {\n  const lastSeen = new Map();\n  let left = 0;\n  let best = 0;\n  for (let right = 0; right < s.length; right += 1) {\n    const previous = lastSeen.get(s[right]);\n    if (previous !== undefined && previous >= left) left = previous + 1;\n    lastSeen.set(s[right], right);\n    best = Math.max(best, right - left + 1);\n  }\n  return best;\n}',
    tests: [{ label: 'classic', input: ['abcabcbb'], expected: 3 }, { label: 'all same', input: ['bbbbb'], expected: 1 }, { label: 'empty', input: [''], expected: 0 }],
    hints: ['Store the latest index of each character.', 'Never move left backwards.'],
  },
  {
    id: 'stack', name: 'Stack', family: 'data-structures', level: 'easy',
    summary: 'Handle nested or reverse-order work with last-in, first-out state.',
    prompt: 'Return whether brackets are correctly nested and closed.', time: 'O(n)', space: 'O(n)', tags: ['lifo', 'validation'],
    questions: [
      q('structure', 'Which item must be checked when a closing bracket arrives?', ['The most recent unmatched opening bracket.', 'The first opening bracket ever seen.', 'The largest bracket character.', 'A random bracket.'], 'The most recent unmatched opening bracket.', 'Nested structures close in reverse order, exactly what a stack models.'),
      q('invalid', 'What should happen for a mismatched close?', ['Return false immediately.', 'Push it and continue.', 'Ignore it.', 'Sort the brackets.'], 'Return false immediately.', 'A mismatch breaks the nesting invariant and cannot be repaired later.'),
      q('finish', 'What must be true at the end?', ['The stack is empty.', 'The stack has one item.', 'The stack contains only closes.', 'The string is sorted.'], 'The stack is empty.', 'Any leftover opener was never closed.'),
    ],
    functionName: 'isValidBrackets', starterCode: 'function isValidBrackets(s) {\n  // Return true only for correctly nested (), [], and {}.\n}',
    solutionCode: 'function isValidBrackets(s) {\n  const stack = [];\n  const pairs = { \")\": \")\", \"]\": \"]\", \")\": \")\" };\n  const matching = { \")\": \")\", \"]\": \"]\", \")\": \")\" };\n  const closes = { \")\": \")\", \"]\": \"]\", \")\": \")\" };\n  for (const ch of s) {\n    if (ch === \")\" || ch === \"]\" || ch === \"}\") {\n      const open = stack.pop();\n      if ((ch === \")\" && open !== \"(\") || (ch === \"]\" && open !== \"[\") || (ch === \"}\" && open !== \"{\")) return false;\n    } else stack.push(ch);\n  }\n  return stack.length === 0;\n}',
    tests: [{ label: 'nested', input: ['({[]})'], expected: true }, { label: 'mismatch', input: ['([)]'], expected: false }, { label: 'left open', input: ['((('], expected: false }],
    hints: ['Push opening brackets.', 'Pop and compare when you see a closing bracket.'],
  },
  {
    id: 'bfs', name: 'Breadth-First Search', family: 'graphs', level: 'medium',
    summary: 'Explore a graph level by level to find shortest unweighted paths.',
    prompt: 'Return the shortest edge distance from start to target in an adjacency list.', time: 'O(V + E)', space: 'O(V)', tags: ['queue', 'shortest path'],
    questions: [
      q('frontier', 'Which structure drives BFS?', ['A FIFO queue.', 'A LIFO stack.', 'A sorted array only.', 'A recursion-only call stack.'], 'A FIFO queue.', 'FIFO processing preserves distance layers.'),
      q('distance', 'When is a node first discovered in an unweighted graph?', ['Its shortest distance has been found.', 'Its maximum distance has been found.', 'It must be revisited.', 'Its weight is negative.'], 'Its shortest distance has been found.', 'Every earlier layer has already been processed.'),
      q('cycle', 'How do you avoid infinite revisits?', ['Mark nodes visited when enqueueing them.', 'Only mark the target.', 'Never enqueue neighbors.', 'Sort adjacency lists.'], 'Mark nodes visited when enqueueing them.', 'Marking at enqueue time prevents the same node entering the queue repeatedly.'),
    ],
    functionName: 'shortestPath', starterCode: 'function shortestPath(graph, start, target) {\n  // graph is an array of neighbor arrays. Return edge distance or -1.\n}',
    solutionCode: 'function shortestPath(graph, start, target) {\n  const queue = [[start, 0]];\n  const visited = new Set([start]);\n  for (let head = 0; head < queue.length; head += 1) {\n    const [node, distance] = queue[head];\n    if (node === target) return distance;\n    for (const next of graph[node] || []) {\n      if (!visited.has(next)) { visited.add(next); queue.push([next, distance + 1]); }\n    }\n  }\n  return -1;\n}',
    tests: [{ label: 'reachable', input: [[[1, 2], [3], [3], []], 0, 3], expected: 2 }, { label: 'unreachable', input: [[[1], [], [3], []], 0, 3], expected: -1 }],
    hints: ['Queue pairs of node and distance.', 'Mark a neighbor before enqueueing it.'],
  },
  {
    id: 'dfs', name: 'Depth-First Search', family: 'graphs', level: 'medium',
    summary: 'Explore a branch deeply before returning to sibling branches.',
    prompt: 'Count connected components in an undirected adjacency list.', time: 'O(V + E)', space: 'O(V)', tags: ['recursion', 'components'],
    questions: [
      q('order', 'What is DFS naturally good at?', ['Deep exploration and component discovery.', 'Guaranteed shortest paths with weights.', 'Constant-time sorting.', 'Frequency counting only.'], 'Deep exploration and component discovery.', 'DFS follows one branch until it ends, which makes it useful for reachability and components.'),
      q('visited', 'Why is a visited set required?', ['Graphs can contain cycles and repeated routes.', 'It sorts neighbors.', 'It creates edge weights.', 'It makes recursion iterative.'], 'Graphs can contain cycles and repeated routes.', 'Without visited tracking, a cycle can recurse forever.'),
      q('shortest', 'Does the first DFS path guarantee a shortest path?', ['No, DFS does not guarantee that.', 'Yes, always.', 'Only with negative weights.', 'Only when the graph is disconnected.'], 'No, DFS does not guarantee that.', 'BFS is the usual choice for shortest paths by edge count.'),
    ],
    functionName: 'countComponents', starterCode: 'function countComponents(graph) {\n  // Return the number of connected components.\n}',
    solutionCode: 'function countComponents(graph) {\n  const visited = new Set();\n  let count = 0;\n  const visit = (node) => {\n    if (visited.has(node)) return;\n    visited.add(node);\n    for (const next of graph[node] || []) visit(next);\n  };\n  for (let node = 0; node < graph.length; node += 1) {\n    if (!visited.has(node)) { count += 1; visit(node); }\n  }\n  return count;\n}',
    tests: [{ label: 'two groups', input: [[[1], [0], [3], [2]]], expected: 2 }, { label: 'isolated nodes', input: [[[], [], []]], expected: 3 }],
    hints: ['Start a new DFS for every unvisited node.', 'A DFS marks all nodes in one component.'],
  },
  {
    id: 'binary_search', name: 'Binary Search', family: 'arrays', level: 'easy',
    summary: 'Find a target or boundary by repeatedly halving sorted search space.',
    prompt: 'Return the index of target in a sorted array, or -1 if absent.', time: 'O(log n)', space: 'O(1)', tags: ['sorted', 'halving'],
    questions: [
      q('requirement', 'What makes binary search valid?', ['Sorted data or a monotonic predicate.', 'Random unsorted data.', 'A linked list with no ordering.', 'Negative values only.'], 'Sorted data or a monotonic predicate.', 'Halving is safe only when one half can be ruled out.'),
      q('mid', 'Why use lo + Math.floor((hi - lo) / 2)?', ['It finds the midpoint without adding the full bounds first.', 'It sorts the input.', 'It always returns the target.', 'It doubles the search space.'], 'It finds the midpoint without adding the full bounds first.', 'This form also avoids overflow in fixed-width integer languages.'),
      q('discard', 'If nums[mid] is less than target, what can be discarded?', ['The left half through mid.', 'The right half only.', 'The entire array.', 'Nothing ever.'], 'The left half through mid.', 'In sorted order, every value at or before mid is too small.'),
    ],
    functionName: 'binarySearch', starterCode: 'function binarySearch(nums, target) {\n  // Return target index, or -1.\n}',
    solutionCode: 'function binarySearch(nums, target) {\n  let lo = 0;\n  let hi = nums.length - 1;\n  while (lo <= hi) {\n    const mid = lo + Math.floor((hi - lo) / 2);\n    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) lo = mid + 1;\n    else hi = mid - 1;\n  }\n  return -1;\n}',
    tests: [{ label: 'found', input: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 }, { label: 'missing', input: [[1, 3, 5], 4], expected: -1 }],
    hints: ['Keep an inclusive [lo, hi] range.', 'Discard mid after learning its value is too small or large.'],
  },
  {
    id: 'dp', name: 'Dynamic Programming', family: 'optimization', level: 'medium',
    summary: 'Reuse answers to overlapping subproblems instead of recomputing them.',
    prompt: 'Return the number of ways to climb n stairs using 1 or 2 steps.', time: 'O(n)', space: 'O(1)', tags: ['states', 'recurrence'],
    questions: [
      q('state', 'What is a DP state here?', ['The number of ways to reach a particular stair.', 'The largest input value.', 'A random recursion branch.', 'Only the final answer.'], 'The number of ways to reach a particular stair.', 'A state names one subproblem whose answer can be reused.'),
      q('transition', 'What recurrence describes the problem?', ['ways(n) = ways(n - 1) + ways(n - 2).', 'ways(n) = n squared.', 'ways(n) = ways(n + 1).', 'ways(n) = 2n + 1 always.'], 'ways(n) = ways(n - 1) + ways(n - 2).', 'The final step comes from either a one-step or two-step move.'),
      q('base', 'What is a useful base case for n = 0?', ['One way: take no steps.', 'Zero ways in every interpretation.', 'Throw an error.', 'Negative one way.'], 'One way: take no steps.', 'The empty sequence is one valid way to complete a zero-step subproblem.'),
    ],
    functionName: 'climbStairs', starterCode: 'function climbStairs(n) {\n  // Return the number of distinct 1/2-step ways.\n}',
    solutionCode: 'function climbStairs(n) {\n  let one = 1;\n  let two = 1;\n  for (let step = 1; step <= n; step += 1) [one, two] = [two, one + two];\n  return one;\n}',
    tests: [{ label: 'two stairs', input: [2], expected: 2 }, { label: 'five stairs', input: [5], expected: 8 }, { label: 'zero stairs', input: [0], expected: 1 }],
    hints: ['Keep the previous two state values.', 'Start from ways(0) = 1 and ways(1) = 1.'],
  },
  {
    id: 'prefix_difference', name: 'Prefix / Difference Array', family: 'arrays', level: 'medium',
    summary: 'Answer repeated ranges or batch range updates with boundary bookkeeping.',
    prompt: 'Apply inclusive range additions and return the final array.', time: 'O(n + updates)', space: 'O(n)', tags: ['ranges', 'prefix'],
    questions: [
      q('boundary', 'Where does a difference-array update stop?', ['Subtract the amount at r + 1 when it is in bounds.', 'Subtract at l - 1 only.', 'Never stop the update.', 'Sort all update pairs.'], 'Subtract the amount at r + 1 when it is in bounds.', 'The second boundary turns the range effect off after the inclusive right endpoint.'),
      q('rebuild', 'How do you recover final values from a difference array?', ['Run a prefix sum over the differences.', 'Run binary search.', 'Use a stack.', 'Multiply every value by its index.'], 'Run a prefix sum over the differences.', 'The running total is the amount currently active at each index.'),
      q('benefit', 'Why use this technique for many updates?', ['Each update is O(1), so the expensive reconstruction is delayed.', 'It avoids reading the input.', 'It guarantees O(1) total time.', 'It removes all memory use.'], 'Each update is O(1), so the expensive reconstruction is delayed.', 'This avoids touching every cell for every range.'),
    ],
    functionName: 'applyRangeAdds', starterCode: 'function applyRangeAdds(length, updates) {\n  // Each update is [left, right, amount], inclusive.\n}',
    solutionCode: 'function applyRangeAdds(length, updates) {\n  const diff = Array(length + 1).fill(0);\n  for (const [left, right, amount] of updates) {\n    diff[left] += amount;\n    if (right + 1 < diff.length) diff[right + 1] -= amount;\n  }\n  const result = [];\n  let running = 0;\n  for (let i = 0; i < length; i += 1) { running += diff[i]; result.push(running); }\n  return result;\n}',
    tests: [{ label: 'two updates', input: [5, [[1, 3, 2], [2, 4, 1]]], expected: [0, 2, 3, 3, 1] }, { label: 'empty updates', input: [3, []], expected: [0, 0, 0] }],
    hints: ['Allocate length + 1 to make r + 1 safe.', 'Reconstruct with a running sum.'],
  },
  {
    id: 'intervals', name: 'Merge Intervals', family: 'arrays', level: 'medium',
    summary: 'Sort ranges, then sweep while maintaining the last merged range.',
    prompt: 'Merge every overlapping inclusive interval.', time: 'O(n log n)', space: 'O(n)', tags: ['ranges', 'sorting'],
    questions: [
      q('sort', 'Why sort intervals by start first?', ['It makes all possible overlaps appear next to each other.', 'It removes all intervals.', 'It makes time O(1).', 'It sorts by length automatically.'], 'It makes all possible overlaps appear next to each other.', 'A sorted sweep only needs to compare with the current merged tail.'),
      q('overlap', 'When do [a, b] and [c, d] overlap or touch?', ['When c <= b.', 'When c > b always.', 'Only when a equals c.', 'When d is negative.'], 'When c <= b.', 'The next start is inside or on the current end.'),
      q('merge', 'How should the merged end be updated?', ['Use Math.max(currentEnd, nextEnd).', 'Always use nextEnd.', 'Always use currentStart.', 'Add both ends.'], 'Use Math.max(currentEnd, nextEnd).', 'A nested interval must not shorten the range already covered.'),
    ],
    functionName: 'mergeIntervals', starterCode: 'function mergeIntervals(intervals) {\n  // Return sorted, non-overlapping intervals.\n}',
    solutionCode: 'function mergeIntervals(intervals) {\n  const sorted = intervals.map((x) => [...x]).sort((a, b) => a[0] - b[0]);\n  const merged = [];\n  for (const interval of sorted) {\n    const last = merged[merged.length - 1];\n    if (!last || interval[0] > last[1]) merged.push(interval);\n    else last[1] = Math.max(last[1], interval[1]);\n  }\n  return merged;\n}',
    tests: [{ label: 'overlap', input: [[[1, 3], [2, 6], [8, 10], [9, 12]]], expected: [[1, 6], [8, 12]] }, { label: 'touching', input: [[[1, 4], [4, 5]]], expected: [[1, 5]] }],
    hints: ['Sort a copy by interval[0].', 'Compare the next start with the last merged end.'],
  },
  {
    id: 'heap', name: 'Heap / Priority Queue', family: 'data-structures', level: 'medium',
    summary: 'Keep the best candidates while extracting the smallest or largest priority quickly.',
    prompt: 'Return the kth largest number without fully sorting the input.', time: 'O(n log k)', space: 'O(k)', tags: ['top-k', 'priority'],
    questions: [
      q('polarity', 'Which heap is useful for kth largest?', ['A min-heap of size k.', 'A max-heap containing every value.', 'A stack only.', 'A random queue.'], 'A min-heap of size k.', 'The smallest item among the top k sits at the root and can be removed.'),
      q('size', 'What should happen when the heap grows beyond k?', ['Pop its minimum.', 'Pop every item.', 'Sort the original array.', 'Push a null.'], 'Pop its minimum.', 'Discarding the weakest top-k candidate keeps the invariant.'),
      q('root', 'What is the root after all values are processed?', ['The kth largest value.', 'The smallest input always.', 'The median always.', 'The first input.'], 'The kth largest value.', 'Exactly k strongest candidates remain, and the weakest of those is kth largest.'),
    ],
    functionName: 'kthLargest', starterCode: 'function kthLargest(nums, k) {\n  // Return the kth largest value.\n}',
    solutionCode: 'function kthLargest(nums, k) {\n  const kept = [];\n  const push = (value) => { kept.push(value); kept.sort((a, b) => a - b); };\n  for (const value of nums) { push(value); if (kept.length > k) kept.shift(); }\n  return kept[0];\n}',
    tests: [{ label: 'third largest', input: [[3, 2, 1, 5, 6, 4], 2], expected: 5 }, { label: 'duplicates', input: [[3, 3, 3, 1], 2], expected: 3 }],
    hints: ['Keep at most k values.', 'The weakest kept value is the answer.'],
  },
  {
    id: 'monotonic_queue', name: 'Monotonic Queue', family: 'data-structures', level: 'hard',
    summary: 'Track a sliding-window maximum in linear time with a deque of indices.',
    prompt: 'Return the maximum value for every window of size k.', time: 'O(n)', space: 'O(k)', tags: ['deque', 'window max'],
    questions: [
      q('deque', 'What does the deque store?', ['Indices whose values are decreasing from front to back.', 'Every value in sorted order.', 'Only the last index.', 'Random graph nodes.'], 'Indices whose values are decreasing from front to back.', 'Indices let us evict expired entries while values maintain maximum order.'),
      q('back', 'When a new value is larger than the deque back, what happens?', ['Pop smaller values from the back.', 'Pop the front only.', 'Clear the input.', 'Move the window left.'], 'Pop smaller values from the back.', 'A smaller value behind a newer larger value can never become the maximum.'),
      q('front', 'What does the deque front represent?', ['The maximum index for the current window.', 'The oldest index ever seen.', 'The minimum value.', 'The window size.'], 'The maximum index for the current window.', 'The front is the best candidate after expired and dominated indices are removed.'),
    ],
    functionName: 'maxSlidingWindow', starterCode: 'function maxSlidingWindow(nums, k) {\n  // Return one maximum per window.\n}',
    solutionCode: 'function maxSlidingWindow(nums, k) {\n  const deque = [];\n  const result = [];\n  for (let i = 0; i < nums.length; i += 1) {\n    while (deque.length && deque[0] <= i - k) deque.shift();\n    while (deque.length && nums[deque[deque.length - 1]] <= nums[i]) deque.pop();\n    deque.push(i);\n    if (i >= k - 1) result.push(nums[deque[0]]);\n  }\n  return result;\n}',
    tests: [{ label: 'three-wide windows', input: [[1, 3, -1, -3, 5, 3, 6, 7], 3], expected: [3, 3, 5, 5, 6, 7] }, { label: 'one-wide', input: [[4, 2], 1], expected: [4, 2] }],
    hints: ['Remove indices outside i - k + 1.', 'Remove dominated values from the back before pushing i.'],
  },
  {
    id: 'topological_sort', name: 'Topological Sort', family: 'graphs', level: 'medium',
    summary: 'Order DAG tasks by repeatedly taking nodes with zero prerequisites.',
    prompt: 'Return a valid course order, or [] if prerequisites contain a cycle.', time: 'O(V + E)', space: 'O(V)', tags: ['DAG', 'dependencies'],
    questions: [
      q('indegree', 'What does indegree count?', ['Incoming prerequisite edges.', 'Outgoing edges only.', 'The node weight.', 'The number of components.'], 'Incoming prerequisite edges.', 'A zero-indegree node has no remaining prerequisite blocking it.'),
      q('cycle', 'How can Kahn’s algorithm detect a cycle?', ['The output contains fewer than V nodes.', 'The queue is always full.', 'Every node has indegree zero.', 'Edges are sorted.'], 'The output contains fewer than V nodes.', 'A cycle leaves its nodes with positive indegree forever.'),
      q('choice', 'What can you do when several nodes have zero indegree?', ['Choose any of them and still get a valid order.', 'The graph is automatically invalid.', 'Choose none.', 'Reverse every edge.'], 'Choose any of them and still get a valid order.', 'DAGs can have multiple valid topological orderings.'),
    ],
    functionName: 'courseOrder', starterCode: 'function courseOrder(courseCount, prerequisites) {\n  // prerequisites contains [course, prerequisite]. Return [] on a cycle.\n}',
    solutionCode: 'function courseOrder(courseCount, prerequisites) {\n  const graph = Array.from({ length: courseCount }, () => []);\n  const indegree = Array(courseCount).fill(0);\n  for (const [course, prerequisite] of prerequisites) { graph[prerequisite].push(course); indegree[course] += 1; }\n  const queue = [];\n  indegree.forEach((degree, course) => { if (degree === 0) queue.push(course); });\n  const order = [];\n  for (let head = 0; head < queue.length; head += 1) {\n    const node = queue[head]; order.push(node);\n    for (const next of graph[node]) if (--indegree[next] === 0) queue.push(next);\n  }\n  return order.length === courseCount ? order : [];\n}',
    tests: [{ label: 'dependency chain', input: [4, [[1, 0], [2, 1], [3, 2]]], expected: [0, 1, 2, 3] }, { label: 'cycle', input: [2, [[0, 1], [1, 0]]], expected: [] }],
    hints: ['Build adjacency lists and indegrees.', 'Start with every zero-indegree course.'],
  },
  {
    id: 'union_find', name: 'Union-Find', family: 'graphs', level: 'medium',
    summary: 'Maintain connected components efficiently as edges are added.',
    prompt: 'Return the number of connected components after adding undirected edges.', time: 'Near O((V + E) α(V))', space: 'O(V)', tags: ['DSU', 'connectivity'],
    questions: [
      q('find', 'What does find(x) return?', ['The representative root of x’s component.', 'The shortest path.', 'The largest node.', 'The edge count only.'], 'The representative root of x’s component.', 'Roots identify which component an element belongs to.'),
      q('union', 'What does union(a, b) do when roots differ?', ['Connects the two roots into one component.', 'Deletes both nodes.', 'Sorts all edges.', 'Creates a cycle by definition.'], 'Connects the two roots into one component.', 'Joining roots reduces the component count by one.'),
      q('optimization', 'Why use path compression?', ['Future find operations become much faster.', 'It removes all vertices.', 'It sorts components.', 'It changes directed edges to undirected.'], 'Future find operations become much faster.', 'Path compression flattens parent chains as roots are found.'),
    ],
    functionName: 'countComponentsDsu', starterCode: 'function countComponentsDsu(n, edges) {\n  // edges contains [a, b]. Return the number of components.\n}',
    solutionCode: 'function countComponentsDsu(n, edges) {\n  const parent = Array.from({ length: n }, (_, i) => i);\n  const find = (x) => parent[x] === x ? x : (parent[x] = find(parent[x]));\n  let components = n;\n  for (const [a, b] of edges) {\n    const rootA = find(a), rootB = find(b);\n    if (rootA !== rootB) { parent[rootA] = rootB; components -= 1; }\n  }\n  return components;\n}',
    tests: [{ label: 'two components', input: [5, [[0, 1], [1, 2], [3, 4]]], expected: 2 }, { label: 'no edges', input: [3, []], expected: 3 }],
    hints: ['Start with every node as its own root.', 'Only decrement the count when roots differ.'],
  },
  {
    id: 'backtracking', name: 'Backtracking', family: 'optimization', level: 'medium',
    summary: 'Explore choices recursively, undoing each choice before trying the next.',
    prompt: 'Return every subset of an integer array.', time: 'O(n · 2^n)', space: 'O(n)', tags: ['search', 'choices'],
    questions: [
      q('step', 'What are the three phases of a backtracking branch?', ['Choose, recurse, undo.', 'Sort, hash, stop.', 'Push, dequeue, merge.', 'Compile, run, deploy.'], 'Choose, recurse, undo.', 'Undo restores the partial solution before exploring its sibling choice.'),
      q('state', 'What should the current path represent?', ['A valid partial solution.', 'Every possible solution at once.', 'Only rejected choices.', 'The final output only.'], 'A valid partial solution.', 'Maintaining valid partial state makes pruning and correctness easier.'),
      q('base', 'When should a subset be recorded?', ['When the decision index reaches the end.', 'Only when the path is empty.', 'Before making any choice only.', 'After sorting twice.'], 'When the decision index reaches the end.', 'At that point every include/exclude decision has been made.'),
    ],
    functionName: 'subsets', starterCode: 'function subsets(nums) {\n  // Return an array containing every subset.\n}',
    solutionCode: 'function subsets(nums) {\n  const result = [];\n  const path = [];\n  const visit = (index) => {\n    if (index === nums.length) { result.push([...path]); return; }\n    visit(index + 1);\n    path.push(nums[index]); visit(index + 1); path.pop();\n  };\n  visit(0);\n  return result;\n}',
    tests: [{ label: 'two values', input: [[1, 2]], expected: [[], [2], [1], [1, 2]] }, { label: 'empty', input: [[]], expected: [[]] }],
    hints: ['Each value creates an include and exclude branch.', 'Copy path before pushing it to results.'],
  },
  {
    id: 'trie', name: 'Trie', family: 'strings', level: 'medium',
    summary: 'Represent words by shared character paths for fast prefix queries.',
    prompt: 'Return whether any inserted word starts with the requested prefix.', time: 'O(L)', space: 'O(total characters)', tags: ['prefix', 'dictionary'],
    questions: [
      q('path', 'What does a root-to-node path represent?', ['A string prefix.', 'A sorted numeric range.', 'A graph cycle.', 'A completed hash bucket only.'], 'A string prefix.', 'Shared paths are why prefix lookup depends on prefix length.'),
      q('marker', 'Why is an end-of-word marker useful?', ['It distinguishes a complete word from a word that is only a prefix.', 'It sorts children.', 'It removes duplicate characters.', 'It stores edge weights.'], 'It distinguishes a complete word from a word that is only a prefix.', 'For example, app can be a prefix of apple without being inserted itself.'),
      q('lookup', 'What determines lookup time?', ['The length of the queried word or prefix.', 'The number of unrelated words only.', 'The array capacity.', 'The number of graph edges.'], 'The length of the queried word or prefix.', 'A trie follows one child per character.'),
    ],
    functionName: 'hasPrefix', starterCode: 'function hasPrefix(words, prefix) {\n  // Return true if at least one word starts with prefix.\n}',
    solutionCode: 'function hasPrefix(words, prefix) {\n  const root = {};\n  for (const word of words) { let node = root; for (const ch of word) node = node[ch] || (node[ch] = {}); }\n  let node = root;\n  for (const ch of prefix) { if (!node[ch]) return false; node = node[ch]; }\n  return true;\n}',
    tests: [{ label: 'prefix exists', input: [['apple', 'app', 'banana'], 'ap'], expected: true }, { label: 'prefix missing', input: [['cat', 'car'], 'do'], expected: false }],
    hints: ['Create nested objects keyed by characters.', 'A prefix is present if every character path exists.'],
  },
  {
    id: 'greedy', name: 'Greedy', family: 'optimization', level: 'medium',
    summary: 'Make the locally best choice when a proof shows it preserves a global optimum.',
    prompt: 'Return the maximum number of non-overlapping intervals.', time: 'O(n log n)', space: 'O(1) to O(n)', tags: ['choice', 'intervals'],
    questions: [
      q('sort', 'For interval scheduling, what should be sorted first?', ['By earliest finish time.', 'By largest duration.', 'By latest start only.', 'By random order.'], 'By earliest finish time.', 'Finishing earliest leaves the most room for future compatible intervals.'),
      q('proof', 'When is greedy trustworthy?', ['When an exchange or choice argument proves local choices stay optimal.', 'Whenever code is shorter.', 'Only for negative numbers.', 'Never.'], 'When an exchange or choice argument proves local choices stay optimal.', 'Greedy is a correctness strategy, not merely a speed trick.'),
      q('check', 'When can an interval be selected?', ['Its start is at or after the last selected end.', 'Its duration is largest.', 'It starts before every selected interval.', 'It has a negative end.'], 'Its start is at or after the last selected end.', 'That feasibility check maintains the non-overlap invariant.'),
    ],
    functionName: 'maxNonOverlapping', starterCode: 'function maxNonOverlapping(intervals) {\n  // Return the largest count of non-overlapping intervals.\n}',
    solutionCode: 'function maxNonOverlapping(intervals) {\n  const sorted = intervals.slice().sort((a, b) => a[1] - b[1]);\n  let lastEnd = -Infinity;\n  let count = 0;\n  for (const [start, end] of sorted) if (start >= lastEnd) { count += 1; lastEnd = end; }\n  return count;\n}',
    tests: [{ label: 'schedule', input: [[[1, 2], [2, 3], [3, 4], [1, 3]]], expected: 3 }, { label: 'overlap', input: [[[1, 10], [2, 3], [4, 5]]], expected: 2 }],
    hints: ['Sort by end, not start.', 'Accept an interval only if it starts after lastEnd.'],
  },
  {
    id: 'dijkstra', name: 'Dijkstra', family: 'graphs', level: 'hard',
    summary: 'Find shortest paths from one source when every edge weight is non-negative.',
    prompt: 'Return shortest distances from start in a weighted adjacency list.', time: 'O((V + E) log V)', space: 'O(V)', tags: ['weighted graph', 'relaxation'],
    questions: [
      q('weight', 'What edge restriction does Dijkstra require?', ['All edge weights are non-negative.', 'Every edge is negative.', 'Edges must be unweighted.', 'There must be no cycles.'], 'All edge weights are non-negative.', 'A negative edge could invalidate a distance that was already finalized.'),
      q('relax', 'What does relaxing an edge mean?', ['Try to improve neighbor distance through the current node.', 'Delete the edge.', 'Reverse the graph.', 'Count connected components.'], 'Try to improve neighbor distance through the current node.', 'If distance[u] + weight is smaller, update distance[v].'),
      q('priority', 'Why use a min-priority queue?', ['The next cheapest tentative node is processed first.', 'It reverses every edge.', 'It stores only negative values.', 'It avoids all memory.'], 'The next cheapest tentative node is processed first.', 'That ordering supports the finalization proof for non-negative weights.'),
    ],
    functionName: 'shortestDistances', starterCode: 'function shortestDistances(graph, start) {\n  // graph[u] contains [v, weight]. Return distances, using null for unreachable.\n}',
    solutionCode: 'function shortestDistances(graph, start) {\n  const dist = Array(graph.length).fill(Infinity); dist[start] = 0;\n  const pending = [[0, start]];\n  while (pending.length) {\n    pending.sort((a, b) => a[0] - b[0]);\n    const [distance, node] = pending.shift();\n    if (distance !== dist[node]) continue;\n    for (const [next, weight] of graph[node] || []) {\n      const candidate = distance + weight;\n      if (candidate < dist[next]) { dist[next] = candidate; pending.push([candidate, next]); }\n    }\n  }\n  return dist.map((value) => Number.isFinite(value) ? value : null);\n}',
    tests: [{ label: 'weighted route', input: [[[[1, 4], [2, 1]], [[3, 1]], [[1, 2], [3, 5]], []], 0], expected: [0, 3, 1, 4] }, { label: 'unreachable', input: [[[[1, 2]], [], []], 0], expected: [0, 2, null] }],
    hints: ['Store [distance, node] pairs.', 'Ignore stale queue entries whose distance no longer matches dist[node].'],
  },
  {
    id: 'merge_sort', name: 'Merge Sort', family: 'sorting', level: 'medium',
    summary: 'Divide the array, sort both halves, then merge them in order.',
    prompt: 'Return a new array sorted in ascending numeric order.', time: 'O(n log n)', space: 'O(n)', tags: ['divide and conquer', 'stable'],
    questions: [
      q('divide', 'What is the main divide-and-conquer step?', ['Split into halves until subarrays are size one.', 'Remove every second value.', 'Use a graph queue.', 'Pick the largest pivot.'], 'Split into halves until subarrays are size one.', 'A one-item array is already sorted.'),
      q('merge', 'What does the merge step do?', ['Combines two sorted halves by repeatedly taking the smaller front value.', 'Shuffles both halves.', 'Reverses the array.', 'Counts duplicates only.'], 'Combines two sorted halves by repeatedly taking the smaller front value.', 'Two sorted inputs can be merged in linear time.'),
      q('stability', 'What is a common property of merge sort?', ['It can be stable when equal values keep their original order.', 'It is always in-place with O(1) space.', 'It only sorts strings.', 'It needs a hash map.'], 'It can be stable when equal values keep their original order.', 'Choosing from the left half first on ties preserves relative order.'),
    ],
    functionName: 'mergeSort', starterCode: 'function mergeSort(nums) {\n  // Return a sorted copy of nums.\n}',
    solutionCode: 'function mergeSort(nums) {\n  if (nums.length <= 1) return nums.slice();\n  const mid = Math.floor(nums.length / 2);\n  const left = mergeSort(nums.slice(0, mid));\n  const right = mergeSort(nums.slice(mid));\n  const result = []; let i = 0; let j = 0;\n  while (i < left.length || j < right.length) {\n    if (j === right.length || left[i] <= right[j]) result.push(left[i++]); else result.push(right[j++]);\n  }\n  return result;\n}',
    tests: [{ label: 'mixed', input: [[5, 2, 3, 1]], expected: [1, 2, 3, 5] }, { label: 'duplicates', input: [[3, 1, 3, 2]], expected: [1, 2, 3, 3] }],
    hints: ['Write a merge helper or merge inline.', 'Always copy remaining values after one half is exhausted.'],
  },
  {
    id: 'quick_sort', name: 'Quick Sort', family: 'sorting', level: 'medium',
    summary: 'Partition around a pivot, then recursively sort both sides.',
    prompt: 'Return a sorted copy using partition-based recursion.', time: 'O(n log n) average', space: 'O(log n) average', tags: ['partition', 'pivot'],
    questions: [
      q('partition', 'What is guaranteed after partitioning?', ['Values on the left are no greater than the pivot and values on the right are no smaller.', 'The entire array is sorted.', 'All values are unique.', 'The pivot is removed.'], 'Values on the left are no greater than the pivot and values on the right are no smaller.', 'Partition establishes the boundary needed for recursive sorting.'),
      q('worst', 'When can quick sort degrade to O(n²)?', ['Repeatedly choosing a very unbalanced pivot.', 'When the array is empty.', 'When values are integers.', 'When recursion stops.'], 'Repeatedly choosing a very unbalanced pivot.', 'Poor pivots leave one side almost as large as the original array.'),
      q('base', 'When should recursive sorting stop?', ['When the range has fewer than two items.', 'Only after n² calls.', 'When the pivot is zero.', 'Never.'], 'When the range has fewer than two items.', 'A one-item range is already sorted.'),
    ],
    functionName: 'quickSort', starterCode: 'function quickSort(nums) {\n  // Return a sorted copy of nums.\n}',
    solutionCode: 'function quickSort(nums) {\n  if (nums.length <= 1) return nums.slice();\n  const pivot = nums[nums.length - 1];\n  const left = nums.slice(0, -1).filter((x) => x <= pivot);\n  const right = nums.slice(0, -1).filter((x) => x > pivot);\n  return [...quickSort(left), pivot, ...quickSort(right)];\n}',
    tests: [{ label: 'mixed', input: [[4, 1, 7, 2, 2]], expected: [1, 2, 2, 4, 7] }, { label: 'already sorted', input: [[1, 2, 3]], expected: [1, 2, 3] }],
    hints: ['Choose a pivot and build lower/upper partitions.', 'Recurse on both partitions.'],
  },
  {
    id: 'kadane', name: "Kadane's Algorithm", family: 'optimization', level: 'medium',
    summary: 'Track the best subarray ending at the current position.',
    prompt: 'Return the largest possible sum of a non-empty contiguous subarray.', time: 'O(n)', space: 'O(1)', tags: ['maximum sum', 'subarray'],
    questions: [
      q('state', 'What does current represent?', ['The best sum of a subarray ending at this index.', 'The sum of the entire array.', 'The smallest element.', 'The number of zeros.'], 'The best sum of a subarray ending at this index.', 'That local state gives the next position exactly the information it needs.'),
      q('choice', 'What is the transition?', ['Choose max(value, current + value).', 'Always reset to zero.', 'Always add the absolute value.', 'Choose the minimum.'], 'Choose max(value, current + value).', 'Either start a new subarray or extend the previous best ending here.'),
      q('negative', 'What should an all-negative array return?', ['Its largest (least negative) element.', 'Zero always.', 'The sum of all elements.', 'Infinity.'], 'Its largest (least negative) element.', 'The subarray must be non-empty, so zero is not a valid automatic reset answer.'),
    ],
    functionName: 'maxSubarray', starterCode: 'function maxSubarray(nums) {\n  // Return the maximum non-empty contiguous subarray sum.\n}',
    solutionCode: 'function maxSubarray(nums) {\n  let current = nums[0]; let best = nums[0];\n  for (let i = 1; i < nums.length; i += 1) { current = Math.max(nums[i], current + nums[i]); best = Math.max(best, current); }\n  return best;\n}',
    tests: [{ label: 'mixed', input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 }, { label: 'all negative', input: [[-3, -1, -2]], expected: -1 }],
    hints: ['Initialize from nums[0], not zero.', 'Keep both current-ending-here and global best.'],
  },
  {
    id: 'floyd_warshall', name: 'Floyd-Warshall', family: 'graphs', level: 'hard',
    summary: 'Use every vertex as an intermediate to compute all-pairs shortest paths.',
    prompt: 'Return the all-pairs shortest-distance matrix for a weighted graph matrix.', time: 'O(V³)', space: 'O(V²)', tags: ['all pairs', 'matrix DP'],
    questions: [
      q('transition', 'What does the k loop represent?', ['Allowing vertex k as a new intermediate.', 'Visiting only k edges.', 'Deleting vertex k.', 'Sorting row k.'], 'Allowing vertex k as a new intermediate.', 'The recurrence compares a direct route with a route through k.'),
      q('formula', 'What is the core update?', ['dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]).', 'dist[i][j] = dist[i][j] * k.', 'dist[i][j] = max(i, j).', 'dist[i][j] = 0 always.'], 'dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]).', 'The new candidate route goes from i to k, then k to j.'),
      q('negative', 'What can a negative diagonal indicate?', ['A negative cycle is reachable.', 'The graph is disconnected only.', 'Every path is shortest.', 'The matrix is sorted.'], 'A negative cycle is reachable.', 'A route from a vertex back to itself with negative cost can keep decreasing.'),
    ],
    functionName: 'allPairsShortestPaths', starterCode: 'function allPairsShortestPaths(matrix) {\n  // matrix uses null for no edge. Return a new distance matrix.\n}',
    solutionCode: 'function allPairsShortestPaths(matrix) {\n  const dist = matrix.map((row, i) => row.map((value, j) => value === null ? (i === j ? 0 : Infinity) : value));\n  for (let k = 0; k < dist.length; k += 1) for (let i = 0; i < dist.length; i += 1) for (let j = 0; j < dist.length; j += 1) dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j]);\n  return dist.map((row) => row.map((value) => Number.isFinite(value) ? value : null));\n}',
    tests: [{ label: 'three nodes', input: [[[0, 3, 10], [null, 0, 2], [null, null, 0]]], expected: [[0, 3, 5], [null, 0, 2], [null, null, 0]] }],
    hints: ['Copy the matrix before changing it.', 'Try every k between each i and j.'],
  },
  {
    id: 'bellman_ford', name: 'Bellman-Ford', family: 'graphs', level: 'hard',
    summary: 'Relax every edge repeatedly, allowing negative edges and detecting negative cycles.',
    prompt: 'Return shortest distances from start, or null when a negative cycle is reachable.', time: 'O(VE)', space: 'O(V)', tags: ['negative edges', 'relaxation'],
    questions: [
      q('passes', 'How many full relaxation passes are normally needed?', ['V - 1.', 'Exactly one.', 'E squared.', 'Zero.'], 'V - 1.', 'A simple shortest path can use at most V - 1 edges.'),
      q('negative', 'How is a reachable negative cycle detected?', ['If an edge can still relax after V - 1 passes.', 'If the graph has any cycle.', 'If every distance is zero.', 'If the source has no edges.'], 'If an edge can still relax after V - 1 passes.', 'A further improvement means a path can keep getting cheaper.'),
      q('strength', 'What can Bellman-Ford handle that Dijkstra cannot?', ['Negative edge weights, as long as no reachable negative cycle exists.', 'Only unweighted graphs.', 'No disconnected nodes.', 'Only trees.'], 'Negative edge weights, as long as no reachable negative cycle exists.', 'Repeated relaxation does not rely on finalized greedy choices.'),
    ],
    functionName: 'bellmanFord', starterCode: 'function bellmanFord(n, edges, start) {\n  // edges contains [from, to, weight]. Return distances or null for a negative cycle.\n}',
    solutionCode: 'function bellmanFord(n, edges, start) {\n  const dist = Array(n).fill(Infinity); dist[start] = 0;\n  for (let pass = 0; pass < n - 1; pass += 1) {\n    let changed = false;\n    for (const [from, to, weight] of edges) if (Number.isFinite(dist[from]) && dist[from] + weight < dist[to]) { dist[to] = dist[from] + weight; changed = true; }\n    if (!changed) break;\n  }\n  for (const [from, to, weight] of edges) if (Number.isFinite(dist[from]) && dist[from] + weight < dist[to]) return null;\n  return dist.map((value) => Number.isFinite(value) ? value : null);\n}',
    tests: [{ label: 'negative edge', input: [4, [[0, 1, 4], [0, 2, 5], [1, 2, -2], [2, 3, 3]], 0], expected: [0, 4, 2, 5] }, { label: 'cycle', input: [2, [[0, 1, 1], [1, 0, -2]], 0], expected: null }],
    hints: ['Relax every edge n - 1 times.', 'Only relax from nodes whose distance is finite.'],
  },
  {
    id: 'kruskal', name: "Kruskal's MST", family: 'graphs', level: 'hard',
    summary: 'Build a minimum spanning tree by accepting cheapest edges that connect different components.',
    prompt: 'Return the total weight of a minimum spanning tree, or -1 if the graph is disconnected.', time: 'O(E log E)', space: 'O(V)', tags: ['MST', 'DSU'],
    questions: [
      q('sort', 'How are candidate edges considered?', ['From lowest weight to highest weight.', 'From highest to lowest only.', 'By vertex label.', 'In input order always.'], 'From lowest weight to highest weight.', 'The cut property makes the cheapest safe edge a good choice.'),
      q('cycle', 'Why skip an edge joining the same DSU root?', ['It would create a cycle.', 'It is always negative.', 'It is disconnected.', 'It has no weight.'], 'It would create a cycle.', 'An MST must connect vertices without forming cycles.'),
      q('finish', 'How do you know a spanning tree is complete?', ['It contains V - 1 accepted edges.', 'It contains E edges.', 'The queue is empty only.', 'Every edge was accepted.'], 'It contains V - 1 accepted edges.', 'A tree with V vertices always has exactly V - 1 edges.'),
    ],
    functionName: 'minimumSpanningTreeWeight', starterCode: 'function minimumSpanningTreeWeight(n, edges) {\n  // edges contains [a, b, weight]. Return -1 if disconnected.\n}',
    solutionCode: 'function minimumSpanningTreeWeight(n, edges) {\n  const parent = Array.from({ length: n }, (_, i) => i);\n  const find = (x) => parent[x] === x ? x : (parent[x] = find(parent[x]));\n  let used = 0; let total = 0;\n  for (const [a, b, weight] of edges.slice().sort((x, y) => x[2] - y[2])) { const ra = find(a), rb = find(b); if (ra !== rb) { parent[ra] = rb; used += 1; total += weight; } }\n  return used === n - 1 ? total : -1;\n}',
    tests: [{ label: 'triangle', input: [4, [[0, 1, 1], [1, 2, 2], [2, 3, 1], [0, 3, 4], [0, 2, 3]]], expected: 4 }, { label: 'disconnected', input: [3, [[0, 1, 2]]], expected: -1 }],
    hints: ['Sort a copy of edges by weight.', 'Use DSU to test whether an edge is safe.'],
  },
  {
    id: 'kmp', name: 'KMP String Search', family: 'strings', level: 'hard',
    summary: 'Search a pattern in linear time by reusing prefix-suffix information.',
    prompt: 'Return the first index where needle occurs in haystack, or -1.', time: 'O(n + m)', space: 'O(m)', tags: ['pattern matching', 'prefix table'],
    questions: [
      q('table', 'What does the LPS table store?', ['The longest proper prefix that is also a suffix.', 'The longest word in the input.', 'Every character count.', 'The final match index only.'], 'The longest proper prefix that is also a suffix.', 'This tells KMP how far the pattern can shift after a mismatch.'),
      q('skip', 'Why does KMP avoid moving the text pointer backwards?', ['Previous comparisons already provide reusable prefix information.', 'The text is sorted.', 'The pattern is reversed.', 'It never compares characters.'], 'Previous comparisons already provide reusable prefix information.', 'The prefix table encodes the work needed after a mismatch.'),
      q('empty', 'What should searching for an empty needle return?', ['0', '-1', 'The haystack length only.', 'null'], '0', 'The empty string occurs at the beginning by common substring-search convention.'),
    ],
    functionName: 'findSubstring', starterCode: 'function findSubstring(haystack, needle) {\n  // Return the first matching index, or -1.\n}',
    solutionCode: 'function findSubstring(haystack, needle) {\n  if (needle.length === 0) return 0;\n  const lps = Array(needle.length).fill(0);\n  for (let i = 1, len = 0; i < needle.length;) { if (needle[i] === needle[len]) lps[i++] = ++len; else if (len) len = lps[len - 1]; else i += 1; }\n  for (let i = 0, j = 0; i < haystack.length;) { if (haystack[i] === needle[j]) { i += 1; j += 1; if (j === needle.length) return i - j; } else if (j) j = lps[j - 1]; else i += 1; }\n  return -1;\n}',
    tests: [{ label: 'match', input: ['sadbutsad', 'sad'], expected: 0 }, { label: 'later match', input: ['mississippi', 'issip'], expected: 4 }, { label: 'missing', input: ['abc', 'd'], expected: -1 }],
    hints: ['Build LPS for the needle first.', 'On mismatch, move j to lps[j - 1] when j > 0.'],
  },
  {
    id: 'sieve', name: 'Sieve of Eratosthenes', family: 'optimization', level: 'medium',
    summary: 'Mark composite numbers in batches to enumerate primes up to n.',
    prompt: 'Return the number of primes strictly less than n.', time: 'O(n log log n)', space: 'O(n)', tags: ['primes', 'marking'],
    questions: [
      q('start', 'Where can marking begin for a prime p?', ['At p².', 'At 1.', 'At n².', 'At p - 1 always.'], 'At p².', 'Smaller multiples already have a smaller prime factor and were marked earlier.'),
      q('limit', 'How far must the outer loop go?', ['While p² < n.', 'All the way to n².', 'Only p = 1.', 'Never beyond 2.'], 'While p² < n.', 'If p is larger than the square root, its composite multiples have smaller factors.'),
      q('base', 'Is 1 prime?', ['No.', 'Yes.', 'Only when n is odd.', 'Only for n = 1.'], 'No.', 'Prime numbers have exactly two positive divisors, and 1 has only one.'),
    ],
    functionName: 'countPrimes', starterCode: 'function countPrimes(n) {\n  // Return the count of primes less than n.\n}',
    solutionCode: 'function countPrimes(n) {\n  if (n <= 2) return 0;\n  const prime = Array(n).fill(true); prime[0] = false; prime[1] = false;\n  for (let p = 2; p * p < n; p += 1) if (prime[p]) for (let multiple = p * p; multiple < n; multiple += p) prime[multiple] = false;\n  return prime.filter(Boolean).length;\n}',
    tests: [{ label: 'below ten', input: [10], expected: 4 }, { label: 'small', input: [2], expected: 0 }, { label: 'below twenty', input: [20], expected: 8 }],
    hints: ['Create a boolean array for candidates.', 'Mark multiples starting at p * p.'],
  },
  {
    id: 'counting_sort', name: 'Counting Sort', family: 'sorting', level: 'medium',
    summary: 'Count occurrences when the value range is small, then rebuild sorted output.',
    prompt: 'Sort an array containing only values from 0 through maxValue.', time: 'O(n + k)', space: 'O(k)', tags: ['frequency', 'bounded range'],
    questions: [
      q('fit', 'When is counting sort a strong fit?', ['The value range k is reasonably small compared with n.', 'Values are arbitrary huge objects.', 'The input is a graph.', 'Only one value exists but k is infinite.'], 'The value range k is reasonably small compared with n.', 'The count array pays for the range, so a massive sparse range is a poor fit.'),
      q('count', 'What does the first pass collect?', ['How many times each value appears.', 'Each value’s shortest path.', 'Pivot positions.', 'String prefixes.'], 'How many times each value appears.', 'Counts determine how many copies to emit.'),
      q('rebuild', 'How is sorted output produced?', ['Emit each value count[value] times from low to high.', 'Shuffle the count array.', 'Use DFS.', 'Reverse input only.'], 'Emit each value count[value] times from low to high.', 'Ascending value order plus frequencies is the sorted result.'),
    ],
    functionName: 'countingSort', starterCode: 'function countingSort(nums, maxValue) {\n  // Return sorted values from 0 through maxValue.\n}',
    solutionCode: 'function countingSort(nums, maxValue) {\n  const counts = Array(maxValue + 1).fill(0);\n  for (const value of nums) counts[value] += 1;\n  const result = [];\n  counts.forEach((count, value) => { for (let i = 0; i < count; i += 1) result.push(value); });\n  return result;\n}',
    tests: [{ label: 'small range', input: [[4, 2, 2, 8, 3, 3, 1], 8], expected: [1, 2, 2, 3, 3, 4, 8] }, { label: 'zeros', input: [[0, 0, 2], 2], expected: [0, 0, 2] }],
    hints: ['Allocate maxValue + 1 counters.', 'Walk counters from index zero upward.'],
  },
  {
    id: 'radix_sort', name: 'Radix Sort', family: 'sorting', level: 'hard',
    summary: 'Sort non-negative integers digit by digit with a stable counting pass.',
    prompt: 'Return an ascending array of non-negative integers.', time: 'O(d · (n + b))', space: 'O(n + b)', tags: ['digits', 'stable sort'],
    questions: [
      q('order', 'Which digit is processed first in LSD radix sort?', ['The least significant digit.', 'The most significant digit only.', 'The median digit.', 'No digit.'], 'The least significant digit.', 'Stable passes let later higher digits refine lower-digit ordering.'),
      q('stable', 'Why must each digit pass be stable?', ['Equal current digits must keep the order established by earlier passes.', 'Stability removes all zeros.', 'It sorts the input alphabetically.', 'It avoids reading digits.'], 'Equal current digits must keep the order established by earlier passes.', 'Without stability, lower-digit ordering would be destroyed.'),
      q('base', 'What does base 10 provide?', ['Ten buckets, one for each decimal digit.', 'Ten graph vertices.', 'A binary heap.', 'A prefix table.'], 'Ten buckets, one for each decimal digit.', 'Each pass groups values by the selected digit 0 through 9.'),
    ],
    functionName: 'radixSort', starterCode: 'function radixSort(nums) {\n  // Return sorted non-negative integers.\n}',
    solutionCode: 'function radixSort(nums) {\n  let result = nums.slice();\n  const max = Math.max(0, ...result);\n  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {\n    const buckets = Array.from({ length: 10 }, () => []);\n    for (const value of result) buckets[Math.floor(value / exp) % 10].push(value);\n    result = buckets.flat();\n  }\n  return result;\n}',
    tests: [{ label: 'digits', input: [[170, 45, 75, 90, 802, 24, 2, 66]], expected: [2, 24, 45, 66, 75, 90, 170, 802] }, { label: 'zeroes', input: [[0, 5, 0, 2]], expected: [0, 0, 2, 5] }],
    hints: ['Use exp = 1, 10, 100...', 'Flatten buckets in order after every pass.'],
  },
];

const SEGMENT_TREE_CHALLENGE: AlgorithmChallenge = {
  id: 'segment_tree', name: 'Segment Tree', family: 'data-structures', level: 'hard',
  summary: 'Answer range-sum queries while supporting point updates.',
  prompt: 'Process operations where [0, left, right] asks for an inclusive sum and [1, index, value] updates one point.',
  time: 'O((n + q) log n)', space: 'O(n)', tags: ['range query', 'point update'],
  questions: [
    q('node', 'What does each segment-tree node store?', ['The aggregate for its interval.', 'Only the interval midpoint.', 'Every query ever asked.', 'A random leaf value.'], 'The aggregate for its interval.', 'Keeping interval aggregates lets a query combine only relevant nodes.'),
    q('query', 'What happens when a node interval is fully inside the query?', ['Return its stored aggregate without descending.', 'Delete the node.', 'Visit every leaf anyway.', 'Reverse the interval.'], 'Return its stored aggregate without descending.', 'A fully covered interval is already summarized.'),
    q('update', 'What must a point update do after changing a leaf?', ['Recompute aggregates on the path back to the root.', 'Rebuild unrelated trees only.', 'Change the query bounds.', 'Sort all values.'], 'Recompute aggregates on the path back to the root.', 'Every ancestor interval that contains the point must stay correct.'),
  ],
  functionName: 'rangeOperations', starterCode: 'def rangeOperations(nums, operations):\n    # Return the result of each [0, left, right] range sum.\n    pass',
  solutionCode: '',
  tests: [
    { label: 'query and update', input: [[1, 3, 5, 7], [[0, 1, 3], [1, 2, 10], [0, 0, 2]]], expected: [15, 14] },
    { label: 'full range', input: [[2, 4], [[0, 0, 1]]], expected: [6] },
  ],
  hints: ['A simple recursive segment tree can store sums in an array.', 'Recalculate a parent as left child plus right child after each update.'],
};

const PYTHON_SNIPPETS: Record<string, { starterCode: string; solutionCode: string }> = {
  hash_set: {
    starterCode: `def containsDuplicate(nums):
    # Return True if any value appears more than once.
    pass`,
    solutionCode: `def containsDuplicate(nums):
    seen = set()
    for value in nums:
        if value in seen:
            return True
        seen.add(value)
    return False`,
  },
  hash_map: {
    starterCode: `def countFrequencies(nums):
    # Return a dictionary containing each value's frequency.
    pass`,
    solutionCode: `def countFrequencies(nums):
    counts = {}
    for value in nums:
        counts[value] = counts.get(value, 0) + 1
    return counts`,
  },
  two_pointers: {
    starterCode: `def twoSumSorted(numbers, target):
    # Return 1-based indices, or [] when no pair exists.
    pass`,
    solutionCode: `def twoSumSorted(numbers, target):
    left, right = 0, len(numbers) - 1
    while left < right:
        total = numbers[left] + numbers[right]
        if total == target:
            return [left + 1, right + 1]
        if total < target:
            left += 1
        else:
            right -= 1
    return []`,
  },
  sliding_window: {
    starterCode: `def lengthOfLongestSubstring(s):
    # Return the longest length with no repeated character.
    pass`,
    solutionCode: `def lengthOfLongestSubstring(s):
    last_seen = {}
    left = best = 0
    for right, char in enumerate(s):
        if char in last_seen and last_seen[char] >= left:
            left = last_seen[char] + 1
        last_seen[char] = right
        best = max(best, right - left + 1)
    return best`,
  },
  stack: {
    starterCode: `def isValidBrackets(s):
    # Return True only for correctly nested (), [], and {}.
    pass`,
    solutionCode: `def isValidBrackets(s):
    stack = []
    matching = {')': '(', ']': '[', '}': '{'}
    for char in s:
        if char in matching:
            if not stack or stack.pop() != matching[char]:
                return False
        else:
            stack.append(char)
    return not stack`,
  },
  bfs: {
    starterCode: `def shortestPath(graph, start, target):
    # graph is an adjacency list. Return edge distance or -1.
    pass`,
    solutionCode: `def shortestPath(graph, start, target):
    queue = [(start, 0)]
    visited = {start}
    for node, distance in queue:
        if node == target:
            return distance
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, distance + 1))
    return -1`,
  },
  dfs: {
    starterCode: `def countComponents(graph):
    # Return the number of connected components.
    pass`,
    solutionCode: `def countComponents(graph):
    visited = set()

    def visit(node):
        if node in visited:
            return
        visited.add(node)
        for neighbor in graph[node]:
            visit(neighbor)

    count = 0
    for node in range(len(graph)):
        if node not in visited:
            count += 1
            visit(node)
    return count`,
  },
  binary_search: {
    starterCode: `def binarySearch(nums, target):
    # Return target index, or -1.
    pass`,
    solutionCode: `def binarySearch(nums, target):
    low, high = 0, len(nums) - 1
    while low <= high:
        mid = low + (high - low) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
  },
  dp: {
    starterCode: `def climbStairs(n):
    # Return the number of distinct 1/2-step ways.
    pass`,
    solutionCode: `def climbStairs(n):
    one, two = 1, 1
    for _ in range(n):
        one, two = two, one + two
    return one`,
  },
  prefix_difference: {
    starterCode: `def applyRangeAdds(length, updates):
    # Each update is [left, right, amount], inclusive.
    pass`,
    solutionCode: `def applyRangeAdds(length, updates):
    difference = [0] * (length + 1)
    for left, right, amount in updates:
        difference[left] += amount
        if right + 1 < len(difference):
            difference[right + 1] -= amount
    result = []
    running = 0
    for index in range(length):
        running += difference[index]
        result.append(running)
    return result`,
  },
  intervals: {
    starterCode: `def mergeIntervals(intervals):
    # Return sorted, non-overlapping intervals.
    pass`,
    solutionCode: `def mergeIntervals(intervals):
    sorted_intervals = sorted(intervals)
    merged = []
    for start, end in sorted_intervals:
        if not merged or start > merged[-1][1]:
            merged.append([start, end])
        else:
            merged[-1][1] = max(merged[-1][1], end)
    return merged`,
  },
  heap: {
    starterCode: `def kthLargest(nums, k):
    # Return the kth largest value.
    pass`,
    solutionCode: `import heapq

def kthLargest(nums, k):
    heap = []
    for value in nums:
        heapq.heappush(heap, value)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]`,
  },
  monotonic_queue: {
    starterCode: `from collections import deque

def maxSlidingWindow(nums, k):
    # Return one maximum per window.
    pass`,
    solutionCode: `from collections import deque

def maxSlidingWindow(nums, k):
    candidates = deque()
    result = []
    for index, value in enumerate(nums):
        while candidates and candidates[0] <= index - k:
            candidates.popleft()
        while candidates and nums[candidates[-1]] <= value:
            candidates.pop()
        candidates.append(index)
        if index >= k - 1:
            result.append(nums[candidates[0]])
    return result`,
  },
  topological_sort: {
    starterCode: `def courseOrder(courseCount, prerequisites):
    # prerequisites contains [course, prerequisite]. Return [] on a cycle.
    pass`,
    solutionCode: `from collections import deque

def courseOrder(courseCount, prerequisites):
    graph = [[] for _ in range(courseCount)]
    indegree = [0] * courseCount
    for course, prerequisite in prerequisites:
        graph[prerequisite].append(course)
        indegree[course] += 1
    queue = deque(node for node, degree in enumerate(indegree) if degree == 0)
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            indegree[neighbor] -= 1
            if indegree[neighbor] == 0:
                queue.append(neighbor)
    return order if len(order) == courseCount else []`,
  },
  union_find: {
    starterCode: `def countComponentsDsu(n, edges):
    # edges contains [a, b]. Return the number of components.
    pass`,
    solutionCode: `def countComponentsDsu(n, edges):
    parent = list(range(n))

    def find(node):
        if parent[node] != node:
            parent[node] = find(parent[node])
        return parent[node]

    components = n
    for left, right in edges:
        root_left, root_right = find(left), find(right)
        if root_left != root_right:
            parent[root_left] = root_right
            components -= 1
    return components`,
  },
  backtracking: {
    starterCode: `def subsets(nums):
    # Return an array containing every subset.
    pass`,
    solutionCode: `def subsets(nums):
    result = []
    path = []

    def visit(index):
        if index == len(nums):
            result.append(path[:])
            return
        visit(index + 1)
        path.append(nums[index])
        visit(index + 1)
        path.pop()

    visit(0)
    return result`,
  },
  trie: {
    starterCode: `def hasPrefix(words, prefix):
    # Return True if at least one word starts with prefix.
    pass`,
    solutionCode: `def hasPrefix(words, prefix):
    root = {}
    for word in words:
        node = root
        for char in word:
            node = node.setdefault(char, {})
    node = root
    for char in prefix:
        if char not in node:
            return False
        node = node[char]
    return True`,
  },
  greedy: {
    starterCode: `def maxNonOverlapping(intervals):
    # Return the largest count of non-overlapping intervals.
    pass`,
    solutionCode: `def maxNonOverlapping(intervals):
    last_end = float('-inf')
    count = 0
    for start, end in sorted(intervals, key=lambda interval: interval[1]):
        if start >= last_end:
            count += 1
            last_end = end
    return count`,
  },
  dijkstra: {
    starterCode: `def shortestDistances(graph, start):
    # graph[u] contains [v, weight]. Return None for unreachable nodes.
    pass`,
    solutionCode: `import heapq

def shortestDistances(graph, start):
    distances = [float('inf')] * len(graph)
    distances[start] = 0
    pending = [(0, start)]
    while pending:
        distance, node = heapq.heappop(pending)
        if distance != distances[node]:
            continue
        for neighbor, weight in graph[node]:
            candidate = distance + weight
            if candidate < distances[neighbor]:
                distances[neighbor] = candidate
                heapq.heappush(pending, (candidate, neighbor))
    return [value if value != float('inf') else None for value in distances]`,
  },
  merge_sort: {
    starterCode: `def mergeSort(nums):
    # Return a sorted copy of nums.
    pass`,
    solutionCode: `def mergeSort(nums):
    if len(nums) <= 1:
        return nums[:]
    middle = len(nums) // 2
    left = mergeSort(nums[:middle])
    right = mergeSort(nums[middle:])
    result = []
    while left and right:
        result.append((left if left[0] <= right[0] else right).pop(0))
    return result + left + right`,
  },
  quick_sort: {
    starterCode: `def quickSort(nums):
    # Return a sorted copy of nums.
    pass`,
    solutionCode: `def quickSort(nums):
    if len(nums) <= 1:
        return nums[:]
    pivot = nums[-1]
    lower = [value for value in nums[:-1] if value <= pivot]
    higher = [value for value in nums[:-1] if value > pivot]
    return quickSort(lower) + [pivot] + quickSort(higher)`,
  },
  kadane: {
    starterCode: `def maxSubarray(nums):
    # Return the maximum non-empty contiguous subarray sum.
    pass`,
    solutionCode: `def maxSubarray(nums):
    current = best = nums[0]
    for value in nums[1:]:
        current = max(value, current + value)
        best = max(best, current)
    return best`,
  },
  floyd_warshall: {
    starterCode: `def allPairsShortestPaths(matrix):
    # matrix uses None for no edge. Return a new distance matrix.
    pass`,
    solutionCode: `def allPairsShortestPaths(matrix):
    size = len(matrix)
    distance = [[0 if i == j else (float('inf') if value is None else value)
                 for j, value in enumerate(row)] for i, row in enumerate(matrix)]
    for middle in range(size):
        for start in range(size):
            for end in range(size):
                distance[start][end] = min(distance[start][end], distance[start][middle] + distance[middle][end])
    return [[value if value != float('inf') else None for value in row] for row in distance]`,
  },
  bellman_ford: {
    starterCode: `def bellmanFord(n, edges, start):
    # edges contains [from, to, weight]. Return None for a negative cycle.
    pass`,
    solutionCode: `def bellmanFord(n, edges, start):
    distances = [float('inf')] * n
    distances[start] = 0
    for _ in range(n - 1):
        changed = False
        for source, target, weight in edges:
            if distances[source] != float('inf') and distances[source] + weight < distances[target]:
                distances[target] = distances[source] + weight
                changed = True
        if not changed:
            break
    for source, target, weight in edges:
        if distances[source] != float('inf') and distances[source] + weight < distances[target]:
            return None
    return [value if value != float('inf') else None for value in distances]`,
  },
  kruskal: {
    starterCode: `def minimumSpanningTreeWeight(n, edges):
    # edges contains [a, b, weight]. Return -1 if disconnected.
    pass`,
    solutionCode: `def minimumSpanningTreeWeight(n, edges):
    parent = list(range(n))

    def find(node):
        if parent[node] != node:
            parent[node] = find(parent[node])
        return parent[node]

    total = used = 0
    for left, right, weight in sorted(edges, key=lambda edge: edge[2]):
        root_left, root_right = find(left), find(right)
        if root_left != root_right:
            parent[root_left] = root_right
            total += weight
            used += 1
    return total if used == n - 1 else -1`,
  },
  kmp: {
    starterCode: `def findSubstring(haystack, needle):
    # Return the first matching index, or -1.
    pass`,
    solutionCode: `def findSubstring(haystack, needle):
    if not needle:
        return 0
    lps = [0] * len(needle)
    length = 0
    index = 1
    while index < len(needle):
        if needle[index] == needle[length]:
            length += 1
            lps[index] = length
            index += 1
        elif length:
            length = lps[length - 1]
        else:
            index += 1
    text_index = pattern_index = 0
    while text_index < len(haystack):
        if haystack[text_index] == needle[pattern_index]:
            text_index += 1
            pattern_index += 1
            if pattern_index == len(needle):
                return text_index - pattern_index
        elif pattern_index:
            pattern_index = lps[pattern_index - 1]
        else:
            text_index += 1
    return -1`,
  },
  sieve: {
    starterCode: `def countPrimes(n):
    # Return the count of primes less than n.
    pass`,
    solutionCode: `def countPrimes(n):
    if n <= 2:
        return 0
    prime = [True] * n
    prime[0] = prime[1] = False
    for value in range(2, int((n - 1) ** 0.5) + 1):
        if prime[value]:
            for multiple in range(value * value, n, value):
                prime[multiple] = False
    return sum(prime)`,
  },
  counting_sort: {
    starterCode: `def countingSort(nums, maxValue):
    # Return sorted values from 0 through maxValue.
    pass`,
    solutionCode: `def countingSort(nums, maxValue):
    counts = [0] * (maxValue + 1)
    for value in nums:
        counts[value] += 1
    result = []
    for value, count in enumerate(counts):
        result.extend([value] * count)
    return result`,
  },
  radix_sort: {
    starterCode: `def radixSort(nums):
    # Return sorted non-negative integers.
    pass`,
    solutionCode: `def radixSort(nums):
    result = nums[:]
    exponent = 1
    while exponent <= max(result, default=0):
        buckets = [[] for _ in range(10)]
        for value in result:
            buckets[(value // exponent) % 10].append(value)
        result = [value for bucket in buckets for value in bucket]
        exponent *= 10
    return result`,
  },
  segment_tree: {
    starterCode: `def rangeOperations(nums, operations):
    # Return the result of each [0, left, right] range sum.
    pass`,
    solutionCode: `def rangeOperations(nums, operations):
    size = 1
    while size < len(nums):
        size *= 2
    tree = [0] * (2 * size)
    for index, value in enumerate(nums):
        tree[size + index] = value
    for index in range(size - 1, 0, -1):
        tree[index] = tree[index * 2] + tree[index * 2 + 1]

    def update(index, value):
        node = size + index
        tree[node] = value
        node //= 2
        while node:
            tree[node] = tree[node * 2] + tree[node * 2 + 1]
            node //= 2

    def query(left, right):
        left += size
        right += size
        total = 0
        while left <= right:
            if left % 2 == 1:
                total += tree[left]
                left += 1
            if right % 2 == 0:
                total += tree[right]
                right -= 1
            left //= 2
            right //= 2
        return total

    answers = []
    for operation in operations:
        if operation[0] == 0:
            answers.append(query(operation[1], operation[2]))
        else:
            update(operation[1], operation[2])
    return answers`,
  },
};

export const ALGORITHM_CHALLENGES: AlgorithmChallenge[] = [...RAW_ALGORITHM_CHALLENGES, SEGMENT_TREE_CHALLENGE].map((challenge) => ({
  ...challenge,
  ...PYTHON_SNIPPETS[challenge.id],
}));

export const algorithmChallengeById = Object.fromEntries(
  ALGORITHM_CHALLENGES.map((challenge) => [challenge.id, challenge]),
) as Record<string, AlgorithmChallenge>;
