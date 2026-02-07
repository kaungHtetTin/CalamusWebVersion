<?php
/**
 * API: Get Notifications
 * GET: Returns notifications for authenticated user
 * Requires Bearer token in Authorization header
 */

error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
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
    $query = "SELECT id, learner_phone FROM learners WHERE auth_token = '$token_escaped' AND auth_token != '' LIMIT 1";
    $userResult = $DB->read($query);

    if (!$userResult) {
        echo json_encode(['success' => false, 'error' => 'Invalid or expired token']);
        exit();
    }

    $userId = $userResult[0]['learner_phone'];

    // Fetch notifications
    $query = "SELECT
        learners.learner_name as writer_name,
        learners.learner_image as writer_image,
        posts.post_id,
        posts.body,
        posts.image as post_image,
        notification.id,
        notification.time,
        notification.seen,
        notification.action,
        notification.comment_id,
        notification_action.action_name as taking_action
    FROM notification 
    JOIN posts ON posts.post_id = notification.post_id
    JOIN learners ON learners.learner_phone = notification.writer_id
    JOIN notification_action ON notification_action.action = notification.action
    WHERE notification.owner_id = '$userId'
    ORDER BY notification.time DESC
    LIMIT 50";

    $result = $DB->read($query);
    $notifications = [];

    if ($result && is_array($result)) {
        foreach ($result as $row) {
            $notifications[] = [
                'id' => (int)$row['id'],
                'postId' => (int)$row['post_id'],
                'commentId' => (int)$row['comment_id'],
                'writerName' => $row['writer_name'],
                'writerImage' => $row['writer_image'],
                'postBody' => mb_substr(mb_convert_encoding($row['body'] ?? '', 'UTF-8', 'UTF-8'), 0, 100),
                'postImage' => $row['post_image'],
                'action' => $row['taking_action'],
                'time' => (int)$row['time'],
                'seen' => (int)$row['seen'],
            ];
        }
    }

    // Get unread count
    $query = "SELECT COUNT(*) as count FROM notification WHERE seen = 0 AND owner_id = '$userId'";
    $countResult = $DB->read($query);
    $unreadCount = $countResult ? (int)$countResult[0]['count'] : 0;

    echo json_encode([
        'success' => true,
        'data' => [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
        ]
    ], JSON_INVALID_UTF8_SUBSTITUTE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to fetch notifications']);
}
?>
