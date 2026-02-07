<?php
/**
 * API: Get Current User
 * GET: validates Bearer token from Authorization header
 * Returns current user data if token is valid
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
require_once '../auth_helper.php';

try {
    // Extract Bearer token
    $token = getBearerToken();

    if (empty($token)) {
        echo json_encode(['success' => false, 'error' => 'No authorization token provided']);
        exit();
    }

    $DB = new Database();
    $conn = $DB->connect();
    $token_escaped = mysqli_real_escape_string($conn, $token);

    // Find user by auth token
    $query = "SELECT * FROM learners WHERE auth_token = '$token_escaped' AND auth_token != '' LIMIT 1";
    $result = $DB->read($query);

    if (!$result) {
        echo json_encode(['success' => false, 'error' => 'Invalid or expired token']);
        exit();
    }

    $user = $result[0];

    echo json_encode([
        'success' => true,
        'data' => [
            'user' => [
                'id' => (int)$user['id'],
                'userId' => (int)$user['user_id'],
                'name' => $user['learner_name'],
                'email' => $user['learner_email'],
                'phone' => $user['learner_phone'],
                'image' => $user['learner_image'],
                'coverImage' => $user['cover_image'],
                'gender' => $user['gender'],
                'work' => $user['work'],
                'education' => $user['education'],
                'region' => $user['region'],
                'bio' => mb_convert_encoding($user['bio'] ?? '', 'UTF-8', 'UTF-8'),
            ]
        ]
    ], JSON_INVALID_UTF8_SUBSTITUTE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to validate token']);
}
?>
