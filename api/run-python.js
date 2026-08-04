import { spawn } from 'node:child_process';

const MAX_CODE_LENGTH = 16_000;
const FUNCTION_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const body = req.body ?? {};
  const code = typeof body.code === 'string' ? body.code : '';
  const functionName = typeof body.functionName === 'string' ? body.functionName : '';
  const tests = Array.isArray(body.tests) ? body.tests : [];

  if (!code.trim() || code.length > MAX_CODE_LENGTH) {
    res.status(400).json({ error: 'Provide a Python solution under 16,000 characters.' });
    return;
  }
  if (!FUNCTION_NAME.test(functionName)) {
    res.status(400).json({ error: 'The challenge function name is invalid.' });
    return;
  }

  const runner = `
import contextlib
import io
import json
import sys

${code}

def _same(left, right):
    return json.dumps(left, sort_keys=True, default=str) == json.dumps(right, sort_keys=True, default=str)

try:
    challenge_tests = json.loads(sys.stdin.read())
    candidate = ${functionName}
    results = []
    for test in challenge_tests:
        try:
            with contextlib.redirect_stdout(io.StringIO()):
                actual = candidate(*test.get('input', []))
            results.append({
                'label': test.get('label', 'test'),
                'pass': _same(actual, test.get('expected')),
                'actual': actual,
                'expected': test.get('expected'),
            })
        except Exception as error:
            results.append({
                'label': test.get('label', 'test'),
                'pass': False,
                'error': f'{type(error).__name__}: {error}',
                'expected': test.get('expected'),
            })
    print(json.dumps({'results': results}, default=str))
except Exception as error:
    print(json.dumps({'error': f'{type(error).__name__}: {error}'}))
`;

  const python = process.env.PYTHON_EXECUTABLE ?? 'python';
  const child = spawn(python, ['-I', '-S', '-c', runner], {
    windowsHide: true,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  let stdout = '';
  let stderr = '';
  let finished = false;
  const finish = (status, payload) => {
    if (finished) return;
    finished = true;
    res.status(status).json(payload);
  };

  const timeout = setTimeout(() => {
    child.kill();
    finish(408, { error: 'Execution timed out after 2 seconds. Check for an infinite loop.' });
  }, 2000);

  child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
  child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
  child.on('error', (error) => {
    clearTimeout(timeout);
    finish(503, { error: `Python execution is unavailable: ${error.message}` });
  });
  child.on('close', (exitCode) => {
    clearTimeout(timeout);
    if (finished) return;
    if (exitCode !== 0) {
      finish(400, { error: stderr.trim() || 'Python returned a non-zero exit code.' });
      return;
    }
    try {
      const payload = JSON.parse(stdout.trim());
      finish(payload.error ? 400 : 200, payload);
    } catch {
      finish(400, { error: 'The Python runner returned invalid output.' });
    }
  });

  child.stdin.end(JSON.stringify(tests));
}
