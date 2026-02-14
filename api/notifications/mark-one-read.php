<?php
/**
 * API: Mark one notification as read (seen)
 * POST: { notificationId } - id of the notification row
 * Requires Bearer token. Only marks if notification.owner_id = current user.
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

    $userResult = $DB->read("SELECT learner_phone FROM learners WHERE auth_token = '$token_escaped' AND auth_token != '' LIMIT 1");
    if (!$userResult) {
        echo json_encode(['success' => false, 'error' => 'Invalid or expired token']);
        exit();
    }

    $userId = $userResult[0]['learner_phone'];

    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $notificationId = isset($input['notificationId']) ? (int)$input['notificationId'] : 0;

    if ($notificationId <= 0) {
        echo json_encode(['success' => false, 'error' => 'notificationId required']);
        exit();
    }

    $userId_escaped = mysqli_real_escape_string($conn, $userId);

    $DB->save("UPDATE notification SET seen = 1 WHERE id = $notificationId AND owner_id = '$userId_escaped' AND seen = 0");

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to mark notification as read']);
}
?>
