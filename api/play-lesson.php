<?php
require_once __DIR__ . '/bootstrap.php';
include(__DIR__ . '/../classes/connect.php');
include(__DIR__ . '/../classes/post.php');
include(__DIR__ . '/../classes/study.php');

if($_SERVER["REQUEST_METHOD"]=="POST"){
    $user_id=$_POST['user_id'];
    $lesson_id=$_POST['lesson_id'];

    $Study=new Study();
    $Study->check($user_id,$lesson_id);

    $post_id=$_POST['post_id'];
    if($post_id!='null'){
        $Post=new Post();
        $Post->increaseViewCount($post_id);
    }

    echo "click lesson data update";


}else{
    echo "Method Not allow!";
}


?>