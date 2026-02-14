<?php
/**
 * API: Change User Password
 * POST: Updates authenticated user's password
 * Requires authentication (Bearer token)
 */

error_reporting(0);
ini_set('display_errors', 0);

require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../../classes/connect.php';
require_once __DIR__ . '/../auth_helper.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiJsonError('Method not allowed', 405);
}

try {
    $DB = new Database();
    $user = getAuthenticatedUser($DB);
    if (!$user) {
        apiJsonError('Not authenticated', 401);
    }

    $userId = (int)$user['id'];
    $hashedPassword = $user['password'];

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !is_array($input)) {
        apiJsonError('Invalid request body', 400);
    }

    $currentPassword = $input['currentPassword'] ?? '';
    $newPassword = $input['newPassword'] ?? '';

    if ($currentPassword === '' || $newPassword === '') {
        apiJsonError('Current and new passwords are required', 400);
    }
    if (strlen($newPassword) > 256) {
        apiJsonError('New password is too long', 400);
    }

    if (!password_verify($currentPassword, $hashedPassword)) {
        apiJsonError('Incorrect current password', 400);
    }

    $newHashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    $ok = $DB->prepareSave('UPDATE learners SET password = ? WHERE id = ?', 'si', [$newHashedPassword, $userId]);
    if (!$ok) {
        apiJsonError('Failed to update password', 500);
    }

    apiJsonResponse(['success' => true, 'message' => 'Password updated successfully']);

} catch (Exception $e) {
    apiJsonError('Failed to update password', 500);
}
