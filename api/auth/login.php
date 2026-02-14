<?php
/**
 * API: Login
 * POST: accepts identifier (phone or email) + password
 * Returns auth token + user data on success
 */

error_reporting(0);
ini_set('display_errors', 0);

require_once __DIR__ . '/../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiJsonError('Method not allowed', 405);
}

// Rate limit by IP to mitigate brute force
$ip = apiClientIp();
if (!apiRateLimit('login:' . $ip, 15, 300)) {
    apiJsonError('Too many login attempts. Please try again later.', 429);
}

require_once __DIR__ . '/../../classes/connect.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || !is_array($input)) {
        apiJsonError('Invalid request body', 400);
    }

    $phone = isset($input['phone']) ? trim((string)$input['phone']) : '';
    $password = $input['password'] ?? '';

    if ($phone === '' || $password === '') {
        apiJsonError('Phone number and password are required', 400);
    }

    // Input length limits
    if (strlen($phone) > 32) {
        apiJsonError('Invalid request', 400);
    }

    $DB = new Database();
    $result = $DB->prepareRead('SELECT * FROM learners WHERE learner_phone = ? LIMIT 1', 's', [$phone]);

    if (!$result || count($result) === 0) {
        apiJsonError('Account not found. Please check your phone number.', 400);
    }

    $user = $result[0];

    if (!password_verify($password, $user['password'])) {
        apiJsonError('Incorrect password. Please try again.', 400);
    }

    $token = bin2hex(random_bytes(32));
    $userId = (int)$user['id'];

    $updated = $DB->prepareSave('UPDATE learners SET auth_token = ? WHERE id = ?', 'si', [$token, $userId]);
    if (!$updated) {
        apiJsonError('Login failed. Please try again.', 500);
    }

    apiJsonResponse([
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
    ]);

} catch (Exception $e) {
    apiJsonError('Login failed. Please try again.', 500);
}
