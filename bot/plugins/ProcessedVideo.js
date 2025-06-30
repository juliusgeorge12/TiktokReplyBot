const DataStore = require('../scripts/Data');
const Storage = new DataStore();

async function videoProcessed(video_url) {
  const videos = Storage.read('processed_videos') || [];
  return videos.includes(video_url);
}

async function addProcessedVideo(video_url) {
  const videos = Storage.read('processed_videos') || [];
  if (!videos.includes(video_url)) {
    videos.push(video_url);
    Storage.store('processed_videos', videos);
  }
}

async function setLastCommentPosition(video_url, position) {
  const positions = Storage.read('last_comment_position') || [];

  const index = positions.findIndex(entry => entry.video_url === video_url);
  if (index !== -1) {
    positions[index].position = position;
  } else {
    positions.push({ video_url, position });
  }

  Storage.store('last_comment_position', positions);
}

async function getLastCommentPosition(video_url) {
  const positions = Storage.read('last_comment_position') || [];
  const match = positions.find(entry => entry.video_url === video_url);
  return match ? match.position : 0;
}


module.exports = {
  videoProcessed,
  addProcessedVideo,
  setLastCommentPosition,
  getLastCommentPosition
};
