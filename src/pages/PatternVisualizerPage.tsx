import { useMemo, useState } from 'react';

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

export function PatternVisualizerPage() {
  const [patternKey, setPatternKey] = useState<PatternKey>('hash_lookup');
  const [hashMode, setHashMode] = useState<'duplicate' | 'frequency'>('duplicate');

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

  const pattern = patternByKey[patternKey];
  const parsedNums = useMemo(() => parseIntList(numsInput), [numsInput]);

  const sim = useMemo(() => {
    switch (patternKey) {
      case 'hash_lookup':
        return hashMode === 'duplicate' ? simulateHashDuplicate(parsedNums) : simulateHashFrequency(parsedNums);
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
  }, [patternKey, hashMode, parsedNums, target, windowK, stackInput, rows, cols, blockedInput, startR, startC, nodeCount, edgesInput, dfsStart, dpN]);

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

    if (patternKey === 'hash_lookup') {
      const seen = Array.isArray(step.seen) ? step.seen.join(', ') : '(n/a)';
      return <p>Seen: {seen}</p>;
    }

    return null;
  };

  return (
    <div className="page">
      <header className="hero">
        <h2>Pattern Visualizer</h2>
        <p>Run one pattern at a time with step animation, dual explanations, and measured runtime trend.</p>
      </header>

      <section className="panel">
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

        {patternKey === 'hash_lookup' && (
          <div className="form-grid">
            <label className="field">
              Hash Mode
              <select value={hashMode} onChange={(e) => setHashMode(e.target.value as 'duplicate' | 'frequency')}>
                <option value="duplicate">First Duplicate</option>
                <option value="frequency">Frequency Count</option>
              </select>
            </label>
            <label className="field">
              Input list (comma-separated)
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
