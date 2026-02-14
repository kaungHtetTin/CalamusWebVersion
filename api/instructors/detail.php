<?php
/**
 * API: Get Instructor Detail
 * Returns instructor information by ID
 */

require_once __DIR__ . '/../bootstrap.php';
require_once '../../classes/connect.php';
require_once '../../classes/teacher.php';
require_once '../../classes/course.php';

// Get instructor ID from query parameter
$instructorId = isset($_GET['id']) ? (int)$_GET['id'] : null;

if (!$instructorId) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Instructor ID is required'
    ]);
    exit();
}

try {
    $Teacher = new Teacher();
    $Course = new Course();
    
    $instructor = $Teacher->detail($instructorId);
    
    if (!$instructor) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Instructor not found'
        ]);
        exit();
    }
    
    // Get instructor's courses
    $courses = $Teacher->courses($instructorId);
    $totalStudents = $Teacher->getNumberOfStudent($instructorId);
    
    // Format courses
    $formattedCourses = [];
    if ($courses) {
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
                'enrolledStudents' => (int)$enrolledStudents
            ];
        }, $courses);
    }
    
    $formattedInstructor = [
        'id' => (int)$instructor['id'],
        'name' => $instructor['name'],
        'bio' => $instructor['bio'] ?? '',
        'profileImage' => $instructor['profile'] ?? null,
        'email' => $instructor['email'] ?? '',
        'specialty' => $instructor['specialty'] ?? '',
        'totalStudents' => $totalStudents,
        'coursesCount' => count($formattedCourses),
        'courses' => $formattedCourses
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $formattedInstructor
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch instructor'
    ]);
}
?>
