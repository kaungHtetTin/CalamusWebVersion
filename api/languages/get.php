<?php
/**
 * API: Get All Languages
 * GET: Returns list of all supported languages
 * Does NOT require authentication
 */
require_once __DIR__ . '/../bootstrap.php';

error_reporting(0);
ini_set('display_errors', 0);

require_once __DIR__ . '/../../classes/connect.php';

try {
    $DB = new Database();
    
    // Fetch all languages
    $query = "SELECT id, name, display_name, code, module_code FROM languages ORDER BY id ASC";
    $result = $DB->read($query);

    if (!$result) {
        echo json_encode([
            'success' => true,
            'data' => []
        ]);
        exit();
    }

    $languages = [];
    foreach ($result as $row) {
        $languages[] = [
            'id' => (int)$row['id'],
            'name' => $row['name'],
            'displayName' => $row['display_name'] ?: $row['name'],
            'code' => $row['code'] ?: '',
            'moduleCode' => $row['module_code'] ?: '',
        ];
    }

    echo json_encode([
        'success' => true,
        'data' => $languages
    ], JSON_INVALID_UTF8_SUBSTITUTE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to fetch languages']);
}
?>
