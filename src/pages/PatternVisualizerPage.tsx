import { BenchmarkPanel } from '../components/BenchmarkPanel';
import { PatternPicker } from '../components/PatternPicker';
import { StudyNotes } from '../components/StudyNotes';
import { StepPlayer } from '../components/StepPlayer';
import { renderPatternStepVisual } from './pattern-visualizer/render';
import { usePatternVisualizerController } from './pattern-visualizer/usePatternVisualizerController';

export function PatternVisualizerPage() {
  const {
    state,
    pattern,
    presets,
    activePreset,
    parsedNums,
    sim,
    setPatternKey,
    setTextField,
    setNumberField,
    selectPreset,
  } = usePatternVisualizerController();

  const {
    patternKey,
    numsInput,
    target,
    windowK,
    stackInput,
    rows,
    cols,
    startR,
    startC,
    blockedInput,
    nodeCount,
    dfsStart,
    edgesInput,
    dpN,
    intervalsInput,
    updatesInput,
    rangeL,
    rangeR,
    heapK,
    dsuA,
    dsuB,
    wordsInput,
    triePrefix,
    weightedEdgesInput,
    dijkstraStart,
    activePresetId,
  } = state;

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
          <select value={activePresetId} onChange={(e) => selectPreset(e.target.value)}>
            {presets.map((preset) => (
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
              <input value={numsInput} onChange={(e) => setTextField('numsInput', e.target.value)} />
            </label>
          </div>
        )}

        {(patternKey === 'two_pointers' || patternKey === 'binary_search' || patternKey === 'backtracking') && (
          <div className="form-grid">
            <label className="field">
              {patternKey === 'backtracking' ? 'Candidate numbers' : 'Sorted input list'}
              <input value={numsInput} onChange={(e) => setTextField('numsInput', e.target.value)} />
            </label>
            <label className="field">
              {patternKey === 'backtracking' ? 'Target sum' : 'Target'}
              <input
                type="number"
                value={target}
                onChange={(e) => setNumberField('target', Number.parseInt(e.target.value, 10) || 0)}
              />
            </label>
          </div>
        )}

        {(patternKey === 'sliding_window' || patternKey === 'monotonic_queue') && (
          <div className="form-grid">
            <label className="field">
              Input list
              <input value={numsInput} onChange={(e) => setTextField('numsInput', e.target.value)} />
            </label>
            <label className="field">
              {patternKey === 'sliding_window' ? 'k (sum <= k)' : 'Window size k'}
              <input
                type="number"
                value={windowK}
                onChange={(e) => setNumberField('windowK', Number.parseInt(e.target.value, 10) || 0)}
              />
            </label>
          </div>
        )}

        {patternKey === 'heap' && (
          <div className="form-grid">
            <label className="field">
              Input list
              <input value={numsInput} onChange={(e) => setTextField('numsInput', e.target.value)} />
            </label>
            <label className="field">
              k (top-k)
              <input
                type="number"
                value={heapK}
                onChange={(e) => setNumberField('heapK', Number.parseInt(e.target.value, 10) || 1)}
              />
            </label>
          </div>
        )}

        {patternKey === 'prefix_difference' && (
          <div className="form-grid triple">
            <label className="field wide">
              Base numbers
              <input value={numsInput} onChange={(e) => setTextField('numsInput', e.target.value)} />
            </label>
            <label className="field wide">
              Updates l-r-delta (comma-separated)
              <input value={updatesInput} onChange={(e) => setTextField('updatesInput', e.target.value)} />
            </label>
            <label className="field">
              Query left
              <input
                type="number"
                value={rangeL}
                onChange={(e) => setNumberField('rangeL', Number.parseInt(e.target.value, 10) || 0)}
              />
            </label>
            <label className="field">
              Query right
              <input
                type="number"
                value={rangeR}
                onChange={(e) => setNumberField('rangeR', Number.parseInt(e.target.value, 10) || 0)}
              />
            </label>
          </div>
        )}

        {(patternKey === 'intervals' || patternKey === 'greedy') && (
          <label className="field">
            Intervals start-end (comma-separated)
            <input value={intervalsInput} onChange={(e) => setTextField('intervalsInput', e.target.value)} />
          </label>
        )}

        {patternKey === 'stack' && (
          <label className="field">
            String
            <input value={stackInput} onChange={(e) => setTextField('stackInput', e.target.value)} />
          </label>
        )}

        {patternKey === 'bfs' && (
          <div className="form-grid triple">
            <label className="field">
              Rows
              <input
                type="number"
                value={rows}
                onChange={(e) => setNumberField('rows', Number.parseInt(e.target.value, 10) || 1)}
              />
            </label>
            <label className="field">
              Cols
              <input
                type="number"
                value={cols}
                onChange={(e) => setNumberField('cols', Number.parseInt(e.target.value, 10) || 1)}
              />
            </label>
            <label className="field">
              Start row
              <input
                type="number"
                value={startR}
                onChange={(e) => setNumberField('startR', Number.parseInt(e.target.value, 10) || 0)}
              />
            </label>
            <label className="field">
              Start col
              <input
                type="number"
                value={startC}
                onChange={(e) => setNumberField('startC', Number.parseInt(e.target.value, 10) || 0)}
              />
            </label>
            <label className="field wide">
              Blocked cells r-c (comma-separated)
              <input value={blockedInput} onChange={(e) => setTextField('blockedInput', e.target.value)} />
            </label>
          </div>
        )}

        {(patternKey === 'dfs' || patternKey === 'topological_sort' || patternKey === 'union_find') && (
          <div className="form-grid triple">
            <label className="field">
              Node count
              <input
                type="number"
                value={nodeCount}
                onChange={(e) => setNumberField('nodeCount', Number.parseInt(e.target.value, 10) || 1)}
              />
            </label>
            {patternKey === 'dfs' && (
              <label className="field">
                Start node
                <input
                  type="number"
                  value={dfsStart}
                  onChange={(e) => setNumberField('dfsStart', Number.parseInt(e.target.value, 10) || 0)}
                />
              </label>
            )}
            {patternKey === 'union_find' && (
              <>
                <label className="field">
                  Query node A
                  <input
                    type="number"
                    value={dsuA}
                    onChange={(e) => setNumberField('dsuA', Number.parseInt(e.target.value, 10) || 0)}
                  />
                </label>
                <label className="field">
                  Query node B
                  <input
                    type="number"
                    value={dsuB}
                    onChange={(e) => setNumberField('dsuB', Number.parseInt(e.target.value, 10) || 0)}
                  />
                </label>
              </>
            )}
            <label className="field wide">
              {patternKey === 'topological_sort' ? 'Directed edges u-v (comma-separated)' : 'Edges u-v (comma-separated)'}
              <input value={edgesInput} onChange={(e) => setTextField('edgesInput', e.target.value)} />
            </label>
          </div>
        )}

        {patternKey === 'trie' && (
          <div className="form-grid">
            <label className="field">
              Words (comma-separated)
              <input value={wordsInput} onChange={(e) => setTextField('wordsInput', e.target.value)} />
            </label>
            <label className="field">
              Prefix query
              <input value={triePrefix} onChange={(e) => setTextField('triePrefix', e.target.value)} />
            </label>
          </div>
        )}

        {patternKey === 'dijkstra' && (
          <div className="form-grid triple">
            <label className="field">
              Node count
              <input
                type="number"
                value={nodeCount}
                onChange={(e) => setNumberField('nodeCount', Number.parseInt(e.target.value, 10) || 1)}
              />
            </label>
            <label className="field">
              Start node
              <input
                type="number"
                value={dijkstraStart}
                onChange={(e) => setNumberField('dijkstraStart', Number.parseInt(e.target.value, 10) || 0)}
              />
            </label>
            <label className="field wide">
              Weighted edges u-v-w (comma-separated)
              <input value={weightedEdgesInput} onChange={(e) => setTextField('weightedEdgesInput', e.target.value)} />
            </label>
          </div>
        )}

        {patternKey === 'dp' && (
          <label className="field">
            n
            <input type="number" value={dpN} onChange={(e) => setNumberField('dpN', Number.parseInt(e.target.value, 10) || 0)} />
          </label>
        )}

        <div className="result-chip">Result: {JSON.stringify(sim.result)}</div>
      </section>

      <StepPlayer
        pattern={patternKey}
        steps={sim.steps}
        renderVisual={(step) => renderPatternStepVisual({
          patternKey,
          step,
          parsedNums,
          blockedInput,
          rows,
          cols,
          startR,
          startC,
        })}
      />
      <BenchmarkPanel pattern={patternKey} />
    </div>
  );
}
