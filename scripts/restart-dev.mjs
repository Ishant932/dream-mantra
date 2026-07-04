/**
 * Clean start: free ports 5000 + 5173, then run backend + Vite.
 * Usage: npm run dev   or   npm run restart
 */
import { spawn, execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const isWin = process.platform === 'win32';
const PORTS = [5000, 5173];

function killPort(port) {
  try {
    if (isWin) {
      const out = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      const pids = new Set();
      for (const line of out.split('\n')) {
        if (!line.includes('LISTENING')) continue;
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && /^\d+$/.test(pid) && pid !== '0') pids.add(pid);
      }
      for (const pid of pids) {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          console.log(`  Freed port ${port} (PID ${pid})`);
        } catch {
          /* already gone */
        }
      }
    } else {
      execSync(`lsof -ti tcp:${port} | xargs -r kill -9`, { stdio: 'ignore', shell: true });
    }
  } catch {
    /* port already free */
  }
}

console.log('Dream Mantra — preparing dev servers...\n');
for (const port of PORTS) killPort(port);

await new Promise((r) => setTimeout(r, 800));

console.log('\n  Open in browser:  http://localhost:5173/login');
console.log('  API health:       http://localhost:5000/api/health\n');

const child = spawn(isWin ? 'npm.cmd' : 'npm', ['run', 'dev:servers'], {
  cwd: root,
  stdio: 'inherit',
  shell: isWin,
});

child.on('exit', (code) => process.exit(code ?? 0));
