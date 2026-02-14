<?php
/**
 * API: Get Current User
 * GET: validates Bearer token from Authorization header
 * Returns current user data if token is valid
 */

error_reporting(0);
ini_set('display_errors', 0);

require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../../classes/connect.php';
require_once __DIR__ . '/../auth_helper.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    apiJsonError('Method not allowed', 405);
}

try {
    $DB = new Database();
    $user = getAuthenticatedUser($DB);

    if (!$user) {
        apiJsonError('Invalid or expired token', 401);
    }

    apiJsonResponse([
        'success' => true,
        'data' => [
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
    apiJsonError('Failed to validate token', 500);
}
