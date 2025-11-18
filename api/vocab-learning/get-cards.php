<?php
include('../../classes/connect.php');
include('../../classes/LearningFlow.php');
include('../../classes/user.php');

$phone = $_GET['phone'];
$User = new User();
$user = $User->detail($phone);

$user_id = $user['id'];
$language_id = $_GET['language_id'];
$deck_id = $_GET['deck_id'];

$LearningFlow = new LearningFlow();
$cards = $LearningFlow->getLearningCards($user_id,10, $language_id, $deck_id);

echo $cards;

?>