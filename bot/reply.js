const sleep = ms => new Promise(res => setTimeout(res, ms));
const MAX_COMMENTS = 50;

const reply = async (video_url, page, logger, dataStore) => {
  const replySleepTime = dataStore.read('bot.comment_reply_interval');

  await page.goto(video_url, { waitUntil: 'networkidle2' });
  await page.waitForSelector('body');

  await page.keyboard.press('PageDown');
  await sleep(2000);

  console.log('🗨️ Opening comments for ' + video_url + '...');

  await page.evaluate(() => {
    const icon = document.querySelector('[data-e2e="comment-icon"]');
    if (icon && icon.offsetParent !== null) {
      icon.click();
    }
  });

  await sleep(3000);
  await page.waitForSelector('[data-e2e="comment-level-1"]');

  const commentCount = await page.$eval('[class*="CommentTitle"]', el => {
    const text = el.textContent.trim();
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  });

  console.log(`💬 Total comments for video ${video_url} : ${commentCount}`);

  let commentContainer = await page.$(
    '[class*="CommentListContainer"] > [class*="CommentObjectWrapper"], [class*="CommentListContainer"] > [class*="CommentItemContainer"]'
  );

  const replyCount = Math.min(commentCount, MAX_COMMENTS);
  console.log(`Attempting to reply to ${replyCount} comment(s) on the video`);

  let commentReplied = 0;
  let canReplyMore = true;

  while (commentReplied < replyCount && canReplyMore) {
    if (!commentContainer) {
      console.log('⚠️ No comment container found, stopping.');
      canReplyMore = false;
      break;
    }

    const isConnected = await commentContainer.evaluate(el => el.isConnected);
    if (!isConnected) {
      console.log('⚠️ Comment container is detached, skipping.');
      commentReplied++;
      continue;
    }

    try {
      const commentText = await commentContainer.$eval('[data-e2e="comment-level-1"]', el => el.textContent.trim());
      console.log('🗨️ Comment:', commentText);

      // Fresh reply button selection
      const freshReplyButton = await commentContainer.$('[role="button"][data-e2e="comment-reply-1"]');
      if (freshReplyButton && await freshReplyButton.evaluate(el => el.isConnected)) {
        await freshReplyButton.click();
        await sleep(500);

        const replyTexts = dataStore.read('tiktok.replies');
        const reply = replyTexts[Math.floor(Math.random() * replyTexts.length)];

        await page.keyboard.type(reply);
        await sleep(300);
        await page.keyboard.press('Enter');

        console.log(`✅ Replied: ${reply}`);
      } else {
        console.log('❌ No usable reply button found, skipping.');
      }

    } catch (err) {
      console.error('❗ Error while processing comment:', err.message);
    }

    commentReplied++;
    await sleep(replySleepTime ?? 2000);

    // Get next comment container
    const nextHandle = await page.evaluateHandle((el) => {
      let next = el.nextElementSibling;
      while (
        next &&
        !next.className.includes('CommentObjectWrapper') &&
        !next.className.includes('CommentItemContainer')
      ) {
        next = next.nextElementSibling;
      }
      return next || null;
    }, commentContainer);

    commentContainer = nextHandle.asElement();
    canReplyMore = !!commentContainer;
  }
};

module.exports = reply;
