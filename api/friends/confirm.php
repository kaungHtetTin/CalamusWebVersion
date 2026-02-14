<?php
/**
 * API: Accept friend request (otherId sent me a request, I accept)
 * POST: { otherId, major }
 * Requires authentication. Adds each other to both friends lists.
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

    // Check friend limits
    $myCountRow = $DB->read("SELECT `$countCol` FROM friends WHERE user_id = '$myIdEsc' LIMIT 1");
    $myFriCount = ($myCountRow && isset($myCountRow[0][$countCol])) ? (int)$myCountRow[0][$countCol] : 0;
    if ($myFriCount > $GLOBALS['MAX_FRIENDS']) {
        echo json_encode(['success' => false, 'code' => 'err53', 'error' => 'Your friend limit reached']);
        exit();
    }
    $otherCountRow = $DB->read("SELECT `$countCol` FROM friends WHERE user_id = '$otherIdEsc' LIMIT 1");
    $otherFriCount = ($otherCountRow && isset($otherCountRow[0][$countCol])) ? (int)$otherCountRow[0][$countCol] : 0;
    if ($otherFriCount > $GLOBALS['MAX_FRIENDS']) {
        echo json_encode(['success' => false, 'code' => 'err54', 'error' => 'Their friend limit reached']);
        exit();
    }

    // Remove otherId from my friend_requests (incoming request)
    $reqRow = $DB->read("SELECT `$major`,`$countCol` FROM friend_requests WHERE user_id = '$myIdEsc' LIMIT 1");
    if ($reqRow && !empty($reqRow[0][$major])) {
        $arr = json_decode($reqRow[0][$major], true);
        if (is_array($arr)) {
            $ids = array_column($arr, 'my_id');
            $key = array_search($otherId, $ids);
            if ($key !== false) {
                array_splice($arr, $key, 1);
                $reqString = mysqli_real_escape_string($conn, json_encode($arr));
                $newCount = max(0, (int)($reqRow[0][$countCol] ?? 0) - 1);
                $DB->save("UPDATE friend_requests SET `$major` = '$reqString', `$countCol` = $newCount WHERE user_id = '$myIdEsc'");
            }
        }
    }

    // Add otherId to my friends list
    $friRow = $DB->read("SELECT `$major`,`$countCol` FROM friends WHERE user_id = '$myIdEsc' LIMIT 1");
    if ($friRow && isset($friRow[0][$major])) {
        $arr = json_decode($friRow[0][$major], true);
        if (!is_array($arr)) {
            $arr = [];
        }
    } else {
        $arr = [];
    }
    $arr[] = ['fri_id' => $otherId];
    $friString = mysqli_real_escape_string($conn, json_encode($arr));
    if ($friRow) {
        $newCount = (int)($friRow[0][$countCol] ?? 0) + 1;
        $DB->save("UPDATE friends SET `$major` = '$friString', `$countCol` = $newCount WHERE user_id = '$myIdEsc'");
    } else {
        $allCols = ['user_id'];
        foreach ($GLOBALS['FRIEND_MAJORS'] as $m) {
            $allCols[] = "`$m`";
            $allCols[] = "`{$m}_count`";
        }
        $vals = ["'$myIdEsc'"];
        foreach ($GLOBALS['FRIEND_MAJORS'] as $m) {
            $vals[] = $m === $major ? "'$friString'" : "'[]'";
            $vals[] = $m === $major ? '1' : '0';
        }
        $DB->save("INSERT INTO friends (" . implode(', ', $allCols) . ") VALUES (" . implode(', ', $vals) . ")");
    }

    // Add myId to other's friends list
    $friRow2 = $DB->read("SELECT `$major`,`$countCol` FROM friends WHERE user_id = '$otherIdEsc' LIMIT 1");
    $arr2 = [];
    if ($friRow2 && !empty($friRow2[0][$major])) {
        $dec = json_decode($friRow2[0][$major], true);
        if (is_array($dec)) {
            $arr2 = $dec;
        }
    }
    $arr2[] = ['fri_id' => $myId];
    $friString2 = mysqli_real_escape_string($conn, json_encode($arr2));
    if ($friRow2) {
        $newCount2 = (int)($friRow2[0][$countCol] ?? 0) + 1;
        $DB->save("UPDATE friends SET `$major` = '$friString2', `$countCol` = $newCount2 WHERE user_id = '$otherIdEsc'");
    } else {
        $allCols = ['user_id'];
        foreach ($GLOBALS['FRIEND_MAJORS'] as $m) {
            $allCols[] = "`$m`";
            $allCols[] = "`{$m}_count`";
        }
        $vals2 = ["'$otherIdEsc'"];
        foreach ($GLOBALS['FRIEND_MAJORS'] as $m) {
            $vals2[] = $m === $major ? "'$friString2'" : "'[]'";
            $vals2[] = $m === $major ? '1' : '0';
        }
        $DB->save("INSERT INTO friends (" . implode(', ', $allCols) . ") VALUES (" . implode(', ', $vals2) . ")");
    }

    echo json_encode(['success' => true, 'action' => 'accept']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error']);
}