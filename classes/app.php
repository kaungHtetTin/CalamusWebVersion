<?php
class App{
    function getRand(){
        $query="SELECT * FROM apps ORDER BY Rand() LIMIT 1";
        $DB=new Database();
        $result=$DB->read($query);
        return $result[0];
    }

    function get(){
        $query="SELECT * FROM apps";
        $DB=new Database();
        $result=$DB->read($query);
        return $result;
    }

    function detail($id){
        $query="SELECT * FROM apps WHERE id=$id LIMIT 1";
        $DB=new Database();
        $result=$DB->read($query);
        return $result[0];
    }
}
?>