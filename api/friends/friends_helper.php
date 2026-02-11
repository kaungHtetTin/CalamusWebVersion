<?php
/**
 * Friends API helper: validate major and get current user from token.
 * All friend tables use learner_phone as user_id (stored in user_id column).
 */

$FRIEND_MAJORS = ['korea', 'english', 'chinese', 'japanese', 'russian'];
$MAX_FRIENDS = 299;

function friends_get_current_user($DB, $conn) {
    $token = getBearerToken();
    if (empty($token)) {
        return null;
    }
    $tokenEscaped = mysqli_real_escape_string($conn, $token);
    $userResult = $DB->read("SELECT id, learner_phone, learner_name FROM learners WHERE auth_token = '$tokenEscaped' AND auth_token != '' LIMIT 1");
    if (!$userResult || !is_array($userResult) || count($userResult) === 0) {
        return null;
    }
    return $userResult[0];
}

function friends_validate_major($major) {
    global $FRIEND_MAJORS;
    $major = strtolower(trim($major));
    return in_array($major, $FRIEND_MAJORS) ? $major : null;
}

/** Build SET clause for friend_requests/friends: one major has value/count, rest empty/0 */
function friends_build_insert_columns($conn, $major, $jsonValue) {
    global $FRIEND_MAJORS;
    $jsonEscaped = mysqli_real_escape_string($conn, $jsonValue);
    $pairs = [];
    foreach ($FRIEND_MAJORS as $m) {
        $pairs[] = "`$m` = " . ($m === $major ? "'$jsonEscaped'" : "'[]'");
        $pairs[] = "`{$m}_count` = " . ($m === $major ? '1' : '0');
    }
    return implode(', ', $pairs);
}