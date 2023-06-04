<?php
class Study{
    function add($learner_id,$lesson_id){
        $query="INSERT INTO studies (learner_id,lesson_id,frequent) VALUES ($learner_id,$lesson_id,1)";
        $DB=new Database();
        $DB->save($query);
    }

    function updateFrequent($learner_id,$lesson_id){
        $query="UPDATE studies SET frequent=frequent+1 WHERE learner_id=$learner_id AND lesson_id=$lesson_id";
        $DB=new Database();
        $DB->save($query);
    }

    function check($learner_id,$lesson_id){
        $query="SELECT * FROM studies WHERE learner_id=$learner_id AND lesson_id=$lesson_id LIMIT 1";
        $DB=new Database();
        $result=$DB->read($query);
        if($result){
            $this->updateFrequent($learner_id,$lesson_id);
        }else{
            $this->add($learner_id,$lesson_id);
        }
    }

    function getCount($learner_id,$course_id){
        $query ="SELECT count(*) as count 
        FROM studies 
        JOIN lessons ON lessons.id=studies.lesson_id
        JOIN lessons_categories ON lessons_categories.id=lessons.category_id
        JOIN courses ON lessons_categories.course_id=courses.course_id
        WHERE learner_id=$learner_id AND courses.course_id=$course_id";
        $DB=new Database();
        $result=$DB->read($query);
        return $result[0]['count'];
    }

    function getCountByCourse($learner_id){
        $query ="SELECT count(*) as count,courses.course_id, courses.lessons_count
        FROM studies 
        JOIN lessons ON lessons.id=studies.lesson_id
        JOIN lessons_categories ON lessons_categories.id=lessons.category_id
        JOIN courses ON lessons_categories.course_id=courses.course_id
        WHERE learner_id=$learner_id
        GROUP BY courses.course_id";

        $DB=new Database();
        $result=$DB->read($query);
        return $result;

    }
}

?>