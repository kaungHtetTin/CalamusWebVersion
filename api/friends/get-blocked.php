<?php
/**
 * API: Get blocked users list
 * GET: Returns list of users blocked by the current user
 * Requires authentication.
 */

require_once __DIR__ . '/../bootstrap.php';

error_reporting(0);
ini_set('display_errors', 0);
require_once '../../classes/connect.php';
require_once '../auth_helper.php';
require_once 'friends_helper.php';

try {
    $DB = new Database();
    $conn = $DB->connect();

    $me = friends_get_current_user($DB, $conn);
    if (!$me) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Not authenticated']);
        exit();
    }

    $myId = (string)$me['learner_phone'];
    $myIdEsc = mysqli_real_escape_string($conn, $myId);

    // Get blocked users with their profile info
    $query = "SELECT b.blocked_user_id, l.learner_name, l.learner_image, l.learner_phone 
              FROM blocks b 
              JOIN learners l ON b.blocked_user_id = l.learner_phone 
              WHERE b.user_id = '$myIdEsc'";
    
    $result = $DB->read($query);
    $blockedUsers = [];

    if ($result && is_array($result)) {
        foreach ($result as $row) {
            $blockedUsers[] = [
                'id' => $row['blocked_user_id'],
                'name' => $row['learner_name'],
                'image' => $row['learner_image'],
                'phone' => $row['learner_phone']
            ];
        }
    }

    echo json_encode([
        'success' => true,
        'data' => $blockedUsers
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error']);
}
?>
