<?php
 include __DIR__ . '/backend/index.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Dashboard</title>
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
              <li><a href="settings.php#creds">Account setup</a></li>
              <li><a href="settings.php#bot-configuration">Bot configuration</a></li>
            </ul>
          </li>

          <li><a href="logs.php">Logs</a></li>
        </ul>
      </nav>
    </aside>

    <main class="main-content">
      <header class="topbar">
        <button class="toggle-sidebar">☰</button>
        <h1>Welcome!</h1>
      </header>
      <section class="content dashboard-content">
        <button id="btn-add-links" class="add-links-btn">Add video links</button>
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-title">Video Links added</div>
            <div class="stat-value" id="stat-videos"><?php echo $videos_count ?? 0 ?></div>
          </div>
          <div class="stat-card">
            <div class="stat-title">Last Run Time</div>
            <div class="stat-value" id="stat-last-run"><?php echo $last_run ?? '--:--:--' ?></div>
          </div>
        </div>
        <!-- Modal -->
        <div id="add-links-modal" class="modal">
          <div class="modal-content">
            <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]) ?>" method="post">
              <input type="hidden" name="type" value="add-video">
              <span class="close-modal" id="close-modal">&times;</span>
              <h2>Add Video Links</h2>
              <textarea 
                name="video-links-input"
                id="video-links-input"
                rows="6"
                style="width:100%;"
                placeholder="Paste video links here, one per line..."
                ><?php echo $video_links_text ?? null ?></textarea>
              <button id="add-links-confirm" class="bot-btn">Add</button>
             </form>
          </div>
        </div>
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

    // Submenu toggle with chevron rotation
    document.querySelectorAll('.has-submenu > a').forEach(menu => {
      menu.addEventListener('click', (e) => {
        e.preventDefault();
        const submenu = menu.nextElementSibling;
        const chevron = menu.querySelector('.chevron');

        const isOpen = submenu.style.display === 'block';
        submenu.style.display = isOpen ? 'none' : 'block';
        chevron.classList.toggle('rotate', !isOpen);
      });
    });

    // Modal logic
    const addLinksBtn = document.getElementById('btn-add-links');
    const modal = document.getElementById('add-links-modal');
    const closeModal = document.getElementById('close-modal');
    const addLinksConfirm = document.getElementById('add-links-confirm');
    const videoLinksInput = document.getElementById('video-links-input');

    addLinksBtn.addEventListener('click', () => {
      modal.classList.add('active');
    });
    closeModal.addEventListener('click', () => {
      modal.classList.remove('active');
    });
    overlay.addEventListener('click', () => {
      modal.classList.remove('active');
      overlay.classList.remove('active');
    });
    addLinksConfirm.addEventListener('click', () => {
      //const links = videoLinksInput.value.trim().split('\n').filter(Boolean);
      //videoLinksInput.value = '';
      modal.classList.remove('active');
      overlay.classList.remove('active');
    });
  });

</script>
</body>
</html>
