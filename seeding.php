<?php 
include("classes/connect.php");

$DB = new Database();

$query = "SELECT * FROM courses";
$courses = $DB->read($query);

$query = "SELECT * FROM lessons";
$lessons = $DB->read($query);

foreach($lessons as $lesson){
    $lesson_id = $lesson['id'];
    $query = "INSERT INTO studies (learner_id,lesson_id) VALUES ('09561017',$lesson_id)";
    $DB->save($query);
}

?>