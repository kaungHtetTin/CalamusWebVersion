<?php
/**
 * API: Increment download count for a song
 * POST: Body: { "songId": number }
 * Returns: { success, downloadCount: number }
 */

error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

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
    $songId = isset($input['songId']) ? (int)$input['songId'] : 0;
    if ($songId <= 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid song ID']);
        exit();
    }

    $DB = new Database();
    $conn = $DB->connect();

    $conn->query("UPDATE songs SET download_count = download_count + 1 WHERE id = $songId");

    $countRow = $DB->read("SELECT download_count FROM songs WHERE id = $songId LIMIT 1");
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
