import { useCallback, useEffect, useMemo, useReducer } from 'react';

import { patternByKey, type PatternKey } from '../../data/patterns';
import { parseIntList } from '../../lib/algorithms';
import { DEFAULT_PATTERN_VISUALIZER_STATE, PATTERN_PRESETS } from './consts';
import { applyPresetToState, simulatePattern } from './helpers';
import type {
  PatternPreset,
  PatternVisualizerNumberField,
  PatternVisualizerState,
  PatternVisualizerTextField,
} from './types';

type PatternVisualizerAction =
  | { type: 'set_pattern'; patternKey: PatternKey }
  | { type: 'set_text'; field: PatternVisualizerTextField; value: string }
  | { type: 'set_number'; field: PatternVisualizerNumberField; value: number }
  | { type: 'apply_preset'; preset: PatternPreset; presetId: string };

function reducer(state: PatternVisualizerState, action: PatternVisualizerAction): PatternVisualizerState {
  switch (action.type) {
    case 'set_pattern':
      return { ...state, patternKey: action.patternKey };
    case 'set_text':
      return { ...state, [action.field]: action.value };
    case 'set_number':
      return { ...state, [action.field]: action.value };
    case 'apply_preset':
      return applyPresetToState(state, action.preset, action.presetId);
    default:
      return state;
  }
}

export function usePatternVisualizerController() {
  const [state, dispatch] = useReducer(reducer, DEFAULT_PATTERN_VISUALIZER_STATE);

  const pattern = patternByKey[state.patternKey];
  const presets = PATTERN_PRESETS[state.patternKey];
  const parsedNums = useMemo(() => parseIntList(state.numsInput), [state.numsInput]);

  const activePreset = useMemo(
    () => presets.find((preset) => preset.id === state.activePresetId) ?? presets[0],
    [presets, state.activePresetId],
  );

  const sim = useMemo(
    () => simulatePattern({
      patternKey: state.patternKey,
      parsedNums,
      target: state.target,
      windowK: state.windowK,
      stackInput: state.stackInput,
      rows: state.rows,
      cols: state.cols,
      blockedInput: state.blockedInput,
      startR: state.startR,
      startC: state.startC,
      nodeCount: state.nodeCount,
      dfsStart: state.dfsStart,
      edgesInput: state.edgesInput,
      dpN: state.dpN,
      updatesInput: state.updatesInput,
      rangeL: state.rangeL,
      rangeR: state.rangeR,
      intervalsInput: state.intervalsInput,
      heapK: state.heapK,
      dsuA: state.dsuA,
      dsuB: state.dsuB,
      wordsInput: state.wordsInput,
      triePrefix: state.triePrefix,
      weightedEdgesInput: state.weightedEdgesInput,
      dijkstraStart: state.dijkstraStart,
    }),
    [parsedNums, state],
  );

  useEffect(() => {
    const defaultPreset = PATTERN_PRESETS[state.patternKey][0];
    if (!defaultPreset) return;
    dispatch({ type: 'apply_preset', preset: defaultPreset, presetId: defaultPreset.id });
  }, [state.patternKey]);

  const setPatternKey = useCallback((patternKey: PatternKey) => {
    dispatch({ type: 'set_pattern', patternKey });
  }, []);

  const setTextField = useCallback((field: PatternVisualizerTextField, value: string) => {
    dispatch({ type: 'set_text', field, value });
  }, []);

  const setNumberField = useCallback((field: PatternVisualizerNumberField, value: number) => {
    dispatch({ type: 'set_number', field, value });
  }, []);

  const selectPreset = useCallback(
    (presetId: string) => {
      const preset = PATTERN_PRESETS[state.patternKey].find((x) => x.id === presetId);
      if (!preset) return;
      dispatch({ type: 'apply_preset', preset, presetId });
    },
    [state.patternKey],
  );

  return {
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
  };
}
