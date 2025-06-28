<?php
include_once __DIR__ . "/backend/logs.php";
?>
<?php if (!$ajax) { ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Dashboard | Logs</title>
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
          <li><a href="logs.php" class="active">Logs</a></li>
        </ul>
      </nav>
    </aside>
    <main class="main-content">
      <header class="topbar">
        <button class="toggle-sidebar">☰</button>
        <h1>Logs</h1>
      </header>
      <section class="content logs-content">
        <div class="logs-header">
          <h2>Activity Logs</h2>
          <button id="clear-logs" class="bot-btn" style="margin-left:auto;">Clear Logs</button>
        </div>
        <div class="logs-list" id="logs-list">
          <?php if (count($logs) > 0): ?>
            <?php foreach ($logs as $log): ?>
              <div class="log-entry">
                <strong>[<?= $log['timestamp'] ?>]</strong>
                [<?= strtoupper($log['level']) ?>]: <?= htmlspecialchars($log['message']) ?>
              </div>
            <?php endforeach; ?>
          
          <?php endif; ?>
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

      // Clear logs
      document.getElementById('clear-logs').onclick = () => {
        const formData = new FormData;
        formData.append('ajax', 'true');
        formData.append('type', 'clear-log');
        fetch('<?php echo htmlspecialchars($_SERVER['PHP_SELF']); ?>', {
          method: 'post',
          body: formData
        }).then((res) => {
          if (res.ok) {
            location.reload();
          }
        })
      };
    });
  </script>
</body>
</html>
<?php } ?>