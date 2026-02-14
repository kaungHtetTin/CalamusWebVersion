<?php
/**
 * API: Toggle like for a song
 * POST: Requires Authorization Bearer token. Body: { "songId": number }
 * Returns: { success, liked: bool, likeCount: number }
 *
 * Uses mylikes table: content_id = song id (songs.id), likes = JSON array of {user_id}, rowNo for sharding.
 */

require_once __DIR__ . '/../bootstrap.php';

error_reporting(0);
ini_set('display_errors', 0);
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

require_once __DIR__ . '/../../classes/connect.php';
require_once __DIR__ . '/../auth_helper.php';

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
    $userIdEscaped = mysqli_real_escape_string($conn, $userId);

    // Verify song exists
    $songCheck = $DB->read("SELECT id, like_count FROM songs WHERE id = $songId LIMIT 1");
    if (!$songCheck || count($songCheck) === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Song not found']);
        exit();
    }

    $contentId = $songId; // content_id in mylikes = song id (songs.id)

    $likeRows = $DB->read("SELECT * FROM mylikes WHERE content_id = $contentId");
    $rowCount = ($likeRows && is_array($likeRows)) ? count($likeRows) : 0;

    $liked = false;

    if ($rowCount === 0) {
        // First like ever on this song
        $arr = [['user_id' => $userId]];
        $likesJson = mysqli_real_escape_string($conn, json_encode($arr));
        $DB->save("INSERT INTO mylikes (content_id, likes, rowNo) VALUES ($contentId, '$likesJson', 0)
                   ON DUPLICATE KEY UPDATE likes = '$likesJson'");
        $DB->save("UPDATE songs SET like_count = like_count + 1 WHERE id = $songId");
        $liked = true;
    } else {
        $alreadyLike = false;
        $foundRowNo = 0;
        $foundKey = 0;
        $foundLikesArr = [];

        foreach ($likeRows as $row) {
            $likesArrTemp = json_decode($row['likes'], true);
            if ($likesArrTemp && is_array($likesArrTemp)) {
                $userIds = array_column($likesArrTemp, 'user_id');
                $searchKey = array_search($userId, $userIds);
                if ($searchKey !== false) {
                    $alreadyLike = true;
                    $foundKey = $searchKey;
                    $foundRowNo = (int)$row['rowNo'];
                    $foundLikesArr = $likesArrTemp;
                    break;
                }
            }
        }

        if ($alreadyLike) {
            // Unlike: remove user from likes array
            array_splice($foundLikesArr, $foundKey, 1);
            $likesString = mysqli_real_escape_string($conn, json_encode($foundLikesArr));
            $DB->save("UPDATE mylikes SET likes = '$likesString' WHERE content_id = $contentId AND rowNo = $foundRowNo");
            $DB->save("UPDATE songs SET like_count = GREATEST(like_count - 1, 0) WHERE id = $songId");
            $liked = false;
        } else {
            // Like: add user to likes
            $DB->save("UPDATE songs SET like_count = like_count + 1 WHERE id = $songId");
            $likeCountResult = $DB->read("SELECT like_count FROM songs WHERE id = $songId LIMIT 1");
            $currentLikeCount = ($likeCountResult && is_array($likeCountResult)) ? (int)$likeCountResult[0]['like_count'] : 0;
            $rowNo = (int)round($currentLikeCount / 10000);

            $existingRow = $DB->read("SELECT likes FROM mylikes WHERE content_id = $contentId AND rowNo = $rowNo LIMIT 1");
            $likesArr = [];
            if ($existingRow && is_array($existingRow) && count($existingRow) > 0) {
                $decoded = json_decode($existingRow[0]['likes'], true);
                if ($decoded && is_array($decoded)) {
                    $likesArr = $decoded;
                }
            }
            $likesArr[] = ['user_id' => $userId];
            $likesString = mysqli_real_escape_string($conn, json_encode($likesArr));
            $DB->save("INSERT INTO mylikes (content_id, likes, rowNo) VALUES ($contentId, '$likesString', $rowNo)
                       ON DUPLICATE KEY UPDATE likes = '$likesString'");
            $liked = true;
        }
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
