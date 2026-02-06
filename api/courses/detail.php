<?php
/**
 * API: Get Course Detail
 * Returns detailed course information including instructor and lessons
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
require_once '../../classes/course.php';
require_once '../../classes/teacher.php';
require_once '../../classes/lesson.php';
require_once '../../classes/rating.php';

try {
    // Get course ID from query parameter
    $courseId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if ($courseId <= 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid course ID'
        ]);
        exit();
    }
    
    $Course = new Course();
    $Teacher = new Teacher();
    $Lesson = new Lesson();
    $Rating = new Rating();
    
    // Get course details
    $course = $Course->detail($courseId);
    
    if (!$course) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Course not found'
        ]);
        exit();
    }
    
    // Get teacher details
    $teacher = $Teacher->detail($course['teacher_id']);
    if (!$teacher) {
        $teacher = [
            'id' => $course['teacher_id'],
            'name' => 'Unknown Instructor',
            'profile' => null,
            'rank' => null,
            'facebook' => null,
            'telegram' => null
        ];
    }
    
    // Get enrolled students count
    $enrolledStudents = $Course->getEnrollStudents($courseId);
    if (!$enrolledStudents) {
        $enrolledStudents = 0;
    }
    
    // Get total duration
    $totalDuration = $Course->getDuration($courseId);
    if (!$totalDuration) {
        $totalDuration = 0;
    }
    
    // Get lessons organized by day
    $lessonsByDay = $Lesson->getLessonsByDayPlan($courseId, 0);
    if (!$lessonsByDay || !is_array($lessonsByDay)) {
        $lessonsByDay = [];
    }
    
    // Get reviews
    $reviews = $Rating->getReviews($courseId);
    if (!$reviews || !is_array($reviews)) {
        $reviews = [];
    }
    
    // Calculate rating distribution
    $ratingDistribution = [
        '5' => 0,
        '4' => 0,
        '3' => 0,
        '2' => 0,
        '1' => 0
    ];
    
    if (count($reviews) > 0) {
        foreach ($reviews as $review) {
            $star = (string)$review['star'];
            if (isset($ratingDistribution[$star])) {
                $ratingDistribution[$star]++;
            }
        }
    }
    
    // Format lessons by day
    $formattedDays = [];
    if ($lessonsByDay) {
        foreach ($lessonsByDay as $dayIndex => $dayLessons) {
            $dayDuration = $Lesson->getTotalDuration($dayLessons);
            $formattedLessons = [];
            
            foreach ($dayLessons as $lesson) {
                // Ensure proper UTF-8 encoding for text fields
                $lessonTitle = mb_convert_encoding($lesson['lesson_title'] ?? '', 'UTF-8', 'UTF-8');
                $categoryTitle = mb_convert_encoding($lesson['category_title'] ?? '', 'UTF-8', 'UTF-8');
                
                $formattedLessons[] = [
                    'id' => (int)$lesson['id'],
                    'title' => $lessonTitle,
                    'duration' => (int)($lesson['duration'] ?? 0),
                    'formattedDuration' => $Lesson->formatDuration($lesson['duration'] ?? 0),
                    'isVideo' => (bool)($lesson['isVideo'] ?? false),
                    'isVip' => (bool)($lesson['isVip'] ?? false),
                    'category' => $categoryTitle,
                    'thumbnail' => $lesson['thumbnail'] ?? null,
                ];
            }
            
            $formattedDays[] = [
                'day' => $dayIndex + 1,
                'lessonsCount' => count($dayLessons),
                'totalDuration' => $Lesson->formatDuration($dayDuration),
                'lessons' => $formattedLessons
            ];
        }
    }
    
    // Format reviews
    $formattedReviews = [];
    if ($reviews) {
        foreach ($reviews as $index => $review) {
            $formattedReviews[] = [
                'id' => $index + 1,
                'learnerName' => $review['learner_name'],
                'learnerImage' => $review['learner_image'],
                'star' => (int)$review['star'],
                'review' => $review['review'],
                'time' => $review['time'],
                'formattedTime' => $Rating->formatDateTime($review['time'])
            ];
        }
    }
    
    // Format response
    $formattedCourse = [
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
        'preview' => $course['preview'] ?? null,
        'totalDuration' => $Lesson->formatDuration($totalDuration),
        'enrolledStudents' => (int)$enrolledStudents,
        'instructor' => [
            'id' => (int)$teacher['id'],
            'name' => $teacher['name'],
            'profile' => $teacher['profile'],
            'rank' => $teacher['rank'] ?? null,
            'facebook' => $teacher['facebook'] ?? null,
            'telegram' => $teacher['telegram'] ?? null,
        ],
        'curriculum' => $formattedDays,
        'reviews' => $formattedReviews,
        'ratingDistribution' => $ratingDistribution,
        'totalReviews' => count($formattedReviews)
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $formattedCourse
    ], JSON_INVALID_UTF8_SUBSTITUTE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch course details'
    ]);
}
?>
