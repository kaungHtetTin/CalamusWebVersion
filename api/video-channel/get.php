<?php
/**
 * API: Get Video Channel Data
 * Returns app info and video categories with lessons
 */

// Suppress PHP warnings/notices from breaking JSON output
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../classes/connect.php';
require_once '../../classes/app.php';
require_once '../../classes/lesson_category.php';
require_once '../../classes/lesson.php';

try {
    $channel = isset($_GET['channel']) ? $_GET['channel'] : '';
    $appId = isset($_GET['app']) ? (int)$_GET['app'] : 0;
    
    if (empty($channel) || $appId <= 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Missing channel or app parameter'
        ]);
        exit();
    }
    
    $App = new App();
    $LessonCategory = new LessonCategory();
    $Lesson = new Lesson();
    
    // Get app details
    $app = $App->detail($appId);
    if (!$app) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'App not found'
        ]);
        exit();
    }
    
    // Get video channels/categories
    $videoChannels = $LessonCategory->getVideoChannel($channel);
    if (!$videoChannels || !is_array($videoChannels)) {
        $videoChannels = [];
    }
    
    // Format categories with lessons
    $formattedCategories = [];
    foreach ($videoChannels as $cat) {
        $lessons = $Lesson->getLessonByCategory($cat['id']);
        if (!$lessons || !is_array($lessons)) {
            $lessons = [];
        }
        
        $formattedLessons = [];
        foreach ($lessons as $index => $lesson) {
            $formattedLessons[] = [
                'id' => (int)$lesson['id'],
                'index' => $index,
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
        }
        
        $formattedCategories[] = [
            'id' => (int)$cat['id'],
            'category' => $cat['category'] ?? '',
            'title' => mb_convert_encoding($cat['category_title'] ?? '', 'UTF-8', 'UTF-8'),
            'lessonsCount' => count($formattedLessons),
            'lessons' => $formattedLessons,
        ];
    }
    
    // Format app data
    $formattedApp = [
        'id' => (int)$app['id'],
        'name' => $app['name'] ?? '',
        'description' => $app['description'] ?? '',
        'icon' => $app['icon'] ?? '',
    ];
    
    echo json_encode([
        'success' => true,
        'data' => [
            'app' => $formattedApp,
            'categories' => $formattedCategories,
        ]
    ], JSON_INVALID_UTF8_SUBSTITUTE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch video channel data'
    ]);
}
?>
