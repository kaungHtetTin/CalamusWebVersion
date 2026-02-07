<?php
/**
 * API: Logout
 * POST: clears auth_token for the authenticated user
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
require_once '../auth_helper.php';

try {
    $token = getBearerToken();

    if (empty($token)) {
        // Already logged out or no token - just return success
        echo json_encode(['success' => true]);
        exit();
    }

    if (!empty($token)) {
        $DB = new Database();
        $conn = $DB->connect();
        $token_escaped = mysqli_real_escape_string($conn, $token);

        // Clear auth token in database
        $query = "UPDATE learners SET auth_token = '' WHERE auth_token = '$token_escaped'";
        $DB->save($query);
    }

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    // Even if clearing fails, consider logout successful on client side
    echo json_encode(['success' => true]);
}
?>
