<?php
/**
 * API: Delete Discussion Post
 * POST: { postId }
 * Only the post owner can delete their own post
 * Requires Bearer token
 */

require_once __DIR__ . '/../bootstrap.php';

error_reporting(0);
ini_set('display_errors', 0);
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

    $userId = $userResult[0]['learner_phone'];

    // Parse input
    $input = json_decode(file_get_contents('php://input'), true);
    $postId = $input['postId'] ?? '';

    if (empty($postId)) {
        echo json_encode(['success' => false, 'error' => 'Post ID is required']);
        exit();
    }

    $postId_escaped = mysqli_real_escape_string($conn, $postId);

    // Verify ownership
    $query = "SELECT post_id, learner_id FROM posts WHERE post_id = '$postId_escaped' LIMIT 1";
    $postResult = $DB->read($query);

    if (!$postResult) {
        echo json_encode(['success' => false, 'error' => 'Post not found']);
        exit();
    }

    if ($postResult[0]['learner_id'] != $userId) {
        echo json_encode(['success' => false, 'error' => 'You can only delete your own posts']);
        exit();
    }

    // Delete the post
    $query = "DELETE FROM posts WHERE post_id = '$postId_escaped' AND learner_id = '$userId'";
    $DB->save($query);

    // Also clean up related data
    $query = "DELETE FROM hidden_posts WHERE post_id = '$postId_escaped'";
    $DB->save($query);

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to delete post']);
}
?>
