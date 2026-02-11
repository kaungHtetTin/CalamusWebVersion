<?php
/**
 * API: Get friend status between current user and another user
 * GET: otherId, major
 * Requires authentication.
 * Returns: { success, status: "friend"|"pending_sent"|"pending_received"|"none" }
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
    $major = friends_validate_major(isset($_GET['major']) ? $_GET['major'] : 'english');

    if (!$major || $otherId === '') {
        echo json_encode(['success' => false, 'error' => 'otherId and major required']);
        exit();
    }

    $myId = (string)$me['learner_phone'];
    $myIdEsc = mysqli_real_escape_string($conn, $myId);
    $otherIdEsc = mysqli_real_escape_string($conn, $otherId);

    // Are we friends?
    $friRow = $DB->read("SELECT `$major` FROM friends WHERE user_id = '$myIdEsc' LIMIT 1");
    if ($friRow && !empty($friRow[0][$major])) {
        $arr = json_decode($friRow[0][$major], true);
        if (is_array($arr) && in_array($otherId, array_column($arr, 'fri_id'), true)) {
            echo json_encode(['success' => true, 'status' => 'friend']);
            exit();
        }
    }

    // Did I send them a request? (they have me in their friend_requests)
    $reqRowOther = $DB->read("SELECT `$major` FROM friend_requests WHERE user_id = '$otherIdEsc' LIMIT 1");
    if ($reqRowOther && !empty($reqRowOther[0][$major])) {
        $arr = json_decode($reqRowOther[0][$major], true);
        if (is_array($arr) && in_array($myId, array_column($arr, 'my_id'), true)) {
            echo json_encode(['success' => true, 'status' => 'pending_sent']);
            exit();
        }
    }

    // Did they send me a request?
    $reqRowMe = $DB->read("SELECT `$major` FROM friend_requests WHERE user_id = '$myIdEsc' LIMIT 1");
    if ($reqRowMe && !empty($reqRowMe[0][$major])) {
        $arr = json_decode($reqRowMe[0][$major], true);
        if (is_array($arr) && in_array($otherId, array_column($arr, 'my_id'), true)) {
            echo json_encode(['success' => true, 'status' => 'pending_received']);
            exit();
        }
    }

    echo json_encode(['success' => true, 'status' => 'none']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error']);
}