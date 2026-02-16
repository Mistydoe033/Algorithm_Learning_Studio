import type { FormEvent } from 'react';

import type { QuizQuestion, StudyLabActions, StudyLabViewModel } from '../types';

export interface StudyAuthSectionProps {
  viewModel: StudyLabViewModel;
  actions: StudyLabActions;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export interface InteractiveQuizSectionProps {
  viewModel: StudyLabViewModel;
  actions: StudyLabActions;
}

export interface QuizFeedbackProps {
  question: QuizQuestion;
  checked: boolean;
  isCorrect: boolean;
}
