<?php
/**
 * API: Get Songs with Lyrics
 * Returns popular songs, all songs, and artists for a category.
 * Uses classes/song.php for song data and liked state.
 */
require_once __DIR__ . '/../bootstrap.php';

error_reporting(0);
ini_set('display_errors', 0);

require_once __DIR__ . '/../../classes/connect.php';
require_once __DIR__ . '/../../classes/song.php';

try {
    $category = isset($_GET['category']) ? preg_replace('/[^a-z0-9_]/', '', trim($_GET['category'])) : 'english';
    $category = $category !== '' ? $category : 'english';
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $page = $page < 1 ? 1 : $page;
    $userIdRaw = isset($_GET['userId']) ? trim((string)$_GET['userId']) : '';
    $userId = (strlen($userIdRaw) <= 64 && $userIdRaw !== '') ? $userIdRaw : '';
    $limit = 20;
    $offset = ($page - 1) * $limit;

    $data = ['category' => $category];
    $Song = new Song();

    // Popular songs (class returns top 50; we use first 20 for API)
    $popularResult = $Song->getMostPopularSong($data, $userId);
    $popularList = is_array($popularResult) ? array_slice($popularResult, 0, 20) : [];

    // All songs with liked state (class returns full list; we paginate in PHP)
    $allSongsResult = $Song->get($data, $userId);
    $allSongs = is_array($allSongsResult) ? $allSongsResult : [];
    $totalSongs = count($allSongs);
    $songsPage = array_slice($allSongs, $offset, $limit);

    $baseUrl = 'https://www.calamuseducation.com/uploads/songs';
    $resolveLiked = ($userId !== '');

    $formatSong = function ($song) use ($baseUrl, $resolveLiked) {
        $row = [
            'id' => (int)($song['id'] ?? 0),
            'songId' => $song['song_id'] ?? $song['id'],
            'title' => mb_convert_encoding($song['title'] ?? '', 'UTF-8', 'UTF-8'),
            'artist' => mb_convert_encoding($song['artist'] ?? '', 'UTF-8', 'UTF-8'),
            'url' => $song['url'] ?? '',
            'likeCount' => (int)($song['like_count'] ?? 0),
            'downloadCount' => (int)($song['download_count'] ?? 0),
            'audioUrl' => $baseUrl . '/audio/' . ($song['url'] ?? '') . '.mp3',
            'imageUrl' => $baseUrl . '/web/' . ($song['url'] ?? '') . '.png',
            'thumbnailUrl' => $baseUrl . '/image/' . ($song['url'] ?? '') . '.png',
            'lyricsUrl' => $baseUrl . '/lyrics/' . ($song['url'] ?? '') . '.txt',
        ];
        if ($resolveLiked) {
            $row['liked'] = !empty($song['is_liked']);
        }
        return $row;
    };

    $popularSongs = array_map($formatSong, $popularList);
    $songs = array_map($formatSong, $songsPage);

    // Artists: still need DB (Song class doesn't provide)
    $artists = [];
    $DB = new Database();
    $artistsResult = $DB->prepareRead(
        'SELECT DISTINCT artist, url FROM songs WHERE type = ? AND artist IS NOT NULL AND artist != \'\' GROUP BY artist ORDER BY artist LIMIT 50',
        's',
        [$category]
    );
    if (is_array($artistsResult)) {
        foreach ($artistsResult as $artist) {
            $artists[] = [
                'name' => mb_convert_encoding($artist['artist'] ?? '', 'UTF-8', 'UTF-8'),
                'imageUrl' => $baseUrl . '/web/' . ($artist['url'] ?? '') . '.png',
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
