import type { StudyAuthSectionProps } from './types';

export function StudyAuthSection({ viewModel, actions, onSubmit }: StudyAuthSectionProps) {
  const {
    state,
    cumulativeAccuracy,
    syncLabel,
  } = viewModel;
  const {
    user,
    authMode,
    username,
    password,
    authLoading,
    authError,
    authInfo,
    token,
    syncError,
    quizAttempts,
    totalCorrect,
    totalQuestions,
  } = state;

  return (
    <section className="panel study-auth-panel">
      <div className="panel-head">
        <h3>Study Account</h3>
        {user ? <span className="quiz-pattern-tag">Signed in: {user.username}</span> : <span className="muted">Sign in to sync your progress</span>}
      </div>

      {!user && (
        <form className="auth-form" onSubmit={onSubmit}>
          <div className="row gap-sm auth-mode-row">
            <button
              className={`btn ${authMode === 'login' ? 'primary' : ''}`}
              type="button"
              onClick={() => actions.setAuthMode('login')}
            >
              Login
            </button>
            <button
              className={`btn ${authMode === 'register' ? 'primary' : ''}`}
              type="button"
              onClick={() => actions.setAuthMode('register')}
            >
              Create Account
            </button>
          </div>

          <div className="form-grid">
            <label className="field">
              Username
              <input
                value={username}
                onChange={(e) => actions.setUsername(e.target.value)}
                placeholder="letters, numbers, underscore"
                autoComplete="username"
              />
            </label>
            <label className="field">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => actions.setPassword(e.target.value)}
                placeholder="minimum 8 characters"
                autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
              />
            </label>
          </div>

          <div className="row gap-sm study-quiz-actions">
            <button className="btn primary" type="submit" disabled={authLoading}>
              {authLoading ? 'Working...' : authMode === 'login' ? 'Sign In' : 'Register'}
            </button>
          </div>

          <p className="muted">Progress sync status: {syncLabel}</p>
          {authError && <p className="quiz-feedback bad">{authError}</p>}
          {authInfo && <p className="quiz-feedback ok">{authInfo}</p>}
          {Boolean(token) && syncError && <p className="quiz-feedback bad">{syncError}</p>}
        </form>
      )}

      {user && (
        <div className="auth-session">
          <p className="muted">Progress sync status: {syncLabel}</p>
          <p>
            <strong>Lifetime quiz attempts:</strong> {quizAttempts}
          </p>
          <p>
            <strong>Cumulative accuracy:</strong> {cumulativeAccuracy}% ({totalCorrect}/{totalQuestions || 0})
          </p>
          <div className="row gap-sm study-quiz-actions">
            <button className="btn" type="button" onClick={actions.signOut}>
              Sign Out
            </button>
          </div>
          {authInfo && <p className="quiz-feedback ok">{authInfo}</p>}
          {syncError && <p className="quiz-feedback bad">{syncError}</p>}
        </div>
      )}
    </section>
  );
}
