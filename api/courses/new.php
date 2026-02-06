<?php
/**
 * API: Get New Courses
 * Returns latest 5 courses ordered by course_id DESC
 */

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
require_once '../../classes/course.php';

try {
    $Course = new Course();
    $courses = $Course->getNewCourses();
    
    if ($courses === false) {
        $courses = [];
    }
    
    // Format response with additional data
    $formattedCourses = array_map(function($course) use ($Course) {
        $enrolledStudents = $Course->getEnrollStudents($course['course_id']);
        
        return [
            'id' => (int)$course['course_id'],
            'title' => $course['title'],
            'description' => $course['description'],
            'duration' => (int)$course['duration'],
            'rating' => (float)$course['rating'],
            'coverUrl' => $course['cover_url'],
            'webCover' => $course['web_cover'],
            'backgroundColor' => $course['background_color'],
            'fee' => (int)$course['fee'],
            'major' => $course['major'],
            'lessonsCount' => (int)$course['lessons_count'],
            'instructor' => $course['teacher_name'],
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
