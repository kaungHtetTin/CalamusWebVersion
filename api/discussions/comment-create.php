<?php
/**
 * API: Create a Comment or Reply
 * POST: { postId, body, parent? } — parent is comment.time for replies, omit or 0 for top-level
 * Requires authentication (Bearer token)
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
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

require_once '../../classes/connect.php';
require_once '../auth_helper.php';

try {
    $token = getBearerToken();
    if (empty($token)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Not authenticated']);
        exit();
    }

    $DB = new Database();
    $conn = $DB->connect();
    $tokenEscaped = mysqli_real_escape_string($conn, $token);

    $userResult = $DB->read("SELECT learner_phone, learner_name, learner_image FROM learners WHERE auth_token = '$tokenEscaped' LIMIT 1");
    if (!$userResult || !is_array($userResult) || count($userResult) === 0) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid token']);
        exit();
    }
    $userId = $userResult[0]['learner_phone'];
    $userName = $userResult[0]['learner_name'] ?? 'Anonymous';
    $userImage = $userResult[0]['learner_image'] ?? '';

    $input = json_decode(file_get_contents('php://input'), true);
    $postId = isset($input['postId']) ? (int)$input['postId'] : 0;
    $body = isset($input['body']) ? trim($input['body']) : '';
    $parent = isset($input['parent']) ? (int)$input['parent'] : 0;

    if ($postId <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid post ID']);
        exit();
    }
    if ($body === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Comment body is required']);
        exit();
    }

    $postCheck = $DB->read("SELECT post_id FROM posts WHERE post_id = $postId LIMIT 1");
    if (!$postCheck || !is_array($postCheck) || count($postCheck) === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Post not found']);
        exit();
    }

    if ($parent > 0) {
        $parentCheck = $DB->read("SELECT time FROM comment WHERE time = $parent AND post_id = $postId LIMIT 1");
        if (!$parentCheck || !is_array($parentCheck) || count($parentCheck) === 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Parent comment not found']);
            exit();
        }
    }

    $time = (int)round(microtime(true) * 1000);
    $bodyEsc = mysqli_real_escape_string($conn, $body);
    $userIdEsc = mysqli_real_escape_string($conn, $userId);

    $DB->save("INSERT INTO comment (post_id, writer_id, body, image, time, parent, likes) 
               VALUES ($postId, '$userIdEsc', '$bodyEsc', '', $time, $parent, 0)");

    $DB->save("UPDATE posts SET comments = comments + 1 WHERE post_id = $postId");

    $comment = [
        'id' => 0,
        'postId' => $postId,
        'writerId' => $userId,
        'body' => $body,
        'image' => '',
        'time' => $time,
        'parent' => $parent,
        'likes' => 0,
        'userName' => $userName,
        'userImage' => $userImage ?: 'https://www.calamuseducation.com/uploads/placeholder.png',
        'isLiked' => 0,
        'replies' => [],
    ];

    echo json_encode(['success' => true, 'comment' => $comment]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
?>
