<?php
/**
 * API: Get About page stats (Our Reach)
 * GET: Returns instructor count, course count, lectures, enrollments, members (same as about_us.php)
 */
require_once __DIR__ . '/../bootstrap.php';

require_once __DIR__ . '/../../classes/connect.php';

try {
    $DB = new Database();

    $teacherResult = $DB->read("SELECT COUNT(*) AS count FROM teachers");
    $instructors = $teacherResult ? (int)$teacherResult[0]['count'] : 0;

    $courseResult = $DB->read("SELECT COUNT(*) AS count FROM courses WHERE background_color != ''");
    $courses = $courseResult ? (int)$courseResult[0]['count'] : 0;

    $lessonResult = $DB->read("SELECT COUNT(*) AS count FROM lessons");
    $lectures = $lessonResult ? (int)$lessonResult[0]['count'] : 0;

    $enrollmentResult = $DB->read("SELECT COUNT(*) AS count FROM VipUsers");
    $enrollments = $enrollmentResult ? (int)$enrollmentResult[0]['count'] : 0;

    $membersResult = $DB->read("SELECT COUNT(*) AS count FROM learners");
    $members = $membersResult ? (int)$membersResult[0]['count'] : 0;

    echo json_encode([
        'success' => true,
        'data' => [
            'instructors' => $instructors,
            'courses' => $courses,
            'lectures' => $lectures,
            'enrollments' => $enrollments,
            'languages' => 2,
            'members' => $members,
        ],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error']);
}
