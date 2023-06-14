<?php
class Teacher{
    function detail($teacher_id){
        $DB=new Database();
        $query="SELECT * FROM teachers where id=$teacher_id";
        $result=$DB->read($query);
        return $result[0];
    }

    function index(){
        $DB=new Database();
        $query="SELECT * FROM teachers";
        $result=$DB->read($query);
        return $result;
    }

    function count(){
        $DB=new Database();
        $query="SELECT count(*) as count FROM teachers";
        $result=$DB->read($query);
        return $result[0]['count'];
    }

    function getNumberOfStudent($teacher_id){
        $DB=new Database();
        $query="
        SELECT count(*) as total_student, teachers.name,teachers.id FROM VipUsers JOIN courses USING (course_id) JOIN teachers ON teachers.id =courses.teacher_id 
        WHERE teachers.id=$teacher_id
        ";
        $result=$DB->read($query);
        $total=$result[0]['total_student'];
        if($total>1000){
            return round($total/1000,1)."K";
        }else{
            return $total;
        }
    }

    function courses($teacher_id){
        $DB=new Database();
        $query="SELECT 
        courses.course_id,
        courses.title,
        courses.duration,
        courses.description,
        courses.rating,
        courses.cover_url,
        courses.web_cover,
        courses.background_color,
        courses.fee,
        courses.major,
        courses.teacher_id,
        courses.lessons_count,
        teachers.name as teacher_name
        From courses 
        JOIN teachers ON teachers.id=courses.teacher_id
        WHERE teachers.id=$teacher_id
        ORDER BY courses.course_id DESC limit 5";
        $result=$DB->read($query);
        return $result;
    }
}
?>