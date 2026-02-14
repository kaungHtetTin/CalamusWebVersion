<?php
/**
 * API: Get User Public Profile
 * GET: Returns public profile data + posts for any user
 * Param: id = learner_phone (string) OR learners.id (numeric) so profile links work either way
 * Does NOT require authentication
 */

require_once __DIR__ . '/../bootstrap.php';

error_reporting(0);
ini_set('display_errors', 0);

require_once __DIR__ . '/../../classes/connect.php';

try {
    $userId = isset($_GET['id']) ? trim($_GET['id']) : '';
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $viewerId = isset($_GET['viewerId']) ? trim($_GET['viewerId']) : '';
    $limit = 10;
    $offset = ($page - 1) * $limit;

    if (empty($userId)) {
        echo json_encode(['success' => false, 'error' => 'User ID is required']);
        exit();
    }

    $DB = new Database();
    $conn = $DB->connect();
    $userId_escaped = mysqli_real_escape_string($conn, $userId);

    // Fetch user by learners.id (if numeric) OR learner_phone so profile links work from both
    $baseSelect = "SELECT 
        id,
        learner_phone,
        learner_name,
        learner_image,
        cover_image,
        gender,
        work,
        education,
        region,
        bio
    FROM learners";

    $result = null;
    if (ctype_digit($userId)) {
        $idInt = (int) $userId;
        $result = $DB->read("$baseSelect WHERE id = $idInt LIMIT 1");
    }
    if (!$result || !is_array($result) || count($result) === 0) {
        $result = $DB->read("$baseSelect WHERE learner_phone = '$userId_escaped' LIMIT 1");
    }

    if (!$result || !is_array($result) || count($result) === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'User not found']);
        exit();
    }

    $user = $result[0];
    $learner_phone = $user['learner_phone'] ?? '';
    $learner_phone_escaped = mysqli_real_escape_string($conn, $learner_phone);

    // Determine which posts to fetch based on tab (posts or shared)
    $tab = isset($_GET['tab']) ? trim($_GET['tab']) : 'posts';
    
    if ($tab === 'shared') {
        // Fetch shared posts (posts where share > 0, meaning they shared someone else's post)
        $postsQuery = "SELECT 
            posts.post_id as postId,
            posts.share as originalPostId,
            posts.body,
            posts.image as postImage,
            posts.has_video,
            posts.vimeo,
            posts.post_like as postLikes,
            posts.comments,
            posts.share_count as shareCount,
            posts.view_count as viewCount,
            posts.show_on_blog,
            posts.blog_title,
            posts.major,
            original_posts.body as originalBody,
            original_posts.image as originalPostImage,
            original_posts.has_video as originalHasVideo,
            original_posts.vimeo as originalVimeo,
            original_posts.post_like as originalPostLikes,
            original_posts.major as originalMajor,
            original_posts.learner_id as originalUserId,
            original_learner.learner_name as originalUserName,
            original_learner.learner_image as originalUserImage
        FROM posts
        LEFT JOIN posts as original_posts ON original_posts.post_id = posts.share
        LEFT JOIN learners as original_learner ON original_learner.learner_phone = original_posts.learner_id
        WHERE posts.learner_id = '$learner_phone_escaped'
        AND posts.hide = 0
        AND posts.share > 0
        ORDER BY posts.post_id DESC
        LIMIT $limit OFFSET $offset";
    } else {
        // Fetch user's own posts (exclude shared posts)
        $postsQuery = "SELECT 
            posts.post_id as postId,
            posts.body,
            posts.image as postImage,
            posts.has_video,
            posts.vimeo,
            posts.post_like as postLikes,
            posts.comments,
            posts.share_count as shareCount,
            posts.view_count as viewCount,
            posts.show_on_blog,
            posts.blog_title,
            posts.major
        FROM posts
        WHERE posts.learner_id = '$learner_phone_escaped'
        AND posts.hide = 0
        AND posts.share = 0
        ORDER BY posts.post_id DESC
        LIMIT $limit OFFSET $offset";
    }

    $postsResult = $DB->read($postsQuery);
    $posts = [];

    if ($postsResult && is_array($postsResult)) {
        foreach ($postsResult as $post) {
            // Check if viewer liked this post (for shared posts, check original post)
            $isLiked = 0;
            $postIdToCheck = isset($post['originalPostId']) && $post['originalPostId'] > 0 ? $post['originalPostId'] : $post['postId'];
            if (!empty($viewerId)) {
                $likeQuery = "SELECT * FROM mylikes WHERE content_id = $postIdToCheck";
                $likeResult = $DB->read($likeQuery);
                if ($likeResult && is_array($likeResult)) {
                    foreach ($likeResult as $like) {
                        $likesArr = json_decode($like['likes'], true);
                        if ($likesArr) {
                            $userIds = array_column($likesArr, 'user_id');
                            if (in_array($viewerId, $userIds)) {
                                $isLiked = 1;
                                break;
                            }
                        }
                    }
                }
            }

            $postData = [
                'postId' => (int)$post['postId'],
                'body' => mb_convert_encoding($post['body'] ?? '', 'UTF-8', 'UTF-8'),
                'postImage' => $post['postImage'] ?? '',
                'hasVideo' => (int)($post['has_video'] ?? 0),
                'vimeo' => $post['vimeo'] ?? '',
                'postLikes' => (int)($post['postLikes'] ?? 0),
                'comments' => (int)($post['comments'] ?? 0),
                'shareCount' => (int)($post['shareCount'] ?? 0),
                'viewCount' => (int)($post['viewCount'] ?? 0),
                'isLiked' => $isLiked,
                'showOnBlog' => (int)($post['show_on_blog'] ?? 0),
                'blogTitle' => mb_convert_encoding($post['blog_title'] ?? '', 'UTF-8', 'UTF-8'),
                'category' => $post['major'] ?? 'english',
                'major' => $post['major'] ?? '',
            ];

            // If this is a shared post, add original post info
            if ($tab === 'shared' && isset($post['originalPostId']) && $post['originalPostId'] > 0) {
                $postData['share'] = (int)$post['originalPostId'];
                $postData['originalPost'] = [
                    'postId' => (int)$post['originalPostId'],
                    'body' => mb_convert_encoding($post['originalBody'] ?? '', 'UTF-8', 'UTF-8'),
                    'postImage' => $post['originalPostImage'] ?? '',
                    'hasVideo' => (int)($post['originalHasVideo'] ?? 0),
                    'vimeo' => $post['originalVimeo'] ?? '',
                    'postLikes' => (int)($post['originalPostLikes'] ?? 0),
                    'isLiked' => $isLiked, // Use the like status we checked above
                    'userId' => $post['originalUserId'] ?? '',
                    'userName' => mb_convert_encoding($post['originalUserName'] ?? 'Unknown', 'UTF-8', 'UTF-8'),
                    'userImage' => $post['originalUserImage'] ?? 'https://www.calamuseducation.com/uploads/placeholder.png',
                    'category' => $post['originalMajor'] ?? 'english',
                ];
            }

            $posts[] = $postData;
        }
    }

    // Get total post count (own posts, excluding shared posts)
    $countQuery = "SELECT COUNT(*) as total FROM posts WHERE learner_id = '$learner_phone_escaped' AND hide = 0 AND share = 0";
    $countResult = $DB->read($countQuery);
    $totalPosts = $countResult ? (int)$countResult[0]['total'] : 0;

    // Get shared posts count (posts where share > 0)
    $sharedQuery = "SELECT COUNT(*) as total FROM posts WHERE learner_id = '$learner_phone_escaped' AND hide = 0 AND share > 0";
    $sharedResult = $DB->read($sharedQuery);
    $sharedPosts = $sharedResult ? (int)$sharedResult[0]['total'] : 0;
    
    // Adjust pagination based on tab
    $totalForPagination = $tab === 'shared' ? $sharedPosts : $totalPosts;

    echo json_encode([
        'success' => true,
        'data' => [
            'user' => [
                'id' => (int)$user['id'],
                'name' => $user['learner_name'],
                'image' => $user['learner_image'],
                'coverImage' => $user['cover_image'],
                'gender' => $user['gender'],
                'work' => $user['work'],
                'education' => $user['education'],
                'region' => $user['region'],
                'bio' => mb_convert_encoding($user['bio'] ?? '', 'UTF-8', 'UTF-8'),
            ],
            'stats' => [
                'totalPosts' => $totalPosts,
                'sharedPosts' => $sharedPosts,
            ],
            'posts' => $posts,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $totalForPagination,
                'hasMore' => ($offset + $limit) < $totalForPagination,
            ],
        ]
    ], JSON_INVALID_UTF8_SUBSTITUTE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to fetch profile']);
}
?>
