<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once '../../classes/connect.php';

try {
    $postId = isset($_GET['postId']) ? intval($_GET['postId']) : 0;
    $userId = isset($_GET['userId']) ? $_GET['userId'] : '';
    
    if ($postId === 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Post ID is required']);
        exit();
    }
    
    $DB = new Database();
    
    // Escape userId for SQL query
    $conn = mysqli_connect('localhost', 'root', '', 'calamus_db');
    $userIdEscaped = mysqli_real_escape_string($conn, $userId);
    mysqli_close($conn);
    
    // Fetch single post with user info
    $postQuery = "SELECT 
        posts.post_id as postId,
        posts.body,
        posts.image as postImage,
        posts.hide as hidden,
        posts.has_video as hasVideo,
        posts.vimeo,
        posts.post_like as postLikes,
        posts.comments,
        posts.share_count as shareCount,
        posts.view_count as viewCount,
        posts.show_on_blog as showOnBlog,
        posts.blog_title as blogTitle,
        posts.learner_id as oderId,
        posts.major as category,
        learners.learner_name as userName,
        learners.learner_image as userImage
    FROM posts 
    LEFT JOIN learners ON learners.learner_phone = posts.learner_id
    WHERE posts.post_id = $postId AND posts.hide = 0";
    
    $postResult = $DB->read($postQuery);
    
    if (!$postResult || !is_array($postResult) || count($postResult) === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Post not found']);
        exit();
    }
    
    $postData = $postResult[0];
    
    // Fix encoding for text fields
    $body = $postData['body'] ?? '';
    if (!mb_check_encoding($body, 'UTF-8')) {
        $body = mb_convert_encoding($body, 'UTF-8', 'auto');
    }
    
    $userName = $postData['userName'] ?? 'Anonymous';
    if (!mb_check_encoding($userName, 'UTF-8')) {
        $userName = mb_convert_encoding($userName, 'UTF-8', 'auto');
    }
    
    $blogTitle = $postData['blogTitle'] ?? '';
    if (!mb_check_encoding($blogTitle, 'UTF-8')) {
        $blogTitle = mb_convert_encoding($blogTitle, 'UTF-8', 'auto');
    }
    
    $post = [
        'postId' => (int)$postData['postId'],
        'body' => $body,
        'postImage' => $postData['postImage'] ?? '',
        'hasVideo' => (int)($postData['hasVideo'] ?? 0),
        'vimeo' => $postData['vimeo'] ?? '',
        'postLikes' => (int)($postData['postLikes'] ?? 0),
        'comments' => (int)($postData['comments'] ?? 0),
        'shareCount' => (int)($postData['shareCount'] ?? 0),
        'viewCount' => (int)($postData['viewCount'] ?? 0),
        'showOnBlog' => (int)($postData['showOnBlog'] ?? 0),
        'blogTitle' => $blogTitle,
        'userName' => $userName,
        'userImage' => $postData['userImage'] ?? 'https://www.calamuseducation.com/uploads/placeholder.png',
        'category' => $postData['category'] ?? 'english',
    ];
    
    // Fetch comments for this post
    $commentsQuery = "SELECT 
        comment.id,
        comment.post_id as postId,
        comment.writer_id as writerId,
        comment.body,
        comment.image,
        comment.time,
        comment.parent,
        comment.likes,
        learners.learner_name as userName,
        learners.learner_image as userImage,
        CASE
            WHEN EXISTS (
                SELECT NULL FROM comment_likes l 
                WHERE l.user_id = '$userIdEscaped' AND l.comment_id = comment.time
            ) THEN 1
            ELSE 0
        END as isLiked
    FROM comment 
    JOIN learners ON learners.learner_phone = comment.writer_id
    WHERE comment.post_id = $postId
    ORDER BY comment.time ASC";
    
    $commentsResult = $DB->read($commentsQuery);
    
    $comments = [];
    if ($commentsResult && is_array($commentsResult)) {
        foreach ($commentsResult as $comment) {
            $commentBody = $comment['body'] ?? '';
            if (!mb_check_encoding($commentBody, 'UTF-8')) {
                $commentBody = mb_convert_encoding($commentBody, 'UTF-8', 'auto');
            }
            
            $commentUserName = $comment['userName'] ?? 'Anonymous';
            if (!mb_check_encoding($commentUserName, 'UTF-8')) {
                $commentUserName = mb_convert_encoding($commentUserName, 'UTF-8', 'auto');
            }
            
            $comments[] = [
                'id' => (int)$comment['id'],
                'postId' => (int)$comment['postId'],
                'writerId' => $comment['writerId'],
                'body' => $commentBody,
                'image' => $comment['image'] ?? '',
                'time' => (int)$comment['time'],
                'parent' => (int)$comment['parent'],
                'likes' => (int)$comment['likes'],
                'userName' => $commentUserName,
                'userImage' => $comment['userImage'] ?? 'https://www.calamuseducation.com/uploads/placeholder.png',
                'isLiked' => (int)$comment['isLiked'],
            ];
        }
    }
    
    // Organize comments into parent-child structure
    $organizedComments = [];
    $commentMap = [];
    
    foreach ($comments as &$comment) {
        $comment['replies'] = [];
        $commentMap[$comment['time']] = &$comment;
    }
    unset($comment);
    
    foreach ($comments as &$comment) {
        if ($comment['parent'] === 0) {
            $organizedComments[] = &$comment;
        } else {
            if (isset($commentMap[$comment['parent']])) {
                $commentMap[$comment['parent']]['replies'][] = &$comment;
            }
        }
    }
    unset($comment);
    
    // Update view count
    $updateViewQuery = "UPDATE posts SET view_count = view_count + 1 WHERE post_id = $postId";
    $DB->save($updateViewQuery);
    
    echo json_encode([
        'success' => true,
        'data' => [
            'post' => $post,
            'comments' => $organizedComments,
            'totalComments' => count($comments),
        ]
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
