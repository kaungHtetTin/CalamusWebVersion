<?php
/**
 * API: Hide a Discussion Post (per user)
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
        echo json_encode(['success' => false, 'error' => 'Not authenticated']);
        exit();
    }

    $DB = new Database();
    $conn = $DB->connect();
    $token_escaped = mysqli_real_escape_string($conn, $token);

    // Get user
    $query = "SELECT id, learner_phone FROM learners WHERE auth_token = '$token_escaped' AND auth_token != '' LIMIT 1";
    $userResult = $DB->read($query);
    if (!$userResult) {
        echo json_encode(['success' => false, 'error' => 'Invalid or expired token']);
        exit();
    }

    $userDbId = $userResult[0]['id'];

    // Parse input
    $input = json_decode(file_get_contents('php://input'), true);
    $postId = $input['postId'] ?? '';

    if (empty($postId)) {
        echo json_encode(['success' => false, 'error' => 'Post ID is required']);
        exit();
    }

    $postId_escaped = mysqli_real_escape_string($conn, $postId);
    $userDbId_escaped = mysqli_real_escape_string($conn, $userDbId);

    // Check if already hidden
    $query = "SELECT id FROM hidden_posts WHERE post_id = '$postId_escaped' AND user_id = '$userDbId_escaped' LIMIT 1";
    $existing = $DB->read($query);

    if ($existing) {
        echo json_encode(['success' => true, 'message' => 'Post already hidden']);
        exit();
    }

    // Insert hidden_posts record
    $query = "INSERT INTO hidden_posts (post_id, user_id) VALUES ('$postId_escaped', '$userDbId_escaped')";
    $DB->save($query);

    echo json_encode(['success' => true, 'message' => 'Post hidden successfully']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to hide post']);
}
?>
