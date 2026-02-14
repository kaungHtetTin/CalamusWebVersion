<?php
/**
 * API: Create Discussion Post
 * POST: accepts body (text), optional image (base64 or file upload)
 * Requires Bearer token in Authorization header
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
require_once '../config.php';

try {
    // Authenticate user
    $token = getBearerToken();

    if (empty($token)) {
        echo json_encode(['success' => false, 'error' => 'Not authenticated. Please login.']);
        exit();
    }

    $DB = new Database();
    $conn = $DB->connect();
    $token_escaped = mysqli_real_escape_string($conn, $token);

    // Get user by token
    $query = "SELECT id, learner_phone, learner_name, learner_image FROM learners WHERE auth_token = '$token_escaped' AND auth_token != '' LIMIT 1";
    $userResult = $DB->read($query);

    if (!$userResult) {
        echo json_encode(['success' => false, 'error' => 'Invalid or expired token. Please login again.']);
        exit();
    }

    $user = $userResult[0];
    $userId = $user['learner_phone'];

    // Parse input
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        echo json_encode(['success' => false, 'error' => 'Invalid request body']);
        exit();
    }

    $body = trim($input['body'] ?? '');
    $category = trim($input['category'] ?? 'english');
    $image = $input['image'] ?? ''; // base64 image data

    // Validation
    if (empty($body) && empty($image)) {
        echo json_encode(['success' => false, 'error' => 'Post cannot be empty. Add some text or an image.']);
        exit();
    }

    // Generate unique post ID (timestamp-based like existing posts)
    $postId = round(microtime(true) * 1000);

    // Handle image upload
    $imagePath = '';
    if (!empty($image)) {
        // Decode base64 image
        if (preg_match('/^data:image\/(\w+);base64,/', $image, $type)) {
            $ext = strtolower($type[1]);
            if (!in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                echo json_encode(['success' => false, 'error' => 'Invalid image format. Use JPG, PNG, GIF, or WebP.']);
                exit();
            }

            $imageData = substr($image, strpos($image, ',') + 1);
            $imageData = base64_decode($imageData);

            if ($imageData === false) {
                echo json_encode(['success' => false, 'error' => 'Failed to process image']);
                exit();
            }

            // Limit image size (5MB)
            if (strlen($imageData) > 5 * 1024 * 1024) {
                echo json_encode(['success' => false, 'error' => 'Image size must be less than 5MB']);
                exit();
            }

            // Save image
            $uploadDir = UPLOAD_DIR_POSTS;
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $fileName = $postId . '_' . $userId . '.' . $ext;
            $filePath = $uploadDir . $fileName;

            if (file_put_contents($filePath, $imageData)) {
                // Use config to get upload URL
                $relativePath = 'posts/' . $fileName;
                $imagePath = getUploadUrl($relativePath);
            }
        }
    }

    // Escape inputs
    $body_escaped = mysqli_real_escape_string($conn, $body);
    $category_escaped = mysqli_real_escape_string($conn, $category);
    $imagePath_escaped = mysqli_real_escape_string($conn, $imagePath);

    // Insert post
    $query = "INSERT INTO posts (post_id, learner_id, body, blog_title, image, video_url, vimeo, has_video, post_like, comments, share, view_count, share_count, show_on_blog, hide, major) 
              VALUES ('$postId', '$userId', '$body_escaped', '', '$imagePath_escaped', '', '', 0, 0, 0, 0, 0, 0, 0, 0, '$category_escaped')";

    $result = $DB->save($query);

    if (!$result) {
        echo json_encode(['success' => false, 'error' => 'Failed to create post. Please try again.']);
        exit();
    }

    // Return the created post
    echo json_encode([
        'success' => true,
        'data' => [
            'post' => [
                'postId' => (int)$postId,
                'body' => mb_convert_encoding($body, 'UTF-8', 'UTF-8'),
                'postImage' => $imagePath,
                'hasVideo' => 0,
                'vimeo' => '',
                'postLikes' => 0,
                'comments' => 0,
                'shareCount' => 0,
                'viewCount' => 0,
                'isLiked' => 0,
                'showOnBlog' => 0,
                'blogTitle' => '',
                'userId' => $userId,
                'userName' => $user['learner_name'],
                'userImage' => $user['learner_image'],
                'vip' => 0,
                'major' => $category,
            ]
        ]
    ], JSON_INVALID_UTF8_SUBSTITUTE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to create post. Please try again.']);
}
?>
