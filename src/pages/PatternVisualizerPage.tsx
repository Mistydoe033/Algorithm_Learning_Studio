import { useEffect, useMemo, useState } from 'react';

import { BenchmarkPanel } from '../components/BenchmarkPanel';
import { PatternPicker } from '../components/PatternPicker';
import { StudyNotes } from '../components/StudyNotes';
import { StepPlayer } from '../components/StepPlayer';
import { patternByKey, type PatternKey } from '../data/patterns';
import {
  keyCell,
  parseCells,
  parseEdges,
  parseIntList,
  parseIntervals,
  parseRangeUpdates,
  parseWeightedEdges,
  parseWords,
  simulateBacktrackingSubsetSum,
  simulateBfsGrid,
  simulateBinarySearch,
  simulateDfsGraph,
  simulateDijkstra,
  simulateFibMemo,
  simulateGreedyIntervalScheduling,
  simulateHashDuplicate,
  simulateHashFrequency,
  simulateHeapTopK,
  simulateIntervalsMerge,
  simulateMonotonicWindowMax,
  simulatePrefixDifference,
  simulateSlidingWindow,
  simulateStackParens,
  simulateTopologicalSort,
  simulateTriePrefix,
  simulateTwoPointers,
  simulateUnionFind,
  type Step,
} from '../lib/algorithms';

function formatArrayViz(nums: number[], markers: Record<number, string>) {
  const fmt = (x: string | number) => String(x).padStart(4, ' ');
  const idx = `idx :${nums.map((_, i) => fmt(i)).join('')}`;
  const val = `val :${nums.map((v) => fmt(v)).join('')}`;
  const mark = `mark:${nums.map((_, i) => fmt(markers[i] ?? '')).join('')}`;
  return `${idx}\n${val}\n${mark}`;
}

function renderGrid(
  rows: number,
  cols: number,
  blocked: Set<string>,
  visited: string[],
  frontier: string[],
  start: [number, number],
  current: [number, number] | null,
) {
  const f = new Set(frontier);
  const v = new Set(visited);
  const out: string[] = [];

  for (let r = 0; r < rows; r += 1) {
    const row: string[] = [];
    for (let c = 0; c < cols; c += 1) {
      const key = keyCell(r, c);
      let token = '.';
      if (blocked.has(key)) token = '#';
      else if (r === start[0] && c === start[1]) token = 'S';
      if (v.has(key) && token === '.') token = 'V';
      if (f.has(key)) token = 'Q';
      if (current && r === current[0] && c === current[1]) token = 'C';
      row.push(token);
    }
    out.push(row.join(' '));
  }

  return out.join('\n');
}

interface PatternPreset {
  id: string;
  label: string;
  description: string;
  numsInput?: string;
  target?: number;
  windowK?: number;
  stackInput?: string;
  rows?: number;
  cols?: number;
  startR?: number;
  startC?: number;
  blockedInput?: string;
  nodeCount?: number;
  dfsStart?: number;
  edgesInput?: string;
  dpN?: number;
  intervalsInput?: string;
  updatesInput?: string;
  rangeL?: number;
  rangeR?: number;
  heapK?: number;
  dsuA?: number;
  dsuB?: number;
  wordsInput?: string;
  triePrefix?: string;
  weightedEdgesInput?: string;
  dijkstraStart?: number;
}

const PATTERN_PRESETS: Record<PatternKey, PatternPreset[]> = {
  hash_set: [
    {
      id: 'dup_early',
      label: 'Duplicate appears early',
      description: 'A repeated value appears near the front, so HashSet can stop early.',
      numsInput: '2,7,11,7,3,11',
    },
    {
      id: 'all_unique',
      label: 'All unique values',
      description: 'No duplicates exist, so the full list is scanned and result is null.',
      numsInput: '1,2,3,4,5,6',
    },
    {
      id: 'neg_zero_dup',
      label: 'Negative/zero with duplicate',
      description: 'Duplicate detection works the same with negatives and zero.',
      numsInput: '-3,0,4,-3,9,12',
    },
  ],
  hash_map: [
    {
      id: 'freq_mixed',
      label: 'Mixed frequencies',
      description: 'Some values appear once, some multiple times, so map counts diverge.',
      numsInput: '1,1,2,3,3,3,4',
    },
    {
      id: 'all_same',
      label: 'Single repeated value',
      description: 'One key accumulates all counts.',
      numsInput: '5,5,5,5,5',
    },
    {
      id: 'with_negatives',
      label: 'Includes negatives',
      description: 'Counts across positive, negative, and zero values.',
      numsInput: '4,-1,4,0,-1,4,2',
    },
  ],
  two_pointers: [
    {
      id: 'pair_exists',
      label: 'Pair exists',
      description: 'Sorted list contains a valid pair; pointers converge to match.',
      numsInput: '1,2,3,4,6,8',
      target: 10,
    },
    {
      id: 'no_pair',
      label: 'No pair matches target',
      description: 'No two values hit target, so pointers cross.',
      numsInput: '1,3,5,7,9',
      target: 2,
    },
    {
      id: 'duplicate_pair',
      label: 'Uses duplicate values',
      description: 'Pair can be formed with duplicate numbers.',
      numsInput: '1,2,2,3,4,6',
      target: 4,
    },
  ],
  sliding_window: [
    {
      id: 'window_grows',
      label: 'Window expands and shrinks',
      description: 'Running sum exceeds k repeatedly, forcing shrink steps.',
      numsInput: '2,1,3,2,1,1,1',
      windowK: 5,
    },
    {
      id: 'tight_limit',
      label: 'Tight limit',
      description: 'Small threshold causes frequent shrinking.',
      numsInput: '4,4,1,1,1',
      windowK: 4,
    },
    {
      id: 'none_valid',
      label: 'No valid window',
      description: 'Every value is larger than k, so best stays 0.',
      numsInput: '7,8,9',
      windowK: 5,
    },
  ],
  stack: [
    {
      id: 'valid_nested',
      label: 'Valid nested brackets',
      description: 'Properly nested and balanced symbols.',
      stackInput: '({[]})[]',
    },
    {
      id: 'mismatch',
      label: 'Mismatch example',
      description: 'Closing order is wrong, so mismatch occurs.',
      stackInput: '([)]',
    },
    {
      id: 'unfinished',
      label: 'Unfinished open brackets',
      description: 'Scan ends with leftover open symbols.',
      stackInput: '(([]',
    },
  ],
  bfs: [
    {
      id: 'open_grid',
      label: 'Reachable open grid',
      description: 'Most cells are reachable; queue grows by layers.',
      rows: 5,
      cols: 6,
      startR: 0,
      startC: 0,
      blockedInput: '1-1,1-2,3-4',
    },
    {
      id: 'narrow_paths',
      label: 'Narrow paths',
      description: 'Walls create corridors and constrained frontier expansion.',
      rows: 5,
      cols: 5,
      startR: 0,
      startC: 0,
      blockedInput: '0-2,1-2,2-2,3-1,3-3',
    },
    {
      id: 'blocked_start',
      label: 'Blocked start edge case',
      description: 'Start position is blocked so traversal exits immediately.',
      rows: 4,
      cols: 4,
      startR: 1,
      startC: 1,
      blockedInput: '1-1,2-2',
    },
  ],
  dfs: [
    {
      id: 'tree_like',
      label: 'Tree-like graph',
      description: 'Classic deep traversal with clear backtracking points.',
      nodeCount: 7,
      dfsStart: 0,
      edgesInput: '0-1,0-2,1-3,1-4,2-5,5-6',
    },
    {
      id: 'disconnected',
      label: 'Disconnected graph',
      description: 'Only the start component is visited.',
      nodeCount: 8,
      dfsStart: 3,
      edgesInput: '0-1,1-2,3-4,4-5,6-7',
    },
    {
      id: 'with_cycle',
      label: 'Graph with cycle',
      description: 'Cycle requires visited checks.',
      nodeCount: 6,
      dfsStart: 0,
      edgesInput: '0-1,1-2,2-3,3-1,3-4,4-5',
    },
  ],
  binary_search: [
    {
      id: 'target_found',
      label: 'Target found',
      description: 'Target exists and lower-bound lands on its index.',
      numsInput: '1,3,5,7,9,11',
      target: 7,
    },
    {
      id: 'lower_bound',
      label: 'Target missing',
      description: 'Target absent so result is insertion index.',
      numsInput: '1,3,5,7,9,11',
      target: 8,
    },
    {
      id: 'duplicates',
      label: 'Many duplicates',
      description: 'Lower-bound returns first matching duplicate index.',
      numsInput: '1,2,2,2,4,5',
      target: 2,
    },
  ],
  dp: [
    { id: 'small_n', label: 'Small n', description: 'Few subproblems with visible memo hits.', dpN: 5 },
    { id: 'medium_n', label: 'Medium n', description: 'Memoization effect is clearer.', dpN: 10 },
    { id: 'larger_n', label: 'Larger n', description: 'State count grows while each state is solved once.', dpN: 20 },
  ],
  prefix_difference: [
    {
      id: 'single_update',
      label: 'Single range update',
      description: 'Apply one diff update, rebuild array, and answer range sum.',
      numsInput: '1,2,3,4,5,6',
      updatesInput: '1-4-2',
      rangeL: 1,
      rangeR: 4,
    },
    {
      id: 'multi_update',
      label: 'Multiple updates',
      description: 'Batch several updates then query interval quickly via prefix.',
      numsInput: '2,2,2,2,2,2,2',
      updatesInput: '0-3-1,2-6-2,5-6-3',
      rangeL: 2,
      rangeR: 6,
    },
    {
      id: 'edge_update',
      label: 'Boundary update',
      description: 'Update touching final index to validate diff boundary handling.',
      numsInput: '5,1,0,3,2',
      updatesInput: '3-4-4',
      rangeL: 0,
      rangeR: 4,
    },
  ],
  intervals: [
    {
      id: 'mixed_overlap',
      label: 'Mixed overlap intervals',
      description: 'Some ranges overlap and should merge.',
      intervalsInput: '1-3,2-6,8-10,15-18',
    },
    {
      id: 'nested',
      label: 'Nested intervals',
      description: 'Fully nested intervals collapse to a wider one.',
      intervalsInput: '1-10,2-5,3-4,11-12',
    },
    {
      id: 'touching',
      label: 'Touching boundaries',
      description: 'Boundary-touching ranges test merge conditions.',
      intervalsInput: '1-2,2-3,3-4,7-8',
    },
  ],
  heap: [
    {
      id: 'topk_small',
      label: 'Top-k largest values',
      description: 'Keep only k strongest values with bounded min-heap.',
      numsInput: '9,4,7,1,5,3,8,6',
      heapK: 3,
    },
    {
      id: 'duplicates',
      label: 'Repeated priorities',
      description: 'Handles ties while preserving top-k size.',
      numsInput: '5,5,5,2,9,9,1,8',
      heapK: 4,
    },
    {
      id: 'k_one',
      label: 'k = 1',
      description: 'Heap tracks only the single best value.',
      numsInput: '2,11,4,8,6',
      heapK: 1,
    },
  ],
  monotonic_queue: [
    {
      id: 'window_max',
      label: 'Window maximum',
      description: 'Deque maintains descending values for fast max.',
      numsInput: '1,3,-1,-3,5,3,6,7',
      windowK: 3,
    },
    {
      id: 'flat_values',
      label: 'All equal values',
      description: 'Equal values test stable deque maintenance.',
      numsInput: '4,4,4,4,4',
      windowK: 2,
    },
    {
      id: 'large_window',
      label: 'Window near full length',
      description: 'Large k emphasizes out-of-window evictions.',
      numsInput: '2,9,1,7,5,3',
      windowK: 5,
    },
  ],
  topological_sort: [
    {
      id: 'simple_dag',
      label: 'Simple DAG',
      description: 'Dependency ordering with multiple valid outputs.',
      nodeCount: 6,
      edgesInput: '0-1,0-2,1-3,2-3,3-4,2-5',
    },
    {
      id: 'multi_sources',
      label: 'Multiple sources',
      description: 'Several zero-indegree starts enter queue initially.',
      nodeCount: 7,
      edgesInput: '0-3,1-3,2-4,3-5,4-5,5-6',
    },
    {
      id: 'cycle_case',
      label: 'Cycle detection case',
      description: 'Cycle causes incomplete topological order.',
      nodeCount: 4,
      edgesInput: '0-1,1-2,2-0,2-3',
    },
  ],
  union_find: [
    {
      id: 'connected_query',
      label: 'Connected query',
      description: 'Union edges then ask if two nodes share a component.',
      nodeCount: 8,
      edgesInput: '0-1,1-2,3-4,4-5,2-5,6-7',
      dsuA: 0,
      dsuB: 5,
    },
    {
      id: 'disconnected_query',
      label: 'Disconnected query',
      description: 'Query nodes in different components.',
      nodeCount: 8,
      edgesInput: '0-1,1-2,3-4,5-6',
      dsuA: 2,
      dsuB: 6,
    },
    {
      id: 'redundant_edges',
      label: 'Redundant edges',
      description: 'Repeated unions should be detected as already connected.',
      nodeCount: 5,
      edgesInput: '0-1,1-2,0-2,2-3,3-4',
      dsuA: 0,
      dsuB: 4,
    },
  ],
  backtracking: [
    {
      id: 'subset_found',
      label: 'Subset target found',
      description: 'Search path finds combination reaching target sum.',
      numsInput: '2,3,5,7,8',
      target: 10,
    },
    {
      id: 'subset_missing',
      label: 'No valid subset',
      description: 'Explores branches and backtracks to no-solution.',
      numsInput: '4,6,9',
      target: 5,
    },
    {
      id: 'pruning_useful',
      label: 'Pruning-heavy case',
      description: 'Many branches are cut once partial sum exceeds target.',
      numsInput: '1,2,3,4,5,6',
      target: 9,
    },
  ],
  trie: [
    {
      id: 'prefix_exists',
      label: 'Prefix exists',
      description: 'Inserted words share queried prefix.',
      wordsInput: 'apple,app,apply,ape,bat',
      triePrefix: 'app',
    },
    {
      id: 'prefix_missing',
      label: 'Prefix missing',
      description: 'Query prefix fails traversal before completion.',
      wordsInput: 'cat,car,carbon,dog',
      triePrefix: 'cap',
    },
    {
      id: 'single_letter',
      label: 'Single-letter prefix',
      description: 'Short prefixes should still resolve quickly.',
      wordsInput: 'zebra,zen,zero,zip',
      triePrefix: 'z',
    },
  ],
  greedy: [
    {
      id: 'activity_selection',
      label: 'Activity selection',
      description: 'Select maximum non-overlapping intervals greedily by end.',
      intervalsInput: '1-4,3-5,0-6,5-7,8-9,5-9',
    },
    {
      id: 'already_non_overlap',
      label: 'Already non-overlapping',
      description: 'All intervals can be selected.',
      intervalsInput: '1-2,3-4,5-6,7-8',
    },
    {
      id: 'dense_overlap',
      label: 'Dense overlap',
      description: 'Heavy overlap forces frequent skips.',
      intervalsInput: '1-10,2-3,3-4,4-5,6-7',
    },
  ],
  dijkstra: [
    {
      id: 'weighted_graph',
      label: 'Weighted undirected graph',
      description: 'Relax edges to compute shortest paths from source.',
      nodeCount: 6,
      weightedEdgesInput: '0-1-4,0-2-1,2-1-2,1-3-1,2-3-5,3-4-3,4-5-2',
      dijkstraStart: 0,
    },
    {
      id: 'unreachable_nodes',
      label: 'Unreachable nodes',
      description: 'Disconnected vertices should remain unreachable.',
      nodeCount: 7,
      weightedEdgesInput: '0-1-2,1-2-3,2-3-1,4-5-1',
      dijkstraStart: 0,
    },
    {
      id: 'zero_weight',
      label: 'Zero-weight edges',
      description: 'Zero-cost edges still satisfy non-negative requirement.',
      nodeCount: 5,
      weightedEdgesInput: '0-1-0,1-2-2,0-3-5,2-4-1,3-4-1',
      dijkstraStart: 0,
    },
  ],
};

export function PatternVisualizerPage() {
  const [patternKey, setPatternKey] = useState<PatternKey>('hash_set');

  const [numsInput, setNumsInput] = useState('2,7,11,7,3,11');
  const [target, setTarget] = useState(10);
  const [windowK, setWindowK] = useState(5);
  const [stackInput, setStackInput] = useState('({[]})[]');

  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(6);
  const [startR, setStartR] = useState(0);
  const [startC, setStartC] = useState(0);
  const [blockedInput, setBlockedInput] = useState('1-1,1-2,3-4');

  const [nodeCount, setNodeCount] = useState(7);
  const [dfsStart, setDfsStart] = useState(0);
  const [edgesInput, setEdgesInput] = useState('0-1,0-2,1-3,1-4,2-5,5-6');

  const [dpN, setDpN] = useState(10);

  const [intervalsInput, setIntervalsInput] = useState('1-3,2-6,8-10,15-18');
  const [updatesInput, setUpdatesInput] = useState('1-4-2');
  const [rangeL, setRangeL] = useState(1);
  const [rangeR, setRangeR] = useState(4);
  const [heapK, setHeapK] = useState(3);
  const [dsuA, setDsuA] = useState(0);
  const [dsuB, setDsuB] = useState(1);
  const [wordsInput, setWordsInput] = useState('apple,app,apply,ape,bat');
  const [triePrefix, setTriePrefix] = useState('app');
  const [weightedEdgesInput, setWeightedEdgesInput] = useState('0-1-4,0-2-1,2-1-2,1-3-1,2-3-5,3-4-3,4-5-2');
  const [dijkstraStart, setDijkstraStart] = useState(0);

  const [activePresetId, setActivePresetId] = useState(PATTERN_PRESETS.hash_set[0]?.id ?? '');

  const pattern = patternByKey[patternKey];
  const parsedNums = useMemo(() => parseIntList(numsInput), [numsInput]);
  const activePreset = useMemo(
    () => PATTERN_PRESETS[patternKey].find((x) => x.id === activePresetId) ?? PATTERN_PRESETS[patternKey][0],
    [patternKey, activePresetId],
  );

  const applyPreset = (preset: PatternPreset) => {
    if (preset.numsInput !== undefined) setNumsInput(preset.numsInput);
    if (preset.target !== undefined) setTarget(preset.target);
    if (preset.windowK !== undefined) setWindowK(preset.windowK);
    if (preset.stackInput !== undefined) setStackInput(preset.stackInput);
    if (preset.rows !== undefined) setRows(preset.rows);
    if (preset.cols !== undefined) setCols(preset.cols);
    if (preset.startR !== undefined) setStartR(preset.startR);
    if (preset.startC !== undefined) setStartC(preset.startC);
    if (preset.blockedInput !== undefined) setBlockedInput(preset.blockedInput);
    if (preset.nodeCount !== undefined) setNodeCount(preset.nodeCount);
    if (preset.dfsStart !== undefined) setDfsStart(preset.dfsStart);
    if (preset.edgesInput !== undefined) setEdgesInput(preset.edgesInput);
    if (preset.dpN !== undefined) setDpN(preset.dpN);
    if (preset.intervalsInput !== undefined) setIntervalsInput(preset.intervalsInput);
    if (preset.updatesInput !== undefined) setUpdatesInput(preset.updatesInput);
    if (preset.rangeL !== undefined) setRangeL(preset.rangeL);
    if (preset.rangeR !== undefined) setRangeR(preset.rangeR);
    if (preset.heapK !== undefined) setHeapK(preset.heapK);
    if (preset.dsuA !== undefined) setDsuA(preset.dsuA);
    if (preset.dsuB !== undefined) setDsuB(preset.dsuB);
    if (preset.wordsInput !== undefined) setWordsInput(preset.wordsInput);
    if (preset.triePrefix !== undefined) setTriePrefix(preset.triePrefix);
    if (preset.weightedEdgesInput !== undefined) setWeightedEdgesInput(preset.weightedEdgesInput);
    if (preset.dijkstraStart !== undefined) setDijkstraStart(preset.dijkstraStart);
  };

  useEffect(() => {
    const defaultPreset = PATTERN_PRESETS[patternKey][0];
    if (!defaultPreset) return;
    setActivePresetId(defaultPreset.id);
    applyPreset(defaultPreset);
  }, [patternKey]);

  const sim = useMemo(() => {
    switch (patternKey) {
      case 'hash_set':
        return simulateHashDuplicate(parsedNums);
      case 'hash_map':
        return simulateHashFrequency(parsedNums);
      case 'two_pointers':
        return simulateTwoPointers(parsedNums, target);
      case 'sliding_window':
        return simulateSlidingWindow(parsedNums, windowK);
      case 'stack':
        return simulateStackParens(stackInput);
      case 'bfs':
        return simulateBfsGrid({ rows, cols, blocked: parseCells(blockedInput), start: [startR, startC] });
      case 'dfs':
        return simulateDfsGraph({ nodeCount, edges: parseEdges(edgesInput), start: dfsStart });
      case 'binary_search':
        return simulateBinarySearch(parsedNums, target);
      case 'dp':
        return simulateFibMemo(dpN);
      case 'prefix_difference':
        return simulatePrefixDifference(parsedNums, parseRangeUpdates(updatesInput), rangeL, rangeR);
      case 'intervals':
        return simulateIntervalsMerge(parseIntervals(intervalsInput));
      case 'heap':
        return simulateHeapTopK(parsedNums, heapK);
      case 'monotonic_queue':
        return simulateMonotonicWindowMax(parsedNums, windowK);
      case 'topological_sort':
        return simulateTopologicalSort(nodeCount, parseEdges(edgesInput));
      case 'union_find':
        return simulateUnionFind(nodeCount, parseEdges(edgesInput), dsuA, dsuB);
      case 'backtracking':
        return simulateBacktrackingSubsetSum(parsedNums, target);
      case 'trie':
        return simulateTriePrefix(parseWords(wordsInput), triePrefix);
      case 'greedy':
        return simulateGreedyIntervalScheduling(parseIntervals(intervalsInput));
      case 'dijkstra':
        return simulateDijkstra(nodeCount, parseWeightedEdges(weightedEdgesInput), dijkstraStart);
      default:
        return { steps: [], result: null };
    }
  }, [
    blockedInput,
    dfsStart,
    dijkstraStart,
    dpN,
    dsuA,
    dsuB,
    edgesInput,
    heapK,
    intervalsInput,
    nodeCount,
    numsInput,
    parsedNums,
    patternKey,
    rangeL,
    rangeR,
    rows,
    cols,
    startR,
    startC,
    stackInput,
    target,
    triePrefix,
    updatesInput,
    weightedEdgesInput,
    windowK,
    wordsInput,
  ]);

  const renderVisual = (step: Step) => {
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
      return <pre className="code-block">Frequency Map:\n{freq}</pre>;
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
  };

  return (
    <div className="page pattern-visualizer-page">
      <header className="hero">
        <h2>Pattern Visualizer</h2>
        <p>Run one pattern at a time with step animation, dual explanations, and measured runtime trend.</p>
      </header>

      <section className="panel panel-spacious pattern-setup-panel">
        <div className="panel-head">
          <h3>Pattern Setup</h3>
          <PatternPicker value={patternKey} onChange={setPatternKey} />
        </div>

        <p><strong>What it does:</strong> {pattern.whatItDoes}</p>
        <p><strong>When to use:</strong> {pattern.whenToUse}</p>
        <p><strong>Theoretical time:</strong> {pattern.timeComplexity}</p>
        <p><strong>Theoretical space:</strong> {pattern.spaceComplexity}</p>
        <p><strong>How to say it:</strong> {pattern.englishLine}</p>

        <StudyNotes invariant={pattern.invariant} pitfalls={pattern.pitfalls} edgeCases={pattern.edgeCases} />

        <label className="field">
          Example scenario
          <select
            value={activePresetId}
            onChange={(e) => {
              const presetId = e.target.value;
              const preset = PATTERN_PRESETS[patternKey].find((x) => x.id === presetId);
              if (!preset) return;
              setActivePresetId(presetId);
              applyPreset(preset);
            }}
          >
            {PATTERN_PRESETS[patternKey].map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>
        {activePreset && (
          <p className="muted">
            <strong>Scenario explanation:</strong> {activePreset.description}
          </p>
        )}

        {(patternKey === 'hash_set' || patternKey === 'hash_map') && (
          <div className="form-grid">
            <label className="field">
              {patternKey === 'hash_set' ? 'Numbers (comma-separated)' : 'Numbers to count (comma-separated)'}
              <input value={numsInput} onChange={(e) => setNumsInput(e.target.value)} />
            </label>
          </div>
        )}

        {(patternKey === 'two_pointers' || patternKey === 'binary_search' || patternKey === 'backtracking') && (
          <div className="form-grid">
            <label className="field">
              {patternKey === 'backtracking' ? 'Candidate numbers' : 'Sorted input list'}
              <input value={numsInput} onChange={(e) => setNumsInput(e.target.value)} />
            </label>
            <label className="field">
              {patternKey === 'backtracking' ? 'Target sum' : 'Target'}
              <input type="number" value={target} onChange={(e) => setTarget(Number.parseInt(e.target.value, 10) || 0)} />
            </label>
          </div>
        )}

        {(patternKey === 'sliding_window' || patternKey === 'monotonic_queue') && (
          <div className="form-grid">
            <label className="field">
              Input list
              <input value={numsInput} onChange={(e) => setNumsInput(e.target.value)} />
            </label>
            <label className="field">
              {patternKey === 'sliding_window' ? 'k (sum <= k)' : 'Window size k'}
              <input type="number" value={windowK} onChange={(e) => setWindowK(Number.parseInt(e.target.value, 10) || 0)} />
            </label>
          </div>
        )}

        {patternKey === 'heap' && (
          <div className="form-grid">
            <label className="field">
              Input list
              <input value={numsInput} onChange={(e) => setNumsInput(e.target.value)} />
            </label>
            <label className="field">
              k (top-k)
              <input type="number" value={heapK} onChange={(e) => setHeapK(Number.parseInt(e.target.value, 10) || 1)} />
            </label>
          </div>
        )}

        {patternKey === 'prefix_difference' && (
          <div className="form-grid triple">
            <label className="field wide">
              Base numbers
              <input value={numsInput} onChange={(e) => setNumsInput(e.target.value)} />
            </label>
            <label className="field wide">
              Updates l-r-delta (comma-separated)
              <input value={updatesInput} onChange={(e) => setUpdatesInput(e.target.value)} />
            </label>
            <label className="field">
              Query left
              <input type="number" value={rangeL} onChange={(e) => setRangeL(Number.parseInt(e.target.value, 10) || 0)} />
            </label>
            <label className="field">
              Query right
              <input type="number" value={rangeR} onChange={(e) => setRangeR(Number.parseInt(e.target.value, 10) || 0)} />
            </label>
          </div>
        )}

        {(patternKey === 'intervals' || patternKey === 'greedy') && (
          <label className="field">
            Intervals start-end (comma-separated)
            <input value={intervalsInput} onChange={(e) => setIntervalsInput(e.target.value)} />
          </label>
        )}

        {patternKey === 'stack' && (
          <label className="field">
            String
            <input value={stackInput} onChange={(e) => setStackInput(e.target.value)} />
          </label>
        )}

        {patternKey === 'bfs' && (
          <div className="form-grid triple">
            <label className="field">Rows<input type="number" value={rows} onChange={(e) => setRows(Number.parseInt(e.target.value, 10) || 1)} /></label>
            <label className="field">Cols<input type="number" value={cols} onChange={(e) => setCols(Number.parseInt(e.target.value, 10) || 1)} /></label>
            <label className="field">Start row<input type="number" value={startR} onChange={(e) => setStartR(Number.parseInt(e.target.value, 10) || 0)} /></label>
            <label className="field">Start col<input type="number" value={startC} onChange={(e) => setStartC(Number.parseInt(e.target.value, 10) || 0)} /></label>
            <label className="field wide">Blocked cells r-c (comma-separated)<input value={blockedInput} onChange={(e) => setBlockedInput(e.target.value)} /></label>
          </div>
        )}

        {(patternKey === 'dfs' || patternKey === 'topological_sort' || patternKey === 'union_find') && (
          <div className="form-grid triple">
            <label className="field">Node count<input type="number" value={nodeCount} onChange={(e) => setNodeCount(Number.parseInt(e.target.value, 10) || 1)} /></label>
            {patternKey === 'dfs' && (
              <label className="field">Start node<input type="number" value={dfsStart} onChange={(e) => setDfsStart(Number.parseInt(e.target.value, 10) || 0)} /></label>
            )}
            {patternKey === 'union_find' && (
              <>
                <label className="field">Query node A<input type="number" value={dsuA} onChange={(e) => setDsuA(Number.parseInt(e.target.value, 10) || 0)} /></label>
                <label className="field">Query node B<input type="number" value={dsuB} onChange={(e) => setDsuB(Number.parseInt(e.target.value, 10) || 0)} /></label>
              </>
            )}
            <label className="field wide">
              {patternKey === 'topological_sort' ? 'Directed edges u-v (comma-separated)' : 'Edges u-v (comma-separated)'}
              <input value={edgesInput} onChange={(e) => setEdgesInput(e.target.value)} />
            </label>
          </div>
        )}

        {patternKey === 'trie' && (
          <div className="form-grid">
            <label className="field">
              Words (comma-separated)
              <input value={wordsInput} onChange={(e) => setWordsInput(e.target.value)} />
            </label>
            <label className="field">
              Prefix query
              <input value={triePrefix} onChange={(e) => setTriePrefix(e.target.value)} />
            </label>
          </div>
        )}

        {patternKey === 'dijkstra' && (
          <div className="form-grid triple">
            <label className="field">Node count<input type="number" value={nodeCount} onChange={(e) => setNodeCount(Number.parseInt(e.target.value, 10) || 1)} /></label>
            <label className="field">Start node<input type="number" value={dijkstraStart} onChange={(e) => setDijkstraStart(Number.parseInt(e.target.value, 10) || 0)} /></label>
            <label className="field wide">Weighted edges u-v-w (comma-separated)<input value={weightedEdgesInput} onChange={(e) => setWeightedEdgesInput(e.target.value)} /></label>
          </div>
        )}

        {patternKey === 'dp' && (
          <label className="field">
            n
            <input type="number" value={dpN} onChange={(e) => setDpN(Number.parseInt(e.target.value, 10) || 0)} />
          </label>
        )}

        <div className="result-chip">Result: {JSON.stringify(sim.result)}</div>
      </section>

      <StepPlayer pattern={patternKey} steps={sim.steps} renderVisual={renderVisual} />
      <BenchmarkPanel pattern={patternKey} />
    </div>
  );
}
