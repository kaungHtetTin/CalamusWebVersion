<?php
header('Content-Type: application/json');
include('../../classes/connect.php');

// Helper function to send JSON response
function sendResponse($success, $data = null, $error = null) {
    $response = ['success' => $success];
    if ($data !== null) {
        $response['data'] = $data;
    }
    if ($error !== null) {
        $response['error'] = $error;
    }
    echo json_encode($response);
    exit;
}

// Check if file was uploaded
if (!isset($_FILES['voice']) || $_FILES['voice']['error'] !== UPLOAD_ERR_OK) {
    sendResponse(false, null, 'No voice file uploaded or upload error occurred');
}

$file = $_FILES['voice'];
$fileName = $file['name'];
$fileSize = $file['size'];
$fileTemp = $file['tmp_name'];
$fileType = $file['type'];

// Validate file type
$finfo = new finfo(FILEINFO_MIME_TYPE);
$detectedType = $finfo->file($fileTemp);

$allowedTypes = [
    'audio/mpeg',      // MP3
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/ogg',
    'audio/webm',
    'audio/aac',
    'audio/m4a',
    'audio/x-m4a'
];

if (!in_array($detectedType, $allowedTypes)) {
    sendResponse(false, null, 'Invalid file type. Allowed: MP3, WAV, OGG, WebM, AAC, M4A');
}

// Validate file size (max 10MB for voice messages)
$maxSize = 10 * 1024 * 1024; // 10MB
if ($fileSize > $maxSize) {
    sendResponse(false, null, 'Voice file must not be larger than 10MB');
}

// Generate unique filename
$str = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
$length = 15;
$shuffledStr = str_shuffle($str);
$newName = substr($shuffledStr, 0, $length);

$extension = pathinfo($fileName, PATHINFO_EXTENSION);
if (empty($extension)) {
    // Try to determine extension from MIME type
    $mimeToExt = [
        'audio/mpeg' => 'mp3',
        'audio/mp3' => 'mp3',
        'audio/wav' => 'wav',
        'audio/x-wav' => 'wav',
        'audio/ogg' => 'ogg',
        'audio/webm' => 'webm',
        'audio/aac' => 'aac',
        'audio/m4a' => 'm4a',
        'audio/x-m4a' => 'm4a'
    ];
    $extension = $mimeToExt[$detectedType] ?? 'mp3';
}

$newFileName = $newName . '.' . $extension;
$uploadDir = '../../uploads/chat/voice/';

// Create directory if it doesn't exist
if (!file_exists($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        sendResponse(false, null, 'Failed to create upload directory');
    }
}

// Check if file already exists (very unlikely but check anyway)
$fullPath = $uploadDir . $newFileName;
if (file_exists($fullPath)) {
    // Regenerate name
    $newName = substr(str_shuffle($str), 0, $length);
    $newFileName = $newName . '.' . $extension;
    $fullPath = $uploadDir . $newFileName;
}

// Move uploaded file
if (!move_uploaded_file($fileTemp, $fullPath)) {
    sendResponse(false, null, 'Failed to save voice file. Please try again');
}

// Return file path (relative to root)
$relativePath = 'uploads/chat/voice/' . $newFileName;
$fullUrl = 'https://www.calamuseducation.com/calamus/' . $relativePath;

sendResponse(true, [
    'file_path' => $relativePath,
    'file_url' => $fullUrl,
    'file_size' => $fileSize,
    'file_name' => $newFileName
]);

?>

