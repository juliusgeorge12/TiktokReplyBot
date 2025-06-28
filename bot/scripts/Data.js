const fs = require('fs');
const path = require('path');

class Data {
  constructor() {
    this.filename = 'data.json';

    // Always locate relative to the binary, not to snapshot or CWD
    const isPkg = typeof process.pkg !== 'undefined';
    const baseDir = isPkg ? path.dirname(process.execPath) : path.resolve(__dirname,'..', '..');

    this.fileDirectory = path.join(baseDir, 'backend', 'store');
    this.filePath = path.join(this.fileDirectory, this.filename);
    this.data = {};

    this.initialize();
    this.buffer();
  }

  // Read nested value using dot notation path
  read(pathStr) {
    const tokens = pathStr.split('.');
    let data = this.data;

    for (const token of tokens) {
      if (data && Object.prototype.hasOwnProperty.call(data, token)) {
        data = data[token];
      } else {
        return null;
      }
    }

    return data;
  }

  // Write nested value using dot notation path
  store(pathStr, value) {
    const tokens = pathStr.split('.');
    let data = this.data;

    for (let i = 0; i < tokens.length - 1; i++) {
      const token = tokens[i];
      if (!data[token] || typeof data[token] !== 'object') {
        data[token] = {};
      }
      data = data[token];
    }

    data[tokens[tokens.length - 1]] = value;

    const json = JSON.stringify(this.data, null, 2);
    fs.writeFileSync(this.filePath, json);
  }

  // Ensure store directory and file exists
  initialize() {
    if (!fs.existsSync(this.fileDirectory)) {
      console.log('[INFO] Creating storage directory at:', this.fileDirectory);
      fs.mkdirSync(this.fileDirectory, { recursive: true });
    }

    if (!fs.existsSync(this.filePath)) {
      console.log('[INFO] Creating data file at:', this.filePath);
      fs.writeFileSync(this.filePath, JSON.stringify({}, null, 2));
    }
  }

  // Load data from file into memory
  buffer() {
    const file = fs.readFileSync(this.filePath, 'utf8');
    this.data = JSON.parse(file || '{}');
  }
}

module.exports = Data;
