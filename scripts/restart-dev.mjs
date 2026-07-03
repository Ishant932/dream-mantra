/**
 * Start dev servers (backend :5000 + Vite :5173).
 * If ports are busy, stop other node terminals first or run: taskkill /F /IM node.exe
 */
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const isWin = process.platform === 'win32';

console.log('Starting Dream Mantra dev servers...');
console.log('  Frontend: http://127.0.0.1:5173');
console.log('  API:      http://127.0.0.1:5000/api/health\n');

const child = spawn(isWin ? 'npm.cmd' : 'npm', ['run', 'dev'], {
  cwd: root,
  stdio: 'inherit',
  shell: isWin,
});

child.on('exit', (code) => process.exit(code ?? 0));
