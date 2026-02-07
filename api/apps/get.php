<?php
/**
 * API: Get Active Apps
 * Returns apps where active_course > 0
 */

error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../classes/connect.php';

try {
    $DB = new Database();

    $query = "SELECT 
        id,
        name,
        description,
        url,
        cover,
        icon,
        type,
        active_course,
        student_learning,
        major
    FROM apps
    WHERE active_course > 0
    ORDER BY active_course DESC";

    $result = $DB->read($query);
    $apps = [];

    if ($result && is_array($result)) {
        foreach ($result as $row) {
            $apps[] = [
                'id' => (int)$row['id'],
                'name' => $row['name'],
                'description' => mb_convert_encoding($row['description'] ?? '', 'UTF-8', 'UTF-8'),
                'url' => $row['url'],
                'cover' => $row['cover'],
                'icon' => $row['icon'],
                'type' => $row['type'],
                'activeCourse' => (int)$row['active_course'],
                'studentLearning' => $row['student_learning'],
                'major' => $row['major'],
            ];
        }
    }

    echo json_encode([
        'success' => true,
        'data' => $apps
    ], JSON_INVALID_UTF8_SUBSTITUTE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch apps'
    ]);
}
?>
