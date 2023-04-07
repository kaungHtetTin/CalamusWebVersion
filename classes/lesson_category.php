<?php 
class LessonCategory{
    function getVideoChannel($channel){
        $query="SELECT * FROM lessons_categories WHERE course_id=9 AND major='$channel' ORDER BY sort_order DESC";
        $DB=new Database();
        $result=$DB->read($query);
        return $result;
    }

    function detail($id){
        $query="SELECT * FROM lessons_categories WHERE id=$id";
        $DB=new Database();
        $result=$DB->read($query);
        return $result[0];
    }
}

?>