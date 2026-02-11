<?php
/**
 * API: Get friend list for a user
 * GET: userId, major
 * Returns array of friends with userName, userImage, phone (learner_phone).
 * Does not require auth (public friend list).
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
require_once 'friends_helper.php';

try {
    $userId = isset($_GET['userId']) ? trim((string)$_GET['userId']) : '';
    $major = friends_validate_major(isset($_GET['major']) ? $_GET['major'] : 'english');

    if (!$major || $userId === '') {
        echo json_encode(['success' => false, 'error' => 'userId and major required']);
        exit();
    }

    $DB = new Database();
    $conn = $DB->connect();
    $userIdEsc = mysqli_real_escape_string($conn, $userId);

    $friendRow = $DB->read("SELECT `$major` FROM friends WHERE user_id = '$userIdEsc' LIMIT 1");
    $list = [];
    if ($friendRow && !empty($friendRow[0][$major])) {
        $friArr = json_decode($friendRow[0][$major], true);
        if (is_array($friArr)) {
            $friIds = array_column($friArr, 'fri_id');
            $friIds = array_reverse($friIds);
            foreach ($friIds as $uid) {
                $uidEsc = mysqli_real_escape_string($conn, $uid);
                $user = $DB->read("SELECT learner_name as userName, learner_image as userImage, learner_phone as phone FROM learners WHERE learner_phone = '$uidEsc' LIMIT 1");
                if ($user && !empty($user[0])) {
                    $list[] = [
                        'userName' => $user[0]['userName'],
                        'userImage' => $user[0]['userImage'],
                        'phone' => (string)$user[0]['phone'],
                        'userId' => (string)$user[0]['phone'],
                    ];
                }
            }
        }
    }

    echo json_encode(['success' => true, 'data' => $list], JSON_INVALID_UTF8_SUBSTITUTE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error']);
}