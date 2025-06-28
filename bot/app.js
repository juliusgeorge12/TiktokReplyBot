const puppeteer = require('puppeteer-extra')

// Add the Imports before StealthPlugin
require('puppeteer-extra-plugin-stealth/evasions/chrome.app')
require('puppeteer-extra-plugin-stealth/evasions/chrome.csi')
require('puppeteer-extra-plugin-stealth/evasions/chrome.loadTimes')
require('puppeteer-extra-plugin-stealth/evasions/chrome.runtime')
require('puppeteer-extra-plugin-stealth/evasions/defaultArgs') // pkg warned me this one was missing
require('puppeteer-extra-plugin-stealth/evasions/iframe.contentWindow')
require('puppeteer-extra-plugin-stealth/evasions/media.codecs')
require('puppeteer-extra-plugin-stealth/evasions/navigator.hardwareConcurrency')
require('puppeteer-extra-plugin-stealth/evasions/navigator.languages')
require('puppeteer-extra-plugin-stealth/evasions/navigator.permissions')
require('puppeteer-extra-plugin-stealth/evasions/navigator.plugins')
require('puppeteer-extra-plugin-stealth/evasions/navigator.vendor')
require('puppeteer-extra-plugin-stealth/evasions/navigator.webdriver')
require('puppeteer-extra-plugin-stealth/evasions/sourceurl')
require('puppeteer-extra-plugin-stealth/evasions/user-agent-override')
require('puppeteer-extra-plugin-stealth/evasions/webgl.vendor')
require('puppeteer-extra-plugin-stealth/evasions/window.outerdimensions')
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const os = require('os');
const fs = require('fs');
const path = require('path');
const DataStore = require('./scripts/Data');
const Logger = require('./scripts/Logger');
const replyVideoComment = require('./reply');
const waitForKeypressOrTimeout = require('./plugins/WaitForKeyPress');
const login = require('./login');
const stealth = StealthPlugin();

const sleep = ms => new Promise(res => setTimeout(res, ms));


puppeteer.use(stealth);

(async () => {
  const username = os.userInfo().username;
  const platform = os.platform();
  const Storage = new DataStore;
  const logger = new Logger;
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
  if (userprofile === null || userprofile === '') {
    console.log('chromeprofile not set, kindly set it using the gui interface');
    console.log('Press any key to exit, or wait 10 seconds...');
    waitForKeypressOrTimeout();
    return;
  }
  const replies = Storage.read('tiktok.replies')
  if (replies === null || (replies.length < 1)) {
    console.log('you have not set the texts the bot will use to reply, kindly do so via the gui interface');
    console.log('Press any key to exit, or wait 10 seconds...');
    waitForKeypressOrTimeout();
    return;
  }
  
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: chromePath,
    userDataDir,
    defaultViewport: null
  });

  const page = await browser.newPage();

  await page.goto('https://www.tiktok.com', { waitUntil: 'networkidle2' });
  await page.waitForSelector('body');
  const cookies = await page.cookies();
  const loggedIn = cookies.some(cookie => cookie.name.includes('sessionid'));

  if (!loggedIn) {
      console.log('not logged in');
      await browser.close();
      await login();
      console.log('Once logged in press any key to exit, the app would close in 5 minutes...');
      return;
  }

  // Load video URL
  let videos = Storage.read('tiktok.video_urls');
  if (videos === null || videos.length < 1) {
    console.log('No videos links added');
    console.log('Press any key to exit, or wait 10 seconds...');
    waitForKeypressOrTimeout();
    await browser.close();
    return;
  }

  let index = 0;
  while (index < videos.length) {
    video_url = videos[index];
    console.log('video url: ' + video_url);
    if (!/^https?:\/\/(?:[\w.-]+\.)?tiktok\.com\//.test(video_url)) {
      console.error('❌ Invalid video URL.');
      await browser.close();
      console.log('Press any key to exit, or wait 10 seconds...');
      waitForKeypressOrTimeout();
      return;
    }
    await replyVideoComment(video_url,page, logger, Storage)
    videos.splice(index, 1);
    Storage.store('tiktok.video_urls', videos);
    await sleep(Storage.read('bot.video_interval') ?? 20000);
  }
  browser.close();
  console.log('Done replying comments on added videos');
  logger.log('Done replying comments on added videos');
  waitForKeypressOrTimeout();
})();
