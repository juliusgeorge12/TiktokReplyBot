<?php

include_once 'includes/Data.php';
$Data = new Data();
if ($_SERVER["REQUEST_METHOD"] === 'POST') {
    if ($type = trim($_POST["type"]) == 'creds') {
        $chromeProfile = isset($_POST['chrome-profile']) ? $_POST['chrome-profile'] : '';
        $replies_text = isset($_POST['replies']) ? $_POST['replies'] : '';
        $replies = [];
        foreach (explode("\n", $replies_text) as $text) {
            if (!empty($text = trim($text))) {
                array_push($replies, $text);
            }
        }
        $Data->store('tiktok.replies', $replies);
        $Data->store('bot.chrome_profile', $chromeProfile);
    }
    if ($type = trim($_POST["type"]) == 'configuration') {
        $videoInterval = isset($_POST['video-interval']) ? $_POST['video-interval'] : '';
        $replyInterval = isset($_POST['reply-interval']) ? $_POST['reply-interval'] : '';
        $Data->store('bot.video_interval', $videoInterval);
        $Data->store('bot.comment_reply_interval', $replyInterval);
    }
    header('Location: ' . $_SERVER['REQUEST_URI']);
    exit();
}
$chromeProfile = $Data->read('bot.chrome_profile');
$replies_text = array_reduce(
    $Data->read('tiktok.replies'),
    fn ($carry, $item) => $carry . $item . "\n",
    ''
);
$videoInterval = $Data->read('bot.video_interval');
$replyInterval = $Data->read('bot.comment_reply_interval');
