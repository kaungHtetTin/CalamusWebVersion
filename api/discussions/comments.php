<?php
require_once __DIR__ . '/../bootstrap.php';

error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once __DIR__ . '/../../classes/connect.php';

try {
    $postId = isset($_GET['postId']) ? intval($_GET['postId']) : 0;
    $userId = isset($_GET['userId']) ? $_GET['userId'] : '';
    
    if ($postId === 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Post ID is required']);
        exit();
    }
    
    $DB = new Database();
    
    // Fetch comments with user info and like status
    // Based on original comment.php class query structure
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
            // Fix encoding for text fields
            $body = $comment['body'];
            if (!mb_check_encoding($body, 'UTF-8')) {
                $body = mb_convert_encoding($body, 'UTF-8', 'auto');
            }
            
            $userName = $comment['userName'] ?? 'Anonymous';
            if (!mb_check_encoding($userName, 'UTF-8')) {
                $userName = mb_convert_encoding($userName, 'UTF-8', 'auto');
            }
            
            $comments[] = [
                'id' => (int)$comment['id'],
                'postId' => (int)$comment['postId'],
                'writerId' => $comment['writerId'],
                'body' => $body,
                'image' => $comment['image'] ?? '',
                'time' => (int)$comment['time'],
                'parent' => (int)$comment['parent'],
                'likes' => (int)$comment['likes'],
                'userName' => $userName,
                'userImage' => $comment['userImage'] ?? 'https://www.calamuseducation.com/uploads/placeholder.png',
                'isLiked' => (int)$comment['isLiked'],
            ];
        }
    }
    
    // Organize comments into parent-child structure
    $organizedComments = [];
    $commentMap = [];
    
    // First pass: create a map of all comments by their time
    foreach ($comments as &$comment) {
        $comment['replies'] = [];
        $commentMap[$comment['time']] = &$comment;
    }
    unset($comment);
    
    // Second pass: organize into parent-child relationships
    foreach ($comments as &$comment) {
        if ($comment['parent'] === 0) {
            // Root level comment
            $organizedComments[] = &$comment;
        } else {
            // Reply - add to parent's replies array
            if (isset($commentMap[$comment['parent']])) {
                $commentMap[$comment['parent']]['replies'][] = &$comment;
            }
        }
    }
    unset($comment);
    
    // Get total comment count
    $countQuery = "SELECT COUNT(*) as total FROM comment WHERE post_id = $postId";
    $countResult = $DB->read($countQuery);
    $totalComments = $countResult && is_array($countResult) ? (int)$countResult[0]['total'] : 0;
    
    echo json_encode([
        'success' => true,
        'data' => [
            'comments' => $organizedComments,
            'totalComments' => $totalComments,
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
