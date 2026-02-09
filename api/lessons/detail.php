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
require_once '../../classes/auth.php';

try {
    $lessonId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    $courseId = isset($_GET['course_id']) ? (int)$_GET['course_id'] : 0;
    $userId = isset($_GET['userId']) ? trim($_GET['userId']) : '';

    if (!$lessonId || !$courseId) {
        echo json_encode(['success' => false, 'error' => 'Missing lesson ID or course ID']);
        exit();
    }

    $DB = new Database();
    $conn = $DB->connect();
    $Auth = new Auth();
    
    // Check if user has VIP access to this course
    $hasVipAccess = false;
    if (!empty($userId)) {
        $hasVipAccess = $Auth->checkVIP($courseId, $userId);
    }
    
    // Check if user has learned this lesson
    $isLearned = 0;
    if (!empty($userId)) {
        $userIdEscaped = mysqli_real_escape_string($conn, $userId);
        $learnedQuery = "SELECT * FROM studies WHERE learner_id = '$userIdEscaped' AND lesson_id = $lessonId LIMIT 1";
        $learnedResult = $DB->read($learnedQuery);
        if ($learnedResult && is_array($learnedResult) && count($learnedResult) > 0) {
            $isLearned = 1;
        }
    }

    // Fetch lesson details (join posts to get Vimeo URL via lessons.date = posts.post_id)
    $lessonQuery = "SELECT 
        lessons.*,
        lessons.date as postId,
        lessons.isVip,
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
    
    // Note: Course-level VIP check happens after fetching course info
    // Individual lesson VIP status is checked but course access takes precedence

    // Fetch course info (including is_vip)
    $courseQuery = "SELECT 
        courses.course_id,
        courses.title as course_title,
        courses.teacher_id,
        courses.is_vip,
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
    $courseIsVip = isset($course['is_vip']) ? (int)$course['is_vip'] : 0;
    
    // IMPORTANT: If course is FREE (is_vip = 0), allow access to all lessons regardless of subscription
    // Only check subscription if course is VIP (is_vip = 1)
    if ($courseIsVip === 1 && !$hasVipAccess) {
        // Course is VIP and user doesn't have subscription - block access
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'VIP course - Subscription required',
            'isVip' => true,
            'requiresSubscription' => true
        ]);
        exit();
    }
    
    // If we reach here, either:
    // 1. Course is free (is_vip = 0) - allow access
    // 2. Course is VIP (is_vip = 1) AND user has subscription - allow access
    
    // Now check individual lesson VIP status (only matters if lesson itself is VIP)
    // But since course access is already granted, lesson VIP check is secondary

    // Fetch all lessons in course grouped by category (join posts for Vimeo URLs)
    // Include learned status and VIP status for each lesson if userId is provided
    $learnedCheck = '';
    if (!empty($userId)) {
        $userIdEscaped = mysqli_real_escape_string($conn, $userId);
        $learnedCheck = ", CASE WHEN EXISTS (SELECT NULL FROM studies s WHERE s.learner_id = '$userIdEscaped' AND s.lesson_id = l.id) THEN 1 ELSE 0 END as learned";
    } else {
        $learnedCheck = ", 0 as learned";
    }
    
    $curriculumQuery = "SELECT 
        lc.id as cat_id,
        lc.title as cat_title,
        l.id,
        l.title,
        l.isVideo,
        l.isVip,
        l.duration,
        p.vimeo
        $learnedCheck
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
                $lessonIsVip = isset($row['isVip']) ? (int)$row['isVip'] : 0;
                // Access logic:
                // - If course is FREE (is_vip = 0): all lessons accessible
                // - If course is VIP (is_vip = 1): need subscription (already checked above)
                $hasAccess = ($courseIsVip === 0) ? true : ($hasVipAccess || $lessonIsVip === 0);
                
                $curriculum[$catId]['lessons'][] = [
                    'id' => (int)$row['id'],
                    'title' => isset($row['title']) ? $row['title'] : '',
                    'isVideo' => isset($row['isVideo']) ? (int)$row['isVideo'] : 0,
                    'isVip' => $lessonIsVip,
                    'duration' => isset($row['duration']) ? (int)$row['duration'] : 0,
                    'vimeo' => isset($row['vimeo']) ? $row['vimeo'] : null,
                    'learned' => isset($row['learned']) ? (int)$row['learned'] : 0,
                    'hasAccess' => $hasAccess,
                ];
            }
        }
    }

    $curriculum = array_values($curriculum);

    // Determine lesson type and set document URL for non-video lessons
    // Format: http://domain/uploads/lessons/html/lesson_table_id.html
    $isVideo = isset($lesson['isVideo']) ? (int)$lesson['isVideo'] : 0;
    $documentUrl = null;
    
    if (!$isVideo) {
        // Construct document URL: http://domain/uploads/lessons/html/lesson_table_id.html
        $protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $lessonTableId = (int)$lesson['id']; // lesson_table_id from lessons table
        $documentUrl = $protocol . '://' . $host . '/uploads/lessons/html/' . $lessonTableId . '.html';
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'lesson' => [
                'id' => (int)$lesson['id'],
                'title' => $lesson['title'],
                'description' => isset($lesson['description']) ? $lesson['description'] : '',
                'isVideo' => $isVideo,
                'isVip' => $isVip,
                'duration' => (int)$lesson['duration'],
                'vimeo' => isset($lesson['vimeo']) ? $lesson['vimeo'] : null,
                'documentUrl' => $documentUrl,
                'postId' => isset($lesson['postId']) ? (int)$lesson['postId'] : null,
                'viewCount' => isset($lesson['view_count']) ? (int)$lesson['view_count'] : 0,
                'likeCount' => isset($lesson['post_like']) ? (int)$lesson['post_like'] : 0,
                'comments' => isset($lesson['comments']) ? (int)$lesson['comments'] : 0,
                'thumbnail' => isset($lesson['thumbnail']) ? $lesson['thumbnail'] : null,
                'learned' => $isLearned,
                'hasAccess' => ($courseIsVip === 0) ? true : ($hasVipAccess || $isVip === 0),
            ],
            'course' => [
                'isVip' => $courseIsVip,
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
