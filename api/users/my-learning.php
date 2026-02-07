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

    // Get enrolled course IDs
    $enrolledCourses = $Course->learnningCourse($learner_phone);
    if (!$enrolledCourses) $enrolledCourses = [];

    $learnCounts = $Study->getCountByCourse($learner_phone);
    if (!$learnCounts) $learnCounts = [];

    // Extract course IDs and build full course details
    $formatted = [];
    foreach ($enrolledCourses as $enrolled) {
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
            teachers.name as teacher_name,
            teachers.profile as teacher_profile
        FROM courses 
        JOIN teachers ON teachers.id=courses.teacher_id
        WHERE courses.course_id = $courseId LIMIT 1";
        
        $courseResult = $DB->read($query);
        if (!$courseResult) continue;
        
        $c = $courseResult[0];
        
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

        $formatted[] = [
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
            'progress' => $progress
        ];
    }

    echo json_encode(['success' => true, 'data' => $formatted, 'count' => count($formatted)]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to fetch my learning']);
}

?>
