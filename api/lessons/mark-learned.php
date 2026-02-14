<?php
/**
 * API: Mark Lesson as Learned
 * POST: Marks a lesson as learned for a user
 * Requires authentication (Bearer token)
 * Params: lessonId (required)
 */

require_once __DIR__ . '/../bootstrap.php';

error_reporting(0);
ini_set('display_errors', 0);
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

require_once '../../classes/connect.php';
require_once '../../classes/study.php';
require_once '../auth_helper.php';

try {
    $token = getBearerToken();
    if (empty($token)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Not authenticated']);
        exit();
    }

    $DB = new Database();
    $conn = $DB->connect();
    $tokenEscaped = mysqli_real_escape_string($conn, $token);

    // Get user by token
    $userResult = $DB->read("SELECT learner_phone FROM learners WHERE auth_token = '$tokenEscaped' LIMIT 1");
    if (!$userResult || !is_array($userResult) || count($userResult) === 0) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid token']);
        exit();
    }
    $userId = $userResult[0]['learner_phone'];

    $input = json_decode(file_get_contents('php://input'), true);
    $lessonId = isset($input['lessonId']) ? (int)$input['lessonId'] : 0;

    if ($lessonId <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid lesson ID']);
        exit();
    }

    // Verify lesson exists
    $lessonResult = $DB->read("SELECT id FROM lessons WHERE id = $lessonId LIMIT 1");
    if (!$lessonResult || !is_array($lessonResult) || count($lessonResult) === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Lesson not found']);
        exit();
    }

    // Use Study class to mark as learned (same as old PHP app)
    $Study = new Study();
    $Study->check($userId, $lessonId);

    echo json_encode([
        'success' => true,
        'message' => 'Lesson marked as learned'
    ], JSON_INVALID_UTF8_SUBSTITUTE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
?>
