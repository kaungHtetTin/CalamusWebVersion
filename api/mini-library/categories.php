<?php
/**
 * API: Get Mini Library categories (with book count per category)
 * GET: ?major=english (optional, default: english)
 * Returns: { success, data: { categories: [ { name, bookCount } ] } }
 */

error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../classes/connect.php';

$major = isset($_GET['major']) ? strtolower(trim($_GET['major'])) : 'english';
$allowedMajors = ['english', 'korea', 'korean', 'chinese', 'japanese', 'russian'];
if (!in_array($major, $allowedMajors, true)) {
    $major = 'english';
}

try {
    $DB = new Database();
    $conn = $DB->connect();
    $majorEscaped = $conn->real_escape_string($major);

    $rows = $DB->read("SELECT category AS name, COUNT(*) AS bookCount FROM library_books WHERE category IS NOT NULL AND category != '' AND major = '$majorEscaped' GROUP BY category ORDER BY name ASC");

    $categories = [];
    if ($rows && is_array($rows)) {
        foreach ($rows as $row) {
            $categories[] = [
                'name' => $row['name'],
                'bookCount' => (int)($row['bookCount'] ?? 0),
            ];
        }
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'major' => $major,
            'categories' => $categories,
        ],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error']);
}
