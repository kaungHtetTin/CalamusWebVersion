<?php
/**
 * API: Get Songs with Lyrics
 * Returns popular songs, all songs, and artists for a category
 */
require_once __DIR__ . '/../bootstrap.php';

error_reporting(0);
ini_set('display_errors', 0);

require_once __DIR__ . '/../../classes/connect.php';

try {
    $category = isset($_GET['category']) ? $_GET['category'] : 'english';
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $userId = isset($_GET['userId']) ? trim($_GET['userId']) : '';
    $limit = 20;
    $offset = ($page - 1) * $limit;
    
    $DB = new Database();
    $conn = $DB->connect();
    $userIdEscaped = $userId !== '' ? mysqli_real_escape_string($conn, $userId) : '';

    // Resolve user_liked from mylikes (content_id = song id, likes = JSON array of {user_id})
    $userLikedSongIds = [];
    $resolveLiked = ($userIdEscaped !== '');

    // Base URL for media files
    $baseUrl = 'https://www.calamuseducation.com/uploads/songs';

    // Get popular songs (top 20 by like count)
    $popularQuery = "SELECT * FROM songs WHERE type='$category' ORDER BY like_count DESC LIMIT 20";
    $popularResult = $DB->read($popularQuery);

    // Get all songs with pagination
    $songsQuery = "SELECT * FROM songs WHERE type='$category' ORDER BY id DESC LIMIT $limit OFFSET $offset";
    $songsResult = $DB->read($songsQuery);

    // Build set of song ids this user liked (from mylikes)
    if ($resolveLiked) {
        $allSongIds = [];
        if ($popularResult && is_array($popularResult)) {
            foreach ($popularResult as $s) {
                $allSongIds[] = (int)$s['id'];
            }
        }
        if ($songsResult && is_array($songsResult)) {
            foreach ($songsResult as $s) {
                $allSongIds[] = (int)$s['id'];
            }
        }
        $allSongIds = array_unique($allSongIds);
        if (!empty($allSongIds)) {
            $idsList = implode(',', array_map('intval', $allSongIds));
            $mylikesRows = $DB->read("SELECT content_id, likes FROM mylikes WHERE content_id IN ($idsList)");
            if ($mylikesRows && is_array($mylikesRows)) {
                foreach ($mylikesRows as $mr) {
                    $decoded = json_decode($mr['likes'], true);
                    if ($decoded && is_array($decoded)) {
                        $userIds = array_column($decoded, 'user_id');
                        if (in_array($userId, $userIds)) {
                            $userLikedSongIds[(int)$mr['content_id']] = true;
                        }
                    }
                }
            }
        }
    }

    $formatSong = function($song) use ($baseUrl, $userLikedSongIds, $resolveLiked) {
        $row = [
            'id' => (int)$song['id'],
            'songId' => $song['song_id'],
            'title' => mb_convert_encoding($song['title'] ?? '', 'UTF-8', 'UTF-8'),
            'artist' => mb_convert_encoding($song['artist'] ?? '', 'UTF-8', 'UTF-8'),
            'url' => $song['url'] ?? '',
            'likeCount' => (int)($song['like_count'] ?? 0),
            'downloadCount' => (int)($song['download_count'] ?? 0),
            'audioUrl' => "$baseUrl/audio/{$song['url']}.mp3",
            'imageUrl' => "$baseUrl/web/{$song['url']}.png",
            'thumbnailUrl' => "$baseUrl/image/{$song['url']}.png",
            'lyricsUrl' => "$baseUrl/lyrics/{$song['url']}.txt",
        ];
        if ($resolveLiked) {
            $row['liked'] = isset($userLikedSongIds[(int)$song['id']]);
        }
        return $row;
    };

    $popularSongs = [];
    if ($popularResult && is_array($popularResult)) {
        foreach ($popularResult as $song) {
            $popularSongs[] = $formatSong($song);
        }
    }

    $songs = [];
    if ($songsResult && is_array($songsResult)) {
        foreach ($songsResult as $song) {
            $songs[] = $formatSong($song);
        }
    }
    
    // Get total count for pagination
    $countQuery = "SELECT COUNT(*) as total FROM songs WHERE type='$category'";
    $countResult = $DB->read($countQuery);
    $totalSongs = $countResult && is_array($countResult) ? (int)$countResult[0]['total'] : 0;
    
    // Get unique artists
    $artistsQuery = "SELECT DISTINCT artist, url FROM songs WHERE type='$category' AND artist IS NOT NULL AND artist != '' GROUP BY artist ORDER BY artist LIMIT 50";
    $artistsResult = $DB->read($artistsQuery);
    
    $artists = [];
    if ($artistsResult && is_array($artistsResult)) {
        foreach ($artistsResult as $artist) {
            $artists[] = [
                'name' => mb_convert_encoding($artist['artist'] ?? '', 'UTF-8', 'UTF-8'),
                'imageUrl' => "$baseUrl/web/{$artist['url']}.png",
            ];
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'popularSongs' => $popularSongs,
            'songs' => $songs,
            'artists' => $artists,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $totalSongs,
                'hasMore' => ($offset + $limit) < $totalSongs,
            ],
            'category' => $category,
        ]
    ], JSON_INVALID_UTF8_SUBSTITUTE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
