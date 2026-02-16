import type { FormEvent } from 'react';

import { StudyAuthSection } from './study-lab/components/StudyAuthSection';
import { InteractiveQuizSection } from './study-lab/components/InteractiveQuizSection';
import { useStudyLabController } from './study-lab/useStudyLabController';

export function StudyLabPage() {
  const { viewModel, actions } = useStudyLabController();

  const handleAuthSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void actions.submitAuth();
  };

  return (
    <div className="page">
      <header className="hero">
        <h2>Study Lab</h2>
        <p>Pattern summary + quiz mode. Use this page to test recognition and explanation speed.</p>
      </header>

      <StudyAuthSection viewModel={viewModel} actions={actions} onSubmit={handleAuthSubmit} />
      <InteractiveQuizSection viewModel={viewModel} actions={actions} />
    </div>
  );
}
