<?php
/**
 * Configuration file for Calamus API
 * Handles environment detection and base URL configuration
 */

// Detect environment based on HTTP_HOST
$isDevelopment = (
    isset($_SERVER['HTTP_HOST']) && 
    (
        $_SERVER['HTTP_HOST'] === 'localhost' ||
        $_SERVER['HTTP_HOST'] === '127.0.0.1' ||
        strpos($_SERVER['HTTP_HOST'], 'localhost') !== false ||
        strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false
    )
);

// Set base URL based on environment (can be overridden by config.local.php)
if (!defined('UPLOAD_BASE_URL')) {
    if ($isDevelopment) {
        // Development: http://localhost/upload
        define('BASE_URL', 'http://localhost/uploads');
        define('UPLOAD_BASE_URL', 'http://localhost/uploads');
    } else {
        // Production: https://www.calamuseducation.com/upload
        define('BASE_URL', 'https://www.calamuseducation.com/uploads');
        define('UPLOAD_BASE_URL', 'https://www.calamuseducation.com/uploads');
    }
}

// Upload directory paths (relative to api directory)
// From api/ directory: ../../upload/ navigates to the upload folder at server root
// Works for both development and production
// Can be overridden by config.local.php

if (!defined('UPLOAD_DIR')) {
    // Navigate from api/ up two levels to server root, then into upload/
    // Development: C:\xampp\htdocs\calamus\api\ -> ../../ -> C:\xampp\htdocs\ -> upload/ -> C:\xampp\htdocs\upload\
    // Production: /calamus/api/ -> ../../ -> / -> upload/ -> /upload/
    define('UPLOAD_DIR', '../../../uploads/');
}

if (!defined('UPLOAD_DIR_USERS')) {
    define('UPLOAD_DIR_USERS', UPLOAD_DIR . 'users/');
}
if (!defined('UPLOAD_DIR_POSTS')) {
    define('UPLOAD_DIR_POSTS', UPLOAD_DIR . 'posts/');
}
if (!defined('UPLOAD_DIR_CHAT')) {
    define('UPLOAD_DIR_CHAT', UPLOAD_DIR . 'chat/');
}
if (!defined('UPLOAD_DIR_CHATS')) {
    define('UPLOAD_DIR_CHATS', UPLOAD_DIR . 'chats/');
}
if (!defined('UPLOAD_DIR_SONGS')) {
    define('UPLOAD_DIR_SONGS', UPLOAD_DIR . 'songs/');
}

// Load local config override if it exists
$localConfigPath = __DIR__ . '/config.local.php';
if (file_exists($localConfigPath)) {
    require_once $localConfigPath;
}

// Helper function to get full upload URL
function getUploadUrl($relativePath) {
    // Remove leading slashes and normalize
    $relativePath = ltrim($relativePath, '/');
    // Remove 'uploads/' prefix if present (we'll add it via base URL)
    $relativePath = preg_replace('#^uploads/#', '', $relativePath);
    
    return UPLOAD_BASE_URL . '/' . $relativePath;
}

// Helper function to get relative upload path from full URL
function getRelativeUploadPath($fullUrl) {
    if (empty($fullUrl)) {
        return '';
    }
    
    // Extract path after domain
    $parsed = parse_url($fullUrl);
    if (isset($parsed['path'])) {
        // Remove leading slash and return
        return ltrim($parsed['path'], '/');
    }
    
    return '';
}
?>
