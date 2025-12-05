<?php
session_start();

require_once __DIR__ . '/../../classes/connect.php';
require_once __DIR__ . '/../../classes/auth.php';

// Require login to track per-user roadmap progress
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


$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

$DB = new Database();
// Ensure database connection uses UTF-8
$conn = $DB->connect();
if ($conn) {
    $conn->set_charset("utf8mb4");
}
// Query roadmaps table - MySQL JSON columns return as strings
$roadmapRows = $DB->read("SELECT * FROM roadmaps WHERE id = $id");

if(!$roadmapRows) {
    header('Location: index.php');
    exit;
}

$roadmapData = $roadmapRows[0];

// Parse checklist JSON from database
$checklistData = null;
$error = null;

if (!empty($roadmapData['checklist'])) {
    $checklistJson = $roadmapData['checklist'];
    $checklistData = json_decode($checklistJson, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        $error = 'Invalid checklist data: ' . json_last_error_msg();
        $checklistData = null;
    }
} else {
    $error = 'Checklist data not found.';
}

// Step 1: Simply show the checklist form using $checklistData
// Progress saving will be added in next steps

function h($str) {
   return $str;
}

// Load user roadmap progress
$userRoadmaps = $DB->read("SELECT * FROM user_roadmaps WHERE user_id = $userId AND roadmap_id = $id LIMIT 1");
if($userRoadmaps){
    $userRoadmapRow = $userRoadmaps[0];
    $checkedIds = json_decode($userRoadmapRow['checklist'], true);
}else{
    $userRoadmapRow = null;
    $checkedIds = [];
}


// Handle POST - Update progress when form is submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $checklistData && !$error) {
    // Get all checked item IDs from POST (unchecked items are not sent)
    $checkedIds = array_values(array_keys($_POST));
    
    // Encode checked IDs as JSON
    $progressJson = json_encode($checkedIds, JSON_UNESCAPED_UNICODE);
    $checklistJson = json_encode($checkedIds, JSON_UNESCAPED_UNICODE);
    
    if ($userRoadmapRow) {
        // Update existing record
        $rowId = (int) $userRoadmapRow['id'];
        $DB->save("UPDATE user_roadmaps SET checklist = '$checklistJson' WHERE id = $rowId");
    } else {
        // Insert new record
        $DB->save("INSERT INTO user_roadmaps (user_id, checklist,roadmap_id) VALUES ($userId, '$checklistJson', $id)");
    }
}

function is_checked($itemId, $checkedIds) {
    return in_array($itemId, $checkedIds, true);
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title><?php echo $checklistData ? h($roadmapData['title']) : 'English Roadmap Checklist'; ?></title>
  <style>
    /* All styles scoped to this container to avoid interference when used in an iframe */
    #a1-checklist, #a1-checklist * {
      box-sizing: border-box;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    #a1-checklist {
      max-width: 900px;
      margin: 0 auto;
      padding: 16px;
      background: #fafafa;
      color: #222;
      font-size: 14px;
      line-height: 1.5;
    }

    #a1-checklist h1 {
      font-size: 22px;
      margin: 0 0 8px;
      text-align: center;
    }

    #a1-checklist p.subtitle {
      text-align: center;
      margin: 0 0 16px;
      font-size: 13px;
      color: #555;
    }

    #a1-checklist section {
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 16px;
      background-color: #fff;
    }

    #a1-checklist h2 {
      font-size: 18px;
      margin: 0 0 8px;
      border-bottom: 1px solid #eee;
      padding-bottom: 4px;
    }

    #a1-checklist h3 {
      font-size: 15px;
      margin: 10px 0 6px;
    }

    #a1-checklist .group {
      margin-bottom: 6px;
      padding-left: 4px;
    }

    #a1-checklist label {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      cursor: pointer;
      margin: 2px 0;
    }

    #a1-checklist input[type="checkbox"] {
      margin-top: 2px;
      cursor: pointer;
    }

    #a1-checklist .item-text {
      flex: 1;
    }

    #a1-checklist .note {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }

    #a1-checklist details {
      margin-top: 4px;
      padding-left: 12px;
    }

    #a1-checklist summary {
      cursor: pointer;
      font-size: 13px;
      color: #444;
    }

    #a1-checklist .error {
      text-align: center;
      font-size: 13px;
      color: #b00020;
      margin: 12px 0;
    }

    /* Floating Action Button */
    .fab-update {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      background: #1976d2;
      color: #fff;
      border: none;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      transition: all 0.3s ease;
    }

    .fab-update:hover {
      background: #1565c0;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
      transform: scale(1.05);
    }

    .fab-update:active {
      transform: scale(0.95);
    }

    .fab-update:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
    }

    /* Success message */
    .save-message {
      position: fixed;
      bottom: 100px;
      right: 24px;
      background: #4caf50;
      color: #fff;
      padding: 12px 20px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 1001;
      font-size: 14px;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.3s ease;
      pointer-events: none;
    }

    .save-message.show {
      opacity: 1;
      transform: translateY(0);
    }
  </style>
</head>
<body>
  <div id="a1-checklist">
    <?php if ($error): ?>
      <h1>English Learning Roadmap</h1>
      <p class="subtitle">CEFR – Grammar, Vocabulary &amp; Functional Skills Checklist</p>
      <p class="error"><?php echo h($error); ?></p>
    <?php elseif ($checklistData): ?>
      <h1><?php echo h($roadmapData['title'] ?? 'English Learning Roadmap'); ?></h1>
      <?php if (!empty($checklistData['subtitle'])): ?>
        <p class="subtitle"><?php echo h($checklistData['subtitle']); ?></p>
      <?php endif; ?>

      <form id="a1-form" method="post" action="checklist.php?id=<?php echo h($id); ?>">
        <?php foreach ($checklistData['sections'] as $section): ?>
          <section>
            <h2><?php echo h($section['title'] ?? ''); ?></h2>

            <?php if (!empty($section['note'])): ?>
              <p class="note"><?php echo h($section['note']); ?></p>
            <?php endif; ?>

            <?php if (!empty($section['subsections']) && is_array($section['subsections'])): ?>
              <?php foreach ($section['subsections'] as $sub): ?>
                <?php if (!empty($sub['title'])): ?>
                  <h3><?php echo h($sub['title']); ?></h3>
                <?php endif; ?>

                <div class="group">
                  <?php if (!empty($sub['items']) && is_array($sub['items'])): ?>
                    <?php foreach ($sub['items'] as $item): ?>
                      <?php if (!empty($item['children']) && is_array($item['children'])): ?>
                        <div class="group">
                          <label>
                            <input type="checkbox"
                                   name="<?php echo h($item['id']); ?>"
                                   id="<?php echo h($item['id']); ?>"
                                   <?php echo is_checked($item['id'], $checkedIds) ? 'checked' : ''; ?> />
                            <span class="item-text"><?php echo h($item['label']); ?></span>
                          </label>
                          <details>
                            <summary>Sub-items</summary>
                            <?php foreach ($item['children'] as $child): ?>
                              <label>
                                <input type="checkbox"
                                       name="<?php echo h($child['id']); ?>"
                                       id="<?php echo h($child['id']); ?>"
                                       <?php echo is_checked($child['id'], $checkedIds) ? 'checked' : ''; ?> />
                                <span class="item-text"><?php echo h($child['label']); ?></span>
                              </label>
                            <?php endforeach; ?>
                          </details>
                        </div>
                      <?php else: ?>
                        <label>
                          <input type="checkbox"
                                 name="<?php echo h($item['id']); ?>"
                                 id="<?php echo h($item['id']); ?>"
                                 <?php echo is_checked($item['id'], $checkedIds) ? 'checked' : ''; ?> />
                          <span class="item-text"><?php echo h($item['label']); ?></span>
                        </label>
                      <?php endif; ?>
                    <?php endforeach; ?>
                  <?php endif; ?>
                </div>
              <?php endforeach; ?>
            <?php endif; ?>
          </section>
        <?php endforeach; ?>
      </form>

      <!-- Floating Update Button -->
      <button type="button" class="fab-update" id="update-btn" title="Save Progress">
        ✓
      </button>

      <!-- Success Message -->
      <div class="save-message" id="save-message">
        Progress saved!
      </div>
    <?php endif; ?>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const form = document.getElementById('a1-form');
      const updateBtn = document.getElementById('update-btn');
      const saveMessage = document.getElementById('save-message');

      if (form && updateBtn) {
        updateBtn.addEventListener('click', function() {
          // Disable button during submission
          updateBtn.disabled = true;
          updateBtn.textContent = '...';

          // Submit the form
          form.submit();
        });

        // Show success message if redirected after POST (check URL params)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('saved')) {
          saveMessage.classList.add('show');
          setTimeout(function() {
            saveMessage.classList.remove('show');
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname + '?id=<?php echo h($id); ?>');
          }, 3000);
        }
      }
    });
  </script>
</body>
</html>


