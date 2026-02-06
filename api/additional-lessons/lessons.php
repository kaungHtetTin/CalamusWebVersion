<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once '../../classes/connect.php';

try {
    $categoryId = isset($_GET['categoryId']) ? intval($_GET['categoryId']) : 0;
    
    if ($categoryId === 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Category ID is required']);
        exit();
    }
    
    $DB = new Database();
    
    // Get category detail - exactly like old approach
    $query = "SELECT * FROM lessons_categories WHERE id = $categoryId";
    $result = $DB->read($query);
    
    if (!$result || !is_array($result) || count($result) === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Category not found']);
        exit();
    }
    
    $cat = $result[0];
    $major = $cat['major'];
    
    // Fix encoding
    $categoryTitle = $cat['category_title'] ?? '';
    if (!mb_check_encoding($categoryTitle, 'UTF-8')) {
        $categoryTitle = mb_convert_encoding($categoryTitle, 'UTF-8', 'auto');
    }
    
    $category = [
        'id' => (int)$cat['id'],
        'course_id' => (int)$cat['course_id'],
        'category' => $cat['category'] ?? '',
        'category_title' => $categoryTitle,
        'image_url' => $cat['image_url'] ?? '',
        'major' => $major,
    ];
    
    // Get lessons - exactly like old approach
    $query = "SELECT 
        id, cate, link, title, title_mini, isVideo, isVip, date, thumbnail, duration
    FROM lessons 
    WHERE category_id = $categoryId";
    $lessonsResult = $DB->read($query);
    
    $lessons = [];
    if ($lessonsResult && is_array($lessonsResult)) {
        foreach ($lessonsResult as $lesson) {
            $title = $lesson['title'] ?? '';
            if (!mb_check_encoding($title, 'UTF-8')) {
                $title = mb_convert_encoding($title, 'UTF-8', 'auto');
            }
            
            $lessons[] = [
                'id' => (int)$lesson['id'],
                'cate' => $lesson['cate'] ?? '',
                'link' => $lesson['link'] ?? '',
                'title' => $title,
                'title_mini' => $lesson['title_mini'] ?? '',
                'isVideo' => (int)($lesson['isVideo'] ?? 0),
                'isVip' => (int)($lesson['isVip'] ?? 0),
                'date' => $lesson['date'] ?? '',
                'thumbnail' => $lesson['thumbnail'] ?? '',
                'duration' => (int)($lesson['duration'] ?? 0),
            ];
        }
    }
    
    // Get sidebar courses/categories - exactly like old approach
    if ($major == 'english') {
        $course_ids = [14, 10, 12];
    } else {
        $course_ids = [14, 8];
    }
    
    $query = "SELECT * FROM courses WHERE major = 'not'";
    $additional_courses = $DB->read($query);
    
    $sidebarCourses = [];
    if ($additional_courses && is_array($additional_courses)) {
        foreach ($additional_courses as $course) {
            $course_id = $course['course_id'];
            
            if (!in_array($course_id, $course_ids)) {
                continue;
            }
            
            $query = "SELECT * FROM lessons_categories WHERE course_id = $course_id AND major = '$major'";
            $categories = $DB->read($query);
            
            if ($categories && is_array($categories) && count($categories) > 0) {
                $courseTitle = $course['title'] ?? '';
                if (!mb_check_encoding($courseTitle, 'UTF-8')) {
                    $courseTitle = mb_convert_encoding($courseTitle, 'UTF-8', 'auto');
                }
                
                $formattedCategories = [];
                foreach ($categories as $c) {
                    $catTitle = $c['category_title'] ?? '';
                    if (!mb_check_encoding($catTitle, 'UTF-8')) {
                        $catTitle = mb_convert_encoding($catTitle, 'UTF-8', 'auto');
                    }
                    
                    $formattedCategories[] = [
                        'id' => (int)$c['id'],
                        'category_title' => $catTitle,
                        'image_url' => $c['image_url'] ?? '',
                    ];
                }
                
                $sidebarCourses[] = [
                    'course_id' => (int)$course_id,
                    'title' => $courseTitle,
                    'categories' => $formattedCategories,
                ];
            }
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'category' => $category,
            'lessons' => $lessons,
            'sidebarCourses' => $sidebarCourses,
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
