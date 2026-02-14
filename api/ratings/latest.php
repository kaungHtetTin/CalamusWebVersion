<?php
/**
 * API: Get Latest Reviews
 * GET: Fetch the latest course reviews
 */

require_once __DIR__ . '/../bootstrap.php';

error_reporting(0);
ini_set('display_errors', 0);
require_once '../../classes/connect.php';
require_once '../../classes/rating.php';
require_once '../../classes/course.php';

try {
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 6;
    if ($limit > 20) $limit = 20; // Max 20 reviews
    
    $DB = new Database();
    $Rating = new Rating();
    $Course = new Course();
    
    // Get latest reviews with course information
    $query = "SELECT
        ratings.id,
        ratings.course_id,
        ratings.user_id,
        ratings.time,
        ratings.star,
        ratings.review,
        learners.learner_name,
        learners.learner_phone,
        learners.learner_image,
        courses.title as course_title,
        courses.web_cover as course_image,
        courses.major as course_major
    FROM ratings
    JOIN learners ON learners.learner_phone = ratings.user_id
    JOIN courses ON courses.course_id = ratings.course_id
    WHERE ratings.review != '' AND ratings.review IS NOT NULL
    ORDER BY ratings.time DESC
    LIMIT $limit";
    
    $reviews = $DB->read($query);
    
    if (!$reviews || !is_array($reviews)) {
        $reviews = [];
    }
    
    // Format reviews
    $formattedReviews = [];
    foreach ($reviews as $review) {
        $formattedReviews[] = [
            'id' => (int)$review['id'],
            'courseId' => (int)$review['course_id'],
            'courseTitle' => $review['course_title'],
            'courseImage' => $review['course_image'],
            'courseMajor' => $review['course_major'],
            'learnerName' => $review['learner_name'],
            'learnerImage' => $review['learner_image'],
            'learnerPhone' => $review['learner_phone'],
            'star' => (int)$review['star'],
            'review' => $review['review'],
            'time' => (int)$review['time'],
            'formattedTime' => $Rating->formatDateTime($review['time'])
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $formattedReviews
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch latest reviews'
    ]);
}
?>
