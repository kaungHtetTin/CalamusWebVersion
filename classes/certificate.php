<?php 
class Certificate {

    /**
     * Store certificate. user_id = learners.learner_phone (string).
     */
    public function store($course_id, $user_id){
        $DB = new Database();
        $conn = $DB->connect();
        $user_id_escaped = mysqli_real_escape_string($conn, $user_id);
        $query = "INSERT INTO certificates (course_id, user_id) VALUES ($course_id, '$user_id_escaped')";
        $result = $DB->save($query);
        if($result){
            return $this->detail($course_id, $user_id);
        }else{
            return false;
        }
    }

    /**
     * Get certificate by course and user_id (learners.learner_phone).
     */
    public function detail($course_id, $user_id){
        $DB = new Database();
        $conn = $DB->connect();
        $user_id_escaped = mysqli_real_escape_string($conn, $user_id);
        $query = "SELECT * FROM certificates WHERE course_id = $course_id AND user_id = '$user_id_escaped' LIMIT 1";
        $result = $DB->read($query);
        if($result){
            return $result[0];
        }else {
            return false;
        }
    }

    public function detailById($id){
        $query = "SELECT * FROM certificates WHERE id=$id LIMIT 1";
        $DB = new Database();
        $result = $DB->read($query);
        if($result){
            return $result[0];
        }else {
            return false;
        }
    }
}


?>