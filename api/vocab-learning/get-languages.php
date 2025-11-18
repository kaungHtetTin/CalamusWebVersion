<?php
include('../../classes/connect.php');

$db = new Database();
$query = "SELECT * FROM languages ORDER BY id ASC";
$languages = $db->read($query);

echo json_encode([
    'success' => true,
    'languages' => $languages ? $languages : []
]);

?>

