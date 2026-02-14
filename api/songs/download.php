<?php
/**
 * API: Increment download count for a song
 * POST: Body: { "songId": number }
 * Returns: { success, downloadCount: number }
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

try {
    $input = json_decode(file_get_contents('php://input'), true);
    $songId = isset($input['songId']) ? (int)$input['songId'] : 0;
    if ($songId <= 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid song ID']);
        exit();
    }

    $DB = new Database();
    $conn = $DB->connect();

    $conn->query("UPDATE Songs SET download_count = download_count + 1 WHERE id = $songId");

    $countRow = $DB->read("SELECT download_count FROM Songs WHERE id = $songId LIMIT 1");
    $downloadCount = $countRow && count($countRow) > 0 ? (int)$countRow[0]['download_count'] : 0;

    echo json_encode([
        'success' => true,
        'downloadCount' => $downloadCount,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error']);
}
?>
