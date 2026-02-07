<?php
/**
 * API: Register
 * POST: accepts name, phone, password, optional email
 * Creates new user account and returns auth token + user data
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

    $name = trim($input['name'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $password = $input['password'] ?? '';

    // Validation
    $errors = [];

    if (empty($name)) {
        $errors[] = 'Name is required';
    } elseif (is_numeric($name)) {
        $errors[] = 'Name cannot be a number';
    }

    if (empty($phone)) {
        $errors[] = 'Phone number is required';
    } elseif (!is_numeric($phone)) {
        $errors[] = 'Please enter a valid phone number';
    }

    if (empty($password)) {
        $errors[] = 'Password is required';
    } elseif (strlen($password) < 6) {
        $errors[] = 'Password must be at least 6 characters';
    }

    if (!empty($errors)) {
        echo json_encode(['success' => false, 'error' => implode('. ', $errors)]);
        exit();
    }

    $DB = new Database();
    $conn = $DB->connect();

    // Check if phone already exists
    $phone_escaped = mysqli_real_escape_string($conn, $phone);
    $query = "SELECT id FROM learners WHERE learner_phone = '$phone_escaped' LIMIT 1";
    $existing = $DB->read($query);

    if ($existing) {
        echo json_encode(['success' => false, 'error' => 'This phone number is already registered. Please try logging in or use a different number.']);
        exit();
    }

    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // Generate auth token
    $token = bin2hex(random_bytes(32));

    // Placeholder image
    $placeholder = "https://www.calamuseducation.com/uploads/placeholder.png";

    // Escape inputs
    $name_escaped = mysqli_real_escape_string($conn, $name);

    // Insert new user
    $query = "INSERT INTO learners (learner_phone, learner_name, password, learner_image, auth_token) 
              VALUES ('$phone_escaped', '$name_escaped', '$hashedPassword', '$placeholder', '$token')";
    $result = $DB->save($query);

    if (!$result) {
        echo json_encode(['success' => false, 'error' => 'Failed to create account. Please try again.']);
        exit();
    }

    // Create entries in language tables (same as old Auth::createUser)
    $tables = ['ee_user_datas', 'ko_user_datas', 'cn_user_datas', 'jp_user_datas', 'ru_user_datas'];
    $last_active = time();
    $clean_phone = preg_replace('/[\s\+\*#\-]/', '', $phone);

    foreach ($tables as $table) {
        $query = "INSERT INTO $table (phone, token, last_active) VALUES ('$clean_phone', 'signup-from-web-site', '$last_active')";
        $DB->save($query);
    }

    // Fetch the newly created user
    $query = "SELECT * FROM learners WHERE learner_phone = '$phone_escaped' LIMIT 1";
    $newUser = $DB->read($query);

    if (!$newUser) {
        echo json_encode(['success' => false, 'error' => 'Account created but failed to retrieve data. Please try logging in.']);
        exit();
    }

    $user = $newUser[0];

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
    echo json_encode(['success' => false, 'error' => 'Registration failed. Please try again.']);
}
?>
