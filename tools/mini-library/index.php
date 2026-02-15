<?php
require_once __DIR__ . '/../../classes/connect.php';

$db = new Database();

// Get major from GET parameter (default: english)
$major = isset($_GET['major']) ? strtolower(trim($_GET['major'])) : 'english';
$allowedMajors = ['english', 'korea', 'korean', 'chinese', 'japanese', 'russian'];
if (!in_array($major, $allowedMajors, true)) {
    $major = 'english';
}

// Get all unique categories from books filtered by major
$conn = $db->connect();
$majorEscaped = $conn->real_escape_string($major);
$categories = $db->read("SELECT DISTINCT category FROM library_books WHERE category IS NOT NULL AND category != '' AND major = '$majorEscaped' ORDER BY category ASC");

function h($str) {
    return htmlspecialchars((string)$str, ENT_QUOTES, 'UTF-8');
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Mini Library</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #f5f5f5;
      color: #222;
      padding: 20px;
    }

    .library-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .library-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .library-header h1 {
      font-size: 24px;
      margin-bottom: 8px;
      color: #333;
    }

    .library-header p {
      font-size: 14px;
      color: #666;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }

    .category-card {
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid #e0e0e0;
      text-decoration: none;
      color: inherit;
      display: block;
    }

    .category-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-color: #4a90e2;
    }

    .category-icon {
      font-size: 48px;
      margin-bottom: 12px;
      color: #4a90e2;
    }

    .category-name {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .category-count {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
    }

    .no-categories {
      text-align: center;
      padding: 40px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="library-container">
    <div class="library-header">
      <h1>Mini Library - <?php echo ucfirst($major); ?></h1>
      <p>Browse books by category</p>
    </div>

    <div class="categories-grid">
      <?php if ($categories && !empty($categories)): ?>
        <?php foreach ($categories as $cat): ?>
          <?php
          $categoryName = $cat['category'];
          $conn = $db->connect();
          $categoryEscaped = $conn->real_escape_string($categoryName);
          $countResult = $db->read("SELECT COUNT(*) as count FROM library_books WHERE category = '$categoryEscaped' AND major = '$majorEscaped'");
          $bookCount = $countResult ? (int)$countResult[0]['count'] : 0;
          ?>
          <a href="books.php?category=<?php echo urlencode($categoryName); ?>&major=<?php echo urlencode($major); ?>" class="category-card">
            <div class="category-icon">📚</div>
            <div class="category-name"><?php echo h($categoryName); ?></div>
            <div class="category-count"><?php echo $bookCount; ?> book<?php echo $bookCount != 1 ? 's' : ''; ?></div>
          </a>
        <?php endforeach; ?>
      <?php else: ?>
        <div class="no-categories">
          <p>No categories available</p>
        </div>
      <?php endif; ?>
    </div>
  </div>
</body>
</html>

