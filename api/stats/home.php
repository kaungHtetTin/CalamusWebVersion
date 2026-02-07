<?php
/**
 * API: Get Home Page Stats
 * Returns live statistics for the hero section:
 * - Total courses, lessons, instructors, enrolled students
 * - Average rating across all courses
 * - Top instructor avatars for social proof
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

try {
    $DB = new Database();

    // Total courses
    $coursesResult = $DB->read("SELECT COUNT(*) as count FROM courses WHERE background_color != ''");
    $totalCourses = $coursesResult ? (int)$coursesResult[0]['count'] : 0;

    // Total lessons from lessons table, split by type
    $lessonsResult = $DB->read("
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN isVideo = 1 THEN 1 ELSE 0 END) as video_count,
            SUM(CASE WHEN isVideo = 0 THEN 1 ELSE 0 END) as document_count
        FROM lessons
    ");
    $totalLessons = $lessonsResult ? (int)$lessonsResult[0]['total'] : 0;
    $videoLessons = $lessonsResult ? (int)$lessonsResult[0]['video_count'] : 0;
    $documentLessons = $lessonsResult ? (int)$lessonsResult[0]['document_count'] : 0;

    // Total instructors
    $instructorsResult = $DB->read("SELECT COUNT(DISTINCT teacher_id) as count FROM courses WHERE background_color != ''");
    $totalInstructors = $instructorsResult ? (int)$instructorsResult[0]['count'] : 0;

    // Total enrolled students (unique users)
    $studentsResult = $DB->read("SELECT COUNT(DISTINCT phone) as count FROM VipUsers");
    $totalStudents = $studentsResult ? (int)$studentsResult[0]['count'] : 0;

    // Average rating
    $ratingResult = $DB->read("SELECT AVG(rating) as avg_rating FROM courses WHERE rating > 0 AND background_color != ''");
    $avgRating = $ratingResult ? round((float)$ratingResult[0]['avg_rating'], 1) : 0;

    // Rating count (courses with ratings)
    $ratingCountResult = $DB->read("SELECT COUNT(*) as count FROM courses WHERE rating > 0 AND background_color != ''");
    $ratingCount = $ratingCountResult ? (int)$ratingCountResult[0]['count'] : 0;

    // Top instructors (for social proof avatars)
    $instructorsData = $DB->read("
        SELECT 
            t.id,
            t.name,
            t.profile,
            COUNT(c.course_id) as course_count,
            AVG(c.rating) as avg_rating
        FROM teachers t
        JOIN courses c ON c.teacher_id = t.id
        WHERE c.background_color != ''
        GROUP BY t.id
        ORDER BY avg_rating DESC, course_count DESC
        LIMIT 5
    ");

    $topInstructors = [];
    if ($instructorsData) {
        foreach ($instructorsData as $instructor) {
            $topInstructors[] = [
                'id' => (int)$instructor['id'],
                'name' => $instructor['name'],
                'image' => $instructor['profile'] ?? null,
                'courseCount' => (int)$instructor['course_count'],
            ];
        }
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'totalCourses' => $totalCourses,
            'totalLessons' => $totalLessons,
            'videoLessons' => $videoLessons,
            'documentLessons' => $documentLessons,
            'totalInstructors' => $totalInstructors,
            'totalStudents' => $totalStudents,
            'avgRating' => $avgRating,
            'ratingCount' => $ratingCount,
            'topInstructors' => $topInstructors,
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch stats'
    ]);
}
?>
