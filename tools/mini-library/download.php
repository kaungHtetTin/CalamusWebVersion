<?php
require_once __DIR__ . '/../../classes/connect.php';

$db = new Database();

// Get book ID
$bookId = isset($_GET['id']) ? (int) $_GET['id'] : 0;

if ($bookId <= 0) {
    header('Location: index.php');
    exit;
}

// Get book information
$books = $db->read("SELECT * FROM library_books WHERE id = $bookId LIMIT 1");

if (!$books || empty($books)) {
    header('Location: index.php');
    exit;
}

$book = $books[0];
$pdfPath = '../../../' . $book['pdf_file'];

// Check if file exists
if (!file_exists($pdfPath)) {
    die('File not found');
}

// Set headers for PDF download
header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="' . basename($book['pdf_file']) . '"');
header('Content-Length: ' . filesize($pdfPath));
header('Cache-Control: must-revalidate');
header('Pragma: public');

// Output the file
readfile($pdfPath);
exit;

