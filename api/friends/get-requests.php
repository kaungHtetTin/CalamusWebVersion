<?php
/**
 * API: Get my incoming friend requests + people you may know
 * GET: major (optional). Requires authentication.
 * Returns: { request: [...], people: [...] }
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

    $major = friends_validate_major(isset($_GET['major']) ? $_GET['major'] : 'english');
    if (!$major) {
        $major = 'english';
    }

    $myId = (string)$me['learner_phone'];
    $myIdEsc = mysqli_real_escape_string($conn, $myId);

    // Incoming requests: friend_requests where user_id = me, column $major has [ { my_id: sender } ]
    $requestList = [];
    $reqRow = $DB->read("SELECT `$major` FROM friend_requests WHERE user_id = '$myIdEsc' LIMIT 1");
    if ($reqRow && !empty($reqRow[0][$major])) {
        $arr = json_decode($reqRow[0][$major], true);
        if (is_array($arr)) {
            $senderIds = array_column($arr, 'my_id');
            $senderIds = array_reverse($senderIds);
            foreach ($senderIds as $uid) {
                $uidEsc = mysqli_real_escape_string($conn, $uid);
                $user = $DB->read("SELECT learner_name as userName, learner_image as userImage, learner_phone as phone FROM learners WHERE learner_phone = '$uidEsc' LIMIT 1");
                if ($user && !empty($user[0])) {
                    $requestList[] = [
                        'userName' => $user[0]['userName'],
                        'userImage' => $user[0]['userImage'],
                        'phone' => (string)$user[0]['phone'],
                        'userId' => (string)$user[0]['phone'],
                    ];
                }
            }
        }
    }

    // People you may know: learners not in my friends, not in my requests, and not people who already sent me request
    $limit = 40;
    $learners = $DB->read("SELECT learner_phone as phone, learner_name as userName, learner_image as userImage FROM learners ORDER BY id DESC LIMIT " . ($limit + 100));
    $people = [];
    $myFriendIds = [];
    $friRow = $DB->read("SELECT `$major` FROM friends WHERE user_id = '$myIdEsc' LIMIT 1");
    if ($friRow && !empty($friRow[0][$major])) {
        $dec = json_decode($friRow[0][$major], true);
        if (is_array($dec)) {
            $myFriendIds = array_column($dec, 'fri_id');
        }
    }
    $requestSenderIds = array_column($requestList, 'phone');
    $alreadySentMeIds = [];
    $reqRow2 = $DB->read("SELECT `$major` FROM friend_requests WHERE user_id = '$myIdEsc' LIMIT 1");
    if ($reqRow2 && !empty($reqRow2[0][$major])) {
        $dec = json_decode($reqRow2[0][$major], true);
        if (is_array($dec)) {
            $alreadySentMeIds = array_column($dec, 'my_id');
        }
    }

    foreach ($learners as $row) {
        $phone = (string)$row['phone'];
        if ($phone === $myId) {
            continue;
        }
        if (in_array($phone, $myFriendIds, true)) {
            continue;
        }
        if (in_array($phone, $requestSenderIds, true)) {
            continue;
        }
        if (in_array($phone, $alreadySentMeIds, true)) {
            continue;
        }
        $people[] = [
            'userName' => $row['userName'],
            'userImage' => $row['userImage'],
            'phone' => $phone,
            'userId' => $phone,
        ];
        if (count($people) >= $limit) {
            break;
        }
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'request' => $requestList,
            'people' => $people,
        ],
    ], JSON_INVALID_UTF8_SUBSTITUTE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error']);
}