import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const rootEnv = loadDotEnv(resolve(process.cwd(), '.env'));
const sharedEnv = {
  ...process.env,
  ...rootEnv,
};

if (!sharedEnv.PORT && sharedEnv.BACKEND_PORT) {
  sharedEnv.PORT = sharedEnv.BACKEND_PORT;
}

if (!sharedEnv.NEXT_PUBLIC_API_BASE_URL) {
  const port = sharedEnv.PORT || '3001';
  sharedEnv.NEXT_PUBLIC_API_BASE_URL = `http://localhost:${port}`;
}

const children = [
  spawn(npmCommand, ['run', 'dev:backend'], { stdio: 'inherit', env: sharedEnv }),
  spawn(npmCommand, ['run', 'dev:frontend'], { stdio: 'inherit', env: sharedEnv }),
];

let shuttingDown = false;

const shutdown = (exitCode = 0) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  children.forEach((child) => {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  });
  process.exitCode = exitCode;
};

children.forEach((child) => {
  child.on('exit', (code, signal) => {
    if (!shuttingDown && code !== 0) {
      console.error(`dev child exited early (${signal ?? code})`);
      shutdown(code ?? 1);
    }
  });
});

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

function loadDotEnv(path) {
  if (!existsSync(path)) {
    return {};
  }

  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const separatorIndex = line.indexOf('=');
        const key = line.slice(0, separatorIndex).trim();
        const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/gu, '');
        return [key, value];
      }),
  );
}
