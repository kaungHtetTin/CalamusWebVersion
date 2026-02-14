<?php
/**
 * API: Get Single Video Details
 * Returns video details with related videos from the same category
 */

require_once __DIR__ . '/../bootstrap.php';

// Suppress PHP warnings/notices from breaking JSON output
error_reporting(0);
ini_set('display_errors', 0);
require_once '../../classes/connect.php';
require_once '../../classes/lesson_category.php';
require_once '../../classes/lesson.php';

try {
    $lessonId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if ($lessonId <= 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Missing or invalid video id'
        ]);
        exit();
    }
    
    $DB = new Database();
    $LessonCategory = new LessonCategory();
    $Lesson = new Lesson();
    
    // Get the lesson details directly from database
    $query = "
        SELECT 
            lessons.id,
            lessons.title as lesson_title,
            lessons.duration,
            lessons.isVip,
            lessons.thumbnail,
            lessons.category_id,
            posts.post_id,
            posts.vimeo,
            posts.view_count,
            posts.share_count,
            posts.post_like,
            posts.comments
        FROM lessons
        LEFT JOIN posts ON lessons.date = posts.post_id
        WHERE lessons.id = $lessonId
    ";
    
    $result = $DB->read($query);
    
    if (!$result || !is_array($result) || count($result) === 0) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Video not found'
        ]);
        exit();
    }
    
    $lesson = $result[0];
    $categoryId = $lesson['category_id'] ?? 0;
    
    // Get category details
    $category = $LessonCategory->detail($categoryId);
    
    // Get all videos in the same category
    $allLessons = $Lesson->getLessonByCategory($categoryId);
    if (!$allLessons || !is_array($allLessons)) {
        $allLessons = [];
    }
    
    // Find current video index and format related videos
    $currentIndex = 0;
    $relatedVideos = [];
    foreach ($allLessons as $index => $item) {
        if ((int)$item['id'] === $lessonId) {
            $currentIndex = $index;
        }
        
        $relatedVideos[] = [
            'id' => (int)$item['id'],
            'title' => mb_convert_encoding($item['lesson_title'] ?? '', 'UTF-8', 'UTF-8'),
            'duration' => (int)($item['duration'] ?? 0),
            'formattedDuration' => $Lesson->formatVideoDuration($item['duration'] ?? 0),
            'thumbnail' => $item['thumbnail'] ?? '',
            'viewCount' => (int)($item['view_count'] ?? 0),
            'formattedViewCount' => $Lesson->formatViewCount($item['view_count'] ?? 0),
            'vimeoId' => $item['vimeo'] ?? null,
        ];
    }
    
    // Calculate prev/next
    $prevVideo = $currentIndex > 0 ? $relatedVideos[$currentIndex - 1] : null;
    $nextVideo = $currentIndex < count($relatedVideos) - 1 ? $relatedVideos[$currentIndex + 1] : null;
    
    // Format current video
    $currentVideo = [
        'id' => (int)$lesson['id'],
        'title' => mb_convert_encoding($lesson['lesson_title'] ?? '', 'UTF-8', 'UTF-8'),
        'duration' => (int)($lesson['duration'] ?? 0),
        'formattedDuration' => $Lesson->formatVideoDuration($lesson['duration'] ?? 0),
        'thumbnail' => $lesson['thumbnail'] ?? '',
        'viewCount' => (int)($lesson['view_count'] ?? 0),
        'formattedViewCount' => $Lesson->formatViewCount($lesson['view_count'] ?? 0),
        'likeCount' => (int)($lesson['post_like'] ?? 0),
        'commentCount' => (int)($lesson['comments'] ?? 0),
        'vimeoId' => $lesson['vimeo'] ?? null,
        'postId' => $lesson['post_id'] ?? null,
    ];
    
    // Format category
    $formattedCategory = [
        'id' => (int)($category['id'] ?? 0),
        'title' => mb_convert_encoding($category['category_title'] ?? '', 'UTF-8', 'UTF-8'),
        'category' => $category['category'] ?? '',
        'appId' => (int)($category['app'] ?? 0),
    ];
    
    echo json_encode([
        'success' => true,
        'data' => [
            'video' => $currentVideo,
            'category' => $formattedCategory,
            'currentIndex' => $currentIndex,
            'totalVideos' => count($relatedVideos),
            'prevVideo' => $prevVideo,
            'nextVideo' => $nextVideo,
            'relatedVideos' => $relatedVideos,
        ]
    ], JSON_INVALID_UTF8_SUBSTITUTE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch video data'
    ]);
}
?>
