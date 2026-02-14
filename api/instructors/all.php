<?php
/**
 * API: Get All Instructors
 * Returns all teachers with course count, average rating, and total students
 */

require_once __DIR__ . '/../bootstrap.php';

error_reporting(0);
ini_set('display_errors', 0);
require_once '../../classes/connect.php';

try {
    $DB = new Database();

    $query = "SELECT 
        t.id,
        t.name,
        t.profile,
        t.rank,
        t.description,
        COUNT(DISTINCT c.course_id) as course_count,
        COALESCE(AVG(c.rating), 0) as avg_rating,
        COALESCE(SUM(student_counts.student_count), 0) as total_students
    FROM teachers t
    LEFT JOIN courses c ON c.teacher_id = t.id AND c.background_color != ''
    LEFT JOIN (
        SELECT course_id, COUNT(*) as student_count
        FROM VipUsers
        WHERE deleted_account = 0
        GROUP BY course_id
    ) student_counts ON student_counts.course_id = c.course_id
    GROUP BY t.id
    HAVING course_count > 0
    ORDER BY avg_rating DESC, course_count DESC";

    $result = $DB->read($query);
    $instructors = [];

    if ($result && is_array($result)) {
        foreach ($result as $row) {
            $instructors[] = [
                'id' => (int)$row['id'],
                'name' => $row['name'],
                'image' => $row['profile'] ?? null,
                'rank' => $row['rank'] ?? '',
                'bio' => mb_convert_encoding($row['description'] ?? '', 'UTF-8', 'UTF-8'),
                'courseCount' => (int)$row['course_count'],
                'avgRating' => round((float)$row['avg_rating'], 1),
                'totalStudents' => (int)$row['total_students'],
            ];
        }
    }

    echo json_encode([
        'success' => true,
        'data' => $instructors
    ], JSON_INVALID_UTF8_SUBSTITUTE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch instructors'
    ]);
}
?>
