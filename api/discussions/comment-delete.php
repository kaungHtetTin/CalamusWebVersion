<?php
/**
 * API: Delete a Comment (owner only)
 * POST: { postId, commentId } — commentId is comment.time
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

    $userResult = $DB->read("SELECT learner_phone FROM learners WHERE auth_token = '$tokenEscaped' LIMIT 1");
    if (!$userResult || !is_array($userResult) || count($userResult) === 0) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid token']);
        exit();
    }
    $userId = $userResult[0]['learner_phone'];

    $input = json_decode(file_get_contents('php://input'), true);
    $postId = isset($input['postId']) ? (int)$input['postId'] : 0;
    $commentId = isset($input['commentId']) ? (int)$input['commentId'] : 0;

    if ($postId <= 0 || $commentId <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid post or comment ID']);
        exit();
    }

    $commentResult = $DB->read("SELECT writer_id FROM comment WHERE time = $commentId AND post_id = $postId LIMIT 1");
    if (!$commentResult || !is_array($commentResult) || count($commentResult) === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Comment not found']);
        exit();
    }

    $writerId = $commentResult[0]['writer_id'];
    if ($writerId != $userId) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'You can only delete your own comments']);
        exit();
    }

    // Get reply IDs to clean up comment_likes
    $replies = $DB->read("SELECT time FROM comment WHERE parent = $commentId");
    $ids = [$commentId];
    if ($replies && is_array($replies)) {
        foreach ($replies as $r) {
            $ids[] = (int)$r['time'];
        }
    }
    $idList = implode(',', $ids);
    $DB->save("DELETE FROM comment_likes WHERE comment_id IN ($idList)");
    $DB->save("DELETE FROM comment WHERE time = $commentId OR parent = $commentId");
    // Update posts comment count - we need to recalc or decrement; recalc is safer
    $countResult = $DB->read("SELECT COUNT(*) as c FROM comment WHERE post_id = $postId");
    $newCount = ($countResult && is_array($countResult)) ? (int)$countResult[0]['c'] : 0;
    $DB->save("UPDATE posts SET comments = $newCount WHERE post_id = $postId");

    echo json_encode(['success' => true, 'message' => 'Comment deleted', 'commentsCount' => $newCount]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
?>
