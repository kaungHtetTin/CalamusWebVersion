<?php
class Notification {
    function get($data){
        $user_id=$data['user_id'];

        $query="SELECT
        learners.learner_name as writer_name,
        learners.learner_image as writer_image,
        posts.post_id,
        posts.body,
        posts.image,
        posts.has_video,
        notification.id,
        notification.time,
        notification.seen,
        notification.action,
        notification.comment_id,
        notification_action.action_name as takingAction
        FROM notification 
        JOIN posts ON posts.post_id=notification.post_id
        JOIN learners ON learners.learner_phone=notification.writer_id
        join notification_action ON notification_action.action = notification.action
        WHERE notification.owner_id=$user_id
        ORDER BY notification.time DESC
        limit 100
        ";

        $DB=new Database();

        return $DB->read($query);
    }
}
?>