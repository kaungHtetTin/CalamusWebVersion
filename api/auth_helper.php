<?php
/**
 * Helper function to get the Authorization header
 * Handles various server configurations (Apache, CGI, etc.)
 */
function getAuthorizationHeader() {
    $headers = null;

    // Method 1: Standard server variable
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER['HTTP_AUTHORIZATION']);
    }
    // Method 2: Apache redirect
    elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
    }
    // Method 3: apache_request_headers() function
    elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        // Server-side fix: Apache lowercases headers sometimes
        $requestHeaders = array_combine(
            array_map('ucwords', array_keys($requestHeaders)),
            array_values($requestHeaders)
        );
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }
    // Method 4: getallheaders()
    elseif (function_exists('getallheaders')) {
        $allHeaders = getallheaders();
        foreach ($allHeaders as $name => $value) {
            if (strtolower($name) === 'authorization') {
                $headers = trim($value);
                break;
            }
        }
    }

    return $headers ?: '';
}

/**
 * Extract Bearer token from Authorization header
 */
function getBearerToken() {
    $authHeader = getAuthorizationHeader();
    if (!empty($authHeader) && preg_match('/Bearer\s+(.+)$/i', $authHeader, $matches)) {
        $token = trim($matches[1]);
        // Reject obviously invalid tokens (length / format)
        if (strlen($token) >= 16 && strlen($token) <= 256 && ctype_xdigit($token)) {
            return $token;
        }
    }
    return '';
}

/**
 * Validate Bearer token and return the learner row, or null.
 * Uses prepared statement. Requires Database instance and connection.
 *
 * @param Database $DB
 * @return array|null Learner row or null if invalid/missing token
 */
function getAuthenticatedUser($DB) {
    $token = getBearerToken();
    if (empty($token)) {
        return null;
    }
    $rows = $DB->prepareRead('SELECT * FROM learners WHERE auth_token = ? AND auth_token != "" LIMIT 1', 's', [$token]);
    if (!$rows || count($rows) === 0) {
        return null;
    }
    return $rows[0];
}
?>
