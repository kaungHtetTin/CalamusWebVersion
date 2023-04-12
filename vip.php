<?php
include ('classes/connect.php');

$query="select * from courses";
$DB=new Database();
$courses=$DB->read($query);

// foreach($courses as $course){
//     $course_id=$course['course_id'];
$course_id=7;
    $query="SELECT id,count(*) as enroll,course_id,phone FROM VipUsers WHERE course_id=$course_id GROUP BY phone ORDER BY enroll DESC; ";
    
    $enrolls=$DB->read($query);

    $greatest_count=$enrolls[0]['enroll'];
    //if($greatest_count>1){
        //for($i=0;$i<$greatest_count;$i++){
            foreach($enrolls as $enroll){
                $count=$enroll['enroll'];
                if($count>1){
                    $id=$enroll['id'];
                    $query="Delete from VipUsers where id=$id";
                    $DB->save($query);
                    echo $query ."<br>";
                }
            }
        //}
   // }
    
// }


?>