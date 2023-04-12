<?php
include('../../classes/connect.php');
include('../../classes/comment.php');

$post_id=$_GET['post_id'];
$user_id=$_GET['user_id'];

$Comment=new Comment();

$comments=$Comment->get($post_id,$user_id);

if(!$comments){
 $response['status']='fail';
 echo json_encode($response);
 return ;
}

foreach($comments as $key=>$com){
    if($com['parent']!=0){
        foreach($comments as $index=>$cmt){
            if($com['parent']==$cmt['time']){
                $comments[$index]['child'][]=$com;
            }
        }
    }
}

foreach ($comments as $com){
    if($com['parent']==0){
        $cmtArr[]=$com;
    }
}

$response['comments']=$cmtArr;
$response['status']='success';

echo json_encode($response);
?>