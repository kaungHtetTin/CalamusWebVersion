<?php
require_once __DIR__ . '/../bootstrap.php';
include(__DIR__ . '/../../classes/connect.php');
include(__DIR__ . '/../../classes/post.php');

$Post=new Post();
$isLike=$Post->isLike($_GET);

echo json_encode($isLike);

?>