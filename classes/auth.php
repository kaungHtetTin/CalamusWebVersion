<?php
 
    class Auth {
        function login($data){
            $phone=$data['phone'];
            $password=$data['password'];
        
            $DB=new Database();
            $query="SELECT * FROM learners where learner_phone=$phone limit 1";
            $learner=$DB->read($query);

            $result="";

            if($learner){
                $hashed_password=$learner[0]['password'];
                if(password_verify($password,$hashed_password)){
                   $_SESSION['calamus_userid']=$phone;

                }else{
                    $result="Incorrect Password!";
                }
            }else{
                $result="This phone number has not registered yet!. Please try again using another phone number.";
            }

            return $result;

        }

        public function check_login($phone){
                
            $query="select*from learners where learner_phone= $phone limit 1";
            
            $DB=new Database();
            $result=$DB->read($query);
            if($result){
                $user_data=$result[0];
                return $user_data;
            }else{
                header("Location: login.php");
                die;
            } 
                
        }

        function signUp(){

        }

        function resetPassword(){

        }

        function checkVIP($course_id,$user_id){
            $query="SELECT * FROM VipUsers WHERE course_id=$course_id AND phone=$user_id";
            $DB=new Database();
            $result=$DB->read($query);
            if(!$result){
                return false;
            }else{
                return true;
            }
        }
    }
?>