const processTracker = require('./plugins/ProcessedVideo');
const sleep = ms => new Promise(res => setTimeout(res, ms));
const MAX_COMMENTS = 50;

const reply = async (video_url, page, logger, dataStore, shouldReply = false, remember = false) => {
  const replySleepTime = dataStore.read('bot.comment_reply_interval');

  await page.goto(video_url, { waitUntil: 'networkidle2', timeout: 90000 });
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

  let lastCommentPosition = await processTracker.getLastCommentPosition(video_url);
  if (!remember) {
    lastCommentPosition = 0;
  }
  console.log(`💬 Total comments for video ${video_url} : ${commentCount}`);

  const replyCount = Math.min(commentCount, MAX_COMMENTS);
  console.log(`Attempting to reply to ${replyCount} comment(s) on the video`);

  if (replyCount === lastCommentPosition) {
    console.log('All comments to reply to on this video have been replied to');
    return;
  }
  await page.mouse.wheel({ deltaX: 400 });
  // 🔄 Preload: Ensure comments are loaded up to lastCommentPosition
  let loadedComments = 0;
  let attempts = 0;
  const maxAttempts = 10;

  while (loadedComments <= lastCommentPosition && attempts < maxAttempts) {
    const containers = await page.$$(
      '[class*="CommentListContainer"] > [class*="CommentObjectWrapper"], [class*="CommentListContainer"] > [class*="CommentItemContainer"]'
    );
    loadedComments = containers.length;

    console.log(`📥 Preloading comments: ${loadedComments}/${lastCommentPosition + 1}`);

    if (loadedComments > lastCommentPosition) break;

    const last = containers[containers.length - 1];
    const replyBtn = await last?.$('[role="button"][data-e2e="comment-reply-1"]');
    if (replyBtn && await replyBtn.evaluate(el => el.isConnected)) {
      await replyBtn.click();
      await sleep(1500);
    } else {
      console.log('❌ Could not trigger lazy load. Stopping preload.');
      break;
    }

    attempts++;
  }

  // 🧠 Main Reply Loop
  let commentReplied = 0;
  let canReplyMore = true;

  while (commentReplied < replyCount && canReplyMore) {
    const commentContainers = await page.$$(
      '[class*="CommentListContainer"] > [class*="CommentObjectWrapper"], [class*="CommentListContainer"] > [class*="CommentItemContainer"]'
    );

    const totalAvailableNow = commentContainers.length;
    if (commentReplied >= totalAvailableNow) {
      console.log('⚠️ No more visible comment containers.');
      break;
    }

    const commentContainer = commentContainers[commentReplied];
    if (!commentContainer) {
      console.log('⚠️ Comment container not found.');
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
      console.log(`💭 Comment #${commentReplied + 1}: ${commentText}`);

      if (commentReplied < lastCommentPosition) {
        console.log(`⏭️ Already replied to this comment, skipping...`);
      } else {
        const freshReplyButton = await commentContainer.$('[role="button"][data-e2e="comment-reply-1"]');
        if (freshReplyButton && await freshReplyButton.evaluate(el => el.isConnected)) {
          await freshReplyButton.click();
          await sleep(500);

          const replyTexts = dataStore.read('tiktok.replies');
          const reply = replyTexts[Math.floor(Math.random() * replyTexts.length)];

          await page.keyboard.type(reply, { delay: 80 }); // ⌨️ Human-like typing
          await sleep(300);

          if (shouldReply) {
            await page.keyboard.press('Enter');
          }

          console.log(`✅ Replied: ${reply}`);
        } else {
          console.log('❌ No usable reply button found, skipping.');
        }

        lastCommentPosition += 1;
        await processTracker.setLastCommentPosition(video_url, lastCommentPosition);
      }
    } catch (err) {
      console.error('❗ Error while processing comment:', err.message);
    }

    commentReplied++;
    await sleep(replySleepTime ?? 2000);

    // 🌀 Lazy load more comments if needed
    if (commentReplied >= commentContainers.length && commentReplied < replyCount) {
      console.log('🔄 Attempting to load more comments...');
      const last = commentContainers[commentContainers.length - 1];
      const replyBtn = await last.$('[role="button"][data-e2e="comment-reply-1"]');
      if (replyBtn && await replyBtn.evaluate(el => el.isConnected)) {
        await replyBtn.click();
        await sleep(1500);
      }

      const updatedCount = await page.$$eval('[data-e2e="comment-level-1"]', els => els.length);
      if (updatedCount > commentContainers.length) {
        console.log(`📈 Loaded ${updatedCount - commentContainers.length} more comments`);
      } else {
        console.log('🛑 No new comments loaded. Likely end of comment list.');
        canReplyMore = false;
      }
    }
  }
  processTracker.addProcessedVideo(video_url);
};

module.exports = reply;
