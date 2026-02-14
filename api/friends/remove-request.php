<?php
/**
 * API: Remove an incoming friend request (decline / remove from my inbox)
 * POST: { otherId, major } — otherId = person who sent the request
 * Requires authentication.
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

    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $otherId = isset($input['otherId']) ? trim((string)$input['otherId']) : '';
    $major = friends_validate_major(isset($input['major']) ? $input['major'] : 'english');

    if (!$major || $otherId === '') {
        echo json_encode(['success' => false, 'error' => 'otherId and major required']);
        exit();
    }

    $myId = (string)$me['learner_phone'];
    $myIdEsc = mysqli_real_escape_string($conn, $myId);
    $otherIdEsc = mysqli_real_escape_string($conn, $otherId);
    $countCol = $major . '_count';

    $reqRow = $DB->read("SELECT `$major`,`$countCol` FROM friend_requests WHERE user_id = '$myIdEsc' LIMIT 1");
    if (!$reqRow || empty($reqRow[0][$major])) {
        echo json_encode(['success' => true, 'action' => 'remove request']);
        exit();
    }

    $arr = json_decode($reqRow[0][$major], true);
    if (!is_array($arr)) {
        echo json_encode(['success' => true, 'action' => 'remove request']);
        exit();
    }

    $myIds = array_column($arr, 'my_id');
    $key = array_search($otherId, $myIds);
    if ($key === false) {
        echo json_encode(['success' => true, 'action' => 'remove request']);
        exit();
    }

    array_splice($arr, $key, 1);
    $reqString = mysqli_real_escape_string($conn, json_encode($arr));
    $newCount = max(0, (int)($reqRow[0][$countCol] ?? 0) - 1);
    $DB->save("UPDATE friend_requests SET `$major` = '$reqString', `$countCol` = $newCount WHERE user_id = '$myIdEsc'");

    echo json_encode(['success' => true, 'action' => 'remove request']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error']);
}