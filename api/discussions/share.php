<?php
/**
 * API: Share a Post
 * POST: { postId } — postId is the original post ID to share
 * Requires authentication (Bearer token)
 * Creates a new post with share column set to original post ID
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
    $originalPostId = isset($input['postId']) ? (int)$input['postId'] : 0;

    if ($originalPostId <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid post ID']);
        exit();
    }

    // Check if original post exists and is not a shared post itself
    $originalPostResult = $DB->read("SELECT post_id, body, image, major FROM posts WHERE post_id = $originalPostId AND share = 0 LIMIT 1");
    if (!$originalPostResult || !is_array($originalPostResult) || count($originalPostResult) === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Post not found or cannot be shared']);
        exit();
    }

    $originalPost = $originalPostResult[0];
    $category = $originalPost['major'] ?? 'english';

    // Check if user already shared this post
    $existingShare = $DB->read("SELECT post_id FROM posts WHERE learner_id = '$userId' AND share = $originalPostId LIMIT 1");
    if ($existingShare && is_array($existingShare) && count($existingShare) > 0) {
        // Return success with message instead of error
        echo json_encode([
            'success' => true,
            'alreadyShared' => true,
            'message' => 'You have already shared this post'
        ], JSON_INVALID_UTF8_SUBSTITUTE);
        exit();
    }

    // Generate unique post ID (timestamp-based)
    $newPostId = round(microtime(true) * 1000);

    // Create new post with share column set to original post ID
    $bodyEscaped = mysqli_real_escape_string($conn, '');
    $categoryEscaped = mysqli_real_escape_string($conn, $category);
    $imageEscaped = mysqli_real_escape_string($conn, $originalPost['image'] ?? '');

    $query = "INSERT INTO posts (post_id, learner_id, body, blog_title, image, video_url, vimeo, has_video, post_like, comments, share, view_count, share_count, show_on_blog, hide, major) 
              VALUES ('$newPostId', '$userId', '$bodyEscaped', '', '$imageEscaped', '', '', 0, 0, 0, $originalPostId, 0, 0, 0, 0, '$categoryEscaped')";

    $result = $DB->save($query);

    if (!$result) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to share post']);
        exit();
    }

    // Increment share_count of original post
    $DB->save("UPDATE posts SET share_count = share_count + 1 WHERE post_id = $originalPostId");

    // Return the shared post
    $sharedPost = [
        'postId' => (int)$newPostId,
        'body' => '',
        'postImage' => $originalPost['image'] ?? '',
        'hasVideo' => 0,
        'vimeo' => '',
        'postLikes' => 0,
        'comments' => 0,
        'shareCount' => 0,
        'viewCount' => 0,
        'isLiked' => 0,
        'showOnBlog' => 0,
        'blogTitle' => '',
        'category' => $category,
        'userId' => $userId,
        'userName' => mb_convert_encoding($userName, 'UTF-8', 'UTF-8'),
        'userImage' => $userImage ?: 'https://www.calamuseducation.com/uploads/placeholder.png',
        'vip' => 0,
        'major' => $category,
        'share' => (int)$originalPostId,
        'originalPost' => [
            'postId' => (int)$originalPostId,
            'body' => mb_convert_encoding($originalPost['body'] ?? '', 'UTF-8', 'UTF-8'),
            'postImage' => $originalPost['image'] ?? '',
            'category' => $category,
        ],
    ];

    echo json_encode(['success' => true, 'data' => ['post' => $sharedPost]], JSON_INVALID_UTF8_SUBSTITUTE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
?>
