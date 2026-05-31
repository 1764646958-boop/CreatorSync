#!/usr/bin/env node
import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const rootDir = path.resolve('.');

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const sharedEnv = { ...process.env };

// 子进程选项，兼容 Windows
const spawnOptions = {
  stdio: 'inherit',
  env: sharedEnv,
  shell: process.platform === 'win32', // Windows 下必须 shell: true
};

const run = (script) => {
  console.log(`\n🚀 启动脚本: ${script}`);
  const child = spawn(npmCommand, ['run', script], spawnOptions);
  child.on('close', (code) => {
    if (code !== 0) {
      console.error(`⚠️ 脚本 ${script} 退出，返回码 ${code}`);
    }
  });
  return child;
};

// 并行启动前后端
const backendProcess = run('dev:backend');
const frontendProcess = run('dev:frontend');

// 监听 Ctrl+C，确保所有子进程都能退出
process.on('SIGINT', () => {
  console.log('\n⏹ 停止所有子进程...');
  backendProcess.kill('SIGINT');
  frontendProcess.kill('SIGINT');
  process.exit();
});

process.on('exit', () => {
  backendProcess.kill();
  frontendProcess.kill();
});
