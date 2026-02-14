<?php
/**
 * API: Get Pinned Posts
 * Returns pinned/blog posts from all categories for the Home page
 */

require_once __DIR__ . '/../bootstrap.php';

error_reporting(0);
ini_set('display_errors', 0);
require_once '../../classes/connect.php';

try {
    $DB = new Database();

    $query = "SELECT 
        posts.post_id as postId,
        posts.body,
        posts.image as postImage,
        posts.blog_title as blogTitle,
        posts.major,
        posts.learner_id as userId,
        learners.learner_name as userName,
        learners.learner_image as userImage
    FROM posts
    LEFT JOIN learners ON learners.learner_phone = posts.learner_id
    WHERE posts.show_on_blog = 1
    ORDER BY posts.post_id DESC
    LIMIT 6";

    $result = $DB->read($query);
    $pinnedPosts = [];

    if ($result && is_array($result)) {
        foreach ($result as $post) {
            $pinnedPosts[] = [
                'postId' => (int)$post['postId'],
                'body' => mb_convert_encoding($post['body'] ?? '', 'UTF-8', 'UTF-8'),
                'postImage' => $post['postImage'] ?? '',
                'blogTitle' => mb_convert_encoding($post['blogTitle'] ?? '', 'UTF-8', 'UTF-8'),
                'major' => $post['major'] ?? '',
                'userId' => $post['userId'] ?? '',
                'userName' => mb_convert_encoding($post['userName'] ?? 'Anonymous', 'UTF-8', 'UTF-8'),
                'userImage' => $post['userImage'] ?? 'https://www.calamuseducation.com/uploads/placeholder.png',
            ];
        }
    }

    echo json_encode([
        'success' => true,
        'data' => $pinnedPosts
    ], JSON_INVALID_UTF8_SUBSTITUTE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch pinned posts'
    ]);
}
?>
