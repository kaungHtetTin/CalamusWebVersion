<?php
/**
 * API: Delete Rating/Review
 * DELETE: Delete a rating
 */

require_once __DIR__ . '/../bootstrap.php';

error_reporting(0);
ini_set('display_errors', 0);
require_once '../../classes/connect.php';
require_once '../../classes/rating.php';
require_once '../auth_helper.php';

try {
    // Check authentication
    $token = getBearerToken();
    if (empty($token)) {
        http_response_code(401);
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
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid or expired token']);
        exit();
    }

    $learner = $result[0];
    $userId = $learner['learner_phone'];

    // Get input data (support both DELETE and POST with _method)
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }
    
    // Also check query parameters
    if (empty($input['id'])) {
        $input['id'] = isset($_GET['id']) ? $_GET['id'] : null;
    }

    $ratingId = isset($input['id']) ? (int)$input['id'] : 0;

    // Validation
    if ($ratingId <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid rating ID']);
        exit();
    }

    // Check if rating exists and belongs to user
    $checkQuery = "SELECT course_id FROM ratings WHERE id = $ratingId AND user_id = $userId LIMIT 1";
    $existingRating = $DB->read($checkQuery);
    
    if (!$existingRating || count($existingRating) === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Rating not found or you do not have permission to delete it']);
        exit();
    }

    $courseId = (int)$existingRating[0]['course_id'];

    // Delete rating
    $deleteQuery = "DELETE FROM ratings WHERE id = $ratingId";
    $deleteResult = $DB->save($deleteQuery);
    
    if (!$deleteResult) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to delete rating']);
        exit();
    }

    // Update course average rating
    $avgQuery = "SELECT AVG(star) as avg_rating FROM ratings WHERE course_id = $courseId";
    $avgResult = $DB->read($avgQuery);
    $avgRating = $avgResult && count($avgResult) > 0 ? (float)$avgResult[0]['avg_rating'] : 0;
    
    $updateCourseQuery = "UPDATE courses SET rating = $avgRating WHERE course_id = $courseId";
    $DB->save($updateCourseQuery);

    echo json_encode([
        'success' => true,
        'data' => [
            'id' => $ratingId,
            'deleted' => true
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to delete rating']);
}
?>
