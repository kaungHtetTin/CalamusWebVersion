<?php
/**
 * API: Toggle like for a song
 * POST: Requires Authorization Bearer token. Body: { "songId": number }
 * Returns: { success, liked: bool, likeCount: number }
 */

require_once __DIR__ . '/../bootstrap.php';

error_reporting(0);
ini_set('display_errors', 0);
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

require_once '../../classes/connect.php';
require_once '../auth_helper.php';

try {
    $token = getBearerToken();
    if (empty($token)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Not authenticated']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $songId = isset($input['songId']) ? (int)$input['songId'] : 0;
    if ($songId <= 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid song ID']);
        exit();
    }

    $DB = new Database();
    $conn = $DB->connect();
    $tokenEscaped = mysqli_real_escape_string($conn, $token);

    $userRow = $DB->read("SELECT learner_phone FROM learners WHERE auth_token = '$tokenEscaped' LIMIT 1");
    if (!$userRow || count($userRow) === 0) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid or expired token']);
        exit();
    }
    $userId = $userRow[0]['learner_phone'];

    // Create table if not exists (one-time)
    $conn->query("CREATE TABLE IF NOT EXISTS song_likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        song_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_song (user_id, song_id),
        KEY idx_song_id (song_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $userIdEscaped = mysqli_real_escape_string($conn, $userId);

    $existing = $DB->read("SELECT id FROM song_likes WHERE user_id = '$userIdEscaped' AND song_id = $songId LIMIT 1");
    $liked = false;

    if ($existing && count($existing) > 0) {
        $DB->save("DELETE FROM song_likes WHERE user_id = '$userIdEscaped' AND song_id = $songId");
        $conn->query("UPDATE songs SET like_count = GREATEST(0, like_count - 1) WHERE id = $songId");
        $liked = false;
    } else {
        $DB->save("INSERT INTO song_likes (user_id, song_id) VALUES ('$userIdEscaped', $songId)");
        $conn->query("UPDATE songs SET like_count = like_count + 1 WHERE id = $songId");
        $liked = true;
    }

    $countRow = $DB->read("SELECT like_count FROM songs WHERE id = $songId LIMIT 1");
    $likeCount = $countRow && count($countRow) > 0 ? (int)$countRow[0]['like_count'] : 0;

    echo json_encode([
        'success' => true,
        'liked' => $liked,
        'likeCount' => $likeCount,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error']);
}
?>
