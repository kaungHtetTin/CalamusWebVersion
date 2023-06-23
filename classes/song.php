<?php
class Song{

    function get($data,$userId){
        $major=$data['category'];
    $query ="SELECT * FROM songs WHERE type='$major' ORDER BY id DESC";
        $DB=new Database();
        $Songs=$DB->read($query);

        if(!sizeof($Songs)==0){
                
            foreach($Songs as $song){
                    
                $song['is_liked']=0;
                $song_id=$song['song_id'];
                
               
                $query="SELECT * FROM mylikes WHERE content_id=$song_id";
                $likeRows=$DB->read($query);
                foreach ($likeRows as $row){
                
                        $likesArr=json_decode($row['likes'],true);
                
                        $user_ids=array_column($likesArr,"user_id");
                        
                    if(in_array( $userId, $user_ids)){
                        $song['is_liked']=1;
                        
                    }
                }
                $arr[]=$song;
                
            }
                
                return $arr;
                    
        }else{
            return false;
        }
    }

    function getMostPopularSong($data,$userId){
        $major=$data['category'];
        $query ="SELECT * FROM songs WHERE type='$major' ORDER BY like_count DESC limit 50";
        $DB=new Database();
        $Songs=$DB->read($query);

        if(!sizeof($Songs)==0){
                
            foreach($Songs as $song){
                    
                $song['is_liked']=0;
                $song_id=$song['song_id'];
                
               
                $query="SELECT * FROM mylikes WHERE content_id=$song_id";
                $likeRows=$DB->read($query);
                foreach ($likeRows as $row){
                
                        $likesArr=json_decode($row['likes'],true);
                
                        $user_ids=array_column($likesArr,"user_id");
                        
                    if(in_array( $userId, $user_ids)){
                        $song['is_liked']=1;
                        
                    }
                }
                $arr[]=$song;
                
            }
                
                return $arr;
                    
        }else{
            return false;
        }
    }
}
?>