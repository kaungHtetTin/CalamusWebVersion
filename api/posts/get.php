<?php
include('../../classes/connect.php');
include('../../classes/post.php');

$Post=new Post();
$isLike=$Post->isLike($_GET);

echo json_encode($isLike);

?>