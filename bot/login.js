// login.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const os = require('os');
const path = require('path');
const DataStore = require('./scripts/Data');
const waitForKeypressOrTimeout = require('./plugins/WaitForKeyPress');

async function login() {
  try {
    puppeteer.use(StealthPlugin());

    const sleep = ms => new Promise(res => setTimeout(res, ms));
    const platform = os.platform();
    const storage = new DataStore;
    const username = os.userInfo().username;
    const userprofile = storage.read('bot.chrome_profile');

    if (platform === 'win32') {
      chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
      userDataDir = `C:\\Users\\${username}\\AppData\\Local\\Google\\Chrome\\User Data\\${userprofile}`;
    } else if (platform === 'darwin') {
      chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
      userDataDir = `/Users/${username}/Library/Application Support/Google/Chrome/${userprofile}`;
    } else {
      console.error('Unsupported platform');
      process.exit(1);
    }

    console.log(`Using Chrome profile at: ${userprofile}`);

    const browser = await puppeteer.launch({
      headless: false,
      executablePath: chromePath,
      userDataDir: userDataDir,
      defaultViewport: null
    });

    const page = await browser.newPage();
    await page.goto('https://www.tiktok.com/login/phone-or-email/email', { waitUntil: 'networkidle2', timeout: 0 });
    await page.waitForSelector('body');
    const cookies = await page.cookies();
    const loggedIn = cookies.some(cookie => cookie.name.includes('sessionid'));

    if (loggedIn) {
      console.log('✅ Already logged in!');
    } else {
      console.log('❌ Not logged in. Please log in manually. using the chrome profile, once you are done close the app and open it');
    }
    waitForKeypressOrTimeout(300000, async () => {
      await browser.close();
    });
  } catch (err) {
    console.error('❌ Error launching browser:', err);
  }
}

module.exports = login;
