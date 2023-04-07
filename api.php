<?php
include('classes/connect.php');
include('classes/comment.php');
 
$Comment=new Comment();
$result=$Comment->get(1,'095161017');

echo "<pre>";
print_r($result);
echo "</pre>";

?>