<?php
/** API: Get songs + popular + artists. Uses classes/song.php. */
require_once __DIR__ . '/../bootstrap.php';
error_reporting(0);
ini_set('display_errors', 0);
require_once __DIR__ . '/../../classes/connect.php';
require_once __DIR__ . '/../../classes/song.php';

try {



    $category = isset($_GET['category']) ? preg_replace('/[^a-z0-9_]/', '', trim($_GET['category'])) : 'english';
    $category = $category ?: 'english';
    $page = max(1, (int)($_GET['page'] ?? 1));
    $userIdRaw = trim((string)($_GET['userId'] ?? ''));
    $userId = (strlen($userIdRaw) <= 64 && $userIdRaw !== '') ? $userIdRaw : '';
    $limit = 20;
    $offset = ($page - 1) * $limit;

    $Song = new Song();
    $data = ['category' => $category];
    $popularList = array_slice((array)$Song->getMostPopularSong($data, $userId), 0, 20);
    $songsPage = (array)$Song->get($data, $userId, $limit, $offset);
    $totalSongs = (int)$Song->countByCategory($data);


    $baseUrl = 'https://www.calamuseducation.com/uploads/songs';
    $fmt = function ($s) use ($baseUrl, $userId) {
        $u = $s['url'] ?? '';
        $row = [
            'id' => (int)($s['id'] ?? 0),
            'songId' => $s['song_id'] ?? $s['id'],
            'title' => $s['title'] ?? '',
            'artist' => $s['artist'] ?? '',
            'url' => $u,
            'likeCount' => (int)($s['like_count'] ?? 0),
            'downloadCount' => (int)($s['download_count'] ?? 0),
            'audioUrl' => "$baseUrl/audio/{$u}.mp3",
            'imageUrl' => "$baseUrl/web/{$u}.png",
            'thumbnailUrl' => "$baseUrl/image/{$u}.png",
            'lyricsUrl' => "$baseUrl/lyrics/{$u}.txt",
        ];
        if ($userId !== '') $row['liked'] = !empty($s['is_liked']);
        return $row;
    };



    $artists = [];
    $DB = new Database();
    $artRows = $DB->prepareRead(
        'SELECT a.name AS artist, a.image_url AS image_url
         FROM artists a
         INNER JOIN songs s ON s.artist_id = a.id
         WHERE s.major = ? AND a.name IS NOT NULL AND a.name != \'\'
         GROUP BY a.id, a.name, a.image_url
         ORDER BY a.name
         LIMIT 50',
        's',
        [$category]
    );
    if (is_array($artRows)) {
        foreach ($artRows as $a) {
            $artists[] = [
                'name' => $a['artist'] ?? '',
                'imageUrl' => $a['image_url'] ?? '',
            ];
        }
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'popularSongs' => array_map($fmt, $popularList),
            'songs' => array_map($fmt, $songsPage),
            'artists' => $artists,
            'pagination' => ['page' => $page, 'limit' => $limit, 'total' => $totalSongs, 'hasMore' => ($offset + $limit) < $totalSongs],
            'category' => $category,
        ]
    ], JSON_INVALID_UTF8_SUBSTITUTE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error: ' . $e->getMessage()]);
}
