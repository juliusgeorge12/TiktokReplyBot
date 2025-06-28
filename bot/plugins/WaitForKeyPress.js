const readline = require('readline');

const waitForKeypressOrTimeout = (timeoutMs = 10000, callback = null) => {
  return new Promise(resolve => {
    const onKeyPress = () => {
      clearTimeout(timeout);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.removeListener('data', onKeyPress);
      resolve('keypress');
      handCallback();
    };

    // Timeout fallback
    const timeout = setTimeout(() => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.removeListener('data', onKeyPress);
      resolve('timeout');
      handCallback();
    }, timeoutMs);

    //handlecallback
    const handCallback = () => {
      if (callback !== null && typeof callback === 'function') {
        callback();
      }
    }

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', onKeyPress);
  });
};
module.exports = waitForKeypressOrTimeout;