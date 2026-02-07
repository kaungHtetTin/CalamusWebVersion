<?php
/**
 * API: Like/Unlike a Post (Toggle)
 * POST: { postId }
 * Requires authentication (Bearer token)
 * Returns: { success, count, isLiked }
 * 
 * Logic ported from original Laravel LikeController::addPostLike
 * Uses mylikes table with JSON array of user_ids and rowNo sharding
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
    // Authenticate user
    $token = getBearerToken();
    if (empty($token)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Not authenticated']);
        exit();
    }

    $DB = new Database();
    $conn = $DB->connect();

    // Validate token and get user
    $tokenEscaped = mysqli_real_escape_string($conn, $token);
    $userResult = $DB->read("SELECT learner_phone, learner_name FROM learners WHERE auth_token = '$tokenEscaped' LIMIT 1");

    if (!$userResult || !is_array($userResult) || count($userResult) === 0) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid token']);
        exit();
    }

    $userId = $userResult[0]['learner_phone'];

    // Get post ID from request
    $input = json_decode(file_get_contents('php://input'), true);
    $postId = isset($input['postId']) ? (int)$input['postId'] : 0;

    if ($postId <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid post ID']);
        exit();
    }

    // Verify post exists and get owner
    $postResult = $DB->read("SELECT post_id, learner_id, post_like FROM posts WHERE post_id = $postId LIMIT 1");
    if (!$postResult || !is_array($postResult) || count($postResult) === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Post not found']);
        exit();
    }

    $postOwnerId = $postResult[0]['learner_id'];
    $time = round(microtime(true) * 1000);

    // Check existing likes rows for this post
    $likeRows = $DB->read("SELECT * FROM mylikes WHERE content_id = $postId");
    $rowCount = ($likeRows && is_array($likeRows)) ? count($likeRows) : 0;

    $isLiked = false; // Will be true if we LIKED (false if we UNLIKED)

    if ($rowCount === 0) {
        // ---- First like ever on this post ----
        $arr = [['user_id' => $userId]];
        $likesJson = mysqli_real_escape_string($conn, json_encode($arr));

        $DB->save("INSERT INTO mylikes (content_id, likes, rowNo) VALUES ($postId, '$likesJson', 0)
                   ON DUPLICATE KEY UPDATE likes = '$likesJson'");

        // Increment post like count
        $DB->save("UPDATE posts SET post_like = post_like + 1 WHERE post_id = $postId");

        // Create notification if liker != post owner
        if ($userId != $postOwnerId) {
            $userIdEsc = mysqli_real_escape_string($conn, $userId);
            $DB->save("INSERT INTO notification (post_id, comment_id, owner_id, writer_id, action, time, seen)
                       VALUES ($postId, 0, '$postOwnerId', '$userIdEsc', 5, $time, 0)");
        }

        $isLiked = true;

    } else {
        // ---- Rows exist, check if user already liked ----
        $alreadyLike = false;
        $foundRowNo = 0;
        $foundKey = 0;
        $foundLikesArr = [];
        $tempCount = 0;

        foreach ($likeRows as $row) {
            $likesArrTemp = json_decode($row['likes'], true);
            if ($likesArrTemp && is_array($likesArrTemp)) {
                $userIds = array_column($likesArrTemp, 'user_id');
                $searchKey = array_search($userId, $userIds);
                if ($searchKey !== false) {
                    $alreadyLike = true;
                    $foundKey = $searchKey;
                    $foundRowNo = (int)$row['rowNo'];
                    $foundLikesArr = $likesArrTemp;
                    break;
                }
            }
            $tempCount++;
        }

        if ($alreadyLike) {
            // ---- UNLIKE: Remove user from likes array ----
            array_splice($foundLikesArr, $foundKey, 1);
            $likesString = mysqli_real_escape_string($conn, json_encode($foundLikesArr));

            $DB->save("UPDATE mylikes SET likes = '$likesString' WHERE content_id = $postId AND rowNo = $foundRowNo");

            // Decrement post like count
            $DB->save("UPDATE posts SET post_like = GREATEST(post_like - 1, 0) WHERE post_id = $postId");

            // Remove notification
            $userIdEsc = mysqli_real_escape_string($conn, $userId);
            $DB->save("DELETE FROM notification WHERE post_id = $postId AND writer_id = '$userIdEsc' AND action = 5");

            $isLiked = false;

        } else {
            // ---- LIKE: Add user to likes array ----

            // Increment post like count
            $DB->save("UPDATE posts SET post_like = post_like + 1 WHERE post_id = $postId");

            // Create notification if liker != post owner
            if ($userId != $postOwnerId) {
                $userIdEsc = mysqli_real_escape_string($conn, $userId);
                $DB->save("INSERT INTO notification (post_id, comment_id, owner_id, writer_id, action, time, seen)
                           VALUES ($postId, 0, '$postOwnerId', '$userIdEsc', 5, $time, 0)");
            }

            // Calculate rowNo based on like count (sharding: 2000 likes per row)
            $likeCountResult = $DB->read("SELECT post_like FROM posts WHERE post_id = $postId LIMIT 1");
            $currentLikeCount = ($likeCountResult && is_array($likeCountResult)) ? (int)$likeCountResult[0]['post_like'] : 0;
            $rowNo = (int)round($currentLikeCount / 2000);

            // Get existing likes array for this rowNo, or start fresh
            $existingRow = $DB->read("SELECT likes FROM mylikes WHERE content_id = $postId AND rowNo = $rowNo LIMIT 1");
            $likesArr = [];
            if ($existingRow && is_array($existingRow) && count($existingRow) > 0) {
                $decoded = json_decode($existingRow[0]['likes'], true);
                if ($decoded && is_array($decoded)) {
                    $likesArr = $decoded;
                }
            }

            // Append this user
            $likesArr[] = ['user_id' => $userId];
            $likesString = mysqli_real_escape_string($conn, json_encode($likesArr));

            // Upsert into mylikes
            $DB->save("INSERT INTO mylikes (content_id, likes, rowNo) VALUES ($postId, '$likesString', $rowNo)
                       ON DUPLICATE KEY UPDATE likes = '$likesString'");

            $isLiked = true;
        }
    }

    // Get updated like count
    $updatedPost = $DB->read("SELECT post_like FROM posts WHERE post_id = $postId LIMIT 1");
    $finalCount = ($updatedPost && is_array($updatedPost)) ? (int)$updatedPost[0]['post_like'] : 0;

    echo json_encode([
        'success' => true,
        'count' => $finalCount,
        'isLiked' => $isLiked
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
?>
