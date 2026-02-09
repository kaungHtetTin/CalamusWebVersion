<?php
/**
 * API: Update User Profile
 * POST: Updates authenticated user's profile
 * Requires authentication (Bearer token)
 * Supports multipart/form-data for image uploads
 */

error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../classes/connect.php';
require_once '../auth_helper.php';
require_once '../config.php';

try {
    // Get authenticated user
    $token = getBearerToken();
    if (empty($token)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Not authenticated']);
        exit();
    }

    $DB = new Database();
    $conn = $DB->connect();
    $token_escaped = mysqli_real_escape_string($conn, $token);

    // Find user by token
    $userQuery = "SELECT learner_phone FROM learners WHERE auth_token = '$token_escaped' LIMIT 1";
    $userResult = $DB->read($userQuery);

    if (!$userResult || !isset($userResult[0])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid token']);
        exit();
    }

    $userPhone = $userResult[0]['learner_phone'];
    $userPhone_escaped = mysqli_real_escape_string($conn, $userPhone);

    // Get form data
    $name = isset($_POST['name']) ? trim($_POST['name']) : '';
    $bio = isset($_POST['bio']) ? trim($_POST['bio']) : '';
    $work = isset($_POST['work']) ? trim($_POST['work']) : '';
    $education = isset($_POST['education']) ? trim($_POST['education']) : '';
    $region = isset($_POST['region']) ? trim($_POST['region']) : '';

    // Validate name (required)
    if (empty($name)) {
        echo json_encode(['success' => false, 'error' => 'Name is required']);
        exit();
    }

    // Handle profile image upload
    $profileImageUrl = null;
    if (isset($_FILES['profileImage']) && $_FILES['profileImage']['error'] === UPLOAD_ERR_OK) {
        $profileImageUrl = uploadImage($_FILES['profileImage'], 'profile');
        if (!$profileImageUrl) {
            echo json_encode(['success' => false, 'error' => 'Failed to upload profile image']);
            exit();
        }
    }

    // Handle cover image upload
    $coverImageUrl = null;
    if (isset($_FILES['coverImage']) && $_FILES['coverImage']['error'] === UPLOAD_ERR_OK) {
        $coverImageUrl = uploadImage($_FILES['coverImage'], 'cover');
        if (!$coverImageUrl) {
            echo json_encode(['success' => false, 'error' => 'Failed to upload cover image']);
            exit();
        }
    }

    // Build update query
    $updateFields = [];
    $updateFields[] = "learner_name = '" . mysqli_real_escape_string($conn, $name) . "'";
    
    if ($bio !== '') {
        $updateFields[] = "bio = '" . mysqli_real_escape_string($conn, $bio) . "'";
    }
    if ($work !== '') {
        $updateFields[] = "work = '" . mysqli_real_escape_string($conn, $work) . "'";
    }
    if ($education !== '') {
        $updateFields[] = "education = '" . mysqli_real_escape_string($conn, $education) . "'";
    }
    if ($region !== '') {
        $updateFields[] = "region = '" . mysqli_real_escape_string($conn, $region) . "'";
    }
    if ($profileImageUrl) {
        $updateFields[] = "learner_image = '" . mysqli_real_escape_string($conn, $profileImageUrl) . "'";
    }
    if ($coverImageUrl) {
        $updateFields[] = "cover_image = '" . mysqli_real_escape_string($conn, $coverImageUrl) . "'";
    }

    if (empty($updateFields)) {
        echo json_encode(['success' => false, 'error' => 'No fields to update']);
        exit();
    }

    $updateQuery = "UPDATE learners SET " . implode(', ', $updateFields) . " WHERE learner_phone = '$userPhone_escaped'";
    $DB->save($updateQuery);

    echo json_encode([
        'success' => true,
        'message' => 'Profile updated successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to update profile']);
}

/**
 * Upload image file and return URL
 */
function uploadImage($file, $type = 'profile') {
    $image_name = $file['name'];
    $image_size = $file['size'];
    $image_temp = $file['tmp_name'];
    
    if (empty($image_name) || $image_size === 0) {
        return null;
    }
    
    // Validate file type
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $file_type = $finfo->file($image_temp);
    $allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!in_array($file_type, $allowed_types)) {
        return null;
    }
    
    // Validate file size (max 5MB)
    $upload_max_size = 5 * 1024 * 1024;
    if ($image_size > $upload_max_size) {
        return null;
    }
    
    // Generate unique filename
    $str = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcefghijklmnopqrstuvwxyz";
    $length = 15;
    $shuffled_str = str_shuffle($str);
    $new_name = substr($shuffled_str, 0, $length);
    $extension = pathinfo($image_name, PATHINFO_EXTENSION);
    $image_name = $new_name . "." . $extension;
    
    // Determine upload directory (physical path)
    $upload_dir = UPLOAD_DIR_USERS;
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }
    
    // Check if file already exists (unlikely but check anyway)
    $target_path = $upload_dir . $image_name;
    if (file_exists($target_path)) {
        // Try again with timestamp
        $image_name = $new_name . "_" . time() . "." . $extension;
        $target_path = $upload_dir . $image_name;
    }
    
    // Move uploaded file
    if (move_uploaded_file($image_temp, $target_path)) {
        // Return full URL using config
        $relativePath = 'users/' . $image_name;
        return getUploadUrl($relativePath);
    }
    
    return null;
}
?>
