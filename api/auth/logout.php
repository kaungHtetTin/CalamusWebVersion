<?php
/**
 * API: Logout
 * POST: clears auth_token for the authenticated user
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
    $token = getBearerToken();

    if (empty($token)) {
        apiJsonResponse(['success' => true]);
    }

    $DB = new Database();
    $DB->prepareSave("UPDATE learners SET auth_token = '' WHERE auth_token = ?", 's', [$token]);
    apiJsonResponse(['success' => true]);

} catch (Exception $e) {
    apiJsonResponse(['success' => true]);
}
