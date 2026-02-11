<?php
/**
 * API: Check if a user is blocked (either direction)
 * GET: ?otherId={otherId}
 * Requires authentication.
 * Returns: { success: true, blocked: true|false, blocked_by_me: true|false, blocked_by_other: true|false }
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

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

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

    $otherId = isset($_GET['otherId']) ? trim((string)$_GET['otherId']) : '';

    if ($otherId === '') {
        echo json_encode(['success' => false, 'error' => 'otherId is required']);
        exit();
    }

    $myId = (string)$me['learner_phone'];
    $myIdEsc = mysqli_real_escape_string($conn, $myId);
    $otherIdEsc = mysqli_real_escape_string($conn, $otherId);

    // Check if I blocked the other user
    $blockedByMeQuery = "SELECT id FROM blocks WHERE user_id = '$myIdEsc' AND blocked_user_id = '$otherIdEsc' LIMIT 1";
    $blockedByMe = $DB->read($blockedByMeQuery);
    $blockedByMeResult = $blockedByMe && !empty($blockedByMe);

    // Check if the other user blocked me
    $blockedByOtherQuery = "SELECT id FROM blocks WHERE user_id = '$otherIdEsc' AND blocked_user_id = '$myIdEsc' LIMIT 1";
    $blockedByOther = $DB->read($blockedByOtherQuery);
    $blockedByOtherResult = $blockedByOther && !empty($blockedByOther);

    // Blocked if either side has blocked
    $isBlocked = $blockedByMeResult || $blockedByOtherResult;

    echo json_encode([
        'success' => true,
        'blocked' => $isBlocked,
        'blocked_by_me' => $blockedByMeResult,
        'blocked_by_other' => $blockedByOtherResult,
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error']);
}

?>
