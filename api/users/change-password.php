<?php
/**
 * API: Change User Password
 * POST: Updates authenticated user's password
 * Requires authentication (Bearer token)
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

require_once '../../classes/connect.php';
require_once '../auth_helper.php';

try {
    // Get authenticated user
    $token = getBearerToken();
    if (empty($token)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Not authenticated']);
        exit();
    }

    $DB = new Database();
    $conn = $DB->connect();
    $token_escaped = mysqli_real_escape_string($conn, $token);

    // Find user by token
    $userQuery = "SELECT id, password FROM learners WHERE auth_token = '$token_escaped' LIMIT 1";
    $userResult = $DB->read($userQuery);

    if (!$userResult || !isset($userResult[0])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid token']);
        exit();
    }

    $user = $userResult[0];
    $userId = (int)$user['id'];
    $hashedPassword = $user['password'];

    // Get input data
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid request body']);
        exit();
    }

    $currentPassword = $input['currentPassword'] ?? '';
    $newPassword = $input['newPassword'] ?? '';

    if (empty($currentPassword) || empty($newPassword)) {
        echo json_encode(['success' => false, 'error' => 'Current and new passwords are required']);
        exit();
    }

    // Verify current password
    if (!password_verify($currentPassword, $hashedPassword)) {
        echo json_encode(['success' => false, 'error' => 'Incorrect current password']);
        exit();
    }

    // Hash new password
    $newHashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    $newHashedPassword_escaped = mysqli_real_escape_string($conn, $newHashedPassword);

    // Update password
    $updateQuery = "UPDATE learners SET password = '$newHashedPassword_escaped' WHERE id = $userId";
    $DB->save($updateQuery);

    echo json_encode([
        'success' => true,
        'message' => 'Password updated successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to update password']);
}
?>
