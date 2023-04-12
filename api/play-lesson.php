<?php
include('../classes/connect.php');
include('../classes/post.php');
include('../classes/study.php');

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