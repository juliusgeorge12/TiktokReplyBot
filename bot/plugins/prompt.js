const readline = require('readline');

const askYesNo = (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    const ask = () => {
      rl.question(`${question} (yes/no): `, answer => {
        const cleaned = answer.trim().toLowerCase();
        if (cleaned === 'yes') {
          rl.close();
          resolve(true);
        } else if (cleaned === 'no') {
          rl.close();
          resolve(false);
        } else {
          console.log("❓ Please enter 'yes' or 'no'.");
          ask(); // ask again
        }
      });
    };

    ask(); // initial prompt
  });
};
module.exports = askYesNo;