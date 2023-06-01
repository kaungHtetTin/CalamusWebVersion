<?php

    // $file=$_FILES['file']['name'];
    // $file_loc=$_FILES['file']['tmp_name'];
    // $folder="../../uploads/chats/";

    // if(move_uploaded_file($file_loc,$folder.$file)){
    //     $response['status']="success";
    //     $response['url']=$folder.$file;
      
    // }else{
    //     $response['status']="fails";
    // }
    // echo json_encode($response);

    $response = image_validation($_FILES);
    
    echo json_encode($response);

    function image_validation($image){
        $image_name = $image['file']['name'];
        $image_size = $image['file']['size'];
        $image_temp = $image['file']['tmp_name'];
        $image_type = $image['file']['type'];
        
        if(empty($image_name)){
            $response['status']="fail";
            $response['error']="Please select a file";
            return $response;
            
        }
        
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $file_type = $finfo->file($image_temp);
        
        $allowed_image_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if(!in_array($file_type, $allowed_image_types) ){
            return "Your chosen file is not a valid image type";
        }
        
        $upload_max_size = 5 * 1024 * 1024; // 5MB
        if($image_size > $upload_max_size){
            $response['status']="fail";
            $response['error']="Image must not be larger than 5MB";
            return $response;
        }
        
        $str = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcefghijklmnopqrstuvwxyz";
        $length = 10;
        $shuffled_str = str_shuffle($str);
        $new_name = substr($shuffled_str, 0, $length);
        
        $extension = pathinfo($image_name, PATHINFO_EXTENSION);	
        $image_name = $new_name.".".$extension;
        
        $images = glob("../../uploads/chats/*.*");
        if(in_array("../../uploads/chats/".$image_name, $images)){
            $response['status']="fail";
            $response['error']="Image already exists in the folder";
            return $response;
            
        }
        
        $move_file = move_uploaded_file($image_temp, "../../uploads/chats/".$image_name);
        if($move_file == false){
            $response['status']="fail";
            $response['error']="File not saved. Please try again";
            return $response;
            
        }

        $response['status']="success";
        $response['image']="https://www.calamuseducation.com/calamus/uploads/chats/".$image_name;
        return $response;
    }

?>