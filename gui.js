const { spawn, execSync, exec } = require('child_process');
const net = require('net');
const path = require('path');
const fs = require('fs');

const isPkg = typeof process.pkg !== 'undefined';
const exeBase = isPkg ? path.dirname(process.execPath) : __dirname;
const rootPath = path.resolve(exeBase);

const bundledPhpPath = path.join(rootPath, 'bin', 'php', process.platform === 'win32' ? 'php.exe' : 'php');

let phpServer = null;

function checkPort(port) {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', () => resolve(false))
      .once('listening', () => tester.once('close', () => resolve(true)).close())
      .listen(port);
  });
}

async function getAvailablePort(startPort = 9000) {
  let port = startPort;
  while (!(await checkPort(port))) {
    port++;
    if (port > 65535) throw new Error('No available ports found.');
  }
  return port;
}

function setupExitHandlers() {
  const shutdown = () => {
    if (phpServer) {
      console.log('\n🛑 Shutting down PHP server...');
      phpServer.kill();
    }
    process.exit();
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.on('exit', shutdown);
}

function findPhpBinary() {
  if (fs.existsSync(bundledPhpPath)) {
    return bundledPhpPath;
  }

  try {
    // Try system PHP
    const result = execSync('php -v', { stdio: 'pipe' }).toString();
    if (/PHP\s+\d+\.\d+/.test(result)) {
      return 'php';
    }
  } catch (e) {
    // Not found or not working
  }

  return null;
}

(async () => {
  try {
    const phpPath = findPhpBinary();
    if (!phpPath) {
      throw new Error('PHP binary not found. Make sure PHP is installed or placed in bin/php/.');
    }

    const port = await getAvailablePort(9000);
    const url = `http://localhost:${port}`;

    phpServer = spawn(phpPath, ['-S', `localhost:${port}`], {
      cwd: rootPath,
      stdio: 'ignore',
    });

    setupExitHandlers();
    console.log(`✅ PHP server running at ${url}`);

    setTimeout(() => {
      const openCmd =
        process.platform === 'win32'
          ? `start "" "${url}"`
          : process.platform === 'darwin'
          ? `open "${url}"`
          : `xdg-open "${url}"`;

      exec(openCmd, (err) => {
        if (err) {
          console.error('❌ Failed to open browser:', err);
        } else {
          console.log('🌐 Browser launched.');
        }
      });
    }, 1000);
  } catch (err) {
    console.error('❌ Error:', err.message || err);
    process.exit(1);
  }
})();
