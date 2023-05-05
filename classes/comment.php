<?php
class Comment{
    function get($post_id,$userId){
        $query="SELECT 
        comment.id,
        comment.post_id,
        comment.writer_id,
        learners.learner_name,
        learners.learner_image,
        comment.time,
        comment.parent,
        comment.likes,
        comment.body,
        CASE
        WHEN  EXISTS (SELECT NULL FROM comment_likes l 
        WHERE l.user_id ='$userId'and l.comment_id =comment.time) THEN 1
        ELSE 0
        END as is_liked
        FROM comment 
        JOIN learners ON learners.learner_phone=comment.writer_id
        WHERE post_id=$post_id";
     
        $DB=new Database();
        $result=$DB->read($query);
        return $result;
    }

    function getChild(){
        $query="SELECT 
        comment.id,
        comment.post_id,
        comment.writer_id,
        learners.learner_name,
        learners.learner_image,
        comment.time,
        comment.parent,
        comment.likes
        FROM comment 
        JOIN learners ON learners.learner_phone=comment.writer_id
        LIMIT 10";
        $DB=new Database();
        $result=$DB->read();
    }

    function updateComment($data){
        $comment_id=$data['comment_id'];
        $body=$data['body'];
        $body=addslashes($body);
        $body=htmlspecialchars($body);
        
        $query="UPDATE comment SET body='$body' where time=$comment_id";
        $DB=new Database();
        $result=$DB->save($query);

        return $result;

    }
}

?>