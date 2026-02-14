<?php
/**
 * API: Create Rating/Review
 * POST: Create a new rating for a course
 */

require_once __DIR__ . '/../bootstrap.php';

error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display, but log errors
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

    // Get POST data
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }

    $courseId = isset($input['courseId']) ? (int)$input['courseId'] : 0;
    $star = isset($input['star']) ? (int)$input['star'] : 0;
    $review = isset($input['review']) ? trim($input['review']) : '';

    // Validation
    if ($courseId <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid course ID']);
        exit();
    }

    if ($star < 1 || $star > 5) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Rating must be between 1 and 5']);
        exit();
    }

    // Check if user already has a rating for this course
    $checkQuery = "SELECT id FROM ratings WHERE course_id = $courseId AND user_id = $userId LIMIT 1";
    $existingRating = $DB->read($checkQuery);
    
    if ($existingRating && count($existingRating) > 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'You have already rated this course. Use update instead.']);
        exit();
    }

    // Insert new rating
    $time = round(microtime(true) * 1000); // Milliseconds timestamp
    $reviewEscaped = mysqli_real_escape_string($conn, $review);
    
    $insertQuery = "INSERT INTO ratings (course_id, user_id, star, review, time) 
                    VALUES ($courseId, $userId, $star, '$reviewEscaped', $time)";
    
    // Execute query using the same connection to get insert ID
    $insertResult = mysqli_query($conn, $insertQuery);
    
    if (!$insertResult) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to create rating: ' . mysqli_error($conn)]);
        exit();
    }

    // Get the inserted rating ID using the same connection
    $ratingId = mysqli_insert_id($conn);
    
    if (!$ratingId || $ratingId === 0) {
        // Fallback: query by course_id, user_id, and time
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
        WHERE ratings.course_id = $courseId 
        AND ratings.user_id = $userId 
        AND ratings.time = $time
        LIMIT 1";
        
        $ratingResult = $DB->read($getQuery);
    } else {
        // Get the inserted rating with user info using the insert ID
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
    }
    
    if (!$ratingResult || count($ratingResult) === 0) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to retrieve created rating']);
        exit();
    }

    $rating = $ratingResult[0];
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
            'id' => (int)$rating['id'],
            'courseId' => (int)$rating['course_id'],
            'userId' => $rating['user_id'],
            'star' => (int)$rating['star'],
            'review' => $rating['review'],
            'time' => (int)$rating['time'],
            'learnerName' => $rating['learner_name'],
            'learnerImage' => $rating['learner_image'],
            'formattedTime' => $Rating->formatDateTime($rating['time'])
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    $errorMessage = 'Failed to create rating';
    if (isset($conn) && mysqli_error($conn)) {
        $errorMessage .= ': ' . mysqli_error($conn);
    }
    echo json_encode(['success' => false, 'error' => $errorMessage]);
}
?>
