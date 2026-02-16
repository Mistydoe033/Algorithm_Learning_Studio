import type { PatternKey } from '../../data/patterns';
import type { Step } from '../../lib/algorithms';

export interface PatternPreset {
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

export interface PatternVisualizerState {
  patternKey: PatternKey;
  numsInput: string;
  target: number;
  windowK: number;
  stackInput: string;
  rows: number;
  cols: number;
  startR: number;
  startC: number;
  blockedInput: string;
  nodeCount: number;
  dfsStart: number;
  edgesInput: string;
  dpN: number;
  intervalsInput: string;
  updatesInput: string;
  rangeL: number;
  rangeR: number;
  heapK: number;
  dsuA: number;
  dsuB: number;
  wordsInput: string;
  triePrefix: string;
  weightedEdgesInput: string;
  dijkstraStart: number;
  activePresetId: string;
}

export type PatternVisualizerTextField =
  | 'numsInput'
  | 'stackInput'
  | 'blockedInput'
  | 'edgesInput'
  | 'intervalsInput'
  | 'updatesInput'
  | 'wordsInput'
  | 'triePrefix'
  | 'weightedEdgesInput';

export type PatternVisualizerNumberField =
  | 'target'
  | 'windowK'
  | 'rows'
  | 'cols'
  | 'startR'
  | 'startC'
  | 'nodeCount'
  | 'dfsStart'
  | 'dpN'
  | 'rangeL'
  | 'rangeR'
  | 'heapK'
  | 'dsuA'
  | 'dsuB'
  | 'dijkstraStart';

export interface PatternSimulationInput {
  patternKey: PatternKey;
  parsedNums: number[];
  target: number;
  windowK: number;
  stackInput: string;
  rows: number;
  cols: number;
  blockedInput: string;
  startR: number;
  startC: number;
  nodeCount: number;
  dfsStart: number;
  edgesInput: string;
  dpN: number;
  updatesInput: string;
  rangeL: number;
  rangeR: number;
  intervalsInput: string;
  heapK: number;
  dsuA: number;
  dsuB: number;
  wordsInput: string;
  triePrefix: string;
  weightedEdgesInput: string;
  dijkstraStart: number;
}

export interface PatternVisualRenderInput {
  patternKey: PatternKey;
  step: Step;
  parsedNums: number[];
  blockedInput: string;
  rows: number;
  cols: number;
  startR: number;
  startC: number;
}
