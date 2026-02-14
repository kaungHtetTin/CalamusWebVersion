<?php
/**
 * Simple test endpoint to debug lesson API
 */

require_once __DIR__ . '/../bootstrap.php';

require_once __DIR__ . '/../../classes/connect.php';

try {
    $DB = new Database();
    
    // Test 1: Check if lessons table exists and has data
    $lessons = $DB->read("SELECT * FROM lessons LIMIT 5");
    $lessonCount = $DB->read("SELECT COUNT(*) as cnt FROM lessons");
    
    // Test 2: Check lessons_categories
    $categories = $DB->read("SELECT * FROM lessons_categories LIMIT 5");
    $catCount = $DB->read("SELECT COUNT(*) as cnt FROM lessons_categories");
    
    // Test 3: Check courses
    $courses = $DB->read("SELECT * FROM courses LIMIT 5");
    $courseCount = $DB->read("SELECT COUNT(*) as cnt FROM courses");
    
    echo json_encode([
        'lessons_total' => $lessonCount ? $lessonCount[0]['cnt'] : 0,
        'lessons_sample' => $lessons,
        'categories_total' => $catCount ? $catCount[0]['cnt'] : 0,
        'categories_sample' => $categories,
        'courses_total' => $courseCount ? $courseCount[0]['cnt'] : 0,
        'courses_sample' => $courses,
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
