<?php
include_once __DIR__ . "/backend/settings.php";

?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Dashboard | setting</title>
  <link rel="stylesheet" href="css/index.css"/>
</head>
<body>
  <div class="dashboard">
    <div class="overlay" id="overlay"></div>

    <aside class="sidebar" id="sidebar">
      <h2 class="logo">My Dashboard</h2>
      <nav>
        <ul class="menu">
          <li><a href="index.php">Dashboard</a></li>
          <li class="has-submenu">
            <a href="#">Settings</a>
            <ul class="submenu">
              <li><a href="#creds">Account setup</a></li>
              <li><a href="#bot-configuration">Bot configuration</a></li>
            </ul>
          </li>

          <li><a href="logs.php">Logs</a></li>
        </ul>
      </nav>
    </aside>

    <main class="main-content">
      <header class="topbar">
        <button class="toggle-sidebar">☰</button>
        <h1>Setting</h1>
      </header>
      <section class="content" id="credentials-content">
        <h2>Account Setup</h2>
        <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]) ?>#creds" method="post" class="modern-form">
          <input type="hidden" name="type" value="creds">
          <label for="chrome-profile">Chrome profile</label>
          <input type="text" id="chrome-profile" name="chrome-profile" value="<?php echo $chromeProfile ?? null ?>" placeholder="Enter the chrome profile" required>
          <label for="replies">Replies</label>
          <textarea
            id="replies"
            name="replies"
            rows="5"
            placeholder="Enter the text you want the bot to reply with, each comment should be spearated with a new line"
          ><?php echo $replies_text ?? null ?></textarea>
          <button type="submit">Save Details</button>
        </form>
      </section>
      <section class="content" id="bot-config-content" style="display: none;">
        <h2>Bot Configuration</h2>
        <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]) ?>#bot-configuration" method="post" class="modern-form">
          <input type="hidden" name="type" value="configuration">
          <label for="video-interval">Interval between videos</label>
          <select id="video-interval" name="video-interval">
            <option value="5000" <?php if ($videoInterval === '5000'){ echo 'selected'; } ?>>5 seconds</option>
            <option value="10000" <?php if ($videoInterval === '10000'){ echo 'selected'; } ?>>10 seconds</option>
            <option value="15000" <?php if ($videoInterval === '15000'){ echo 'selected'; } ?>>15 seconds</option>
            <option value="30000" <?php if ($videoInterval === '30000'){ echo 'selected'; } ?>>30 seconds</option>
          </select>
          <label for="reply-interval">Interval between replies</label>
          <select id="reply-interval" name="reply-interval">
            <option value="2000" <?php if ($replyInterval === '2000'){ echo 'selected'; } ?>>2 seconds</option>
            <option value="5000" <?php if ($replyInterval === '5000'){ echo 'selected'; } ?>>5 seconds</option>
            <option value="10000" <?php if ($replyInterval === '10000'){ echo 'selected'; } ?>>10 seconds</option>
            <option value="20000" <?php if ($replyInterval === '20000'){ echo 'selected'; } ?>>20 seconds</option>
          </select>
          <button type="submit">Save Configuration</button>
        </form>
      </section>
    </main>
  </div>

<script>
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.querySelector('.toggle-sidebar');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');

  // Sidebar toggle
  toggleBtn.addEventListener('click', () => {
    sidebar.classList.add('active');
    overlay.classList.add('active');
  });

  // Close sidebar on overlay click
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
  });

  // Submenu toggle with chevron rotation and content switching
  document.querySelectorAll('.has-submenu > a').forEach(menu => {
    menu.addEventListener('click', (e) => {
      e.preventDefault();
      const submenu = menu.nextElementSibling;
      const chevron = menu.querySelector('.chevron');
      const isOpen = submenu.style.display === 'block';
      submenu.style.display = isOpen ? 'none' : 'block';
      if (chevron) chevron.classList.toggle('rotate', !isOpen);
    });
  });

  // Hash-based navigation for settings screens
  function showSettingsScreenFromHash() {
    const credContent = document.getElementById('credentials-content');
    const botConfigContent = document.getElementById('bot-config-content');
    const hash = window.location.hash;
    if (hash === '#bot-configuration') {
      credContent.style.display = 'none';
      botConfigContent.style.display = 'block';
    } else {
      // Default to credentials
      credContent.style.display = 'block';
      botConfigContent.style.display = 'none';
    }
  }
  window.addEventListener('hashchange', showSettingsScreenFromHash);
  showSettingsScreenFromHash();

});


</script>
</body>
</html>
