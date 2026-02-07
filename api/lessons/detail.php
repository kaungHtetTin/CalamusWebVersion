<?php
/**
 * API: Get lesson/video details
 * GET: Fetch lesson content, video link, and course curriculum
 * Params: id (lesson_id), course_id
 */

// Report all errors but do not display them in output (keep JSON clean)
error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
require_once '../../classes/connect.php';
require_once '../../classes/course.php';

try {
    $lessonId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    $courseId = isset($_GET['course_id']) ? (int)$_GET['course_id'] : 0;

    if (!$lessonId || !$courseId) {
        echo json_encode(['success' => false, 'error' => 'Missing lesson ID or course ID']);
        exit();
    }

    $DB = new Database();
    $conn = $DB->connect();

    // Fetch lesson details (join posts to get Vimeo URL via lessons.date = posts.post_id)
    $lessonQuery = "SELECT 
        lessons.*,
        posts.vimeo,
        posts.view_count,
        posts.post_like,
        posts.comments
    FROM lessons
    LEFT JOIN posts ON lessons.date = posts.post_id
    WHERE lessons.id = $lessonId LIMIT 1";
    $lessonResult = $DB->read($lessonQuery);

    if (!$lessonResult) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Lesson not found']);
        exit();
    }

    $lesson = $lessonResult[0];

    // Fetch course info
    $courseQuery = "SELECT 
        courses.course_id,
        courses.title as course_title,
        courses.teacher_id,
        teachers.name as instructor_name,
        teachers.profile as instructor_image
    FROM courses 
    JOIN teachers ON teachers.id = courses.teacher_id
    WHERE courses.course_id = $courseId LIMIT 1";
    
    $courseResult = $DB->read($courseQuery);
    if (!$courseResult) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Course not found']);
        exit();
    }

    $course = $courseResult[0];

    // Fetch all lessons in course grouped by category (join posts for Vimeo URLs)
    $curriculumQuery = "SELECT 
        lc.id as cat_id,
        lc.title as cat_title,
        l.id,
        l.title,
        l.isVideo,
        l.duration,
        p.vimeo
    FROM lessons_categories lc
    LEFT JOIN lessons l ON l.category_id = lc.id
    LEFT JOIN posts p ON l.date = p.post_id
    WHERE lc.course_id = $courseId
    ORDER BY lc.id, l.id";

    $curriculumResult = $DB->read($curriculumQuery);
    $curriculum = [];

    if ($curriculumResult && is_array($curriculumResult)) {
        foreach ($curriculumResult as $row) {
            $catId = isset($row['cat_id']) ? (int)$row['cat_id'] : 0;
            if (!isset($curriculum[$catId])) {
                $curriculum[$catId] = [
                    'id' => $catId,
                    'title' => isset($row['cat_title']) ? $row['cat_title'] : '',
                    'lessons' => [],
                ];
            }
            if (!empty($row['id'])) {
                $curriculum[$catId]['lessons'][] = [
                    'id' => (int)$row['id'],
                    'title' => isset($row['title']) ? $row['title'] : '',
                    'isVideo' => isset($row['isVideo']) ? (int)$row['isVideo'] : 0,
                    'duration' => isset($row['duration']) ? (int)$row['duration'] : 0,
                    'vimeo' => isset($row['vimeo']) ? $row['vimeo'] : null,
                ];
            }
        }
    }

    $curriculum = array_values($curriculum);

    echo json_encode([
        'success' => true,
        'data' => [
            'lesson' => [
                'id' => (int)$lesson['id'],
                'title' => $lesson['title'],
                'description' => isset($lesson['description']) ? $lesson['description'] : '',
                'isVideo' => isset($lesson['isVideo']) ? (int)$lesson['isVideo'] : 0,
                'duration' => (int)$lesson['duration'],
                'vimeo' => isset($lesson['vimeo']) ? $lesson['vimeo'] : null,
                'viewCount' => isset($lesson['view_count']) ? (int)$lesson['view_count'] : 0,
                'likeCount' => isset($lesson['post_like']) ? (int)$lesson['post_like'] : 0,
                'comments' => isset($lesson['comments']) ? (int)$lesson['comments'] : 0,
                'thumbnail' => isset($lesson['thumbnail']) ? $lesson['thumbnail'] : null,
            ],
                'course' => [
                    'id' => (int)$course['course_id'],
                    'title' => isset($course['course_title']) ? $course['course_title'] : (isset($course['title']) ? $course['title'] : null),
                    'instructorId' => (int)$course['teacher_id'],
                    'instructorName' => isset($course['instructor_name']) ? $course['instructor_name'] : (isset($course['teacher_name']) ? $course['teacher_name'] : ''),
                    'instructorImage' => isset($course['instructor_image']) ? $course['instructor_image'] : (isset($course['teacher_profile']) ? $course['teacher_profile'] : null),
                ],
            'curriculum' => $curriculum,
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to fetch lesson details']);
}

?>
