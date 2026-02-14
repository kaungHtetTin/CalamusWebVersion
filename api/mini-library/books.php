<?php
/**
 * API: Get Mini Library books by category
 * GET: ?major=english&category=CategoryName
 * Returns: { success, data: { books: [ { id, title, coverImage, pdfUrl, category, major, createdAt } ] } }
 * coverImage and pdfUrl are relative paths (e.g. uploads/books/...) for client to resolve.
 */
require_once __DIR__ . '/../bootstrap.php';

error_reporting(0);
ini_set('display_errors', 0);

$major = isset($_GET['major']) ? strtolower(trim($_GET['major'])) : 'english';
$category = isset($_GET['category']) ? trim($_GET['category']) : '';

$allowedMajors = ['english', 'korea', 'korean', 'chinese', 'japanese', 'russian'];
if (!in_array($major, $allowedMajors, true)) {
    $major = 'english';
}

if ($category === '') {
    echo json_encode(['success' => false, 'error' => 'Category is required']);
    exit();
}

require_once '../../classes/connect.php';

try {
    $DB = new Database();
    $conn = $DB->connect();
    $majorEscaped = $conn->real_escape_string($major);
    $categoryEscaped = $conn->real_escape_string($category);

    $rows = $DB->read("SELECT id, title, pdf_file, cover_image, category, major, created_at FROM library_books WHERE category = '$categoryEscaped' AND major = '$majorEscaped' ORDER BY created_at DESC");

    $books = [];
    if ($rows && is_array($rows)) {
        foreach ($rows as $row) {
            $pdfPath = $row['pdf_file'] ?? '';
            $coverPath = $row['cover_image'] ?? null;
            $books[] = [
                'id' => (int)$row['id'],
                'title' => $row['title'] ?? '',
                'pdfPath' => $pdfPath,
                'coverImage' => $coverPath,
                'category' => $row['category'] ?? '',
                'major' => $row['major'] ?? $major,
                'createdAt' => $row['created_at'] ?? null,
            ];
        }
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'major' => $major,
            'category' => $category,
            'books' => $books,
        ],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error']);
}
