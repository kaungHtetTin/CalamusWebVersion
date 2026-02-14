<?php
/**
 * API: Get Course Detail
 * Returns detailed course information including instructor and lessons
 */
require_once __DIR__ . '/../bootstrap.php';

error_reporting(0);
ini_set('display_errors', 0);

require_once __DIR__ . '/../../classes/connect.php';
require_once '../../classes/course.php';
require_once '../../classes/teacher.php';
require_once '../../classes/lesson.php';
require_once '../../classes/rating.php';
require_once '../../classes/study.php';
require_once '../../classes/auth.php';

try {
    // Get course ID from query parameter
    $courseId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    $userId = isset($_GET['userId']) ? trim($_GET['userId']) : '';
    
    if ($courseId <= 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid course ID'
        ]);
        exit();
    }
    
    $Course = new Course();
    $Teacher = new Teacher();
    $Lesson = new Lesson();
    $Rating = new Rating();
    $Study = new Study();
    $Auth = new Auth();
    $DB = new Database();
    $conn = $DB->connect();
    
    // Get course details
    $course = $Course->detail($courseId);
    
    // Get course VIP status
    $courseIsVip = isset($course['is_vip']) ? (int)$course['is_vip'] : 0;
    
    // Check if user has VIP access to this course (only matters if course is VIP)
    $hasVipAccess = false;
    if (!empty($userId) && $courseIsVip === 1) {
        $hasVipAccess = $Auth->checkVIP($courseId, $userId);
    }
    
    // Calculate progress for user if userId is provided
    $progress = 0;
    $learnedCount = 0;
    if (!empty($userId)) {
        $learnedCount = $Study->getCount($userId, $courseId);
        $totalLessons = (int)$course['lessons_count'];
        if ($totalLessons > 0) {
            $progress = round(($learnedCount / $totalLessons) * 100);
        }
    }
    
    if (!$course) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Course not found'
        ]);
        exit();
    }
    
    // Get teacher details
    $teacher = $Teacher->detail($course['teacher_id']);
    if (!$teacher) {
        $teacher = [
            'id' => $course['teacher_id'],
            'name' => 'Unknown Instructor',
            'profile' => null,
            'rank' => null,
            'facebook' => null,
            'telegram' => null
        ];
    }
    
    // Get enrolled students count
    $enrolledStudents = $Course->getEnrollStudents($courseId);
    if (!$enrolledStudents) {
        $enrolledStudents = 0;
    }
    
    // Get total duration
    $totalDuration = $Course->getDuration($courseId);
    if (!$totalDuration) {
        $totalDuration = 0;
    }
    
    // Get lessons organized by day - pass userId to get learned status
    $userIdForLessons = !empty($userId) ? $userId : 0;
    $lessonsByDay = $Lesson->getLessonsByDayPlan($courseId, $userIdForLessons);
    if (!$lessonsByDay || !is_array($lessonsByDay)) {
        $lessonsByDay = [];
    }
    
    // Get reviews (include user_id/learner_phone for comparison)
    $reviewsQuery = "SELECT
        learners.learner_name,
        learners.learner_phone,
        learners.learner_image,
        ratings.id,
        ratings.time,
        ratings.star,
        ratings.review
    FROM ratings
    JOIN learners ON learners.learner_phone = ratings.user_id
    WHERE ratings.course_id = $courseId
    ORDER BY ratings.time DESC";
    
    $DB = new Database();
    $reviews = $DB->read($reviewsQuery);
    if (!$reviews || !is_array($reviews)) {
        $reviews = [];
    }
    
    // Calculate rating distribution
    $ratingDistribution = [
        '5' => 0,
        '4' => 0,
        '3' => 0,
        '2' => 0,
        '1' => 0
    ];
    
    if (count($reviews) > 0) {
        foreach ($reviews as $review) {
            $star = (string)$review['star'];
            if (isset($ratingDistribution[$star])) {
                $ratingDistribution[$star]++;
            }
        }
    }
    
    // Format lessons by day
    $formattedDays = [];
    if ($lessonsByDay) {
        foreach ($lessonsByDay as $dayIndex => $dayLessons) {
            $dayDuration = $Lesson->getTotalDuration($dayLessons);
            $formattedLessons = [];
            
            foreach ($dayLessons as $lesson) {
                // Ensure proper UTF-8 encoding for Korean/Myanmar text
                $lessonTitle = $lesson['lesson_title'] ?? '';
                $categoryTitle = $lesson['category_title'] ?? '';
                if (!mb_check_encoding($lessonTitle, 'UTF-8')) {
                    $lessonTitle = mb_convert_encoding($lessonTitle, 'UTF-8', 'auto');
                }
                if (!mb_check_encoding($categoryTitle, 'UTF-8')) {
                    $categoryTitle = mb_convert_encoding($categoryTitle, 'UTF-8', 'auto');
                }
                
                $lessonIsVip = isset($lesson['isVip']) ? (int)$lesson['isVip'] : 0;
                // Access logic:
                // - If course is FREE (is_vip = 0): all lessons accessible
                // - If course is VIP (is_vip = 1): need subscription for all lessons
                $hasAccess = ($courseIsVip === 0) ? true : $hasVipAccess;
                
                $formattedLessons[] = [
                    'id' => (int)$lesson['id'],
                    'title' => $lessonTitle,
                    'duration' => (int)($lesson['duration'] ?? 0),
                    'formattedDuration' => $Lesson->formatDuration($lesson['duration'] ?? 0),
                    'isVideo' => (bool)($lesson['isVideo'] ?? false),
                    'isVip' => (bool)$lessonIsVip,
                    'category' => $categoryTitle,
                    'thumbnail' => $lesson['thumbnail'] ?? null,
                    'learned' => isset($lesson['learned']) ? (int)$lesson['learned'] : 0,
                    'hasAccess' => $hasAccess,
                ];
            }
            
            $formattedDays[] = [
                'day' => $dayIndex + 1,
                'lessonsCount' => count($dayLessons),
                'totalDuration' => $Lesson->formatDuration($dayDuration),
                'lessons' => $formattedLessons
            ];
        }
    }
    
    // Format reviews and check if user has a rating
    $formattedReviews = [];
    $userRating = null;
    if ($reviews) {
        foreach ($reviews as $index => $review) {
            $reviewData = [
                'id' => isset($review['id']) ? (int)$review['id'] : ($index + 1),
                'learnerName' => $review['learner_name'],
                'learnerImage' => $review['learner_image'],
                'learnerPhone' => $review['learner_phone'],
                'star' => (int)$review['star'],
                'review' => $review['review'],
                'time' => $review['time'],
                'formattedTime' => $Rating->formatDateTime($review['time'])
            ];
            
            // Check if this is the current user's rating
            if (!empty($userId) && $review['learner_phone'] == $userId) {
                $userRating = $reviewData;
            }
            
            $formattedReviews[] = $reviewData;
        }
    }
    
    // Ensure course and instructor text are valid UTF-8 for Korean/Myanmar
    $courseTitle = $course['title'] ?? '';
    $courseDescription = $course['description'] ?? '';
    $teacherName = $teacher['name'] ?? 'Unknown Instructor';
    if (!mb_check_encoding($courseTitle, 'UTF-8')) {
        $courseTitle = mb_convert_encoding($courseTitle, 'UTF-8', 'auto');
    }
    if (!mb_check_encoding($courseDescription, 'UTF-8')) {
        $courseDescription = mb_convert_encoding($courseDescription, 'UTF-8', 'auto');
    }
    if (!mb_check_encoding($teacherName, 'UTF-8')) {
        $teacherName = mb_convert_encoding($teacherName, 'UTF-8', 'auto');
    }

    // Format response
    $formattedCourse = [
        'id' => (int)$course['course_id'],
        'title' => $courseTitle,
        'description' => $courseDescription,
        'duration' => (int)$course['duration'],
        'rating' => (float)$course['rating'],
        'coverUrl' => $course['cover_url'],
        'webCover' => $course['web_cover'],
        'backgroundColor' => $course['background_color'],
        'fee' => (int)$course['fee'],
        'major' => $course['major'],
        'lessonsCount' => (int)$course['lessons_count'],
        'preview' => $course['preview'] ?? null,
        'totalDuration' => $Lesson->formatDuration($totalDuration),
        'enrolledStudents' => (int)$enrolledStudents,
        'instructor' => [
            'id' => (int)$teacher['id'],
            'name' => $teacherName,
            'profile' => $teacher['profile'],
            'rank' => $teacher['rank'] ?? null,
            'facebook' => $teacher['facebook'] ?? null,
            'telegram' => $teacher['telegram'] ?? null,
        ],
        'curriculum' => $formattedDays,
        'reviews' => $formattedReviews,
        'ratingDistribution' => $ratingDistribution,
        'totalReviews' => count($formattedReviews),
        'progress' => $progress,
        'learnedCount' => $learnedCount,
        'userRating' => $userRating // Current user's rating if exists
    ];
    
    // Include course VIP status in response
    $formattedCourse['isVip'] = $courseIsVip;
    // hasAccess means user can view content (either free course or purchased VIP)
    $formattedCourse['hasAccess'] = ($courseIsVip === 0) ? true : $hasVipAccess;
    // isPurchased: hide buy button when user has purchased (VIP) OR has enrolled in free course (has progress)
    $formattedCourse['isPurchased'] = $hasVipAccess || ($courseIsVip === 0 && $learnedCount > 0);
    
    echo json_encode([
        'success' => true,
        'data' => $formattedCourse
    ], JSON_INVALID_UTF8_SUBSTITUTE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch course details'
    ]);
}
?>
