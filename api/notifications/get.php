<?php
include('../../classes/connect.php');
include('../../classes/notification.php');

$Notification=new Notification();
$notifications=$Notification->get($_GET);

$unreadCount=$Notification->unreadCount($_GET['user_id']);

$response['notifications']=$notifications;
$response['unread']=$unreadCount;
echo json_encode($response);

?>