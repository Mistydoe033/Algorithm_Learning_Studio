interface Props {
  invariant: string;
  pitfalls: string[];
  edgeCases: string[];
}

export function StudyNotes({ invariant, pitfalls, edgeCases }: Props) {
  return (
    <article className="card">
      <h4>Study Notes</h4>
      <p>
        <strong>Invariant:</strong> {invariant}
      </p>
      <p>
        <strong>Pitfalls:</strong> {pitfalls.join(', ')}
      </p>
      <p>
        <strong>Edge cases:</strong> {edgeCases.join(', ')}
      </p>
    </article>
  );
}
