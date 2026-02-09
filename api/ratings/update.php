<?php
/**
 * API: Update Rating/Review
 * PUT/PATCH: Update an existing rating
 */

error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, PATCH, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

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

    // Get input data (support both PUT/PATCH and POST with _method)
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }

    $ratingId = isset($input['id']) ? (int)$input['id'] : 0;
    $star = isset($input['star']) ? (int)$input['star'] : null;
    $review = isset($input['review']) ? trim($input['review']) : null;

    // Validation
    if ($ratingId <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid rating ID']);
        exit();
    }

    // Check if rating exists and belongs to user
    $checkQuery = "SELECT * FROM ratings WHERE id = $ratingId AND user_id = $userId LIMIT 1";
    $existingRating = $DB->read($checkQuery);
    
    if (!$existingRating || count($existingRating) === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Rating not found or you do not have permission to update it']);
        exit();
    }

    $rating = $existingRating[0];
    $courseId = (int)$rating['course_id'];

    // Build update query
    $updateFields = [];
    if ($star !== null) {
        if ($star < 1 || $star > 5) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Rating must be between 1 and 5']);
            exit();
        }
        $updateFields[] = "star = $star";
    }
    
    if ($review !== null) {
        $reviewEscaped = mysqli_real_escape_string($conn, $review);
        $updateFields[] = "review = '$reviewEscaped'";
    }

    if (empty($updateFields)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'No fields to update']);
        exit();
    }

    $updateQuery = "UPDATE ratings SET " . implode(', ', $updateFields) . " WHERE id = $ratingId";
    $updateResult = $DB->save($updateQuery);
    
    if (!$updateResult) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to update rating']);
        exit();
    }

    // Get updated rating with user info
    $getQuery = "SELECT 
        ratings.id,
        ratings.course_id,
        ratings.user_id,
        ratings.star,
        ratings.review,
        ratings.time,
        learners.learner_name,
        learners.learner_image
    FROM ratings
    JOIN learners ON learners.learner_phone = ratings.user_id
    WHERE ratings.id = $ratingId LIMIT 1";
    
    $ratingResult = $DB->read($getQuery);
    
    if (!$ratingResult || count($ratingResult) === 0) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to retrieve updated rating']);
        exit();
    }

    $updatedRating = $ratingResult[0];
    $Rating = new Rating();

    // Update course average rating
    $avgQuery = "SELECT AVG(star) as avg_rating FROM ratings WHERE course_id = $courseId";
    $avgResult = $DB->read($avgQuery);
    $avgRating = $avgResult && count($avgResult) > 0 ? (float)$avgResult[0]['avg_rating'] : 0;
    
    $updateCourseQuery = "UPDATE courses SET rating = $avgRating WHERE course_id = $courseId";
    $DB->save($updateCourseQuery);

    echo json_encode([
        'success' => true,
        'data' => [
            'id' => (int)$updatedRating['id'],
            'courseId' => (int)$updatedRating['course_id'],
            'userId' => $updatedRating['user_id'],
            'star' => (int)$updatedRating['star'],
            'review' => $updatedRating['review'],
            'time' => (int)$updatedRating['time'],
            'learnerName' => $updatedRating['learner_name'],
            'learnerImage' => $updatedRating['learner_image'],
            'formattedTime' => $Rating->formatDateTime($updatedRating['time'])
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to update rating']);
}
?>
