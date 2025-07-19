const puppeteer = require('puppeteer-extra');

// Add the Imports before StealthPlugin
require('puppeteer-extra-plugin-stealth/evasions/chrome.app');
require('puppeteer-extra-plugin-stealth/evasions/chrome.csi');
require('puppeteer-extra-plugin-stealth/evasions/chrome.loadTimes');
require('puppeteer-extra-plugin-stealth/evasions/chrome.runtime');
require('puppeteer-extra-plugin-stealth/evasions/defaultArgs');
require('puppeteer-extra-plugin-stealth/evasions/iframe.contentWindow');
require('puppeteer-extra-plugin-stealth/evasions/media.codecs');
require('puppeteer-extra-plugin-stealth/evasions/navigator.hardwareConcurrency');
require('puppeteer-extra-plugin-stealth/evasions/navigator.languages');
require('puppeteer-extra-plugin-stealth/evasions/navigator.permissions');
require('puppeteer-extra-plugin-stealth/evasions/navigator.plugins');
require('puppeteer-extra-plugin-stealth/evasions/navigator.vendor');
require('puppeteer-extra-plugin-stealth/evasions/navigator.webdriver');
require('puppeteer-extra-plugin-stealth/evasions/sourceurl');
require('puppeteer-extra-plugin-stealth/evasions/user-agent-override');
require('puppeteer-extra-plugin-stealth/evasions/webgl.vendor');
require('puppeteer-extra-plugin-stealth/evasions/window.outerdimensions');

const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const stealth = StealthPlugin();
puppeteer.use(stealth);

const os = require('os');
const path = require('path');
const DataStore = require('./scripts/Data');
const Logger = require('./scripts/Logger');
const replyVideoComment = require('./reply');
const waitForKeypressOrTimeout = require('./plugins/WaitForKeyPress');
const askYesNo = require('./plugins/prompt');
const login = require('./login');

const sleep = ms => new Promise(res => setTimeout(res, ms));

(async () => {
  const username = os.userInfo().username;
  const platform = os.platform();
  const Storage = new DataStore();
  const logger = new Logger();
  Storage.store('bot.last_run', Date.now());
  const userprofile = Storage.read('bot.chrome_profile');

  let chromePath, userDataDir;

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

  console.log('Debug log: chrome profile: ' + userprofile);
  if (!userprofile) {
    console.log('chrome profile not set, kindly set it using the GUI interface.');
    console.log('Press any key to exit, or wait 10 seconds...');
    await waitForKeypressOrTimeout();
    return;
  }

  const replies = Storage.read('tiktok.replies');
  if (!replies || replies.length < 1) {
    console.log('You have not set the texts the bot will use to reply. Kindly do so via the GUI interface.');
    console.log('Press any key to exit, or wait 10 seconds...');
    await waitForKeypressOrTimeout();
    return;
  }
  const shouldReply = !(await askYesNo('Do you want to run the bot in test mode? in test mode replies are not sent but filled'));
  const remember = askYesNo('do you want the bot to continue from where it stopped?');

  const browser = await puppeteer.launch({
    headless: Storage.read('bot.run_in_background') ?? true,
    executablePath: chromePath,
    userDataDir,
    defaultViewport: null
  });

  const page = await browser.newPage();

  try {
    await page.goto('https://www.tiktok.com', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
  } catch (err) {
    if (err.name === 'TimeoutError') {
      console.error('⏱️ Timeout: TikTok page took too long to load. This may be due to a poor network connection.');
      console.log('❗ Try checking your internet or using a more stable connection.');
    } else {
      console.error('🚨 Unexpected error while opening TikTok:', err);
    }
    await browser.close();
    return;
  }

  await page.waitForSelector('body');
  const cookies = await page.cookies();
  const loggedIn = cookies.some(cookie => cookie.name.includes('sessionid'));

  if (!loggedIn) {
    console.log('Not logged in');
    await browser.close();
    await login();
    console.log('Once logged in, press any key to exit. The app will close in 5 minutes...');
    return;
  }

  // Load video URLs
  let videos = Storage.read('tiktok.video_urls');
  if (!videos || videos.length < 1) {
    console.log('No video links added.');
    console.log('Press any key to exit, or wait 10 seconds...');
    await waitForKeypressOrTimeout();
    await browser.close();
    return;
  }

  let index = 0;
  while (index < videos.length) {
    const video_url = videos[index];
    console.log('Processing video URL: ' + video_url);

    if (!/^https?:\/\/(?:[\w.-]+\.)?tiktok\.com\//.test(video_url)) {
      console.error('❌ Invalid video URL. Skipping...');
      index++;
      continue;
    }

    try {
      await replyVideoComment(video_url, page, logger, Storage, shouldReply, remember);
    } catch (err) {
      if (err.name === 'TimeoutError') {
        console.error(`⏱️ Timeout loading video: ${video_url}. Skipping due to slow network.`);
      } else {
        console.error(`🚨 Error processing video ${video_url}:`, err.message);
      }
      //continue;
    }

    videos.splice(index, 1);
    Storage.store('tiktok.video_urls', videos);
    await sleep(Storage.read('bot.video_interval') ?? 20000);
  }

  await browser.close();
  console.log('✅ Done replying to comments on all added videos.');
  logger.log('✅ Done replying to comments on all added videos.');
  await waitForKeypressOrTimeout();
})();
