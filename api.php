<?php
include('classes/connect.php');
include('classes/comment.php');
include('classes/util.php');
 
$Util=new Util();
$cmtTime=$Util->formatDateTime(1611317533884);
 
echo "<pre>";
print_r($cmtTime);
echo "</pre>";

?>