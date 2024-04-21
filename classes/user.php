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

        function checkMobileAppRegistration($phone){
            $DB=new Database();

            $registration[0]['app']="Easy Chinese";
            $registration[0]['major']="chinese";
            $registration[0]['mCode']="cn";
            $query="SELECT *  FROM cn_user_datas WHERE phone =$phone";
            $result=$DB->read($query);
            if($result) {
                $registration[0]['status']=true;
            }else{
                $registration[0]['status']=false;
            }

            $registration[1]['app']="Easy English";
            $registration[1]['major']="english";
            $registration[1]['mCode']="ee";
            $query="SELECT *  FROM ee_user_datas  WHERE phone =$phone";
            $result=$DB->read($query);
            if($result) {
                $registration[1]['status']=true;
            }else{
                $registration[1]['status']=false;
            }

            $registration[2]['app']="Easy Japanese";
            $registration[2]['major']="japanese";
            $registration[2]['mCode']="jp";
            $query="SELECT *  FROM jp_user_datas WHERE phone =$phone";
            $result=$DB->read($query);
            if($result) {
                $registration[2]['status']=true;
            }else{
                $registration[2]['status']=false;
            }

            $registration[3]['app']="Easy Korean";
            $registration[3]['major']="korea";
            $registration[3]['mCode']="ko";
            $query="SELECT *  FROM ko_user_datas WHERE phone =$phone";
            $result=$DB->read($query);
            if($result) {
                $registration[3]['status']=true;
            }else{
                $registration[3]['status']=false;
            }

            $registration[4]['app']="Easy Russian";
            $registration[4]['major']="russia";
            $registration[4]['mCode']="ru";
            $query="SELECT *  FROM ru_user_datas WHERE phone =$phone";
            $result=$DB->read($query);
            if($result) {
                $registration[4]['status']=true;
            }else{
                $registration[4]['status']=false;
            }

            return $registration;

        }
    }
?>