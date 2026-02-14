<?php
/**
 * API: Get lesson/video details
 * GET: Fetch lesson content, video link, and course curriculum
 * Params: id (lesson_id), course_id
 */
require_once __DIR__ . '/../bootstrap.php';

error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once __DIR__ . '/../../classes/connect.php';
require_once '../../classes/course.php';
require_once '../../classes/auth.php';


// Ensure text is valid UTF-8 for Korean/Myanmar display
function ensureUtf8Lesson($str) {
    if ($str === null || $str === '') return (string)$str;
    if (!mb_check_encoding($str, 'UTF-8')) return mb_convert_encoding($str, 'UTF-8', 'auto');
    return $str;
}

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
    // Use same type for JOIN: both lessons.date and posts.post_id are bigint
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
    $lessonIsVip = isset($lesson['isVip']) ? (int)$lesson['isVip'] : 0;
    $categoryId = isset($lesson['category_id']) ? (int)$lesson['category_id'] : 0;

    // If video lesson but vimeo is null (JOIN may fail on some DB types), fetch from posts by postId
    $postIdVal = isset($lesson['postId']) ? $lesson['postId'] : (isset($lesson['date']) ? $lesson['date'] : null);
    if (($lesson['isVideo'] ?? 0) == 1 && (empty($lesson['vimeo']) || $lesson['vimeo'] === null) && $postIdVal !== null && $postIdVal !== '') {
        $postIdEsc = mysqli_real_escape_string($conn, (string)$postIdVal);
        $postRow = $DB->read("SELECT vimeo, view_count, post_like, comments FROM posts WHERE post_id = '$postIdEsc' LIMIT 1");
        if ($postRow && !empty($postRow[0]['vimeo'])) {
            $lesson['vimeo'] = $postRow[0]['vimeo'];
            $lesson['view_count'] = $postRow[0]['view_count'] ?? $lesson['view_count'] ?? 0;
            $lesson['post_like'] = $postRow[0]['post_like'] ?? $lesson['post_like'] ?? 0;
            $lesson['comments'] = $postRow[0]['comments'] ?? $lesson['comments'] ?? 0;
        }
    }

    // Resolve course from the lesson's category, or by URL course_id if category is missing/invalid
    if ($categoryId > 0) {
        $courseQuery = "SELECT 
            courses.course_id,
            courses.title as course_title,
            courses.teacher_id,
            courses.is_vip,
            teachers.name as instructor_name,
            teachers.profile as instructor_image
        FROM lessons_categories
        JOIN courses ON courses.course_id = lessons_categories.course_id
        JOIN teachers ON teachers.id = courses.teacher_id
        WHERE lessons_categories.id = $categoryId LIMIT 1";
        $courseResult = $DB->read($courseQuery);
    }
    if (empty($courseResult) && $courseId > 0) {
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
    }
    if (!$courseResult) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Course not found']);
        exit();
    }

    $course = $courseResult[0];
    $actualCourseId = (int)$course['course_id'];
    $courseIsVip = isset($course['is_vip']) ? (int)$course['is_vip'] : 0;

    // If URL course_id was provided and does not match lesson's course, still allow but use actual course for VIP check
    if ($courseId !== $actualCourseId) {
        $courseId = $actualCourseId;
        $hasVipAccess = false;
        if (!empty($userId)) {
            $hasVipAccess = $Auth->checkVIP($courseId, $userId);
        }
    }
    
    // IMPORTANT: Access logic from promt.txt:
    // 1. If course is NOT VIP, everyone can access.
    // 2. If course IS VIP:
    //    a. If lesson is NOT VIP, everyone can access.
    //    b. If lesson IS VIP, only if user has access (purchased course).
    
    $canAccess = false;
    if ($courseIsVip === 0) {
        $canAccess = true;
    } else {
        if ($lessonIsVip === 0) {
            $canAccess = true;
        } else {
            if ($hasVipAccess) {
                $canAccess = true;
            }
        }
    }
    
    if (!$canAccess) {
        // Access denied - block access
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'VIP Content - Subscription required',
            'isVip' => true,
            'requiresSubscription' => true
        ]);
        exit();
    }
    
    // If we reach here, access is granted based on the logic above
    
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
                    'title' => ensureUtf8Lesson(isset($row['cat_title']) ? $row['cat_title'] : ''),
                    'lessons' => [],
                ];
            }
            if (!empty($row['id'])) {
                $rowLessonIsVip = isset($row['isVip']) ? (int)$row['isVip'] : 0;
                // Access logic:
                // - If course is FREE (is_vip = 0): all lessons accessible
                // - If course is VIP (is_vip = 1): 
                //    - If lesson is FREE (isVip = 0): accessible
                //    - If lesson is VIP (isVip = 1): need subscription
                $rowHasAccess = ($courseIsVip === 0) ? true : ($rowLessonIsVip === 0 || $hasVipAccess);
                
                $curriculum[$catId]['lessons'][] = [
                    'id' => (int)$row['id'],
                    'title' => ensureUtf8Lesson(isset($row['title']) ? $row['title'] : ''),
                    'isVideo' => isset($row['isVideo']) ? (int)$row['isVideo'] : 0,
                    'isVip' => $rowLessonIsVip,
                    'duration' => isset($row['duration']) ? (int)$row['duration'] : 0,
                    'vimeo' => isset($row['vimeo']) ? $row['vimeo'] : null,
                    'learned' => isset($row['learned']) ? (int)$row['learned'] : 0,
                    'hasAccess' => $rowHasAccess,
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

    // Single course object with all fields (no duplicate keys); ensure UTF-8 for titles
    $courseTitleOut = isset($course['course_title']) ? $course['course_title'] : (isset($course['title']) ? $course['title'] : '');
    $instructorNameOut = isset($course['instructor_name']) ? $course['instructor_name'] : (isset($course['teacher_name']) ? $course['teacher_name'] : '');
    $coursePayload = [
        'id' => (int)$course['course_id'],
        'title' => ensureUtf8Lesson($courseTitleOut),
        'instructorId' => (int)$course['teacher_id'],
        'instructorName' => ensureUtf8Lesson($instructorNameOut),
        'instructorImage' => isset($course['instructor_image']) ? $course['instructor_image'] : (isset($course['teacher_profile']) ? $course['teacher_profile'] : null),
        'isVip' => $courseIsVip,
    ];

    // postId can be bigint (e.g. 1628345742160); keep as number if safe, else string to avoid overflow/JS precision
    $postIdOut = null;
    if (isset($lesson['postId']) && $lesson['postId'] !== '' && $lesson['postId'] !== null) {
        $postIdOut = (abs((float)$lesson['postId']) <= 9007199254740991) ? (int)$lesson['postId'] : (string)$lesson['postId'];
    }

    $payload = [
        'success' => true,
        'data' => [
            'lesson' => [
                'id' => (int)$lesson['id'],
                'title' => ensureUtf8Lesson($lesson['title'] ?? ''),
                'description' => ensureUtf8Lesson(isset($lesson['description']) ? $lesson['description'] : ''),
                'isVideo' => $isVideo,
                'isVip' => $lessonIsVip,
                'duration' => (int)$lesson['duration'],
                'vimeo' => isset($lesson['vimeo']) ? $lesson['vimeo'] : null,
                'documentUrl' => $documentUrl,
                'postId' => $postIdOut,
                'viewCount' => isset($lesson['view_count']) ? (int)$lesson['view_count'] : 0,
                'likeCount' => isset($lesson['post_like']) ? (int)$lesson['post_like'] : 0,
                'comments' => isset($lesson['comments']) ? (int)$lesson['comments'] : 0,
                'thumbnail' => isset($lesson['thumbnail']) ? $lesson['thumbnail'] : null,
                'learned' => $isLearned,
                'hasAccess' => ($courseIsVip === 0) ? true : ($lessonIsVip === 0 || $hasVipAccess),
            ],
            'course' => $coursePayload,
            'curriculum' => $curriculum,
        ]
    ];
    $json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    if ($json === false) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to encode response']);
        exit();
    }
    echo $json;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to fetch lesson details']);
}

?>
