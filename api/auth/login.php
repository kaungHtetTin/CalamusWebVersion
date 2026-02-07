<?php
/**
 * API: Login
 * POST: accepts identifier (phone or email) + password
 * Returns auth token + user data on success
 */

error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

require_once '../../classes/connect.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid request body']);
        exit();
    }

    $phone = trim($input['phone'] ?? '');
    $password = $input['password'] ?? '';

    if (empty($phone) || empty($password)) {
        echo json_encode(['success' => false, 'error' => 'Phone number and password are required']);
        exit();
    }

    $DB = new Database();
    $conn = $DB->connect();
    $phone_escaped = mysqli_real_escape_string($conn, $phone);

    $query = "SELECT * FROM learners WHERE learner_phone = '$phone_escaped' LIMIT 1";
    $result = $DB->read($query);

    if (!$result) {
        echo json_encode(['success' => false, 'error' => 'Account not found. Please check your phone number.']);
        exit();
    }

    $user = $result[0];

    // Verify password
    if (!password_verify($password, $user['password'])) {
        echo json_encode(['success' => false, 'error' => 'Incorrect password. Please try again.']);
        exit();
    }

    // Generate new auth token
    $token = bin2hex(random_bytes(32));

    // Store token in database
    $userId = (int)$user['id'];
    $query = "UPDATE learners SET auth_token = '$token' WHERE id = $userId";
    $DB->save($query);

    // Return user data
    echo json_encode([
        'success' => true,
        'data' => [
            'token' => $token,
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
    echo json_encode(['success' => false, 'error' => 'Login failed. Please try again.']);
}
?>
