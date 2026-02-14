<?php
/**
 * API: Mark Notifications as Read
 * POST: Marks all notifications as seen for authenticated user
 * Requires Bearer token in Authorization header
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
    // Extract Bearer token
    $token = getBearerToken();

    if (empty($token)) {
        echo json_encode(['success' => false, 'error' => 'Not authenticated']);
        exit();
    }

    $DB = new Database();
    $conn = $DB->connect();
    $token_escaped = mysqli_real_escape_string($conn, $token);

    // Get user by token
    $query = "SELECT learner_phone FROM learners WHERE auth_token = '$token_escaped' AND auth_token != '' LIMIT 1";
    $userResult = $DB->read($query);

    if (!$userResult) {
        echo json_encode(['success' => false, 'error' => 'Invalid or expired token']);
        exit();
    }

    $userId = $userResult[0]['learner_phone'];

    // Mark all as read
    $query = "UPDATE notification SET seen = 1 WHERE owner_id = '$userId' AND seen = 0";
    $DB->save($query);

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to mark notifications as read']);
}
?>
