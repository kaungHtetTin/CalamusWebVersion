<?php
$link=$_GET['link'];

$data=file_get_contents($link);

$data=json_decode($data);

$data=$data->entry->content;

foreach ($data as $key => $value) {
    if($key!='type') $lesson=$value;
}


echo $lesson;

?>
