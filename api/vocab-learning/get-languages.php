<?php
require_once __DIR__ . '/../bootstrap.php';
include(__DIR__ . '/../../classes/connect.php');

$db = new Database();
$query = "SELECT * FROM languages ORDER BY id ASC";
$languages = $db->read($query);

echo json_encode([
    'success' => true,
    'languages' => $languages ? $languages : []
]);

?>

