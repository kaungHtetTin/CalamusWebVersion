<?php
/**
 * API: Get current user's enrolled courses and progress
 * GET: Requires Bearer token
 */

error_reporting(0);
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
require_once '../../classes/study.php';
require_once '../auth_helper.php';

try {
    $token = getBearerToken();
    if (empty($token)) {
        echo json_encode(['success' => false, 'error' => 'No authorization token provided']);
        exit();
    }

    $DB = new Database();
    $conn = $DB->connect();
    $token_escaped = mysqli_real_escape_string($conn, $token);

    // Find learner by token
    $query = "SELECT * FROM learners WHERE auth_token = '$token_escaped' AND auth_token != '' LIMIT 1";
    $result = $DB->read($query);
    if (!$result) {
        echo json_encode(['success' => false, 'error' => 'Invalid or expired token']);
        exit();
    }

    $learner = $result[0];
    $learner_phone = $learner['learner_phone'];

    $Course = new Course();
    $Study = new Study();

    $learnCounts = $Study->getCountByCourse($learner_phone);
    if (!$learnCounts) $learnCounts = [];

    // Get purchased courses (from VipUsers table)
    $purchasedCourses = $Course->learnningCourse($learner_phone);
    if (!$purchasedCourses) $purchasedCourses = [];
    
    // Get purchased course IDs to exclude from free courses
    $purchasedCourseIds = [];
    foreach ($purchasedCourses as $pc) {
        $purchasedCourseIds[] = (int)$pc['course_id'];
    }

    // Get free courses (is_vip = 0 or NULL, and not in purchased courses)
    $freeCoursesQuery = "SELECT 
        courses.course_id,
        courses.title,
        courses.duration,
        courses.rating,
        courses.cover_url,
        courses.web_cover,
        courses.background_color,
        courses.fee,
        courses.major,
        courses.teacher_id,
        courses.lessons_count,
        courses.is_vip,
        teachers.name as teacher_name,
        teachers.profile as teacher_profile
    FROM courses 
    JOIN teachers ON teachers.id=courses.teacher_id
    WHERE (courses.is_vip = 0 OR courses.is_vip IS NULL)";
    
    // Add NOT IN clause only if there are purchased courses
    if (!empty($purchasedCourseIds)) {
        $purchasedCourseIdsStr = implode(',', $purchasedCourseIds);
        $freeCoursesQuery .= " AND courses.course_id NOT IN ($purchasedCourseIdsStr)";
    }
    
    $freeCoursesQuery .= " ORDER BY courses.major ASC, courses.course_id ASC";
    
    $freeCoursesResult = $DB->read($freeCoursesQuery);
    if (!$freeCoursesResult) $freeCoursesResult = [];

    // Helper function to format course data
    $formatCourse = function($c, $courseId, $isPurchased = false) use ($Course, $learnCounts) {
        // Find progress
        $progress = 0;
        foreach ($learnCounts as $lc) {
            if ((int)$lc['course_id'] === $courseId) {
                $learned = (int)$lc['count'];
                $total = (int)$lc['lessons_count'];
                $progress = $total > 0 ? round(($learned / $total) * 100) : 0;
                break;
            }
        }

        // Get enrolled students count
        $enrolledStudents = $Course->getEnrollStudents($courseId);

        return [
            'id' => $courseId,
            'title' => $c['title'],
            'duration' => (int)$c['duration'],
            'rating' => (float)$c['rating'],
            'coverUrl' => $c['web_cover'] ?? $c['cover_url'],
            'webCover' => $c['web_cover'] ?? $c['cover_url'],
            'backgroundColor' => $c['background_color'],
            'fee' => (int)$c['fee'],
            'major' => $c['major'],
            'lessonsCount' => (int)$c['lessons_count'],
            'instructor' => $c['teacher_name'],
            'instructorId' => (int)$c['teacher_id'],
            'instructorImage' => $c['teacher_profile'] ?? null,
            'enrolledStudents' => (int)$enrolledStudents,
            'progress' => $progress,
            'isPurchased' => $isPurchased,
            'isVip' => isset($c['is_vip']) ? (int)$c['is_vip'] : 0
        ];
    };

    // Format purchased courses
    $formattedPurchased = [];
    foreach ($purchasedCourses as $enrolled) {
        $courseId = (int)$enrolled['course_id'];
        
        // Get full course details
        $query = "SELECT 
            courses.course_id,
            courses.title,
            courses.duration,
            courses.rating,
            courses.cover_url,
            courses.web_cover,
            courses.background_color,
            courses.fee,
            courses.major,
            courses.teacher_id,
            courses.lessons_count,
            courses.is_vip,
            teachers.name as teacher_name,
            teachers.profile as teacher_profile
        FROM courses 
        JOIN teachers ON teachers.id=courses.teacher_id
        WHERE courses.course_id = $courseId LIMIT 1";
        
        $courseResult = $DB->read($query);
        if (!$courseResult) continue;
        
        $c = $courseResult[0];
        $formattedPurchased[] = $formatCourse($c, $courseId, true);
    }

    // Format free courses
    $formattedFree = [];
    foreach ($freeCoursesResult as $c) {
        $courseId = (int)$c['course_id'];
        $formattedFree[] = $formatCourse($c, $courseId, false);
    }

    // Combine all courses
    $allCourses = array_merge($formattedPurchased, $formattedFree);

    echo json_encode([
        'success' => true, 
        'data' => $allCourses, 
        'count' => count($allCourses),
        'purchased' => $formattedPurchased,
        'free' => $formattedFree,
        'purchasedCount' => count($formattedPurchased),
        'freeCount' => count($formattedFree)
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to fetch my learning']);
}

?>
