<?php
include('../../classes/connect.php');
include('../../classes/comment.php');

if($_SERVER['REQUEST_METHOD']=='POST'){
    $Comment=new Comment();
    $result=$Comment->updateComment($_POST);

    if($result){
        echo "Comment Succesfully updated";
    }else{
        echo "Update error";
    }
    
}else{
    echo 'method not allow';
}

?>