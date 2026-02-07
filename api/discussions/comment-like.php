<?php
/**
 * API: Like/Unlike a Comment (Toggle)
 * POST: { postId, commentId } — commentId is comment.time
 * Requires authentication (Bearer token)
 * Returns: { success, count, isLiked }
 * Logic ported from LikeController::addCommentLike
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

    $userIdEsc = mysqli_real_escape_string($conn, $userId);

    $likeCheck = $DB->read("SELECT id FROM comment_likes WHERE comment_id = $commentId AND user_id = '$userIdEsc' LIMIT 1");
    $alreadyLiked = ($likeCheck && is_array($likeCheck) && count($likeCheck) > 0);

    $time = round(microtime(true) * 1000);

    if (!$alreadyLiked) {
        $DB->save("INSERT INTO comment_likes (comment_id, user_id) VALUES ($commentId, '$userIdEsc')");

        $DB->save("UPDATE comment SET likes = likes + 1 WHERE time = $commentId");

        $commentOwnerResult = $DB->read("SELECT writer_id FROM comment WHERE time = $commentId LIMIT 1");
        $commentOwnerId = ($commentOwnerResult && is_array($commentOwnerResult)) ? $commentOwnerResult[0]['writer_id'] : '';

        if ($userId != $commentOwnerId) {
            $commentOwnerEsc = mysqli_real_escape_string($conn, $commentOwnerId);
            $DB->save("INSERT INTO notification (post_id, comment_id, owner_id, writer_id, action, time, seen)
                       VALUES ($postId, $commentId, '$commentOwnerEsc', '$userIdEsc', 6, $time, 0)");
        }
        $isLiked = true;
    } else {
        $DB->save("DELETE FROM comment_likes WHERE comment_id = $commentId AND user_id = '$userIdEsc'");
        $DB->save("UPDATE comment SET likes = GREATEST(likes - 1, 0) WHERE time = $commentId");

        $DB->save("DELETE FROM notification WHERE post_id = $postId AND comment_id = $commentId AND writer_id = '$userIdEsc' AND action = 6");

        $isLiked = false;
    }

    $countResult = $DB->read("SELECT likes FROM comment WHERE time = $commentId LIMIT 1");
    $count = ($countResult && is_array($countResult)) ? (int)$countResult[0]['likes'] : 0;

    echo json_encode(['success' => true, 'count' => $count, 'isLiked' => $isLiked]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
?>
