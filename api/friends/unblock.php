<?php
/**
 * API: Unblock a user
 * POST: { otherId }
 * Requires authentication. Removes block record from blocks table.
 */

require_once __DIR__ . '/../bootstrap.php';

error_reporting(0);
ini_set('display_errors', 0);
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

require_once '../../classes/connect.php';
require_once '../auth_helper.php';
require_once 'friends_helper.php';

try {
    $DB = new Database();
    $conn = $DB->connect();

    $me = friends_get_current_user($DB, $conn);
    if (!$me) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Not authenticated']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $otherId = isset($input['otherId']) ? trim((string)$input['otherId']) : '';

    if ($otherId === '') {
        echo json_encode(['success' => false, 'error' => 'otherId is required']);
        exit();
    }

    $myId = (string)$me['learner_phone'];
    if ($myId === $otherId) {
        echo json_encode(['success' => false, 'error' => 'Cannot unblock yourself']);
        exit();
    }

    $myIdEsc = mysqli_real_escape_string($conn, $myId);
    $otherIdEsc = mysqli_real_escape_string($conn, $otherId);

    // Check if block exists
    $checkQuery = "SELECT id FROM blocks WHERE user_id = '$myIdEsc' AND blocked_user_id = '$otherIdEsc' LIMIT 1";
    $existing = $DB->read($checkQuery);

    if (!$existing || empty($existing)) {
        echo json_encode(['success' => true, 'action' => 'not_blocked', 'message' => 'User is not blocked']);
        exit();
    }

    // Delete block record
    $deleteQuery = "DELETE FROM blocks WHERE user_id = '$myIdEsc' AND blocked_user_id = '$otherIdEsc'";
    $result = $DB->save($deleteQuery);

    if (!$result) {
        echo json_encode(['success' => false, 'error' => 'Failed to unblock user']);
        exit();
    }

    echo json_encode(['success' => true, 'action' => 'unblocked']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error']);
}

?>
