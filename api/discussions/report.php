<?php
/**
 * API: Report a Discussion Post
 * POST: { postId }
 * Requires Bearer token
 */

error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

require_once '../../classes/connect.php';
require_once '../auth_helper.php';

try {
    $token = getBearerToken();
    if (empty($token)) {
        echo json_encode(['success' => false, 'error' => 'Not authenticated. Please login to report.']);
        exit();
    }

    $DB = new Database();
    $conn = $DB->connect();
    $token_escaped = mysqli_real_escape_string($conn, $token);

    // Verify user
    $query = "SELECT id FROM learners WHERE auth_token = '$token_escaped' AND auth_token != '' LIMIT 1";
    $userResult = $DB->read($query);
    if (!$userResult) {
        echo json_encode(['success' => false, 'error' => 'Invalid or expired token']);
        exit();
    }

    // Parse input
    $input = json_decode(file_get_contents('php://input'), true);
    $postId = $input['postId'] ?? '';

    if (empty($postId)) {
        echo json_encode(['success' => false, 'error' => 'Post ID is required']);
        exit();
    }

    $postId_escaped = mysqli_real_escape_string($conn, $postId);

    // Check if already reported
    $query = "SELECT id FROM report WHERE post_id = '$postId_escaped' LIMIT 1";
    $existing = $DB->read($query);

    if ($existing) {
        echo json_encode(['success' => true, 'message' => 'This post has already been reported. Thank you.']);
        exit();
    }

    // Insert report
    $query = "INSERT INTO report (post_id) VALUES ('$postId_escaped')";
    $DB->save($query);

    echo json_encode(['success' => true, 'message' => 'Post reported successfully. Our team will review it.']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to report post']);
}
?>
