<?php
/**
 * API: Get friend list for a user
 * GET: userId, major
 * Returns array of friends with userName, userImage, phone (learner_phone).
 * Does not require auth (public friend list).
 */

require_once __DIR__ . '/../bootstrap.php';

error_reporting(0);
ini_set('display_errors', 0);

require_once __DIR__ . '/../../classes/connect.php';
require_once 'friends_helper.php';

try {
    $userId = isset($_GET['userId']) ? trim((string)$_GET['userId']) : '';
    $major = friends_validate_major(isset($_GET['major']) ? $_GET['major'] : 'english');
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? min(50, max(1, (int)$_GET['limit'])) : 20;

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

    $total = count($list);
    $offset = ($page - 1) * $limit;
    $list = array_slice($list, $offset, $limit);
    $hasMore = ($offset + count($list)) < $total;

    echo json_encode([
        'success' => true,
        'data' => $list,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'hasMore' => $hasMore,
        ],
    ], JSON_INVALID_UTF8_SUBSTITUTE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error']);
}