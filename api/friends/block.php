<?php
/**
 * API: Block a user
 * POST: { otherId }
 * Requires authentication. user_id = current user from token, blocked_user_id = otherId
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

    if ($otherId === '') {
        echo json_encode(['success' => false, 'error' => 'otherId is required']);
        exit();
    }

    $myId = (string)$me['learner_phone'];
    if ($myId === $otherId) {
        echo json_encode(['success' => false, 'error' => 'Cannot block yourself']);
        exit();
    }

    $myIdEsc = mysqli_real_escape_string($conn, $myId);
    $otherIdEsc = mysqli_real_escape_string($conn, $otherId);

    // Check if already blocked
    $checkQuery = "SELECT id FROM blocks WHERE user_id = '$myIdEsc' AND blocked_user_id = '$otherIdEsc' LIMIT 1";
    $existing = $DB->read($checkQuery);

    if ($existing && !empty($existing)) {
        echo json_encode(['success' => true, 'action' => 'already_blocked', 'message' => 'User is already blocked']);
        exit();
    }

    // Insert block record
    $insertQuery = "INSERT INTO blocks (user_id, blocked_user_id) VALUES ('$myIdEsc', '$otherIdEsc')";
    $result = $DB->save($insertQuery);

    if (!$result) {
        echo json_encode(['success' => false, 'error' => 'Failed to block user']);
        exit();
    }

    // Also unfriend if they are friends
    $major = 'english'; // Default major, can be made configurable if needed
    $countCol = $major . '_count';
    
    // Remove otherId from my friends
    $friRow = $DB->read("SELECT `$major`,`$countCol` FROM friends WHERE user_id = '$myIdEsc' LIMIT 1");
    if ($friRow && !empty($friRow[0][$major])) {
        $arr = json_decode($friRow[0][$major], true);
        if (is_array($arr)) {
            $ids = array_column($arr, 'fri_id');
            $key = array_search($otherId, $ids);
            if ($key !== false) {
                array_splice($arr, $key, 1);
                $friString = mysqli_real_escape_string($conn, json_encode($arr));
                $newCount = max(0, (int)($friRow[0][$countCol] ?? 0) - 1);
                $DB->save("UPDATE friends SET `$major` = '$friString', `$countCol` = $newCount WHERE user_id = '$myIdEsc'");
            }
        }
    }

    // Remove myId from other's friends
    $friRow2 = $DB->read("SELECT `$major`,`$countCol` FROM friends WHERE user_id = '$otherIdEsc' LIMIT 1");
    if ($friRow2 && !empty($friRow2[0][$major])) {
        $arr = json_decode($friRow2[0][$major], true);
        if (is_array($arr)) {
            $ids = array_column($arr, 'fri_id');
            $key = array_search($myId, $ids);
            if ($key !== false) {
                array_splice($arr, $key, 1);
                $friString = mysqli_real_escape_string($conn, json_encode($arr));
                $newCount = max(0, (int)($friRow2[0][$countCol] ?? 0) - 1);
                $DB->save("UPDATE friends SET `$major` = '$friString', `$countCol` = $newCount WHERE user_id = '$otherIdEsc'");
            }
        }
    }

    echo json_encode(['success' => true, 'action' => 'blocked']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error']);
}

?>
