<?php
/**
 * API: Send friend request (or unsend if already sent)
 * POST: { otherId, major }
 * Requires authentication. my_id = current user from token.
 * Returns: { success, action: "requested"|"first request"|"unsent request" } or { success: false, code: "err53" }
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
    $major = friends_validate_major(isset($input['major']) ? $input['major'] : 'english');

    if (!$major || $otherId === '') {
        echo json_encode(['success' => false, 'error' => 'otherId and major required']);
        exit();
    }

    $myId = (string)$me['learner_phone'];
    if ($myId === $otherId) {
        echo json_encode(['success' => false, 'error' => 'Cannot send request to yourself']);
        exit();
    }

    $otherIdEsc = mysqli_real_escape_string($conn, $otherId);
    $countCol = $major . '_count';

    // My friend count (max 299)
    $friRow = $DB->read("SELECT `$major`,`$countCol` FROM friends WHERE user_id = '" . mysqli_real_escape_string($conn, $myId) . "' LIMIT 1");
    $myFriCount = ($friRow && isset($friRow[0][$countCol])) ? (int)$friRow[0][$countCol] : 0;
    if ($myFriCount > $GLOBALS['MAX_FRIENDS']) {
        echo json_encode(['success' => false, 'code' => 'err53', 'error' => 'Friend limit reached']);
        exit();
    }

    // FriendRequest: user_id = person who receives (otherId); column $major = array of { my_id: sender }
    $reqRow = $DB->read("SELECT `$major`,`$countCol` FROM friend_requests WHERE user_id = '$otherIdEsc' LIMIT 1");

    if ($reqRow && !empty($reqRow[0][$major])) {
        $arr = json_decode($reqRow[0][$major], true);
        if (is_array($arr)) {
            $myIds = array_column($arr, 'my_id');
            $key = array_search($myId, $myIds);
            if ($key !== false) {
                // Unsend: remove my request
                array_splice($arr, $key, 1);
                $reqString = mysqli_real_escape_string($conn, json_encode($arr));
                $newCount = max(0, ($reqRow[0][$countCol] ?? 0) - 1);
                $DB->save("UPDATE friend_requests SET `$major` = '$reqString', `$countCol` = $newCount WHERE user_id = '$otherIdEsc'");
                echo json_encode(['success' => true, 'action' => 'unsent request']);
                exit();
            }
        }
    }

    // Send new request
    $arr = [];
    if ($reqRow && !empty($reqRow[0][$major])) {
        $dec = json_decode($reqRow[0][$major], true);
        if (is_array($dec)) {
            $arr = $dec;
        }
    }
    $arr[] = ['my_id' => $myId];
    $reqString = mysqli_real_escape_string($conn, json_encode($arr));

    if ($reqRow) {
        $currentCount = (int)($reqRow[0][$countCol] ?? 0);
        $DB->save("UPDATE friend_requests SET `$major` = '$reqString', `$countCol` = " . ($currentCount + 1) . " WHERE user_id = '$otherIdEsc'");
    } else {
        $allCols = ['user_id'];
        foreach ($GLOBALS['FRIEND_MAJORS'] as $m) {
            $allCols[] = "`$m`";
            $allCols[] = "`{$m}_count`";
        }
        $vals = ["'$otherIdEsc'"];
        foreach ($GLOBALS['FRIEND_MAJORS'] as $m) {
            $vals[] = $m === $major ? "'$reqString'" : "'[]'";
            $vals[] = $m === $major ? '1' : '0';
        }
        $DB->save("INSERT INTO friend_requests (" . implode(', ', $allCols) . ") VALUES (" . implode(', ', $vals) . ")");
    }

    $action = $reqRow ? 'requested' : 'first request';
    echo json_encode(['success' => true, 'action' => $action]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error']);
}