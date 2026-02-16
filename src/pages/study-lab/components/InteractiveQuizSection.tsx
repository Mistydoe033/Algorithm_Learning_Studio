import { PatternPicker } from '../../../components/PatternPicker';
import { DIFFICULTY_ORDER } from '../consts';
import { categoryToLabel } from '../helpers';
import { QuizFeedback } from './QuizFeedback';
import type { InteractiveQuizSectionProps } from './types';

export function InteractiveQuizSection({ viewModel, actions }: InteractiveQuizSectionProps) {
  const {
    state,
    patternName,
    patternWhenToUse,
    activeMechanic,
    activeWeakFit,
    questions,
    followUpQuestion,
    answeredCount,
    score,
    percent,
    grade,
    weakAreaRows,
    termHelpRows,
    cumulativeAccuracy,
  } = viewModel;
  const {
    patternKey,
    difficulty,
    answers,
    checked,
    showAnswers,
    followUpAnswer,
    followUpChecked,
    quizAttempts,
  } = state;

  return (
    <section className="panel panel-spacious study-quiz-panel">
      <div className="panel-head study-quiz-head">
        <h3>Interactive Quiz</h3>
        <div className="quiz-pattern-control">
          <span className="quiz-pattern-tag">Pattern:</span>
          <PatternPicker value={patternKey} onChange={actions.setPatternKey} />
        </div>
      </div>

      <div className="row gap-sm study-difficulty-row">
        {DIFFICULTY_ORDER.map((level) => (
          <button
            key={level}
            className={`btn ${difficulty === level ? 'primary' : ''}`}
            type="button"
            onClick={() => actions.setDifficulty(level)}
          >
            {level[0]?.toUpperCase() + level.slice(1)}
          </button>
        ))}
        <button className={`btn ${showAnswers ? 'primary' : ''}`} type="button" onClick={actions.toggleShowAnswers}>
          {showAnswers ? 'Hide Answers' : 'Show Answers'}
        </button>
      </div>

      <p className="muted quiz-progress">
        Difficulty: <strong>{difficulty}</strong> | Answered {answeredCount}/{questions.length} | Lifetime attempts: {quizAttempts} | Cumulative accuracy: {cumulativeAccuracy}%.
      </p>

      <article className="card study-pattern-fit-card">
        <h4>Pattern Fit Guide</h4>
        <p><strong>Use when:</strong> {patternWhenToUse}</p>
        <p><strong>Avoid when:</strong> {activeWeakFit}</p>
        {showAnswers && <p className="muted"><strong>Core mechanic:</strong> {activeMechanic}</p>}
      </article>

      <article className="card">
        <h4>Term Help (Plain English)</h4>
        <div className="glossary-grid">
          {termHelpRows.map((row) => (
            <div key={row.term} className="card glossary-card">
              <h4>{row.term}</h4>
              <p>{row.plain}</p>
            </div>
          ))}
        </div>
      </article>

      {questions.map((question, idx) => {
        const selected = answers[question.id] ?? '';
        const isCorrect = selected === question.correct;
        const showCorrectOutlines = checked || showAnswers;
        const showExplanation = checked || showAnswers;
        return (
          <article key={question.id} className="card quiz-question-card">
            <h4 className="quiz-question-title">{idx + 1}) {question.prompt}</h4>
            <p className="muted quiz-question-meta">Category: {categoryToLabel(question.category)}</p>
            <div className="quiz-option-grid" role="radiogroup" aria-label={question.prompt}>
              {question.options.map((option) => {
                const selectedClass = selected === option ? 'selected' : '';
                const gradedClass =
                  showCorrectOutlines && option === question.correct
                    ? 'correct'
                    : checked && selected === option && option !== question.correct
                      ? 'wrong'
                      : '';
                return (
                  <button
                    key={option}
                    className={`quiz-option-card ${selectedClass} ${gradedClass}`.trim()}
                    type="button"
                    onClick={() => actions.setAnswer(question.id, option)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {showExplanation && (
              <QuizFeedback question={question} checked={checked} isCorrect={isCorrect} />
            )}
          </article>
        );
      })}

      <div className="row gap-sm study-quiz-actions">
        <button className="btn primary" type="button" disabled={answeredCount < questions.length} onClick={actions.checkAnswers}>
          Check Answers
        </button>
        <button className="btn" type="button" onClick={actions.resetQuiz}>
          Reset
        </button>
      </div>

      {answeredCount < questions.length && <p className="muted">Complete all questions to enable scoring.</p>}

      {checked && (
        <article className="card study-quiz-result">
          <h4>
            Score: {score}/{questions.length} ({percent}%)
          </h4>
          <p><strong>Grade:</strong> {grade}</p>
          <p><strong>Pattern:</strong> {patternName}</p>
          <p><strong>Cumulative Accuracy:</strong> {cumulativeAccuracy}%</p>
        </article>
      )}

      <article className="card study-weak-card">
        <h4>Weak Area Tracker</h4>
        <p className="muted">Miss counts are tracked per pattern/category and used for follow-up practice.</p>
        <ul>
          {weakAreaRows.map((row) => (
            <li key={row.category}>
              <strong>{categoryToLabel(row.category)}</strong>: {row.misses}
            </li>
          ))}
        </ul>
      </article>

      {checked && followUpQuestion && (
        <article className="card study-followup-card">
          <h4>Targeted Follow-up: {categoryToLabel(followUpQuestion.category)}</h4>
          <p className="quiz-followup-prompt">{followUpQuestion.prompt}</p>
          <div className="quiz-option-grid" role="radiogroup" aria-label="Targeted Follow-up">
            {followUpQuestion.options.map((option) => {
              const selectedClass = followUpAnswer === option ? 'selected' : '';
              const showFollowUpCorrectOutlines = followUpChecked || showAnswers;
              const gradedClass =
                showFollowUpCorrectOutlines && option === followUpQuestion.correct
                  ? 'correct'
                  : followUpChecked && followUpAnswer === option && option !== followUpQuestion.correct
                    ? 'wrong'
                    : '';
              return (
                <button
                  key={option}
                  className={`quiz-option-card ${selectedClass} ${gradedClass}`.trim()}
                  type="button"
                  onClick={() => actions.setFollowUpAnswer(option)}
                >
                  {option}
                </button>
              );
            })}
          </div>
          <div className="row gap-sm study-quiz-actions">
            <button className="btn primary" type="button" disabled={!followUpAnswer} onClick={actions.checkFollowUp}>
              Check Follow-up
            </button>
            <button className="btn" type="button" onClick={actions.nextFollowUp}>
              New Follow-up
            </button>
          </div>
          {(followUpChecked || showAnswers) && (
            <QuizFeedback
              question={followUpQuestion}
              checked={followUpChecked}
              isCorrect={followUpAnswer === followUpQuestion.correct}
            />
          )}
        </article>
      )}
    </section>
  );
}
