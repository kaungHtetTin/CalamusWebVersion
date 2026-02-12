<?php
/**
 * API: Get New Courses
 * Returns latest 5 courses ordered by course_id DESC
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../classes/connect.php';
require_once '../../classes/course.php';

try {
    $Course = new Course();
    $courses = $Course->getNewCourses();
    
    if ($courses === false) {
        $courses = [];
    }
    
    $ensureUtf8 = function($str) {
        if ($str === null || $str === '') return (string)$str;
        if (!mb_check_encoding($str, 'UTF-8')) return mb_convert_encoding($str, 'UTF-8', 'auto');
        return $str;
    };
    $formattedCourses = array_map(function($course) use ($Course, $ensureUtf8) {
        $enrolledStudents = $Course->getEnrollStudents($course['course_id']);
        
        return [
            'id' => (int)$course['course_id'],
            'title' => $ensureUtf8($course['title'] ?? ''),
            'description' => $ensureUtf8($course['description'] ?? ''),
            'duration' => (int)$course['duration'],
            'rating' => (float)$course['rating'],
            'coverUrl' => $course['cover_url'],
            'webCover' => $course['web_cover'],
            'backgroundColor' => $course['background_color'],
            'fee' => (int)$course['fee'],
            'major' => $course['major'],
            'lessonsCount' => (int)$course['lessons_count'],
            'instructor' => $ensureUtf8($course['teacher_name'] ?? ''),
            'instructorId' => (int)$course['teacher_id'],
            'instructorImage' => $course['teacher_profile'] ?? null,
            'enrolledStudents' => (int)$enrolledStudents
        ];
    }, $courses);
    
    echo json_encode([
        'success' => true,
        'data' => $formattedCourses
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch courses'
    ]);
}
?>
