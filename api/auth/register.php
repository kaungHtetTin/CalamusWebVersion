<?php
/**
 * API: Register
 * POST: accepts name, phone, password, optional email
 * Creates new user account and returns auth token + user data
 */

error_reporting(0);
ini_set('display_errors', 0);

require_once __DIR__ . '/../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiJsonError('Method not allowed', 405);
}

$ip = apiClientIp();
if (!apiRateLimit('register:' . $ip, 5, 600)) {
    apiJsonError('Too many registration attempts. Please try again later.', 429);
}

require_once __DIR__ . '/../../classes/connect.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || !is_array($input)) {
        apiJsonError('Invalid request body', 400);
    }

    $name = isset($input['name']) ? trim((string)$input['name']) : '';
    $phone = isset($input['phone']) ? trim((string)$input['phone']) : '';
    $password = $input['password'] ?? '';

    $errors = [];

    if ($name === '') {
        $errors[] = 'Name is required';
    } elseif (is_numeric($name)) {
        $errors[] = 'Name cannot be a number';
    }
    if (strlen($name) > 100) {
        $errors[] = 'Name is too long';
    }

    if ($phone === '') {
        $errors[] = 'Phone number is required';
    } elseif (!preg_match('/^[0-9+\s\-]{6,32}$/', $phone)) {
        $errors[] = 'Please enter a valid phone number';
    }

    if ($password === '') {
        $errors[] = 'Password is required';
    } elseif (strlen($password) < 6) {
        $errors[] = 'Password must be at least 6 characters';
    } elseif (strlen($password) > 256) {
        $errors[] = 'Password is too long';
    }

    if (!empty($errors)) {
        apiJsonError(implode('. ', $errors), 400);
    }

    $DB = new Database();

    $existing = $DB->prepareRead('SELECT id FROM learners WHERE learner_phone = ? LIMIT 1', 's', [$phone]);
    if ($existing && count($existing) > 0) {
        apiJsonError('This phone number is already registered. Please try logging in or use a different number.', 400);
    }

    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    $token = bin2hex(random_bytes(32));
    $placeholder = 'https://www.calamuseducation.com/uploads/placeholder.png';

    // Use prepared statement for insert
    $conn = $DB->connect();
    $stmt = mysqli_prepare($conn, 'INSERT INTO learners (learner_phone, learner_name, password, learner_image, auth_token) VALUES (?, ?, ?, ?, ?)');
    if (!$stmt) {
        apiJsonError('Failed to create account. Please try again.', 500);
    }
    mysqli_stmt_bind_param($stmt, 'sssss', $phone, $name, $hashedPassword, $placeholder, $token);
    if (!mysqli_stmt_execute($stmt)) {
        mysqli_stmt_close($stmt);
        apiJsonError('Failed to create account. Please try again.', 500);
    }
    mysqli_stmt_close($stmt);

    $clean_phone = preg_replace('/[\s\+\*#\-]/', '', $phone);
    $last_active = time();
    $tables = ['ee_user_datas', 'ko_user_datas', 'cn_user_datas', 'jp_user_datas', 'ru_user_datas'];
    foreach ($tables as $table) {
        $table = preg_replace('/[^a-zA-Z0-9_]/', '', $table);
        $DB->prepareSave("INSERT INTO $table (phone, token, last_active) VALUES (?, 'signup-from-web-site', ?)", 'si', [$clean_phone, $last_active]);
    }

    $newUser = $DB->prepareRead('SELECT * FROM learners WHERE learner_phone = ? LIMIT 1', 's', [$phone]);
    if (!$newUser || count($newUser) === 0) {
        apiJsonError('Account created but failed to retrieve data. Please try logging in.', 500);
    }

    $user = $newUser[0];

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
    apiJsonError('Registration failed. Please try again.', 500);
}
