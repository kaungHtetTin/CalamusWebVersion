<?php 
class Lesson{
    function getLessonsByDayPlan($course_id,$user_id){
        $DB=new Database();
        $query="
            SELECT 
            lessons.id,
            lessons.title as lesson_title,
            lessons.duration,
            lessons.isVip,
            lessons.isVideo,
            lessons.link,
            lessons.thumbnail,
            day,
            posts.post_id,
            posts.vimeo,
            posts.view_count,
            posts.share_count,
            posts.post_like,
            posts.comments,
            lessons_categories.category_title,
            CASE
            WHEN  EXISTS (SELECT NULL FROM studies std 
            WHERE std.learner_id ='$user_id'and std.lesson_id =study_plan.lesson_id) THEN 1
            ELSE 0
            END as learned
            FROM study_plan
            JOIN lessons ON lessons.id=study_plan.lesson_id
            JOIN lessons_categories ON lessons_categories.id=lessons.category_id
            LEFT JOIN posts ON lessons.date=posts.post_id
            WHERE study_plan.course_id=$course_id
            ORDER BY day ASC , study_plan.id ASC
        ";
        $plans=$DB->read($query);
        
        for($i=0;$i<count($plans);$i++){
            $day=$plans[$i]['day'];
            $day--;
            $lessons[$day][]=$plans[$i];
        }
        
        return $lessons;

    }

    function getTotalDuration($lessons){
        $total_duration=0;
        foreach($lessons as $lesson){
            $total_duration+=$lesson['duration'];
        }
        
       return $total_duration;
    }

    function getLessonByCategory($category_id){
        $DB=new Database();
        $query="
            SELECT 
            lessons.id,
            lessons.title as lesson_title,
            lessons.duration,
            lessons.isVip,
            lessons.thumbnail,
            posts.post_id,
            posts.vimeo,
            posts.view_count,
            posts.share_count,
            posts.post_like,
            posts.comments
            FROM lessons
            JOIN posts ON lessons.date=posts.post_id
            WHERE category_id=$category_id
            ORDER BY lessons.id DESC
        ";
        $lessons=$DB->read($query);
        return $lessons;
    }

    function formatDuration($duration){
      
        if($duration==0){
            return "";
        }
        if($duration<60){
            return $duration." s";
        }else if($duration<3600){
            $min=$duration/60;
            return round($min)." min";
        }else{
            $hr=$duration/3600;
            $min=$duration%3600;
            $min=round($min/60);
            if($min>0){
                return round($hr)." hr ".$min." min";
            }else {
                return round($hr) . " hr";
            }
        }
    }

    function formatVideoDuration($duration){
        if($duration<60){
            if($duration<10){
                return "00:0".$duration;
            }else{
                return "00:".$duration;
            }
        }else if($duration<3600){
            $min=$duration/60;
            $min=floor($min);
            $sec=$duration%60;

            if($min<10)$min="0".$min;
            if($sec<10)$sec="0".$sec;
            return $min.":".$sec;
        }
    }

    function formatViewCount($count){
        if($count<=0){
            return "No view";
        }else if($count==1){
            return "1 view";
        }else if($count>1 && $count<999){
            return $count. " views";
        }else if($count>999 && $count<999999){
            $count=round($count/1000,1);
            return $count."k views";
        }else{
            $count=round($count/1000000,1);
            return $count."M views";
        }
    }

    function count(){
        $DB=new Database();
        $query="SELECT count(*) as count FROM lessons";
        $result=$DB->read($query);
        return $result[0]['count'];
    }
}

?>