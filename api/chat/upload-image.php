<?php
// CORS headers are set by .htaccess - don't duplicate them here
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

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
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    sendResponse(false, null, 'No image file uploaded or upload error occurred');
}

$file = $_FILES['image'];
$fileName = $file['name'];
$fileSize = $file['size'];
$fileTemp = $file['tmp_name'];
$fileType = $file['type'];

// Validate file type
$finfo = new finfo(FILEINFO_MIME_TYPE);
$detectedType = $finfo->file($fileTemp);

$allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
];

if (!in_array($detectedType, $allowedTypes)) {
    sendResponse(false, null, 'Invalid image type. Allowed: JPEG, PNG, GIF, WebP');
}

// Validate file size (max 5MB for images)
$maxSize = 5 * 1024 * 1024; // 5MB
if ($fileSize > $maxSize) {
    sendResponse(false, null, 'Image must not be larger than 5MB');
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
        'image/jpeg' => 'jpg',
        'image/jpg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif',
        'image/webp' => 'webp'
    ];
    $extension = $mimeToExt[$detectedType] ?? 'jpg';
}

$newFileName = $newName . '.' . $extension;
$uploadDir = '../../uploads/chat/images/';

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
    sendResponse(false, null, 'Failed to save image file. Please try again');
}

// Return file path (relative to root)
$relativePath = 'uploads/chat/images/' . $newFileName;
$fullUrl = 'https://www.calamuseducation.com/calamus/' . $relativePath;

sendResponse(true, [
    'file_path' => $relativePath,
    'file_url' => $fullUrl,
    'file_size' => $fileSize,
    'file_name' => $newFileName
]);

?>

