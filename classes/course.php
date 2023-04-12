<?php

class Course {
    function get(){
        $DB=new Database();
        $query="SELECT 
        courses.course_id,
        courses.title,
        courses.duration,
        courses.description,
        courses.rating,
        courses.cover_url,
        courses.background_color,
        courses.fee,
        courses.major,
        courses.teacher_id,
        teachers.name as teacher_name
        From courses 
        JOIN teachers ON teachers.id=courses.teacher_id";
        $result=$DB->read($query);
        return $result;
    }

    function getFeatureCourses(){
        $DB=new Database();
        $query="SELECT 
        courses.course_id,
        courses.title,
        courses.duration,
        courses.description,
        courses.rating,
        courses.cover_url,
        courses.background_color,
        courses.fee,
        courses.major,
        courses.teacher_id,
        teachers.name as teacher_name
        From courses 
        JOIN teachers ON teachers.id=courses.teacher_id
        ORDER BY rating DESC limit 5";
        $result=$DB->read($query);
        return $result;
    }

    function getNewCourses(){
        $DB=new Database();
        $query="SELECT 
        courses.course_id,
        courses.title,
        courses.duration,
        courses.description,
        courses.rating,
        courses.cover_url,
        courses.background_color,
        courses.fee,
        courses.major,
        courses.teacher_id,
        teachers.name as teacher_name
        From courses 
        JOIN teachers ON teachers.id=courses.teacher_id
        ORDER BY courses.course_id DESC limit 5";
        $result=$DB->read($query);
        return $result;
    }


    function detail($course_id){
        $DB=new Database();
        $query="SELECT * FROM courses WHERE course_id=$course_id";
        $course=$DB->read($query)[0];
        return $course;

    }

   
    function getEnrollStudents($course_id){
        $DB=new Database();
        $query="SELECT count(*) as count FROM VipUsers where course_id=$course_id";
        $result=$DB->read($query)[0];
        return $result['count'];
    }

    function getDuration($course_id){
        $DB=new Database();
        $query="SELECT SUM(duration) as duration FROM lessons 
        JOIN lessons_categories ON lessons_categories.id=lessons.category_id
        WHERE lessons_categories.course_id=$course_id;
        ";
        $result=$DB->read($query);
        return $result[0]['duration'];
    }

}

?>