import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

// 获取项目根目录（scripts/ 的上一级）
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// 删除 ELECTRON_RUN_AS_NODE 环境变量，避免 Electron 以 Node 模式运行
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

// 启动 Electron
const electron = spawn('npx', ['electron', '.'], {
  cwd: rootDir,
  env,
  stdio: 'inherit',
  shell: process.platform === 'win32', // Windows 需要 shell 来执行 npx
});

electron.on('exit', (code) => process.exit(code));
