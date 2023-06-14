<?php 
class Util{
    function formatDateTime($cmtTime){
        $milliseconds = floor(microtime(true) * 1000);
        $day="60*60*24*1000";
        $period=$milliseconds-$cmtTime;
        if($period<$day*3){
               $period=round($period/1000);
               $min=60;
               $hour=$min*60;
               $d=$hour*24;
               if($period<60){
                   return $period.'s ago';
               }else if($period>=$min&&$period<$hour){
                   return floor($period/$min).'min ago';
               }else {
                   return floor($period/$d).'d ago';
              }
        }else{
          
            $seconds = ceil($cmtTime / 1000);
            return date("d-m-Y", $seconds);
        }
    }

    function formatCount($count){
        if($count>=0 && $count<999){
            return $count;
        }else if($count>999 && $count<999999){
            $count=round($count/1000,1);
            return $count."k";
        }else{
            $count=round($count/1000000,1);
            return $count."M";
        }
    }
}

?>