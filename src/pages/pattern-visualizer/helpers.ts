import {
  keyCell,
  parseCells,
  parseEdges,
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
} from '../../lib/algorithms';
import type { PatternPreset, PatternSimulationInput, PatternVisualizerState } from './types';

export function formatArrayViz(nums: number[], markers: Record<number, string>) {
  const fmt = (x: string | number) => String(x).padStart(4, ' ');
  const idx = `idx :${nums.map((_, i) => fmt(i)).join('')}`;
  const val = `val :${nums.map((v) => fmt(v)).join('')}`;
  const mark = `mark:${nums.map((_, i) => fmt(markers[i] ?? '')).join('')}`;
  return `${idx}\n${val}\n${mark}`;
}

export function renderGrid(
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

export function applyPresetToState(
  state: PatternVisualizerState,
  preset: PatternPreset,
  presetId: string,
): PatternVisualizerState {
  return {
    ...state,
    activePresetId: presetId,
    numsInput: preset.numsInput ?? state.numsInput,
    target: preset.target ?? state.target,
    windowK: preset.windowK ?? state.windowK,
    stackInput: preset.stackInput ?? state.stackInput,
    rows: preset.rows ?? state.rows,
    cols: preset.cols ?? state.cols,
    startR: preset.startR ?? state.startR,
    startC: preset.startC ?? state.startC,
    blockedInput: preset.blockedInput ?? state.blockedInput,
    nodeCount: preset.nodeCount ?? state.nodeCount,
    dfsStart: preset.dfsStart ?? state.dfsStart,
    edgesInput: preset.edgesInput ?? state.edgesInput,
    dpN: preset.dpN ?? state.dpN,
    intervalsInput: preset.intervalsInput ?? state.intervalsInput,
    updatesInput: preset.updatesInput ?? state.updatesInput,
    rangeL: preset.rangeL ?? state.rangeL,
    rangeR: preset.rangeR ?? state.rangeR,
    heapK: preset.heapK ?? state.heapK,
    dsuA: preset.dsuA ?? state.dsuA,
    dsuB: preset.dsuB ?? state.dsuB,
    wordsInput: preset.wordsInput ?? state.wordsInput,
    triePrefix: preset.triePrefix ?? state.triePrefix,
    weightedEdgesInput: preset.weightedEdgesInput ?? state.weightedEdgesInput,
    dijkstraStart: preset.dijkstraStart ?? state.dijkstraStart,
  };
}

export function simulatePattern(input: PatternSimulationInput) {
  switch (input.patternKey) {
    case 'hash_set':
      return simulateHashDuplicate(input.parsedNums);
    case 'hash_map':
      return simulateHashFrequency(input.parsedNums);
    case 'two_pointers':
      return simulateTwoPointers(input.parsedNums, input.target);
    case 'sliding_window':
      return simulateSlidingWindow(input.parsedNums, input.windowK);
    case 'stack':
      return simulateStackParens(input.stackInput);
    case 'bfs':
      return simulateBfsGrid({
        rows: input.rows,
        cols: input.cols,
        blocked: parseCells(input.blockedInput),
        start: [input.startR, input.startC],
      });
    case 'dfs':
      return simulateDfsGraph({
        nodeCount: input.nodeCount,
        edges: parseEdges(input.edgesInput),
        start: input.dfsStart,
      });
    case 'binary_search':
      return simulateBinarySearch(input.parsedNums, input.target);
    case 'dp':
      return simulateFibMemo(input.dpN);
    case 'prefix_difference':
      return simulatePrefixDifference(
        input.parsedNums,
        parseRangeUpdates(input.updatesInput),
        input.rangeL,
        input.rangeR,
      );
    case 'intervals':
      return simulateIntervalsMerge(parseIntervals(input.intervalsInput));
    case 'heap':
      return simulateHeapTopK(input.parsedNums, input.heapK);
    case 'monotonic_queue':
      return simulateMonotonicWindowMax(input.parsedNums, input.windowK);
    case 'topological_sort':
      return simulateTopologicalSort(input.nodeCount, parseEdges(input.edgesInput));
    case 'union_find':
      return simulateUnionFind(input.nodeCount, parseEdges(input.edgesInput), input.dsuA, input.dsuB);
    case 'backtracking':
      return simulateBacktrackingSubsetSum(input.parsedNums, input.target);
    case 'trie':
      return simulateTriePrefix(parseWords(input.wordsInput), input.triePrefix);
    case 'greedy':
      return simulateGreedyIntervalScheduling(parseIntervals(input.intervalsInput));
    case 'dijkstra':
      return simulateDijkstra(
        input.nodeCount,
        parseWeightedEdges(input.weightedEdgesInput),
        input.dijkstraStart,
      );
    default:
      return { steps: [], result: null };
  }
}
