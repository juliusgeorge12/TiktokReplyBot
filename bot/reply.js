const processTracker = require('./plugins/ProcessedVideo');
const sleep = ms => new Promise(res => setTimeout(res, ms));
const MAX_COMMENTS = 50;

const reply = async (video_url, Page, logger, dataStore,  RUN_IN_TESTMODE = false, remember = false) => {
  const DELAY_BETWEEN_REPLY = dataStore.read('bot.comment_reply_interval');
  let lastCommentPosition = await processTracker.getLastCommentPosition(video_url);
  await Page.goto(video_url, { waitUntil: 'networkidle2', timeout: 0 });
  await Page.waitForSelector('#main-content-video_detail');
  await Page.keyboard.press('PageDown');
  await sleep(2000);
  const commentIcon = await Page.$('[data-e2e="comment-icon"]');
  if (!commentIcon) {
    console.log('Comment icon not found.');
    return;
  }
  commentIcon.click();
  await sleep(3000);
  await Page.waitForSelector('[data-e2e="comment-level-1"]');
  const commentCount = await Page.$eval('[class*="CommentTitle"]', el => {
    const text = el.textContent.trim();
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  });
  const replyCount = Math.min(commentCount, MAX_COMMENTS);
  if (!remember) {
    lastCommentPosition = 0;
  }
  console.log(`💬 Total comments for video ${video_url} : ${commentCount}`);

  console.log(`Attempting to reply to ${replyCount} comment(s) on the video`);

  if (replyCount === lastCommentPosition) {
    console.log('All comments to reply to on this video have been replied to');
    return;
  }
  await Page.mouse.wheel({ deltaX: 400 });
  const findNextCommentcontainer = async (current) => {
    if (!current)
      return null;
    let next = await current.evaluateHandle(el => el.nextElementSibling);
    let nextEl = next.asElement();
    let attempts = 0;
    const MAX_ATTEMPTS = 100;
    while (nextEl && attempts++ < MAX_ATTEMPTS) {
      const hasCommentElement = await nextEl.$('[data-e2e="comment-level-1"]');
      if (hasCommentElement) {
        return nextEl;
      }
      next = await nextEl.evaluateHandle(el => el.nextElementSibling);
      nextEl = next.asElement();
    }
    return null;
  };
  const CommentListContainer = await Page.$('[class*="CommentListContainer"]');
  let commentContainer = await CommentListContainer.$('[class*="CommentObjectWrapper"], [class*="CommentItemContainer"]');
  let commentReplied = 0;
  const replyTexts = dataStore.read('tiktok.replies');
  while (commentReplied < replyCount && commentContainer) {
    await commentContainer.scrollIntoView();
    const replyText = replyTexts[Math.floor(Math.random() * replyTexts.length)];
    if (!(commentReplied < lastCommentPosition)) {
      const ReplyBtn = await commentContainer.$('[role="button"][data-e2e="comment-reply-1"]');
      if (ReplyBtn) {
        await ReplyBtn.click();
        await sleep(500);
        const replyBox = await CommentListContainer.$('[class*="DivCommentInputContainer"]');
        if (replyBox) {
          await replyBox.click();
          await Page.keyboard.type(replyText, { delay: 80 });
          await sleep(500);
          if (!RUN_IN_TESTMODE) {
            await Page.keyboard.press('Enter');
          }
          lastCommentPosition += 1;
          await processTracker.setLastCommentPosition(video_url, lastCommentPosition);
          commentReplied++;
        } else {
          console.error('Reply box not found, retrying...');
        }
      }
    }
    commentContainer = await findNextCommentcontainer(commentContainer);
    await sleep(DELAY_BETWEEN_REPLY);
  }
  await processTracker.addProcessedVideo(video_url);
}
module.exports = reply;