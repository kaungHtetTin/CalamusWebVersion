<?php
require_once __DIR__ . '/../../classes/connect.php';

$db = new Database();
$message = '';
$messageType = '';

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = isset($_POST['title']) ? trim($_POST['title']) : '';
    $category = isset($_POST['category']) ? trim($_POST['category']) : '';
    $major = isset($_POST['major']) ? strtolower(trim($_POST['major'])) : 'english';
    
    $allowedMajors = ['english', 'korea', 'korean', 'chinese', 'japanese', 'russian'];
    if (!in_array($major, $allowedMajors, true)) {
        $major = 'english';
    }
    
    // Validate required fields
    if (empty($title)) {
        $message = 'Title is required';
        $messageType = 'error';
    } elseif (empty($category)) {
        $message = 'Category is required';
        $messageType = 'error';
    } elseif (!isset($_FILES['pdf_file']) || $_FILES['pdf_file']['error'] !== UPLOAD_ERR_OK) {
        $message = 'PDF file is required';
        $messageType = 'error';
    } else {
        // Create upload directory if it doesn't exist
        $uploadDir = __DIR__ . '/../../../uploads/books/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        // Handle PDF upload
        $pdfFile = $_FILES['pdf_file'];
        $pdfExtension = strtolower(pathinfo($pdfFile['name'], PATHINFO_EXTENSION));
        
        if ($pdfExtension !== 'pdf') {
            $message = 'Only PDF files are allowed';
            $messageType = 'error';
        } else {
            $pdfFileName = uniqid() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $pdfFile['name']);
            $pdfPath = $uploadDir . $pdfFileName;
            
            if (move_uploaded_file($pdfFile['tmp_name'], $pdfPath)) {
                $pdfRelativePath = 'uploads/books/' . $pdfFileName;
                $coverRelativePath = null;
                
                // Handle cover image upload (optional)
                if (isset($_FILES['cover_image']) && $_FILES['cover_image']['error'] === UPLOAD_ERR_OK) {
                    $coverFile = $_FILES['cover_image'];
                    $coverExtension = strtolower(pathinfo($coverFile['name'], PATHINFO_EXTENSION));
                    $allowedImageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
                    
                    if (in_array($coverExtension, $allowedImageExtensions, true)) {
                        $coverFileName = uniqid() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $coverFile['name']);
                        $coverPath = $uploadDir . $coverFileName;
                        
                        if (move_uploaded_file($coverFile['tmp_name'], $coverPath)) {
                            $coverRelativePath = 'uploads/books/' . $coverFileName;
                        }
                    }
                }
                
                // Save to database
                $conn = $db->connect();
                $titleEscaped = $conn->real_escape_string($title);
                $categoryEscaped = $conn->real_escape_string($category);
                $pdfEscaped = $conn->real_escape_string($pdfRelativePath);
                $coverEscaped = $coverRelativePath ? $conn->real_escape_string($coverRelativePath) : 'NULL';
                $majorEscaped = $conn->real_escape_string($major);
                
                $coverSql = $coverEscaped !== 'NULL' ? "'$coverEscaped'" : 'NULL';
                $query = "INSERT INTO library_books (title, pdf_file, cover_image, category, major) VALUES ('$titleEscaped', '$pdfEscaped', $coverSql, '$categoryEscaped', '$majorEscaped')";
                
                if ($db->save($query)) {
                    $message = 'Book uploaded successfully!';
                    $messageType = 'success';
                    // Clear form
                    $_POST = [];
                } else {
                    $message = 'Failed to save book to database';
                    $messageType = 'error';
                    // Clean up uploaded files
                    @unlink($pdfPath);
                    if ($coverRelativePath) {
                        @unlink($coverPath);
                    }
                }
            } else {
                $message = 'Failed to upload PDF file';
                $messageType = 'error';
            }
        }
    }
}

// Get existing categories for dropdown
$conn = $db->connect();
$existingCategories = $db->read("SELECT DISTINCT category FROM library_books WHERE category IS NOT NULL AND category != '' ORDER BY category ASC");

function h($str) {
    return htmlspecialchars((string)$str, ENT_QUOTES, 'UTF-8');
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Upload Book - Mini Library</title>
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

    .upload-container {
      max-width: 600px;
      margin: 0 auto;
      background: #fff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .upload-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .upload-header h1 {
      font-size: 24px;
      margin-bottom: 8px;
      color: #333;
    }

    .upload-header p {
      font-size: 14px;
      color: #666;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 6px;
      color: #333;
    }

    .form-group label .required {
      color: #d32f2f;
    }

    .form-group input[type="text"],
    .form-group select {
      width: 100%;
      padding: 10px 12px;
      font-size: 14px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-family: inherit;
    }

    .form-group input[type="text"]:focus,
    .form-group select:focus {
      outline: none;
      border-color: #4a90e2;
      box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
    }

    .form-group input[type="file"] {
      width: 100%;
      padding: 8px;
      font-size: 14px;
      border: 1px solid #ddd;
      border-radius: 6px;
      background: #fafafa;
      cursor: pointer;
    }

    .form-group .file-info {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }

    .form-group .help-text {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
    }

    .message {
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .message.success {
      background: #e8f5e9;
      color: #2e7d32;
      border: 1px solid #c8e6c9;
    }

    .message.error {
      background: #ffebee;
      color: #c62828;
      border: 1px solid #ffcdd2;
    }

    .submit-btn {
      width: 100%;
      padding: 12px;
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      background: #4a90e2;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .submit-btn:hover {
      background: #357abd;
    }

    .submit-btn:active {
      transform: scale(0.98);
    }

    .category-suggestions {
      margin-top: 8px;
    }

    .suggestions-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 6px;
    }

    .suggestions-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .suggestion-tag {
      display: inline-block;
      padding: 4px 10px;
      font-size: 12px;
      background: #e3f2fd;
      color: #1976d2;
      border: 1px solid #90caf9;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .suggestion-tag:hover {
      background: #bbdefb;
      border-color: #64b5f6;
      transform: translateY(-1px);
    }

    .suggestion-tag:active {
      transform: scale(0.95);
    }
  </style>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const categoryInput = document.getElementById('category-input');
      const suggestionTags = document.querySelectorAll('.suggestion-tag');
      
      suggestionTags.forEach(function(tag) {
        tag.addEventListener('click', function() {
          const category = this.getAttribute('data-category');
          categoryInput.value = category;
          categoryInput.focus();
        });
      });
    });
  </script>
</head>
<body>
  <div class="upload-container">
    <div class="upload-header">
      <h1>Upload Book</h1>
      <p>Add a new book to the library</p>
    </div>

    <?php if ($message): ?>
      <div class="message <?php echo $messageType; ?>">
        <?php echo h($message); ?>
      </div>
    <?php endif; ?>

    <form method="post" enctype="multipart/form-data">
      <div class="form-group">
        <label>Title <span class="required">*</span></label>
        <input type="text" name="title" value="<?php echo isset($_POST['title']) ? h($_POST['title']) : ''; ?>" required />
      </div>

      <div class="form-group">
        <label>Category <span class="required">*</span></label>
        <input type="text" name="category" id="category-input" list="categories" value="<?php echo isset($_POST['category']) ? h($_POST['category']) : ''; ?>" required autocomplete="off" />
        <datalist id="categories">
          <?php if ($existingCategories): ?>
            <?php foreach ($existingCategories as $cat): ?>
              <option value="<?php echo h($cat['category']); ?>">
            <?php endforeach; ?>
          <?php endif; ?>
        </datalist>
        <?php if ($existingCategories && !empty($existingCategories)): ?>
          <div class="category-suggestions">
            <div class="suggestions-label">Suggested categories:</div>
            <div class="suggestions-tags">
              <?php foreach ($existingCategories as $cat): ?>
                <span class="suggestion-tag" data-category="<?php echo h($cat['category']); ?>"><?php echo h($cat['category']); ?></span>
              <?php endforeach; ?>
            </div>
          </div>
        <?php endif; ?>
        <div class="help-text">Click a suggested category above or type to create a new one</div>
      </div>

      <div class="form-group">
        <label>Major <span class="required">*</span></label>
        <select name="major" required>
          <option value="english" <?php echo (isset($_POST['major']) && $_POST['major'] === 'english') || !isset($_POST['major']) ? 'selected' : ''; ?>>English</option>
          <option value="korea" <?php echo isset($_POST['major']) && $_POST['major'] === 'korea' ? 'selected' : ''; ?>>Korea</option>
          <option value="korean" <?php echo isset($_POST['major']) && $_POST['major'] === 'korean' ? 'selected' : ''; ?>>Korean</option>
          <option value="chinese" <?php echo isset($_POST['major']) && $_POST['major'] === 'chinese' ? 'selected' : ''; ?>>Chinese</option>
          <option value="japanese" <?php echo isset($_POST['major']) && $_POST['major'] === 'japanese' ? 'selected' : ''; ?>>Japanese</option>
          <option value="russian" <?php echo isset($_POST['major']) && $_POST['major'] === 'russian' ? 'selected' : ''; ?>>Russian</option>
        </select>
      </div>

      <div class="form-group">
        <label>PDF File <span class="required">*</span></label>
        <input type="file" name="pdf_file" accept=".pdf" required />
        <div class="help-text">Only PDF files are allowed</div>
      </div>

      <div class="form-group">
        <label>Cover Image (Optional)</label>
        <input type="file" name="cover_image" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" />
        <div class="help-text">JPG, PNG, GIF, or WebP format</div>
      </div>

      <button type="submit" class="submit-btn">Upload Book</button>
    </form>
  </div>
</body>
</html>

