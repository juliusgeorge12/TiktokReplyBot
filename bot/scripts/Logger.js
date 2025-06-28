const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.filename = 'log.txt';

    // ✅ Safe, works for binaries on macOS and Windows
    const isPkg = typeof process.pkg !== 'undefined';
    const baseDir = isPkg ? path.dirname(process.execPath) : path.resolve(__dirname,'..', '..');
    this.fileDirectory = path.join(baseDir, 'backend', 'logs');
    this.filePath = path.join(this.fileDirectory, this.filename);
    this.data = [];

    this.initialize();
    this.buffer();
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
    const entry = {
      timestamp,
      level: level.toLowerCase(),
      message
    };

    this.data.push(entry);
    this.persist(entry);
  }

  initialize() {
    if (!fs.existsSync(this.fileDirectory)) {
      console.log('[INFO] Creating logs directory at:', this.fileDirectory);
      fs.mkdirSync(this.fileDirectory, { recursive: true });
    }

    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, '');
    }
  }

  buffer() {
    const content = fs.readFileSync(this.filePath, 'utf8').trim();
    if (!content) return;

    const lines = content.split('\n').filter(Boolean);

    for (const line of lines) {
      const match = line.match(/\[(.*?)\] \[(.*?)\]: (.*)/);
      if (match && match.length === 4) {
        this.data.push({
          timestamp: match[1],
          level: match[2].toLowerCase(),
          message: match[3]
        });
      }
    }
  }

  persist(entry) {
    const text = `[${entry.timestamp}] [${entry.level.toUpperCase()}]: ${entry.message}\n\n`;
    fs.appendFileSync(this.filePath, text);
  }

  readLogs() {
    return this.data;
  }

  clearLogs() {
    this.data = [];
    fs.writeFileSync(this.filePath, '');
  }
}

module.exports = Logger;
