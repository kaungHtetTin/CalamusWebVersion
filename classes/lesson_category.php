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

    function getAdditionalLesson($major){
        $query = "SELECT * FROM lessons_categories WHERE course_id = 14 AND major = '$major'";
        $DB = new Database();
        $categories = $DB->read($query);

        foreach($categories as $key=>$category){
            $category_id = $category['id'];
            $query = "SELECT * FROM lessons WHERE category_id = $category_id";
            $lessons = $DB->read($query);
            $categories[$key]['lessons'] = $lessons;
        }

        return $categories;
    }

    function getAdditionalCourse($major){
        $query = "SELECT * FROM courses WHERE major ='not' ";
        $DB = new Database();
        $additional_courses  = $DB->read($query);
        foreach($additional_courses as $key=>$course){
            $course_id = $course['course_id'];
            $query = "SELECT * FROM lessons_categories WHERE course_id = $course_id AND major = '$major'";
            $categories = $DB->read($query);
            $additional_courses[$key]['categories']= $categories;
        }
        return $additional_courses;
    }
}

?>