import type { QuizFeedbackProps } from './types';

export function QuizFeedback({ question, checked, isCorrect }: QuizFeedbackProps) {
  return (
    <div className={`quiz-feedback quiz-feedback-block ${checked ? (isCorrect ? 'ok' : 'bad') : 'ok'}`}>
      {checked && <p className="quiz-feedback-status">{isCorrect ? 'Correct.' : 'Not quite.'}</p>}
      <p className="quiz-feedback-answer"><strong>Correct answer:</strong> {question.correct}</p>
      <p className="quiz-feedback-heading"><strong>Why it&apos;s correct:</strong></p>
      <div className="quiz-feedback-section">
        <p className="quiz-feedback-section-title"><strong>Plain-English:</strong></p>
        <ul className="quiz-feedback-list">
          {question.explanation.plain.map((point, i) => (
            <li key={`${question.id}_plain_${i}`}>{point}</li>
          ))}
        </ul>
      </div>
      <div className="quiz-feedback-section">
        <p className="quiz-feedback-section-title"><strong>Technical reasoning:</strong></p>
        <ul className="quiz-feedback-list">
          {question.explanation.technical.map((point, i) => (
            <li key={`${question.id}_tech_${i}`}>{point}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
