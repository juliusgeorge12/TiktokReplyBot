<?php

include_once 'includes/Data.php';
$Data = new Data();


$videos = $Data->read('tiktok.video_urls');
$videos_count = is_array($videos) ? count($videos) : 0;
$video_links_text = '';
if (count($videos) > 0) {
    $video_links_text = array_reduce(
        $videos,
        fn ($carry, $link) => $carry . ' ' . $link . "\n",
        ''
    );
}
//format it from timestamp
$last_run_ms = $Data->read('bot.last_run');

if (is_numeric($last_run_ms)) {
    $last_run = date('Y-m-d H:i:s', floor($last_run_ms / 1000));
} else {
    $last_run = null;
}
if ($_SERVER["REQUEST_METHOD"] === 'POST') {
    if ($type = trim($_POST["type"]) === 'add-video') {
        $video_link = isset($_POST['video-links-input']) ? $_POST['video-links-input'] : '';
        $raw_links = explode("\n", $video_link);
        $links = array_values(array_filter(array_map('trim', $raw_links)));
        $Data->store('tiktok.video_urls', $links);
        header('Location: ' . $_SERVER['REQUEST_URI']);
        exit();
    }
}
