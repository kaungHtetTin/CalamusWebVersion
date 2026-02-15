<?php
session_start();

require_once __DIR__ . '/../../classes/connect.php';
require_once __DIR__ . '/../../classes/auth.php';

// Require login
if (!isset($_SESSION['calamus_userid'])) {

    if( isset($_GET['userid'])) {
        $userId = (int) $_GET['userid'];
    }else{
        header('Location: ../../login.php');
        die;
    }
}else{
  $userId = (int) $_SESSION['calamus_userid'];
}

$major = isset($_GET['major']) ? strtolower((string) $_GET['major']) : 'english';

$db = new Database();

// Load roadmap definitions for this major
$roadmaps = $db->read("SELECT * FROM roadmaps WHERE major = '$major'") ?: [];

function h($str)
{
  return $str;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>English Roadmaps</title>
  <style>
    body {
      margin: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #f3f4f6;
      color: #111827;
    }

    .roadmap-container {
      max-width: 900px;
      margin: 24px auto;
      padding: 16px;
    }

    .roadmap-header {
      text-align: center;
      margin-bottom: 24px;
    }

    .roadmap-header h1 {
      margin: 0 0 8px;
      font-size: 24px;
    }

    .roadmap-header p {
      margin: 0;
      font-size: 14px;
      color: #6b7280;
    }

    .roadmap-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .roadmap-card {
      background: #ffffff;
      border-radius: 10px;
      border: 1px solid #e5e7eb;
      padding: 16px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
    }

    .roadmap-level {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #2563eb;
      margin-bottom: 4px;
    }

    .roadmap-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 4px;
    }

    .roadmap-subtitle {
      font-size: 13px;
      color: #6b7280;
      margin: 0 0 8px;
      min-height: 32px;
    }

    .roadmap-status {
      font-size: 12px;
      font-weight: 500;
      color: #6b7280;
    }

    .roadmap-actions {
      margin-top: auto;
    }

    .roadmap-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 8px 12px;
      border-radius: 999px;
      border: none;
      background: #2563eb;
      color: #ffffff;
      font-size: 13px;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      transition: background 0.15s ease, transform 0.05s ease, box-shadow 0.05s ease;
      box-shadow: 0 1px 2px rgba(37, 99, 235, 0.3);
    }

    .roadmap-button:hover {
      background: #1d4ed8;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(37, 99, 235, 0.35);
    }

    .roadmap-button:active {
      transform: translateY(0);
      box-shadow: 0 1px 2px rgba(37, 99, 235, 0.3);
    }

    .roadmap-button span {
      margin-left: 6px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="roadmap-container">
    <div class="roadmap-header">
      <h1>English Learning Roadmaps</h1>
      <p>Track your progress across CEFR levels from A1 to C2.</p>
    </div>

    <?php if ($roadmaps): ?>
      <div class="roadmap-list">
        <?php foreach ($roadmaps as $rm): ?>
          <article class="roadmap-card">
            <div style="flex: 1 1 auto; padding-right: 12px;">
              <h2 class="roadmap-title"><?php echo h($rm['title'] ?? 'Roadmap'); ?></h2>
              <p class="roadmap-subtitle"><?php echo h($rm['description'] ?? ''); ?></p>
            </div>

            <div class="roadmap-actions" style="flex: 0 0 auto; text-align: right;">
              <a class="roadmap-button" href="checklist.php?id=<?php echo urlencode($rm['id']); ?>&userid=<?php echo urlencode($userId); ?>">
                Open checklist
                <span>→</span>
              </a>
            </div>
          </article>
        <?php endforeach; ?>
      </div>
    <?php else: ?>
      <p style="text-align:center; color:#6b7280; font-size:14px; margin-top:24px;">
        No roadmaps are configured for this major yet.
      </p>
    <?php endif; ?>
  </div>
</body>
</html>


