<?php
include('../../classes/connect.php');
include('../../classes/notification.php');

$Notification=new Notification();
$notifications=$Notification->get($_GET);

echo json_encode($notifications);

?>