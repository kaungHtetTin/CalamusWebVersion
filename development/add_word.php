<?php
include('../classes/connect.php');

$json = file_get_contents('korean_words.json');
$data = json_decode($json, true);

$db = new Database();

foreach($data as $item){
    $korean_word = $item['Korean word'];
    $burmese_translation = $item['Burmese translation'];
    $korean_example_1 = $item['Korean Example 1'];
    $korean_example_2 = $item['Korean Example 2'];
    $example_sentences = json_encode([$korean_example_1, $korean_example_2]);

    $query = "INSERT INTO cards (word, burmese_translation, example_sentences) VALUES ('$korean_word', '$burmese_translation', '$example_sentences')";
    $result = $db->save($query);
    if($result){
        echo "Word added successfully: $korean_word\n";
    }else{
        echo "Failed to add word: $korean_word\n";
    }
}

echo "Words added successfully";

?>