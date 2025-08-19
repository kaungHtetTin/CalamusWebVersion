<?php
class Rating{

    function getReviews($course_id){
        $query="SELECT
        learners.learner_name,
        learners.learner_phone,
        learners.learner_image,
        ratings.time,
        ratings.star,
        ratings.review
        FROM ratings
        JOIN learners ON learners.learner_phone=ratings.user_id
        WHERE ratings.course_id=$course_id";
        $DB=new Database();
        $result=$DB->read($query);
        return $result;
    }

    function get(){
        $query="SELECT
        learners.learner_name,
        learners.learner_phone,
        learners.learner_image,
        ratings.time,
        ratings.star,
        ratings.review
        FROM ratings
        JOIN learners ON learners.learner_phone=ratings.user_id
        WHERE star=5 AND review!=''
        LIMIT 20";
        $DB=new Database();
        $result=$DB->read($query);
        return $result;
    }

     function formatDateTime($time){
        $time=$time/1000;
        $year =date('Y',$time);
        $month=date('M',$time);
        $day=date('d',$time);
    
        return $month.' '.$day.', '.$year;
    }
}
?>