<?php
include('../../classes/connect.php');
include('../../classes/song.php');

$Song = new Song();
$songs=$Song->getMostPopularSong($_GET);

echo json_encode($songs);

?>