import { useEffect, useMemo, useState } from 'react';

import { BenchmarkPanel } from '../components/BenchmarkPanel';
import { StudyNotes } from '../components/StudyNotes';
import { StepPlayer } from '../components/StepPlayer';
import { PATTERNS, patternByKey, type PatternKey } from '../data/patterns';
import {
  keyCell,
  parseCells,
  parseEdges,
  parseIntList,
  simulateBfsGrid,
  simulateBinarySearch,
  simulateDfsGraph,
  simulateFibMemo,
  simulateHashDuplicate,
  simulateHashFrequency,
  simulateSlidingWindow,
  simulateStackParens,
  simulateTwoPointers,
  type Step,
} from '../lib/algorithms';

function formatArrayViz(nums: number[], markers: Record<number, string>) {
  const fmt = (x: string | number) => String(x).padStart(4, ' ');
  const idx = `idx :${nums.map((_, i) => fmt(i)).join('')}`;
  const val = `val :${nums.map((v) => fmt(v)).join('')}`;
  const mark = `mark:${nums.map((_, i) => fmt(markers[i] ?? '')).join('')}`;
  return `${idx}\n${val}\n${mark}`;
}

function renderGrid(rows: number, cols: number, blocked: Set<string>, visited: string[], frontier: string[], start: [number, number], current: [number, number] | null) {
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
      description: 'Shows that duplicate detection works the same with negatives and zero.',
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
      description: 'All elements are identical, so one key accumulates all counts.',
      numsInput: '5,5,5,5,5',
    },
    {
      id: 'freq_with_negatives',
      label: 'Includes negatives',
      description: 'Demonstrates counting across positive, negative, and zero values.',
      numsInput: '4,-1,4,0,-1,4,2',
    },
  ],
  two_pointers: [
    {
      id: 'pair_exists',
      label: 'Pair exists',
      description: 'Sorted list contains a valid pair; pointers converge to a match.',
      numsInput: '1,2,3,4,6,8',
      target: 10,
    },
    {
      id: 'no_pair',
      label: 'No pair matches target',
      description: 'No two values hit the target, so pointers cross and return false.',
      numsInput: '1,3,5,7,9',
      target: 2,
    },
    {
      id: 'duplicate_pair',
      label: 'Uses duplicate values',
      description: 'Pair can be formed with duplicate numbers while keeping sorted order.',
      numsInput: '1,2,2,3,4,6',
      target: 4,
    },
  ],
  sliding_window: [
    {
      id: 'window_grows',
      label: 'Window expands and shrinks',
      description: 'The running sum repeatedly exceeds k, forcing shrink steps.',
      numsInput: '2,1,3,2,1,1,1',
      windowK: 5,
    },
    {
      id: 'tight_limit',
      label: 'Tight limit',
      description: 'Small threshold causes frequent shrinking and shorter windows.',
      numsInput: '4,4,1,1,1',
      windowK: 4,
    },
    {
      id: 'none_valid',
      label: 'No valid window',
      description: 'Each element is larger than k, so best valid length remains 0.',
      numsInput: '7,8,9',
      windowK: 5,
    },
  ],
  stack: [
    {
      id: 'valid_nested',
      label: 'Valid nested brackets',
      description: 'Properly nested and balanced symbols should end with an empty stack.',
      stackInput: '({[]})[]',
    },
    {
      id: 'mismatch',
      label: 'Mismatch example',
      description: 'Closing order is wrong, so a mismatch is detected mid-scan.',
      stackInput: '([)]',
    },
    {
      id: 'unfinished',
      label: 'Unfinished open brackets',
      description: 'Scan ends with leftover opens, so expression is invalid.',
      stackInput: '(([]',
    },
  ],
  bfs: [
    {
      id: 'open_grid',
      label: 'Reachable open grid',
      description: 'Most cells are reachable; queue grows by breadth-first layers.',
      rows: 5,
      cols: 6,
      startR: 0,
      startC: 0,
      blockedInput: '1-1,1-2,3-4',
    },
    {
      id: 'narrow_paths',
      label: 'Narrow paths',
      description: 'Walls create corridors, making frontier expansion more constrained.',
      rows: 5,
      cols: 5,
      startR: 0,
      startC: 0,
      blockedInput: '0-2,1-2,2-2,3-1,3-3',
    },
    {
      id: 'blocked_start',
      label: 'Blocked start edge case',
      description: 'Start position is blocked, so traversal returns immediately.',
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
      description: 'Only the start node component is visited; others stay unseen.',
      nodeCount: 8,
      dfsStart: 3,
      edgesInput: '0-1,1-2,3-4,4-5,6-7',
    },
    {
      id: 'with_cycle',
      label: 'Graph with cycle',
      description: 'Cycle requires visited checks to avoid infinite recursion.',
      nodeCount: 6,
      dfsStart: 0,
      edgesInput: '0-1,1-2,2-3,3-1,3-4,4-5',
    },
  ],
  binary_search: [
    {
      id: 'target_found',
      label: 'Target found',
      description: 'Target exists exactly; lower-bound search lands on matching index.',
      numsInput: '1,3,5,7,9,11',
      target: 7,
    },
    {
      id: 'lower_bound',
      label: 'Target missing (lower bound)',
      description: 'Target is absent, so result is insertion index for sorted order.',
      numsInput: '1,3,5,7,9,11',
      target: 8,
    },
    {
      id: 'duplicates',
      label: 'Many duplicates',
      description: 'Shows lower-bound behavior: returns first index of target duplicates.',
      numsInput: '1,2,2,2,4,5',
      target: 2,
    },
  ],
  dp: [
    {
      id: 'small_n',
      label: 'Small n',
      description: 'Few subproblems; easy to see memo hits and base cases.',
      dpN: 5,
    },
    {
      id: 'medium_n',
      label: 'Medium n',
      description: 'Memoization effect is clearer with more repeated subproblems.',
      dpN: 10,
    },
    {
      id: 'larger_n',
      label: 'Larger n',
      description: 'State count grows, but each state is still solved once.',
      dpN: 20,
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
      default:
        return { steps: [], result: null };
    }
  }, [patternKey, parsedNums, target, windowK, stackInput, rows, cols, blockedInput, startR, startC, nodeCount, edgesInput, dfsStart, dpN]);

  const renderVisual = (step: Step) => {
    if (patternKey === 'two_pointers') {
      const markers: Record<number, string> = {};
      if (typeof step.left === 'number') markers[step.left] = 'L';
      if (typeof step.right === 'number') markers[step.right] = 'R';
      return <pre className="code-block">{formatArrayViz(parsedNums, markers)}</pre>;
    }

    if (patternKey === 'sliding_window') {
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
          <select value={patternKey} onChange={(e) => setPatternKey(e.target.value as PatternKey)}>
            {PATTERNS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.name}
              </option>
            ))}
          </select>
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

        {(patternKey === 'two_pointers' || patternKey === 'binary_search') && (
          <div className="form-grid">
            <label className="field">
              Sorted input list
              <input value={numsInput} onChange={(e) => setNumsInput(e.target.value)} />
            </label>
            <label className="field">
              Target
              <input type="number" value={target} onChange={(e) => setTarget(Number.parseInt(e.target.value, 10) || 0)} />
            </label>
          </div>
        )}

        {patternKey === 'sliding_window' && (
          <div className="form-grid">
            <label className="field">
              Positive input list
              <input value={numsInput} onChange={(e) => setNumsInput(e.target.value)} />
            </label>
            <label className="field">
              k (sum &lt;= k)
              <input type="number" value={windowK} onChange={(e) => setWindowK(Number.parseInt(e.target.value, 10) || 0)} />
            </label>
          </div>
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

        {patternKey === 'dfs' && (
          <div className="form-grid triple">
            <label className="field">Node count<input type="number" value={nodeCount} onChange={(e) => setNodeCount(Number.parseInt(e.target.value, 10) || 1)} /></label>
            <label className="field">Start node<input type="number" value={dfsStart} onChange={(e) => setDfsStart(Number.parseInt(e.target.value, 10) || 0)} /></label>
            <label className="field wide">Edges u-v (comma-separated)<input value={edgesInput} onChange={(e) => setEdgesInput(e.target.value)} /></label>
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
