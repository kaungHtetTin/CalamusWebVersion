<?php
require_once __DIR__ . '/../bootstrap.php';
include(__DIR__ . '/../../classes/connect.php');
include(__DIR__ . '/../../classes/song.php');

$Song = new Song();
$songs=$Song->getMostPopularSong($_GET);

echo json_encode($songs);

?>