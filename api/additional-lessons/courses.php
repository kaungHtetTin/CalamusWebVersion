<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once '../../classes/connect.php';

try {
    // Get channel/language parameter (english or korea)
    $channel = isset($_GET['channel']) ? $_GET['channel'] : 'english';
    
    // Define course IDs based on channel (same as old approach)
    if ($channel == 'english') {
        $course_ids = [14, 10, 12];
    } else {
        $course_ids = [14, 8];
    }
    
    $DB = new Database();
    
    // Get additional courses (courses with major = 'not') - exactly like old approach
    $query = "SELECT * FROM courses WHERE major = 'not'";
    $additional_courses = $DB->read($query);
    
    $courses = [];
    if ($additional_courses && is_array($additional_courses)) {
        foreach ($additional_courses as $course) {
            $course_id = $course['course_id'];
            
            // Check if this course is in the allowed course_ids for this channel
            if (!in_array($course_id, $course_ids)) {
                continue;
            }
            
            // Get categories for this course - exactly like old approach
            $query = "SELECT * FROM lessons_categories WHERE course_id = $course_id AND major = '$channel'";
            $categories = $DB->read($query);
            
            if ($categories && is_array($categories) && count($categories) > 0) {
                // Fix encoding for course title
                $courseTitle = $course['title'] ?? '';
                if (!mb_check_encoding($courseTitle, 'UTF-8')) {
                    $courseTitle = mb_convert_encoding($courseTitle, 'UTF-8', 'auto');
                }
                
                $formattedCategories = [];
                foreach ($categories as $cat) {
                    $categoryTitle = $cat['category_title'] ?? '';
                    if (!mb_check_encoding($categoryTitle, 'UTF-8')) {
                        $categoryTitle = mb_convert_encoding($categoryTitle, 'UTF-8', 'auto');
                    }
                    
                    $formattedCategories[] = [
                        'id' => (int)$cat['id'],
                        'course_id' => (int)$cat['course_id'],
                        'category' => $cat['category'] ?? '',
                        'category_title' => $categoryTitle,
                        'image_url' => $cat['image_url'] ?? '',
                        'sort_order' => (int)($cat['sort_order'] ?? 0),
                        'major' => $cat['major'] ?? '',
                    ];
                }
                
                $courses[] = [
                    'course_id' => (int)$course['course_id'],
                    'title' => $courseTitle,
                    'categories' => $formattedCategories,
                ];
            }
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'channel' => $channel,
            'courses' => $courses,
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
