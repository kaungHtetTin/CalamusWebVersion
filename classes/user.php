<?php
    class User{
        function getEnrollStudent(){
            $DB=new Database();
            $query="SELECT count(*) as count FROM VipUsers";
            $result=$DB->read($query)[0];
            return $result['count'];
        }

        function getTotalUser(){
            $DB=new Database();
            $query="SELECT count(*) as count FROM learners";
            $result=$DB->read($query)[0];
            return $result['count'];
        }
    }
?>