<?php
    class Post{
        function increaseViewCount($post_id){
            $query="UPDATE posts SET view_count=view_count+1 WHERE post_id=$post_id";
            $DB=new Database();
            $DB->save($query);
        }

        function getTodayStudentPost(){
            $query="SELECT 
                posts.body,
                posts.post_id,
                learners.learner_name,
                learners.learner_image
                FROM posts
                JOIN learners ON learners.learner_phone=learner_id
                WHERE has_video=0 AND hide=0 AND posts.image=''
                ORDER BY posts.id DESC
                limit 30
            ";

            $DB=new Database();
            $result=$DB->read($query);
            return $result;
        }

        function getBlogPost(){
            $query="SELECT * FROM posts WHERE show_on_blog=1";
            $DB=new Database();
            $result=$DB->read($query);
            return $result;
        }

        function formatDateTime($time){
            $time=$time/1000;
            $year =date('Y',$time);
            $month=date('M',$time);
            $day=date('d',$time);
        
            return $month.' '.$day.', '.$year;
        }

        function isLike($data){
            $post_id=$data['post_id'];
            $user_id=$data['user_id'];

            $query ="SELECT * FROM mylikes WHERE content_id=$post_id";
            $DB=new Database();
            $rows=$DB->read($query);
            $response['like']=false;
            foreach ($rows as $row){
                    
                $likesArr=json_decode($row['likes'],true);
        
                $user_ids=array_column($likesArr,"user_id");
                    
                if(in_array( $user_id, $user_ids)){
                    $response['like']=true;
                    break;
                }
            }

            return $response;
            
        }
    }
?>