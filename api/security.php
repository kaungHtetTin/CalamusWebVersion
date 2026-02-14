<?php
/**
 * API Security Layer
 * - CORS with configurable allowed origins
 * - Security headers
 * - Rate limiting (file-based) for auth and sensitive endpoints
 * - Consistent JSON response helpers
 *
 * Usage: require_once __DIR__ . '/security.php'; then call apiSecurityHeaders() at top of endpoint.
 */

if (!defined('API_SECURITY_LOADED')) {
    define('API_SECURITY_LOADED', true);
}

// Load config if not already loaded (for ALLOWED_ORIGINS, etc.)
if (!defined('UPLOAD_BASE_URL')) {
    require_once __DIR__ . '/config.php';
}

/**
 * Send CORS and security headers.
 * Call this at the start of every API script (after optional OPTIONS handling).
 *
 * @param array $options ['methods' => 'GET, POST', 'credentials' => true]
 */
function apiSecurityHeaders(array $options = []) {
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? trim($_SERVER['HTTP_ORIGIN']) : '';

    // Development: always allow any origin so local frontends (e.g. localhost:3000) work
    if (defined('API_DEVELOPMENT') && API_DEVELOPMENT) {
        header('Access-Control-Allow-Origin: *');
    } else {
        $allowed = defined('ALLOWED_ORIGINS') ? ALLOWED_ORIGINS : ['*'];
        if (in_array('*', $allowed, true)) {
            header('Access-Control-Allow-Origin: *');
        } elseif ($origin && in_array($origin, $allowed, true)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            if (!empty($options['credentials'])) {
                header('Access-Control-Allow-Credentials: true');
            }
        }
    }

    $methods = $options['methods'] ?? 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
    header('Access-Control-Allow-Methods: ' . $methods);
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept');
    header('Access-Control-Max-Age: 86400');

    // Security headers
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('X-XSS-Protection: 1; mode=block');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Content-Type: application/json; charset=UTF-8');
}

/**
 * Rate limit by identifier (e.g. IP or IP+action).
 * Uses file-based storage. Returns true if allowed, false if rate limited.
 *
 * @param string $key Unique key (e.g. 'login:' . $ip)
 * @param int $maxAttempts Max attempts in the window
 * @param int $windowSeconds Time window in seconds
 * @return bool True if request is allowed, false if rate limited
 */
function apiRateLimit($key, $maxAttempts = 10, $windowSeconds = 300) {
    if (!defined('RATE_LIMIT_ENABLED') || !RATE_LIMIT_ENABLED) {
        return true;
    }
    $dir = defined('RATE_LIMIT_DIR') ? RATE_LIMIT_DIR : (sys_get_temp_dir() . '/calamus_rate_limit');
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    $safeKey = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $key);
    $file = $dir . '/' . $safeKey . '.json';
    $now = time();
    $data = ['attempts' => [], 'count' => 0];
    if (file_exists($file)) {
        $raw = @file_get_contents($file);
        if ($raw !== false) {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                $data = $decoded;
            }
        }
    }
    // Prune attempts outside the window
    $cutoff = $now - $windowSeconds;
    $data['attempts'] = array_filter($data['attempts'], function ($t) use ($cutoff) {
        return $t > $cutoff;
    });
    $data['count'] = count($data['attempts']);
    if ($data['count'] >= $maxAttempts) {
        return false;
    }
    $data['attempts'][] = $now;
    $data['count'] = count($data['attempts']);
    @file_put_contents($file, json_encode($data), LOCK_EX);
    return true;
}

/**
 * Get client IP for rate limiting (considers X-Forwarded-For if behind proxy).
 */
function apiClientIp() {
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $list = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($list[0]);
    }
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

/**
 * Send JSON response and exit.
 */
function apiJsonResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

/**
 * Send JSON error and exit.
 */
function apiJsonError($message, $code = 400, $extra = []) {
    $payload = array_merge(['success' => false, 'error' => $message], $extra);
    apiJsonResponse($payload, $code);
}

/**
 * Handle OPTIONS preflight; call at top of script and exit if OPTIONS.
 */
function apiHandlePreflight() {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}
