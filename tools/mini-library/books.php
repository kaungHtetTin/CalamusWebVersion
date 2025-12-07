<?php
require_once __DIR__ . '/../../classes/connect.php';

$db = new Database();

// Get category and major from query string
$category = isset($_GET['category']) ? trim($_GET['category']) : '';
$major = isset($_GET['major']) ? strtolower(trim($_GET['major'])) : 'english';
$allowedMajors = ['english', 'korea', 'korean', 'chinese', 'japanese', 'russian'];
if (!in_array($major, $allowedMajors, true)) {
    $major = 'english';
}

if (empty($category)) {
    $redirectUrl = 'index.php?major=' . urlencode($major);
    if (isset($_GET['userid'])) {
        $redirectUrl .= '&userid=' . urlencode($userId);
    }
    header('Location: ' . $redirectUrl);
    exit;
}

// Get books for this category and major
$conn = $db->connect();
$categoryEscaped = $conn->real_escape_string($category);
$majorEscaped = $conn->real_escape_string($major);
$books = $db->read("SELECT * FROM library_books WHERE category = '$categoryEscaped' AND major = '$majorEscaped' ORDER BY created_at DESC");

function h($str) {
    return htmlspecialchars((string)$str, ENT_QUOTES, 'UTF-8');
}

function formatFileSize($bytes) {
    if ($bytes >= 1073741824) {
        return number_format($bytes / 1073741824, 2) . ' GB';
    } elseif ($bytes >= 1048576) {
        return number_format($bytes / 1048576, 2) . ' MB';
    } elseif ($bytes >= 1024) {
        return number_format($bytes / 1024, 2) . ' KB';
    } else {
        return $bytes . ' bytes';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title><?php echo h($category); ?> - Mini Library</title>
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

    .page-header {
      margin-bottom: 24px;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      color: #4a90e2;
      text-decoration: none;
      font-size: 14px;
      margin-bottom: 12px;
      gap: 6px;
    }

    .back-link:hover {
      text-decoration: underline;
    }

    .page-header h1 {
      font-size: 24px;
      margin-bottom: 4px;
      color: #333;
    }

    .page-header p {
      font-size: 14px;
      color: #666;
    }

    .books-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 20px;
    }

    .book-card {
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e0e0e0;
      transition: all 0.2s ease;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
      display: block;
    }

    .book-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .book-cover {
      width: 100%;
      height: 240px;
      background: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .book-cover img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .book-cover .pdf-icon {
      font-size: 64px;
      color: #d32f2f;
    }

    .book-info {
      padding: 12px;
    }

    .book-title {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      line-height: 1.4;
      margin-bottom: 4px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .book-meta {
      font-size: 12px;
      color: #999;
    }

    .no-books {
      text-align: center;
      padding: 60px 20px;
      color: #999;
    }

    .no-books-icon {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
  </style>
</head>
<body>
  <div class="library-container">
    <div class="page-header">
      <a href="index.php?major=<?php echo urlencode($major); ?>" class="back-link">
        ← Back to Categories
      </a>
      <h1><?php echo h($category); ?> - <?php echo ucfirst($major); ?></h1>
      <p><?php echo count($books); ?> book<?php echo count($books) != 1 ? 's' : ''; ?> available</p>
    </div>

    <?php if ($books && !empty($books)): ?>
      <div class="books-grid">
        <?php foreach ($books as $book): ?>
          <a href="download.php?id=<?php echo $book['id']; ?>&major=<?php echo urlencode($major); ?>" class="book-card">
            <div class="book-cover">
              <?php if (!empty($book['cover_image']) && file_exists('../../' . $book['cover_image'])): ?>
                <img src="../../<?php echo h($book['cover_image']); ?>" alt="<?php echo h($book['title']); ?>" />
              <?php else: ?>
                <div class="pdf-icon">📄</div>
              <?php endif; ?>
            </div>
            <div class="book-info">
              <div class="book-title"><?php echo h($book['title']); ?></div>
              <div class="book-meta">PDF</div>
            </div>
          </a>
        <?php endforeach; ?>
      </div>
    <?php else: ?>
      <div class="no-books">
        <div class="no-books-icon">📚</div>
        <p>No books available in this category</p>
      </div>
    <?php endif; ?>
  </div>
</body>
<script>
  const books = <?php echo json_encode($books); ?>;
  const bookCards = document.querySelectorAll('.book-card');
  bookCards.forEach(card => {
    card.addEventListener('click', () => {
      const bookId = card.getAttribute('data-id');
      openInBrowser('https://www.calamuseducation.com/' + books[bookId].pdf_file);
    });
  });

  function openInBrowser(link) {
      // Get link from URL parameter, or use default
      AndroidInterface.openBrowser(link); 
    }
</script>

</html>

