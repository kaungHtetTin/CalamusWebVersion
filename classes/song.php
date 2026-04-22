<?php
class Song{

    function get($data,$userId,$limit = null,$offset = 0){
        $major = $data['category'];
        $DB = new Database();
        $sql = "SELECT s.id,
                    s.id AS song_id,
                    s.title,
                    a.name AS artist,
                    s.asset_slug AS url,
                    s.like_count,
                    s.download_count
             FROM songs s
             LEFT JOIN artists a ON a.id = s.artist_id
             WHERE s.major = ?
             ORDER BY s.id DESC";
        if ($limit !== null) {
            $sql .= " LIMIT " . (int)$limit . " OFFSET " . (int)$offset;
        }
        $Songs = $DB->prepareRead(
            $sql,
            's',
            [$major]
        );

        if (!$Songs || !is_array($Songs) || count($Songs) === 0) {
            return false;
        }

        $arr = $Songs;
        $resolveLiked = (trim((string)$userId) !== '');
        if ($resolveLiked) {
            $songIds = array_map(static function ($song) {
                return (int)$song['id'];
            }, $arr);
            $songIds = array_values(array_unique($songIds));
            $likedBySongId = [];
            if (!empty($songIds)) {
                $conn = $DB->connect();
                $userIdEscaped = mysqli_real_escape_string($conn, (string)$userId);
                $idsList = implode(',', $songIds);
                $likedRows = $DB->read("SELECT song_id FROM song_likes WHERE user_id = '$userIdEscaped' AND song_id IN ($idsList)");
                if (is_array($likedRows)) {
                    foreach ($likedRows as $row) {
                        $likedBySongId[(int)$row['song_id']] = true;
                    }
                }
            }
            foreach ($arr as &$song) {
                $song['is_liked'] = isset($likedBySongId[(int)$song['id']]) ? 1 : 0;
            }
            unset($song);
        } else {
            foreach ($arr as &$song) {
                $song['is_liked'] = 0;
            }
            unset($song);
        }

        return $arr;
    }

    function countByCategory($data){
        $major = $data['category'];
        $DB = new Database();
        $rows = $DB->prepareRead(
            "SELECT COUNT(*) AS total FROM songs WHERE major = ?",
            's',
            [$major]
        );
        if (!$rows || !is_array($rows) || !isset($rows[0]['total'])) {
            return 0;
        }
        return (int)$rows[0]['total'];
    }

    function getMostPopularSong($data,$userId){
        $major = $data['category'];
        $DB = new Database();
        $Songs = $DB->prepareRead(
            "SELECT s.id,
                    s.id AS song_id,
                    s.title,
                    a.name AS artist,
                    s.asset_slug AS url,
                    s.like_count,
                    s.download_count
             FROM songs s
             LEFT JOIN artists a ON a.id = s.artist_id
             WHERE s.major = ?
             ORDER BY s.like_count DESC
             LIMIT 50",
            's',
            [$major]
        );

        if (!$Songs || !is_array($Songs) || count($Songs) === 0) {
            return false;
        }

        $arr = $Songs;
        $resolveLiked = (trim((string)$userId) !== '');
        if ($resolveLiked) {
            $songIds = array_map(static function ($song) {
                return (int)$song['id'];
            }, $arr);
            $songIds = array_values(array_unique($songIds));
            $likedBySongId = [];
            if (!empty($songIds)) {
                $conn = $DB->connect();
                $userIdEscaped = mysqli_real_escape_string($conn, (string)$userId);
                $idsList = implode(',', $songIds);
                $likedRows = $DB->read("SELECT song_id FROM song_likes WHERE user_id = '$userIdEscaped' AND song_id IN ($idsList)");
                if (is_array($likedRows)) {
                    foreach ($likedRows as $row) {
                        $likedBySongId[(int)$row['song_id']] = true;
                    }
                }
            }
            foreach ($arr as &$song) {
                $song['is_liked'] = isset($likedBySongId[(int)$song['id']]) ? 1 : 0;
            }
            unset($song);
        } else {
            foreach ($arr as &$song) {
                $song['is_liked'] = 0;
            }
            unset($song);
        }

        return $arr;
    }
}
?>