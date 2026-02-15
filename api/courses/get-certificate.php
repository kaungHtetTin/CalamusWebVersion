<?php
/**
 * API: Get/Generate Certificate
 * Returns certificate details or generates a new one if course is completed
 */
require_once __DIR__ . '/../bootstrap.php';

require_once __DIR__ . '/../../classes/connect.php';
require_once '../../classes/certificate.php';
require_once '../../classes/course.php';
require_once '../../classes/digitencoder.php';
require_once '../../classes/auth.php';

try {
    $courseId = isset($_GET['course_id']) ? (int)$_GET['course_id'] : 0;
    // userId param = learner phone (used as user_id in certificates table)
    $phone = isset($_GET['userId']) ? trim($_GET['userId']) : (isset($_GET['phone']) ? trim($_GET['phone']) : '');

    if (!$courseId || !$phone) {
        echo json_encode(['success' => false, 'error' => 'Missing course ID or user ID (phone)']);
        exit();
    }

    $DB = new Database();
    $conn = $DB->connect();
    $phoneEscaped = mysqli_real_escape_string($conn, $phone);

    // Resolve learner for learner_name; certificates.user_id stores learner_phone
    $learnerQuery = "SELECT id, learner_name FROM learners WHERE learner_phone = '$phoneEscaped' LIMIT 1";
    $learnerResult = $DB->read($learnerQuery);
    if (!$learnerResult) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'User not found.']);
        exit();
    }
    $userName = $learnerResult[0]['learner_name'];

    $Certificate = new Certificate();
    $encoder = new DigitEncoder();

    // 2. Check if course is completed (100%) - required for both free and paid courses
    $query = "SELECT 
                courses.lessons_count,
                courses.title as course_title,
                courses.major,
                courses.certificate_title,
                courses.certificate_code,
                count(studies.id) as learned
              FROM courses
              JOIN lessons_categories ON lessons_categories.course_id = courses.course_id
              JOIN lessons ON lessons.category_id = lessons_categories.id
              JOIN studies ON studies.lesson_id = lessons.id
              WHERE courses.course_id = $courseId AND studies.learner_id = '$phoneEscaped'
              GROUP BY courses.course_id";

    $result = $DB->read($query);
    
    if (!$result) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Access Denied! You need to learn the course completely first.']);
        exit();
    }

    $courseData = $result[0];
    $lesson_count = (int)$courseData['lessons_count'];
    $learned = (int)$courseData['learned'];

    if ($learned < $lesson_count) {
        http_response_code(403);
        echo json_encode([
            'success' => false, 
            'error' => 'Access Denied! You need to learn the course completely first.',
            'learned' => $learned,
            'total' => $lesson_count
        ]);
        exit();
    }

    // 4. Get or Generate Certificate (certificates.user_id = learners.learner_phone)
    $certificate = $Certificate->detail($courseId, $phoneEscaped);
    if (!$certificate) {
        $certificate = $Certificate->store($courseId, $phoneEscaped);
    }

    if (!$certificate) {
        throw new Exception("Failed to generate certificate record.");
    }

    // 5. Format response data
    $certificate_id_encoded = $encoder->encode($certificate['id']);

    $major = $courseData['major'];
    $platform = ($major == "english") ? "English for Myanmar" : "Korean for Myanmar";
    
    // Asset URLs: use app base path (e.g. /calamus) so assets resolve when API is under a subpath
    $protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $basePath = dirname(dirname(dirname($_SERVER['SCRIPT_NAME'] ?? '')));
    $basePath = rtrim($basePath, '/');
    $baseUrl = $protocol . '://' . $host . ($basePath ? $basePath : '');
    
    $certificate_seal = ($major == "english") 
        ? $baseUrl . "/assets/images/ee_certificate_seal.png"
        : $baseUrl . "/assets/images/ko_certificate_seal.png";
    
    $certificate_bg = $baseUrl . "/assets/images/certificate_background.png";

    echo json_encode([
        'success' => true,
        'data' => [
            'certificateId' => $certificate['id'],
            'certificateCode' => $courseData['certificate_code'] . $certificate_id_encoded,
            'encodedId' => $certificate_id_encoded,
            'issuedDate' => $certificate['date'],
            'userName' => $userName,
            'courseTitle' => $courseData['certificate_title'] ?: $courseData['course_title'],
            'platform' => $platform,
            'major' => $major,
            'certificateSeal' => $certificate_seal,
            'certificateBg' => $certificate_bg,
            'qrUrl' => "https://www.calamuseducation.com/qr.php?id=" . $certificate_id_encoded
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error: ' . $e->getMessage()]);
}
