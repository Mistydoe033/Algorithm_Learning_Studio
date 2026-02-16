import { useMemo, useState } from 'react';

import { PATTERNS, patternByKey, type PatternKey } from '../data/patterns';

interface PatternPickerProps {
  value: PatternKey;
  onChange: (key: PatternKey) => void;
  label?: string;
}

export function PatternPicker({ value, onChange, label }: PatternPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const current = patternByKey[value];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PATTERNS;
    return PATTERNS.filter((pattern) => {
      const haystack = `${pattern.name} ${pattern.whenToUse} ${pattern.whatItDoes}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);

  return (
    <div className="pattern-picker">
      {label && <span className="pattern-picker-label">{label}</span>}
      <button
        className="pattern-picker-trigger"
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="pattern-picker-title">{current.name}</span>
        <span className="pattern-picker-meta">{PATTERNS.length} patterns</span>
      </button>

      {open && (
        <div className="pattern-picker-menu">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search patterns..."
            className="pattern-picker-search"
            autoFocus
          />
          <div className="pattern-picker-list" role="listbox" aria-label="Pattern list">
            {filtered.map((pattern) => (
              <button
                key={pattern.key}
                className={`pattern-picker-option ${pattern.key === value ? 'active' : ''}`}
                type="button"
                onClick={() => {
                  onChange(pattern.key);
                  setOpen(false);
                  setQuery('');
                }}
                role="option"
                aria-selected={pattern.key === value}
              >
                <strong>{pattern.name}</strong>
                <span>{pattern.whenToUse}</span>
              </button>
            ))}
            {filtered.length === 0 && <p className="muted pattern-picker-empty">No patterns match your search.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
