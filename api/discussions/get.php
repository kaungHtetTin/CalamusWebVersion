<?php
/**
 * API: Get Discussion Posts
 * Returns posts for the social newsfeed with pagination
 */

// Suppress PHP warnings/notices from breaking JSON output
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../classes/connect.php';

try {
    $category = isset($_GET['category']) ? $_GET['category'] : 'english';
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $userId = isset($_GET['userId']) ? $_GET['userId'] : 0;
    $limit = 15;
    $offset = ($page - 1) * $limit;
    
    // Map category to mCode
    $mCode = $category === 'korea' ? 'ek' : 'ee';
    
    $DB = new Database();
    
    // Fetch posts from database (exclude shared posts - where share > 0)
    $postsQuery = "SELECT 
        posts.post_id as postId,
        posts.body,
        posts.image as postImage,
        posts.hide as hidden,
        posts.has_video,
        posts.vimeo,
        posts.post_like as postLikes,
        posts.comments,
        posts.share_count as shareCount,
        posts.view_count as viewCount,
        posts.show_on_blog,
        posts.blog_title,
        posts.major as category,
        posts.learner_id as userId,
        learners.learner_name as userName,
        learners.learner_image as userImage
    FROM posts
    LEFT JOIN learners ON learners.learner_phone = posts.learner_id
    WHERE posts.hide = 0 
    AND posts.major = '$category'
    AND posts.share = 0
    ORDER BY posts.post_id DESC
    LIMIT $limit OFFSET $offset";
    
 
    $postsResult = $DB->read($postsQuery);
    
    $posts = [];
    if ($postsResult && is_array($postsResult)) {
        foreach ($postsResult as $post) {
            // Check if user liked this post
            $isLiked = 0;
            if ($userId) {
                $likeQuery = "SELECT * FROM mylikes WHERE content_id = {$post['postId']}";
                $likeResult = $DB->read($likeQuery);
                if ($likeResult && is_array($likeResult)) {
                    foreach ($likeResult as $like) {
                        $likesArr = json_decode($like['likes'], true);
                        if ($likesArr) {
                            $userIds = array_column($likesArr, "user_id");
                            if (in_array($userId, $userIds)) {
                                $isLiked = 1;
                                break;
                            }
                        }
                    }
                }
            }
            
            $posts[] = [
                'postId' => (int)$post['postId'],
                'body' => mb_convert_encoding($post['body'] ?? '', 'UTF-8', 'UTF-8'),
                'postImage' => $post['postImage'] ?? '',
                'hidden' => (int)($post['hidden'] ?? 0),
                'hasVideo' => (int)($post['has_video'] ?? 0),
                'vimeo' => $post['vimeo'] ?? '',
                'postLikes' => (int)($post['postLikes'] ?? 0),
                'comments' => (int)($post['comments'] ?? 0),
                'shareCount' => (int)($post['shareCount'] ?? 0),
                'viewCount' => (int)($post['viewCount'] ?? 0),
                'isLiked' => $isLiked,
                'showOnBlog' => (int)($post['show_on_blog'] ?? 0),
                'blogTitle' => mb_convert_encoding($post['blog_title'] ?? '', 'UTF-8', 'UTF-8'),
                'category' => $post['category'] ?? $category,
                'userId' => $post['userId'] ?? '',
                'userName' => mb_convert_encoding($post['userName'] ?? 'Anonymous', 'UTF-8', 'UTF-8'),
                'userImage' => $post['userImage'] ?? 'https://www.calamuseducation.com/uploads/placeholder.png',
                'vip' => (int)($post['vip'] ?? 0),
            ];
        }
    }
    
    // Get total count for pagination (exclude shared posts)
    $countQuery = "SELECT COUNT(*) as total FROM posts WHERE hide = 0 AND major = '$category' AND share = 0";
    $countResult = $DB->read($countQuery);
    $totalPosts = $countResult && is_array($countResult) ? (int)$countResult[0]['total'] : 0;
    
    // Get pinned/blog posts for this category
    $blogQuery = "SELECT 
        posts.post_id as postId,
        posts.body,
        posts.image as postImage,
        posts.blog_title as blogTitle,
        posts.learner_id as userId,
        learners.learner_name as userName,
        learners.learner_image as userImage
    FROM posts
    LEFT JOIN learners ON learners.learner_phone = posts.learner_id
    WHERE posts.show_on_blog = 1 AND posts.major = '$category'
    ORDER BY posts.post_id DESC
    LIMIT 10";
    
    $blogResult = $DB->read($blogQuery);
    $pinnedPosts = [];
    if ($blogResult && is_array($blogResult)) {
        foreach ($blogResult as $blog) {
            $pinnedPosts[] = [
                'postId' => (int)$blog['postId'],
                'body' => mb_convert_encoding($blog['body'] ?? '', 'UTF-8', 'UTF-8'),
                'postImage' => $blog['postImage'] ?? '',
                'blogTitle' => mb_convert_encoding($blog['blogTitle'] ?? '', 'UTF-8', 'UTF-8'),
                'userId' => $blog['userId'] ?? '',
                'userName' => mb_convert_encoding($blog['userName'] ?? 'Anonymous', 'UTF-8', 'UTF-8'),
                'userImage' => $blog['userImage'] ?? 'https://www.calamuseducation.com/uploads/placeholder.png',
            ];
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'posts' => $posts,
            'pinnedPosts' => $pinnedPosts,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $totalPosts,
                'hasMore' => ($offset + $limit) < $totalPosts,
            ],
            'category' => $category,
        ]
    ], JSON_INVALID_UTF8_SUBSTITUTE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
